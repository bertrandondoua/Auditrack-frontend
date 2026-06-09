"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Organization, OrganizationType } from "@/types/organization";

export interface OrganizationColumnsOptions {
  dict: Dict;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
}

export function buildOrganizationColumns({
  dict,
  onEdit,
  onDelete,
}: OrganizationColumnsOptions): ColumnDef<Organization>[] {
  const cols = dict.organisations.list.columns;

  return [
    {
      id: "name",
      accessorKey: "name",
      header: cols.name,
      cell: ({ row }) => {
        const org = row.original;
        const initials = org.name?.slice(0, 2).toUpperCase() ?? "?";
        return (
          <div className="flex items-center gap-4 px-4 py-2 font-medium text-gray-900">
            <div className="h-10 w-10 rounded-full bg-[#126D4E] text-white flex items-center justify-center py-2.5 px-2 box-border">
              {initials}
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{org.name}</div>
              {org.email && <div className="text-sm text-gray-500">{org.email}</div>}
            </div>
          </div>
        );
      },
    },
    {
      id: "type",
      accessorKey: "type",
      header: cols.type,
      cell: ({ row }) => {
        const value = row.original.type as OrganizationType;
        return (
          <span className="text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border border-[#126D4E] text-[#126D4E]">
            {dict.organisations.types[value] ?? value}
          </span>
        );
      },
    },
    {
      id: "contact",
      accessorKey: "phone_number",
      header: cols.contact,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-900">{row.original.phone_number ?? "—"}</div>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: cols.email,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-900">{row.original.email ?? "—"}</div>,
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
