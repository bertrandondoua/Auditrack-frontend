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
import { usePartialUpdateProcedureMutation } from "@/redux/features/procedures/proceduresApiSlice";
import type { Procedure } from "@/types/procedure";

import { procedureSchema, type ProcedureFormValues } from "./schema";

export interface EditProcedureDialogProps {
  dict: Dict;
  procedure: Procedure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProcedureDialog({
  dict,
  procedure,
  open,
  onOpenChange,
}: EditProcedureDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdateProcedureMutation();
  const f = dict.procedures.fields;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProcedureFormValues>({
    resolver: zodResolver(procedureSchema),
    defaultValues: { name: "", duration: "", alert: "" },
  });

  useEffect(() => {
    if (procedure) {
      reset({
        name: procedure.name,
        duration: procedure.duration ?? "",
        alert: procedure.alert ?? "",
      });
    }
  }, [procedure, reset]);

  const submit = handleSubmit(async (values) => {
    if (!procedure?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: procedure.uuid,
        data: {
          name: values.name,
          duration: values.duration || undefined,
          alert: values.alert || undefined,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.procedures.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.procedures.edit.title}</DialogTitle>
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
            inputProps={register("duration")}
          />
          <FormField
            label={f.alert}
            placeholder={f.alert_placeholder}
            inputProps={register("alert")}
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
              {dict.procedures.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
