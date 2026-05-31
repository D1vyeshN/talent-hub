"use client"
import { useState } from "react";
import {
  BarChart3, Briefcase, ChevronRight, Edit, Eye, Plus, Search,
  TrendingUp, Users, Zap, CheckCircle, Clock, XCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import {
  MOCK_RECRUITER, MOCK_JOBS, MOCK_APPLICATIONS,
  RECRUITER_ANALYTICS, MOCK_CANDIDATE
} from "@/lib/mockData";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { timeAgo, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";
import { redirect } from "next/navigation";

const STAT_CARDS = [
  { title: "Active Jobs", value: 3, icon: Briefcase, color: "bg-blue-50", iconColor: "text-blue-600", change: "+1 this week" },
  { title: "Total Applicants", value: 155, icon: Users, color: "bg-purple-50", iconColor: "text-purple-600", change: "+23 today" },
  { title: "Interviews Scheduled", value: 8, icon: Clock, color: "bg-amber-50", iconColor: "text-amber-600", change: "3 this week" },
  { title: "Positions Filled", value: 2, icon: CheckCircle, color: "bg-green-50", iconColor: "text-green-600", change: "This month" },
];

export default function RecruiterDashboard() {
  const recruiter = MOCK_RECRUITER;
  const myJobs = MOCK_JOBS.filter((j) => recruiter.postedJobs.includes(j.id));
  const applications = MOCK_APPLICATIONS;
  const [postJobModal, setPostJobModal] = useState(false);
  const [searchApplicants, setSearchApplicants] = useState("");

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <OverviewTab jobs={myJobs} applications={applications} />,
    },
    {
      id: "jobs",
      label: "My Jobs",
      icon: <Briefcase className="w-4 h-4" />,
      badge: myJobs.length,
      content: <JobsTab jobs={myJobs} onPost={() => setPostJobModal(true)} />,
    },
    {
      id: "applicants",
      label: "Applicants",
      icon: <Users className="w-4 h-4" />,
      badge: applications.length,
      content: <ApplicantsTab applications={applications} searchQuery={searchApplicants} onSearchChange={setSearchApplicants} />,
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
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {recruiter.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">{recruiter.company} · {recruiter.designation}</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setPostJobModal(true)}
          >
            Post New Job
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((stat) => (
            <Card key={stat.title} padding="sm" className="hover:shadow-md transition-shadow">
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

      {/* Post Job Modal */}
      <PostJobModal isOpen={postJobModal} onClose={() => setPostJobModal(false)} />
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ applications }: {
  jobs?: typeof MOCK_JOBS;
  applications: typeof MOCK_APPLICATIONS;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RECRUITER_ANALYTICS.jobViews}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#recGrad)" strokeWidth={2} name="Views" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <div className="space-y-3 pt-2">
            {RECRUITER_ANALYTICS.hiringFunnel.map((stage, i) => {
              const max = RECRUITER_ANALYTICS.hiringFunnel[0].value;
              const pct = (stage.value / max) * 100;
              const colors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-amber-500", "bg-green-500"];
              return (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{stage.label}</span>
                    <span className="font-medium">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", colors[i])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applicants</CardTitle>
          <button className="text-xs text-blue-600">View all →</button>
        </CardHeader>
        <div className="space-y-3">
          {applications.slice(0, 4).map((app) => {
            const config = APPLICATION_STATUS_CONFIG[app.status];
            const candidate = app.candidate || MOCK_CANDIDATE;
            return (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                <Avatar name={candidate.name} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                  <p className="text-xs text-gray-500">{app.job.title} · Applied {timeAgo(app.appliedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", config.color, config.bg)}>
                    {config.label}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Accept">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Jobs Tab ──────────────────────────────────────────────────────────────────

function JobsTab({ jobs, onPost }: {
  jobs: typeof MOCK_JOBS;
  onPost: () => void;
}) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No jobs posted yet"
          description="Post your first job to start receiving applications."
          action={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onPost}>Post a Job</Button>}
        />
      ) : (
        jobs.map((job) => (
          <Card key={job.id} hoverable>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                {job.company.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{job.location} · {job.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "active" ? "success" : "warning"} size="sm">
                      {job.status}
                    </Badge>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicantsCount} applicants</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{job.viewsCount} views</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Posted {timeAgo(job.postedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button variant="outline" size="xs" onClick={() => redirect("job-detail")}>
                <Eye className="w-3.5 h-3.5" /> View Listing
              </Button>
              <Button variant="ghost" size="xs">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="xs" className="ml-auto text-red-500 hover:bg-red-50">
                <XCircle className="w-3.5 h-3.5" /> Close Job
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ── Applicants Tab ────────────────────────────────────────────────────────────

function ApplicantsTab({ applications, searchQuery, onSearchChange }: {
  applications: typeof MOCK_APPLICATIONS;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}) {
  const filtered = applications.filter((a) => {
    const name = a.candidate?.name || MOCK_CANDIDATE.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search applicants..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-3">Position</div>
          <div className="col-span-2">Applied</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Action</div>
        </div>

        {filtered.map((app, i) => {
          const candidate = app.candidate || MOCK_CANDIDATE;
          const config = APPLICATION_STATUS_CONFIG[app.status];
          return (
            <div
              key={app.id}
              className={cn(
                "grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50 transition-colors",
                i !== filtered.length - 1 && "border-b border-gray-100"
              )}
            >
              <div className="col-span-4 flex items-center gap-3">
                <Avatar name={candidate.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                  <p className="text-xs text-gray-400">{candidate.experience} yrs exp</p>
                </div>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-gray-700">{app.job.title}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">{timeAgo(app.appliedAt)}</p>
              </div>
              <div className="col-span-2">
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", config.color, config.bg)}>
                  {config.label}
                </span>
              </div>
              <div className="col-span-1 flex gap-1">
                <button className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="View">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Views */}
        <Card>
          <CardHeader>
            <CardTitle>Job Views — Last 7 Days</CardTitle>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RECRUITER_ANALYTICS.jobViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Week</CardTitle>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RECRUITER_ANALYTICS.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg. Time to Hire", value: "18 days", trend: "↓ 3 days vs last month", color: "text-green-600" },
          { label: "Application Rate", value: "4.2%", trend: "↑ 0.8% vs last month", color: "text-green-600" },
          { label: "Interview-to-Offer", value: "33%", trend: "↓ 5% vs last month", color: "text-red-500" },
          { label: "Offer Acceptance", value: "87.5%", trend: "↑ 2.5% vs last month", color: "text-green-600" },
        ].map((m) => (
          <Card key={m.label} padding="md">
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
            <p className={cn("text-xs mt-1", m.color)}>{m.trend}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Post Job Modal ─────────────────────────────────────────────────────────────

function PostJobModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    setPosting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPosting(false);
    onClose();
    setStep(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a New Job" size="xl">
      <div className="p-6">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                step >= s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
              )}>
                {s}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                {["Job Details", "Requirements", "Preview & Post"][s - 1]}
              </div>
              {s < 3 && <div className={cn("flex-1 h-px", step > s ? "bg-blue-400" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Job Title *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior React Developer" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City or Remote" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Job Type *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Min Salary (₹/yr)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1000000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Max Salary (₹/yr)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2000000" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Job Description *</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe the role, team, and what the candidate will work on..." />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Required Skills</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type skills separated by commas (e.g. React, TypeScript, Node.js)" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Experience Level</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Entry Level (0-2 yrs)</option>
                <option>Mid Level (3-5 yrs)</option>
                <option>Senior Level (5-8 yrs)</option>
                <option>Lead / Principal (8+ yrs)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Requirements</label>
              <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="List key requirements (one per line)..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Responsibilities</label>
              <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="List key responsibilities (one per line)..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Your job is ready to post!</p>
              </div>
              <p className="text-xs text-green-600 mt-1">
                It will go live immediately and appear in search results.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-900">Preview Summary</p>
              <div className="text-gray-600 space-y-1">
                <p>📌 Senior React Developer</p>
                <p>📍 Bengaluru, India · Full Time</p>
                <p>💰 ₹15L – ₹25L / year</p>
                <p>🏢 Google · Verified Company</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>Pro Tip:</strong> Feature your job for 3x more visibility. Upgrade to Pro plan.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          {step > 1 && (
            <Button variant="outline" size="md" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            {step < 3 ? (
              <Button variant="primary" size="md" onClick={() => setStep((s) => s + 1)}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" size="md" loading={posting} onClick={handlePost}>
                🚀 Publish Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
