"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Section } from "@/types/section";
import type { Team } from "@/types/team";

export interface TeamColumnsOptions {
  dict: Dict;
  sections: Section[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export function buildTeamColumns({
  dict,
  sections,
  onEdit,
  onDelete,
}: TeamColumnsOptions): ColumnDef<Team>[] {
  const cols = dict.teams.list.columns;
  const sectionByUuid = new Map(sections.filter((s) => s.uuid).map((s) => [s.uuid!, s]));

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
      id: "lead",
      accessorKey: "team_lead_name",
      header: cols.lead,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">
          <div>{row.original.team_lead_name}</div>
          <div className="text-xs text-gray-500">{row.original.team_lead_email}</div>
        </div>
      ),
    },
    {
      id: "section",
      accessorKey: "section",
      header: cols.section,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">
          {row.original.section
            ? (sectionByUuid.get(row.original.section)?.name ?? dict.teams.list.unknown_section)
            : "—"}
        </div>
      ),
    },
    {
      id: "members",
      accessorKey: "number_of_members",
      header: cols.members,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700 font-mono">
          {row.original.number_of_members ?? "—"}
        </div>
      ),
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
