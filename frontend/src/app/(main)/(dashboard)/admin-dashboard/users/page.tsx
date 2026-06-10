"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Ban, Trash2, Mail, Calendar } from "lucide-react";
import { adminService } from "@/features/admin/admin.service";
import type { User } from "@/types";
import type { RowSelectionState, ExpandedState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns = (handlers: {
  onBlock: (user: User) => void;
  onDelete: (user: User) => void;
}): ColumnDef<User, unknown>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: User } }) => (
      <div className="font-medium text-gray-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: { row: { original: User } }) => (
      <div className="text-gray-600">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }: { row: { original: User } }) => (
      <Badge
        variant={
          row.original.role === "admin"
            ? "default"
            : row.original.role === "recruiter"
            ? "info"
            : "success"
        }
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "isBlocked",
    header: "Status",
    cell: ({ row }: { row: { original: User } }) => (
      <Badge variant={row.original.isBlocked ? "error" : "success"}>
        {row.original.isBlocked ? "Blocked" : "Active"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: User } }) => (
      <div className="flex items-center gap-2">
        {row.original.role !== "admin" && (
          <Button variant="ghost" size="sm" icon={<Ban className="h-4 w-4" />} title={row.original.isBlocked ? "Unblock" : "Block"} onClick={() => handlers.onBlock(row.original)} />
        )}
        <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} title="Delete" onClick={() => handlers.onDelete(row.original)} />
      </div>
    ),
  },
];

const renderExpandedContent = (user: User) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Mail className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Email</p>
        <p className="text-sm font-medium text-gray-900">{user.email}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <Calendar className="h-4 w-4 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Joined</p>
        <p className="text-sm font-medium text-gray-900">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-100 rounded-lg">
        <Shield className="h-4 w-4 text-purple-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Verification</p>
        <p className="text-sm font-medium text-gray-900">
          {user.isVerified ? "Verified" : "Not Verified"}
        </p>
      </div>
    </div>
  </div>
);

export default function AdminUsersPage() {
  const [data, setData] = useState<User[]>([]);
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
      const response = await adminService.getUsers({ page, pageSize, search: searchQuery });
      setData(response.data);
      setTotalRows(response.total);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleRowSelectionChange = (selectedRows: User[]) => {
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

  const handleBlockUser = async (user: User) => {
    try {
      await adminService.toggleUserBan(user._id);
      await loadData();
    } catch (error) {
      console.error("Failed to block user:", error);
      setError("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await adminService.deleteUser(user._id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user.");
    }
  };

  const tableColumns = columns({
    onBlock: handleBlockUser,
    onDelete: handleDeleteUser,
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage platform users and their permissions</p>
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
        isFetching={loading}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onRowSelectionChange={handleRowSelectionChange}
        onExpandedChange={handleExpandedChange}
        initialRowSelection={rowSelection}
        initialExpanded={expanded}
        searchPlaceholder="Search users..."
        expandable={true}
        renderExpandedContent={renderExpandedContent}
      />
    </div>
  );
}
