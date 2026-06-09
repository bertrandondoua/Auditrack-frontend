"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { SentQuestionnaire, SentQuestionnaireStatus } from "@/types/sentQuestionnaire";

const STATUS_CLASSES: Record<SentQuestionnaireStatus, string> = {
  SENT: "border-[#126D4E] text-[#126D4E]",
  RECEIVED: "border-[#0CCE6B] text-[#0CCE6B]",
  OVERDUE: "border-[#FF5733] text-[#FF5733]",
};

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export interface SentQuestionnaireColumnsOptions {
  dict: Dict;
  onDelete?: (q: SentQuestionnaire) => void;
}

export function buildSentQuestionnaireColumns({
  dict,
  onDelete,
}: SentQuestionnaireColumnsOptions): ColumnDef<SentQuestionnaire>[] {
  const cols = dict.questionnaires.list.columns;

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
      id: "send_date",
      accessorKey: "send_date",
      header: cols.send_date,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{formatDate(row.original.send_date)}</div>
      ),
    },
    {
      id: "return_date",
      accessorKey: "return_date",
      header: cols.return_date,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{formatDate(row.original.return_date)}</div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: cols.status,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
              STATUS_CLASSES[status] ?? "border-gray-400 text-gray-600"
            }`}
          >
            {dict.questionnaires.status[status] ?? status}
          </span>
        );
      },
    },
    {
      id: "files",
      header: cols.files,
      cell: ({ row }) =>
        row.original.files ? (
          <a
            href={row.original.files}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm px-4 py-3 inline-block"
          >
            {dict.questionnaires.list.view_file}
          </a>
        ) : (
          <span className="px-4 py-3 text-gray-400">—</span>
        ),
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
