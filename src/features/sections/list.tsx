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
  useDeleteSectionMutation,
  useGetSectionsQuery,
} from "@/redux/features/sections/sectionsApiSlice";
import type { Section } from "@/types/section";

import { buildSectionColumns } from "./columns";
import CreateSectionDialog from "./create-dialog";

export interface SectionsListProps {
  dict: Dict;
  /** When set, scopes the list to a single program and pre-fills the create dialog. */
  programUuid?: string;
  embedded?: boolean;
}

export default function SectionsList({ dict, programUuid, embedded }: SectionsListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { lang } = useParams<{ lang: Locale }>();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Section | null>(null);

  const { data, isLoading, isFetching } = useGetSectionsQuery({
    page,
    search: search || undefined,
    program: programUuid,
  });

  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

  const navigateToDetail = (section: Section) => {
    if (!section.uuid) return;
    router.push(`/${lang}/configuration/sections/${section.uuid}`);
  };

  const columns = useMemo(
    () =>
      buildSectionColumns({
        dict,
        onEdit: navigateToDetail,
        onDelete: (section) => setDeletingTarget(section),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict, lang],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteSection(deletingTarget.uuid).unwrap();
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
    <section className={embedded ? "space-y-4" : "mt-2 space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{dict.sections.list.title}</h1>
            <p className="text-sm text-[#585757]">
              {total} {dict.sections.list.subtitle}
            </p>
          </div>
          <CreateSectionDialog dict={dict} lockedProgramUuid={programUuid} />
        </div>
      )}
      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#585757]">
            {total} {dict.sections.list.subtitle}
          </p>
          <CreateSectionDialog dict={dict} lockedProgramUuid={programUuid} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.sections.list.search_placeholder}
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
        emptyMessage={dict.sections.list.empty}
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
