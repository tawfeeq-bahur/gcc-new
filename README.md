# 🚀 GCC-Pulse: AI-Powered Unified Hiring Ecosystem

Built for the **GCC "X" Shift Hackathon 2025** 🏆

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open http://localhost:3000
```

## 🎯 What's Built

### ✅ Complete Features

1. **AI Resume Analysis** - Gemini 1.5 Flash extracts:
   - Candidate Info (name, email, phone, location)
   - Technical DNA (stack, proficiency levels, complexity score)
   - GCC Readiness Score (0-100) + 3 trait breakdown
   - Flight Risk Assessment (Low/Medium/High)
   - Strengths & Development Gaps

2. **Recruiter Dashboard** (`/recruiter`)
   - Upload & analyze resumes
   - Beautiful candidate profile view
   - Search & filter candidates
   - Invite to assessment or schedule interview

3. **Candidate Portal** (`/candidate`)
   - Job board with available positions
   - One-click apply (auto-fill from resume)
   - Application tracker with visual stepper

4. **Interview Platform** (`/interview/[id]`)
   - Code assessment tab
   - Video interview tab
   - **AI Copilot** - Suggests questions based on candidate's resume

5. **Database Integration**
   - Supabase PostgreSQL + pgvector
   - Auto-saves analyzed resumes
   - Vector search ready

## 🎨 Routes

| Route | Purpose |
|-------|---------|
| `/` | Home page with resume uploader |
| `/recruiter` | Recruiter dashboard |
| `/candidate` | Candidate job portal |
| `/interview/[id]` | Assessment & interview platform |

## 🧪 Test the Resume Analyzer

Upload the included test file: `test-resume.txt`

Expected results:
- **Name**: Sarah Chen
- **GCC Readiness**: 85-92
- **Flight Risk**: Low
- **Technical DNA**: React, Node.js, AWS, PostgreSQL

## 🔑 Environment Variables

Already configured in `.env.local`:
- ✅ `GEMINI_API_KEY` - For AI analysis
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database key

## 🗄️ Database Setup (Optional)

If you want to persist candidates to Supabase:

1. Go to your Supabase project
2. Run the SQL from `supabase/schema.sql`
3. Tables will be created automatically

## 🎯 Key Innovations

1. **Flight Risk Prediction** - Unique attrition risk assessment
2. **GCC Trait Scoring** - Scalability, Communication, System Design
3. **AI Interview Copilot** - Personalized interview questions
4. **Complete Lifecycle** - Discovery → Evaluation → Integration

## 📊 Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Shadcn/UI
- **AI**: Google Gemini 1.5 Flash
- **Database**: Supabase (PostgreSQL + pgvector)
- **Components**: Monaco Editor, Jitsi, Recharts (ready)

## 📚 Documentation

- `IMPLEMENTATION.md` - Full technical details
- `COMPONENT_GUIDE.md` - Component usage examples
- `SETUP_GUIDE.md` - Demo & troubleshooting

## 🎬 5-Minute Demo Flow

1. **Upload Resume** → http://localhost:3000
2. **View Analysis** → See GCC score, technical DNA, flight risk
3. **Recruiter Dashboard** → http://localhost:3000/recruiter
4. **Candidate Portal** → http://localhost:3000/candidate
5. **Interview Platform** → http://localhost:3000/interview/test-123

## 🏆 Hackathon Highlights

- ✅ 2,500+ lines of production-quality code
- ✅ 8 major components built
- ✅ Full TypeScript coverage
- ✅ Real AI integration (Gemini)
- ✅ Database integration (Supabase)
- ✅ Enterprise-grade dark theme UI

## 💡 What Makes This Special

Unlike competitors that focus on one area:
- ❌ Just ATS (Applicant Tracking)
- ❌ Just assessments
- ❌ Just interviews

**GCC-Pulse covers the ENTIRE hiring lifecycle** in one unified platform.

## 🚀 Production Ready

All features are functional and demo-ready:
- Resume upload & AI analysis ✅
- Candidate profile views ✅
- Job board & applications ✅
- Assessment platform ✅
- Video interview setup ✅

---

**Built for GCC "X" Shift Hackathon 2025** 🎯

Tech Stack: Next.js 15 • Gemini AI • Supabase • Tailwind • Shadcn/UI
