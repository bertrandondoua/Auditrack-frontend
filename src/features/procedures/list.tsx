"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useDeleteProcedureMutation,
  useGetProceduresQuery,
} from "@/redux/features/procedures/proceduresApiSlice";
import type { Procedure } from "@/types/procedure";

import { buildProcedureColumns } from "./columns";
import CreateProcedureDialog from "./create-dialog";
import EditProcedureDialog from "./edit-dialog";

export default function ProceduresList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Procedure | null>(null);

  const { data, isLoading, isFetching } = useGetProceduresQuery({
    page,
    search: search || undefined,
  });

  const [deleteProcedure, { isLoading: isDeleting }] = useDeleteProcedureMutation();

  const columns = useMemo(
    () =>
      buildProcedureColumns({
        dict,
        onEdit: (proc) => setEditing(proc),
        onDelete: (proc) => setDeletingTarget(proc),
      }),
    [dict],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteProcedure(deletingTarget.uuid).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.common.actions.delete_success, dict);
      setDeletingTarget(null);
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.procedures.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.procedures.list.subtitle}
          </p>
        </div>
        <CreateProcedureDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.procedures.list.search_placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.procedures.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <EditProcedureDialog
        dict={dict}
        procedure={editing}
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
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
