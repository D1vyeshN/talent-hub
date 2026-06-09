"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Edit, Star, Trash2, Building2, MapPin, Calendar, Users } from "lucide-react";
import { adminService } from "@/features/admin/admin.service";
import type { Job } from "@/types";

const columns = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }: { row: { original: Job } }) => (
      <div className="font-medium text-gray-900">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }: { row: { original: Job } }) => (
      <div className="text-gray-600">{row.original.company.name}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: Job } }) => (
      <Badge
        variant={
          row.original.status === "active"
            ? "success"
            : row.original.status === "draft"
            ? "warning"
            : "error"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }: { row: { original: Job } }) => (
      <Badge variant={row.original.isFeatured ? "success" : "outline"}>
        {row.original.isFeatured ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "applicantsCount",
    header: "Applications",
    cell: ({ row }: { row: { original: Job } }) => (
      <div className="font-medium">{row.original.applicantsCount}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Job } }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} title="View" />
        <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />} title="Edit" />
        <Button variant="ghost" size="sm" icon={<Star className="h-4 w-4" />} title={row.original.isFeatured ? "Unfeature" : "Feature"} />
        <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} title="Delete" />
      </div>
    ),
  },
];

const renderExpandedContent = (job: Job) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Building2 className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Company</p>
        <p className="text-sm font-medium text-gray-900">{job.company.name}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <MapPin className="h-4 w-4 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Location</p>
        <p className="text-sm font-medium text-gray-900">{job.location}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-100 rounded-lg">
        <Calendar className="h-4 w-4 text-purple-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Posted</p>
        <p className="text-sm font-medium text-gray-900">
          {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "N/A"}
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-orange-100 rounded-lg">
        <Users className="h-4 w-4 text-orange-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Type & Level</p>
        <p className="text-sm font-medium text-gray-900">
          {job.type} • {job.level}
        </p>
      </div>
    </div>
  </div>
);

export default function AdminJobsPage() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getJobs({ page, pageSize });
      setData(response.data);
      setTotalRows(response.total);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage job listings and applications</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={setPage}
        searchPlaceholder="Search jobs..."
        expandable={true}
        renderExpandedContent={renderExpandedContent}
      />
    </div>
  );
}
