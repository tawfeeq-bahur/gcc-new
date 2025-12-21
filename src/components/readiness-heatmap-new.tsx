"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";
import { Grid3X3, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReadinessHeatmapProps {
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

function getHeatmapColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 80) return "bg-emerald-400";
  if (score >= 70) return "bg-amber-400";
  if (score >= 60) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function getHeatmapHoverColor(score: number): string {
  if (score >= 90) return "hover:bg-emerald-400";
  if (score >= 80) return "hover:bg-emerald-300";
  if (score >= 70) return "hover:bg-amber-300";
  if (score >= 60) return "hover:bg-amber-400";
  if (score >= 50) return "hover:bg-orange-400";
  return "hover:bg-red-400";
}

export function ReadinessHeatmap({
  candidates,
  onCandidateClick,
}: ReadinessHeatmapProps) {
  // Sort candidates by score for better visualization
  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Grid3X3 className="h-5 w-5 text-indigo-400" />
            Readiness Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Score Range:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-xs text-slate-400">0</span>
              <div className="w-8 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded" />
              <span className="text-xs text-slate-400">100</span>
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 className="h-12 w-12 mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400">No candidates to display</p>
            <p className="text-sm text-slate-500 mt-1">
              Upload resumes to populate the heatmap
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {sortedCandidates.map((candidate) => (
                <Tooltip key={candidate.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onCandidateClick?.(candidate)}
                      className={cn(
                        "aspect-square rounded-lg transition-all duration-200 cursor-pointer",
                        "flex items-center justify-center text-white font-bold text-sm",
                        "hover:scale-110 hover:z-10 hover:shadow-lg",
                        getHeatmapColor(candidate.score),
                        getHeatmapHoverColor(candidate.score)
                      )}
                    >
                      {candidate.score}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-slate-800 border-slate-700"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-100">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {candidate.recommended_role}
                      </p>
                      <p className="text-xs text-indigo-400">
                        GCC Fit Score: {candidate.score}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}

        {/* Legend */}
        {candidates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-400">Excellent (90+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-400" />
                  <span className="text-slate-400">Good (80-89)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-400" />
                  <span className="text-slate-400">Average (70-79)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-slate-400">Needs Work (&lt;60)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Info className="h-3 w-3" />
                <span>Click cell for details</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
