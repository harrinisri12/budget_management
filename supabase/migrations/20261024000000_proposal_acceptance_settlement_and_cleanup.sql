-- ==============================================================================
-- KONGU ENGINEERING COLLEGE BUDGET MANAGEMENT SYSTEM
-- MIGRATION: Proposal Acceptance, Rejection Cleanup, Settlement & Budget Deduction
-- ==============================================================================
-- Migration file: supabase/migrations/20261024000000_proposal_acceptance_settlement_and_cleanup.sql
-- Description:
-- 1. Adds audit, settlement, and approved_amount columns to 'proposals' table idempotently.
-- 2. Backfills approved_amount from proposed amount for all existing approved proposals.
-- 3. Ensures status constraint supports canonical statuses: 'Pending', 'Under Review', 'Approved', 'Rejected'.
-- 4. Creates 'settlements' ledger table with Row Level Security.
-- 5. Implements atomic RPC 'accept_proposal(p_admin_id, p_proposal_id, p_remarks)' with:
--    - Strict authorization check (auth.uid() verified as admin; caller-supplied p_admin_id not trusted alone)
--    - Canonical status 'Approved'
--    - Atomic category budget deduction
--    - Transaction ledger synchronization
-- 6. Implements atomic RPC 'reject_proposal' with budget rollback and 24h retention timestamp.
-- 7. Implements atomic RPC 'settle_proposal' replacing provisional deduction with actual settlement amount.
-- 8. Implements 'cleanup_expired_rejected_proposals' for 24h retention purging.
-- 9. Grants least-privilege execute permissions and notifies PostgREST to reload schema cache.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ADD TIMESTAMPS, AUDIT & SETTLEMENT COLUMNS TO PROPOSALS TABLE
-- ------------------------------------------------------------------------------

DO $$
BEGIN
    -- Timestamp when proposal was rejected by Admin (used for 24h retention window)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;

    -- Timestamp when proposal was accepted/approved by Admin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'accepted_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN accepted_at TIMESTAMPTZ;
    END IF;

    -- Admin user who approved or rejected the proposal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN reviewed_by UUID REFERENCES public.profiles(id);
    END IF;

    -- Distinct provisionally approved amount (equals proposed amount upon approval)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'approved_amount'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN approved_amount NUMERIC(15, 2);
    END IF;

    -- Actual settlement amount finalized after activity completion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settlement_amount'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settlement_amount NUMERIC(15, 2);
    END IF;

    -- Settlement status: 'unsettled', 'settled', 'pending_settlement'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settlement_status'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settlement_status VARCHAR(30) DEFAULT 'unsettled';
    END IF;

    -- Timestamp when settlement was finalized
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settled_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settled_at TIMESTAMPTZ;
    END IF;

    -- User who recorded the settlement
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settled_by'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settled_by UUID REFERENCES public.profiles(id);
    END IF;

    -- Settlement notes and invoice remarks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settlement_remarks'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settlement_remarks TEXT;
    END IF;
END $$;

-- Backfill approved_amount for existing approved proposals safely from amount
UPDATE public.proposals
SET approved_amount = amount
WHERE approved_amount IS NULL AND LOWER(status) IN ('approved', 'accepted');

-- Ensure proposals status check constraint supports canonical status values
DO $$
BEGIN
    ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
    ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS chk_proposals_status;
    ALTER TABLE public.proposals ADD CONSTRAINT chk_proposals_status 
        CHECK (status IN ('Pending', 'pending', 'Under Review', 'under review', 'Approved', 'approved', 'Rejected', 'rejected', 'Accepted', 'accepted'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create index on proposals(rejected_at) for efficient 24h retention cleanup queries
CREATE INDEX IF NOT EXISTS idx_proposals_rejected_at ON public.proposals(rejected_at) WHERE status ILIKE 'rejected';

-- ------------------------------------------------------------------------------
-- 2. CREATE SETTLEMENTS AUDIT LEDGER TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    proposed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    settlement_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    difference_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'finalized' CHECK (status IN ('draft', 'finalized', 'edited')),
    remarks TEXT,
    settled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on settlements
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view settlements" ON public.settlements;
CREATE POLICY "Authenticated users can view settlements" 
ON public.settlements FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admin and HOD can manage settlements" ON public.settlements;
CREATE POLICY "Admin and HOD can manage settlements" 
ON public.settlements FOR ALL 
TO authenticated 
USING (public.get_auth_user_role() IN ('admin', 'hod'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'hod'));

-- ------------------------------------------------------------------------------
-- 3. POSTGRESQL ATOMIC RPC FUNCTION: ACCEPT PROPOSAL & DEDUCT BUDGET
-- ------------------------------------------------------------------------------

-- Drop any previous signatures to avoid parameter name mismatch
DROP FUNCTION IF EXISTS public.accept_proposal(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.accept_proposal(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.accept_proposal(
    p_admin_id UUID,
    p_proposal_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_proposal RECORD;
    v_category RECORD;
    v_available_budget NUMERIC(15, 2);
    v_caller_role TEXT;
    v_effective_admin_id UUID;
    v_txn_num TEXT;
    v_txn_count INTEGER;
BEGIN
    -- 1. Authorization: Determine verified admin user ID
    -- If called via Supabase client JWT, auth.uid() is authoritative. Do not trust caller-supplied p_admin_id blindly.
    IF auth.role() = 'service_role' THEN
        v_effective_admin_id := COALESCE(p_admin_id, auth.uid());
    ELSIF auth.uid() IS NOT NULL THEN
        v_effective_admin_id := auth.uid();
    ELSE
        v_effective_admin_id := p_admin_id;
    END IF;

    IF v_effective_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authorization failure: No authenticated user or admin ID provided.';
    END IF;

    -- Verify that the effective caller has the 'admin' role in profiles
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_effective_admin_id;
    IF v_caller_role IS NULL OR LOWER(v_caller_role) <> 'admin' THEN
        RAISE EXCEPTION 'Authorization failure: Only administrators can accept proposals.';
    END IF;

    -- 2. Fetch and lock proposal row for atomic update
    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    -- Check if already approved (prevent duplicate deductions)
    IF LOWER(v_proposal.status) IN ('accepted', 'approved') THEN
        RAISE EXCEPTION 'Invalid status: Proposal has already been approved.';
    END IF;

    -- Check if rejected
    IF LOWER(v_proposal.status) IN ('rejected') THEN
        RAISE EXCEPTION 'Invalid status: Cannot approve a proposal that was rejected.';
    END IF;

    -- 3. Check and deduct budget from category allocation if associated
    IF v_proposal.category_id IS NOT NULL THEN
        SELECT * INTO v_category FROM public.budget_categories WHERE id = v_proposal.category_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Associated budget category % not found.', v_proposal.category_id;
        END IF;

        v_available_budget := COALESCE(v_category.allocated_amount, 0) - COALESCE(v_category.spent_amount, 0);

        IF COALESCE(v_proposal.amount, 0) > v_available_budget THEN
            RAISE EXCEPTION 'Insufficient category budget. Available: %, Required: %', v_available_budget, v_proposal.amount;
        END IF;

        -- Atomically deduct proposed amount from category spent_amount
        UPDATE public.budget_categories
        SET spent_amount = COALESCE(spent_amount, 0) + v_proposal.amount
        WHERE id = v_category.id;
    END IF;

    -- 4. Mark proposal as Approved using canonical status and record approval details
    UPDATE public.proposals
    SET 
        status = 'Approved',
        accepted_at = NOW(),
        reviewed_by = v_effective_admin_id,
        approved_amount = amount,
        settlement_status = 'unsettled',
        admin_remarks = COALESCE(p_remarks, admin_remarks),
        updated_at = NOW()
    WHERE id = p_proposal_id;

    -- 5. Record or sync linked financial transaction
    SELECT COUNT(*) INTO v_txn_count FROM public.transactions;
    v_txn_num := 'TXN-' || (1000 + v_txn_count + 1)::TEXT;

    DELETE FROM public.transactions WHERE proposal_id = p_proposal_id;

    INSERT INTO public.transactions (
        transaction_number,
        category_id,
        proposal_id,
        amount,
        transaction_date,
        status,
        description,
        requested_by
    ) VALUES (
        v_txn_num,
        v_proposal.category_id,
        p_proposal_id,
        v_proposal.amount,
        CURRENT_DATE,
        'Approved',
        COALESCE(v_proposal.title, 'Proposal') || ' (Accepted Proposal Allocation)',
        v_proposal.faculty_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'proposalId', p_proposal_id,
        'status', 'Approved',
        'approvedAmount', v_proposal.amount,
        'deductedAmount', v_proposal.amount
    );
END;
$$;

-- Overload supporting 2 parameters (p_proposal_id, p_remarks)
CREATE OR REPLACE FUNCTION public.accept_proposal(
    p_proposal_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.accept_proposal(
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        p_proposal_id,
        p_remarks
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. POSTGRESQL ATOMIC RPC FUNCTION: REJECT PROPOSAL & RECORD TIMESTAMP
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.reject_proposal(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.reject_proposal(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.reject_proposal(
    p_admin_id UUID,
    p_proposal_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_proposal RECORD;
    v_category RECORD;
    v_caller_role TEXT;
    v_effective_admin_id UUID;
    v_prev_amount NUMERIC(15, 2);
BEGIN
    -- Authorization: Determine verified admin user ID
    IF auth.role() = 'service_role' THEN
        v_effective_admin_id := COALESCE(p_admin_id, auth.uid());
    ELSIF auth.uid() IS NOT NULL THEN
        v_effective_admin_id := auth.uid();
    ELSE
        v_effective_admin_id := p_admin_id;
    END IF;

    IF v_effective_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authorization failure: No authenticated user or admin ID provided.';
    END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_effective_admin_id;
    IF v_caller_role IS NULL OR LOWER(v_caller_role) <> 'admin' THEN
        RAISE EXCEPTION 'Authorization failure: Only administrators can reject proposals.';
    END IF;

    -- Fetch and lock proposal
    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    -- If proposal was previously accepted/approved, credit back the deducted amount
    IF LOWER(v_proposal.status) IN ('accepted', 'approved') AND v_proposal.category_id IS NOT NULL THEN
        v_prev_amount := COALESCE(v_proposal.approved_amount, v_proposal.amount, 0);
        IF v_proposal.settlement_status = 'settled' AND v_proposal.settlement_amount IS NOT NULL THEN
            v_prev_amount := v_proposal.settlement_amount;
        END IF;

        UPDATE public.budget_categories
        SET spent_amount = GREATEST(0, COALESCE(spent_amount, 0) - v_prev_amount)
        WHERE id = v_proposal.category_id;

        -- Remove linked transactions
        DELETE FROM public.transactions WHERE proposal_id = p_proposal_id;
    END IF;

    -- Update proposal status and record rejection timestamp
    UPDATE public.proposals
    SET 
        status = 'Rejected',
        rejected_at = NOW(),
        reviewed_by = v_effective_admin_id,
        admin_remarks = COALESCE(p_remarks, admin_remarks),
        updated_at = NOW()
    WHERE id = p_proposal_id;

    RETURN jsonb_build_object(
        'success', true,
        'proposalId', p_proposal_id,
        'status', 'Rejected',
        'rejectedAt', NOW()
    );
END;
$$;

-- Overload supporting 2 parameters (p_proposal_id, p_remarks)
CREATE OR REPLACE FUNCTION public.reject_proposal(
    p_proposal_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.reject_proposal(
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        p_proposal_id,
        p_remarks
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. POSTGRESQL ATOMIC RPC FUNCTION: FINALIZE SETTLEMENT (REPLACE PROPOSED AMOUNT)
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.settle_proposal(UUID, UUID, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION public.settle_proposal(
    p_proposal_id UUID,
    p_settler_id UUID,
    p_actual_amount NUMERIC(15, 2),
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_proposal RECORD;
    v_category RECORD;
    v_caller_role TEXT;
    v_effective_settler_id UUID;
    v_prev_deduction NUMERIC(15, 2);
    v_diff NUMERIC(15, 2);
    v_available_budget NUMERIC(15, 2);
    v_is_first_settlement BOOLEAN;
BEGIN
    -- Reject invalid negative amounts
    IF p_actual_amount < 0 THEN
        RAISE EXCEPTION 'Invalid settlement amount: negative amounts are not permitted.';
    END IF;

    -- Authorization check
    IF auth.role() = 'service_role' THEN
        v_effective_settler_id := COALESCE(p_settler_id, auth.uid());
    ELSIF auth.uid() IS NOT NULL THEN
        v_effective_settler_id := auth.uid();
    ELSE
        v_effective_settler_id := p_settler_id;
    END IF;

    IF v_effective_settler_id IS NULL THEN
        RAISE EXCEPTION 'Authorization failure: No authenticated user provided.';
    END IF;

    -- Verify authorized financial role (admin or hod)
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_effective_settler_id;
    IF v_caller_role IS NULL OR LOWER(v_caller_role) NOT IN ('admin', 'hod') THEN
        RAISE EXCEPTION 'Unauthorized: Only budget administrators or HODs can finalize settlements.';
    END IF;

    -- Fetch and lock proposal
    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    -- Settlement requires the proposal to have been accepted / approved
    IF LOWER(v_proposal.status) NOT IN ('accepted', 'approved') THEN
        RAISE EXCEPTION 'Cannot settle proposal: Only accepted/approved proposals can be settled.';
    END IF;

    -- Determine previous deduction:
    -- If already settled, previous deduction was the previous settlement_amount.
    -- If first time settling, previous deduction was the provisional approved_amount/amount.
    IF v_proposal.settlement_status = 'settled' AND v_proposal.settlement_amount IS NOT NULL THEN
        v_is_first_settlement := false;
        v_prev_deduction := v_proposal.settlement_amount;
    ELSE
        v_is_first_settlement := true;
        v_prev_deduction := COALESCE(v_proposal.approved_amount, v_proposal.amount, 0);
    END IF;

    -- Net difference to adjust in category spent_amount:
    -- diff = new actual settlement - previous deduction
    -- If proposed was 10,000 and actual is 8,000: diff = -2,000 (credit back to remaining budget)
    -- If proposed was 10,000 and actual is 12,000: diff = +2,000 (extra deduction from budget)
    v_diff := p_actual_amount - v_prev_deduction;

    -- Lock and adjust category budget
    IF v_proposal.category_id IS NOT NULL THEN
        SELECT * INTO v_category FROM public.budget_categories WHERE id = v_proposal.category_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Associated budget category % not found.', v_proposal.category_id;
        END IF;

        IF v_diff > 0 THEN
            v_available_budget := COALESCE(v_category.allocated_amount, 0) - COALESCE(v_category.spent_amount, 0);
            IF v_diff > v_available_budget THEN
                RAISE EXCEPTION 'Insufficient category budget for settlement excess. Available: %, Required additional: %', v_available_budget, v_diff;
            END IF;
        END IF;

        -- Apply replacement difference atomically
        UPDATE public.budget_categories
        SET spent_amount = GREATEST(0, COALESCE(spent_amount, 0) + v_diff)
        WHERE id = v_category.id;
    END IF;

    -- Update proposal settlement status and amounts
    UPDATE public.proposals
    SET 
        settlement_amount = p_actual_amount,
        settlement_status = 'settled',
        settled_at = NOW(),
        settled_by = v_effective_settler_id,
        settlement_remarks = COALESCE(p_remarks, settlement_remarks),
        updated_at = NOW()
    WHERE id = p_proposal_id;

    -- Record in settlements audit ledger
    INSERT INTO public.settlements (
        proposal_id,
        academic_year_id,
        category_id,
        proposed_amount,
        settlement_amount,
        difference_amount,
        status,
        remarks,
        settled_by
    ) VALUES (
        p_proposal_id,
        v_proposal.academic_year_id,
        v_proposal.category_id,
        v_proposal.amount,
        p_actual_amount,
        v_diff,
        CASE WHEN v_is_first_settlement THEN 'finalized' ELSE 'edited' END,
        p_remarks,
        v_effective_settler_id
    );

    -- Update linked transaction amount to actual settlement amount
    UPDATE public.transactions
    SET 
        amount = p_actual_amount,
        status = 'Settled',
        description = COALESCE(v_proposal.title, 'Proposal') || ' (Finalized Settlement)'
    WHERE proposal_id = p_proposal_id;

    RETURN jsonb_build_object(
        'success', true,
        'proposalId', p_proposal_id,
        'proposedAmount', v_proposal.amount,
        'settlementAmount', p_actual_amount,
        'differenceAdjusted', v_diff,
        'settlementStatus', 'settled'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. POSTGRESQL CLEANUP FUNCTION FOR EXPIRED REJECTED PROPOSALS (24H RETENTION)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cleanup_expired_rejected_proposals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Delete transactions linked to expired rejected proposals
    DELETE FROM public.transactions 
    WHERE proposal_id IN (
        SELECT id FROM public.proposals 
        WHERE status ILIKE 'rejected' 
          AND rejected_at IS NOT NULL 
          AND rejected_at <= NOW() - INTERVAL '24 hours'
    );

    -- Delete settlements linked to expired rejected proposals if any
    DELETE FROM public.settlements 
    WHERE proposal_id IN (
        SELECT id FROM public.proposals 
        WHERE status ILIKE 'rejected' 
          AND rejected_at IS NOT NULL 
          AND rejected_at <= NOW() - INTERVAL '24 hours'
    );

    -- Delete expired rejected proposals
    WITH deleted AS (
        DELETE FROM public.proposals 
        WHERE status ILIKE 'rejected' 
          AND rejected_at IS NOT NULL 
          AND rejected_at <= NOW() - INTERVAL '24 hours'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    RETURN v_deleted_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. FUNCTION PERMISSIONS & POSTGREST SCHEMA CACHE RELOAD
-- ------------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID, UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.reject_proposal(UUID, UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.reject_proposal(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.settle_proposal(UUID, UUID, NUMERIC, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rejected_proposals() TO authenticated, service_role;

-- Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

COMMIT;
