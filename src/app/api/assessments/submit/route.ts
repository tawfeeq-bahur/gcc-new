import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { assessmentId, answers } = await request.json();

        if (!assessmentId || !answers) {
            return NextResponse.json(
                { error: "Assessment ID and answers are required" },
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

        // Fetch current assessment
        const { data: assessment, error: fetchError } = await supabase
            .from("coding_assessments")
            .select("*")
            .eq("id", assessmentId)
            .single();

        if (fetchError || !assessment) {
            return NextResponse.json(
                { error: "Assessment not found" },
                { status: 404 }
            );
        }

        // Update answers and status
        const { error: updateError } = await supabase
            .from("coding_assessments")
            .update({
                answers,
                submitted_at: new Date().toISOString(),
                status: "submitted",
            })
            .eq("id", assessmentId);

        if (updateError) {
            return NextResponse.json(
                { error: "Failed to submit answers" },
                { status: 500 }
            );
        }

        // Trigger AI evaluation
        const evaluationResult = await evaluateAnswers(
            assessment.questions,
            answers
        );

        // Store evaluation
        await supabase
            .from("coding_assessments")
            .update({
                ai_evaluation: evaluationResult,
                evaluated_at: new Date().toISOString(),
                status: "evaluated",
            })
            .eq("id", assessmentId);

        return NextResponse.json({
            success: true,
            evaluation: evaluationResult,
        });
    } catch (error) {
        console.error("Error submitting assessment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function evaluateAnswers(questions: any[], answers: any[]) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are an expert code reviewer. Evaluate the following coding assessment answers.

Questions and Answers:
${JSON.stringify({ questions, answers }, null, 2)}

Evaluate each answer based on:
1. Correctness: Does it solve the problem?
2. Code Quality: Is it clean, readable, and well-structured?
3. Efficiency: Is the solution optimized?
4. Best Practices: Does it follow coding conventions?

Return ONLY a valid JSON object with this structure:
{
  "overall_score": 85,
  "question_scores": [
    {
      "question_id": "q1",
      "score": 90,
      "feedback": "Excellent solution. Clean code and optimal approach."
    }
  ],
  "strengths": ["Strong problem-solving", "Clean code"],
  "weaknesses": ["Could improve time complexity in Q3"],
  "recommendation": "Strong Hire|Hire|Maybe|No Hire"
}

Important: Return ONLY the JSON object, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
        const cleanedText = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse evaluation:", responseText);
        return {
            overall_score: 0,
            question_scores: [],
            strengths: [],
            weaknesses: ["Failed to evaluate"],
            recommendation: "Manual Review Required",
        };
    }
}
