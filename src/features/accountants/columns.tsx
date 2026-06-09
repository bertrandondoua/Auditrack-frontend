"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Accountant } from "@/types/accountant";

export interface AccountantColumnsOptions {
  dict: Dict;
  onEdit: (accountant: Accountant) => void;
  onDelete: (accountant: Accountant) => void;
}

export function buildAccountantColumns({
  dict,
  onEdit,
  onDelete,
}: AccountantColumnsOptions): ColumnDef<Accountant>[] {
  const cols = dict.accountants.list.columns;

  return [
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name ?? ""}`.trim(),
      header: cols.name,
      cell: ({ row }) => {
        const acc = row.original;
        const initials = `${acc.first_name?.[0] ?? ""}${acc.last_name?.[0] ?? ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3 px-4 py-2 font-medium text-gray-900">
            <div className="h-9 w-9 rounded-full bg-[#126D4E] text-white flex items-center justify-center text-sm">
              {initials || "?"}
            </div>
            <div>
              {acc.first_name} {acc.last_name ?? ""}
            </div>
          </div>
        );
      },
    },
    {
      id: "title",
      accessorKey: "title",
      header: cols.title,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-700">{row.original.title ?? "—"}</div>,
    },
    {
      id: "email",
      accessorKey: "email",
      header: cols.email,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-900">{row.original.email}</div>,
    },
    {
      id: "phone",
      accessorKey: "phone_number",
      header: cols.phone,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-900">{row.original.phone_number}</div>,
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
