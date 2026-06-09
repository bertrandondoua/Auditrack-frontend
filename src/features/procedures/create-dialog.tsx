"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import ReusableDialog from "@/components/shared/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateProcedureMutation } from "@/redux/features/procedures/proceduresApiSlice";

import { procedureSchema, type ProcedureFormValues } from "./schema";

export default function CreateProcedureDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createProcedure, { isLoading }] = useCreateProcedureMutation();
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

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createProcedure({
          name: values.name,
          duration: values.duration || undefined,
          alert: values.alert || undefined,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.procedures.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.procedures.create.title}
      trigger={
        <Button>
          <Plus /> {dict.procedures.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.procedures.create.submit}
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
          label={f.duration}
          placeholder={f.duration_placeholder}
          inputProps={register("duration")}
        />
        <FormField
          label={f.alert}
          placeholder={f.alert_placeholder}
          inputProps={register("alert")}
        />
      </form>
    </ReusableDialog>
  );
}
