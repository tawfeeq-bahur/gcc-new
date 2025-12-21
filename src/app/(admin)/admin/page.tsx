"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  Plus,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Send,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
  LogOut,
  CheckCircle2,
  Mail,
  Calendar,
  Award,
  ClipboardList,
} from "lucide-react";

// Mock jobs
const mockJobs = [
  {
    id: "job1",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Bangalore, India",
    work_mode: "Hybrid",
    job_type: "Full-time",
    salary_min: 2500000,
    salary_max: 4000000,
    experience_min: 5,
    experience_max: 10,
    skills_required: ["React", "Node.js", "AWS", "PostgreSQL", "TypeScript"],
    description: "We are looking for a Senior Full Stack Engineer...",
    status: "active",
    applications_count: 45,
    posted_at: "2024-12-20",
  },
  {
    id: "job2",
    title: "Principal Data Scientist",
    department: "Data Science",
    location: "Mumbai, India",
    work_mode: "Remote",
    job_type: "Full-time",
    salary_min: 3500000,
    salary_max: 5500000,
    experience_min: 8,
    experience_max: 15,
    skills_required: ["Python", "Machine Learning", "TensorFlow", "SQL", "Spark"],
    description: "Lead our data science initiatives...",
    status: "active",
    applications_count: 89,
    posted_at: "2024-12-15",
  },
];

// Mock candidates with applications
const mockCandidates = [
  {
    id: "cand1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    position: "Senior Full Stack Engineer",
    gcc_score: 85,
    status: "selected",
    applied_at: "2024-12-20",
    experience: "7 years",
  },
  {
    id: "cand2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    position: "Principal Data Scientist",
    gcc_score: 92,
    status: "interview_completed",
    applied_at: "2024-12-18",
    experience: "10 years",
  },
  {
    id: "cand3",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    position: "DevOps Lead",
    gcc_score: 78,
    status: "under_review",
    applied_at: "2024-12-22",
    experience: "8 years",
  },
  {
    id: "cand4",
    name: "Sneha Gupta",
    email: "sneha.gupta@email.com",
    position: "Frontend Architect",
    gcc_score: 88,
    status: "selected",
    applied_at: "2024-12-15",
    experience: "9 years",
  },
];

function formatSalary(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
}

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
    case "active":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "closed":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
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

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "candidates" | "offers">("overview");
  const [jobs, setJobs] = useState(mockJobs);
  const [candidates] = useState(mockCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null);
  const [creating, setCreating] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);

  // Job form state
  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    location: "",
    work_mode: "Hybrid",
    job_type: "Full-time",
    salary_min: "",
    salary_max: "",
    experience_min: "",
    experience_max: "",
    skills: "",
    description: "",
  });

  // Offer form state
  const [offer, setOffer] = useState({
    salary: "",
    joining_date: "",
    designation: "",
    benefits: "",
    message: "",
  });

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalApplications: jobs.reduce((sum, j) => sum + j.applications_count, 0),
    selected: candidates.filter((c) => c.status === "selected").length,
    avgGccScore: Math.round(candidates.reduce((sum, c) => sum + c.gcc_score, 0) / candidates.length),
  };

  const handleCreateJob = async () => {
    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const job = {
      id: `job-${Date.now()}`,
      ...newJob,
      salary_min: parseInt(newJob.salary_min) || 0,
      salary_max: parseInt(newJob.salary_max) || 0,
      experience_min: parseInt(newJob.experience_min) || 0,
      experience_max: parseInt(newJob.experience_max) || 0,
      skills_required: newJob.skills.split(",").map((s) => s.trim()),
      status: "active",
      applications_count: 0,
      posted_at: new Date().toISOString().split("T")[0],
    };

    setJobs([job, ...jobs]);
    toast.success("Job posted successfully!", {
      description: `${newJob.title} is now live and accepting applications.`,
    });

    setCreating(false);
    setShowCreateJobModal(false);
    setNewJob({
      title: "",
      department: "",
      location: "",
      work_mode: "Hybrid",
      job_type: "Full-time",
      salary_min: "",
      salary_max: "",
      experience_min: "",
      experience_max: "",
      skills: "",
      description: "",
    });
  };

  const handleSendOffer = async () => {
    if (!selectedCandidate) return;

    setSendingOffer(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Offer letter sent!", {
      description: `Offer sent to ${selectedCandidate.name} at ${selectedCandidate.email}`,
    });

    setSendingOffer(false);
    setShowOfferModal(false);
    setSelectedCandidate(null);
    setOffer({
      salary: "",
      joining_date: "",
      designation: "",
      benefits: "",
      message: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-rose-400 animate-spin" />
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
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <span className="font-bold text-rose-400">G</span>
                </div>
                <span className="text-xl font-bold text-white">GCC-Pulse</span>
              </Link>
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                Admin Dashboard
              </Badge>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="h-4 w-4 inline-block mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "jobs"
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Briefcase className="h-4 w-4 inline-block mr-2" />
                Jobs
              </button>
              <button
                onClick={() => setActiveTab("candidates")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "candidates"
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                Candidates
              </button>
              <button
                onClick={() => setActiveTab("offers")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "offers"
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Award className="h-4 w-4 inline-block mr-2" />
                Offers
              </button>
              <Link
                href="/admin/assessments"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ClipboardList className="h-4 w-4 inline-block mr-2" />
                Assessments
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-white">{profile?.full_name || user?.email}</div>
                <div className="text-xs text-slate-400">Recruiting Admin</div>
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
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
                      <div className="text-sm text-slate-400">Total Jobs</div>
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
                      <div className="text-2xl font-bold text-white">{stats.activeJobs}</div>
                      <div className="text-sm text-slate-400">Active Jobs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.totalApplications}</div>
                      <div className="text-sm text-slate-400">Applications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.selected}</div>
                      <div className="text-sm text-slate-400">Selected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.avgGccScore}</div>
                      <div className="text-sm text-slate-400">Avg GCC Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-400" />
                    Recent Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{job.title}</div>
                          <div className="text-sm text-slate-400">
                            {job.applications_count} applications • Posted {job.posted_at}
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-400" />
                    Selected Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidates
                      .filter((c) => c.status === "selected")
                      .slice(0, 3)
                      .map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                              {candidate.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <div className="font-medium text-white">{candidate.name}</div>
                              <div className="text-sm text-slate-400">{candidate.position}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowOfferModal(true);
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Offer
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Job Postings</h2>
              <Button
                onClick={() => setShowCreateJobModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.experience_min}-{job.experience_max} years
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills_required.slice(0, 5).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{job.applications_count}</div>
                          <div className="text-sm text-slate-400">Applications</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Candidates</h2>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {candidates
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.position.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((candidate) => (
                  <Card key={candidate.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                            {candidate.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{candidate.name}</h3>
                            <div className="text-sm text-slate-400">{candidate.position}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>{candidate.email}</span>
                              <span>•</span>
                              <span>{candidate.experience}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={`text-xl font-bold ${
                              candidate.gcc_score >= 85 ? "text-emerald-400" :
                              candidate.gcc_score >= 70 ? "text-amber-400" : "text-red-400"
                            }`}>
                              {candidate.gcc_score}
                            </div>
                            <div className="text-xs text-slate-500">GCC Score</div>
                          </div>

                          <Badge className={getStatusColor(candidate.status)}>
                            {getStatusLabel(candidate.status)}
                          </Badge>

                          {candidate.status === "selected" && (
                            <Button
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-500 text-white"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowOfferModal(true);
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send Offer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Offer Letters</h2>
            </div>

            <div className="grid gap-4">
              {candidates
                .filter((c) => c.status === "selected")
                .map((candidate) => (
                  <Card key={candidate.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Award className="h-6 w-6 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{candidate.name}</h3>
                            <div className="text-sm text-slate-400">{candidate.position}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            Pending Offer
                          </Badge>
                          <Button
                            className="bg-rose-600 hover:bg-rose-500 text-white"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowOfferModal(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Create Offer Letter
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        <Dialog open={showCreateJobModal} onOpenChange={setShowCreateJobModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Post New Job</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Job Title</label>
                  <Input
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Department</label>
                  <Input
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Location</label>
                  <Input
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Work Mode</label>
                  <select
                    value={newJob.work_mode}
                    onChange={(e) => setNewJob({ ...newJob, work_mode: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Salary Range (INR)</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                      placeholder="Min"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Input
                      type="number"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                      placeholder="Max"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Experience (Years)</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={newJob.experience_min}
                      onChange={(e) => setNewJob({ ...newJob, experience_min: e.target.value })}
                      placeholder="Min"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Input
                      type="number"
                      value={newJob.experience_max}
                      onChange={(e) => setNewJob({ ...newJob, experience_max: e.target.value })}
                      placeholder="Max"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Required Skills (comma-separated)</label>
                <Input
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, AWS, TypeScript"
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Job Description</label>
                <Textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleCreateJob}
                disabled={creating || !newJob.title || !newJob.department}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Offer Modal */}
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                Send Offer Letter to {selectedCandidate?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Designation</label>
                <Input
                  value={offer.designation}
                  onChange={(e) => setOffer({ ...offer, designation: e.target.value })}
                  placeholder={selectedCandidate?.position || ""}
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Annual CTC (INR)</label>
                <Input
                  type="number"
                  value={offer.salary}
                  onChange={(e) => setOffer({ ...offer, salary: e.target.value })}
                  placeholder="e.g. 3500000"
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Proposed Joining Date</label>
                <Input
                  type="date"
                  value={offer.joining_date}
                  onChange={(e) => setOffer({ ...offer, joining_date: e.target.value })}
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Benefits</label>
                <Input
                  value={offer.benefits}
                  onChange={(e) => setOffer({ ...offer, benefits: e.target.value })}
                  placeholder="e.g. Health Insurance, Stock Options, WFH Allowance"
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Personal Message</label>
                <Textarea
                  value={offer.message}
                  onChange={(e) => setOffer({ ...offer, message: e.target.value })}
                  placeholder="Add a personal welcome message..."
                  className="mt-1 bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleSendOffer}
                disabled={sendingOffer || !offer.salary || !offer.joining_date}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white"
              >
                {sendingOffer ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Offer...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer Letter
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
