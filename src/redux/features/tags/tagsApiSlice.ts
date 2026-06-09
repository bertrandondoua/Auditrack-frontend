import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Tag } from "@/types/tag";
import type { PaginatedResponse } from "@/types/user";

interface ListTagsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  procedure?: string;
}

const tagsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<PaginatedResponse<Tag>, ListTagsArgs>({
      query: (args = {}) => ({
        url: "/core/tags/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "Tag" as const, id: uuid })),
              { type: "Tag" as const, id: "LIST" },
            ]
          : [{ type: "Tag" as const, id: "LIST" }],
    }),

    getTag: builder.query<Tag, string>({
      query: (uuid) => `/core/tags/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Tag", id: uuid }],
    }),

    createTag: builder.mutation<Tag, Partial<Tag>>({
      query: (data) => ({
        url: "/core/tags/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    updateTag: builder.mutation<Tag, { uuid: string; data: Partial<Tag> }>({
      query: ({ uuid, data }) => ({
        url: `/core/tags/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Tag", id: uuid }],
    }),

    partialUpdateTag: builder.mutation<Tag, { uuid: string; data: Partial<Tag> }>({
      query: ({ uuid, data }) => ({
        url: `/core/tags/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Tag", id: uuid }],
    }),

    deleteTag: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/tags/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Tag", id: uuid },
        { type: "Tag", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  usePartialUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApiSlice;
