"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Edit, Shield, Ban, Building2, MapPin, Calendar, Briefcase } from "lucide-react";
import { adminService } from "@/features/admin/admin.service";
import type { Company } from "@/types";
import type { RowSelectionState, ExpandedState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns = (handlers: {
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onVerify: (company: Company) => void;
  onBlock: (company: Company) => void;
}): ColumnDef<Company, unknown>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: Company } }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-blue-600">
            {row.original.name.charAt(0)}
          </span>
        </div>
        <div className="font-medium text-gray-900">{row.original.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }: { row: { original: Company } }) => (
      <Badge variant="outline">{row.original.industry}</Badge>
    ),
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }: { row: { original: Company } }) => (
      <Badge variant={row.original.verified ? "success" : "outline"}>
        {row.original.verified ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "activeJobs",
    header: "Active Jobs",
    cell: ({ row }: { row: { original: Company } }) => (
      <div className="font-medium">{row.original.activeJobs || 0}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Company } }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} title="View" onClick={() => handlers.onView(row.original)} />
        <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />} title="Edit" onClick={() => handlers.onEdit(row.original)} />
        <Button variant="ghost" size="sm" icon={<Shield className="h-4 w-4" />} title={row.original.verified ? "Unverify" : "Verify"} onClick={() => handlers.onVerify(row.original)} />
        <Button variant="ghost" size="sm" icon={<Ban className="h-4 w-4" />} title="Block" onClick={() => handlers.onBlock(row.original)} />
      </div>
    ),
  },
];

const renderExpandedContent = (company: Company) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Building2 className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Location</p>
        <p className="text-sm font-medium text-gray-900">{company.location}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <Briefcase className="h-4 w-4 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Size</p>
        <p className="text-sm font-medium text-gray-900">{company.size}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-100 rounded-lg">
        <Calendar className="h-4 w-4 text-purple-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Founded</p>
        <p className="text-sm font-medium text-gray-900">
          {company.foundedYear || "N/A"}
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-orange-100 rounded-lg">
        <MapPin className="h-4 w-4 text-orange-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Website</p>
        <p className="text-sm font-medium text-gray-900">
          {company.website ? (() => {
            try {
              return new URL(company.website).hostname;
            } catch {
              return company.website;
            }
          })() : "N/A"}
        </p>
      </div>
    </div>
  </div>
);

export default function AdminCompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCompanies({ page, pageSize, search: searchQuery });
      setData(response.data);
      setTotalRows(response.total);
    } catch (error) {
      console.error("Failed to load companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleRowSelectionChange = (selectedRows: Company[]) => {
    const newSelection: RowSelectionState = {};
    selectedRows.forEach((row) => {
      newSelection[row._id] = true;
    });
    setRowSelection(newSelection);
  };

  const handleExpandedChange = (newExpanded: ExpandedState) => {
    setExpanded(newExpanded);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleViewCompany = (company: Company) => {
    console.log("View company:", company);
  };

  const handleEditCompany = (company: Company) => {
    console.log("Edit company:", company);
  };

  const handleVerifyCompany = async (company: Company) => {
    try {
      await adminService.verifyCompany(company._id);
      await loadData();
    } catch (error) {
      console.error("Failed to verify company:", error);
      setError("Failed to update company verification status.");
    }
  };

  const handleBlockCompany = (company: Company) => {
    console.log("Block company:", company);
  };

  const tableColumns = columns({
    onView: handleViewCompany,
    onEdit: handleEditCompany,
    onVerify: handleVerifyCompany,
    onBlock: handleBlockCompany,
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage company profiles and verifications</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <DataTable
        columns={tableColumns}
        data={data}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onRowSelectionChange={handleRowSelectionChange}
        onExpandedChange={handleExpandedChange}
        initialRowSelection={rowSelection}
        initialExpanded={expanded}
        searchPlaceholder="Search companies..."
        expandable={true}
        renderExpandedContent={renderExpandedContent}
      />
    </div>
  );
}
