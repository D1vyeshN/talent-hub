"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDashboard,
  clearError,
} from "@/features/recruiterProfile/store/recruiterProfileSlice";
import {
  BarChart3,
  CheckCircle,
  FileDown,
  Plus,
  Users,
  Briefcase,
  Eye,
  Clock,
  Search,
  Star,
  ExternalLink,
  Download,
  Edit3,
  Power,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { timeAgo, cn } from "@/lib/utils";

/* ── Dashboard Home ──────────────────────────────────────────────────────── */

const STAT_CARDS = [
  {
    title: "Active Jobs",
    field: "activeJobs",
    icon: Briefcase,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: "+1 this week",
  },
  {
    title: "Total Applicants",
    field: "totalApplicants",
    icon: Users,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    trend: "+23 today",
  },
  {
    title: "Interviews Scheduled",
    field: "interviewsScheduled",
    icon: Clock,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    trend: "3 this week",
  },
  {
    title: "Positions Filled",
    field: "positionsFilled",
    icon: CheckCircle,
    color: "bg-green-50",
    iconColor: "text-green-600",
    trend: "This month",
  },
];

export default function RecruiterDashboardHome() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const {
    jobs: myJobs,
    applications,
    stats,
    analytics,
    isLoading,
    error,
  } = useAppSelector((s) => s.recruiterProfile);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const displayedStats = stats ?? {
    activeJobs: 0,
    totalApplicants: 0,
    interviewsScheduled: 0,
    positionsFilled: 0,
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-amber-50 text-sm text-amber-600 border border-amber-200">
          ⚠️ Dashboard endpoint not implemented in backend yet. Showing placeholder data.
          <br />
          <span className="text-xs">Backend needs: GET /api/recruiter/dashboard</span>
        </div>
      )}

      {/* Welcome + Post action */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] ?? "Recruiter"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {(user as any)?.company ?? "Recruiter"} ·{" "}
            {(user as any)?.designation ?? ""}
          </p>
        </div>
        {/* <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            // Client-side redirect via Next router
            const { redirect } = require("next/navigation");
            redirect("/recruiter-dashboard/jobs/post");
          }}
        >
          Post New Job
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          // @ts-ignore – field names are typed above
          const raw = displayedStats[stat.field];
          const value = typeof raw === "number" ? raw : 0;
          return (
            <Card
              key={stat.title}
              padding="sm"
              className="hover:shadow-md transition-shadow"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                  stat.color
                )}
              >
                <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "…" : value}
              </p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                {stat.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  analytics?.jobViews ??
                  [
                    { label: "Mon", value: 12 },
                    { label: "Tue", value: 18 },
                    { label: "Wed", value: 9 },
                    { label: "Thu", value: 24 },
                    { label: "Fri", value: 30 },
                  ]
                }
              >
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="url(#recGrad)"
                  strokeWidth={2}
                  name="Views"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <div className="space-y-4 pt-2">
            {(analytics?.hired ?? [
              { label: "Applied", value: 155 },
              { label: "Screening", value: 60 },
              { label: "Interview", value: 30 },
              { label: "Offer", value: 10 },
              { label: "Hired", value: 2 },
            ]).map((stage: any, i: number) => {
              const funnelData =
                analytics?.hired ?? [
                  { label: "Applied", value: 155 },
                  { label: "Screening", value: 60 },
                  { label: "Interview", value: 30 },
                  { label: "Offer", value: 10 },
                  { label: "Hired", value: 2 },
                ];
              const max = funnelData[0].value;
              const pct = (stage.value / max) * 100;
              const colors = [
                "bg-blue-500",
                "bg-indigo-500",
                "bg-purple-500",
                "bg-amber-500",
                "bg-green-500",
              ];
              return (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{stage.label}</span>
                    <span className="font-medium">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        colors[i]
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Applicants */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applicants</CardTitle>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              const { redirect } = require("next/navigation");
              redirect("/recruiter-dashboard/applications");
            }}
          >
            View all →
          </Button>
        </CardHeader>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              Loading applicants…
            </p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No applications yet.
            </p>
          ) : (
            applications.slice(0, 4).map((app: any) => {
              const config =
                APPLICATION_STATUS_CONFIG[
                  app.status as keyof typeof APPLICATION_STATUS_CONFIG
                ] ?? APPLICATION_STATUS_CONFIG["applied"];
              const candidate = app.candidate ?? { name: "Candidate" };
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={() => {
                    const { redirect } = require("next/navigation");
                    redirect("/recruiter-dashboard/applications");
                  }}
                >
                  <Avatar name={candidate.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {app.job?.title ?? "Unknown role"} · Applied{" "}
                      {timeAgo(app.appliedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
                      config.color,
                      config.bg
                    )}
                  >
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
