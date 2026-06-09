"use client";

import { useMemo, useState } from "react";

import Loading from "@/app/[lang]/loading";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { CustomSelect } from "@/components/shared/select";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { fromYear, toYear } from "@/configs/constants";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useGetAccountantsQuery } from "@/redux/features/accountant/accountantApiSlice";
import {
  useDeleteAssignationMutation,
  useGetAssignationsQuery,
} from "@/redux/features/assignation/assignationApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import type { Assignation } from "@/types/assignation";

import { buildAssignationColumns } from "./columns";
import CreateAssignationDialog from "./create-dialog";

export interface AssignationsListProps {
  dict: Dict;
  /** When set, scopes the list to a single org and hides the org column/filter. */
  organizationUuid?: string;
  /** Title override (e.g. for the embedded org-detail variant). */
  titleOverride?: string;
  subtitleOverride?: string;
  /** Hide the standalone header — used when embedded in another page. */
  embedded?: boolean;
}

export default function AssignationsList({
  dict,
  organizationUuid,
  titleOverride,
  subtitleOverride,
  embedded,
}: AssignationsListProps) {
  const { toast } = useToast();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Assignation | null>(null);

  const effectiveOrg = organizationUuid ?? (orgFilter === "all" ? undefined : orgFilter);
  const effectiveYear = yearFilter === "all" ? undefined : `${yearFilter}-01-01`;

  const { data, isLoading, isFetching } = useGetAssignationsQuery({
    page,
    organization: effectiveOrg,
    exercise_year: effectiveYear,
  });

  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: accountantsData } = useGetAccountantsQuery({ page: 1 });

  const [deleteAssignation, { isLoading: isDeleting }] = useDeleteAssignationMutation();

  const organizations = useMemo(() => orgsData?.results ?? [], [orgsData]);
  const accountants = useMemo(() => accountantsData?.results ?? [], [accountantsData]);

  const columns = useMemo(
    () =>
      buildAssignationColumns({
        dict,
        organizations,
        accountants,
        hideOrgColumn: !!organizationUuid,
        onDelete: (assignation) => setDeletingTarget(assignation),
      }),
    [dict, organizations, accountants, organizationUuid],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteAssignation(deletingTarget.uuid).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.common.actions.delete_success, dict);
      setDeletingTarget(null);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  if (isLoading && page === 1) return <Loading />;

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "all", label: dict.assignations.list.filters.all_years },
    ...Array.from({ length: Math.min(10, currentYear - fromYear + 1) }, (_, i) => {
      const y = currentYear - i;
      return { value: String(y), label: String(y) };
    }).filter((o) => Number(o.value) <= toYear),
  ];

  const orgFilterOptions = [
    { value: "all", label: dict.assignations.list.filters.all_orgs },
    ...organizations.filter((o) => o.uuid).map((o) => ({ value: o.uuid!, label: o.name })),
  ];

  return (
    <section className={embedded ? "space-y-4" : "mt-2 space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {titleOverride ?? dict.assignations.list.title}
            </h1>
            <p className="text-sm text-[#585757]">
              {total} {subtitleOverride ?? dict.assignations.list.subtitle}
            </p>
          </div>
          <CreateAssignationDialog dict={dict} lockedOrganizationUuid={organizationUuid} />
        </div>
      )}

      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#585757]">
            {total} {subtitleOverride ?? dict.assignations.list.subtitle}
          </p>
          <CreateAssignationDialog dict={dict} lockedOrganizationUuid={organizationUuid} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-48">
          <CustomSelect
            placeholder={dict.assignations.list.filters.year_placeholder}
            value={yearFilter}
            onChange={(v) => {
              setYearFilter(v);
              setPage(1);
            }}
            options={yearOptions}
          />
        </div>
        {!organizationUuid && (
          <div className="w-72">
            <CustomSelect
              placeholder={dict.assignations.list.filters.org_placeholder}
              value={orgFilter}
              onChange={(v) => {
                setOrgFilter(v);
                setPage(1);
              }}
              options={orgFilterOptions}
            />
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.assignations.list.empty}
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
