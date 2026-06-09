"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { AccountingReport } from "@/types/accountingReport";
import type { Organization } from "@/types/organization";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export interface AccountingReportColumnsOptions {
  dict: Dict;
  organizations: Organization[];
  onValidate?: (report: AccountingReport) => void;
  onDelete?: (report: AccountingReport) => void;
}

export function buildAccountingReportColumns({
  dict,
  organizations,
  onValidate,
  onDelete,
}: AccountingReportColumnsOptions): ColumnDef<AccountingReport>[] {
  const cols = dict.accounting_reports.list.columns;
  const orgByUuid = new Map(organizations.filter((o) => o.uuid).map((o) => [o.uuid!, o]));

  return [
    {
      id: "organization",
      accessorKey: "organization",
      header: cols.organization,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-900">
          {orgByUuid.get(row.original.organization)?.name ??
            dict.accounting_reports.list.unknown_org}
        </div>
      ),
    },
    {
      id: "fiscal_year",
      accessorKey: "fiscal_year",
      header: cols.fiscal_year,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{row.original.fiscal_year ?? "—"}</div>
      ),
    },
    {
      id: "deposited_at",
      accessorKey: "deposited_at",
      header: cols.deposited_at,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{formatDate(row.original.deposited_at)}</div>
      ),
    },
    {
      id: "status",
      header: cols.status,
      cell: ({ row }) => {
        const validated = !!row.original.acknowledge_receipt;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
              validated ? "border-[#0CCE6B] text-[#0CCE6B]" : "border-[#86783F] text-[#86783F]"
            }`}
          >
            {validated
              ? dict.accounting_reports.status.validated
              : dict.accounting_reports.status.pending}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: cols.actions,
      cell: ({ row }) =>
        onValidate || onDelete ? (
          <RowActionsMenu
            items={[
              {
                label: dict.accounting_reports.list.validate_action,
                onClick: () => onValidate?.(row.original),
                hidden: !onValidate || !!row.original.acknowledge_receipt,
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
