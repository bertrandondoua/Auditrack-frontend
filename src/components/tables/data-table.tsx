"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Optional row-click handler. Receives the underlying row data. */
  onRowClick?: (row: TData) => void;
  /** Optional toolbar rendered above the table (search, filters, etc.). */
  toolbar?: React.ReactNode;
  /** Optional empty-state message. */
  emptyMessage?: React.ReactNode;
  /** Show the pagination footer (default true). */
  showPagination?: boolean;
  /** Initial page size. */
  pageSize?: number;
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  toolbar,
  emptyMessage = "No results.",
  showPagination = true,
  pageSize = 10,
}: Readonly<DataTableProps<TData>>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: Row<TData>) => (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't fire row-click when the click came from an interactive control inside the row.
    if (
      (e.target as HTMLElement).closest("button, a, input, [role='checkbox'], [role='menuitem']")
    ) {
      return;
    }
    onRowClick?.(row.original);
  };

  return (
    <div className="space-y-3">
      {toolbar}
      <div className="bg-white">
        <div className="rounded-md border">
          <Table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <TableHeader className="text-xs text-gray-700 uppercase bg-[#F3F3F3] dark:bg-gray-700 dark:text-gray-400">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className="p-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b dark:border-gray-700 hover:bg-[#E7F0ED]",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={handleRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {showPagination && <DataTablePagination table={table} />}
      </div>
    </div>
  );
}
