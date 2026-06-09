import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { DocumentType } from "@/types/document";
import type { PaginatedResponse } from "@/types/user";

interface ListDocumentTypesArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const documentTypesApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentTypes: builder.query<PaginatedResponse<DocumentType>, ListDocumentTypesArgs>({
      query: (args = {}) => ({
        url: "/core/document-types/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "DocumentType" as const,
                id: uuid,
              })),
              { type: "DocumentType" as const, id: "LIST" },
            ]
          : [{ type: "DocumentType" as const, id: "LIST" }],
    }),

    getDocumentType: builder.query<DocumentType, string>({
      // NOTE: greffe-webui used `/core/documents-types/` here (plural typo)
      // while the list uses `/core/document-types/`. Standardising on the
      // singular-dash form. If the backend exposes both, fine; if not,
      // switch this when the actual endpoint is confirmed.
      query: (uuid) => `/core/document-types/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "DocumentType", id: uuid }],
    }),

    createDocumentType: builder.mutation<DocumentType, Partial<DocumentType>>({
      query: (data) => ({
        url: "/core/document-types/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "DocumentType", id: "LIST" }],
    }),

    updateDocumentType: builder.mutation<
      DocumentType,
      { uuid: string; data: Partial<DocumentType> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/document-types/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "DocumentType", id: uuid }],
    }),

    partialUpdateDocumentType: builder.mutation<
      DocumentType,
      { uuid: string; data: Partial<DocumentType> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/document-types/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "DocumentType", id: uuid }],
    }),

    deleteDocumentType: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/document-types/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "DocumentType", id: uuid },
        { type: "DocumentType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDocumentTypesQuery,
  useGetDocumentTypeQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  usePartialUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentTypesApiSlice;
