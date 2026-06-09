import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Section, SectionHistory } from "@/types/section";
import type { PaginatedResponse } from "@/types/user";

interface ListSectionsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  program?: string;
  program_year?: string;
}

const sectionsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getSections: builder.query<PaginatedResponse<Section>, ListSectionsArgs>({
      query: (args = {}) => ({
        url: "/core/sections/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Section" as const,
                id: uuid,
              })),
              { type: "Section" as const, id: "LIST" },
            ]
          : [{ type: "Section" as const, id: "LIST" }],
    }),

    getSection: builder.query<Section, string>({
      query: (uuid) => `/core/sections/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Section", id: uuid }],
    }),

    getSectionHistory: builder.query<SectionHistory[], string>({
      query: (uuid) => `/core/sections/${uuid}/history/`,
      providesTags: (_result, _error, uuid) => [{ type: "Section", id: `${uuid}-history` }],
    }),

    createSection: builder.mutation<Section, Partial<Section>>({
      query: (data) => ({
        url: "/core/sections/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Section", id: "LIST" }],
    }),

    updateSection: builder.mutation<Section, { uuid: string; data: Partial<Section> }>({
      query: ({ uuid, data }) => ({
        url: `/core/sections/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Section", id: uuid }],
    }),

    partialUpdateSection: builder.mutation<Section, { uuid: string; data: Partial<Section> }>({
      query: ({ uuid, data }) => ({
        url: `/core/sections/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Section", id: uuid }],
    }),

    deleteSection: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/sections/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Section", id: uuid },
        { type: "Section", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useGetSectionQuery,
  useGetSectionHistoryQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  usePartialUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionsApiSlice;
