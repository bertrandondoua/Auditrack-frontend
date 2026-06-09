import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Accountant } from "@/types/accountant";
import type { PaginatedResponse } from "@/types/user";

interface ListAccountantsArgs {
  search?: string;
  ordering?: string;
  page?: number;
}

const accountantsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAccountants: builder.query<PaginatedResponse<Accountant>, ListAccountantsArgs>({
      query: (args = {}) => ({
        url: "/core/accountants/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Accountants" as const,
                id: uuid,
              })),
              { type: "Accountants" as const, id: "LIST" },
            ]
          : [{ type: "Accountants" as const, id: "LIST" }],
    }),

    getAccountant: builder.query<Accountant, string>({
      query: (uuid) => `/core/accountants/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Accountants", id: uuid }],
    }),

    createAccountant: builder.mutation<Accountant, Partial<Accountant>>({
      query: (data) => ({
        url: "/core/accountants/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Accountants", id: "LIST" }],
    }),

    updateAccountant: builder.mutation<Accountant, { uuid: string; data: Partial<Accountant> }>({
      query: ({ uuid, data }) => ({
        url: `/core/accountants/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Accountants", id: uuid }],
    }),

    partialUpdateAccountant: builder.mutation<
      Accountant,
      { uuid: string; data: Partial<Accountant> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/accountants/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Accountants", id: uuid }],
    }),

    deleteAccountant: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/accountants/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Accountants", id: uuid },
        { type: "Accountants", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAccountantsQuery,
  useGetAccountantQuery,
  useCreateAccountantMutation,
  useUpdateAccountantMutation,
  usePartialUpdateAccountantMutation,
  useDeleteAccountantMutation,
} = accountantsApiSlice;
