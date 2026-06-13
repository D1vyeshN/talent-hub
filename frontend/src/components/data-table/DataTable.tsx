"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  ExpandedState,
  ColumnFiltersState,
  ColumnDef,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, ArrowUpDown, Loader2 } from "lucide-react";
import { DataTableProps, DataTableMode, ToolbarRenderProps } from "./types";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function DataTable<TData, TValue>({
  columns,
  data,
  mode = "client",
  // Server-side props
  totalRows,
  page = 1,
  pageSize = 10,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearch,
  onFilterChange,
  // Client-side props
  initialSorting = [],
  initialFilters = [],
  initialPagination = { pageIndex: 0, pageSize: 10 },
  // Common props
  onRowSelectionChange,
  onExpandedChange,
  initialRowSelection = {},
  initialExpanded = {},
  searchPlaceholder = "Search...",
  searchable = true,
  selectable = false,
  expandable = false,
  filterable = false,
  renderExpandedContent,
  globalFilterFn,
  // Custom render props
  renderToolbar,
  renderEmpty,
  renderLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection);
  const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(globalFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Trigger search when debounced value changes (server mode)
  useEffect(() => {
    if (mode === "server" && onSearch) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch, mode]);

  // Trigger filter change (server mode)
  useEffect(() => {
    if (mode === "server" && onFilterChange) {
      onFilterChange(columnFilters);
    }
  }, [columnFilters, onFilterChange, mode]);

  // Reset pagination when filters change (client mode)
  useEffect(() => {
    if (mode === "client") {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [columnFilters, globalFilter, mode]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Client mode: use built-in models
    ...(mode === "client" && {
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    }),
    // Server mode: manual pagination
    ...(mode === "server" && {
      manualPagination: true,
      pageCount: Math.ceil((totalRows || 0) / pageSize),
    }),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      if (mode === "server" && newSorting.length > 0 && onSortChange) {
        onSortChange({
          field: newSorting[0].id,
          direction: newSorting[0].desc ? "desc" : "asc",
        });
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (mode === "client") {
        const newPagination = typeof updater === "function" ? updater(pagination) : updater;
        setPagination(newPagination);
      } else if (mode === "server" && onPageChange) {
        const newPagination = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater;
        onPageChange(newPagination.pageIndex + 1);
      }
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      expanded,
      ...(mode === "client" && {
        pagination,
      }),
      ...(mode === "server" && {
        pagination: {
          pageIndex: page - 1,
          pageSize,
        },
      }),
    },
    ...(globalFilterFn && { globalFilterFn }),
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
  };

  const handleRefresh = () => {
    setGlobalFilter("");
    setDebouncedSearchValue("");
    setColumnFilters([]);
    if (mode === "server" && onPageChange) {
      onPageChange(1);
    } else if (mode === "client") {
      setPagination({ pageIndex: 0, pageSize: 10 });
    }
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  const handleClearFilters = () => {
    setColumnFilters([]);
    setGlobalFilter("");
  };

  const toolbarProps: ToolbarRenderProps = {
    searchValue: globalFilter,
    onSearchChange: handleSearchChange,
    searchPlaceholder,
    selectedCount: Object.keys(rowSelection).length,
    onClearSelection: handleClearSelection,
    onRefresh: handleRefresh,
  };

  const currentPage = mode === "client" ? pagination.pageIndex + 1 : page;
  const currentPageSize = mode === "client" ? pagination.pageSize : pageSize;
  const currentTotalRows = mode === "client" ? table.getFilteredRowModel().rows.length : (totalRows || 0);
  const pageCount = mode === "client" ? table.getPageCount() : Math.ceil((totalRows || 0) / pageSize);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {searchable && (
        <Card padding="sm">
          {renderToolbar ? (
            renderToolbar(toolbarProps)
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              {Object.keys(rowSelection).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {Object.keys(rowSelection).length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Table */}
      <Card padding="none">
        <div className="relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600 font-medium">Loading...</span>
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {selectable && (
                    <TableHead className="w-12 px-5 py-3">
                      <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableHead>
                  )}
                  {expandable && <TableHead className="w-12 px-5 py-3" />}
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        header.column.getToggleSortingHandler() && "cursor-pointer hover:text-gray-700"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" && (
                        <ArrowUpDown className="w-3 h-3 ml-1 inline" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ArrowUpDown className="w-3 h-3 ml-1 inline rotate-180" />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {renderLoading && isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (expandable ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    {renderLoading()}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (expandable ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    {renderEmpty ? renderEmpty() : "No data available"}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {selectable && (
                        <TableCell className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                      )}
                      {expandable && (
                        <TableCell className="px-5 py-4">
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
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-5 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && renderExpandedContent && (
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell
                          colSpan={
                            columns.length +
                            (selectable ? 1 : 0) +
                            (expandable ? 1 : 0)
                          }
                          className="px-5 py-4 bg-gray-50"
                        >
                          {renderExpandedContent(row.original as TData)}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {currentTotalRows > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 w-1/3">
            Showing {currentPage === 1 ? 1 : (currentPage - 1) * currentPageSize + 1} to{" "}
            {Math.min(currentPage * currentPageSize, currentTotalRows)}{" "}
            of {currentTotalRows} results
          </div>
          <Pagination className="w-2/3 justify-end">
            <PaginationContent>
              <PaginationItem key="previous">
                <PaginationPrevious
                  onClick={() => {
                    if (mode === "client") {
                      table.previousPage();
                    } else if (onPageChange) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {pageCount > 0 &&
                Array.from({ length: pageCount }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => {
                        if (mode === "client") {
                          table.setPageIndex(i);
                        } else if (onPageChange) {
                          onPageChange(i + 1);
                        }
                      }}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem key="next">
                <PaginationNext
                  onClick={() => {
                    if (mode === "client") {
                      table.nextPage();
                    } else if (onPageChange) {
                      onPageChange(currentPage + 1);
                    }
                  }}
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
