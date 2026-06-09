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
import {
  useDeleteDocumentTypeMutation,
  useGetDocumentTypesQuery,
} from "@/redux/features/documents/documentTypesApiSlice";
import type { DocumentType } from "@/types/document";

import { buildDocumentTypeColumns } from "./columns";
import CreateDocumentTypeDialog from "./create-dialog";
import EditDocumentTypeDialog from "./edit-dialog";

export default function DocumentTypesList({ dict }: { dict: Dict }) {
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
  } = useListPage<DocumentType>();
  const [editing, setEditing] = useState<DocumentType | null>(null);

  const { data, isLoading, isFetching } = useGetDocumentTypesQuery({
    page,
    search: search || undefined,
  });

  const [deleteDocType, { isLoading: isDeleting }] = useDeleteDocumentTypeMutation();

  const columns = useMemo(
    () =>
      buildDocumentTypeColumns({
        dict,
        onEdit: setEditing,
        onDelete: setDeletingTarget,
      }),
    [dict, setDeletingTarget],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteDocType(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.document_types.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.document_types.list.subtitle}
          </p>
        </div>
        <CreateDocumentTypeDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.document_types.list.search_placeholder}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.document_types.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <EditDocumentTypeDialog
        dict={dict}
        docType={editing}
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
