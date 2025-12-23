"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Code2,
    CheckCircle2,
    Clock,
    Save,
    Send,
    AlertCircle,
} from "lucide-react";

interface CodingQuestion {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    expected_skills: string[];
    sample_input: string;
    sample_output: string;
    hints: string[];
}

interface Answer {
    question_id: string;
    code: string;
    language: string;
    submitted_at?: string;
}

export default function CodingAssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<CodingQuestion[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<string>("pending");

    useEffect(() => {
        loadAssessment();
    }, [assessmentId]);

    const loadAssessment = async () => {
        try {
            // TODO: Fetch assessment from API
            // For now, using mock data
            const mockQuestions: CodingQuestion[] = [
                {
                    id: "q1",
                    title: "Two Sum Problem",
                    description:
                        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
                    difficulty: "Easy",
                    expected_skills: ["Arrays", "Hash Tables"],
                    sample_input: "nums = [2,7,11,15], target = 9",
                    sample_output: "[0,1]",
                    hints: ["Use a hash map to store seen numbers", "One pass solution is possible"],
                },
                {
                    id: "q2",
                    title: "Reverse Linked List",
                    description:
                        "Given the head of a singly linked list, reverse the list, and return the reversed list.",
                    difficulty: "Easy",
                    expected_skills: ["Linked Lists", "Pointers"],
                    sample_input: "head = [1,2,3,4,5]",
                    sample_output: "[5,4,3,2,1]",
                    hints: ["Use three pointers: prev, current, next", "Iterative approach is cleaner than recursive"],
                },
            ];

            setQuestions(mockQuestions);
            setAnswers(
                mockQuestions.map((q) => ({
                    question_id: q.id,
                    code: "",
                    language: "javascript",
                }))
            );
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load assessment");
            setLoading(false);
        }
    };

    const handleCodeChange = (value: string) => {
        setAnswers((prev) =>
            prev.map((a) =>
                a.question_id === questions[currentQuestionIndex].id
                    ? { ...a, code: value }
                    : a
            )
        );
    };

    const handleSave = async () => {
        toast.success("Progress saved!");
        // TODO: Auto-save to database
    };

    const handleSubmit = async () => {
        // Validate all answers
        const unanswered = answers.filter((a) => !a.code.trim());
        if (unanswered.length > 0) {
            toast.error(
                `Please answer all questions (${unanswered.length} remaining)`
            );
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/assessments/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assessmentId,
                    answers,
                }),
            });

            if (response.ok) {
                toast.success("Assessment submitted successfully!");
                router.push("/dashboard");
            } else {
                toast.error("Failed to submit assessment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white">Loading assessment...</div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find(
        (a) => a.question_id === currentQuestion.id
    );
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const difficultyColor =
        currentQuestion.difficulty === "Easy"
            ? "text-emerald-400"
            : currentQuestion.difficulty === "Medium"
                ? "text-amber-400"
                : "text-red-400";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Code2 className="h-8 w-8 text-indigo-400" />
                        Coding Assessment
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Complete all {questions.length} questions to submit your assessment
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Question Panel */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-white">
                                <span>{currentQuestion.title}</span>
                                <span className={`text-sm ${difficultyColor}`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                                {currentQuestion.expected_skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-300">
                            <div>
                                <h3 className="font-semibold mb-2">Problem Description</h3>
                                <p className="text-sm leading-relaxed">
                                    {currentQuestion.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Sample Input</h3>
                                <pre className="bg-slate-800/50 p-3 rounded text-sm overflow-x-auto">
                                    {currentQuestion.sample_input}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Sample Output</h3>
                                <pre className="bg-slate-800/50 p-3 rounded text-sm overflow-x-auto">
                                    {currentQuestion.sample_output}
                                </pre>
                            </div>

                            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Hints
                                    </h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-400">
                                        {currentQuestion.hints.map((hint, idx) => (
                                            <li key={idx}>{hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Code Editor Panel */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Your Solution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={currentAnswer?.code || ""}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                placeholder="// Write your solution here..."
                                className="bg-slate-800/50 border-slate-700 text-white font-mono text-sm min-h-[400px] resize-none"
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    variant="outline"
                                    className="flex-1 border-slate-700 text-slate-300"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Progress
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${currentQuestionIndex === idx
                                        ? "bg-indigo-600 text-white"
                                        : answers[idx]?.code
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {currentQuestionIndex > 0 && (
                            <Button
                                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                variant="outline"
                                className="border-slate-700 text-slate-300"
                            >
                                Previous
                            </Button>
                        )}
                        {currentQuestionIndex < questions.length - 1 && (
                            <Button
                                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                className="bg-indigo-600 hover:bg-indigo-500"
                            >
                                Next
                            </Button>
                        )}
                        {currentQuestionIndex === questions.length - 1 && (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {submitting ? (
                                    <>Submitting...</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Assessment
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
