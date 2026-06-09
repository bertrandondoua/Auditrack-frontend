"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useDeleteProgramMutation,
  useGetProgramsQuery,
} from "@/redux/features/programs/programsApiSlice";
import type { Program } from "@/types/program";

import { buildProgramColumns } from "./columns";
import CreateProgramDialog from "./create-dialog";

export default function ProgramsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const router = useRouter();
  const { lang } = useParams<{ lang: Locale }>();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Program | null>(null);

  const { data, isLoading, isFetching } = useGetProgramsQuery({
    page,
    search: search || undefined,
    ordering: "-program_year",
  });

  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();

  const navigateToDetail = (program: Program) => {
    if (!program.uuid) return;
    router.push(`/${lang}/configuration/programs/${program.uuid}`);
  };

  const columns = useMemo(
    () =>
      buildProgramColumns({
        dict,
        onEdit: navigateToDetail,
        onDelete: (program) => setDeletingTarget(program),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict, lang],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteProgram(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.programs.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.programs.list.subtitle}
          </p>
        </div>
        <CreateProgramDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.programs.list.search_placeholder}
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
        onRowClick={navigateToDetail}
        showPagination={false}
        emptyMessage={dict.programs.list.empty}
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
        description={
          deletingTarget
            ? `${dict.common.actions.confirm_delete_description} (${deletingTarget.program_year})`
            : dict.common.actions.confirm_delete_description
        }
        confirmLabel={dict.common.actions.delete}
        cancelLabel={dict.common.cancel}
        destructive
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
