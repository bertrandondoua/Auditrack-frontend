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
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetStepsQuery } from "@/redux/features/steps/stepsApiSlice";
import { useCreateTagMutation } from "@/redux/features/tags/tagsApiSlice";

/**
 * WRITE-CONTRACT AMBIGUITY (see BACKEND_MISMATCHES.md):
 * The Tag serializer (openapi.json) marks `procedure`, `from_step`, `to_step`
 * and `steps` as readOnly — only `duration` (+ `is_active`) are writable.
 * That means the backend, as currently specified, may IGNORE the workflow
 * edge fields below and only persist the duration. We keep collecting them
 * because the readOnly flags look like a drf-yasg artefact (the model almost
 * certainly stores these edges), but until the backend confirms writable
 * source fields (e.g. `procedure_id`), tag creation may not wire up the graph.
 */
const schema = z
  .object({
    procedure: z.string().uuid(),
    from_step: z.string().uuid(),
    to_step: z.string().uuid(),
    duration: z.string().min(1),
  })
  .refine((v) => v.from_step !== v.to_step, {
    message: "from_step and to_step must differ",
    path: ["to_step"],
  });

type FormValues = z.infer<typeof schema>;

export default function CreateTagDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createTag, { isLoading }] = useCreateTagMutation();
  const f = dict.tags.fields;

  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });
  const { data: stepsData } = useGetStepsQuery({ page: 1 });

  const procedureOptions = (proceduresData?.results ?? [])
    .filter((p) => p.uuid)
    .map((p) => ({ value: p.uuid!, label: p.name }));
  const stepOptions = (stepsData?.results ?? [])
    .filter((s) => s.uuid)
    .map((s) => ({ value: s.uuid!, label: s.name }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { procedure: "", from_step: "", to_step: "", duration: "" },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createTag(values).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.tags.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.tags.create.title}
      trigger={
        <Button>
          <Plus /> {dict.tags.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.tags.create.submit}
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
              options={procedureOptions}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="from_step"
            render={({ field }) => (
              <CustomSelect
                label={f.from_step}
                placeholder={f.from_step_placeholder}
                value={field.value}
                onChange={field.onChange}
                options={stepOptions}
              />
            )}
          />
          <Controller
            control={control}
            name="to_step"
            render={({ field }) => (
              <CustomSelect
                label={f.to_step}
                placeholder={f.to_step_placeholder}
                value={field.value}
                onChange={field.onChange}
                options={stepOptions}
              />
            )}
          />
        </div>
        <FormField
          label={f.duration}
          placeholder={f.duration_placeholder}
          error={errors.duration?.message}
          inputProps={register("duration")}
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
