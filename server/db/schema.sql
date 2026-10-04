-- ==============================================================================
-- KONGU ENGINEERING COLLEGE - CSE BUDGET MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked with Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty')),
    employee_id TEXT UNIQUE,
    designation TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    phone TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. ACADEMIC YEARS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL UNIQUE,
    budget NUMERIC(14, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. BUDGETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    financial_year TEXT NOT NULL,
    total_budget NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. BUDGET CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    spent_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. PROPOSALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_number TEXT UNIQUE NOT NULL,
    event_number BIGINT UNIQUE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    category TEXT,
    sub_category TEXT,
    title TEXT NOT NULL,
    proposal_date DATE DEFAULT CURRENT_DATE NOT NULL,
    program_date DATE NOT NULL,
    guest_details TEXT,
    event_details JSONB DEFAULT '{}'::jsonb,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')) DEFAULT 'Pending',
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Sequence for global system-wide continuous event numbering
CREATE SEQUENCE IF NOT EXISTS public.proposal_event_number_seq START WITH 1 INCREMENT BY 1;

-- Helper function to slugify names (e.g., 'Lab and Equipment' -> 'Lab-and-Equipment')
CREATE OR REPLACE FUNCTION public.slugify_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN '';
  END IF;
  RETURN trim(both '-' from regexp_replace(input_text, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function for automatic proposal_number generation: KEC/{ACADEMIC_YEAR}/{CATEGORY}/{SUBCATEGORY}/{EVENT_NUMBER}
CREATE OR REPLACE FUNCTION public.generate_proposal_id_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_ay_label TEXT;
  v_cat_slug TEXT;
  v_subcat_slug TEXT;
  v_next_num BIGINT;
BEGIN
  -- 1. Fetch academic year text if available
  IF NEW.academic_year_id IS NOT NULL THEN
    SELECT academic_year INTO v_ay_label FROM public.academic_years WHERE id = NEW.academic_year_id;
  END IF;
  IF v_ay_label IS NULL OR trim(v_ay_label) = '' THEN
    v_ay_label := '2027-2028';
  END IF;

  -- 2. Slugify category & subcategory
  v_cat_slug := public.slugify_text(COALESCE(NEW.category, 'GENERAL'));
  v_subcat_slug := public.slugify_text(NEW.sub_category);

  -- 3. Atomically acquire next continuous global sequence value
  v_next_num := nextval('public.proposal_event_number_seq');
  NEW.event_number := v_next_num;

  -- 4. Construct DB proposal_number ignoring client-supplied values
  IF v_subcat_slug <> '' THEN
    NEW.proposal_number := 'KEC/' || v_ay_label || '/' || v_cat_slug || '/' || v_subcat_slug || '/' || v_next_num::text;
  ELSE
    NEW.proposal_number := 'KEC/' || v_ay_label || '/' || v_cat_slug || '/' || v_next_num::text;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_generate_proposal_id ON public.proposals;
CREATE TRIGGER tr_generate_proposal_id
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_proposal_id_trigger();


-- ------------------------------------------------------------------------------
-- 7. TRANSACTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Approved',
    description TEXT NOT NULL,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vendor TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_academic_years_updated_at ON public.academic_years;
CREATE TRIGGER tr_academic_years_updated_at
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_proposals_updated_at ON public.proposals;
CREATE TRIGGER tr_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 1. Departments Policies
DROP POLICY IF EXISTS "Allow authenticated users to read departments" ON public.departments;
CREATE POLICY "Allow authenticated users to read departments"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access to departments" ON public.departments;
CREATE POLICY "Allow admin full access to departments"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin can read all"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile or admin can update all" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
CREATE POLICY "Admin can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
CREATE POLICY "Admin can delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. Academic Years Policies
DROP POLICY IF EXISTS "Allow authenticated users to read active academic years" ON public.academic_years;
CREATE POLICY "Allow authenticated users to read active academic years"
    ON public.academic_years FOR SELECT
    TO authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert academic years" ON public.academic_years;
CREATE POLICY "Admin can insert academic years"
    ON public.academic_years FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update academic years" ON public.academic_years;
CREATE POLICY "Admin can update academic years"
    ON public.academic_years FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete academic years" ON public.academic_years;
CREATE POLICY "Admin can delete academic years"
    ON public.academic_years FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 4. Budgets Policies
DROP POLICY IF EXISTS "Allow authenticated users to read budgets" ON public.budgets;
CREATE POLICY "Allow authenticated users to read budgets"
    ON public.budgets FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin full access on budgets" ON public.budgets;
CREATE POLICY "Admin full access on budgets"
    ON public.budgets FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Budget Categories Policies
DROP POLICY IF EXISTS "Allow authenticated users to read budget categories" ON public.budget_categories;
CREATE POLICY "Allow authenticated users to read budget categories"
    ON public.budget_categories FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin full access on budget categories" ON public.budget_categories;
CREATE POLICY "Admin full access on budget categories"
    ON public.budget_categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Proposals Policies
DROP POLICY IF EXISTS "Faculty can view own proposals or admin can view all" ON public.proposals;
CREATE POLICY "Faculty can view own proposals or admin can view all"
    ON public.proposals FOR SELECT
    TO authenticated
    USING (faculty_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Faculty can insert own proposals" ON public.proposals;
CREATE POLICY "Faculty can insert own proposals"
    ON public.proposals FOR INSERT
    TO authenticated
    WITH CHECK (faculty_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Faculty can update own pending proposals or admin can update any" ON public.proposals;
CREATE POLICY "Faculty can update own pending proposals or admin can update any"
    ON public.proposals FOR UPDATE
    TO authenticated
    USING ((faculty_id = auth.uid() AND status = 'Pending') OR public.is_admin())
    WITH CHECK ((faculty_id = auth.uid() AND status = 'Pending') OR public.is_admin());

DROP POLICY IF EXISTS "Admin can delete proposals" ON public.proposals;
CREATE POLICY "Admin can delete proposals"
    ON public.proposals FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. Transactions Policies
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users to read transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin full access on transactions" ON public.transactions;
CREATE POLICY "Admin full access on transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
