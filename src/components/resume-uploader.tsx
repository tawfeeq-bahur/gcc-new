"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, Loader2, FileText } from "lucide-react";
import { extractCandidateData } from "@/lib/gemini"; // We'll assume client-side proxy or server action later, for now import works if using API routes

export function ResumeUploader() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lastUpload, setLastUpload] = useState<any>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    // Mock upload handler
    const handleFile = async (file: File) => {
        setUploading(true);
        // Simulate API call / Gemini extraction
        setTimeout(() => {
            setUploading(false);
            setLastUpload({
                name: file.name,
                score: 89,
                dna: "React, Node.js, AWS"
            });
        }, 2000);
    };

    return (
        <Card className="border-dashed border-2 hover:border-primary transition-colors glass-panel bg-card/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <UploadCloud className="h-5 w-5 text-indigo-400" />
                    Resume Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={`
            h-40 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer
            transition-all duration-300
            ${isDragOver ? "bg-primary/20 scale-105" : "bg-muted/20 hover:bg-muted/30"}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium">Extracting DNA...</p>
                        </div>
                    ) : lastUpload ? (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                            <p className="text-sm font-semibold">{lastUpload.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Readiness Score: {lastUpload.score}%</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setLastUpload(null)}>
                                Upload Another
                            </Button>
                        </div>
                    ) : (
                        <>
                            <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">Drag PDF here or click to upload</p>
                            <p className="text-xs text-muted-foreground mt-1">AI auto-extracts skills & readiness</p>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
