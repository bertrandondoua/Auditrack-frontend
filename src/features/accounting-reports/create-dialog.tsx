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
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";

/**
 * Backend requires `organization` + `section` and uses `exercise_year` (int).
 * The acknowledge_receipt PDF attachment is a separate Document upload not
 * yet wired (see BACKEND_MISMATCHES.md). This form posts the report metadata.
 */
const schema = z.object({
  organization: z.string().uuid(),
  section: z.string().uuid(),
  exercise_year: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= fromYear && n <= toYear, {
      message: `Exercise year must be between ${fromYear} and ${toYear}`,
    }),
  deposited_at: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAccountingReportDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createReport, { isLoading }] = useCreateAccountingReportMutation();
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: sectionsData } = useGetSectionsQuery({ page: 1 });
  const f = dict.accounting_reports.fields;

  const orgOptions = (orgsData?.results ?? [])
    .filter((o) => o.uuid)
    .map((o) => ({ value: o.uuid!, label: o.name }));
  const sectionOptions = (sectionsData?.results ?? [])
    .filter((s) => s.uuid)
    .map((s) => ({ value: s.uuid!, label: s.name }));

  const today = new Date().toISOString().split("T")[0];

  const blankValues: FormValues = {
    organization: "",
    section: "",
    exercise_year: new Date().getFullYear(),
    deposited_at: today,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: blankValues,
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createReport({
          organization: values.organization,
          section: values.section,
          exercise_year: values.exercise_year,
          deposited_at: new Date(values.deposited_at).toISOString(),
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.accounting_reports.create.success, dict);
        reset(blankValues);
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
        <div className="grid grid-cols-2 gap-4">
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
          <Controller
            control={control}
            name="section"
            render={({ field }) => (
              <CustomSelect
                label={f.section}
                placeholder={f.section_placeholder}
                value={field.value}
                onChange={field.onChange}
                options={sectionOptions}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.exercise_year}
            type="number"
            placeholder={f.exercise_year_placeholder}
            error={errors.exercise_year?.message}
            inputProps={register("exercise_year")}
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
