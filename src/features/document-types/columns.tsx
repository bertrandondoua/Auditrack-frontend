"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { DocumentType } from "@/types/document";

export interface DocumentTypeColumnsOptions {
  dict: Dict;
  onEdit: (docType: DocumentType) => void;
  onDelete: (docType: DocumentType) => void;
}

export function buildDocumentTypeColumns({
  dict,
  onEdit,
  onDelete,
}: DocumentTypeColumnsOptions): ColumnDef<DocumentType>[] {
  const cols = dict.document_types.list.columns;

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
      id: "short_name",
      accessorKey: "short_name",
      header: cols.short_name,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">{row.original.short_name ?? "—"}</div>
      ),
    },
    {
      id: "is_opening",
      accessorKey: "is_opening_doc_type",
      header: cols.is_opening,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.is_opening_doc_type ? "✓" : "—"}</span>
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
