"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Server-pagination footer used by every list view. Replaces the 25-line
 * "current range / Prev / Next" block that was copy-pasted across every
 * list.tsx.
 */
export function ListPagination({
  page,
  setPage,
  total,
  rowCount,
  hasNext,
  disabled,
}: {
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  total: number;
  rowCount: number;
  hasNext: boolean;
  disabled?: boolean;
}) {
  // Belt + braces: trust `hasNext` from the API, but also block forward
  // navigation when we've clearly already shown the last row. Guards
  // against a stale `next` URL in the API response.
  const exhausted = rowCount > 0 && (page - 1) * rowCount + rowCount >= total;
  const nextDisabled = !hasNext || exhausted || disabled;

  return (
    <div className="flex items-center justify-end gap-3 py-2">
      <span className="text-sm text-muted-foreground">
        {rowCount > 0
          ? `${(page - 1) * rowCount + 1}–${(page - 1) * rowCount + rowCount} / ${total}`
          : ""}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page <= 1 || disabled}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage((p) => p + 1)}
        disabled={nextDisabled}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
