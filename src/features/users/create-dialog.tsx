"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateUserMutation } from "@/redux/features/users/usersApiSlice";

import {
  genderOptions,
  normalizePhone,
  roleOptions,
  userSchema,
  type UserFormValues,
} from "./schema";

export default function CreateUserDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createUser, { isLoading }] = useCreateUserMutation();
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
      role: "clerk",
      gender: "",
    },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createUser({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: normalizePhone(values.phone_number),
          role: values.role,
          ...(values.gender ? { gender: values.gender } : {}),
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.users.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.users.create.title}
      trigger={
        <Button>
          <Plus /> {dict.users.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.users.create.submit}
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
          label={f.email}
          type="email"
          placeholder={f.email_placeholder}
          error={errors.email?.message}
          inputProps={register("email")}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.phone}
            placeholder={f.phone_placeholder}
            error={errors.phone_number?.message}
            inputProps={register("phone_number")}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <CustomSelect
                label={f.gender}
                placeholder={f.gender_placeholder}
                value={field.value ?? ""}
                onChange={field.onChange}
                options={genderOptions(dict)}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <CustomSelect
              label={f.role}
              placeholder={f.role_placeholder}
              value={field.value}
              onChange={(v) => field.onChange(v as UserFormValues["role"])}
              options={roleOptions(dict)}
            />
          )}
        />
      </form>
    </ReusableDialog>
  );
}
