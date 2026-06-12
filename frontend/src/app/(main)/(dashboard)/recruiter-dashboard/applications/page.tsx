"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchJobs,
} from "@/features/recruiter/recruiterSlice";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, CheckCircle, XCircle, ArrowUpDown, Download } from "lucide-react";
import type { Application, ApplicationStatus, Candidate } from "@/types";
import { TooltipWrapper } from "@/components/shared/TooltipWrapper";

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const { recruiterApplications, isLoading } = useAppSelector((s) => s.application);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllRecruiterApplications());
  }, [dispatch]);

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
            <TooltipWrapper message="View Profile">
              <Button variant="ghost" size="xs" onClick={() => {
                if (app.status === "applied") {
                  handleStatusUpdate(app._id, "screening");
                }
              }}>
                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-3.5 h-3.5" />
                </a>
              </Button>
            </TooltipWrapper>
            <TooltipWrapper message="Download Resume">
              <Button variant="ghost" size="xs" onClick={() => downloadResume(app)}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </TooltipWrapper>
            {app.status !== "rejected" && app.status !== "hired" && (
              <>
                <TooltipWrapper message={switchStatus(app.status)}>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate(app._id, switchStatus(app.status, true) as ApplicationStatus)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </Button>
                </TooltipWrapper>

                <TooltipWrapper message="Reject Application">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(app._id, "rejected")}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </TooltipWrapper>
              </>
            )}

          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: recruiterApplications || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    globalFilterFn: (row, columnId, value) => {
      const candidate = (row.original.candidate as Candidate) ?? {
        name: "Unknown Candidate",
      };

      const searchValue = String(value).toLowerCase();

      const candidateMatch =
        candidate.name?.toLowerCase().includes(searchValue) ?? false;

      const jobTitle = row.original.job?.title ?? "";
      const jobMatch = jobTitle.toLowerCase().includes(searchValue);

      return candidateMatch || jobMatch;
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  // Update column filters when status filter changes
  useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters([]);
    } else {
      setColumnFilters([{ id: "status", value: statusFilter }]);
    }
    // Reset pagination when filter changes
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, [statusFilter]);

  const handleStatusUpdate = (applicationId: string, newStatus: ApplicationStatus) => {
    dispatch(updateApplicationStatus({ applicationId, status: newStatus }));
  };

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows;
    const headers = ["Candidate Name", "Job Title", "Status", "Applied Date", "Email"];
    const rowData = rows.map((row) => row.original);
    const rowsForExport = rowData.map((app: Application) => [
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
          disabled={table.getFilteredRowModel().rows.length === 0}
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
              // label="Search"
              placeholder="Search by name or job title..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                      header.id === "actions" && "text-center"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.getToggleSortingHandler() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUpDown className="w-3 h-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowUpDown className="w-3 h-3 rotate-180" />
                          ) : null}
                        </button>
                      )
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No applications match your filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {table.getFilteredRowModel().rows.length !== 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 w-1/3">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <Pagination className="w-2/3 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {table.getPageCount() > 0 &&
                Array.from({ length: table.getPageCount() }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(i)}
                      isActive={table.getState().pagination.pageIndex === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}