"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  getExpandedRowModel,
  ExpandedState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { DataTableProps } from "./types";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRows,
  page = 1,
  pageSize = 10,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearch,
  onRowSelectionChange,
  onExpandedChange,
  initialRowSelection,
  initialExpanded,
  searchPlaceholder = "Search...",
  searchable = true,
  selectable = false,
  expandable = false,
  renderExpandedContent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection || {});
  const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded || {});
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalRows || 0) / pageSize),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      if (newSorting.length > 0 && onSortChange) {
        onSortChange({
          field: newSorting[0].id,
          direction: newSorting[0].desc ? "desc" : "asc",
        });
      }
    },
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      rowSelection,
      expanded,
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onRowSelectionChange) {
        const selectedRows = table
          .getSelectedRowModel()
          .rows.map((row) => row.original);
        onRowSelectionChange(selectedRows as TData[]);
      }
    },
    onExpandedChange: (updater) => {
      const newExpanded = typeof updater === "function" ? updater(expanded) : updater;
      setExpanded(newExpanded);
      if (onExpandedChange) {
        onExpandedChange(newExpanded);
      }
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setDebouncedSearchValue("");
    if (onPageChange) {
      onPageChange(1);
    }
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {searchable && (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          onRefresh={handleRefresh}
          selectedCount={Object.keys(rowSelection).length}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600 font-medium">Loading...</span>
            </div>
          </div>
        )}
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {expandable && <th className="w-12 px-4 py-3" />}
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-blue-200/50 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    {header.column.getIsSorted() === "asc" && (
                      <span className="ml-1 text-blue-600">↑</span>
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <span className="ml-1 text-blue-600">↓</span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (expandable ? 1 : 0)
                  }
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <>
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {expandable && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => row.toggleExpanded()}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && renderExpandedContent && (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (expandable ? 1 : 0)
                        }
                        className="px-4 py-4 bg-blue-50/30 border-b border-blue-100"
                      >
                        {renderExpandedContent(row.original as TData)}
                      </td>
                    </tr>
                  )}
                </>
              )))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && onPageSizeChange && (
        <DataTablePagination
          page={page || 1}
          pageSize={pageSize || 10}
          totalRows={totalRows || 0}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
