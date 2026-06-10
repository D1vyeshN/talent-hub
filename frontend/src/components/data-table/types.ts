import { ColumnDef, RowSelectionState, ExpandedState } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRows: number;
  page: number;
  pageSize: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sort: { field: string; direction: "asc" | "desc" }) => void;
  onSearch?: (search: string) => void;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  initialRowSelection?: RowSelectionState;
  initialExpanded?: ExpandedState;
  searchPlaceholder?: string;
  searchable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  renderExpandedContent?: (row: TData) => React.ReactNode;
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
