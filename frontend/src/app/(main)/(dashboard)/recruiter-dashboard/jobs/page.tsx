"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchJobs,
  updateJobStatus,
  removeJob,
} from "@/features/recruiterProfile/store/recruiterProfileSlice";
import {
  Briefcase,
  Edit3,
  Eye,
  Power,
  Trash2,
  Plus,
  Users,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { timeAgo, cn } from "@/lib/utils";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { jobs: myJobs, isLoading } = useAppSelector(
    (s) => s.recruiterProfile
  );

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleToggleStatus = useCallback(
    (jobId: string, status: string) => {
      dispatch(updateJobStatus({ jobId, status } as any));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (jobId: string) => {
      if (!confirm("Are you sure you want to delete this job?")) return;
      dispatch(removeJob(jobId));
    },
    [dispatch]
  );

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
            const { redirect } = require("next/navigation");
            redirect("/recruiter-dashboard/jobs/post");
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
          {/* <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              const { redirect } = require("next/navigation");
              redirect("/recruiter-dashboard/jobs/post");
            }}
          >
            Post a Job
          </Button> */}
        </Card>
      )}

      {/* Jobs list */}
      {myJobs.length > 0 && (
        <div className="space-y-4">
          {myJobs.map((job: any) => (
            <Card key={job.id} hoverable>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {job.company?.logo ?? "🏢"}
                </div>
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
                    const { redirect } = require("next/navigation");
                    redirect(`/jobs/${job.id}`);
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button variant="ghost" size="xs" onClick={() => {}}>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    handleToggleStatus(
                      job.id,
                      job.status === "active" ? "paused" : "active"
                    )
                  }
                  icon={<Power className="w-3.5 h-3.5" />}
                >
                  {job.status === "active" ? "Pause" : "Publish"}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(job.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
