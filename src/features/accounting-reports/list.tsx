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
import {
  useDeleteAccountingReportMutation,
  useGetAccountingReportsQuery,
} from "@/redux/features/accountingReports/accountingReportsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import type { AccountingReport } from "@/types/accountingReport";

import { buildAccountingReportColumns } from "./columns";
import CreateAccountingReportDialog from "./create-dialog";

export default function AccountingReportsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [orgFilter, setOrgFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<AccountingReport | null>(null);

  const { data, isLoading, isFetching } = useGetAccountingReportsQuery({
    page,
    organization: orgFilter === "all" ? undefined : orgFilter,
    ordering: "-deposited_at",
  });

  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const [deleteReport, { isLoading: isDeleting }] = useDeleteAccountingReportMutation();
  // Backend doesn't expose /core/accounting-reports/{uuid}/validate/ —
  // only `deposite/`. See BACKEND_MISMATCHES.md §2. Validate row action is hidden.

  const organizations = useMemo(() => orgsData?.results ?? [], [orgsData]);

  const columns = useMemo(
    () =>
      buildAccountingReportColumns({
        dict,
        organizations,
        onDelete: (report) => setDeletingTarget(report),
      }),
    [dict, organizations],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteReport(deletingTarget.uuid).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.common.actions.delete_success, dict);
      setDeletingTarget(null);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  if (isLoading && page === 1) return <Loading />;

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  const orgFilterOptions = [
    { value: "all", label: dict.accounting_reports.list.all_orgs },
    ...organizations.filter((o) => o.uuid).map((o) => ({ value: o.uuid!, label: o.name })),
  ];

  return (
    <section className="mt-2 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{dict.accounting_reports.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.accounting_reports.list.subtitle}
          </p>
        </div>
        <CreateAccountingReportDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <CustomSelect
            placeholder={dict.accounting_reports.list.org_filter_placeholder}
            value={orgFilter}
            onChange={(v) => {
              setOrgFilter(v);
              setPage(1);
            }}
            options={orgFilterOptions}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.accounting_reports.list.empty}
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
