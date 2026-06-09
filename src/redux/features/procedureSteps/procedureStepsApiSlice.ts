import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { ProcedureStep } from "@/types/procedureStep";
import type { PaginatedResponse } from "@/types/user";

interface ListProcedureStepsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  procedure?: string;
  step?: string;
}

const procedureStepsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getProcedureSteps: builder.query<PaginatedResponse<ProcedureStep>, ListProcedureStepsArgs>({
      query: (args = {}) => ({
        url: "/core/procedure-steps/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "ProcedureSteps" as const,
                id: uuid,
              })),
              { type: "ProcedureSteps" as const, id: "LIST" },
            ]
          : [{ type: "ProcedureSteps" as const, id: "LIST" }],
    }),

    getProcedureStep: builder.query<ProcedureStep, string>({
      query: (uuid) => `/core/procedure-steps/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "ProcedureSteps", id: uuid }],
    }),

    createProcedureStep: builder.mutation<ProcedureStep, Partial<ProcedureStep>>({
      query: (data) => ({
        url: "/core/procedure-steps/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ProcedureSteps", id: "LIST" }],
    }),

    updateProcedureStep: builder.mutation<
      ProcedureStep,
      { uuid: string; data: Partial<ProcedureStep> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/procedure-steps/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "ProcedureSteps", id: uuid }],
    }),

    partialUpdateProcedureStep: builder.mutation<
      ProcedureStep,
      { uuid: string; data: Partial<ProcedureStep> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/procedure-steps/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "ProcedureSteps", id: uuid }],
    }),

    deleteProcedureStep: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/procedure-steps/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "ProcedureSteps", id: uuid },
        { type: "ProcedureSteps", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProcedureStepsQuery,
  useGetProcedureStepQuery,
  useCreateProcedureStepMutation,
  useUpdateProcedureStepMutation,
  usePartialUpdateProcedureStepMutation,
  useDeleteProcedureStepMutation,
} = procedureStepsApiSlice;
