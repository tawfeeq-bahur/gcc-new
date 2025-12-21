"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react";
import { uploadResume } from "@/app/actions/analyze-resume";
import type { GeminiAnalysisResult } from "@/types/candidate";
import { toast } from "sonner";

interface ResumeUploaderEnhancedProps {
  onAnalysisComplete?: (analysis: GeminiAnalysisResult) => void;
}

export function ResumeUploaderEnhanced({ onAnalysisComplete }: ResumeUploaderEnhancedProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");

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
      await handleFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      toast.error("Please upload a PDF or TXT file");
      return;
    }

    setUploading(true);
    setUploadStatus("idle");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const result = await uploadResume(formData);

      if (result.success && result.data) {
        setUploadStatus("success");
        toast.success(`✅ Resume analyzed! GCC Readiness Score: ${result.data.gcc_readiness.score}/100`);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result.data);
        }
      } else {
        setUploadStatus("error");
        toast.error(result.error || "Failed to analyze resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      toast.error("An error occurred while processing the resume");
    } finally {
      setUploading(false);
    }
  };

  const resetUploader = () => {
    setUploadStatus("idle");
    setFileName("");
  };

  return (
    <Card className="border-dashed border-2 hover:border-indigo-500/50 transition-all duration-300 bg-slate-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UploadCloud className="h-5 w-5 text-indigo-400" />
          AI Resume Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            h-48 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer
            transition-all duration-300 border-2 border-dashed
            ${
              isDragOver
                ? "bg-indigo-500/20 border-indigo-500 scale-105"
                : "bg-slate-800/20 border-slate-700 hover:bg-slate-800/30 hover:border-indigo-500/50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("resume-input")?.click()}
        >
          <input
            id="resume-input"
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={handleFileInput}
          />

          {uploading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
              <p className="text-sm font-medium text-slate-200">Extracting Technical DNA...</p>
              <p className="text-xs text-slate-400 mt-1">Gemini AI is analyzing the resume</p>
            </div>
          ) : uploadStatus === "success" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mb-4 animate-bounce" />
              <p className="text-sm font-semibold text-slate-200">{fileName}</p>
              <p className="text-xs text-emerald-400 mt-2">✓ Successfully analyzed</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-indigo-400 hover:text-indigo-300"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUploader();
                }}
              >
                Upload Another Resume
              </Button>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-sm font-semibold text-slate-200">Analysis Failed</p>
              <p className="text-xs text-red-400 mt-2">Please try again</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-indigo-400 hover:text-indigo-300"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUploader();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-slate-500 mb-4" />
              <p className="text-sm font-medium text-slate-200">
                Drag & Drop Resume Here
              </p>
              <p className="text-xs text-slate-400 mt-2">or click to browse</p>
              <div className="mt-4 flex gap-2">
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">
                  .PDF
                </span>
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">
                  .TXT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Powered by Gemini 1.5 Flash
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-400 text-center">
            AI extracts: Technical DNA • GCC Readiness • Flight Risk • Skill Gaps
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
