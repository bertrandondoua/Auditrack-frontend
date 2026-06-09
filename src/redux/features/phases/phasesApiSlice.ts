import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Phase } from "@/types/phase";
import type { PaginatedResponse } from "@/types/user";

interface ListPhasesArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const phasesApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPhases: builder.query<PaginatedResponse<Phase>, ListPhasesArgs>({
      query: (args = {}) => ({
        url: "/core/phases/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "Phase" as const, id: uuid })),
              { type: "Phase" as const, id: "LIST" },
            ]
          : [{ type: "Phase" as const, id: "LIST" }],
    }),

    getPhase: builder.query<Phase, string>({
      query: (uuid) => `/core/phases/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Phase", id: uuid }],
    }),

    createPhase: builder.mutation<Phase, Partial<Phase>>({
      query: (data) => ({
        url: "/core/phases/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Phase", id: "LIST" }],
    }),

    updatePhase: builder.mutation<Phase, { uuid: string; data: Partial<Phase> }>({
      query: ({ uuid, data }) => ({
        url: `/core/phases/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Phase", id: uuid }],
    }),

    partialUpdatePhase: builder.mutation<Phase, { uuid: string; data: Partial<Phase> }>({
      query: ({ uuid, data }) => ({
        url: `/core/phases/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Phase", id: uuid }],
    }),

    deletePhase: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/phases/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Phase", id: uuid },
        { type: "Phase", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPhasesQuery,
  useGetPhaseQuery,
  useCreatePhaseMutation,
  useUpdatePhaseMutation,
  usePartialUpdatePhaseMutation,
  useDeletePhaseMutation,
} = phasesApiSlice;
