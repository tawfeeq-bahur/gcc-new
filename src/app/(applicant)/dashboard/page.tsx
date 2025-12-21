"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Building2,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  User,
  LogOut,
  Upload,
  CheckCircle,
  AlertCircle,
  Phone,
  Linkedin,
  GraduationCap,
  Target,
} from "lucide-react";

// Mock jobs data
const mockJobs = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    company: "TechCorp GCC",
    location: "Bangalore, India",
    job_type: "Full-time",
    work_mode: "Hybrid",
    salary_min: 2500000,
    salary_max: 4000000,
    experience_min: 5,
    experience_max: 10,
    skills_required: ["React", "Node.js", "AWS", "PostgreSQL", "TypeScript"],
    posted_at: "2 days ago",
    applications_count: 45,
  },
  {
    id: "2",
    title: "Principal Data Scientist",
    company: "FinServe India",
    location: "Mumbai, India",
    job_type: "Full-time",
    work_mode: "Remote",
    salary_min: 3500000,
    salary_max: 5500000,
    experience_min: 8,
    experience_max: 15,
    skills_required: ["Python", "Machine Learning", "TensorFlow", "SQL", "Spark"],
    posted_at: "1 week ago",
    applications_count: 89,
  },
  {
    id: "3",
    title: "DevOps Lead",
    company: "HealthTech GCC",
    location: "Hyderabad, India",
    job_type: "Full-time",
    work_mode: "Onsite",
    salary_min: 2800000,
    salary_max: 4500000,
    experience_min: 6,
    experience_max: 12,
    skills_required: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"],
    posted_at: "3 days ago",
    applications_count: 32,
  },
];

// Mock applications
const mockApplications = [
  { id: "app1", job_title: "Senior Full Stack Engineer", company: "TechCorp GCC", status: "under_review", applied_at: "2024-12-20", gcc_score: 85 },
];

function formatSalary(min: number, max: number): string {
  const formatNum = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString()}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    under_review: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    shortlisted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    interview_scheduled: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    selected: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status] || colors.pending;
}

function getStatusLabel(status: string): string {
  return status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Profile Completion Component
function ProfileCompletion({ onComplete }: { onComplete: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    linkedin_url: "",
    experience_years: 0,
    current_company: "",
    current_job_title: "",
    expected_salary: "",
    notice_period: "",
    skills: "",
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        headline: profile.headline || "",
        summary: profile.summary || "",
        linkedin_url: profile.linkedin_url || "",
        experience_years: profile.experience_years || 0,
        current_company: profile.current_company || "",
        current_job_title: profile.current_job_title || "",
        expected_salary: profile.expected_salary || "",
        notice_period: profile.notice_period || "",
        skills: profile.skills?.join(", ") || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      setResumeFile(file);
      toast.success("Resume selected: " + file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - starting validation...");
    
    // Validation
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.headline.trim()) {
      toast.error("Professional headline is required");
      return;
    }
    if (!resumeFile && !profile?.resume_url) {
      toast.error("Please upload your resume");
      return;
    }

    setSaving(true);
    console.log("Starting profile save...");
    toast.info("Saving your profile...");

    // Add timeout to prevent hanging forever
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out. Please check your database connection.")), 15000)
    );

    try {
      // Upload resume if provided
      let resume_url = profile?.resume_url;
      if (resumeFile) {
        const fileName = `${user?.id}/${Date.now()}-${resumeFile.name}`;
        
        // Try to upload to storage - use 'resumes' bucket
        console.log("Uploading resume...", fileName);
        try {
          const uploadResult = await Promise.race([
            supabase.storage.from("resumes").upload(fileName, resumeFile, {
              cacheControl: "3600",
              upsert: true,
            }),
            timeoutPromise
          ]) as { error: Error | null; data: { path: string } | null };
          
          if (uploadResult.error) {
            console.error("Upload error:", uploadResult.error);
            // Continue without resume URL - don't block profile save
          } else if (uploadResult.data) {
            const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
            resume_url = urlData.publicUrl;
            console.log("Resume uploaded:", resume_url);
          }
        } catch (uploadErr) {
          console.error("Resume upload failed:", uploadErr);
          // Continue without resume
        }
      }

      console.log("Saving profile for user:", user?.id);

      // Try simple update first (user already has profile from signup trigger)
      const updatePromise = supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location || null,
          headline: formData.headline,
          summary: formData.summary || null,
          linkedin_url: formData.linkedin_url || null,
          experience_years: formData.experience_years ? parseInt(String(formData.experience_years)) : null,
          current_company: formData.current_company || null,
          current_job_title: formData.current_job_title || null,
          expected_salary: formData.expected_salary || null,
          notice_period: formData.notice_period || null,
          skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
          resume_url: resume_url || null,
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      const updateResult = await Promise.race([updatePromise, timeoutPromise]) as { error: Error | null };
      const updateError = updateResult.error;

      if (updateError) {
        console.error("Update error:", updateError);
        
        // If update fails, try insert (profile might not exist)
        if ((updateError as any).code === "PGRST116" || updateError.message?.includes("0 rows")) {
          console.log("Profile not found, inserting...");
          const insertPromise = supabase
            .from("profiles")
            .insert({
              id: user?.id,
              email: user?.email || "",
              full_name: formData.full_name,
              phone: formData.phone,
              location: formData.location || null,
              headline: formData.headline,
              summary: formData.summary || null,
              linkedin_url: formData.linkedin_url || null,
              experience_years: formData.experience_years ? parseInt(String(formData.experience_years)) : null,
              current_company: formData.current_company || null,
              current_job_title: formData.current_job_title || null,
              expected_salary: formData.expected_salary || null,
              notice_period: formData.notice_period || null,
              skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
              resume_url: resume_url || null,
              is_profile_complete: true,
              role: "applicant",
            });

          const insertResult = await Promise.race([insertPromise, timeoutPromise]) as { error: Error | null };
          
          if (insertResult.error) {
            console.error("Insert error:", insertResult.error);
            toast.error(`Failed to save: ${insertResult.error.message}`);
            setSaving(false);
            return;
          }
        } else {
          toast.error(`Failed to save: ${updateError.message || "Database error - please run the SQL fix in Supabase"}`);
          setSaving(false);
          return;
        }
      }
      
      console.log("Profile saved successfully!");

      toast.success("Profile completed successfully!");
      setSaving(false);
      await refreshProfile();
      onComplete();
    } catch (err: any) {
      console.error("Error:", err);
      const errorMessage = err?.message || "An error occurred";
      if (errorMessage.includes("timed out")) {
        toast.error("Request timed out. Please run the SQL fix in Supabase to fix RLS policies.");
      } else {
        toast.error(errorMessage);
      }
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <User className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400">Fill in your details to start applying for jobs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Full Name *</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Phone *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    required
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Bangalore, India"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">LinkedIn URL</label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Professional Headline *</label>
                <Input
                  value={formData.headline}
                  onChange={(e) => handleChange("headline", e.target.value)}
                  placeholder="Senior Software Engineer | 8+ Years Experience | React, Node.js, AWS"
                  required
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Professional Summary</label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  placeholder="Brief summary of your experience and expertise..."
                  rows={3}
                  className="bg-slate-800/50 border-slate-700 text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Current Company</label>
                  <Input
                    value={formData.current_company}
                    onChange={(e) => handleChange("current_company", e.target.value)}
                    placeholder="Current or last company"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Current Role</label>
                  <Input
                    value={formData.current_job_title}
                    onChange={(e) => handleChange("current_job_title", e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Total Experience (Years)</label>
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => handleChange("experience_years", parseInt(e.target.value) || 0)}
                    placeholder="5"
                    min={0}
                    max={50}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Notice Period</label>
                  <Input
                    value={formData.notice_period}
                    onChange={(e) => handleChange("notice_period", e.target.value)}
                    placeholder="30 days, Immediate, etc."
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Expected Salary</label>
                <Input
                  value={formData.expected_salary}
                  onChange={(e) => handleChange("expected_salary", e.target.value)}
                  placeholder="₹25-30 LPA"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Skills (comma separated)</label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  placeholder="React, Node.js, TypeScript, AWS, PostgreSQL, Docker..."
                  rows={2}
                  className="bg-slate-800/50 border-slate-700 text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Resume *
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload your resume in PDF format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  resumeFile
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50"
                }`}
              >
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-slate-400">Click to change</p>
                    </div>
                  </div>
                ) : profile?.resume_url ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">Resume uploaded</p>
                      <p className="text-sm text-slate-400">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium">Click to upload your resume</p>
                    <p className="text-sm text-slate-400 mt-1">PDF format, max 5MB</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Complete Profile & Start Applying
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function ApplicantDashboard() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "profile">("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState(mockApplications);
  const [jobs] = useState(mockJobs);
  const [applying, setApplying] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Check if profile is complete
  const isProfileComplete = profile?.is_profile_complete || 
    (profile?.full_name && profile?.phone && profile?.headline && profile?.resume_url);

  useEffect(() => {
    if (!loading && profile && !isProfileComplete) {
      setShowProfileForm(true);
    }
  }, [loading, profile, isProfileComplete]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills_required.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQuickApply = async (job: typeof mockJobs[0]) => {
    if (!isProfileComplete) {
      toast.error("Please complete your profile before applying");
      setShowProfileForm(true);
      return;
    }

    setApplying(job.id);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newApp = {
      id: `app-${Date.now()}`,
      job_title: job.title,
      company: job.company,
      status: "pending",
      applied_at: new Date().toISOString().split("T")[0],
      gcc_score: profile?.gcc_score || 0,
    };
    
    setApplications([newApp, ...applications]);
    toast.success(`Application submitted for ${job.title}!`, {
      description: "Your profile has been auto-filled. Track status in 'My Applications'.",
    });
    
    setApplying(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // Show profile completion form if needed
  if (showProfileForm) {
    return (
      <ProfileCompletion
        onComplete={() => {
          setShowProfileForm(false);
          refreshProfile();
        }}
      />
    );
  }

  // Get display name (name instead of email)
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <span className="font-bold text-indigo-400">G</span>
                </div>
                <span className="text-xl font-bold text-white">GCC-Pulse</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1 ml-8">
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "jobs"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Briefcase className="h-4 w-4 inline-block mr-2" />
                  Browse Jobs
                </button>
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "applications"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileText className="h-4 w-4 inline-block mr-2" />
                  My Applications
                  {applications.length > 0 && (
                    <Badge className="ml-2 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {applications.length}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <User className="h-4 w-4 inline-block mr-2" />
                  My Profile
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {profile?.gcc_score && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">GCC Score</span>
                  <span className="text-lg font-bold text-emerald-400">{profile.gcc_score}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-400">{initials}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{displayName}</div>
                  <div className="text-xs text-slate-400">Job Seeker</div>
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
        {/* Profile Incomplete Warning */}
        {!isProfileComplete && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">Complete your profile</p>
                <p className="text-sm text-amber-400/70">Add your details and resume to apply for jobs</p>
              </div>
            </div>
            <Button
              onClick={() => setShowProfileForm(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 bg-slate-800/50 border-slate-700 text-white text-lg"
                />
              </div>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{filteredJobs.length} jobs found</span>
            </div>

            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-slate-300">{job.company}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center text-slate-400">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                            {job.job_type}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                            {job.work_mode}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                            {job.experience_min}-{job.experience_max} years
                          </Badge>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills_required.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-xs text-slate-500">{job.posted_at}</div>
                        
                        <Button
                          onClick={() => handleQuickApply(job)}
                          disabled={applying === job.id || !isProfileComplete}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700"
                        >
                          {applying === job.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Applying...
                            </>
                          ) : !isProfileComplete ? (
                            "Complete Profile First"
                          ) : (
                            <>
                              Quick Apply
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                        
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="h-3 w-3" />
                          {job.applications_count} applicants
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Applications</h2>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {applications.length} applications
              </Badge>
            </div>

            {applications.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No applications yet</h3>
                  <p className="text-slate-500 mb-4">Start applying to jobs to see them here</p>
                  <Button onClick={() => setActiveTab("jobs")} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{app.job_title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{app.company}</span>
                              <span>•</span>
                              <span>Applied {app.applied_at}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {app.gcc_score ? (
                            <div className="text-center">
                              <div className="text-xs text-slate-500">GCC Score</div>
                              <div className="text-lg font-bold text-emerald-400">{app.gcc_score}</div>
                            </div>
                          ) : null}
                          <Badge className={getStatusColor(app.status)}>{getStatusLabel(app.status)}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Profile</h2>
              <Button onClick={() => setShowProfileForm(true)} variant="outline" className="border-slate-700 text-slate-300">
                Edit Profile
              </Button>
            </div>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-400">{initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{displayName}</h3>
                    <p className="text-slate-400">{profile?.headline || "No headline set"}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                      {profile?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </span>
                      )}
                      {profile?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {profile.phone}
                        </span>
                      )}
                      {profile?.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                  {profile?.gcc_score && (
                    <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-sm text-emerald-400">GCC Score</div>
                      <div className="text-3xl font-bold text-emerald-400">{profile.gcc_score}</div>
                    </div>
                  )}
                </div>

                {profile?.summary && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Summary</h4>
                    <p className="text-slate-400">{profile.summary}</p>
                  </div>
                )}

                {profile?.skills && profile.skills.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => (
                        <Badge key={skill} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Experience</div>
                    <div className="text-white font-medium">{profile?.experience_years || 0} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Current Role</div>
                    <div className="text-white font-medium">{profile?.current_job_title || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Expected Salary</div>
                    <div className="text-white font-medium">{profile?.expected_salary || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Notice Period</div>
                    <div className="text-white font-medium">{profile?.notice_period || "Not set"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
