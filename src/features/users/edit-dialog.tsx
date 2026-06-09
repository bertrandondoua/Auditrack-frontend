"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CustomSelect } from "@/components/shared/select";
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
import { usePartialUpdateUserMutation } from "@/redux/features/users/usersApiSlice";
import type { User } from "@/types/user";

import { ROLE_OPTIONS, normalizePhone, userSchema, type UserFormValues } from "./schema";

export interface EditUserDialogProps {
  dict: Dict;
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({ dict, user, open, onOpenChange }: EditUserDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdateUserMutation();
  const f = dict.users.fields;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      position: "",
      role: "clerk",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name ?? "",
        email: user.email,
        phone_number: user.phone_number ?? "",
        position: user.position ?? "",
        role: (user.role ?? "clerk") as UserFormValues["role"],
      });
    }
  }, [user, reset]);

  const submit = handleSubmit(async (values) => {
    if (!user?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: user.uuid,
        data: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: normalizePhone(values.phone_number ?? ""),
          position: values.position,
          role: values.role,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.users.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50%]">
        <DialogHeader>
          <DialogTitle>{dict.users.edit.title}</DialogTitle>
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
            label={f.email}
            type="email"
            placeholder={f.email_placeholder}
            error={errors.email?.message}
            inputProps={register("email")}
          />
          <FormField
            label={f.phone}
            placeholder={f.phone_placeholder}
            inputProps={register("phone_number")}
          />
          <FormField
            label={f.position}
            placeholder={f.position_placeholder}
            inputProps={register("position")}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <CustomSelect
                label={f.role}
                placeholder={f.role_placeholder}
                value={field.value}
                onChange={(v) => field.onChange(v as UserFormValues["role"])}
                options={ROLE_OPTIONS}
              />
            )}
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
              {dict.users.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
