"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface CodingResults {
    overall_score: number;
    question_scores: Array<{
        question_id: string;
        score: number;
        feedback: string;
    }>;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
}

interface CodingQuestion {
    id: string;
    title: string;
    difficulty: string;
}

interface CodingAnswer {
    question_id: string;
    code: string;
    language: string;
}

interface CodingReviewProps {
    questions: CodingQuestion[];
    answers: CodingAnswer[];
    evaluation: CodingResults;
}

export function CodingReview({ questions, answers, evaluation }: CodingReviewProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-red-400";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
        if (score >= 60) return "bg-amber-500/20 border-amber-500/30";
        return "bg-red-500/20 border-red-500/30";
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-indigo-400" />
                    Coding Assessment Results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
                    <div>
                        <div className="text-sm text-slate-400">Overall Score</div>
                        <div className={`text-3xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                            {evaluation.overall_score}/100
                        </div>
                    </div>
                    <Badge className={getScoreBgColor(evaluation.overall_score)}>
                        {evaluation.recommendation}
                    </Badge>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4" />
                            Strengths
                        </h4>
                        <ul className="space-y-2">
                            {evaluation.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                            <TrendingDown className="h-4 w-4" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                            {evaluation.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <span>{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Question-by-Question Breakdown */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white">Question Breakdown</h4>
                    {evaluation.question_scores.map((qScore) => {
                        const question = questions.find((q) => q.id === qScore.question_id);
                        const answer = answers.find((a) => a.question_id === qScore.question_id);

                        return (
                            <div
                                key={qScore.question_id}
                                className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="text-white font-medium">{question?.title}</h5>
                                        <span className="text-xs text-slate-400">{question?.difficulty}</span>
                                    </div>
                                    <span className={`text-xl font-bold ${getScoreColor(qScore.score)}`}>
                                        {qScore.score}/100
                                    </span>
                                </div>

                                <div className="text-sm text-slate-300">
                                    <strong>AI Feedback:</strong> {qScore.feedback}
                                </div>

                                {answer && (
                                    <details className="group">
                                        <summary className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300">
                                            View Code
                                        </summary>
                                        <pre className="mt-2 p-3 bg-slate-900/50 rounded text-xs overflow-x-auto">
                                            <code className="text-slate-300">{answer.code || "No answer provided"}</code>
                                        </pre>
                                    </details>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
