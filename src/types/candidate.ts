export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface TechnicalDNA {
  primary_stack: string[];
  years_experience: number;
  project_complexity_score: number; // 1-10
  proficiency_levels?: { [key: string]: number }; // skill -> proficiency (0-100)
}

export interface GCCReadiness {
  score: number; // 0-100
  reasoning_summary: string;
  cultural_fit_notes: string;
  scalability_mindset: number; // 0-100
  cross_team_communication: number; // 0-100
  system_design: number; // 0-100
}

export interface FlightRisk {
  risk_level: "Low" | "Medium" | "High";
  reason: string;
}

export interface GeminiAnalysisResult {
  candidate_info: CandidateInfo;
  technical_dna: TechnicalDNA;
  gcc_readiness: GCCReadiness;
  skills_array: string[];
  flight_risk: FlightRisk;
  strengths?: string[];
  gaps?: string[];
  recommended_role?: string;
}

export interface Candidate extends GeminiAnalysisResult {
  id: string;
  resume_text?: string;
  created_at?: string;
  embedding?: number[];
  
  // Legacy fields for backward compatibility
  name?: string;
  score?: number;
  email?: string;
  avatar?: string;
  experience_years?: number;
  current_company?: string;
  location?: string;
}
