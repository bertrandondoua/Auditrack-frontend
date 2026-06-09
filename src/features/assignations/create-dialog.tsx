"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { fromYear, toYear } from "@/configs/constants";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useGetAccountantsQuery } from "@/redux/features/accountant/accountantApiSlice";
import { useCreateAssignationMutation } from "@/redux/features/assignation/assignationApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";

const schema = z.object({
  organization: z.string().uuid(),
  accountant: z.string().uuid(),
  exercise_year: z.string().regex(/^\d{4}$/),
});

type FormValues = z.infer<typeof schema>;

export interface CreateAssignationDialogProps {
  dict: Dict;
  /** When set, the org dropdown is locked to this UUID (per-org embedded view). */
  lockedOrganizationUuid?: string;
  triggerLabel?: string;
}

export default function CreateAssignationDialog({
  dict,
  lockedOrganizationUuid,
  triggerLabel,
}: CreateAssignationDialogProps) {
  const { toast } = useToast();
  const [createAssignation, { isLoading }] = useCreateAssignationMutation();
  const f = dict.assignations.fields;

  // Pull orgs + accountants for the select options. Backend pagination caps at 50;
  // beyond that, we'd need a server-side autocomplete. TODO when org/accountant
  // counts exceed 50.
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: accountantsData } = useGetAccountantsQuery({ page: 1 });

  const orgOptions = (orgsData?.results ?? [])
    .filter((o) => o.uuid)
    .map((o) => ({ value: o.uuid!, label: o.name }));

  const accountantOptions = (accountantsData?.results ?? [])
    .filter((a) => a.uuid)
    .map((a) => ({
      value: a.uuid!,
      label: `${a.first_name} ${a.last_name ?? ""}`.trim(),
    }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: Math.min(20, currentYear - fromYear + 1) }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  }).filter((o) => Number(o.value) <= toYear);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organization: lockedOrganizationUuid ?? "",
      accountant: "",
      exercise_year: String(currentYear),
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createAssignation({
          organization: values.organization,
          accountant: values.accountant,
          // Backend stores exercise_year as YYYY-MM-DD.
          exercise_year: `${values.exercise_year}-01-01`,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.assignations.create.success, dict);
        reset({
          organization: lockedOrganizationUuid ?? "",
          accountant: "",
          exercise_year: String(currentYear),
        });
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.assignations.create.title}
      trigger={
        <Button>
          <Plus /> {triggerLabel ?? dict.assignations.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button
          isLoading={isLoading}
          onClick={() => submit(closeDialog)()}
          variant="default"
          size="lg"
        >
          {dict.assignations.create.submit}
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
              readOnly={!!lockedOrganizationUuid}
              options={orgOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="accountant"
          render={({ field }) => (
            <CustomSelect
              label={f.accountant}
              placeholder={f.accountant_placeholder}
              value={field.value}
              onChange={field.onChange}
              options={accountantOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="exercise_year"
          render={({ field }) => (
            <CustomSelect
              label={f.exercise_year}
              placeholder={f.exercise_year_placeholder}
              value={field.value}
              onChange={field.onChange}
              options={yearOptions}
            />
          )}
        />
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-destructive">
            {Object.values(errors)[0]?.message ?? "Invalid input"}
          </p>
        )}
      </form>
    </ReusableDialog>
  );
}
