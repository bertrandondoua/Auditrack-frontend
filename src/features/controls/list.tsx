"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { CustomSelect } from "@/components/shared/select";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useDeleteControlMutation,
  useGetControlsQuery,
} from "@/redux/features/controls/controlsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import type { Control } from "@/types/control";

import { buildControlColumns } from "./columns";
import CreateControlDialog from "./create-dialog";

type StatusFilter = "all" | "created" | "opened" | "completed";

export default function ControlsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const router = useRouter();
  const { lang } = useParams<{ lang: Locale }>();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Control | null>(null);

  const { data, isLoading, isFetching } = useGetControlsQuery({
    page,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });

  const [deleteControl, { isLoading: isDeleting }] = useDeleteControlMutation();

  const organizations = useMemo(() => orgsData?.results ?? [], [orgsData]);

  const navigateToDetail = (control: Control) => {
    if (!control.uuid) return;
    router.push(`/${lang}/control/${control.uuid}`);
  };

  const columns = useMemo(
    () =>
      buildControlColumns({
        dict,
        organizations,
        onDelete: (control) => setDeletingTarget(control),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict, organizations, lang],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteControl(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.controls.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.controls.list.subtitle}
          </p>
        </div>
        <CreateControlDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.controls.list.search_placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            placeholder={dict.controls.list.status_filter_placeholder}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
            options={[
              { value: "all", label: dict.common.all },
              { value: "created", label: dict.controls.status.created },
              { value: "opened", label: dict.controls.status.opened },
              { value: "completed", label: dict.controls.status.completed },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        onRowClick={navigateToDetail}
        showPagination={false}
        emptyMessage={dict.controls.list.empty}
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
