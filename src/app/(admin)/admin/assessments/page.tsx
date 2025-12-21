"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Star,
  User,
  Briefcase,
  Building2,
  Calendar,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Mock assessments data
const mockAssessments = [
  {
    id: "assess1",
    candidate: {
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
    },
    job: {
      title: "Senior Full Stack Engineer",
      company: "TechCorp GCC",
    },
    panelist: {
      name: "Dr. Anjali Mehta",
      email: "anjali.mehta@techcorp.com",
    },
    scores: {
      technical: 85,
      communication: 88,
      culturalFit: 90,
      problemSolving: 82,
      leadership: 78,
      average: 84.6,
    },
    feedback: {
      strengths: "Excellent problem-solving skills, strong technical foundation in React and Node.js, good communication abilities.",
      weaknesses: "Could improve on system design thinking, needs more experience with microservices architecture.",
      overall: "Strong candidate with solid technical skills and great cultural fit. Shows enthusiasm for learning and adapting to new technologies. Would be a valuable addition to the team.",
      recommendation: "Demonstrated strong technical competency and excellent team collaboration potential.",
    },
    decision: "recommend",
    submitted_at: "2024-12-22T10:30:00Z",
    interview_date: "2024-12-22",
    status: "completed",
  },
  {
    id: "assess2",
    candidate: {
      name: "Priya Patel",
      email: "priya.patel@email.com",
    },
    job: {
      title: "Principal Data Scientist",
      company: "FinServe India",
    },
    panelist: {
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@finserve.com",
    },
    scores: {
      technical: 95,
      communication: 92,
      culturalFit: 88,
      problemSolving: 94,
      leadership: 90,
      average: 91.8,
    },
    feedback: {
      strengths: "Exceptional ML expertise, published researcher, excellent leadership qualities, strategic thinking.",
      weaknesses: "Slightly overqualified for the role, may need more complex challenges to stay engaged.",
      overall: "Outstanding candidate with impressive credentials. Deep technical expertise combined with strong leadership potential. Could drive innovation in the data science team.",
      recommendation: "Highly recommended for hire. Exceptional technical skills and proven track record.",
    },
    decision: "recommend",
    submitted_at: "2024-12-21T15:45:00Z",
    interview_date: "2024-12-21",
    status: "completed",
  },
  {
    id: "assess3",
    candidate: {
      name: "Amit Singh",
      email: "amit.singh@email.com",
    },
    job: {
      title: "DevOps Lead",
      company: "HealthTech GCC",
    },
    panelist: {
      name: "Sarah Johnson",
      email: "sarah.j@healthtech.com",
    },
    scores: {
      technical: 72,
      communication: 68,
      culturalFit: 70,
      problemSolving: 75,
      leadership: 65,
      average: 70,
    },
    feedback: {
      strengths: "Good understanding of Docker and Kubernetes basics, willing to learn.",
      weaknesses: "Limited production experience with cloud infrastructure, communication needs improvement, lacks leadership experience.",
      overall: "Candidate shows potential but needs more hands-on experience. Technical skills are foundational but not yet at the level required for a lead position.",
      recommendation: "Does not meet current requirements for lead position. Consider for mid-level role or revisit after gaining more experience.",
    },
    decision: "reject",
    submitted_at: "2024-12-20T14:20:00Z",
    interview_date: "2024-12-20",
    status: "completed",
  },
];

export default function AssessmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "recommend" | "reject">("all");
  const [selectedAssessment, setSelectedAssessment] = useState<typeof mockAssessments[0] | null>(null);

  const filteredAssessments = mockAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.panelist.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || assessment.decision === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getDecisionBadge = (decision: string) => {
    if (decision === "recommend") {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Recommended
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <XCircle className="h-3 w-3 mr-1" />
        Not Recommended
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-indigo-400" />
                Assessment Reports
              </h1>
              <p className="text-slate-400 mt-1">View all candidate assessments and evaluations</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{mockAssessments.length}</div>
                  <div className="text-sm text-slate-400">Total Assessments</div>
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
                  <div className="text-2xl font-bold text-white">
                    {mockAssessments.filter((a) => a.decision === "recommend").length}
                  </div>
                  <div className="text-sm text-slate-400">Recommended</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {mockAssessments.filter((a) => a.decision === "reject").length}
                  </div>
                  <div className="text-sm text-slate-400">Not Recommended</div>
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
                  <div className="text-2xl font-bold text-white">
                    {(
                      mockAssessments.reduce((acc, a) => acc + a.scores.average, 0) /
                      mockAssessments.length
                    ).toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-400">Avg Score</div>
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
              placeholder="Search by candidate, job title, or panelist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={
                filterStatus === "all"
                  ? "bg-indigo-600"
                  : "border-slate-700 text-slate-300"
              }
            >
              All
            </Button>
            <Button
              variant={filterStatus === "recommend" ? "default" : "outline"}
              onClick={() => setFilterStatus("recommend")}
              className={
                filterStatus === "recommend"
                  ? "bg-emerald-600"
                  : "border-slate-700 text-slate-300"
              }
            >
              Recommended
            </Button>
            <Button
              variant={filterStatus === "reject" ? "default" : "outline"}
              onClick={() => setFilterStatus("reject")}
              className={
                filterStatus === "reject"
                  ? "bg-red-600"
                  : "border-slate-700 text-slate-300"
              }
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              onClick={() => setSelectedAssessment(assessment)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-white">
                        {assessment.candidate.name}
                      </h3>
                      {getDecisionBadge(assessment.decision)}
                      <div
                        className={`text-2xl font-bold ${getScoreColor(assessment.scores.average)}`}
                      >
                        {assessment.scores.average.toFixed(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Briefcase className="h-4 w-4" />
                        <span>{assessment.job.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Building2 className="h-4 w-4" />
                        <span>{assessment.job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>Panelist: {assessment.panelist.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(assessment.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Technical:</span>
                        <span className={`text-sm font-semibold ${getScoreColor(assessment.scores.technical)}`}>
                          {assessment.scores.technical}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Communication:</span>
                        <span className={`text-sm font-semibold ${getScoreColor(assessment.scores.communication)}`}>
                          {assessment.scores.communication}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cultural Fit:</span>
                        <span className={`text-sm font-semibold ${getScoreColor(assessment.scores.culturalFit)}`}>
                          {assessment.scores.culturalFit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Detail Modal */}
        {selectedAssessment && (
          <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white flex items-center gap-3">
                  <ClipboardList className="h-6 w-6 text-indigo-400" />
                  Assessment Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Candidate & Job Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-400">Candidate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-white">{selectedAssessment.candidate.name}</div>
                      <div className="text-sm text-slate-400">{selectedAssessment.candidate.email}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-400">Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-white">{selectedAssessment.job.title}</div>
                      <div className="text-sm text-slate-400">{selectedAssessment.job.company}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Panelist & Date */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-400">Evaluated By</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-white">{selectedAssessment.panelist.name}</div>
                      <div className="text-sm text-slate-400">{selectedAssessment.panelist.email}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-slate-400">Interview Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-white">
                        {new Date(selectedAssessment.interview_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-400">
                        Submitted: {new Date(selectedAssessment.submitted_at).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Scores */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400" />
                      Performance Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(selectedAssessment.scores)
                        .filter(([key]) => key !== "average")
                        .map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-slate-900/50 rounded-lg">
                            <div className={`text-3xl font-bold ${getScoreColor(value)}`}>{value}</div>
                            <div className="text-sm text-slate-400 mt-1 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-center">
                      <div className="text-4xl font-bold text-indigo-400">
                        {selectedAssessment.scores.average.toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">Average Score</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Detailed Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2">Key Strengths</h4>
                      <p className="text-slate-300">{selectedAssessment.feedback.strengths}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-400 mb-2">Areas for Improvement</h4>
                      <p className="text-slate-300">{selectedAssessment.feedback.weaknesses}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2">Overall Assessment</h4>
                      <p className="text-slate-300">{selectedAssessment.feedback.overall}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Recommendation Notes</h4>
                      <p className="text-slate-300">{selectedAssessment.feedback.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Decision */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Final Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-6">
                      {getDecisionBadge(selectedAssessment.decision)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
