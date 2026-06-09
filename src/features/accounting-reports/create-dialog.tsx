"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { fromYear, toYear } from "@/configs/constants";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateAccountingReportMutation } from "@/redux/features/accountingReports/accountingReportsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";

/**
 * NOTE: this form creates the report metadata only. The acknowledge_receipt
 * PDF attachment is a two-step dance — create report, upload Document with
 * an attachment FK, then PATCH the report. The backend Document contract
 * for non-control-step parents is not yet documented (see
 * BACKEND_MISMATCHES.md §4). Add the file step when that lands.
 */

const schema = z.object({
  organization: z.string().uuid(),
  fiscal_year: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .refine((s) => /^\d{4}$/.test(s), { message: "Fiscal year must be a 4-digit year" })
    .refine((s) => {
      const n = Number(s);
      return n >= fromYear && n <= toYear;
    }, "Fiscal year out of range"),
  deposited_at: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAccountingReportDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createReport, { isLoading }] = useCreateAccountingReportMutation();
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const f = dict.accounting_reports.fields;

  const orgOptions = (orgsData?.results ?? [])
    .filter((o) => o.uuid)
    .map((o) => ({ value: o.uuid!, label: o.name }));

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organization: "",
      fiscal_year: String(new Date().getFullYear()),
      deposited_at: today,
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createReport({
          organization: values.organization,
          fiscal_year: values.fiscal_year,
          deposited_at: new Date(values.deposited_at).toISOString(),
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.accounting_reports.create.success, dict);
        reset({
          organization: "",
          fiscal_year: String(new Date().getFullYear()),
          deposited_at: today,
        });
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.accounting_reports.create.title}
      trigger={
        <Button>
          <Plus /> {dict.accounting_reports.create.trigger}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.accounting_reports.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <Controller
          control={control}
          name="organization"
          render={({ field }) => (
            <CustomSelect
              label={f.organization}
              placeholder={f.organization_placeholder}
              value={field.value}
              onChange={field.onChange}
              options={orgOptions}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.fiscal_year}
            placeholder={f.fiscal_year_placeholder}
            error={errors.fiscal_year?.message}
            inputProps={register("fiscal_year")}
          />
          <FormField
            label={f.deposited_at}
            type="date"
            error={errors.deposited_at?.message}
            inputProps={register("deposited_at")}
          />
        </div>
      </form>
    </ReusableDialog>
  );
}
