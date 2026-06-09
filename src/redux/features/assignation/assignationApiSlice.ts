import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Assignation } from "@/types/assignation";
import type { PaginatedResponse } from "@/types/user";

interface ListAssignationsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  organization?: string;
  accountant?: string;
  exercise_year?: string;
}

const assignationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssignations: builder.query<PaginatedResponse<Assignation>, ListAssignationsArgs>({
      query: (args = {}) => ({
        url: "/core/assignations/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Assignations" as const,
                id: uuid,
              })),
              { type: "Assignations" as const, id: "LIST" },
            ]
          : [{ type: "Assignations" as const, id: "LIST" }],
    }),

    getAssignation: builder.query<Assignation, string>({
      query: (uuid) => `/core/assignations/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Assignations", id: uuid }],
    }),

    createAssignation: builder.mutation<Assignation, Partial<Assignation>>({
      query: (data) => ({
        url: "/core/assignations/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Assignations", id: "LIST" }],
    }),

    updateAssignation: builder.mutation<Assignation, { uuid: string; data: Partial<Assignation> }>({
      query: ({ uuid, data }) => ({
        url: `/core/assignations/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Assignations", id: uuid }],
    }),

    partialUpdateAssignation: builder.mutation<
      Assignation,
      { uuid: string; data: Partial<Assignation> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/assignations/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Assignations", id: uuid }],
    }),

    deleteAssignation: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/assignations/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Assignations", id: uuid },
        { type: "Assignations", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAssignationsQuery,
  useGetAssignationQuery,
  useCreateAssignationMutation,
  useUpdateAssignationMutation,
  usePartialUpdateAssignationMutation,
  useDeleteAssignationMutation,
} = assignationApiSlice;
