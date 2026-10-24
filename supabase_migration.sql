-- ==============================================================================
-- KONGU ENGINEERING COLLEGE BUDGET MANAGEMENT SYSTEM
-- SUPABASE / POSTGRESQL DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Summary of Changes:
-- 1. Academic Year Visibility & Attributes:
--    - Ensures 'start_date', 'end_date', 'annual_budget', 'status' exist on 'academic_years'.
--    - Adds UNIQUE constraint on academic year name/code to prevent duplicates.
-- 2. Simplified 3-Role User Management:
--    - Migrates all legacy roles to exactly three supported values: 'hod', 'faculty', 'admin'.
--    - Enforces CHECK constraint (role IN ('hod', 'faculty', 'admin')).
-- 3. Row-Level Security (RLS) Policies:
--    - Enforces secure access for HOD, Faculty, and Admin (Budget Coordinator).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ACADEMIC YEARS TABLE ENHANCEMENTS
-- ------------------------------------------------------------------------------

-- Ensure academic_years table exists
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    start_year INTEGER,
    end_year INTEGER,
    budget NUMERIC(15, 2) DEFAULT 0,
    annual_budget NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'INACTIVE', 'Active', 'Inactive', 'Closed')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add start_date and end_date columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'academic_years' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE public.academic_years ADD COLUMN start_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'academic_years' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE public.academic_years ADD COLUMN end_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'academic_years' AND column_name = 'annual_budget'
    ) THEN
        ALTER TABLE public.academic_years ADD COLUMN annual_budget NUMERIC(15, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'academic_years' AND column_name = 'start_year'
    ) THEN
        ALTER TABLE public.academic_years ADD COLUMN start_year INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'academic_years' AND column_name = 'end_year'
    ) THEN
        ALTER TABLE public.academic_years ADD COLUMN end_year INTEGER;
    END IF;
END $$;

-- Populate start_date / end_date / annual_budget from existing data if currently null
UPDATE public.academic_years
SET 
    start_date = COALESCE(start_date, (start_year || '-06-01')::DATE, '2026-06-01'::DATE),
    end_date = COALESCE(end_date, (end_year || '-05-31')::DATE, '2027-05-31'::DATE),
    annual_budget = COALESCE(annual_budget, budget, 0)
WHERE start_date IS NULL OR end_date IS NULL OR annual_budget = 0;

-- Prevent duplicate academic years
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_academic_years_label'
    ) THEN
        ALTER TABLE public.academic_years ADD CONSTRAINT uq_academic_years_label UNIQUE (academic_year);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN
        NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 2. SIMPLIFIED 3-ROLE MIGRATION & CONSTRAINTS FOR PROFILES
-- ------------------------------------------------------------------------------

-- Migrate legacy role values to exactly three categories: 'hod', 'faculty', 'admin'
UPDATE public.profiles
SET role = 'admin'
WHERE role IN (
    'CSE Budget Administrator',
    'System Administrator',
    'Associate Budget Officer',
    'administrator',
    'admin'
) OR role ILIKE '%admin%' OR role ILIKE '%coordinator%' OR role ILIKE '%officer%';

UPDATE public.profiles
SET role = 'hod'
WHERE role IN (
    'Department Head / HOD',
    'Head of Department',
    'HOD',
    'hod'
) OR role ILIKE '%hod%' OR role ILIKE '%department head%';

UPDATE public.profiles
SET role = 'faculty'
WHERE role NOT IN ('admin', 'hod');

-- Drop old role constraint if exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add strict 3-role CHECK constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_role CHECK (role IN ('hod', 'faculty', 'admin'));


-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on core tables
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check requesting user role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ACADEMIC YEARS POLICIES
DROP POLICY IF EXISTS "Anyone authenticated can view academic years" ON public.academic_years;
CREATE POLICY "Anyone authenticated can view academic years" 
ON public.academic_years FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admin and HOD can manage academic years" ON public.academic_years;
CREATE POLICY "Admin and HOD can manage academic years" 
ON public.academic_years FOR ALL 
TO authenticated 
USING (public.get_auth_user_role() IN ('admin', 'hod'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'hod'));

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.get_auth_user_role() = 'admin')
WITH CHECK (public.get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update their own non-role profile fields" ON public.profiles;
CREATE POLICY "Users can update their own non-role profile fields" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PROPOSALS POLICIES
DROP POLICY IF EXISTS "Faculty can view their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admin and HOD can view all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Proposals view policy" ON public.proposals;

CREATE POLICY "Proposals view policy" 
ON public.proposals FOR SELECT 
TO authenticated 
USING (
    public.get_auth_user_role() IN ('admin', 'hod') OR faculty_id = auth.uid()
);

DROP POLICY IF EXISTS "Faculty can submit proposals" ON public.proposals;
CREATE POLICY "Faculty can submit proposals" 
ON public.proposals FOR INSERT 
TO authenticated 
WITH CHECK (
    faculty_id = auth.uid() OR public.get_auth_user_role() IN ('admin', 'hod')
);

DROP POLICY IF EXISTS "Admin and HOD can review and update proposals" ON public.proposals;
CREATE POLICY "Admin and HOD can review and update proposals" 
ON public.proposals FOR UPDATE 
TO authenticated 
USING (public.get_auth_user_role() IN ('admin', 'hod'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'hod'));

-- BUDGET CATEGORIES POLICIES
DROP POLICY IF EXISTS "Authenticated users can view budget categories" ON public.budget_categories;
CREATE POLICY "Authenticated users can view budget categories" 
ON public.budget_categories FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admin and HOD can manage budget categories" ON public.budget_categories;
CREATE POLICY "Admin and HOD can manage budget categories" 
ON public.budget_categories FOR ALL 
TO authenticated 
USING (public.get_auth_user_role() IN ('admin', 'hod'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'hod'));

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
CREATE POLICY "Authenticated users can view transactions" 
ON public.transactions FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admin and HOD can manage transactions" ON public.transactions;
CREATE POLICY "Admin and HOD can manage transactions" 
ON public.transactions FOR ALL 
TO authenticated 
USING (public.get_auth_user_role() IN ('admin', 'hod'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'hod'));

-- ------------------------------------------------------------------------------
-- 4. PROPOSAL TIMESTAMPS, SETTLEMENT & 24H RETENTION ENHANCEMENTS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'accepted_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN accepted_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN reviewed_by UUID REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'approved_amount'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN approved_amount NUMERIC(15, 2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settlement_amount'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settlement_amount NUMERIC(15, 2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settlement_status'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settlement_status VARCHAR(30) DEFAULT 'unsettled';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settled_at'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settled_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'settled_by'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN settled_by UUID REFERENCES public.profiles(id);
    END IF;

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

CREATE INDEX IF NOT EXISTS idx_proposals_rejected_at ON public.proposals(rejected_at) WHERE status ILIKE 'rejected';

-- SETTLEMENTS TABLE
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

-- ATOMIC RPC FUNCTIONS: ACCEPT PROPOSAL & DEDUCT BUDGET
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
        RAISE EXCEPTION 'Authorization failure: Only administrators can accept proposals.';
    END IF;

    -- 2. Fetch and lock proposal row for atomic update
    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    IF LOWER(v_proposal.status) IN ('accepted', 'approved') THEN
        RAISE EXCEPTION 'Invalid status: Proposal has already been approved.';
    END IF;

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

        UPDATE public.budget_categories
        SET spent_amount = COALESCE(spent_amount, 0) + v_proposal.amount
        WHERE id = v_category.id;
    END IF;

    -- 4. Mark proposal as Approved using canonical status
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

    -- 5. Record linked transaction
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

-- ATOMIC RPC FUNCTION: REJECT PROPOSAL & RECORD TIMESTAMP
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

    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    IF LOWER(v_proposal.status) IN ('accepted', 'approved') AND v_proposal.category_id IS NOT NULL THEN
        v_prev_amount := COALESCE(v_proposal.approved_amount, v_proposal.amount, 0);
        IF v_proposal.settlement_status = 'settled' AND v_proposal.settlement_amount IS NOT NULL THEN
            v_prev_amount := v_proposal.settlement_amount;
        END IF;

        UPDATE public.budget_categories
        SET spent_amount = GREATEST(0, COALESCE(spent_amount, 0) - v_prev_amount)
        WHERE id = v_proposal.category_id;

        DELETE FROM public.transactions WHERE proposal_id = p_proposal_id;
    END IF;

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

-- ATOMIC RPC FUNCTION: FINALIZE SETTLEMENT (REPLACE PROPOSED AMOUNT)
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
    IF p_actual_amount < 0 THEN
        RAISE EXCEPTION 'Invalid settlement amount: negative amounts are not permitted.';
    END IF;

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

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_effective_settler_id;
    IF v_caller_role IS NULL OR LOWER(v_caller_role) NOT IN ('admin', 'hod') THEN
        RAISE EXCEPTION 'Unauthorized: Only budget administrators or HODs can finalize settlements.';
    END IF;

    SELECT * INTO v_proposal FROM public.proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found with ID: %', p_proposal_id;
    END IF;

    IF LOWER(v_proposal.status) NOT IN ('accepted', 'approved') THEN
        RAISE EXCEPTION 'Cannot settle proposal: Only accepted/approved proposals can be settled.';
    END IF;

    IF v_proposal.settlement_status = 'settled' AND v_proposal.settlement_amount IS NOT NULL THEN
        v_is_first_settlement := false;
        v_prev_deduction := v_proposal.settlement_amount;
    ELSE
        v_is_first_settlement := true;
        v_prev_deduction := COALESCE(v_proposal.approved_amount, v_proposal.amount, 0);
    END IF;

    v_diff := p_actual_amount - v_prev_deduction;

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

        UPDATE public.budget_categories
        SET spent_amount = GREATEST(0, COALESCE(spent_amount, 0) + v_diff)
        WHERE id = v_category.id;
    END IF;

    UPDATE public.proposals
    SET 
        settlement_amount = p_actual_amount,
        settlement_status = 'settled',
        settled_at = NOW(),
        settled_by = v_effective_settler_id,
        settlement_remarks = COALESCE(p_remarks, settlement_remarks),
        updated_at = NOW()
    WHERE id = p_proposal_id;

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

-- CLEANUP FUNCTION FOR EXPIRED REJECTED PROPOSALS (24H RETENTION)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rejected_proposals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    DELETE FROM public.transactions 
    WHERE proposal_id IN (
        SELECT id FROM public.proposals 
        WHERE status ILIKE 'rejected' 
          AND rejected_at IS NOT NULL 
          AND rejected_at <= NOW() - INTERVAL '24 hours'
    );

    DELETE FROM public.settlements 
    WHERE proposal_id IN (
        SELECT id FROM public.proposals 
        WHERE status ILIKE 'rejected' 
          AND rejected_at IS NOT NULL 
          AND rejected_at <= NOW() - INTERVAL '24 hours'
    );

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

-- FUNCTION PERMISSIONS & POSTGREST SCHEMA CACHE RELOAD
GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID, UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.reject_proposal(UUID, UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.reject_proposal(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.settle_proposal(UUID, UUID, NUMERIC, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rejected_proposals() TO authenticated, service_role;

-- Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

COMMIT;
