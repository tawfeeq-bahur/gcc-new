import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = "gemini-2.5-flash";

export async function extractCandidateData(resumeText: string) {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    You are an expert Technical Recruiter for a Global Capability Center (GCC).
    Analyze the following resume text and extract the "Technical DNA" and "GCC Readiness Score".
    
    Resume Text:
    "${resumeText.slice(0, 10000)}"

    Output strictly in JSON format with the following structure:
    {
      "technical_dna": {
        "core": ["Skill1", "Skill2"],
        "adjacent": ["Skill3", "Skill4"]
      },
      "readiness_score": number (0-100),
      "readiness_rationale": "One sentence explaining the score",
      "upskilling_path": ["Course/Skill 1", "Course/Skill 2", "Course/Skill 3"]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        return null;
    }
}

export async function generateOutreach(candidateName: string, technicalDna: any, jobContext: string) {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    Write a hyper-personalized recruiting outreach email to ${candidateName}.
    They have core skills in ${technicalDna.core.join(", ")}.
    The role is for a GCC focused on: ${jobContext}.
    Mention why their specific skills match the stack.
    Keep it professional, exciting, and concise.
  `;

    const result = await model.generateContent(prompt);
    return result.response.text();
}
