"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { Dict } from "@/lib/dictionaries";
import type { LogEntry } from "@/types/log";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function stringifyChanges(changes: LogEntry["changes"]): string {
  if (changes == null) return "—";
  if (typeof changes === "string") return changes;
  try {
    return JSON.stringify(changes);
  } catch {
    return String(changes);
  }
}

const ACTION_CLASSES: Record<string, string> = {
  created: "border-[#0CCE6B] text-[#0CCE6B]",
  updated: "border-[#126D4E] text-[#126D4E]",
  deleted: "border-[#FF5733] text-[#FF5733]",
};

export function buildLogColumns(dict: Dict): ColumnDef<LogEntry>[] {
  const cols = dict.logs.list.columns;

  return [
    {
      id: "timestamp",
      accessorKey: "timestamp",
      header: cols.timestamp,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700 font-mono text-xs">
          {formatDateTime(row.original.timestamp)}
        </div>
      ),
    },
    {
      id: "model",
      accessorKey: "model",
      header: cols.model,
      cell: ({ row }) => <div className="px-4 py-3 text-gray-900">{row.original.model ?? "—"}</div>,
    },
    {
      id: "action",
      accessorKey: "action",
      header: cols.action,
      cell: ({ row }) => {
        const action = (row.original.action ?? "").toLowerCase();
        const cls = ACTION_CLASSES[action] ?? "border-gray-400 text-gray-600";
        return (
          <span
            className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${cls}`}
          >
            {row.original.action ?? "—"}
          </span>
        );
      },
    },
    {
      id: "user",
      header: cols.user,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-700">
          {row.original.user_display ?? row.original.user ?? "—"}
        </div>
      ),
    },
    {
      id: "object_id",
      accessorKey: "object_id",
      header: cols.object_id,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-500 font-mono text-xs">
          {row.original.object_id ?? "—"}
        </div>
      ),
    },
    {
      id: "changes",
      header: cols.changes,
      cell: ({ row }) => (
        <div className="px-4 py-3 text-gray-500 text-xs max-w-md truncate">
          {stringifyChanges(row.original.changes)}
        </div>
      ),
    },
  ];
}
