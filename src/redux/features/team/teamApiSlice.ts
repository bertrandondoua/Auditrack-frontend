import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { Team } from "@/types/team";
import type { PaginatedResponse } from "@/types/user";

interface ListTeamsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  section?: string;
}

const teamApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<PaginatedResponse<Team>, ListTeamsArgs>({
      query: (args = {}) => ({
        url: "/core/teams/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "Team" as const, id: uuid })),
              { type: "Team" as const, id: "LIST" },
            ]
          : [{ type: "Team" as const, id: "LIST" }],
    }),

    getTeam: builder.query<Team, string>({
      query: (uuid) => `/core/teams/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "Team", id: uuid }],
    }),

    createTeam: builder.mutation<Team, Partial<Team>>({
      query: (data) => ({
        url: "/core/teams/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Team", id: "LIST" }],
    }),

    updateTeam: builder.mutation<Team, { uuid: string; data: Partial<Team> }>({
      query: ({ uuid, data }) => ({
        url: `/core/teams/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Team", id: uuid }],
    }),

    partialUpdateTeam: builder.mutation<Team, { uuid: string; data: Partial<Team> }>({
      query: ({ uuid, data }) => ({
        url: `/core/teams/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "Team", id: uuid }],
    }),

    deleteTeam: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/teams/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Team", id: uuid },
        { type: "Team", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  usePartialUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamApiSlice;
