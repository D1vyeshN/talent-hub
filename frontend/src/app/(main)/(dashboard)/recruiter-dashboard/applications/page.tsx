"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchApplications,
  updateApplicationStatus,
} from "@/features/recruiterProfile/store/recruiterProfileSlice";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const { applications, isLoading } = useAppSelector((s) => s.recruiterProfile);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Note: This endpoint doesn't exist in backend yet
    // Backend has /api/application/job/:jobId for specific job applications
    // Need to implement /api/recruiter/applications in backend or fetch per job
    dispatch(fetchApplications());
  }, [dispatch]);

  const filters = [
    { id: "all", label: "All Applications" },
    { id: "applied", label: "Applied" },
    { id: "screening", label: "Screening" },
    { id: "interview", label: "Interview" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "Rejected" },
  ];

  const filtered = applications.filter((a: any) => {
    const candidate = a.candidate || { name: "Unknown Candidate" };
    const matchesSearch =
      !searchQuery ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    dispatch(updateApplicationStatus({ applicationId, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage candidate applications
        </p>
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
                filtered.map((app: any) => {
                  const candidate = app.candidate || { name: "Unknown Candidate", experience: 0 };
                  const config = APPLICATION_STATUS_CONFIG[app.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
                  return (
                    <tr
                      key={app.id}
                      className={cn(
                        "border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors",
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={candidate.avatar} name={candidate.name} size="sm" />
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
                                onClick={() => handleStatusUpdate(app.id, "interview")}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(app.id, "rejected")}
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