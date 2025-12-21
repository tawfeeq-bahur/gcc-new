"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Candidate } from "@/types/candidate";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Target,
  Users,
  Layers,
  AlertCircle,
  Send,
  Video,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateProfileViewProps {
  candidate: Candidate;
  onInviteToAssessment?: () => void;
  onScheduleInterview?: () => void;
  onReject?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 border-emerald-500";
  if (score >= 60) return "bg-amber-500/20 border-amber-500";
  return "bg-red-500/20 border-red-500";
}

function getRiskColor(level: string): string {
  if (level === "Low") return "text-emerald-400";
  if (level === "Medium") return "text-amber-400";
  return "text-red-400";
}

function getRiskBadgeColor(level: string): string {
  if (level === "Low") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
  if (level === "Medium") return "bg-amber-500/20 text-amber-400 border-amber-500/50";
  return "bg-red-500/20 text-red-400 border-red-500/50";
}

export function CandidateProfileView({
  candidate,
  onInviteToAssessment,
  onScheduleInterview,
  onReject,
}: CandidateProfileViewProps) {
  const { candidate_info, technical_dna, gcc_readiness, flight_risk, strengths, gaps, recommended_role } = candidate;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/30 border-slate-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-slate-100">{candidate_info.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="h-4 w-4 text-indigo-400" />
                  <span className="text-lg text-indigo-400 font-medium">
                    {recommended_role || "GCC Candidate"}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                {candidate_info.email !== "Not Provided" && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{candidate_info.email}</span>
                  </div>
                )}
                {candidate_info.phone !== "Not Provided" && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{candidate_info.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate_info.location}</span>
                </div>
              </div>
            </div>

            {/* GCC Readiness Score Badge */}
            <div
              className={cn(
                "flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2",
                getScoreBgColor(gcc_readiness.score)
              )}
            >
              <div className="text-center">
                <div className={cn("text-5xl font-bold", getScoreColor(gcc_readiness.score))}>
                  {gcc_readiness.score}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                  GCC Readiness
                </div>
                <div className="mt-2">
                  {gcc_readiness.score >= 80 ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                  ) : gcc_readiness.score >= 60 ? (
                    <AlertCircle className="h-6 w-6 text-amber-400 mx-auto" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400 mx-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Technical DNA */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Layers className="h-5 w-5" />
              Technical DNA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Stack */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Primary Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {technical_dna.primary_stack.map((tech) => (
                  <Badge
                    key={tech}
                    className="bg-indigo-500/20 text-indigo-300 border-indigo-500/50 px-3 py-1"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Experience & Complexity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Years of Experience</div>
                <div className="text-2xl font-bold text-slate-100">
                  {technical_dna.years_experience}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Project Complexity</div>
                <div className="text-2xl font-bold text-slate-100">
                  {technical_dna.project_complexity_score}/10
                </div>
              </div>
            </div>

            {/* Proficiency Levels */}
            {technical_dna.proficiency_levels && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Skill Proficiency
                </h3>
                {Object.entries(technical_dna.proficiency_levels).map(([skill, level]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{skill}</span>
                      <span className={getScoreColor(level)}>{level}%</span>
                    </div>
                    <Progress value={level} className="h-2" />
                  </div>
                ))}
              </div>
            )}

            {/* GCC Trait Scores */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                GCC Core Traits
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Scalability Mindset</span>
                  </div>
                  <span className={getScoreColor(gcc_readiness.scalability_mindset)}>
                    {gcc_readiness.scalability_mindset}%
                  </span>
                </div>
                <Progress value={gcc_readiness.scalability_mindset} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">Cross-team Communication</span>
                  </div>
                  <span className={getScoreColor(gcc_readiness.cross_team_communication)}>
                    {gcc_readiness.cross_team_communication}%
                  </span>
                </div>
                <Progress value={gcc_readiness.cross_team_communication} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span className="text-slate-300">System Design</span>
                  </div>
                  <span className={getScoreColor(gcc_readiness.system_design)}>
                    {gcc_readiness.system_design}%
                  </span>
                </div>
                <Progress value={gcc_readiness.system_design} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: AI Insights */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-400">
                <TrendingUp className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reasoning Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Assessment Summary
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {gcc_readiness.reasoning_summary}
                </p>
              </div>

              {/* Cultural Fit */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Cultural Fit Notes
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {gcc_readiness.cultural_fit_notes}
                </p>
              </div>

              {/* Strengths */}
              {strengths && strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {gaps && gaps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Development Areas
                  </h3>
                  <ul className="space-y-2">
                    {gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flight Risk Warning */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-400">
                <AlertTriangle className="h-5 w-5" />
                Flight Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className={cn("px-3 py-1", getRiskBadgeColor(flight_risk.risk_level))}>
                  {flight_risk.risk_level} Risk
                </Badge>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{flight_risk.reason}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <Calendar className="h-4 w-4 inline mr-2" />
              Analyzed on {new Date().toLocaleDateString()}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={onReject}
              >
                <UserX className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="outline"
                className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
                onClick={onScheduleInterview}
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={onInviteToAssessment}
              >
                <Send className="h-4 w-4 mr-2" />
                Invite to Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
