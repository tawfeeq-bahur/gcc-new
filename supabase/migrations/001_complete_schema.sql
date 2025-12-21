-- =====================================================
-- GCC-PULSE Multi-Tenant Hiring Platform Schema
-- Complete Database Migration for Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('applicant', 'panelist', 'recruiting_admin', 'super_admin');

-- Job status enum
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'archived');

-- Application status enum
CREATE TYPE application_status AS ENUM (
  'pending',
  'under_review',
  'shortlisted',
  'interview_scheduled',
  'interviewed',
  'selected',
  'offer_sent',
  'offer_accepted',
  'offer_rejected',
  'rejected'
);

-- Interview status enum
CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Assessment status enum
CREATE TYPE assessment_status AS ENUM ('pending', 'in_progress', 'submitted', 'evaluated');

-- =====================================================
-- TABLES
-- =====================================================

-- Companies table (for multi-tenancy)
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
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'applicant',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Candidate-specific fields
  headline VARCHAR(255),
  summary TEXT,
  resume_url TEXT,
  skills TEXT[], -- Array of skills
  experience_years INTEGER,
  current_company VARCHAR(255),
  current_job_title VARCHAR(255),
  expected_salary VARCHAR(50),
  notice_period VARCHAR(50),
  education JSONB, -- [{degree, institution, year, grade}]
  work_experience JSONB, -- [{company, role, duration, description}]
  
  -- GCC Analysis data (from resume analyzer)
  gcc_score INTEGER,
  gcc_analysis JSONB, -- Full analysis from Gemini
  
  -- Metadata
  is_profile_complete BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  
  -- Job details
  department VARCHAR(100),
  location VARCHAR(255),
  job_type VARCHAR(50), -- full-time, part-time, contract, internship
  work_mode VARCHAR(50), -- remote, hybrid, onsite
  experience_min INTEGER,
  experience_max INTEGER,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'INR',
  skills_required TEXT[],
  
  -- Status and visibility
  status job_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  application_deadline DATE,
  
  -- Counts
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  UNIQUE(company_id, slug)
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Assignment
  panelist_id UUID REFERENCES profiles(id),
  
  -- Application data
  status application_status DEFAULT 'pending',
  resume_url TEXT,
  cover_letter TEXT,
  
  -- Scores (from GCC analyzer)
  gcc_score INTEGER,
  gcc_analysis JSONB,
  
  -- Panelist evaluation
  panelist_score INTEGER,
  panelist_notes TEXT,
  panelist_recommendation TEXT, -- 'hire', 'reject', 'maybe'
  
  -- Offer details
  offer_salary INTEGER,
  offer_letter_url TEXT,
  offer_sent_at TIMESTAMPTZ,
  offer_responded_at TIMESTAMPTZ,
  
  -- Timestamps
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  selected_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, candidate_id)
);

-- Interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  panelist_id UUID NOT NULL REFERENCES profiles(id),
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  
  -- Interview details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  interview_type VARCHAR(50), -- 'technical', 'hr', 'cultural', 'final'
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status interview_status DEFAULT 'scheduled',
  
  -- Meeting details
  meeting_url TEXT, -- Zoom/Meet link
  meeting_id VARCHAR(100),
  meeting_password VARCHAR(50),
  
  -- Feedback
  interviewer_notes TEXT,
  candidate_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Assessment details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assessment_type VARCHAR(50), -- 'coding', 'mcq', 'assignment'
  
  -- Timing
  duration_minutes INTEGER DEFAULT 60,
  deadline TIMESTAMPTZ,
  
  -- Content
  questions JSONB, -- [{question, options, correctAnswer, points}]
  total_points INTEGER,
  passing_score INTEGER,
  
  -- Candidate submission
  status assessment_status DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  answers JSONB,
  
  -- Evaluation
  score INTEGER,
  percentage DECIMAL(5,2),
  is_passed BOOLEAN,
  evaluator_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer Letters table
CREATE TABLE offer_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Offer details
  job_title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  salary_annual INTEGER NOT NULL,
  salary_currency VARCHAR(10) DEFAULT 'INR',
  joining_date DATE,
  
  -- Benefits
  benefits JSONB, -- [{type, description}]
  
  -- Letter
  letter_content TEXT,
  letter_pdf_url TEXT,
  
  -- Status
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  is_accepted BOOLEAN,
  rejection_reason TEXT,
  
  -- Validity
  valid_until DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (for audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'job', 'application', 'interview', etc.
  entity_id UUID,
  
  old_data JSONB,
  new_data JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_company ON applications(company_id);
CREATE INDEX idx_applications_panelist ON applications(panelist_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_panelist ON interviews(panelist_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);

CREATE INDEX idx_assessments_application ON assessments(application_id);
CREATE INDEX idx_assessments_candidate ON assessments(candidate_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Recruiting admins can view profiles in their company" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('recruiting_admin', 'panelist')
      AND p.company_id = profiles.company_id
    )
  );

CREATE POLICY "Panelists can view assigned candidates" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.panelist_id = auth.uid()
      AND a.candidate_id = profiles.id
    )
  );

-- Companies policies
CREATE POLICY "Anyone can view companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Recruiting admins can update their company" ON companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = companies.id
    )
  );

-- Jobs policies
CREATE POLICY "Anyone can view open jobs" ON jobs
  FOR SELECT USING (status = 'open');

CREATE POLICY "Company members can view all their jobs" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.company_id = jobs.company_id
    )
  );

CREATE POLICY "Recruiting admins can manage their company jobs" ON jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = jobs.company_id
    )
  );

-- Applications policies
CREATE POLICY "Applicants can view their own applications" ON applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Applicants can create applications" ON applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Company admins can view company applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = applications.company_id
    )
  );

CREATE POLICY "Panelists can view assigned applications" ON applications
  FOR SELECT USING (panelist_id = auth.uid());

CREATE POLICY "Panelists can update assigned applications" ON applications
  FOR UPDATE USING (panelist_id = auth.uid());

CREATE POLICY "Company admins can manage applications" ON applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = applications.company_id
    )
  );

-- Interviews policies
CREATE POLICY "Candidates can view their interviews" ON interviews
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Panelists can manage their interviews" ON interviews
  FOR ALL USING (panelist_id = auth.uid());

CREATE POLICY "Company admins can view company interviews" ON interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = interviews.company_id
    )
  );

-- Assessments policies
CREATE POLICY "Candidates can view their assessments" ON assessments
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their assessments" ON assessments
  FOR UPDATE USING (candidate_id = auth.uid());

CREATE POLICY "Company admins can manage assessments" ON assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = assessments.company_id
    )
  );

-- Offer letters policies
CREATE POLICY "Candidates can view their offer letters" ON offer_letters
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Company admins can manage offer letters" ON offer_letters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'recruiting_admin'
      AND p.company_id = offer_letters.company_id
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'applicant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applications_count = applications_count - 1 WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_applications_count
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- =====================================================
-- SEED DATA (Demo Companies)
-- =====================================================

INSERT INTO companies (id, name, slug, logo_url, industry, description, employee_count, headquarters) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechCorp GCC', 'techcorp', '/logos/techcorp.png', 'Technology', 'Leading technology company building innovative solutions', '10000+', 'Bangalore, India'),
  ('22222222-2222-2222-2222-222222222222', 'FinServe India', 'finserve', '/logos/finserve.png', 'Financial Services', 'Global financial services company with India GCC', '5000+', 'Mumbai, India'),
  ('33333333-3333-3333-3333-333333333333', 'HealthTech GCC', 'healthtech', '/logos/healthtech.png', 'Healthcare', 'Healthcare technology innovation center', '2000+', 'Hyderabad, India');
