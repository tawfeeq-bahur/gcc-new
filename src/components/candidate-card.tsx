"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Candidate } from "@/types/candidate";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 70) return "bg-amber-500/20 border-amber-500/30";
  return "bg-red-500/20 border-red-500/30";
}

function getProgressColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const candidateName = candidate.name || candidate.candidate_info?.name || "Unknown Candidate";
  const candidateRole = candidate.recommended_role || "No Role Specified";
  const candidateScore = candidate.score || candidate.gcc_readiness?.score || 0;
  
  return (
    <Card
      className={cn(
        "bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group",
        "hover:shadow-lg hover:shadow-indigo-500/10"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
              {candidateName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Briefcase className="h-3 w-3 text-slate-500" />
              <span className="text-sm text-slate-400">
                {candidateRole}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-xl border",
              getScoreBgColor(candidateScore)
            )}
          >
            <div className="text-center">
              <div className={cn("text-xl font-bold", getScoreColor(candidateScore))}>
                {candidateScore}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                GCC
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">GCC Fit Score</span>
            <span className={getScoreColor(candidateScore)}>{candidateScore}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor(candidateScore))}
              style={{ width: `${candidateScore}%` }}
            />
          </div>
        </div>

        {/* Strengths */}
        {candidate.strengths && candidate.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span className="uppercase tracking-wider font-medium">Strengths</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.strengths.slice(0, 3).map((strength, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {candidate.gaps && candidate.gaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="uppercase tracking-wider font-medium">Skill Gaps</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.gaps.slice(0, 3).map((gap, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs"
                >
                  {gap}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* View Details */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Target className="h-3 w-3" />
            <span>Ready for assessment</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
