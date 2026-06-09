import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { LogEntry } from "@/types/log";
import type { PaginatedResponse } from "@/types/user";

interface ListLogsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  model?: string;
  user?: string;
}

const logsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * NOTE: greffe-webui hits `/core/history/` and types the response as `any`.
     * Assuming DRF default pagination here — if the backend returns a bare
     * array, switch this query type to `LogEntry[]` and drop the `.results`
     * unwrap in the list view.
     */
    getLogs: builder.query<PaginatedResponse<LogEntry>, ListLogsArgs>({
      query: (args = {}) => ({
        url: "/core/history/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
    }),
  }),
});

export const { useGetLogsQuery } = logsApiSlice;
