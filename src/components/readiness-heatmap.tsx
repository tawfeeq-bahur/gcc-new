"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CANDIDATES } from "@/lib/mock-data";

export function ReadinessHeatmap() {
    // Simple grid visualization of scores
    // Get scores
    const scores = MOCK_CANDIDATES.map((c: any) => c.readiness_score);

    return (
        <Card className="glass-panel">
            <CardHeader>
                <CardTitle className="text-base">Readiness Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-10 gap-1 h-32">
                    {scores.map((score: number, i: number) => (
                        <div
                            key={i}
                            className={`
                 rounded-sm w-full h-full transition-all hover:scale-125 hover:z-10 cursor-help
                 ${score > 90 ? 'bg-green-500' :
                                    score > 80 ? 'bg-green-400' :
                                        score > 70 ? 'bg-yellow-400' : 'bg-red-400'}
                 opacity-80 hover:opacity-100
               `}
                            title={`Candidate ${i + 1}: ${score}% Ready`}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Needs Upskilling</span>
                    <span>Deploy Ready</span>
                </div>
            </CardContent>
        </Card>
    );
}
