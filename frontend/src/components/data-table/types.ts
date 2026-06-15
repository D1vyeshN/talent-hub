import { ColumnDef, RowSelectionState, ExpandedState, ColumnFiltersState, SortingState } from "@tanstack/react-table";

export type DataTableMode = "client" | "server";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  mode?: DataTableMode;
  // Server-side props
  totalRows?: number;
  page?: number;
  pageSize?: number;
  isFetching?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sort: { field: string; direction: "asc" | "desc" } | undefined) => void;
  onSearch?: (search: string) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  // Server-side controlled props (optional - when provided, parent manages state)
  searchValue?: string;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  // Client-side props
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  initialPagination?: { pageIndex: number; pageSize: number };
  // Common props
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  initialRowSelection?: RowSelectionState;
  initialExpanded?: ExpandedState;
  searchPlaceholder?: string;
  searchable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  filterable?: boolean;
  renderExpandedContent?: (row: TData) => React.ReactNode;
  globalFilterFn?: (row: any, columnId: string, value: string) => boolean;
  // Custom render props
  renderToolbar?: (props: ToolbarRenderProps) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
}

export interface ToolbarRenderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  selectedCount: number;
  onClearSelection: () => void;
  onRefresh: () => void;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  selectedCount?: number;
  onClearSelection?: () => void;
}
