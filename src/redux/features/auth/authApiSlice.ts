import { api } from "@/redux/services/api";
import type { AuthToken, SendOtpRequest, User } from "@/types/user";

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

/**
 * Public auth config from `GET /accounts/auth/config/` (unauthenticated).
 * Lets the signin flow decide at runtime whether to require an OTP step,
 * instead of hardcoding it. See the API spec — OTP is ON by default.
 */
export interface AuthConfig {
  login_require_otp: boolean;
  otp?: {
    channel?: string;
    length?: number;
    ttl_seconds?: number;
    max_attempts?: number;
  };
}

interface LoginArgs {
  username: string;
  password: string;
  /** Optional — kept for back-compat. The current backend does not require it. */
  otp?: string;
}

interface ResetPasswordArgs {
  email: string;
  password: string;
  /** Optional — kept for back-compat. */
  otp?: string;
}

interface ChangePasswordArgs {
  password: string;
  old_password: string;
}

const authApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthConfig: builder.query<AuthConfig, void>({
      query: () => "/accounts/auth/config/",
    }),

    login: builder.mutation<AuthToken, LoginArgs>({
      query: (body) => {
        const params: Record<string, string> = {
          grant_type: "password",
          username: body.username,
          password: body.password,
          client_id: clientId ?? "",
          client_secret: clientSecret ?? "",
        };
        // Only include otp when actually present — backend rejects empty strings
        // for fields it doesn't expect.
        if (body.otp) params.otp = body.otp;
        return {
          url: "/auth/token/",
          method: "POST",
          body: new URLSearchParams(params),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("tokens", JSON.stringify(data));
            document.cookie = `token=${data.access_token}; path=/;`;
          }
        } catch (e) {
          console.error("Login failed:", e);
        }
      },
    }),

    changePassword: builder.mutation<unknown, ChangePasswordArgs>({
      query: (body) => ({
        url: "/accounts/users/change_password/",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<unknown, ResetPasswordArgs>({
      query: (body) => ({
        url: "/accounts/users/reset_password/",
        method: "POST",
        body,
      }),
    }),

    sendOtp: builder.mutation<User, SendOtpRequest>({
      query: (data) => ({
        url: "/accounts/users/otp/",
        method: "POST",
        body: data,
      }),
    }),

    logoutUser: builder.mutation<User, User>({
      query: (user) => ({
        url: "/accounts/users/logout/",
        method: "POST",
        body: user,
      }),
    }),
  }),
});

export const {
  useGetAuthConfigQuery,
  useLazyGetAuthConfigQuery,
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutUserMutation,
  useResetPasswordMutation,
  useSendOtpMutation,
} = authApiSlice;
