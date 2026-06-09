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
import { useCreatePhaseMutation } from "@/redux/features/phases/phasesApiSlice";

import { phaseSchema, type PhaseFormValues } from "./schema";

export default function CreatePhaseDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createPhase, { isLoading }] = useCreatePhaseMutation();
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

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createPhase(values).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.phases.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.phases.create.title}
      trigger={
        <Button>
          <Plus /> {dict.phases.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.phases.create.submit}
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
          error={errors.duration?.message}
          inputProps={register("duration")}
        />
      </form>
    </ReusableDialog>
  );
}
