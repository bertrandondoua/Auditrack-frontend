import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Program } from "@/types/program";
import type { PaginatedResponse } from "@/types/user";

interface ListProgramsArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const programsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<PaginatedResponse<Program>, ListProgramsArgs>({
      query: (args = {}) => ({
        url: "/core/programs/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Program" as const,
                id: uuid,
              })),
              { type: "Program" as const, id: "LIST" },
            ]
          : [{ type: "Program" as const, id: "LIST" }],
    }),

    getProgram: builder.query<Program, string>({
      query: (uuid) => `/core/programs/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Program", id: uuid }],
    }),

    createProgram: builder.mutation<Program, Partial<Program>>({
      query: (data) => ({
        url: "/core/programs/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Program", id: "LIST" }],
    }),

    updateProgram: builder.mutation<Program, { uuid: string; data: Partial<Program> }>({
      query: ({ uuid, data }) => ({
        url: `/core/programs/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Program", id: uuid }],
    }),

    partialUpdateProgram: builder.mutation<Program, { uuid: string; data: Partial<Program> }>({
      query: ({ uuid, data }) => ({
        url: `/core/programs/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Program", id: uuid }],
    }),

    deleteProgram: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/programs/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Program", id: uuid },
        { type: "Program", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  usePartialUpdateProgramMutation,
  useDeleteProgramMutation,
} = programsApiSlice;
