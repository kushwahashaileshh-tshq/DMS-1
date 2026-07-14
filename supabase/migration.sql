-- =====================================================================
-- DMS (डाक संचालन प्रणाली) — Complete Supabase Migration
-- Run this entire file in the Supabase Dashboard → SQL Editor
-- =====================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- 1. CREATE TABLES
-- =====================================================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'in_charge', 'employee')),
  designation TEXT,
  posting_level TEXT,
  posting_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dak Master table (main dak/mail records)
CREATE TABLE IF NOT EXISTS public.dak_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_no TEXT UNIQUE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_department TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  current_holder_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending_incharge'
    CHECK (status IN ('pending_incharge', 'pending_employee', 'disposed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dak Tracking table (audit trail of each dak's journey)
CREATE TABLE IF NOT EXISTS public.dak_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dak_id UUID NOT NULL REFERENCES public.dak_master(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('received', 'forwarded', 'disposed')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dak_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dak_tracking ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (idempotent)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Dak entries viewable by authenticated users" ON public.dak_master;
DROP POLICY IF EXISTS "Authenticated users can insert dak" ON public.dak_master;
DROP POLICY IF EXISTS "Authenticated users can update dak" ON public.dak_master;
DROP POLICY IF EXISTS "Tracking viewable by authenticated users" ON public.dak_tracking;
DROP POLICY IF EXISTS "Authenticated users can insert tracking" ON public.dak_tracking;

-- Profiles: all authenticated users can read; update own profile only
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Dak Master: all authenticated users can read, insert, and update
CREATE POLICY "Dak entries viewable by authenticated users"
  ON public.dak_master FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert dak"
  ON public.dak_master FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update dak"
  ON public.dak_master FOR UPDATE TO authenticated USING (true);

-- Dak Tracking: all authenticated users can read and insert
CREATE POLICY "Tracking viewable by authenticated users"
  ON public.dak_tracking FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tracking"
  ON public.dak_tracking FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================================
-- 3. CREATE AUTH USERS & PROFILES (3 DMS users)
-- =====================================================================
-- Credentials:
--   admin@police.gov.in     / password   → Role: admin (डाक शाखा)
--   incharge@police.gov.in  / password   → Role: in_charge (शाखा प्रभारी)
--   employee@police.gov.in  / password   → Role: employee (कर्मचारी)
-- =====================================================================

DO $$
DECLARE
  v_admin_uid UUID;
  v_incharge_uid UUID;
  v_employee_uid UUID;
  v_hashed_pw TEXT := crypt('password', gen_salt('bf'));
BEGIN

  -- =========== ADMIN USER ===========
  SELECT id INTO v_admin_uid FROM auth.users WHERE email = 'admin@police.gov.in';
  IF v_admin_uid IS NULL THEN
    v_admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_sent_at
    ) VALUES (
      v_admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'admin@police.gov.in',
      v_hashed_pw,
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "राम प्रकाश"}'::jsonb,
      FALSE, NOW()
    );
    
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_admin_uid, v_admin_uid::text,
      jsonb_build_object(
        'sub', v_admin_uid::text,
        'email', 'admin@police.gov.in',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', NOW(), NOW(), NOW()
    );
  END IF;

  -- =========== INCHARGE USER ===========
  SELECT id INTO v_incharge_uid FROM auth.users WHERE email = 'incharge@police.gov.in';
  IF v_incharge_uid IS NULL THEN
    v_incharge_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_sent_at
    ) VALUES (
      v_incharge_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'incharge@police.gov.in',
      v_hashed_pw,
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "के. पी. सिंह"}'::jsonb,
      FALSE, NOW()
    );
    
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_incharge_uid, v_incharge_uid::text,
      jsonb_build_object(
        'sub', v_incharge_uid::text,
        'email', 'incharge@police.gov.in',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', NOW(), NOW(), NOW()
    );
  END IF;

  -- =========== EMPLOYEE USER ===========
  SELECT id INTO v_employee_uid FROM auth.users WHERE email = 'employee@police.gov.in';
  IF v_employee_uid IS NULL THEN
    v_employee_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_sent_at
    ) VALUES (
      v_employee_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'employee@police.gov.in',
      v_hashed_pw,
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "अमित कुमार"}'::jsonb,
      FALSE, NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_employee_uid, v_employee_uid::text,
      jsonb_build_object(
        'sub', v_employee_uid::text,
        'email', 'employee@police.gov.in',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', NOW(), NOW(), NOW()
    );
  END IF;

  -- =====================================================================
  -- 4. INSERT PROFILES for each user
  -- =====================================================================

  INSERT INTO public.profiles (id, name, role, designation, posting_level, posting_name) VALUES
    (v_admin_uid,    'राम प्रकाश',  'admin',     'प्रशासक (डाक शाखा)',          'hq', 'तकनीकी सेवा मुख्यालय'),
    (v_incharge_uid, 'के. पी. सिंह', 'in_charge', 'शाखा प्रभारी (तकनीकी)',       'hq', 'तकनीकी सेवा मुख्यालय'),
    (v_employee_uid, 'अमित कुमार',   'employee',  'मुख्य आरक्षी (कम्प्यूटर)',    'hq', 'तकनीकी सेवा मुख्यालय')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✅ DMS Setup Complete!';
  RAISE NOTICE 'Admin UID:    %', v_admin_uid;
  RAISE NOTICE 'Incharge UID: %', v_incharge_uid;
  RAISE NOTICE 'Employee UID: %', v_employee_uid;

END $$;

-- =====================================================================
-- 5. VERIFY SETUP
-- =====================================================================
SELECT p.id, p.name, p.role, p.designation, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.role;
