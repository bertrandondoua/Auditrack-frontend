import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { PaginatedResponse, User } from "@/types/user";

interface ListUsersArgs {
  search?: string;
  ordering?: string;
  page?: number;
  role?: User["role"];
}

const usersApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthenticatedUser: builder.query<User, void>({
      query: () => "/accounts/users/me/",
      providesTags: (result) => (result ? [{ type: "User", id: result.uuid }] : []),
    }),

    getUsers: builder.query<PaginatedResponse<User>, ListUsersArgs>({
      query: (args = {}) => ({
        url: "/accounts/users/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({ type: "User" as const, id: uuid })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getUser: builder.query<User, string>({
      query: (uuid) => `/accounts/users/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "User", id: uuid }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/accounts/users/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { uuid: string; data: Partial<User> }>({
      query: ({ uuid, data }) => ({
        url: `/accounts/users/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "User", id: uuid }],
    }),

    partialUpdateUser: builder.mutation<User, { uuid: string; data: Partial<User> }>({
      query: ({ uuid, data }) => ({
        url: `/accounts/users/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "User", id: uuid }],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/accounts/users/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "User", id: uuid },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAuthenticatedUserQuery,
  useLazyGetAuthenticatedUserQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePartialUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;
