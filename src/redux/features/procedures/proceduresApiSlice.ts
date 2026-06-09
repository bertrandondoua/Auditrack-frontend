import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Procedure } from "@/types/procedure";
import type { PaginatedResponse } from "@/types/user";

interface ListProceduresArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const proceduresApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getProcedures: builder.query<PaginatedResponse<Procedure>, ListProceduresArgs>({
      query: (args = {}) => ({
        url: "/core/procedures/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Procedure" as const,
                id: uuid,
              })),
              { type: "Procedure" as const, id: "LIST" },
            ]
          : [{ type: "Procedure" as const, id: "LIST" }],
    }),

    getProcedure: builder.query<Procedure, string>({
      query: (uuid) => `/core/procedures/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Procedure", id: uuid }],
    }),

    createProcedure: builder.mutation<Procedure, Partial<Procedure>>({
      query: (data) => ({
        url: "/core/procedures/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Procedure", id: "LIST" }],
    }),

    updateProcedure: builder.mutation<Procedure, { uuid: string; data: Partial<Procedure> }>({
      query: ({ uuid, data }) => ({
        url: `/core/procedures/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Procedure", id: uuid }],
    }),

    partialUpdateProcedure: builder.mutation<Procedure, { uuid: string; data: Partial<Procedure> }>(
      {
        query: ({ uuid, data }) => ({
          url: `/core/procedures/${uuid}/`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (_result, _error, { uuid }) => [{ type: "Procedure", id: uuid }],
      },
    ),

    deleteProcedure: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/procedures/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Procedure", id: uuid },
        { type: "Procedure", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProceduresQuery,
  useGetProcedureQuery,
  useCreateProcedureMutation,
  useUpdateProcedureMutation,
  usePartialUpdateProcedureMutation,
  useDeleteProcedureMutation,
} = proceduresApiSlice;
