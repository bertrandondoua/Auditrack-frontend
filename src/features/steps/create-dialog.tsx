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
import { useCreateStepMutation } from "@/redux/features/steps/stepsApiSlice";

import { stepSchema, type StepFormValues } from "./schema";

export default function CreateStepDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createStep, { isLoading }] = useCreateStepMutation();
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

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createStep(values).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.steps.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.steps.create.title}
      trigger={
        <Button>
          <Plus /> {dict.steps.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.steps.create.submit}
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
      </form>
    </ReusableDialog>
  );
}
