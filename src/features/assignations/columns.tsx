"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Accountant } from "@/types/accountant";
import type { Assignation } from "@/types/assignation";
import type { Organization } from "@/types/organization";

export interface AssignationColumnsOptions {
  dict: Dict;
  organizations: Organization[];
  accountants: Accountant[];
  /** Hide the organisation column — used in the per-org embedded view. */
  hideOrgColumn?: boolean;
  onDelete?: (assignation: Assignation) => void;
}

/**
 * The assignations endpoint returns UUIDs only — no embedded org/accountant
 * objects. We resolve names client-side from the orgs + accountants we've
 * fetched. TODO: ask the backend to embed those on the list endpoint so we
 * can drop the lookup maps.
 */
export function buildAssignationColumns({
  dict,
  organizations,
  accountants,
  hideOrgColumn,
  onDelete,
}: AssignationColumnsOptions): ColumnDef<Assignation>[] {
  const cols = dict.assignations.list.columns;
  const status = dict.assignations.status;

  const orgByUuid = new Map(organizations.filter((o) => o.uuid).map((o) => [o.uuid!, o]));
  const accountantByUuid = new Map(accountants.filter((a) => a.uuid).map((a) => [a.uuid!, a]));

  const columns: ColumnDef<Assignation>[] = [];

  if (!hideOrgColumn) {
    columns.push({
      id: "organization",
      accessorKey: "organization",
      header: cols.organization,
      cell: ({ row }) => {
        const org = orgByUuid.get(row.original.organization);
        return (
          <div className="px-4 py-3 text-gray-900">
            {org?.name ?? dict.assignations.list.unknown_org}
          </div>
        );
      },
    });
  }

  columns.push({
    id: "accountant",
    accessorKey: "accountant",
    header: cols.accountant,
    cell: ({ row }) => {
      const acc = accountantByUuid.get(row.original.accountant);
      const name = acc ? `${acc.first_name} ${acc.last_name ?? ""}`.trim() : null;
      return (
        <div className="px-4 py-3 text-gray-900">
          {name || dict.assignations.list.unknown_accountant}
        </div>
      );
    },
  });

  columns.push({
    id: "exercise_year",
    accessorKey: "exercise_year",
    header: cols.exercise_year,
    cell: ({ row }) => {
      const raw = row.original.exercise_year;
      // Stored as YYYY-MM-DD; surface only the year for display.
      const year = raw ? raw.slice(0, 4) : "—";
      return <div className="px-4 py-3 text-gray-700">{year}</div>;
    },
  });

  columns.push({
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
  });

  columns.push({
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
  });

  return columns;
}
