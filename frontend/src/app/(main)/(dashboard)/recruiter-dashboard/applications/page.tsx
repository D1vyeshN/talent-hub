"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
} from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllRecruiterApplications,
  updateApplicationStatus,
} from "@/features/applications/store/applicationSlice";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/data-table/DataTable";
import { Eye, CheckCircle, XCircle, Download, MessageSquare, Search, X } from "lucide-react";
import type { Application, ApplicationStatus, Candidate, User } from "@/types";
import { useRouter } from "next/navigation";
import { newTempConversation } from "@/features/message/store/messageSlice";

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { recruiterApplications, isLoading, pagination } = useAppSelector((s) => s.application);
  const { conversations } = useAppSelector((s) => s.message);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    dispatch(fetchAllRecruiterApplications({
      page: currentPage,
      pageSize,
      search: searchQuery.trim() !== "" ? searchQuery.trim() : undefined,
      status: statusFilter === "all" ? undefined : statusFilter as ApplicationStatus,
      sortBy: sortConfig?.field,
      sortOrder: sortConfig?.direction,
    }));
  }, [dispatch, currentPage, pageSize, searchQuery, sortConfig, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSortChange = (sort: { field: string; direction: 'asc' | 'desc' } | undefined) => {
    setSortConfig(sort ?? null);
    setCurrentPage(1);
  };

  const downloadResume = async (data: Application) => {

    const res = await fetch(data.resumeUrl as string);
    if (data.status === "applied") {
      dispatch(updateApplicationStatus({ applicationId: data._id, status: "screening" }));
    }
    const blob = await res.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;

    a.download = `${data.candidate?.name.replace(/\s+/g, "_") || "candidate"}_resume.pdf`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleMessageCandidate = (application: Application) => {
    const candidateId = application.candidate?._id;
    const jobId = application.job?._id;
    const candidate: User = {
      _id: application?.candidate?._id || "",
      name: application?.candidate?.name || "",
      avatar: application?.candidate?.avatar || "",
      role: "candidate",
      email: application?.candidate?.email || "",
    }
    if (candidateId && jobId) {
      router.push(`/recruiter-dashboard/messages`);
      const existConversation = conversations.some((el) => el.participants.some(user => user._id === candidateId))
      if (!existConversation) {
        dispatch(newTempConversation({
          _id: "temp_conversation",
          participants: [candidate],
          jobContext: {
            _id: jobId,
            title: application.job?.title || "",
          },
        }));
      }
    }
  };

  const filters = [
    { id: "all", label: "All Applications" },
    { id: "applied", label: "Applied" },
    { id: "screening", label: "Screening" },
    { id: "interview", label: "Interview" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "Rejected" },
    { id: "hired", label: "Hired" },
  ];

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "candidate",
      header: "Candidate",
      cell: ({ row }) => {
        const candidate = (row.original.candidate as Candidate) || { name: "Unknown Candidate", experience: 0, avatar: "" };
        return (
          <div className="flex items-center gap-3">
            <Avatar src={candidate.avatar} name={candidate.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = (rowA.original.candidate as Candidate)?.name || "";
        const nameB = (rowB.original.candidate as Candidate)?.name || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "jobTitle",
      header: "Position",
      cell: ({ row }) => (
        <p className="text-sm text-gray-700">{row.original.job?.title || "Unknown role"}</p>
      ),
      sortingFn: (rowA, rowB) => {
        const jobA = rowA.original.job?.title || "";
        const jobB = rowB.original.job?.title || "";
        return jobA.localeCompare(jobB);
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied",
      cell: ({ row }) => (
        <p className="text-xs text-gray-500">{new Date(row.original.createdAt).toLocaleDateString()}</p>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = APPLICATION_STATUS_CONFIG[row.original.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;
        return (
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              config.color,
              config.bg,
            )}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original;
        const switchStatus = (status: ApplicationStatus, isStatus = false) => {
          if (status === "applied") {
            return isStatus ? "interview" : "Move to Interview";
          }
          if (status === "screening") {
            return isStatus ? "interview" : "Move to Interview";
          }
          if (status === "interview") {
            return isStatus ? "offer" : "Move to Offer";
          }
          if (status === "offer") {
            return isStatus ? "hired" : "Move to Hired";
          }

          return "Move to Screening";
        };
        return (
          <div className="flex justify-center gap-1">
            <Button variant="ghost" size="xs" onClick={() => {
              if (app.status === "applied") {
                handleStatusUpdate(app._id, "screening");
              }
            }} title="View Profile">
              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5" />
              </a>
            </Button>
            <Button variant="ghost" size="xs" onClick={() => downloadResume(app)} title="Download Resume">
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => handleMessageCandidate(app)} title="Message Candidate">
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
            {app.status !== "rejected" && app.status !== "hired" && (
              <>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => handleStatusUpdate(app._id, switchStatus(app.status, true) as ApplicationStatus)}
                  title={switchStatus(app.status)}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => handleStatusUpdate(app._id, "rejected")}
                  title="Reject Application"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

          </div>
        );
      },
    },
  ];

  const handleStatusUpdate = (applicationId: string, newStatus: ApplicationStatus) => {
    dispatch(updateApplicationStatus({ applicationId, status: newStatus }));
  };

  const handleExport = () => {
    const rows = recruiterApplications?.filter((app) => {
      if (statusFilter === "all") return true;
      return app.status === statusFilter;
    }) || [];
    const headers = ["Candidate Name", "Job Title", "Status", "Applied Date", "Email"];
    const rowsForExport = rows.map((app: Application) => [
      app.candidate?.name || "Unknown",
      app.job?.title || "Unknown",
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
      app.candidate?.email || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rowsForExport.map((row) => row.map((cell) => `"${cell}"`).join(",")),
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
          disabled={!recruiterApplications || recruiterApplications.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<Application, any>
        columns={columns}
        data={recruiterApplications || []}
        mode="server"
        totalRows={pagination.total}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
        searchValue={searchQuery}
        sorting={sortConfig ? [{ id: sortConfig.field, desc: sortConfig.direction === 'desc' }] : []}
        columnFilters={statusFilter !== "all" ? [{ id: "status", value: statusFilter }] : []}
        isFetching={isLoading}
        renderToolbar={renderToolbar}
        renderLoading={() => <div className="text-center py-8">Loading applications...</div>}
        renderEmpty={() => <div className="text-center py-8">No applications match your filters.</div>}
      />
    </div>
  );
}