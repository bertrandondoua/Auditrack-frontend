import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { SentQuestionnaire } from "@/types/sentQuestionnaire";
import type { PaginatedResponse } from "@/types/user";

interface ListSentQuestionnairesArgs {
  search?: string;
  ordering?: string;
  page?: number;
  status?: string;
}

const questionnaireApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getSentQuestionnaires: builder.query<
      PaginatedResponse<SentQuestionnaire>,
      ListSentQuestionnairesArgs
    >({
      query: (args = {}) => ({
        url: "/core/sent-questionnaire/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "SentQuestionnaire" as const,
                id: uuid,
              })),
              { type: "SentQuestionnaire" as const, id: "LIST" },
            ]
          : [{ type: "SentQuestionnaire" as const, id: "LIST" }],
    }),

    getSentQuestionnaire: builder.query<SentQuestionnaire, string>({
      query: (uuid) => `/core/sent-questionnaire/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "SentQuestionnaire", id: uuid }],
    }),

    createSentQuestionnaire: builder.mutation<SentQuestionnaire, Partial<SentQuestionnaire>>({
      query: (data) => ({
        url: "/core/sent-questionnaire/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SentQuestionnaire", id: "LIST" }],
    }),

    updateSentQuestionnaire: builder.mutation<
      SentQuestionnaire,
      { uuid: string; data: Partial<SentQuestionnaire> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/sent-questionnaire/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "SentQuestionnaire", id: uuid }],
    }),

    partialUpdateSentQuestionnaire: builder.mutation<
      SentQuestionnaire,
      { uuid: string; data: Partial<SentQuestionnaire> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/sent-questionnaire/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "SentQuestionnaire", id: uuid }],
    }),

    deleteSentQuestionnaire: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/sent-questionnaire/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "SentQuestionnaire", id: uuid },
        { type: "SentQuestionnaire", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSentQuestionnairesQuery,
  useGetSentQuestionnaireQuery,
  useCreateSentQuestionnaireMutation,
  useUpdateSentQuestionnaireMutation,
  usePartialUpdateSentQuestionnaireMutation,
  useDeleteSentQuestionnaireMutation,
} = questionnaireApiSlice;
