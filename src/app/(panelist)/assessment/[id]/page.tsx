"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ClipboardList,
  User,
  Star,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Save,
  Send,
} from "lucide-react";

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [scores, setScores] = useState({
    technical: "",
    communication: "",
    culturalFit: "",
    problemSolving: "",
    leadership: "",
  });

  const [feedback, setFeedback] = useState({
    strengths: "",
    weaknesses: "",
    overall: "",
    recommendation: "",
  });

  const [decision, setDecision] = useState<"" | "recommend" | "reject">("");
  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (field: string, value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 0 && numValue <= 100)) {
      setScores((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!scores.technical || !scores.communication || !scores.culturalFit) {
      toast.error("Please fill in all required scores");
      return;
    }

    if (!feedback.overall || !decision) {
      toast.error("Please provide overall feedback and recommendation");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Assessment submitted successfully!");
      router.push("/panelist");
    }, 1500);
  };

  const averageScore = Object.values(scores)
    .filter((s) => s !== "")
    .reduce((acc, val) => acc + parseInt(val), 0) / Object.values(scores).filter((s) => s !== "").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-indigo-400" />
              Candidate Assessment
            </h1>
            <p className="text-slate-400 mt-1">Evaluate candidate performance and provide feedback</p>
          </div>
        </div>

        {/* Candidate Info */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <User className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Rahul Sharma</h2>
                <p className="text-slate-400">Senior Full Stack Engineer • 7 years exp</p>
                <p className="text-sm text-slate-500 mt-1">Interview ID: {assessmentId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Section */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Performance Scores (0-100)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Technical Skills <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.technical}
                  onChange={(e) => handleScoreChange("technical", e.target.value)}
                  placeholder="0-100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Communication <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.communication}
                  onChange={(e) => handleScoreChange("communication", e.target.value)}
                  placeholder="0-100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Cultural Fit <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.culturalFit}
                  onChange={(e) => handleScoreChange("culturalFit", e.target.value)}
                  placeholder="0-100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Problem Solving</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.problemSolving}
                  onChange={(e) => handleScoreChange("problemSolving", e.target.value)}
                  placeholder="0-100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Leadership Potential</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.leadership}
                  onChange={(e) => handleScoreChange("leadership", e.target.value)}
                  placeholder="0-100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              {/* Average Score Display */}
              <div className="flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-400">
                    {averageScore > 0 ? averageScore.toFixed(1) : "--"}
                  </div>
                  <div className="text-sm text-slate-400">Average Score</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Key Strengths</label>
              <Textarea
                value={feedback.strengths}
                onChange={(e) => setFeedback((prev) => ({ ...prev, strengths: e.target.value }))}
                placeholder="What did the candidate excel at?"
                rows={3}
                className="bg-slate-800/50 border-slate-700 text-white resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Areas for Improvement</label>
              <Textarea
                value={feedback.weaknesses}
                onChange={(e) => setFeedback((prev) => ({ ...prev, weaknesses: e.target.value }))}
                placeholder="What areas need development?"
                rows={3}
                className="bg-slate-800/50 border-slate-700 text-white resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Overall Assessment <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={feedback.overall}
                onChange={(e) => setFeedback((prev) => ({ ...prev, overall: e.target.value }))}
                placeholder="Provide a comprehensive summary of the candidate's performance..."
                rows={4}
                className="bg-slate-800/50 border-slate-700 text-white resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Hiring Recommendation Notes</label>
              <Textarea
                value={feedback.recommendation}
                onChange={(e) => setFeedback((prev) => ({ ...prev, recommendation: e.target.value }))}
                placeholder="Additional context for your recommendation..."
                rows={3}
                className="bg-slate-800/50 border-slate-700 text-white resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Decision */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              Final Recommendation <span className="text-red-400">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDecision("recommend")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  decision === "recommend"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <CheckCircle2
                  className={`h-12 w-12 mx-auto mb-3 ${
                    decision === "recommend" ? "text-emerald-400" : "text-slate-600"
                  }`}
                />
                <div className="text-center">
                  <div className="font-semibold text-white mb-1">Recommend for Hire</div>
                  <div className="text-sm text-slate-400">Candidate meets requirements</div>
                </div>
              </button>

              <button
                onClick={() => setDecision("reject")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  decision === "reject"
                    ? "border-red-500 bg-red-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <XCircle
                  className={`h-12 w-12 mx-auto mb-3 ${
                    decision === "reject" ? "text-red-400" : "text-slate-600"
                  }`}
                />
                <div className="text-center">
                  <div className="font-semibold text-white mb-1">Do Not Recommend</div>
                  <div className="text-sm text-slate-400">Candidate does not meet criteria</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => toast.success("Assessment saved as draft")}
            className="flex-1 border-slate-700 text-slate-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
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
        </div>
      </div>
    </div>
  );
}
