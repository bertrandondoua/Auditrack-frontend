"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { User } from "@/types/user";

export interface UserColumnsOptions {
  dict: Dict;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function buildUserColumns({
  dict,
  onEdit,
  onDelete,
  onResetPassword,
}: UserColumnsOptions): ColumnDef<User>[] {
  const cols = dict.users.list.columns;

  return [
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name ?? ""}`.trim(),
      header: cols.name,
      cell: ({ row }) => {
        const u = row.original;
        const initials = `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3 px-4 py-2 font-medium text-gray-900">
            <div className="h-9 w-9 rounded-full bg-[#126D4E] text-white flex items-center justify-center text-sm">
              {initials || "?"}
            </div>
            <div>
              {u.first_name} {u.last_name ?? ""}
            </div>
          </div>
        );
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: cols.email,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-900">{row.original.email}</div>,
    },
    {
      id: "role",
      accessorKey: "role",
      header: cols.role,
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <span className="text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border border-[#126D4E] text-[#126D4E]">
            {role ? (dict.users.roles[role] ?? role) : "—"}
          </span>
        );
      },
    },
    {
      id: "status",
      header: cols.status,
      cell: ({ row }) => {
        const active = row.original.is_active ?? true;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
              active ? "border-[#0CCE6B] text-[#0CCE6B]" : "border-[#86783F] text-[#86783F]"
            }`}
          >
            {active ? dict.users.status.active : dict.users.status.inactive}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: cols.actions,
      cell: ({ row }) => (
        <RowActionsMenu
          items={[
            { label: dict.common.actions.edit, onClick: () => onEdit(row.original) },
            {
              label: dict.users.reset.action,
              onClick: () => onResetPassword(row.original),
            },
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
