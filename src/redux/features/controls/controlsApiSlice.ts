import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Control, ControlHistory } from "@/types/control";
import type { PaginatedResponse } from "@/types/user";

interface ListControlsArgs {
  status?: string;
  organization?: string;
  section?: string;
  search?: string;
  ordering?: string;
  page?: number;
  /** DRF-style nested filter: filter controls by program year. */
  section__program__program_year?: string;
}

const controlsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getControls: builder.query<PaginatedResponse<Control>, ListControlsArgs>({
      query: (args = {}) => ({
        url: "/core/controls/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "Control" as const, id: uuid })),
              { type: "Control" as const, id: "LIST" },
            ]
          : [{ type: "Control" as const, id: "LIST" }],
    }),

    getControl: builder.query<Control, string>({
      query: (uuid) => `/core/controls/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Control", id: uuid }],
    }),

    getControlSummary: builder.query<Control, string>({
      query: (uuid) => `/core/controls/${uuid}/summary/`,
      providesTags: (_result, _error, uuid) => [{ type: "Control", id: uuid }],
    }),

    getControlHistory: builder.query<ControlHistory[], string>({
      query: (uuid) => `/core/controls/${uuid}/history/`,
      providesTags: (_result, _error, uuid) => [{ type: "Control", id: uuid }],
    }),

    /**
     * NOTE: greffe-webui sends FormData (for an opening document upload).
     * Switched to JSON here; opening-doc upload lands as a separate mutation
     * when the documents domain is wired up.
     */
    createControl: builder.mutation<Control, Partial<Control>>({
      query: (data) => ({
        url: "/core/controls/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Control", id: "LIST" }],
    }),

    updateControl: builder.mutation<Control, { uuid: string; data: Partial<Control> }>({
      query: ({ uuid, data }) => ({
        url: `/core/controls/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Control", id: uuid }],
    }),

    partialUpdateControl: builder.mutation<Control, { uuid: string; data: Partial<Control> }>({
      query: ({ uuid, data }) => ({
        url: `/core/controls/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Control", id: uuid }],
    }),

    /** Workflow action: open (start) a control. */
    openControl: builder.mutation<Control, { uuid: string; data?: Partial<Control> }>({
      query: ({ uuid, data }) => ({
        url: `/core/controls/${uuid}/open/`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Control", id: uuid }],
    }),

    /** Workflow action: close (terminate) a control. */
    closeControl: builder.mutation<Control, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/core/controls/${uuid}/close/`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Control", id: uuid }],
    }),

    /** Workflow action: mark control complete. */
    completeControl: builder.mutation<Control, { uuid: string; data?: Partial<Control> }>({
      query: ({ uuid, data }) => ({
        url: `/core/controls/${uuid}/complete_control/`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Control", id: uuid }],
    }),

    deleteControl: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/controls/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Control", id: uuid },
        { type: "Control", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetControlsQuery,
  useGetControlQuery,
  useGetControlSummaryQuery,
  useGetControlHistoryQuery,
  useCreateControlMutation,
  useUpdateControlMutation,
  usePartialUpdateControlMutation,
  useOpenControlMutation,
  useCloseControlMutation,
  useCompleteControlMutation,
  useDeleteControlMutation,
} = controlsApiSlice;
