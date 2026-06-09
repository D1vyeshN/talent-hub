"use client";

import { Search, RefreshCw, Download, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTableToolbarProps } from "./types";

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  onExport,
  loading = false,
  selectedCount = 0,
  onClearSelection,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 w-64"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Selection count */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedCount} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              icon={<X className="h-4 w-4" />}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            disabled={loading}
          >
            Refresh
          </Button>
        )}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
