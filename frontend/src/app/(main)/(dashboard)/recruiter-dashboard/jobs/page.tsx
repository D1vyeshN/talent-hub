"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchJobs,
  updateJobStatus,
  removeJob,
} from "@/features/recruiter/recruiterSlice";
import {
  Briefcase,
  Edit3,
  Eye,
  Power,
  Trash2,
  Plus,
  Users,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";
import { JobStatus } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

function CompanyLogo({ logo, name, size = "md" }: { logo?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  const imageSize = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  if (logo && logo.startsWith("http")) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        <Image
          src={logo}
          alt={name}
          className="w-full h-full object-cover"
          width={imageSize[size]}
          height={imageSize[size]}
        />
      </div>
    );
  }

  // Fallback to initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-semibold text-sm">{initials}</span>
    </div>
  );
}

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs: myJobs, isLoading } = useAppSelector(
    (s) => s.recruiter
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleStatusChange = useCallback(
    (jobId: string, status: JobStatus) => {
      dispatch(updateJobStatus({ jobId, status }));
      setStatusDropdownOpen(null);
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (jobId: string) => {
      setJobToDelete(jobId);
      setDeleteModalOpen(true);
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    if (jobToDelete) {
      dispatch(removeJob(jobToDelete));
      setDeleteModalOpen(false);
      setJobToDelete(null);
    }
  }, [jobToDelete, dispatch]);

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your job postings • {myJobs.length} total
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            router.push("/recruiter-dashboard/jobs/post");
          }}
        >
          Post New Job
        </Button>
      </div>

      {/* Empty state */}
      {!isLoading && myJobs.length === 0 && (
        <Card className="py-12 text-center">
          <div className="text-gray-400 mb-3">
            <Briefcase className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No jobs posted yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Post your first job to start receiving applications.
          </p>
        </Card>
      )}

      {/* Jobs list */}
      {myJobs.length > 0 && (
        <div className="space-y-4">
          {myJobs.map((job) => (
            <Card key={job._id} hoverable>
              <div className="flex items-start gap-4">
                <Avatar src={job.company?.logo} name={job.company?.name || "Company"} size="md" shape="squre" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.location} · {job.type} · {job.level}
                      </p>
                    </div>
                    <Badge
                      variant={
                        job.status === "active"
                          ? "success"
                          : job.status === "paused"
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicantsCount ?? 0} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {job.viewsCount ?? 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Posted {timeAgo(job.postedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    router.push(`/jobs/${job._id}`);
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button variant="ghost" size="xs" onClick={() => {
                  router.push(`/recruiter-dashboard/jobs/${job._id}/edit`);
                }}>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setStatusDropdownOpen(statusDropdownOpen === job._id ? null : job._id)}
                    icon={<Power className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Status
                  </Button>
                  {statusDropdownOpen === job._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      {(["draft", "active", "paused", "closed"] as JobStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(job._id, status)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(job._id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        size="sm"
      >
        <div className="flex gap-3 justify-end m-5">
          <Button variant="outline" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete Job
          </Button>
        </div>
      </Modal>
    </div>
  );
}
