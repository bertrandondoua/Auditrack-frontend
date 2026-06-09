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
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetStepsQuery } from "@/redux/features/steps/stepsApiSlice";
import { useDeleteTagMutation, useGetTagsQuery } from "@/redux/features/tags/tagsApiSlice";
import type { Tag } from "@/types/tag";

import { buildTagColumns } from "./columns";
import CreateTagDialog from "./create-dialog";

export default function TagsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [procedureFilter, setProcedureFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Tag | null>(null);

  const { data, isLoading, isFetching } = useGetTagsQuery({
    page,
    procedure: procedureFilter === "all" ? undefined : procedureFilter,
  });

  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });
  const { data: stepsData } = useGetStepsQuery({ page: 1 });

  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const procedures = useMemo(() => proceduresData?.results ?? [], [proceduresData]);
  const steps = useMemo(() => stepsData?.results ?? [], [stepsData]);

  const columns = useMemo(
    () =>
      buildTagColumns({
        dict,
        procedures,
        steps,
        onDelete: (tag) => setDeletingTarget(tag),
      }),
    [dict, procedures, steps],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteTag(deletingTarget.uuid).unwrap();
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
    { value: "all", label: dict.tags.list.all_procedures },
    ...procedures.filter((p) => p.uuid).map((p) => ({ value: p.uuid!, label: p.name })),
  ];

  return (
    <section className="mt-2 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{dict.tags.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.tags.list.subtitle}
          </p>
        </div>
        <CreateTagDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <CustomSelect
            placeholder={dict.tags.list.procedure_filter_placeholder}
            value={procedureFilter}
            onChange={(v) => {
              setProcedureFilter(v);
              setPage(1);
            }}
            options={procedureFilterOptions}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.tags.list.empty}
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
