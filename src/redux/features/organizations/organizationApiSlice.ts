import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Organization, OrganizationHistory } from "@/types/organization";
import type { PaginatedResponse } from "@/types/user";

interface ListOrganizationsArgs {
  search?: string;
  page?: number;
  ordering?: string;
  type?: "public" | "para-public";
  created_after?: string;
  created_before?: string;
}

interface StatsOrganizationsArgs extends ListOrganizationsArgs {
  name?: string;
  phone_number?: string;
  email?: string;
  created_at?: string;
}

const organizationsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<PaginatedResponse<Organization>, ListOrganizationsArgs>({
      query: (args) => ({
        url: "/core/organizations/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "Organization" as const,
                id: uuid,
              })),
              { type: "Organization" as const, id: "LIST" },
            ]
          : [{ type: "Organization" as const, id: "LIST" }],
    }),

    getOrganizationsStats: builder.query<PaginatedResponse<Organization>, StatsOrganizationsArgs>({
      query: (args) => ({
        url: "/core/organizations/stats/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
    }),

    getOrganizationById: builder.query<Organization, string>({
      query: (uuid) => `/core/organizations/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Organization", id: uuid }],
    }),

    updateOrganization: builder.mutation<
      Organization,
      { uuid: string; data: Partial<Organization> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/organizations/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Organization", id: uuid }],
    }),

    partialUpdateOrganization: builder.mutation<
      Organization,
      { uuid: string; data: Partial<Organization> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/organizations/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Organization", id: uuid }],
    }),

    getOrganizationHistory: builder.query<OrganizationHistory[], string>({
      query: (uuid) => `/core/organizations/${uuid}/history/`,
      providesTags: (_result, _error, uuid) => [{ type: "Organization", id: uuid }],
    }),

    deleteOrganization: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/organizations/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [{ type: "Organization", id: uuid }],
    }),

    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (newOrganization) => ({
        url: "/core/organizations/",
        method: "POST",
        body: newOrganization,
      }),
      invalidatesTags: [{ type: "Organization", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  usePartialUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationHistoryQuery,
  useGetOrganizationsQuery,
  useGetOrganizationsStatsQuery,
  useCreateOrganizationMutation,
} = organizationsApiSlice;
