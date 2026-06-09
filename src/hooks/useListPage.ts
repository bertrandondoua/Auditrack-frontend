"use client";

import { useCallback, useState } from "react";
import { useDebounce } from "use-debounce";

import { useToast } from "@/hooks/use-toast";

/**
 * Shared state + plumbing for the search + paginate + delete pattern that
 * every flat list page replicates.
 *
 * Returns the toast handle, the search input + debounced value, the page
 * cursor, and the deletion target slot. Consumers wire their own RTK Query
 * call + delete mutation — we don't try to abstract those since each domain
 * has slightly different filter shapes.
 */
export function useListPage<T extends { uuid?: string }>({
  debounceMs = 300,
}: { debounceMs?: number } = {}) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, debounceMs);
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<T | null>(null);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const closeDelete = useCallback(() => setDeletingTarget(null), []);

  return {
    toast,
    searchInput,
    setSearchInput,
    search,
    onSearchChange,
    page,
    setPage,
    deletingTarget,
    setDeletingTarget,
    closeDelete,
  };
}
