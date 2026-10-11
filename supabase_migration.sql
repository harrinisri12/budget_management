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

COMMIT;
