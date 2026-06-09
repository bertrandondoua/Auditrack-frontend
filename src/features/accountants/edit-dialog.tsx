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
import { usePartialUpdateAccountantMutation } from "@/redux/features/accountant/accountantApiSlice";
import type { Accountant } from "@/types/accountant";

import { accountantSchema, normalizePhone, type AccountantFormValues } from "./schema";

export interface EditAccountantDialogProps {
  dict: Dict;
  accountant: Accountant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditAccountantDialog({
  dict,
  accountant,
  open,
  onOpenChange,
}: EditAccountantDialogProps) {
  const { toast } = useToast();
  const [partialUpdateAccountant, { isLoading }] = usePartialUpdateAccountantMutation();
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

  // Re-seed form when the target accountant changes.
  useEffect(() => {
    if (accountant) {
      reset({
        first_name: accountant.first_name,
        last_name: accountant.last_name ?? "",
        email: accountant.email,
        phone_number: accountant.phone_number,
        title: accountant.title ?? "",
        accountant_id: accountant.accountant_id ?? "",
      });
    }
  }, [accountant, reset]);

  const submit = handleSubmit(async (values) => {
    if (!accountant?.uuid) return;
    try {
      const res = await partialUpdateAccountant({
        uuid: accountant.uuid,
        data: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: normalizePhone(values.phone_number),
          title: values.title || null,
          accountant_id: values.accountant_id || null,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.accountants.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50%]">
        <DialogHeader>
          <DialogTitle>{dict.accountants.edit.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
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
            <Button type="submit" variant="default" size="lg" isLoading={isLoading}>
              {dict.accountants.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
