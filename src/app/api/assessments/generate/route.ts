import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { applicationId } = await request.json();

        if (!applicationId) {
            return NextResponse.json(
                { error: "Application ID is required" },
                { status: 400 }
            );
        }

        // Create Supabase client
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // Fetch application and candidate data
        const { data: application, error: appError } = await supabase
            .from("applications")
            .select("*, candidates(*)")
            .eq("id", applicationId)
            .single();

        if (appError || !application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        const candidate = application.candidates;
        if (!candidate) {
            return NextResponse.json(
                { error: "Candidate not found" },
                { status: 404 }
            );
        }

        // Extract candidate info from resume
        const resumeText = candidate.resume_text || "";
        const technicalDNA = candidate.technical_dna || {};
        const skills = candidate.skills_array || [];

        // Generate coding questions using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `You are an expert technical interviewer. Generate 5 coding assessment questions for a candidate based on their resume.

Candidate Information:
- Name: ${candidate.full_name}
- Skills: ${skills.join(", ")}
- Technical DNA: ${JSON.stringify(technicalDNA)}
- Resume Summary: ${resumeText.substring(0, 1000)}

Requirements:
1. Generate exactly 5 coding questions
2. Mix difficulty levels: 2 Easy, 2 Medium, 1 Hard
3. Questions should be relevant to the candidate's skills and experience level
4. Each question should be practical and test real-world problem-solving
5. Include sample input/output for clarity

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "title": "Question title",
    "description": "Detailed problem description with constraints",
    "difficulty": "Easy|Medium|Hard",
    "expected_skills": ["skill1", "skill2"],
    "sample_input": "example input",
    "sample_output": "example output",
    "hints": ["hint 1", "hint 2"]
  }
]

Important: Return ONLY the JSON array, no markdown formatting, no explanations.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the generated questions
        let questions;
        try {
            // Remove markdown code blocks if present
            const cleanedText = responseText
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            questions = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Failed to parse AI response:", responseText);
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

        // Validate questions structure
        if (!Array.isArray(questions) || questions.length !== 5) {
            return NextResponse.json(
                { error: "Invalid questions format" },
                { status: 500 }
            );
        }

        // Store in database
        const { data: assessment, error: insertError } = await supabase
            .from("coding_assessments")
            .insert({
                application_id: applicationId,
                questions,
                status: "pending",
            })
            .select()
            .single();

        if (insertError) {
            console.error("Database error:", insertError);
            return NextResponse.json(
                { error: "Failed to save assessment" },
                { status: 500 }
            );
        }

        // Update application status
        await supabase
            .from("applications")
            .update({ status: "assessment" })
            .eq("id", applicationId);

        return NextResponse.json({
            success: true,
            assessment,
        });
    } catch (error) {
        console.error("Error generating assessment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
