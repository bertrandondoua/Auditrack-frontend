"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { usePartialUpdateStepMutation } from "@/redux/features/steps/stepsApiSlice";
import type { Step } from "@/types/step";

import { stepSchema, type StepFormValues } from "./schema";

export interface EditStepDialogProps {
  dict: Dict;
  step: Step | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStepDialog({ dict, step, open, onOpenChange }: EditStepDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdateStepMutation();
  const f = dict.steps.fields;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (step) reset({ name: step.name });
  }, [step, reset]);

  const submit = handleSubmit(async (values) => {
    if (!step?.uuid) return;
    try {
      const res = await partialUpdate({ uuid: step.uuid, data: values }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.steps.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.steps.edit.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <FormField
            label={f.name}
            placeholder={f.name_placeholder}
            error={errors.name?.message}
            inputProps={register("name")}
          />
          <DialogFooter className="self-end h-fit">
            <Button
              type="button"
              variant="dark"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" size="lg" isLoading={isLoading}>
              {dict.steps.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
