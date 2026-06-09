"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateProcedureStepMutation } from "@/redux/features/procedureSteps/procedureStepsApiSlice";
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetStepsQuery } from "@/redux/features/steps/stepsApiSlice";

const schema = z.object({
  procedure: z.string().uuid(),
  step: z.string().uuid(),
});

type FormValues = z.infer<typeof schema>;

export interface CreateProcedureStepDialogProps {
  dict: Dict;
  /** When set, the procedure dropdown is locked. */
  lockedProcedureUuid?: string;
}

export default function CreateProcedureStepDialog({
  dict,
  lockedProcedureUuid,
}: CreateProcedureStepDialogProps) {
  const { toast } = useToast();
  const [createProcedureStep, { isLoading }] = useCreateProcedureStepMutation();
  const f = dict.procedure_steps.fields;

  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });
  const { data: stepsData } = useGetStepsQuery({ page: 1 });

  const procedureOptions = (proceduresData?.results ?? [])
    .filter((p) => p.uuid)
    .map((p) => ({ value: p.uuid!, label: p.name }));
  const stepOptions = (stepsData?.results ?? [])
    .filter((s) => s.uuid)
    .map((s) => ({ value: s.uuid!, label: s.name }));

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { procedure: lockedProcedureUuid ?? "", step: "" },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createProcedureStep(values).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.procedure_steps.create.success, dict);
        reset({ procedure: lockedProcedureUuid ?? "", step: "" });
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.procedure_steps.create.title}
      trigger={
        <Button>
          <Plus /> {dict.procedure_steps.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.procedure_steps.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <Controller
          control={control}
          name="procedure"
          render={({ field }) => (
            <CustomSelect
              label={f.procedure}
              placeholder={f.procedure_placeholder}
              value={field.value}
              onChange={field.onChange}
              readOnly={!!lockedProcedureUuid}
              options={procedureOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="step"
          render={({ field }) => (
            <CustomSelect
              label={f.step}
              placeholder={f.step_placeholder}
              value={field.value}
              onChange={field.onChange}
              options={stepOptions}
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
