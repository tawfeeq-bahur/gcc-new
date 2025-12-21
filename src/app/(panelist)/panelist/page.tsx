"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Clock,
  Video,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  ArrowUpRight,
  Loader2,
  LogOut,
  MessageSquare,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

// Candidate type
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  experience: string;
  location: string;
  skills: string[];
  gcc_score: number;
  status: string;
  applied_at: string;
  interview_date: string | null;
  interview_time: string | null;
  resume_url: string;
  assessment_scores: {
    technical: number;
    communication: number;
    cultural_fit: number;
  } | null;
}

// Mock assigned candidates
const mockCandidates: Candidate[] = [
  {
    id: "cand1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    position: "Senior Full Stack Engineer",
    company: "TechCorp GCC",
    experience: "7 years",
    location: "Bangalore, India",
    skills: ["React", "Node.js", "AWS", "PostgreSQL", "TypeScript"],
    gcc_score: 85,
    status: "interview_scheduled",
    applied_at: "2024-12-20",
    interview_date: "2024-12-28",
    interview_time: "10:00 AM",
    resume_url: "#",
    assessment_scores: {
      technical: 82,
      communication: 88,
      cultural_fit: 90,
    },
  },
  {
    id: "cand2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 87654 32109",
    position: "Principal Data Scientist",
    company: "FinServe India",
    experience: "10 years",
    location: "Mumbai, India",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Spark"],
    gcc_score: 92,
    status: "shortlisted",
    applied_at: "2024-12-18",
    interview_date: null,
    interview_time: null,
    resume_url: "#",
    assessment_scores: null,
  },
  {
    id: "cand3",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 76543 21098",
    position: "DevOps Lead",
    company: "HealthTech GCC",
    experience: "8 years",
    location: "Hyderabad, India",
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"],
    gcc_score: 78,
    status: "under_review",
    applied_at: "2024-12-22",
    interview_date: null,
    interview_time: null,
    resume_url: "#",
    assessment_scores: null,
  },
  {
    id: "cand4",
    name: "Sneha Gupta",
    email: "sneha.gupta@email.com",
    phone: "+91 65432 10987",
    position: "Frontend Architect",
    company: "TechCorp GCC",
    experience: "9 years",
    location: "Pune, India",
    skills: ["React", "Next.js", "TypeScript", "System Design", "Micro-frontends"],
    gcc_score: 88,
    status: "interview_completed",
    applied_at: "2024-12-15",
    interview_date: "2024-12-23",
    interview_time: "2:00 PM",
    resume_url: "#",
    assessment_scores: {
      technical: 90,
      communication: 85,
      cultural_fit: 92,
    },
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "under_review":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "shortlisted":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "interview_scheduled":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "interview_completed":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "selected":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getGCCScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

export default function PanelistDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [candidates, setCandidates] = useState(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Schedule form state
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Assessment form state
  const [technicalScore, setTechnicalScore] = useState("");
  const [communicationScore, setCommunicationScore] = useState("");
  const [culturalFitScore, setCulturalFitScore] = useState("");
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [recommendation, setRecommendation] = useState<"hire" | "reject" | "hold">("hold");

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: candidates.length,
    pendingReview: candidates.filter((c) => c.status === "under_review").length,
    interviews: candidates.filter((c) => c.status === "interview_scheduled").length,
    completed: candidates.filter((c) => c.status === "interview_completed").length,
  };

  const handleScheduleInterview = async () => {
    if (!selectedCandidate || !scheduleDate || !scheduleTime) return;
    
    setScheduling(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              status: "interview_scheduled",
              interview_date: scheduleDate,
              interview_time: scheduleTime,
            }
          : c
      )
    );
    
    toast.success("Interview scheduled!", {
      description: `Interview with ${selectedCandidate.name} on ${scheduleDate} at ${scheduleTime}`,
    });
    
    setScheduling(false);
    setShowScheduleModal(false);
    setScheduleDate("");
    setScheduleTime("");
    setMeetingLink("");
  };

  const handleSubmitAssessment = async () => {
    if (!selectedCandidate) return;
    
    setSubmittingAssessment(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              status: recommendation === "hire" ? "selected" : recommendation === "reject" ? "rejected" : "interview_completed",
              assessment_scores: {
                technical: parseInt(technicalScore) || 0,
                communication: parseInt(communicationScore) || 0,
                cultural_fit: parseInt(culturalFitScore) || 0,
              },
            }
          : c
      )
    );
    
    toast.success("Assessment submitted!", {
      description: `Recommendation for ${selectedCandidate.name}: ${recommendation.toUpperCase()}`,
    });
    
    setSubmittingAssessment(false);
    setShowAssessmentModal(false);
    setTechnicalScore("");
    setCommunicationScore("");
    setCulturalFitScore("");
    setAssessmentNotes("");
    setRecommendation("hold");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="font-bold text-purple-400">G</span>
                </div>
                <span className="text-xl font-bold text-white">GCC-Pulse</span>
              </Link>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Interview Panelist
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-white">{profile?.full_name || user?.email}</div>
                  <div className="text-xs text-slate-400">Panelist</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-slate-400 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-slate-400">Assigned Candidates</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.pendingReview}</div>
                  <div className="text-sm text-slate-400">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Video className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.interviews}</div>
                  <div className="text-sm text-slate-400">Upcoming Interviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.completed}</div>
                  <div className="text-sm text-slate-400">Assessments Done</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Search candidates by name, position, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interview_completed">Interview Completed</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCandidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedCandidate(candidate)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {candidate.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{candidate.name}</h3>
                      <div className="text-sm text-slate-400">{candidate.position}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGCCScoreColor(candidate.gcc_score)}`}>
                      {candidate.gcc_score}
                    </div>
                    <div className="text-xs text-slate-500">GCC Score</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-slate-800/50 text-slate-300 border-slate-700 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {candidate.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {candidate.location}
                    </span>
                  </div>
                  <Badge className={getStatusColor(candidate.status)}>
                    {getStatusLabel(candidate.status)}
                  </Badge>
                </div>

                {candidate.interview_date && (
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      Interview: {candidate.interview_date} at {candidate.interview_time}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Candidate Profile</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedCandidate.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{selectedCandidate.name}</h2>
                    <div className="text-slate-400">{selectedCandidate.position}</div>
                    <Badge className={getStatusColor(selectedCandidate.status) + " mt-2"}>
                      {getStatusLabel(selectedCandidate.status)}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getGCCScoreColor(selectedCandidate.gcc_score)}`}>
                      {selectedCandidate.gcc_score}
                    </div>
                    <div className="text-sm text-slate-400">GCC Score</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-500" />
                    {selectedCandidate.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {selectedCandidate.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    {selectedCandidate.experience}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {selectedCandidate.location}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Assessment Scores (if available) */}
                {selectedCandidate.assessment_scores && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Assessment Scores</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {selectedCandidate.assessment_scores.technical}
                        </div>
                        <div className="text-xs text-slate-400">Technical</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {selectedCandidate.assessment_scores.communication}
                        </div>
                        <div className="text-xs text-slate-400">Communication</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {selectedCandidate.assessment_scores.cultural_fit}
                        </div>
                        <div className="text-xs text-slate-400">Cultural Fit</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                    asChild
                  >
                    <a href={selectedCandidate.resume_url} target="_blank">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </a>
                  </Button>
                  
                  {(selectedCandidate.status === "shortlisted" || selectedCandidate.status === "under_review") && (
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  )}
                  
                  {selectedCandidate.status === "interview_scheduled" && (
                    <Button
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                      onClick={() => window.open(`/interview/${selectedCandidate.id}`, '_blank', 'noopener,noreferrer')}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Interview
                    </Button>
                  )}
                  
                  {(selectedCandidate.status === "interview_scheduled" || selectedCandidate.status === "interview_completed") && (
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                      asChild
                    >
                      <a href={`/assessment/${selectedCandidate.id}`}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Submit Assessment
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Schedule Interview Modal */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Schedule Interview</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Interview Date</label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Interview Time</label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Meeting Link (optional)</label>
                <Input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <Button
                onClick={handleScheduleInterview}
                disabled={scheduling || !scheduleDate || !scheduleTime}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              >
                {scheduling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assessment Modal */}
        <Dialog open={showAssessmentModal} onOpenChange={setShowAssessmentModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Submit Assessment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Technical (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={technicalScore}
                    onChange={(e) => setTechnicalScore(e.target.value)}
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Communication</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={communicationScore}
                    onChange={(e) => setCommunicationScore(e.target.value)}
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Cultural Fit</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={culturalFitScore}
                    onChange={(e) => setCulturalFitScore(e.target.value)}
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Notes</label>
                <Textarea
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  placeholder="Add your assessment notes..."
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Recommendation</label>
                <div className="flex gap-3">
                  <Button
                    variant={recommendation === "hire" ? "default" : "outline"}
                    onClick={() => setRecommendation("hire")}
                    className={recommendation === "hire" 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white flex-1"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800 flex-1"
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Hire
                  </Button>
                  <Button
                    variant={recommendation === "hold" ? "default" : "outline"}
                    onClick={() => setRecommendation("hold")}
                    className={recommendation === "hold"
                      ? "bg-amber-600 hover:bg-amber-500 text-white flex-1"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800 flex-1"
                    }
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Hold
                  </Button>
                  <Button
                    variant={recommendation === "reject" ? "default" : "outline"}
                    onClick={() => setRecommendation("reject")}
                    className={recommendation === "reject"
                      ? "bg-red-600 hover:bg-red-500 text-white flex-1"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800 flex-1"
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSubmitAssessment}
                disabled={submittingAssessment || !technicalScore || !communicationScore || !culturalFitScore}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {submittingAssessment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
