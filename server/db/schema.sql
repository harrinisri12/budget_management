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
-- 3. BUDGETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    financial_year TEXT NOT NULL,
    total_budget NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. BUDGET CATEGORIES TABLE
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
-- 5. PROPOSALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_number TEXT UNIQUE NOT NULL,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    proposal_date DATE DEFAULT CURRENT_DATE NOT NULL,
    program_date DATE NOT NULL,
    guest_details TEXT,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')) DEFAULT 'Pending',
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
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

CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

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
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 1. Departments Policies
CREATE POLICY "Allow authenticated users to read departments"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin full access to departments"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Profiles Policies
CREATE POLICY "Users can read own profile or admin can read all"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admin can update all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. Budgets Policies
CREATE POLICY "Allow authenticated users to read budgets"
    ON public.budgets FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin full access on budgets"
    ON public.budgets FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Budget Categories Policies
CREATE POLICY "Allow authenticated users to read budget categories"
    ON public.budget_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin full access on budget categories"
    ON public.budget_categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Proposals Policies
CREATE POLICY "Faculty can view own proposals or admin can view all"
    ON public.proposals FOR SELECT
    TO authenticated
    USING (faculty_id = auth.uid() OR public.is_admin());

CREATE POLICY "Faculty can insert own proposals"
    ON public.proposals FOR INSERT
    TO authenticated
    WITH CHECK (faculty_id = auth.uid() OR public.is_admin());

CREATE POLICY "Faculty can update own pending proposals or admin can update any"
    ON public.proposals FOR UPDATE
    TO authenticated
    USING ((faculty_id = auth.uid() AND status = 'Pending') OR public.is_admin())
    WITH CHECK ((faculty_id = auth.uid() AND status = 'Pending') OR public.is_admin());

CREATE POLICY "Admin can delete proposals"
    ON public.proposals FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. Transactions Policies
CREATE POLICY "Allow authenticated users to read transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin full access on transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
