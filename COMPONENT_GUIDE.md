# GCC-Pulse Component Usage Guide

## 🎯 Quick Start Components

### 1. CandidateProfileView - The "Composed Content" UI

**Purpose**: Display detailed AI analysis of a candidate with beautiful enterprise UI.

**Location**: `src/components/candidate-profile-view.tsx`

**Usage**:
```tsx
import { CandidateProfileView } from "@/components/candidate-profile-view";
import type { Candidate } from "@/types/candidate";

export default function Page() {
  const candidate: Candidate = {
    // ... candidate data from Gemini analysis
  };

  return (
    <CandidateProfileView
      candidate={candidate}
      onInviteToAssessment={() => {
        // Send assessment invitation
        console.log("Invite to assessment");
      }}
      onScheduleInterview={() => {
        // Schedule interview
        console.log("Schedule interview");
      }}
      onReject={() => {
        // Reject candidate
        console.log("Reject candidate");
      }}
    />
  );
}
```

**Features**:
- ✅ GCC Readiness Score badge (Green >80, Yellow >60, Red <60)
- ✅ Technical DNA with skill proficiency bars
- ✅ GCC trait breakdown (Scalability, Communication, System Design)
- ✅ AI insights (reasoning, cultural fit, strengths, gaps)
- ✅ Flight risk assessment with color-coded badge
- ✅ Action buttons for workflow progression

---

### 2. ResumeUploaderEnhanced - AI Resume Parser

**Purpose**: Upload resumes and get instant AI analysis from Gemini.

**Location**: `src/components/resume-uploader-enhanced.tsx`

**Usage**:
```tsx
import { ResumeUploaderEnhanced } from "@/components/resume-uploader-enhanced";
import type { GeminiAnalysisResult } from "@/types/candidate";

export default function Page() {
  const handleAnalysisComplete = (analysis: GeminiAnalysisResult) => {
    console.log("AI Analysis:", analysis);
    // Save to Supabase, update state, etc.
  };

  return (
    <ResumeUploaderEnhanced onAnalysisComplete={handleAnalysisComplete} />
  );
}
```

**Features**:
- ✅ Drag & drop PDF/TXT files
- ✅ Visual upload states (uploading, success, error)
- ✅ Calls Gemini AI for analysis
- ✅ Returns structured candidate data
- ✅ Toast notifications

---

### 3. Server Action: analyzeResume

**Purpose**: Extract structured candidate data from resume text using Gemini AI.

**Location**: `src/app/actions/analyze-resume.ts`

**Usage**:
```tsx
import { analyzeResume, uploadResume } from "@/app/actions/analyze-resume";

// Option 1: Direct text analysis
const resumeText = "...resume content...";
const analysis = await analyzeResume(resumeText);

// Option 2: Upload with FormData
const formData = new FormData();
formData.append("resume", file);
const result = await uploadResume(formData);
```

**Returns**:
```typescript
{
  candidate_info: {
    name: string,
    email: string,
    phone: string,
    location: string
  },
  technical_dna: {
    primary_stack: string[],
    years_experience: number,
    project_complexity_score: 1-10,
    proficiency_levels: { [skill]: 0-100 }
  },
  gcc_readiness: {
    score: 0-100,
    reasoning_summary: string,
    cultural_fit_notes: string,
    scalability_mindset: 0-100,
    cross_team_communication: 0-100,
    system_design: 0-100
  },
  flight_risk: {
    risk_level: "Low" | "Medium" | "High",
    reason: string
  },
  skills_array: string[],
  strengths: string[],
  gaps: string[],
  recommended_role: string
}
```

---

## 🗄️ Database Integration

### Saving Analyzed Candidates to Supabase

```typescript
import { createClient } from "@supabase/supabase-js";
import type { GeminiAnalysisResult } from "@/types/candidate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function saveCandidate(analysis: GeminiAnalysisResult, resumeText: string) {
  const { data, error } = await supabase
    .from("candidates")
    .insert({
      full_name: analysis.candidate_info.name,
      email: analysis.candidate_info.email,
      phone: analysis.candidate_info.phone,
      location: analysis.candidate_info.location,
      resume_text: resumeText,
      candidate_info: analysis.candidate_info,
      technical_dna: analysis.technical_dna,
      gcc_readiness: analysis.gcc_readiness,
      flight_risk: analysis.flight_risk,
      skills_array: analysis.skills_array,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      recommended_role: analysis.recommended_role,
      // embedding: await generateEmbedding(resumeText), // TODO: Add vector embedding
    })
    .select()
    .single();

  return { data, error };
}
```

### Fetching Candidates

```typescript
async function getCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

async function getCandidateById(id: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}
```

---

## 🎨 UI Color Coding Reference

### GCC Readiness Scores
- **≥ 80**: Emerald/Green (High potential, ready for GCC)
- **60-79**: Amber/Yellow (Moderate fit, needs development)
- **< 60**: Red (Low readiness, significant gaps)

### Flight Risk Levels
- **Low**: Emerald (Stable career, low attrition risk)
- **Medium**: Amber (Some red flags, monitor closely)
- **High**: Red (High attrition risk, proceed with caution)

### Application Status Colors
- **Applied**: Gray (Initial state)
- **AI Screened**: Blue (System processed)
- **Assessment**: Purple (Candidate action required)
- **Interview**: Indigo (Scheduled/in-progress)
- **Offer**: Emerald (Success state)
- **Rejected**: Red (Terminal state)

---

## 🧪 Testing with Mock Data

### Sample Candidate for Testing

```typescript
const mockCandidate: Candidate = {
  id: "test-1",
  candidate_info: {
    name: "Test Candidate",
    email: "test@example.com",
    phone: "+91-12345-67890",
    location: "Bangalore, India",
  },
  technical_dna: {
    primary_stack: ["React", "Node.js", "AWS"],
    years_experience: 5,
    project_complexity_score: 8,
    proficiency_levels: {
      "React": 90,
      "Node.js": 85,
      "AWS": 75,
    },
  },
  gcc_readiness: {
    score: 85,
    reasoning_summary: "Strong technical background with proven scalability experience.",
    cultural_fit_notes: "Excellent communicator with global team experience.",
    scalability_mindset: 80,
    cross_team_communication: 90,
    system_design: 80,
  },
  skills_array: ["React", "Node.js", "AWS", "PostgreSQL"],
  flight_risk: {
    risk_level: "Low",
    reason: "Stable career progression with 3+ years per company.",
  },
  strengths: ["Strong architecture skills", "Excellent communicator"],
  gaps: ["Limited Kubernetes experience"],
  recommended_role: "Senior Backend Engineer",
};
```

---

## 🚀 Common Workflows

### 1. Resume Upload → Analysis → Profile View

```tsx
"use client";

import { useState } from "react";
import { ResumeUploaderEnhanced } from "@/components/resume-uploader-enhanced";
import { CandidateProfileView } from "@/components/candidate-profile-view";
import type { Candidate, GeminiAnalysisResult } from "@/types/candidate";

export default function RecruiterPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleAnalysisComplete = (analysis: GeminiAnalysisResult) => {
    const candidate: Candidate = {
      ...analysis,
      id: `new-${Date.now()}`,
    };
    setSelectedCandidate(candidate);
  };

  if (selectedCandidate) {
    return (
      <CandidateProfileView
        candidate={selectedCandidate}
        onInviteToAssessment={() => console.log("Invite")}
        onScheduleInterview={() => console.log("Schedule")}
        onReject={() => setSelectedCandidate(null)}
      />
    );
  }

  return <ResumeUploaderEnhanced onAnalysisComplete={handleAnalysisComplete} />;
}
```

### 2. Candidate List → Detail View

```tsx
"use client";

import { useState, useEffect } from "react";
import { CandidateProfileView } from "@/components/candidate-profile-view";
import { getCandidates } from "@/lib/supabase";
import type { Candidate } from "@/types/candidate";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    const { data } = await getCandidates();
    if (data) setCandidates(data);
  }

  if (selected) {
    return <CandidateProfileView candidate={selected} /* ... */ />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {candidates.map((c) => (
        <div key={c.id} onClick={() => setSelected(c)}>
          {/* Candidate card */}
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 Environment Variables Checklist

```env
# Required for AI Analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Required for Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key for Admin Operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 🎯 Key Features to Demo

1. **Resume Upload**: Show drag & drop with instant AI analysis
2. **Composed Content UI**: Highlight the beautiful profile view with all insights
3. **Flight Risk Assessment**: Show how AI predicts attrition risk
4. **GCC Trait Breakdown**: Demonstrate the 3 core traits scoring
5. **Action Workflow**: Upload → View → Invite to Assessment
6. **Candidate Portal**: Show the Unstop-like job board and application tracker
7. **AI Copilot**: Demo the interview suggestions based on resume analysis

---

**Pro Tips**:
- Test with diverse resumes to show AI's adaptability
- Use the color-coded scores to quickly identify top candidates
- Demonstrate the complete lifecycle in one flow for maximum impact
- Highlight unique features: Flight Risk, AI Copilot, GCC trait scoring
