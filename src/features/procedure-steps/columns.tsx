"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { RowActionsMenu } from "@/components/tables/row-actions-menu";
import type { Dict } from "@/lib/dictionaries";
import type { Procedure } from "@/types/procedure";
import type { ProcedureStep } from "@/types/procedureStep";
import type { Step } from "@/types/step";

export interface ProcedureStepColumnsOptions {
  dict: Dict;
  procedures: Procedure[];
  steps: Step[];
  /** Hide the procedure column — used when embedded in a procedure detail view. */
  hideProcedureColumn?: boolean;
  onDelete?: (link: ProcedureStep) => void;
}

/**
 * No embedded objects from the API — resolve names client-side from parallel
 * queries. TODO: ask backend to embed for the list endpoint and drop the maps.
 */
export function buildProcedureStepColumns({
  dict,
  procedures,
  steps,
  hideProcedureColumn,
  onDelete,
}: ProcedureStepColumnsOptions): ColumnDef<ProcedureStep>[] {
  const cols = dict.procedure_steps.list.columns;
  const procedureByUuid = new Map(procedures.filter((p) => p.uuid).map((p) => [p.uuid!, p]));
  const stepByUuid = new Map(steps.filter((s) => s.uuid).map((s) => [s.uuid!, s]));

  const columns: ColumnDef<ProcedureStep>[] = [];

  if (!hideProcedureColumn) {
    columns.push({
      id: "procedure",
      accessorKey: "procedure",
      header: cols.procedure,
      cell: ({ row }) => {
        const procedure = procedureByUuid.get(row.original.procedure);
        return (
          <div className="px-4 py-3 text-gray-900">
            {procedure?.name ?? dict.procedure_steps.list.unknown_procedure}
          </div>
        );
      },
    });
  }

  columns.push({
    id: "step",
    accessorKey: "step",
    header: cols.step,
    cell: ({ row }) => {
      const step = stepByUuid.get(row.original.step);
      return (
        <div className="px-4 py-3 text-gray-900">
          {step?.name ?? dict.procedure_steps.list.unknown_step}
        </div>
      );
    },
  });

  columns.push({
    id: "order",
    accessorKey: "order",
    header: cols.order,
    cell: ({ row }) => (
      <div className="px-4 py-3 text-gray-700 font-mono">{row.original.order}</div>
    ),
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
