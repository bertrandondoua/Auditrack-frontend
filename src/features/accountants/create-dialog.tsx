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
import { useCreateAccountantMutation } from "@/redux/features/accountant/accountantApiSlice";

import { accountantSchema, normalizePhone, type AccountantFormValues } from "./schema";

export default function CreateAccountantDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createAccountant, { isLoading }] = useCreateAccountantMutation();
  const f = dict.accountants.fields;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountantFormValues>({
    resolver: zodResolver(accountantSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      title: "",
      accountant_id: "",
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createAccountant({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: normalizePhone(values.phone_number),
          title: values.title || null,
          accountant_id: values.accountant_id || null,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.accountants.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.accountants.create.title}
      trigger={
        <Button>
          <Plus /> {dict.accountants.list.create_btn}
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
          {dict.accountants.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.first_name}
            placeholder={f.first_name_placeholder}
            error={errors.first_name?.message}
            inputProps={register("first_name")}
          />
          <FormField
            label={f.last_name}
            placeholder={f.last_name_placeholder}
            error={errors.last_name?.message}
            inputProps={register("last_name")}
          />
        </div>
        <FormField
          label={f.title}
          placeholder={f.title_placeholder}
          inputProps={register("title")}
        />
        <FormField
          label={f.accountant_id}
          placeholder={f.accountant_id_placeholder}
          inputProps={register("accountant_id")}
        />
        <FormField
          label={f.email}
          type="email"
          placeholder={f.email_placeholder}
          error={errors.email?.message}
          inputProps={register("email")}
        />
        <FormField
          label={f.phone}
          placeholder={f.phone_placeholder}
          error={errors.phone_number?.message}
          inputProps={register("phone_number")}
        />
      </form>
    </ReusableDialog>
  );
}
