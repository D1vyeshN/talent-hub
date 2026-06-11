"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCandidateApplications,
  withdrawApplication,
} from "@/features/applications/store/applicationSlice";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Trash2, ExternalLink, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Application } from "@/types";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { candidateApplications, isLoading, error, pagination } = useAppSelector(
    (s) => s.application
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCandidateApplications({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const filters = [
    { id: "all", label: "All Applications" },
    { id: "applied", label: "Applied" },
    { id: "screening", label: "Screening" },
    { id: "interview", label: "Interview" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "Rejected" },
    { id: "hired", label: "Hired" },
  ];

  const filtered = candidateApplications.filter((app: Application) => {
    const job = app.job || { title: "Unknown Job" };
    const company = job.company || { name: "Unknown Company" };
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    
    setWithdrawingId(applicationId);
    try {
      await dispatch(withdrawApplication(applicationId)).unwrap();
    } catch (err) {
      console.error("Failed to withdraw application:", err);
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage your job applications
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by job title or company..."
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

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-sm">Loading applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "No applications match your filters."
                : "You haven't applied to any jobs yet."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={() => router.push("/jobs")}
              >
                Browse Jobs
              </Button>
            )}
          </div>
        ) : (
          filtered.map((app: Application) => {
            const job = app.job || { title: "Unknown Job", company: { name: "Unknown Company", logo: "" } };
            const config = APPLICATION_STATUS_CONFIG[app.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
            
            return (
              <Card key={app._id} padding="md">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <Avatar
                      src={job.company.logo}
                      name={job.company.name}
                      size="lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {job.company.name}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0",
                          config.color,
                          config.bg,
                        )}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {app.coverLetter && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {app.coverLetter}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleViewJob(job._id)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    {app.status === "applied" && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleWithdraw(app._id)}
                        loading={withdrawingId === app._id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => dispatch(fetchCandidateApplications({ page: pagination.page - 1, pageSize: pagination.pageSize }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 flex items-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => dispatch(fetchCandidateApplications({ page: pagination.page + 1, pageSize: pagination.pageSize }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
