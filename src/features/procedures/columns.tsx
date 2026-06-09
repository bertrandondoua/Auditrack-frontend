"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Procedure } from "@/types/procedure";

export interface ProcedureColumnsOptions {
  dict: Dict;
  onEdit: (procedure: Procedure) => void;
  onDelete: (procedure: Procedure) => void;
}

export function buildProcedureColumns({
  dict,
  onEdit,
  onDelete,
}: ProcedureColumnsOptions): ColumnDef<Procedure>[] {
  const cols = dict.procedures.list.columns;

  return [
    {
      id: "name",
      accessorKey: "name",
      header: cols.name,
      cell: ({ row }) => (
        <div className="px-4 py-3 font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      id: "duration",
      accessorKey: "duration",
      header: cols.duration,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{row.original.duration ?? "—"}</div>
      ),
    },
    {
      id: "alert",
      accessorKey: "alert",
      header: cols.alert,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-700">{row.original.alert ?? "—"}</div>,
    },
    {
      id: "actions",
      header: cols.actions,
      cell: ({ row }) => (
        <RowActionsMenu
          items={[
            { label: dict.common.actions.edit, onClick: () => onEdit(row.original) },
            {
              label: dict.common.actions.delete,
              onClick: () => onDelete(row.original),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];
}
