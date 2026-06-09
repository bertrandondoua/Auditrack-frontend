"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useGetProgramsQuery } from "@/redux/features/programs/programsApiSlice";
import { useCreateSectionMutation } from "@/redux/features/sections/sectionsApiSlice";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  program_year: z.string().regex(/^\d{4}$/),
  program: z.string().uuid().optional().or(z.literal("")),
  president: z.string().uuid().optional().or(z.literal("")),
  chief_clerk: z.string().uuid().optional().or(z.literal("")),
  clerk: z.string().uuid().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export interface CreateSectionDialogProps {
  dict: Dict;
  /** When set, the program dropdown is locked and pre-filled. */
  lockedProgramUuid?: string;
  defaultProgramYear?: string;
}

export default function CreateSectionDialog({
  dict,
  lockedProgramUuid,
  defaultProgramYear,
}: CreateSectionDialogProps) {
  const { toast } = useToast();
  const [createSection, { isLoading }] = useCreateSectionMutation();
  const f = dict.sections.fields;

  const { data: programsData } = useGetProgramsQuery({ page: 1 });
  const programOptions = (programsData?.results ?? [])
    .filter((p) => p.uuid)
    .map((p) => ({ value: p.uuid!, label: String(p.program_year) }));

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
      name: "",
      description: "",
      program_year: defaultProgramYear ?? String(currentYear),
      program: lockedProgramUuid ?? "",
      president: "",
      chief_clerk: "",
      clerk: "",
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createSection({
          name: values.name,
          description: values.description || null,
          program_year: values.program_year,
          program: values.program || undefined,
          president: values.president || undefined,
          chief_clerk: values.chief_clerk || undefined,
          clerk: values.clerk || undefined,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.sections.create.success, dict);
        reset({
          name: "",
          description: "",
          program_year: defaultProgramYear ?? String(currentYear),
          program: lockedProgramUuid ?? "",
          president: "",
          chief_clerk: "",
          clerk: "",
        });
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.sections.create.title}
      trigger={
        <Button>
          <Plus /> {dict.sections.list.create_btn}
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
          {dict.sections.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <FormField
          label={f.name}
          placeholder={f.name_placeholder}
          error={errors.name?.message}
          inputProps={register("name")}
        />
        <FormField
          label={f.description}
          placeholder={f.description_placeholder}
          inputProps={register("description")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="program"
            render={({ field }) => (
              <CustomSelect
                label={f.program}
                placeholder={f.program_placeholder}
                value={field.value}
                onChange={field.onChange}
                readOnly={!!lockedProgramUuid}
                options={programOptions}
              />
            )}
          />
          <FormField
            label={f.program_year}
            placeholder={f.program_year_placeholder}
            error={errors.program_year?.message}
            inputProps={register("program_year")}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label={f.president}
            placeholder={f.president_placeholder}
            inputProps={register("president")}
          />
          <FormField
            label={f.chief_clerk}
            placeholder={f.chief_clerk_placeholder}
            inputProps={register("chief_clerk")}
          />
          <FormField
            label={f.clerk}
            placeholder={f.clerk_placeholder}
            inputProps={register("clerk")}
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
