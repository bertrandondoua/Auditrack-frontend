"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fromYear, toYear } from "@/configs/constants";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateProgramMutation } from "@/redux/features/programs/programsApiSlice";

const schema = z.object({
  program_year: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= fromYear && n <= toYear, {
      message: `Year must be between ${fromYear} and ${toYear}`,
    }),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function CreateProgramDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createProgram, { isLoading }] = useCreateProgramMutation();
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { program_year: currentYear, is_active: true },
  });

  const isActive = watch("is_active");

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createProgram({
          program_year: values.program_year,
          is_active: values.is_active,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.programs.create.success, dict);
        reset({ program_year: currentYear, is_active: true });
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.programs.create.title}
      trigger={
        <Button>
          <Plus /> {dict.programs.list.create_btn}
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
          {dict.programs.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <FormField
          label={dict.programs.fields.year}
          type="number"
          inputMode="numeric"
          placeholder={dict.programs.fields.year_placeholder}
          error={errors.program_year?.message}
          inputProps={register("program_year")}
        />
        <Label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={isActive} onCheckedChange={(v) => setValue("is_active", v === true)} />
          <span>{dict.programs.fields.is_active}</span>
        </Label>
      </form>
    </ReusableDialog>
  );
}
