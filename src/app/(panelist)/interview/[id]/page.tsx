"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Clock,
  User,
  Maximize2,
  Minimize2,
} from "lucide-react";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  console.log("Interview Page Loaded - ID:", interviewId);
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get user camera
  useEffect(() => {
    console.log("Setting up camera, isVideoOn:", isVideoOn);
    if (isVideoOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isAudioOn })
        .then((stream) => {
          console.log("Camera access granted");
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.error("Video play error:", err));
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          setCameraError(err.message);
          toast.error(`Camera access denied: ${err.message}`);
        });
    }
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, isAudioOn]);

  const handleEndInterview = () => {
    if (confirm("Are you sure you want to end this interview?")) {
      toast.success("Interview ended. Notes saved.");
      router.push("/panelist");
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
        toast.error("Fullscreen not supported");
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Show simple status if there's an error
  if (!interviewId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Interview ID</h1>
          <Button onClick={() => router.push("/panelist")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Camera Error Banner */}
      {cameraError && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2 flex items-center justify-center gap-2">
          <VideoOff className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-amber-300">
            Camera access denied. Please allow camera permissions to start the video interview.
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm text-white font-medium">Live Interview</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">{formatDuration(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Interview ID: {interviewId}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="text-slate-400 hover:text-white"
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          {/* Candidate Video (Main) */}
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden relative">
            {/* Placeholder for candidate - in real implementation this would connect to candidate's stream */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <User className="h-16 w-16 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-400 mb-2">Waiting for candidate...</h3>
                <p className="text-sm text-slate-500">The candidate has not joined yet</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2">
              <User className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-white font-medium">Rahul Sharma</span>
              <span className="text-xs text-amber-400">(Not Connected)</span>
            </div>
          </div>

          {/* Self Video (PIP) */}
          <div className="absolute bottom-24 right-10 w-64 h-48 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <VideoOff className="h-8 w-8 text-slate-600" />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-xs text-white">
              You
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={isVideoOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
                    isVideoOn 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:scale-110' 
                      : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-110'
                  }`}
                >
                  {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <span className="text-xs text-slate-400 font-medium">Video</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={isAudioOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
                    isAudioOn 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:scale-110' 
                      : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-110'
                  }`}
                >
                  {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <span className="text-xs text-slate-400 font-medium">Mic</span>
              </div>

              <div className="h-12 w-px bg-slate-700 mx-2"></div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowNotes(!showNotes)}
                  className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 border-2 ${
                    showNotes
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 hover:from-blue-600 hover:to-blue-700 hover:scale-110'
                      : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 hover:scale-110'
                  }`}
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
                <span className="text-xs text-slate-400 font-medium">Notes</span>
              </div>

              <div className="h-12 w-px bg-slate-700 mx-2"></div>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndInterview}
                  className="h-16 px-8 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 font-semibold"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Interview
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Interview Notes
              </h2>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the interview...

- Technical skills observed
- Communication clarity
- Problem-solving approach
- Cultural fit assessment
- Questions asked
- Areas of concern"
              className="flex-1 bg-slate-800/50 border-slate-700 text-white resize-none font-mono text-sm"
            />

            <div className="mt-4 space-y-2">
              <Button
                onClick={() => toast.success("Notes auto-saved")}
                className="w-full bg-indigo-600 hover:bg-indigo-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
              <Button
                onClick={() => router.push(`/assessment/${interviewId}`)}
                variant="outline"
                className="w-full border-slate-700 text-slate-300"
              >
                Go to Assessment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
