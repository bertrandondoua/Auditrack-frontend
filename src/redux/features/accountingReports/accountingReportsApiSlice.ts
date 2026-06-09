import { compactParams } from "@/lib/api/params";
import { api } from "@/redux/services/api";
import type { AccountingReport } from "@/types/accountingReport";
import type { PaginatedResponse } from "@/types/user";

interface ListAccountingReportsArgs {
  search?: string;
  ordering?: string;
  page?: number;
  organization?: string;
  section?: string;
  exercise_year?: number;
}

const accountingReportsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAccountingReports: builder.query<
      PaginatedResponse<AccountingReport>,
      ListAccountingReportsArgs
    >({
      query: (args = {}) => ({
        url: "/core/accounting-reports/",
        params: compactParams(args as Record<string, string | number | undefined>),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uuid }) => ({
                type: "AccountingReport" as const,
                id: uuid,
              })),
              { type: "AccountingReport" as const, id: "LIST" },
            ]
          : [{ type: "AccountingReport" as const, id: "LIST" }],
    }),

    getAccountingReport: builder.query<AccountingReport, string>({
      query: (uuid) => `/core/accounting-reports/${uuid}/`,
      providesTags: (_result, _error, uuid) => [{ type: "AccountingReport", id: uuid }],
    }),

    getAccountingReportHistory: builder.query<AccountingReport[], string>({
      query: (uuid) => `/core/accounting-reports/${uuid}/history/`,
      providesTags: (_result, _error, uuid) => [{ type: "AccountingReport", id: uuid }],
    }),

    /**
     * NOTE: greffe-webui sends FormData (file upload for acknowledge_receipt).
     * Switched to JSON; file upload lands as a separate mutation when the
     * documents domain is wired.
     */
    createAccountingReport: builder.mutation<AccountingReport, Partial<AccountingReport>>({
      query: (data) => ({
        url: "/core/accounting-reports/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "AccountingReport", id: "LIST" }],
    }),

    updateAccountingReport: builder.mutation<
      AccountingReport,
      { uuid: string; data: Partial<AccountingReport> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/accounting-reports/${uuid}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "AccountingReport", id: uuid }],
    }),

    partialUpdateAccountingReport: builder.mutation<
      AccountingReport,
      { uuid: string; data: Partial<AccountingReport> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/accounting-reports/${uuid}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "AccountingReport", id: uuid }],
    }),

    /** Workflow action: mark as deposited. */
    depositAccountingReport: builder.mutation<
      AccountingReport,
      { uuid: string; data?: Partial<AccountingReport> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/accounting-reports/${uuid}/deposite/`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "AccountingReport", id: uuid }],
    }),

    /** Workflow action: validate (acknowledge receipt). */
    validateAccountingReport: builder.mutation<
      AccountingReport,
      { uuid: string; data?: Partial<AccountingReport> }
    >({
      query: ({ uuid, data }) => ({
        url: `/core/accounting-reports/${uuid}/validate/`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { uuid }) => [{ type: "AccountingReport", id: uuid }],
    }),

    deleteAccountingReport: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/core/accounting-reports/${uuid}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "AccountingReport", id: uuid },
        { type: "AccountingReport", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAccountingReportsQuery,
  useGetAccountingReportQuery,
  useGetAccountingReportHistoryQuery,
  useCreateAccountingReportMutation,
  useUpdateAccountingReportMutation,
  usePartialUpdateAccountingReportMutation,
  useDepositAccountingReportMutation,
  useValidateAccountingReportMutation,
  useDeleteAccountingReportMutation,
} = accountingReportsApiSlice;
