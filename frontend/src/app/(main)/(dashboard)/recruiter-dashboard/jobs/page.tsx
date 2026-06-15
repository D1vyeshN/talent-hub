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
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { cn, timeAgo } from "@/lib/utils";
import { JobStatus } from "@/types";
import { TooltipWrapper } from "@/components/shared/TooltipWrapper";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/Input";

const filters = [
  { id: "all", label: "All Jobs" },
  { id: "draft", label: "Draft" },
  { id: "active", label: "Active" },
  { id: "published", label: "Published" },
  { id: "closed", label: "Closed" },
];

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs: myJobs, isLoading, totalJobs } = useAppSelector(
    (s) => s.recruiter
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // const [totalJobs, setTotalJobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    dispatch(fetchJobs({
      page: currentPage,
      pageSize,
      filters: {
        search: searchQuery.trim() !== "" ? searchQuery.trim() : undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sortBy: sortConfig?.field,
        sortOrder: sortConfig?.direction,
      }
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, sortConfig, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handleSortChange = (sort: { field: string; direction: 'asc' | 'desc' } | undefined) => {
    setSortConfig(sort ?? null);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleStatusChange = useCallback(
    (jobId: string, status: JobStatus) => {
      dispatch(updateJobStatus({ jobId, status }));
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
          <div>
            <p className="text-sm font-medium text-gray-900">{row.original.title}</p>
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
        <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
          <Users className="w-4 h-4" />
          {row.original.applicantsCount ?? 0}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex justify-center gap-1">
            <TooltipWrapper message="View Job">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  router.push(`/jobs/${job._id}`);
                }}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper message="Edit Job">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  router.push(`/recruiter-dashboard/jobs/${job._id}/edit`);
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            </TooltipWrapper>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <TooltipWrapper message="Change Status">
                    <Button
                      variant="ghost"
                      size="xs"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipWrapper>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Job Status</DropdownMenuLabel>
                    {(["draft", "active", "paused", "closed"] as JobStatus[]).map((status) => (
                      <DropdownMenuItem key={status} className="cursor-pointer" onClick={() => handleStatusChange(job._id, status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TooltipWrapper message="Delete Job">
              <Button
                variant="ghost"
                size="xs"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(job._id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipWrapper>
          </div >
        );
      },
    },
  ];

  const renderExpandedContent = (job: any) => {
    return (
      <div className="space-y-4 p-4">
        <div className="flex gap-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Type</h4>
            <p className="text-sm text-gray-600">{job.type || "No job type provided"}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Posted At</h4>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {timeAgo(job.postedAt)}
            </div>
          </div>
        </div>
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

  const renderToolbar = (props: any) => {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or job title..."
            value={props.searchValue}
            onChange={(e) => props.onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            rightIcon={props.searchValue.length > 0 && <Button variant="ghost" size="xs" onClick={() => props.onSearchChange("")}><X className="h-4 w-4 text-gray-400" /></Button>}
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
        mode="server"
        totalRows={totalJobs}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
        // Pass existing state as controlled props
        searchValue={searchQuery}
        sorting={sortConfig ? [{ id: sortConfig.field, desc: sortConfig.direction === 'desc' }] : []}
        columnFilters={statusFilter !== "all" ? [{ id: "status", value: statusFilter }] : []}
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
        renderToolbar={renderToolbar}
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
