"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import Loading from "@/app/[lang]/loading";
import { DataTable } from "@/components/tables/data-table";
import { ListPagination } from "@/components/tables/list-pagination";
import { Input } from "@/components/ui/input";
import type { Dict } from "@/lib/dictionaries";
import { useGetLogsQuery } from "@/redux/features/logs/logsApiSlice";

import { buildLogColumns } from "./columns";

export default function LogsList({ dict }: { dict: Dict }) {
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 300);
  const [modelInput, setModelInput] = useState("");
  const [model] = useDebounce(modelInput, 300);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetLogsQuery({
    page,
    search: search || undefined,
    model: model || undefined,
  });

  const columns = useMemo(() => buildLogColumns(dict), [dict]);

  if (isLoading && page === 1) return <Loading />;

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.logs.list.title}</h1>
        <p className="text-sm text-[#585757]">
          {total} {dict.logs.list.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder={dict.logs.list.search_placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <Input
            placeholder={dict.logs.list.model_filter_placeholder}
            value={modelInput}
            onChange={(e) => {
              setModelInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        showPagination={false}
        emptyMessage={dict.logs.list.empty}
      />

      <ListPagination
        page={page}
        setPage={setPage}
        total={total}
        rowCount={rows.length}
        hasNext={!!data?.next}
        disabled={isFetching}
      />
    </section>
  );
}
