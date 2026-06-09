"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Procedure } from "@/types/procedure";
import type { Step } from "@/types/step";
import type { Tag } from "@/types/tag";

export interface TagColumnsOptions {
  dict: Dict;
  procedures: Procedure[];
  steps: Step[];
  onDelete?: (tag: Tag) => void;
}

export function buildTagColumns({
  dict,
  procedures,
  steps,
  onDelete,
}: TagColumnsOptions): ColumnDef<Tag>[] {
  const cols = dict.tags.list.columns;
  const procedureByUuid = new Map(procedures.filter((p) => p.uuid).map((p) => [p.uuid!, p]));
  const stepByUuid = new Map(steps.filter((s) => s.uuid).map((s) => [s.uuid!, s]));

  return [
    {
      id: "procedure",
      accessorKey: "procedure",
      header: cols.procedure,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-900">
          {procedureByUuid.get(row.original.procedure)?.name ?? dict.tags.list.unknown_procedure}
        </div>
      ),
    },
    {
      id: "edge",
      header: cols.edge,
      cell: ({ row }) => {
        const from = stepByUuid.get(row.original.from_step)?.name ?? "?";
        const to = stepByUuid.get(row.original.to_step)?.name ?? "?";
        return (
          <div className="flex items-center gap-2 px-4 py-3 text-gray-900">
            <span>{from}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span>{to}</span>
          </div>
        );
      },
    },
    {
      id: "duration",
      accessorKey: "duration",
      header: cols.duration,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-700">{row.original.duration}</div>,
    },
    {
      id: "actions",
      header: cols.actions,
      cell: ({ row }) =>
        onDelete ? (
          <RowActionsMenu
            items={[
              {
                label: dict.common.actions.delete,
                onClick: () => onDelete(row.original),
                destructive: true,
              },
            ]}
          />
        ) : null,
    },
  ];
}
