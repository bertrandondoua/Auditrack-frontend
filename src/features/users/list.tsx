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
import { useDeleteUserMutation, useGetUsersQuery } from "@/redux/features/users/usersApiSlice";
import type { User } from "@/types/user";

import { buildUserColumns } from "./columns";
import CreateUserDialog from "./create-dialog";
import EditUserDialog from "./edit-dialog";

export default function UsersList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<User | null>(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    search: search || undefined,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const columns = useMemo(
    () =>
      buildUserColumns({
        dict,
        onEdit: (u) => setEditing(u),
        onDelete: (u) => setDeletingTarget(u),
      }),
    [dict],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteUser(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.users.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.users.list.subtitle}
          </p>
        </div>
        <CreateUserDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.users.list.search_placeholder}
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
        emptyMessage={dict.users.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <EditUserDialog
        dict={dict}
        user={editing}
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
