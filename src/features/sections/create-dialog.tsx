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

// Backend requires program + clerk + chief_clerk + president (all UUIDs).
// There is no `program_year` field on Section — the year lives on the Program.
const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  program: z.string().uuid(),
  president: z.string().uuid(),
  chief_clerk: z.string().uuid(),
  clerk: z.string().uuid(),
});

type FormValues = z.infer<typeof schema>;

export interface CreateSectionDialogProps {
  dict: Dict;
  /** When set, the program dropdown is locked and pre-filled. */
  lockedProgramUuid?: string;
}

export default function CreateSectionDialog({ dict, lockedProgramUuid }: CreateSectionDialogProps) {
  const { toast } = useToast();
  const [createSection, { isLoading }] = useCreateSectionMutation();
  const f = dict.sections.fields;

  const { data: programsData } = useGetProgramsQuery({ page: 1 });
  const programOptions = (programsData?.results ?? [])
    .filter((p) => p.uuid)
    .map((p) => ({ value: p.uuid!, label: String(p.program_year) }));

  const blankValues: FormValues = {
    name: "",
    description: "",
    program: lockedProgramUuid ?? "",
    president: "",
    chief_clerk: "",
    clerk: "",
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
        const res = await createSection({
          name: values.name,
          description: values.description || null,
          program: values.program,
          president: values.president,
          chief_clerk: values.chief_clerk,
          clerk: values.clerk,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.sections.create.success, dict);
        reset(blankValues);
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
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label={f.president}
            placeholder={f.president_placeholder}
            error={errors.president?.message}
            inputProps={register("president")}
          />
          <FormField
            label={f.chief_clerk}
            placeholder={f.chief_clerk_placeholder}
            error={errors.chief_clerk?.message}
            inputProps={register("chief_clerk")}
          />
          <FormField
            label={f.clerk}
            placeholder={f.clerk_placeholder}
            error={errors.clerk?.message}
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
