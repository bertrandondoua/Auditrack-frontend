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
  useDeleteOrganizationMutation,
  useGetOrganizationsQuery,
} from "@/redux/features/organizations/organizationApiSlice";
import type { Organization } from "@/types/organization";

import { buildOrganizationColumns } from "./columns";
import CreateOrganisationDialog from "./create-dialog";

type TypeFilter = "all" | "public" | "para-public";

export default function OrganisationsList({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const router = useRouter();
  const { lang } = useParams<{ lang: Locale }>();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<Organization | null>(null);

  const navigateToDetail = (org: Organization) => {
    if (!org.uuid) return;
    router.push(`/${lang}/organisations/${org.uuid}`);
  };

  const { data, isLoading, isFetching } = useGetOrganizationsQuery({
    page,
    search: search || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
  });

  const [deleteOrganization, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const columns = useMemo(
    () =>
      buildOrganizationColumns({
        dict,
        onEdit: navigateToDetail,
        onDelete: (organization) => setDeletingTarget(organization),
      }),
    // navigateToDetail is stable for the life of the component (uses router/lang).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict, lang],
  );

  const confirmDelete = async () => {
    if (!deletingTarget?.uuid) return;
    try {
      const res = await deleteOrganization(deletingTarget.uuid).unwrap();
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
          <h1 className="text-3xl font-bold text-gray-800">{dict.organisations.list.title}</h1>
          <p className="text-sm text-[#585757]">
            {total} {dict.organisations.list.subtitle}
          </p>
        </div>
        <CreateOrganisationDialog dict={dict} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.organisations.list.search_placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <CustomSelect
            placeholder={dict.organisations.list.type_filter_placeholder}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value as TypeFilter);
              setPage(1);
            }}
            options={[
              { value: "all", label: dict.common.all },
              { value: "public", label: dict.organisations.types.public },
              { value: "para-public", label: dict.organisations.types["para-public"] },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        onRowClick={navigateToDetail}
        showPagination={false}
        emptyMessage={dict.organisations.list.empty}
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
