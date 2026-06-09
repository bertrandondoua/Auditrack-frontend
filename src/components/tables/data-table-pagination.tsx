"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: Readonly<DataTablePaginationProps<TData>>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const rowCount = table.getRowCount();
  const selected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between px-2 py-3 bg-white">
      <div className="flex-1 text-sm text-muted-foreground">
        {selected > 0 ? `${selected} of ${rowCount} selected` : `${rowCount} item(s)`}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
