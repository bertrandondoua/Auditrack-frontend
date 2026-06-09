"use client";

import { useMemo, useState } from "react";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import { useListPage } from "@/hooks/useListPage";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useDeletePhaseMutation, useGetPhasesQuery } from "@/redux/features/phases/phasesApiSlice";
import type { Phase } from "@/types/phase";

import { buildPhaseColumns } from "./columns";
import CreatePhaseDialog from "./create-dialog";
import EditPhaseDialog from "./edit-dialog";

export default function PhasesList({ dict }: { dict: Dict }) {
  const {
    toast,
    searchInput,
    onSearchChange,
    search,
    page,
    setPage,
    deletingTarget,
    setDeletingTarget,
    closeDelete,
  } = useListPage<Phase>();
  const [editing, setEditing] = useState<Phase | null>(null);

  const { data, isLoading, isFetching } = useGetPhasesQuery({
    page,
    search: search || undefined,
  });

  const [deletePhase, { isLoading: isDeleting }] = useDeletePhaseMutation();

  const columns = useMemo(
    () =>
      buildPhaseColumns({
        dict,
        onEdit: setEditing,
        onDelete: setDeletingTarget,
      }),
    [dict, setDeletingTarget],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deletePhase(deletingTarget.uuid).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.common.actions.delete_success, dict);
      closeDelete();
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  if (isLoading && page === 1) return <Loading />;

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <section className="mt-2 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{dict.phases.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.phases.list.subtitle}
          </p>
        </div>
        <CreatePhaseDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.phases.list.search_placeholder}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.phases.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <EditPhaseDialog
        dict={dict}
        phase={editing}
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deletingTarget}
        onOpenChange={(open) => {
          if (!open) closeDelete();
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
