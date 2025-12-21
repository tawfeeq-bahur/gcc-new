"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, Code, Mail } from "lucide-react";
import { MOCK_CANDIDATES } from "@/lib/mock-data";
import { toast } from "sonner"; // Assuming sonner is installed via shadcn

export function TalentSearch() {
    const [query, setQuery] = useState("");

    // Simple filter for mock demo
    const results = MOCK_CANDIDATES.filter((c: any) =>
        c.full_name.toLowerCase().includes(query.toLowerCase()) ||
        c.technical_dna.core.some((s: any) => s.toLowerCase().includes(query.toLowerCase())) ||
        c.technical_dna.adjacent.some((s: any) => s.toLowerCase().includes(query.toLowerCase()))
    );

    const handleGeneratePitch = (e: React.MouseEvent, candidateName: string) => {
        e.stopPropagation();
        toast.success(`Generating tailored pitch for ${candidateName}...`);
        // In real app: call /api/generate-outreach
        setTimeout(() => {
            toast.dismiss();
            toast.message("Pitch Generated", {
                description: `Draft saved to drafts for ${candidateName}.`
            });
        }, 1500);
    };

    return (
        <Card className="h-[600px] flex flex-col glass-panel">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GlobeIcon className="h-5 w-5 text-blue-400" />
                    Global Talent Search
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by skill, role, or 'distributed systems expert'..."
                            className="pl-8 bg-background/50"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary">
                        <Zap className="mr-2 h-4 w-4" /> AI Filter
                    </Button>
                </div>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                        {results.map((candidate: any) => (
                            <div key={candidate.id} className="p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg text-primary group-hover:text-blue-400 transition-colors">
                                            {candidate.full_name}
                                        </h3>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <Code className="h-3 w-3" /> {candidate.technical_dna.core.join(", ")}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={candidate.readiness_score > 85 ? "default" : "secondary"} className={candidate.readiness_score > 85 ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                                            {candidate.readiness_score}% Ready
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 items-center justify-between w-full">
                                    <div className="flex gap-2 flex-wrap">
                                        {candidate.technical_dna.adjacent.slice(0, 3).map((skill: string) => (
                                            <Badge key={skill} variant="outline" className="text-xs bg-background/30 text-muted-foreground">{skill}</Badge>
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleGeneratePitch(e, candidate.full_name)}
                                    >
                                        <Mail className="h-3 w-3 mr-1" /> Generate Pitch
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function GlobeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}
