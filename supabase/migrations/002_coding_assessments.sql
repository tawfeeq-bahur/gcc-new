-- ============================================================================
-- CODING ASSESSMENTS TABLE: AI-generated coding questions and answers
-- ============================================================================
-- This migration adds support for automatic coding assessments
-- Questions are generated based on candidate's resume using Gemini AI

create table coding_assessments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  
  -- Assessment Status
  status text default 'pending', -- 'pending' -> 'in_progress' -> 'submitted' -> 'evaluated'
  
  -- Generated Questions (5 questions)
  -- Structure: [{ id, title, description, difficulty, expected_skills[], sample_input, sample_output, hints[] }]
  questions jsonb not null,
  
  -- Candidate Answers
  -- Structure: [{ question_id, code, language, submitted_at, execution_result }]
  answers jsonb default '[]'::jsonb,
  
  -- AI Evaluation Results
  -- Structure: { overall_score, question_scores: [{ question_id, score, feedback }], strengths[], weaknesses[], recommendation }
  ai_evaluation jsonb,
  
  -- Timestamps
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  evaluated_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one assessment per application
  unique(application_id)
);

-- Indexes for faster queries
create index coding_assessments_application_idx on coding_assessments(application_id);
create index coding_assessments_status_idx on coding_assessments(status);

-- Trigger for auto-updating updated_at
create trigger update_coding_assessments_updated_at before update on coding_assessments
  for each row execute function update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Get assessment for application
-- ============================================================================
create or replace function get_assessment_by_application(app_id uuid)
returns table (
  id uuid,
  status text,
  questions jsonb,
  answers jsonb,
  ai_evaluation jsonb,
  submitted_at timestamp with time zone
)
language plpgsql
as $$
begin
  return query
  select
    coding_assessments.id,
    coding_assessments.status,
    coding_assessments.questions,
    coding_assessments.answers,
    coding_assessments.ai_evaluation,
    coding_assessments.submitted_at
  from coding_assessments
  where coding_assessments.application_id = app_id;
end;
$$;
