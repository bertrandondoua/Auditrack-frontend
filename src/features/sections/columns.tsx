"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Section } from "@/types/section";

export interface SectionColumnsOptions {
  dict: Dict;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
}

export function buildSectionColumns({
  dict,
  onEdit,
  onDelete,
}: SectionColumnsOptions): ColumnDef<Section>[] {
  const cols = dict.sections.list.columns;
  const status = dict.sections.status;

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
      id: "description",
      accessorKey: "description",
      header: cols.description,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700 max-w-md truncate">
          {row.original.description || "—"}
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "is_active",
      header: cols.status,
      cell: ({ row }) => {
        const active = row.original.is_active ?? true;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
              active ? "border-[#0CCE6B] text-[#0CCE6B]" : "border-[#86783F] text-[#86783F]"
            }`}
          >
            {active ? status.active : status.inactive}
          </span>
        );
      },
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
