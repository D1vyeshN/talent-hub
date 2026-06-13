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
  DollarSign,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { timeAgo } from "@/lib/utils";
import { JobStatus } from "@/types";
import { Avatar } from "@/components/ui/Avatar";


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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.original.company?.logo} name={row.original.company?.name || "Company"} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">{row.original.title}</p>
            <p className="text-xs text-gray-500">{row.original.company?.name || "Company"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <MapPin className="w-4 h-4" />
          {row.original.location}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.level}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "active"
              ? "success"
              : row.original.status === "paused"
                ? "warning"
                : "default"
          }
          size="sm"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "applicants",
      header: "Applicants",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <Users className="w-4 h-4" />
          {row.original.applicantsCount ?? 0}
        </div>
      ),
    },
    {
      accessorKey: "postedAt",
      header: "Posted",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {timeAgo(row.original.postedAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                router.push(`/jobs/${job._id}`);
              }}
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                router.push(`/recruiter-dashboard/jobs/${job._id}/edit`);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStatusDropdownOpen(statusDropdownOpen === job._id ? null : job._id)}
              >
                <Power className="w-3.5 h-3.5" />
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
              className="text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(job._id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const renderExpandedContent = (job: any) => {
    return (
      <div className="space-y-4 p-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600">{job.description || "No description provided"}</p>
        </div>
        {job.requirements && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h4>
            <p className="text-sm text-gray-600">{job.requirements}</p>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {typeof job.salary === 'object' 
                ? `${job.salary.currency || '$'}${job.salary.min || 0} - ${job.salary.currency || '$'}${job.salary.max || 0}${job.salary.period ? `/${job.salary.period}` : ''}`
                : job.salary}
            </span>
          </div>
        )}
        {job.skills && job.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };


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

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={myJobs}
        mode="client"
        initialPagination={{ pageIndex: 0, pageSize: 10 }}
        searchable={true}
        searchPlaceholder="Search jobs..."
        expandable={true}
        renderExpandedContent={renderExpandedContent}
        isFetching={isLoading}
        renderLoading={() => <div className="text-center py-8">Loading jobs...</div>}
        renderEmpty={() => (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <Briefcase className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No jobs posted yet
            </h3>
            <p className="text-sm text-gray-500">
              Post your first job to start receiving applications.
            </p>
          </div>
        )}
      />

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
