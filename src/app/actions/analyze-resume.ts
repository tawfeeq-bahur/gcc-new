"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiAnalysisResult } from "@/types/candidate";
import { saveCandidateToSupabase } from "@/lib/supabase";

const API_KEY = process.env.GEMINI_API_KEY || "";
const USE_DEMO_MODE = !API_KEY || API_KEY === "your_gemini_api_key_here" || API_KEY.length < 20;

// Mock response for demo mode
function getMockAnalysis(resumeText: string): GeminiAnalysisResult {
  // Extract name from resume if possible
  const nameMatch = resumeText.match(/^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)/m);
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
  
  const name = nameMatch ? nameMatch[1] : "John Doe";
  const email = emailMatch ? emailMatch[0] : "Not Provided";
  const phone = phoneMatch ? phoneMatch[0] : "Not Provided";
  
  return {
    candidate_info: {
      name,
      email,
      phone,
      location: "Bangalore, India",
    },
    technical_dna: {
      primary_stack: ["React", "Node.js", "AWS", "PostgreSQL"],
      years_experience: 5,
      project_complexity_score: 8,
      proficiency_levels: {
        "React": 90,
        "Node.js": 85,
        "AWS": 80,
        "System Design": 75,
        "PostgreSQL": 85,
      },
    },
    gcc_readiness: {
      score: 85,
      reasoning_summary: "Strong technical background with proven experience in building scalable systems. Shows excellent potential for GCC roles.",
      cultural_fit_notes: "Demonstrates good collaboration skills and ability to work in distributed teams. Strong documentation and communication practices evident from resume.",
      scalability_mindset: 82,
      cross_team_communication: 88,
      system_design: 80,
    },
    skills_array: ["React", "Node.js", "AWS", "PostgreSQL", "Docker", "Kubernetes", "System Design"],
    flight_risk: {
      risk_level: "Low",
      reason: "Stable career progression with consistent growth in responsibilities. Average tenure of 2-3 years per company shows commitment.",
    },
    strengths: [
      "Strong full-stack development capabilities",
      "Experience with cloud infrastructure and DevOps",
      "Good understanding of system architecture",
    ],
    gaps: [
      "Could benefit from more experience with large-scale distributed systems",
      "Limited evidence of cross-timezone collaboration",
    ],
    recommended_role: "Senior Backend Engineer",
  };
}

const genAI = USE_DEMO_MODE ? null : new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

export async function analyzeResume(
  resumeText: string,
  fileData?: { mimeType: string; data: string }
): Promise<GeminiAnalysisResult | null> {
  // DEMO MODE - No API key required
  if (USE_DEMO_MODE) {
    console.log("⚠️ DEMO MODE: Using mock analysis. Set GEMINI_API_KEY in .env.local for real AI analysis");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return getMockAnalysis(resumeText || "Demo Resume");
  }

  // REAL AI MODE
  const model = genAI!.getGenerativeModel({ model: MODEL_NAME });

  let prompt = `You are an expert GCC (Global Capability Center) Technical Recruiter with 15+ years of experience. Analyze this resume comprehensively.

**CRITICAL INSTRUCTIONS:**
1. Read and analyze EVERY detail in the resume carefully
2. Extract ALL technologies, skills, and experiences mentioned
3. Calculate scores based on actual resume content, NOT arbitrary numbers
4. Be thorough - if the resume shows strong experience, give high scores (80-95)
5. If resume is weak, give honest low scores (40-60)
6. DO NOT give generic scores - analyze the actual content

**OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):**
{
  "candidate_info": {
    "name": "Extract exact full name from resume",
    "email": "Extract email or write 'Not Provided'",
    "phone": "Extract phone with country code or write 'Not Provided'",
    "location": "Extract city and country or write 'Not Specified'"
  },
  "technical_dna": {
    "primary_stack": ["List 4-6 MAIN technologies from resume"],
    "years_experience": <total years of experience as integer>,
    "project_complexity_score": <1-10 based on project scale and impact>,
    "proficiency_levels": {
      "Technology1": <0-100 score>,
      "Technology2": <0-100 score>,
      "Technology3": <0-100 score>,
      "Technology4": <0-100 score>
    }
  },
  "gcc_readiness": {
    "score": <Overall GCC fit score 0-100>,
    "reasoning_summary": "Detailed 2-3 sentence explanation of the score based on actual resume content",
    "cultural_fit_notes": "Assessment of teamwork, communication skills, adaptability based on resume evidence",
    "scalability_mindset": <0-100>,
    "cross_team_communication": <0-100>,
    "system_design": <0-100>
  },
  "skills_array": ["List ALL technical skills found in resume - minimum 10 skills"],
  "flight_risk": {
    "risk_level": "Low|Medium|High",
    "reason": "Analysis of job tenure pattern and career stability"
  },
  "strengths": ["3-5 key strengths based on resume achievements and skills"],
  "gaps": ["2-4 areas for improvement or missing skills for GCC roles"],
  "recommended_role": "Specific role title based on experience level and skills"
}

**SCORING GUIDELINES:**
- GCC Readiness Score: 85-95 (Exceptional with cloud, distributed systems, global team exp), 70-84 (Strong technical with some gaps), 50-69 (Moderate potential), <50 (Needs development)
- Scalability Mindset: Award high scores (80+) for AWS/Azure/GCP, microservices, distributed systems, high-traffic apps
- Cross-team Communication: Award high scores (80+) for mentions of collaboration, documentation, presentations, cross-functional work
- System Design: Award high scores (80+) for architecture experience, design patterns, tech leadership, system optimization

**Flight Risk Levels:**
- Low: 2+ years average tenure, clear growth trajectory, recent upskilling
- Medium: 1-2 years tenure OR one job hop
- High: <1 year average tenure OR outdated skills

Return ONLY the JSON object. No explanations, no markdown formatting, no code blocks.`;

  try {
    let contentParts: any[];
    
    if (fileData) {
      // Use file data for PDF or binary files
      contentParts = [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        },
        {
          text: prompt,
        },
      ];
    } else {
      // Use text data for plain text resumes
      contentParts = [
        {
          text: prompt + "\n\nRESUME:\n" + resumeText,
        },
      ];
    }
    
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();
    
    console.log("📊 Gemini Response Length:", text.length);
    console.log("📝 First 300 chars:", text.slice(0, 300));
    
    // Clean up the response - remove markdown code blocks if present
    const jsonStr = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    
    const parsed = JSON.parse(jsonStr) as GeminiAnalysisResult;
    
    // Validate the response structure
    if (
      parsed.candidate_info &&
      parsed.technical_dna &&
      parsed.gcc_readiness &&
      Array.isArray(parsed.skills_array) &&
      parsed.flight_risk
    ) {
      return parsed;
    }
    
    throw new Error("Invalid response structure from Gemini");
  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error);
    return null;
  }
}

// Helper function to extract text from PDF or text files
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Handle PDF files - use Gemini's native PDF support instead of parsing
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    // For PDFs, we'll let Gemini handle it directly with File API
    // Return a special marker that we'll handle differently
    return "USE_GEMINI_FILE_API";
  }
  
  // Handle text files (.txt, .doc, .docx, etc.)
  try {
    return await file.text();
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error("Failed to read file content.");
  }
}

// Helper function to upload resume with FormData
export async function uploadResume(formData: FormData): Promise<{
  success: boolean;
  data?: GeminiAnalysisResult;
  error?: string;
  isDemoMode?: boolean;
}> {
  try {
    const file = formData.get("resume") as File;
    
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    console.log(`📄 Processing file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);

    // Extract text from PDF or text file
    const text = await extractTextFromFile(file);
    
    let analysis: GeminiAnalysisResult | null = null;
    
    // If it's a PDF, use Gemini's native file support
    if (text === "USE_GEMINI_FILE_API") {
      console.log("📄 Using Gemini's native PDF analysis...");
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      analysis = await analyzeResume("", {
        mimeType: file.type,
        data: base64Data
      });
    } else {
      // For text files, use traditional text analysis
      console.log(`📝 Extracted text length: ${text.length} characters`);
      console.log(`📝 First 200 chars: ${text.slice(0, 200)}`);
      
      if (!text || text.trim().length < 50) {
        return { success: false, error: "Resume file is empty or too short. Please upload a valid resume." };
      }
      
      analysis = await analyzeResume(text);
    }
    
    if (!analysis) {
      return { 
        success: false, 
        error: USE_DEMO_MODE 
          ? "Failed to generate demo analysis" 
          : "Failed to analyze resume. Please check your API key." 
      };
    }

    // Save to Supabase (optional - continues even if save fails)
    if (!USE_DEMO_MODE) {
      const saveResult = await saveCandidateToSupabase(analysis);
      if (saveResult.success) {
        console.log("✅ Candidate saved to Supabase:", saveResult.data?.id);
      } else {
        console.warn("⚠️ Failed to save to Supabase (continuing anyway):", saveResult.error);
      }
    }

    return { 
      success: true, 
      data: analysis,
      isDemoMode: USE_DEMO_MODE 
    };
  } catch (error) {
    console.error("Upload Resume Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process resume" 
    };
  }
}
