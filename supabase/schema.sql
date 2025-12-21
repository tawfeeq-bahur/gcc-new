-- Enable pgvector extension to support embedding storage and search
create extension if not exists vector;

-- ============================================================================
-- CANDIDATES TABLE: Stores applicant information and AI-extracted insights
-- ============================================================================
create table candidates (
  id uuid primary key default gen_random_uuid(),
  
  -- Basic Info
  full_name text not null,
  email text,
  phone text,
  location text,
  resume_text text,
  
  -- AI Analysis Results (JSON)
  candidate_info jsonb, -- { name, email, phone, location }
  technical_dna jsonb, -- { primary_stack, years_experience, project_complexity_score, proficiency_levels }
  gcc_readiness jsonb, -- { score, reasoning_summary, cultural_fit_notes, scalability_mindset, cross_team_communication, system_design }
  flight_risk jsonb, -- { risk_level, reason }
  skills_array text[], -- Array of skills for filtering
  strengths text[],
  gaps text[],
  recommended_role text,
  
  -- Vector Search
  embedding vector(768), -- Vector embedding for semantic search (Gemini dimension: 768)
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster searches
create index candidates_email_idx on candidates(email);
create index candidates_created_at_idx on candidates(created_at desc);

-- ============================================================================
-- JOBS TABLE: Available positions at the GCC
-- ============================================================================
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department text,
  location text,
  required_skills text[] not null,
  preferred_skills text[],
  experience_min int, -- Minimum years of experience
  experience_max int, -- Maximum years of experience
  salary_min int,
  salary_max int,
  job_type text, -- 'full-time', 'contract', 'internship'
  status text default 'active', -- 'active', 'closed', 'on-hold'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index jobs_status_idx on jobs(status);
create index jobs_created_at_idx on jobs(created_at desc);

-- ============================================================================
-- APPLICATIONS TABLE: Tracks candidate applications to jobs
-- ============================================================================
create table applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  
  -- Application Status Flow
  status text default 'applied', -- 'applied' -> 'ai_screened' -> 'assessment' -> 'interview' -> 'offer' -> 'rejected'
  
  -- Assessment Results
  assessment_result jsonb, -- { score, code_quality, problem_solving, time_taken }
  assessment_completed_at timestamp with time zone,
  
  -- Interview Details
  interview_scheduled_at timestamp with time zone,
  interview_completed_at timestamp with time zone,
  interview_notes text,
  interviewer_rating int, -- 1-10
  
  -- AI Recommendations
  ai_match_score int, -- 0-100 how well candidate matches job
  ai_recommendation text, -- AI's hiring recommendation
  
  -- Metadata
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique application per candidate per job
  unique(candidate_id, job_id)
);

create index applications_candidate_idx on applications(candidate_id);
create index applications_job_idx on applications(job_id);
create index applications_status_idx on applications(status);

-- ============================================================================
-- SEMANTIC SEARCH FUNCTION: Finds candidates based on vector similarity
-- ============================================================================
create or replace function match_candidates (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  full_name text,
  gcc_readiness jsonb,
  technical_dna jsonb,
  recommended_role text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    candidates.id,
    candidates.full_name,
    candidates.gcc_readiness,
    candidates.technical_dna,
    candidates.recommended_role,
    1 - (candidates.embedding <=> query_embedding) as similarity
  from candidates
  where 1 - (candidates.embedding <=> query_embedding) > match_threshold
  order by candidates.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for auto-updating updated_at
create trigger update_candidates_updated_at before update on candidates
  for each row execute function update_updated_at_column();

create trigger update_jobs_updated_at before update on jobs
  for each row execute function update_updated_at_column();

create trigger update_applications_updated_at before update on applications
  for each row execute function update_updated_at_column();
