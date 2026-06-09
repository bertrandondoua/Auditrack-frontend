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
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";
import { useDeleteTeamMutation, useGetTeamsQuery } from "@/redux/features/team/teamApiSlice";
import type { Team } from "@/types/team";

import { buildTeamColumns } from "./columns";
import CreateTeamDialog from "./create-dialog";
import EditTeamDialog from "./edit-dialog";

export default function TeamsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Team | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Team | null>(null);

  const { data, isLoading, isFetching } = useGetTeamsQuery({
    page,
    search: search || undefined,
  });

  const { data: sectionsData } = useGetSectionsQuery({ page: 1 });

  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();

  const sections = useMemo(() => sectionsData?.results ?? [], [sectionsData]);

  const columns = useMemo(
    () =>
      buildTeamColumns({
        dict,
        sections,
        onEdit: (team) => setEditing(team),
        onDelete: (team) => setDeletingTarget(team),
      }),
    [dict, sections],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteTeam(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.teams.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.teams.list.subtitle}
          </p>
        </div>
        <CreateTeamDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.teams.list.search_placeholder}
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
        emptyMessage={dict.teams.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <EditTeamDialog
        dict={dict}
        team={editing}
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
