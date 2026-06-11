"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchJobs,
} from "@/features/recruiterProfile/store/recruiterProfileSlice";
import {
  fetchAllRecruiterApplications,
  updateApplicationStatus,
} from "@/features/applications/store/applicationSlice";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Eye, CheckCircle, XCircle, ArrowUpDown, Download } from "lucide-react";
import type { Application } from "@/types";

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const { jobs } = useAppSelector((s) => s.recruiterProfile);
  const { recruiterApplications, isLoading } = useAppSelector((s) => s.application);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("appliedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    // Fetch recruiter's jobs first, then fetch applications for each job
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    // Once jobs are loaded, fetch applications for all jobs
    if (jobs.length > 0) {
      const jobIds = jobs.map((job) => job._id);
      dispatch(fetchAllRecruiterApplications(jobIds));
    }
  }, [jobs, dispatch]);

  const filters = [
    { id: "all", label: "All Applications" },
    { id: "applied", label: "Applied" },
    { id: "screening", label: "Screening" },
    { id: "interview", label: "Interview" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "Rejected" },
  ];

  const filtered = recruiterApplications.filter((a: Application) => {
    const candidate = a.candidate || { name: "Unknown Candidate" };
    const matchesSearch =
      !searchQuery ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a: Application, b: Application) => {
    let comparison = 0;
    
    if (sortBy === "appliedAt") {
      comparison = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
    } else if (sortBy === "candidateName") {
      const candidateA = a.candidate?.name || "";
      const candidateB = b.candidate?.name || "";
      comparison = candidateA.localeCompare(candidateB);
    } else if (sortBy === "jobTitle") {
      const jobA = a.job?.title || "";
      const jobB = b.job?.title || "";
      comparison = jobA.localeCompare(jobB);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    dispatch(updateApplicationStatus({ applicationId, status: newStatus as any }));
  };

  const handleExport = () => {
    // Create CSV from filtered applications
    const headers = ["Candidate Name", "Job Title", "Status", "Applied Date", "Email"];
    const rows = filtered.map((app: Application) => [
      app.candidate?.name || "Unknown",
      app.job?.title || "Unknown",
      app.status,
      new Date(app.appliedAt).toLocaleDateString(),
      app.candidate?.email || "N/A",
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `applications-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage candidate applications
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by name or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  statusFilter === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="appliedAt">Sort by Date</option>
            <option value="candidateName">Sort by Candidate</option>
            <option value="jobTitle">Sort by Job</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                    Loading applications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                    No applications match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app: Application) => {
                  const candidate = app.candidate || { name: "Unknown Candidate", experience: 0, avatar: "" };
                  const config = APPLICATION_STATUS_CONFIG[app.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
                  return (
                    <tr
                      key={app._id}
                      className={cn(
                        "border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors",
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={(candidate as any).avatar} name={candidate.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                            <p className="text-xs text-gray-400">{candidate.experience || "N/A"} yrs exp</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{app.job?.title || "Unknown role"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-full",
                            config.color,
                            config.bg,
                          )}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="xs">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {app.status !== "rejected" && app.status !== "offer" && (
                            <>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(app._id, "interview")}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(app._id, "rejected")}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}