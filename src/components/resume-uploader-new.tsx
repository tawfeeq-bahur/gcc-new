"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/app/actions/analyze-resume";
import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onAnalysisComplete: (candidate: Candidate) => void;
}

export function ResumeUploader({ onAnalysisComplete }: ResumeUploaderProps) {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const processFile = async (file: File) => {
    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      setFileName(file.name);
    } else if (file.type === "application/pdf") {
      // For PDF files, we'll show a message that PDF parsing requires backend
      toast.info("PDF detected", {
        description: "Please paste the text content of the resume for now.",
      });
      setFileName(file.name);
    } else {
      toast.error("Unsupported file type", {
        description: "Please upload a .txt or .pdf file",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide resume text");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(resumeText);
      if (result) {
        const candidate: Candidate = {
          id: crypto.randomUUID(),
          ...result,
        };
        onAnalysisComplete(candidate);
        toast.success("Analysis complete!", {
          description: `${result.name} - GCC Score: ${result.score}`,
        });
        setResumeText("");
        setFileName(null);
      } else {
        toast.error("Analysis failed", {
          description: "Could not parse resume. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error analyzing resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setResumeText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Upload className="h-5 w-5 text-indigo-400" />
          Resume Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
            isDragging
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-700 hover:border-slate-600"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">
                Drop resume here or click to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports .txt and .pdf files
              </p>
            </div>
          </div>
        </div>

        {/* File Name Display */}
        {fileName && (
          <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-slate-300">{fileName}</span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider">
            Or paste resume text directly
          </label>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume content here..."
            className="min-h-[150px] bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze for GCC Fit
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
