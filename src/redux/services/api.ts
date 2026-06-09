import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import Cookies from "js-cookie";
import { logout } from "../features/auth/authSlice";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    if (typeof window === "undefined") return headers;
    const raw = window.localStorage.getItem("tokens");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { access_token?: string };
        if (parsed.access_token) {
          headers.set("authorization", `Bearer ${parsed.access_token}`);
        }
      } catch (err) {
        console.error("Failed to parse tokens from localStorage", err);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  arg,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();
  const result = await baseQuery(arg, api, extraOptions);

  if (result.error?.status === 401) {
    // TODO: re-enable the refresh-token branch once Auditrack-api OAuth2 TTLs are confirmed.
    // Until then, a 401 unconditionally logs the user out.
    api.dispatch(logout());
    if (typeof window !== "undefined") {
      // Surgical — only remove auth keys. Don't nuke locale prefs, draft form
      // state, table column visibility, etc. that consumers may stash here.
      window.localStorage.removeItem("tokens");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("userCredentials");
      window.localStorage.removeItem("userResseteCredentials");
      Cookies.remove("token");
      window.location.replace("/signin");
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Program",
    "Step",
    "Accountants",
    "Section",
    "ProcedureSteps",
    "Assignations",
    "SentQuestionnaire",
    "Control",
    "Team",
    "Document",
    "ControlStep",
    "Tag",
    "Phase",
    "Procedure",
    "AccountingReport",
    "Organization",
    "DocumentType",
    "AccountingReportSummary",
  ],
  endpoints: () => ({}),
});
