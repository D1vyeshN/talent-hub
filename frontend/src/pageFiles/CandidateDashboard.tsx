"use client"
import { useState, useEffect } from "react";
import {
  Bookmark, Briefcase, CheckCircle, ChevronRight, Edit3,
  Eye, FileText, GraduationCap, MapPin, MessageCircle, Plus, Star, Trash2,
  TrendingUp, Upload
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { CANDIDATE_ANALYTICS } from "@/lib/mockData";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { timeAgo, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCandidateProfile, fetchApplications, uploadResume, fetchSavedJobs,
  updateProfile, addSkill, removeSkill, uploadAvatar, addEducation, removeEducation, addWorkExperience, removeWorkExperience
} from "@/store/slices/candidateSlice";

export default function CandidateDashboard() {
  const dispatch = useAppDispatch();
  const { profile, applications, savedJobs, isLoading, error } = useAppSelector((state) => state.candidate);
  const [uploading, setUploading] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await dispatch(uploadResume(file)).unwrap();
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCandidateProfile());
    dispatch(fetchApplications({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (profile?.savedJobs && profile.savedJobs.length > 0) {
      dispatch(fetchSavedJobs(profile.savedJobs));
    }
  }, [profile?.savedJobs, dispatch]);

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-red-500">Error: {error}</div>
  //     </div>
  //   );
  // }

  const candidate = profile;
  const myApplications = applications.slice(0, 3);
  const savedJobsCount = candidate?.savedJobs?.length || 0;

  // Update STAT_CARDS with real data
  const statCardsData = [
    { title: "Applications Sent", value: applications.length, icon: Briefcase, color: "bg-blue-50", iconColor: "text-blue-600", change: "+2 this week" },
    { title: "Profile Views", value: 0, icon: Eye, color: "bg-purple-50", iconColor: "text-purple-600", change: "+12 this week" },
    { title: "Saved Jobs", value: savedJobsCount, icon: Bookmark, color: "bg-amber-50", iconColor: "text-amber-600", change: "2 expiring soon" },
    { title: "Interviews", value: applications.filter(a => a.status === "interview").length, icon: MessageCircle, color: "bg-green-50", iconColor: "text-green-600", change: "1 scheduled" },
  ];

  const profileSections = [
    { label: "Basic Info", done: !!candidate?.name },
    { label: "Work Experience", done: !!candidate?.experience && candidate.experience > 0 },
    { label: "Education", done: !!candidate?.education && candidate.education.length > 0 },
    { label: "Skills", done: !!candidate?.skills && candidate.skills.length > 0 },
    { label: "Resume Upload", done: !!candidate?.resumeUrl },
    { label: "Profile Photo", done: !!candidate?.avatar },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <OverviewTab redirect={redirect} myApplications={myApplications} />,
    },
    {
      id: "applications",
      label: "Applications",
      icon: <Briefcase className="w-4 h-4" />,
      badge: applications.length,
      content: <ApplicationsTab redirect={redirect} applications={myApplications} />,
    },
    {
      id: "saved",
      label: "Saved Jobs",
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedJobs.length,
      content: <SavedJobsTab redirect={redirect} savedJobs={savedJobs} />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <Star className="w-4 h-4" />,
      content: <ProfileTab profile={profile} />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Edit3 className="w-4 h-4" />,
      content: <SettingsTab profile={profile} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Welcome Header ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {candidate?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your job search today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── Left Sidebar ───────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Profile Card */}
            <Card>
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar src={candidate?.avatar} name={candidate?.name || "User"} size="xl" />
                  {/* <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-blue-700 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button> */}
                </div>
                <h2 className="text-base font-semibold text-gray-900 mt-3">{candidate?.name || "User"}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{candidate?.headline || ""}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {candidate?.location || "Not specified"}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                  <span className={cn(
                    "text-xs font-bold",
                    (candidate?.profileCompletion || 0) >= 80 ? "text-green-600" : "text-amber-600"
                  )}>
                    {candidate?.profileCompletion || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={candidate?.profileCompletion || 0}
                  color={(candidate?.profileCompletion || 0) >= 80 ? "green" : "amber"}
                />
                <div className="mt-3 space-y-1.5">
                  {profileSections.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className={cn("text-xs", s.done ? "text-gray-600" : "text-gray-400")}>{s.label}</span>
                      {s.done
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                      }
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="sm" fullWidth className="mt-4" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => redirect("settings")}>
                Edit Profile
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    className="hidden"
                    id="resume-upload"
                  />
                  <button
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      <span>{uploading ? "Uploading..." : "Upload Resume"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
                {[
                  { label: "Browse Jobs", icon: Briefcase, onClick: () => redirect("jobs") },
                  { label: "View Messages", icon: MessageCircle, onClick: () => redirect("messages") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <action.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      {action.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Main Content ───────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCardsData.map((stat) => (
                <Card key={stat.title} padding="sm" className="group hover:shadow-md transition-shadow">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                    <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5">{stat.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Tabs tabs={tabs} defaultTab="overview" variant="underline" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Sub-components ────────────────────────────────────────────────────────

function OverviewTab({ redirect: _redirect, myApplications }: {
  redirect: (page: string) => void;
  myApplications: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Application Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Application Activity</CardTitle>
          <button className="text-xs text-blue-600" onClick={() => _redirect("jobs")}>Browse jobs →</button>
        </CardHeader>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CANDIDATE_ANALYTICS.profileViews}>
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#viewGrad)" strokeWidth={2} name="Profile Views" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <span className="text-xs text-gray-500">{myApplications.length} total</span>
        </CardHeader>
        <div className="space-y-3">
          {myApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500text-sm">No applications yet</div>
          ) : (
            myApplications.map((app: any) => {
              const config = APPLICATION_STATUS_CONFIG[app.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
              return (
                <div key={app._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {app.job?.company?.logo || "🏢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.job?.title || "Unknown Job"}</p>
                    <p className="text-xs text-gray-500">{app.job?.company?.name || "Unknown Company"} · Applied {timeAgo(app.appliedAt)}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", config.color, config.bg)}>
                    {config.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

function ApplicationsTab({ redirect: _redirect, applications }: {
  redirect: (page: string) => void;
  applications: any[];
}) {
  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No applications yet"
          description="Start applying to jobs that match your skills and experience."
          action={<Button variant="primary" onClick={() => _redirect("jobs")}>Browse Jobs</Button>}
        />
      ) : (
        applications.map((app: any) => {
          const config = APPLICATION_STATUS_CONFIG[app.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
          return (
            <Card key={app._id} hoverable>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {app.job?.company?.logo || "🏢"}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{app.job?.title || "Unknown Job"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{app.job?.company?.name || "Unknown Company"} · {app.job?.location || "Unknown Location"}</p>
                    </div>
                    <span className={cn("text-xs font-medium px-3 py-1 rounded-full", config.color, config.bg)}>
                      {config.label}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <div className="flex items-center gap-1 mt-4">
                    {(["applied", "screening", "interview", "offer", "hired"] as const).map((step, i) => {
                      const steps = ["applied", "screening", "interview", "offer", "hired"];
                      const currentIdx = steps.indexOf(app.status);
                      const stepIdx = steps.indexOf(step);
                      const isDone = stepIdx <= currentIdx && app.status !== "rejected";
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={cn(
                            "w-full h-1.5 rounded-full",
                            isDone ? "bg-blue-500" : "bg-gray-100"
                          )} />
                          {i < 4 && null}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Applied</span>
                    <span>Screening</span>
                    <span>Interview</span>
                    <span>Offer</span>
                    <span>Hired</span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400">Updated {timeAgo(app.updatedAt)}</p>
                    <Button variant="ghost" size="xs" onClick={() => _redirect("job-detail")}>
                      View Details →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

function SavedJobsTab({ redirect: _redirect, savedJobs }: {
  redirect: (page: string) => void;
  savedJobs: any[];
}) {
  return (
    <div className="space-y-4">
      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No saved jobs"
          description="Bookmark interesting jobs to apply later."
          action={<Button variant="primary" onClick={() => _redirect("jobs")}>Browse Jobs</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {savedJobs.map((job: any) => (
            <Card key={job._id} padding="md" hoverable className="border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{job.company?.name || "Company"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.type}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.level}</span>
                    <span className="text-xs text-gray-400">📍 {job.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400">Posted {timeAgo(job.createdAt)}</p>
                    <Button variant="ghost" size="xs" onClick={() => _redirect(`jobs/${job._id}`)}>
                      View Details →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Unified Profile Tab ───────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <ProfileInfoSection profile={profile} />
      <SkillsSection profile={profile} />
      <WorkExperienceSection profile={profile} />
      <EducationSection profile={profile} />
      <ResumeSection profile={profile} />
    </div>
  );
}

function ProfileInfoSection({ profile }: { profile: any }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    headline: profile?.headline || "",
    location: profile?.location || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await dispatch(uploadAvatar(file)).unwrap();
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar src={profile?.avatar} name={profile?.name || "User"} size="xl" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload-profile"
            />
            <button
              onClick={() => document.getElementById("avatar-upload-profile")?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{profile?.name || "User"}</h3>
            <p className="text-sm text-gray-500">{profile?.headline || ""}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Headline</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g., Senior Frontend Engineer | React • TypeScript"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Bengaluru, India"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} loading={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <p className="text-sm font-medium text-gray-900">{profile?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Headline</p>
              <p className="text-sm font-medium text-gray-900">{profile?.headline || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900">{profile?.location || "Not set"}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function SkillsSection({ profile }: { profile: any }) {
  const dispatch = useAppDispatch();
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await dispatch(addSkill(newSkill.trim())).unwrap();
      setNewSkill("");
    } catch (err) {
      console.error("Failed to add skill:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add skill";
      alert(errorMessage);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      await dispatch(removeSkill(skill)).unwrap();
    } catch (err) {
      console.error("Failed to remove skill:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to remove skill";
      alert(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((skill: string) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          )) || <span className="text-sm text-gray-400">No skills added yet. Use the field below to add your skills.</span>}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
          />
          <Button onClick={handleAddSkill} icon={<Plus className="w-4 h-4" />}>Add</Button>
        </div>
      </div>
    </Card>
  );
}

function WorkExperienceSection({ profile }: { profile: any }) {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleAdd = async () => {
    if (!formData.title || !formData.company || !formData.startDate) return;
    try {
      await dispatch(addWorkExperience(formData)).unwrap();
      setShowForm(false);
      setFormData({ title: "", company: "", startDate: "", endDate: "", description: "" });
      alert("Work experience added successfully!");
    } catch (err) {
      console.error("Failed to add work experience:", err);
      alert("Failed to add work experience");
    }
  };

  const handleRemove = async (_id: string) => {
    try {
      await dispatch(removeWorkExperience(_id)).unwrap();
    } catch (err) {
      console.error("Failed to remove work experience:", err);
      alert("Failed to remove work experience");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-blue-500" />
        <div className="flex items-center justify-between flex-1">
          <CardTitle>Work Experience</CardTitle>
          <Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add"}
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {showForm && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date (optional)"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <Button onClick={handleAdd}>Add Experience</Button>
          </div>
        )}
        {profile?.workExperience && profile.workExperience.length > 0 ? (
          profile.workExperience.map((exp: any, index: number) => (
            <div key={index} className="p-4 bg-gray-
50 rounded-lg flex items-start justify-between group">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500 mt-1">{exp.startDate} - {exp.endDate || "Present"}</p>
                {exp.description && <p className="text-xs text-gray-400 mt-1">{exp.description}</p>}
              </div>
              <button
                onClick={() => handleRemove(exp._id || index)}
                className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No work experience added yet
          </div>
        )}
      </div>
    </Card>
  );
}

function EducationSection({ profile }: { profile: any }) {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    year: "",
    field: "",
  });

  const handleAdd = async () => {
    if (!formData.degree || !formData.institution || !formData.year) return;
    try {
      await dispatch(addEducation(formData)).unwrap();
      setShowForm(false);
      setFormData({ degree: "", institution: "", year: "", field: "" });
      alert("Education added successfully!");
    } catch (err) {
      console.error("Failed to add education:", err);
      alert("Failed to add education");
    }
  };

  const handleRemove = async (educationId: string) => {
    try {
      await dispatch(removeEducation(educationId)).unwrap();
    } catch (err) {
      console.error("Failed to remove education:", err);
      alert("Failed to remove education");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-purple-500" />
        <div className="flex items-center justify-between flex-1">
          <CardTitle>Education</CardTitle>
          <Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add"}
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {showForm && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Degree (e.g., B.Tech Computer Science)"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Year (e.g., 2020)"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Field (optional)"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              />
            </div>
            <Button onClick={handleAdd}>Add Education</Button>
          </div>
        )}
        {profile?.education && profile.education.length > 0 ? (
          profile.education.map((edu: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between group">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-500 mt-1">{edu.year} {edu.field && `• ${edu.field}`}</p>
              </div>
              <button
                onClick={() => handleRemove(edu._id || index)}
                className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove education"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No education added yet
          </div>
        )}
      </div>
    </Card>
  );
}

function ResumeSection({ profile }: { profile: any }) {
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await dispatch(uploadResume(file)).unwrap();
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-red-500" />
        <CardTitle>Resume</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        {profile?.resumeUrl ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Resume</p>
                  <p className="text-xs text-gray-500">Uploaded successfully</p>
                </div>
              </div>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No resume uploaded yet
          </div>
        )}
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            disabled={uploading}
            className="hidden"
            id="resume-upload-tab"
          />
          <Button
            onClick={() => document.getElementById("resume-upload-tab")?.click()}
            disabled={uploading}
            loading={uploading}
            fullWidth
          >
            {uploading ? "Uploading..." : profile?.resumeUrl ? "Update Resume" : "Upload Resume"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SettingsTab({ profile }: { profile: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Account Settings</h4>
          <p className="text-xs text-gray-500">Manage your account preferences and security settings</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Notification Settings</h4>
          <p className="text-xs text-gray-500">Configure email and push notifications</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Privacy Settings</h4>
          <p className="text-xs text-gray-500">Control who can see your profile and activity</p>
        </div>
      </div>
    </Card>
  );
}
