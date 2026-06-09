import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Step } from "@/types/step";
import type { PaginatedResponse } from "@/types/user";

interface ListStepsArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const stepsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getSteps: builder.query<PaginatedResponse<Step>, ListStepsArgs>({
      query: (args = {}) => ({
        url: "/core/steps/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "Step" as const, id: uuid })),
              { type: "Step" as const, id: "LIST" },
            ]
          : [{ type: "Step" as const, id: "LIST" }],
    }),

    getStep: builder.query<Step, string>({
      query: (uuid) => `/core/steps/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Step", id: uuid }],
    }),

    /**
     * Backend create accepts only `{ name }`. Phase association lands via
     * the procedureSteps domain (not yet ported).
     */
    createStep: builder.mutation<Step, { name: string }>({
      query: (data) => ({
        url: "/core/steps/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Step", id: "LIST" }],
    }),

    updateStep: builder.mutation<Step, { uuid: string; data: Partial<Step> }>({
      query: ({ uuid, data }) => ({
        url: `/core/steps/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Step", id: uuid }],
    }),

    partialUpdateStep: builder.mutation<Step, { uuid: string; data: Partial<Step> }>({
      query: ({ uuid, data }) => ({
        url: `/core/steps/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Step", id: uuid }],
    }),

    deleteStep: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/steps/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Step", id: uuid },
        { type: "Step", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStepsQuery,
  useGetStepQuery,
  useCreateStepMutation,
  useUpdateStepMutation,
  usePartialUpdateStepMutation,
  useDeleteStepMutation,
} = stepsApiSlice;
