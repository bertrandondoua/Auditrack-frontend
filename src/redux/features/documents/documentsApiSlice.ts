import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { AuditDocument, DocumentHistory } from "@/types/document";
import type { PaginatedResponse } from "@/types/user";

interface ListDocumentsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  control_step?: string;
  type?: string;
}

const documentsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<PaginatedResponse<AuditDocument>, ListDocumentsArgs>({
      query: (args = {}) => ({
        url: "/core/documents/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Document" as const,
                id: uuid,
              })),
              { type: "Document" as const, id: "LIST" },
            ]
          : [{ type: "Document" as const, id: "LIST" }],
    }),

    getDocument: builder.query<AuditDocument, string>({
      query: (uuid) => `/core/documents/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Document", id: uuid }],
    }),

    getDocumentHistory: builder.query<DocumentHistory[], string>({
      query: (uuid) => `/core/documents/${uuid}/history/`,
      providesTags: (_result, _error, uuid) => [{ type: "Document", id: uuid }],
    }),

    /**
     * Upload a document. Body MUST be `FormData` with `file`, `name`, and
     * `control_step` (UUID) fields. The browser sets the multipart
     * Content-Type header; do not set it manually.
     */
    createDocument: builder.mutation<AuditDocument, FormData>({
      query: (data) => ({
        url: "/core/documents/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),

    updateDocument: builder.mutation<
      AuditDocument,
      { uuid: string; data: FormData | Partial<AuditDocument> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/documents/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Document", id: uuid }],
    }),

    partialUpdateDocument: builder.mutation<
      AuditDocument,
      { uuid: string; data: FormData | Partial<AuditDocument> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/documents/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Document", id: uuid }],
    }),

    deleteDocument: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/documents/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Document", id: uuid },
        { type: "Document", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useGetDocumentHistoryQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  usePartialUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApiSlice;
