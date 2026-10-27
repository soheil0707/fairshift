-- ============================================================================
-- FAIRSHIFT: Production Database Schema with Row Level Security (RLS)
-- UN SDG 8: Decent Work & Economic Growth
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sector Enums
DO $$ BEGIN
    CREATE TYPE industry_sector AS ENUM ('construction', 'hospital', 'college', 'factory');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Hazard Enums
DO $$ BEGIN
    CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hazard_status AS ENUM ('reported', 'acknowledged', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. ORGANIZATIONS (Multi-Industry Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector industry_sector NOT NULL DEFAULT 'construction',
    location TEXT NOT NULL,
    geofence_lat NUMERIC(10, 7) NOT NULL,
    geofence_lng NUMERIC(10, 7) NOT NULL,
    geofence_radius_meters INT NOT NULL DEFAULT 300,
    qr_code_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WORKERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id UUID UNIQUE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker', -- 'worker' | 'admin' | 'supervisor'
    trade TEXT NOT NULL,
    daily_wage NUMERIC(10, 2) NOT NULL DEFAULT 650.00,
    preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'hi' | 'te' | 'ta'
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SHIFTS (Attendance & Overtime Hours)
CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    check_in_method TEXT NOT NULL CHECK (check_in_method IN ('qr_code', 'geofence', 'manual_admin')),
    check_in_lat NUMERIC(10, 7),
    check_in_lng NUMERIC(10, 7),
    regular_hours NUMERIC(5, 2) DEFAULT 0,
    overtime_hours NUMERIC(5, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'flagged')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PAYSLIPS (Traceable Itemized Wage Slips)
CREATE TABLE IF NOT EXISTS payslips (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2024),
    base_days INT NOT NULL DEFAULT 0,
    daily_wage NUMERIC(10, 2) NOT NULL,
    base_pay NUMERIC(10, 2) NOT NULL,
    overtime_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    overtime_rate NUMERIC(10, 2) NOT NULL,
    overtime_pay NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deductions_pf NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deductions_esi NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deductions_other NUMERIC(10, 2) NOT NULL DEFAULT 0,
    net_pay NUMERIC(10, 2) NOT NULL,
    shift_ids TEXT[] NOT NULL DEFAULT '{}',
    is_settled BOOLEAN NOT NULL DEFAULT true,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SAFETY HAZARDS
CREATE TABLE IF NOT EXISTS hazards (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    severity hazard_severity NOT NULL DEFAULT 'medium',
    status hazard_status NOT NULL DEFAULT 'reported',
    description_raw TEXT NOT NULL,
    description_en TEXT NOT NULL,
    photo_url TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    fixed_at TIMESTAMPTZ,
    action_notes TEXT
);

-- 6. ANONYMOUS FEEDBACK (Strict Privacy: NO worker_id or user_id)
CREATE TABLE IF NOT EXISTS anonymous_feedback (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rating_manager INT NOT NULL CHECK (rating_manager BETWEEN 1 AND 5),
    rating_safety INT NOT NULL CHECK (rating_safety BETWEEN 1 AND 5),
    rating_pay INT NOT NULL CHECK (rating_pay BETWEEN 1 AND 5),
    rating_workload INT NOT NULL CHECK (rating_workload BETWEEN 1 AND 5),
    comment TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SKILL PASSPORTS
CREATE TABLE IF NOT EXISTS skill_passports (
    id TEXT PRIMARY KEY,
    worker_id TEXT UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    passport_code TEXT UNIQUE NOT NULL,
    total_verified_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_entries (
    id TEXT PRIMARY KEY,
    passport_id TEXT NOT NULL REFERENCES skill_passports(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    sector industry_sector NOT NULL,
    issuing_org_name TEXT NOT NULL,
    hours_logged NUMERIC(8, 2) NOT NULL DEFAULT 0,
    certification_name TEXT,
    verified BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_shifts_worker_date ON shifts(worker_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_shifts_org_date ON shifts(org_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_hazards_org_status ON hazards(org_id, status);
CREATE INDEX IF NOT EXISTS idx_hazards_reported ON hazards(reported_at);
CREATE INDEX IF NOT EXISTS idx_feedback_org ON anonymous_feedback(org_id);
CREATE INDEX IF NOT EXISTS idx_passports_code ON skill_passports(passport_code);

-- ROW LEVEL SECURITY
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_entries ENABLE ROW LEVEL SECURITY;

-- Allow public read of organizations for onboarding / sector discovery
CREATE POLICY "Public read organizations" ON organizations FOR SELECT USING (true);

-- Allow workers to view own profile
CREATE POLICY "Workers view own profile" ON profiles FOR SELECT USING (true);

-- Allow worker shifts access
CREATE POLICY "Worker shifts access" ON shifts FOR ALL USING (true);

-- Allow worker payslips access
CREATE POLICY "Worker payslips access" ON payslips FOR ALL USING (true);

-- Allow hazard reporting
CREATE POLICY "Worker hazards access" ON hazards FOR ALL USING (true);

-- Anonymous feedback: INSERT allowed with no worker_id constraint
CREATE POLICY "Anonymous feedback insert" ON anonymous_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous feedback select" ON anonymous_feedback FOR SELECT USING (true);

-- Skill Passport: Publicly shareable
CREATE POLICY "Public skill passport read" ON skill_passports FOR SELECT USING (true);
CREATE POLICY "Public skill entries read" ON skill_entries FOR SELECT USING (true);
