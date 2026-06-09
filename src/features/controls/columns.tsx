"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Control, ControlStatus } from "@/types/control";
import type { Organization } from "@/types/organization";

const STATUS_CLASSES: Record<ControlStatus, string> = {
  created: "border-[#86783F] text-[#86783F]",
  opened: "border-[#126D4E] text-[#126D4E]",
  completed: "border-[#0CCE6B] text-[#0CCE6B]",
};

export interface ControlColumnsOptions {
  dict: Dict;
  organizations: Organization[];
  onDelete?: (control: Control) => void;
}

export function buildControlColumns({
  dict,
  organizations,
  onDelete,
}: ControlColumnsOptions): ColumnDef<Control>[] {
  const cols = dict.controls.list.columns;
  const orgByUuid = new Map(organizations.filter((o) => o.uuid).map((o) => [o.uuid!, o]));

  return [
    {
      id: "organization",
      accessorKey: "organization",
      header: cols.organization,
      cell: ({ row }) => {
        const org = row.original.organization
          ? orgByUuid.get(row.original.organization)
          : undefined;
        return (
          <div className="px-4 py-3 font-medium text-gray-900">
            {org?.name ?? dict.controls.list.unknown_org}
          </div>
        );
      },
    },
    {
      id: "exercise_year",
      accessorKey: "exercise_year",
      header: cols.exercise_year,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{row.original.exercise_year ?? "—"}</div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: cols.status,
      cell: ({ row }) => {
        const status = (row.original.status ?? "created") as ControlStatus;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${STATUS_CLASSES[status]}`}
          >
            {dict.controls.status[status]}
          </span>
        );
      },
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
