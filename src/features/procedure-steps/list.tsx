"use client";

import { useMemo, useState } from "react";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { CustomSelect } from "@/components/shared/select";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useDeleteProcedureStepMutation,
  useGetProcedureStepsQuery,
} from "@/redux/features/procedureSteps/procedureStepsApiSlice";
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetStepsQuery } from "@/redux/features/steps/stepsApiSlice";
import type { ProcedureStep } from "@/types/procedureStep";

import { buildProcedureStepColumns } from "./columns";
import CreateProcedureStepDialog from "./create-dialog";

export interface ProcedureStepsListProps {
  dict: Dict;
  /** When set, scopes the list to a single procedure and hides the procedure column/filter. */
  procedureUuid?: string;
  embedded?: boolean;
}

export default function ProcedureStepsList({
  dict,
  procedureUuid,
  embedded,
}: ProcedureStepsListProps) {
  const { toast } = useToast();
  const [procedureFilter, setProcedureFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<ProcedureStep | null>(null);

  const effectiveProcedure =
    procedureUuid ?? (procedureFilter === "all" ? undefined : procedureFilter);

  const { data, isLoading, isFetching } = useGetProcedureStepsQuery({
    page,
    procedure: effectiveProcedure,
    ordering: "order",
  });

  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });
  const { data: stepsData } = useGetStepsQuery({ page: 1 });

  const [deleteProcedureStep, { isLoading: isDeleting }] = useDeleteProcedureStepMutation();

  const procedures = useMemo(() => proceduresData?.results ?? [], [proceduresData]);
  const steps = useMemo(() => stepsData?.results ?? [], [stepsData]);

  const columns = useMemo(
    () =>
      buildProcedureStepColumns({
        dict,
        procedures,
        steps,
        hideProcedureColumn: !!procedureUuid,
        onDelete: (link) => setDeletingTarget(link),
      }),
    [dict, procedures, steps, procedureUuid],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteProcedureStep(deletingTarget.uuid).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.common.actions.delete_success, dict);
      setDeletingTarget(null);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  if (isLoading && page === 1) return <Loading />;

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  const procedureFilterOptions = [
    { value: "all", label: dict.procedure_steps.list.all_procedures },
    ...procedures.filter((p) => p.uuid).map((p) => ({ value: p.uuid!, label: p.name })),
  ];

  return (
    <section className={embedded ? "space-y-4" : "mt-2 space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{dict.procedure_steps.list.title}</h1>
            <p className="text-sm text-[#585757]">
              {total} {dict.procedure_steps.list.subtitle}
            </p>
          </div>
          <CreateProcedureStepDialog dict={dict} lockedProcedureUuid={procedureUuid} />
        </div>
      )}

      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#585757]">
            {total} {dict.procedure_steps.list.subtitle}
          </p>
          <CreateProcedureStepDialog dict={dict} lockedProcedureUuid={procedureUuid} />
        </div>
      )}

      {!procedureUuid && (
        <div className="flex items-center gap-3">
          <div className="w-72">
            <CustomSelect
              placeholder={dict.procedure_steps.list.procedure_filter_placeholder}
              value={procedureFilter}
              onChange={(v) => {
                setProcedureFilter(v);
                setPage(1);
              }}
              options={procedureFilterOptions}
            />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.procedure_steps.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <ConfirmDialog
        open={!!deletingTarget}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title={dict.common.actions.confirm_delete_title}
        description={dict.common.actions.confirm_delete_description}
        confirmLabel={dict.common.actions.delete}
        cancelLabel={dict.common.cancel}
        destructive
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
