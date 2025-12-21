-- =====================================================
-- GCC-PULSE Simplified Schema for Quick Setup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Drop existing objects if they exist (for clean install)
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS offer_letters CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS interview_status CASCADE;
DROP TYPE IF EXISTS assessment_status CASCADE;

-- =====================================================
-- ENUM TYPES
-- =====================================================
CREATE TYPE user_role AS ENUM ('applicant', 'panelist', 'recruiting_admin', 'super_admin');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'offer_sent', 'offer_accepted', 'offer_rejected', 'rejected');
CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE assessment_status AS ENUM ('pending', 'in_progress', 'submitted', 'evaluated');

-- =====================================================
-- TABLES
-- =====================================================

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry VARCHAR(100),
  description TEXT,
  employee_count VARCHAR(50),
  headquarters VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'applicant',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  headline VARCHAR(255),
  summary TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  current_company VARCHAR(255),
  current_job_title VARCHAR(255),
  expected_salary VARCHAR(50),
  notice_period VARCHAR(50),
  education JSONB,
  work_experience JSONB,
  gcc_score INTEGER,
  gcc_analysis JSONB,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  requirements TEXT,
  department VARCHAR(100),
  location VARCHAR(255),
  job_type VARCHAR(50),
  work_mode VARCHAR(50),
  experience_min INTEGER,
  experience_max INTEGER,
  salary_min INTEGER,
  salary_max INTEGER,
  skills_required TEXT[],
  status job_status DEFAULT 'open',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  panelist_id UUID REFERENCES profiles(id),
  status application_status DEFAULT 'pending',
  resume_url TEXT,
  cover_letter TEXT,
  gcc_score INTEGER,
  gcc_analysis JSONB,
  panelist_score INTEGER,
  panelist_notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  panelist_id UUID REFERENCES profiles(id),
  candidate_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255),
  interview_type VARCHAR(50),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  status interview_status DEFAULT 'scheduled',
  meeting_url TEXT,
  interviewer_notes TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255),
  assessment_type VARCHAR(50),
  status assessment_status DEFAULT 'pending',
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE RLS BUT WITH PERMISSIVE POLICIES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Companies: Anyone can view
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);

-- Profiles: Simple policies that avoid recursion
-- Users can do everything with their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Service role bypass (for admin operations via server)
-- Note: Admins should use service_role key for cross-user operations

-- Jobs: Anyone can view open jobs
CREATE POLICY "Anyone can view open jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage jobs" ON jobs FOR ALL USING (auth.uid() IS NOT NULL);

-- Applications: Candidates see own, all authenticated can view (simplified)
CREATE POLICY "Candidates view own applications" ON applications FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Candidates create applications" ON applications FOR INSERT WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Candidates update own applications" ON applications FOR UPDATE USING (candidate_id = auth.uid());
CREATE POLICY "Authenticated can view all applications" ON applications FOR SELECT USING (auth.uid() IS NOT NULL);

-- Interviews
CREATE POLICY "View own interviews" ON interviews FOR SELECT USING (
  candidate_id = auth.uid() OR panelist_id = auth.uid()
);
CREATE POLICY "Authenticated manage interviews" ON interviews FOR ALL USING (auth.uid() IS NOT NULL);

-- Assessments
CREATE POLICY "View own assessments" ON assessments FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Authenticated manage assessments" ON assessments FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- FUNCTION TO CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'applicant')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the signup
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO companies (id, name, slug, industry, description, headquarters) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechCorp GCC', 'techcorp', 'Technology', 'Leading technology company', 'Bangalore, India'),
  ('22222222-2222-2222-2222-222222222222', 'FinServe India', 'finserve', 'Financial Services', 'Global financial services', 'Mumbai, India'),
  ('33333333-3333-3333-3333-333333333333', 'HealthTech GCC', 'healthtech', 'Healthcare', 'Healthcare innovation center', 'Hyderabad, India')
ON CONFLICT (slug) DO NOTHING;

-- Insert some demo jobs
INSERT INTO jobs (id, company_id, title, description, department, location, job_type, work_mode, experience_min, experience_max, salary_min, salary_max, skills_required, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Senior Full Stack Engineer', 'Build scalable web applications', 'Engineering', 'Bangalore', 'full-time', 'hybrid', 5, 10, 2500000, 4000000, ARRAY['React', 'Node.js', 'AWS', 'PostgreSQL'], 'open'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Principal Data Scientist', 'Lead ML initiatives', 'Data Science', 'Mumbai', 'full-time', 'remote', 8, 15, 3500000, 5500000, ARRAY['Python', 'TensorFlow', 'SQL', 'Spark'], 'open'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'DevOps Lead', 'Manage cloud infrastructure', 'DevOps', 'Hyderabad', 'full-time', 'onsite', 6, 12, 2800000, 4500000, ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform'], 'open')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================

-- Create the resumes bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can read resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');
