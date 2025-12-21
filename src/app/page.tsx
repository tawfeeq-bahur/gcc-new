"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ResumeUploaderEnhanced } from "@/components/resume-uploader-enhanced";
import { CandidateProfileView } from "@/components/candidate-profile-view";
import type { Candidate, GeminiAnalysisResult } from "@/types/candidate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Target, 
  ArrowRight,
  Code,
  Video,
  Briefcase,
  Zap,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzedCandidate, setAnalyzedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in, redirect to their dashboard
        const role = session.user.user_metadata?.role || 'applicant';
        
        switch (role) {
          case 'recruiting_admin':
            router.replace('/admin');
            break;
          case 'panelist':
            router.replace('/panelist');
            break;
          case 'applicant':
          default:
            router.replace('/dashboard');
            break;
        }
      } else {
        // Not logged in, redirect to login
        router.replace('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const handleAnalysisComplete = (analysis: GeminiAnalysisResult) => {
    const candidate: Candidate = {
      ...analysis,
      id: `new-${Date.now()}`,
    };
    setAnalyzedCandidate(candidate);
  };

  if (analyzedCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto p-6">
          <Button
            variant="ghost"
            className="mb-4 text-indigo-400 hover:text-indigo-300"
            onClick={() => setAnalyzedCandidate(null)}
          >
            ← Upload Another Resume
          </Button>
          <CandidateProfileView
            candidate={analyzedCandidate}
            onInviteToAssessment={() => {
              toast.success(`Assessment invitation sent to ${analyzedCandidate.candidate_info.name}!`);
            }}
            onScheduleInterview={() => {
              toast.success(`Interview scheduled for ${analyzedCandidate.candidate_info.name}!`);
            }}
            onReject={() => {
              setAnalyzedCandidate(null);
              toast.error("Candidate rejected");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-400 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Gemini AI</span>
          </div>
          
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            GCC-Pulse
          </h1>
          
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
            AI-Powered Unified Hiring Ecosystem
          </p>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Complete hiring lifecycle: Talent Discovery → AI Evaluation → Smart Integration
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">
              🚀 Start Here: Upload a Resume
            </h2>
            <p className="text-slate-400">
              Our AI will analyze Technical DNA, GCC Readiness, and Flight Risk in seconds
            </p>
          </div>
          
          <ResumeUploaderEnhanced onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-slate-200 mb-8">
            ⚡ Platform Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                  <Zap className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-indigo-400">AI Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• Extract Technical DNA instantly</p>
                <p>• Calculate GCC Readiness Score (0-100)</p>
                <p>• Predict Flight Risk (Low/Med/High)</p>
                <p>• Identify strengths & skill gaps</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-400">GCC Trait Scoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• Scalability Mindset (0-100)</p>
                <p>• Cross-team Communication (0-100)</p>
                <p>• System Design Skills (0-100)</p>
                <p>• Industry-specific evaluation</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Code className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-purple-400">Code Assessments</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• AI-generated coding problems</p>
                <p>• Real-time code evaluation</p>
                <p>• Quality & correctness analysis</p>
                <p>• CodeSignal-like experience</p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Video className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-blue-400">AI Interview Copilot</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• Video interview platform</p>
                <p>• AI suggests interview questions</p>
                <p>• Based on candidate's projects</p>
                <p>• Real-time candidate insights</p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Briefcase className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-amber-400">Candidate Portal</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• Browse available jobs</p>
                <p>• One-click apply (auto-fill)</p>
                <p>• Visual application tracker</p>
                <p>• Unstop-like experience</p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
                  <Users className="h-6 w-6 text-pink-400" />
                </div>
                <CardTitle className="text-pink-400">Recruiter Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>• Manage all candidates</p>
                <p>• Search & filter profiles</p>
                <p>• Track hiring pipeline</p>
                <p>• Analytics & insights</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-slate-200 mb-6">
            🎯 Explore Other Pages
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/recruiter">
              <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group">
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    Recruiter Dashboard
                  </h4>
                  <p className="text-sm text-slate-400 mt-2">
                    Upload & manage candidates
                  </p>
                  <ArrowRight className="h-4 w-4 text-indigo-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/candidate">
              <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500 transition-all cursor-pointer group">
                <CardContent className="pt-6 text-center">
                  <Briefcase className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    Candidate Portal
                  </h4>
                  <p className="text-sm text-slate-400 mt-2">
                    Browse jobs & apply
                  </p>
                  <ArrowRight className="h-4 w-4 text-emerald-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/interview/test-123">
              <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500 transition-all cursor-pointer group">
                <CardContent className="pt-6 text-center">
                  <Video className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-slate-100 group-hover:text-purple-400 transition-colors">
                    Interview Platform
                  </h4>
                  <p className="text-sm text-slate-400 mt-2">
                    Assessments & interviews
                  </p>
                  <ArrowRight className="h-4 w-4 text-purple-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center text-slate-500 text-sm">
          <p>Built with Next.js 15 • Gemini AI • Supabase • Tailwind CSS</p>
          <p className="mt-2">GCC "X" Shift Hackathon 2025</p>
        </div>
      </div>
    </div>
  );
}
