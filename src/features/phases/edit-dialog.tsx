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
import { usePartialUpdatePhaseMutation } from "@/redux/features/phases/phasesApiSlice";
import type { Phase } from "@/types/phase";

import { phaseSchema, type PhaseFormValues } from "./schema";

export interface EditPhaseDialogProps {
  dict: Dict;
  phase: Phase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPhaseDialog({ dict, phase, open, onOpenChange }: EditPhaseDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdatePhaseMutation();
  const f = dict.phases.fields;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseSchema),
    defaultValues: { name: "", duration: "" },
  });

  useEffect(() => {
    if (phase) reset({ name: phase.name, duration: phase.duration });
  }, [phase, reset]);

  const submit = handleSubmit(async (values) => {
    if (!phase?.uuid) return;
    try {
      const res = await partialUpdate({ uuid: phase.uuid, data: values }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.phases.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.phases.edit.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <FormField
            label={f.name}
            placeholder={f.name_placeholder}
            error={errors.name?.message}
            inputProps={register("name")}
          />
          <FormField
            label={f.duration}
            placeholder={f.duration_placeholder}
            error={errors.duration?.message}
            inputProps={register("duration")}
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
              {dict.phases.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
