import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { ControlStep } from "@/types/controlStep";
import type { PaginatedResponse } from "@/types/user";

interface ListControlStepsArgs {
  control?: string;
  step?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

const controlStepsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getControlSteps: builder.query<PaginatedResponse<ControlStep>, ListControlStepsArgs>({
      query: (args = {}) => ({
        url: "/core/control-steps/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "ControlStep" as const,
                id: uuid,
              })),
              { type: "ControlStep" as const, id: "LIST" },
            ]
          : [{ type: "ControlStep" as const, id: "LIST" }],
    }),

    getControlStep: builder.query<ControlStep, string>({
      query: (uuid) => `/core/control-steps/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "ControlStep", id: uuid }],
    }),

    createControlStep: builder.mutation<ControlStep, Partial<ControlStep>>({
      query: (data) => ({
        url: "/core/control-steps/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ControlStep", id: "LIST" }],
    }),

    updateControlStep: builder.mutation<ControlStep, { uuid: string; data: Partial<ControlStep> }>({
      query: ({ uuid, data }) => ({
        url: `/core/control-steps/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "ControlStep", id: uuid }],
    }),

    partialUpdateControlStep: builder.mutation<
      ControlStep,
      { uuid: string; data: Partial<ControlStep> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/control-steps/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "ControlStep", id: uuid }],
    }),

    /** Workflow action: mark a control step as complete. */
    completeControlStep: builder.mutation<
      ControlStep,
      { uuid: string; data?: Partial<ControlStep> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/control-steps/${uuid}/complete_step/`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { uuid }) => [
        { type: "ControlStep", id: uuid },
        { type: "ControlStep", id: "LIST" },
      ],
    }),

    deleteControlStep: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/control-steps/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "ControlStep", id: uuid },
        { type: "ControlStep", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetControlStepsQuery,
  useGetControlStepQuery,
  useCreateControlStepMutation,
  useUpdateControlStepMutation,
  usePartialUpdateControlStepMutation,
  useCompleteControlStepMutation,
  useDeleteControlStepMutation,
} = controlStepsApiSlice;
