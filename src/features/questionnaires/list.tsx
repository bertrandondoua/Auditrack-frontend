"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { CustomSelect } from "@/components/shared/select";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useDeleteSentQuestionnaireMutation,
  useGetSentQuestionnairesQuery,
} from "@/redux/features/questionnaire/questionnaireApiSlice";
import type { SentQuestionnaire } from "@/types/sentQuestionnaire";

import { buildSentQuestionnaireColumns } from "./columns";

type StatusFilter = "all" | "SENT" | "RECEIVED" | "OVERDUE";

export default function QuestionnairesList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<SentQuestionnaire | null>(null);

  const { data, isLoading, isFetching } = useGetSentQuestionnairesQuery({
    page,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [deleteSentQuestionnaire, { isLoading: isDeleting }] = useDeleteSentQuestionnaireMutation();

  const columns = useMemo(
    () =>
      buildSentQuestionnaireColumns({
        dict,
        onDelete: (q) => setDeletingTarget(q),
      }),
    [dict],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteSentQuestionnaire(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.questionnaires.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.questionnaires.list.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.questionnaires.list.search_placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            placeholder={dict.questionnaires.list.status_filter_placeholder}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
            options={[
              { value: "all", label: dict.common.all },
              { value: "SENT", label: dict.questionnaires.status.SENT },
              { value: "RECEIVED", label: dict.questionnaires.status.RECEIVED },
              { value: "OVERDUE", label: dict.questionnaires.status.OVERDUE },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.questionnaires.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />

      <div className="rounded-md border border-dashed border-[#E7F0ED] bg-[#F8FBF9] p-4 text-sm text-[#585757]">
        {dict.questionnaires.list.response_editor_deferred}
      </div>

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
