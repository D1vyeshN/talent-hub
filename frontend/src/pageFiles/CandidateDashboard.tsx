"use client"
import { useState } from "react";
import {
  Bookmark, Briefcase, CheckCircle, ChevronRight, Clock, Edit3,
  Eye, MapPin, MessageCircle, Star, TrendingUp, Upload
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  MOCK_CANDIDATE, MOCK_APPLICATIONS, MOCK_JOBS,
  CANDIDATE_ANALYTICS
} from "@/lib/mockData";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { formatSalaryRange, timeAgo, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { redirect } from "next/navigation";


const STAT_CARDS = [
  { title: "Applications Sent", value: 3, icon: Briefcase, color: "bg-blue-50", iconColor: "text-blue-600", change: "+2 this week" },
  { title: "Profile Views", value: 47, icon: Eye, color: "bg-purple-50", iconColor: "text-purple-600", change: "+12 this week" },
  { title: "Saved Jobs", value: 3, icon: Bookmark, color: "bg-amber-50", iconColor: "text-amber-600", change: "2 expiring soon" },
  { title: "Interviews", value: 1, icon: MessageCircle, color: "bg-green-50", iconColor: "text-green-600", change: "1 scheduled" },
];

export default function CandidateDashboard() {
  const candidate = MOCK_CANDIDATE;
  const myApplications = MOCK_APPLICATIONS.slice(0, 3);
  const savedJobsList = MOCK_JOBS.filter((j) => candidate.savedJobs.includes(j.id));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_activeResumeSection] = useState("profile");

  const profileSections = [
    { label: "Basic Info", done: true },
    { label: "Work Experience", done: true },
    { label: "Education", done: true },
    { label: "Skills", done: true },
    { label: "Resume Upload", done: !!candidate.resumeUrl },
    { label: "Profile Photo", done: false },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <OverviewTab redirect={redirect} myApplications={myApplications} savedJobsList={savedJobsList} />,
    },
    {
      id: "applications",
      label: "Applications",
      icon: <Briefcase className="w-4 h-4" />,
      badge: myApplications.length,
      content: <ApplicationsTab redirect={redirect} applications={myApplications} />,
    },
    {
      id: "saved",
      label: "Saved Jobs",
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedJobsList.length,
      content: <SavedJobsTab redirect={redirect} jobs={savedJobsList} />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <AnalyticsTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Welcome Header ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {candidate.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your job search today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── Left Sidebar ───────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Profile Card */}
            <Card>
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar name={candidate.name} size="xl" />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-blue-700 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h2 className="text-base font-semibold text-gray-900 mt-3">{candidate.name}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{candidate.headline}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {candidate.location}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                  <span className={cn(
                    "text-xs font-bold",
                    candidate.profileCompletion >= 80 ? "text-green-600" : "text-amber-600"
                  )}>
                    {candidate.profileCompletion}%
                  </span>
                </div>
                <ProgressBar
                  value={candidate.profileCompletion}
                  color={candidate.profileCompletion >= 80 ? "green" : "amber"}
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

              <Button variant="outline" size="sm" fullWidth className="mt-4" icon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit Profile
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: "Upload Resume", icon: Upload, onClick: () => {} },
                  { label: "Update Skills", icon: Star, onClick: () => {} },
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

            {/* Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle>My Skills</CardTitle>
                <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Main Content ───────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map((stat) => (
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

function OverviewTab({ redirect, myApplications, savedJobsList }: {
  redirect: (page: string) => void;
  myApplications: typeof MOCK_APPLICATIONS;
  savedJobsList: typeof MOCK_JOBS;
}) {
  return (
    <div className="space-y-6">
      {/* Application Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Application Activity</CardTitle>
          <button className="text-xs text-blue-600" onClick={() => redirect("jobs")}>Browse jobs →</button>
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
          {myApplications.map((app) => {
            const config = APPLICATION_STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {app.job.company.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.job.title}</p>
                  <p className="text-xs text-gray-500">{app.job.company.name} · Applied {timeAgo(app.appliedAt)}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", config.color, config.bg)}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Saved Jobs Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Jobs</CardTitle>
          <button className="text-xs text-blue-600" onClick={() => redirect("jobs")}>View all →</button>
        </CardHeader>
        <div className="space-y-3">
          {savedJobsList.slice(0, 2).map((job) => (
            <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-all" onClick={() => redirect("job-detail")}>
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
                {job.company.logo}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400">{job.company.name} · {formatSalaryRange(job.salary.min, job.salary.max)}</p>
              </div>
              <Clock className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ApplicationsTab({ redirect, applications }: {
  redirect: (page: string) => void;
  applications: typeof MOCK_APPLICATIONS;
}) {
  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No applications yet"
          description="Start applying to jobs that match your skills and experience."
          action={<Button variant="primary" onClick={() => redirect("jobs")}>Browse Jobs</Button>}
        />
      ) : (
        applications.map((app) => {
          const config = APPLICATION_STATUS_CONFIG[app.status];
          return (
            <Card key={app.id} hoverable>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {app.job.company.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{app.job.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{app.job.company.name} · {app.job.location}</p>
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
                    <Button variant="ghost" size="xs" onClick={() => redirect("job-detail")}>
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

function SavedJobsTab({ redirect, jobs }: {
  redirect: (page: string) => void;
  jobs: typeof MOCK_JOBS;
}) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No saved jobs"
          description="Bookmark interesting jobs to apply later."
          action={<Button variant="primary" onClick={() => redirect("jobs")}>Browse Jobs</Button>}
        />
      ) : (
        jobs.map((job) => (
          <Card key={job.id} hoverable onClick={() => redirect("job-detail")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                {job.company.logo}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{job.company.name}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span>{formatSalaryRange(job.salary.min, job.salary.max)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={job.status === "active" ? "success" : "error"} size="sm">
                  {job.status}
                </Badge>
                <Button variant="primary" size="xs" onClick={(e) => { e.stopPropagation(); redirect("job-detail"); }}>
                  Apply
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CANDIDATE_ANALYTICS.profileViews}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#pvGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skills Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Match Score</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={CANDIDATE_ANALYTICS.skillsMatch}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Application Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {CANDIDATE_ANALYTICS.applicationStatus.map((s) => (
            <ProgressBar
              key={s.label}
              label={s.label}
              value={(s.value / 3) * 100}
              showValue={false}
              color="blue"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
