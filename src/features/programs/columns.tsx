"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Program } from "@/types/program";

export interface ProgramColumnsOptions {
  dict: Dict;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function buildProgramColumns({
  dict,
  onEdit,
  onDelete,
}: ProgramColumnsOptions): ColumnDef<Program>[] {
  const cols = dict.programs.list.columns;
  const statusDict = dict.programs.status;

  return [
    {
      id: "year",
      accessorKey: "program_year",
      header: cols.year,
      cell: ({ row }) => (
        <div className="px-4 py-3 font-medium text-gray-900">{row.original.program_year}</div>
      ),
    },
    {
      id: "status",
      accessorKey: "is_active",
      header: cols.status,
      cell: ({ row }) => {
        const active = row.original.is_active ?? false;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
              active ? "border-[#0CCE6B] text-[#0CCE6B]" : "border-[#86783F] text-[#86783F]"
            }`}
          >
            {active ? statusDict.active : statusDict.inactive}
          </span>
        );
      },
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: cols.created_at,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{formatDate(row.original.created_at)}</div>
      ),
    },
    {
      id: "actions",
      header: cols.actions,
      cell: ({ row }) =>
        onEdit || onDelete ? (
          <RowActionsMenu
            items={[
              {
                label: dict.common.actions.edit,
                onClick: () => onEdit?.(row.original),
                hidden: !onEdit,
              },
              {
                label: dict.common.actions.delete,
                onClick: () => onDelete?.(row.original),
                destructive: true,
                hidden: !onDelete,
              },
            ]}
          />
        ) : null,
    },
  ];
}
