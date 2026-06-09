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
import { useCreateControlMutation } from "@/redux/features/controls/controlsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";

const schema = z.object({
  exercise_year: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= fromYear && n <= toYear, {
      message: `Year must be between ${fromYear} and ${toYear}`,
    }),
  organization: z.string().uuid(),
  section: z.string().uuid(),
  procedure: z.string().uuid(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateControlDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createControl, { isLoading }] = useCreateControlMutation();
  const f = dict.controls.fields;

  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: sectionsData } = useGetSectionsQuery({ page: 1 });
  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });

  const orgOptions = (orgsData?.results ?? [])
    .filter((o) => o.uuid)
    .map((o) => ({ value: o.uuid!, label: o.name }));
  const sectionOptions = (sectionsData?.results ?? [])
    .filter((s) => s.uuid)
    .map((s) => ({ value: s.uuid!, label: s.name }));
  const procedureOptions = (proceduresData?.results ?? [])
    .filter((p) => p.uuid)
    .map((p) => ({ value: p.uuid!, label: p.name }));

  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercise_year: currentYear,
      organization: "",
      section: "",
      procedure: "",
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createControl({
          exercise_year: values.exercise_year,
          organization: values.organization,
          section: values.section,
          procedure: values.procedure,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.controls.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.controls.create.title}
      trigger={
        <Button>
          <Plus /> {dict.controls.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.controls.create.submit}
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
          <Controller
            control={control}
            name="procedure"
            render={({ field }) => (
              <CustomSelect
                label={f.procedure}
                placeholder={f.procedure_placeholder}
                value={field.value}
                onChange={field.onChange}
                options={procedureOptions}
              />
            )}
          />
          <FormField
            label={f.exercise_year}
            type="number"
            placeholder={f.exercise_year_placeholder}
            error={errors.exercise_year?.message}
            inputProps={register("exercise_year")}
          />
        </div>
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-destructive">
            {Object.values(errors)[0]?.message ?? "Invalid input"}
          </p>
        )}
      </form>
    </ReusableDialog>
  );
}
