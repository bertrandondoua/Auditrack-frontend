"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { normalizePhone, phoneSchema } from "@/lib/phone";
import { useCreateOrganizationMutation } from "@/redux/features/organizations/organizationApiSlice";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().optional().default(""),
  phone_number: phoneSchema,
  email: z.string().email().or(z.literal("")).optional(),
  type: z.enum(["public", "para-public"]),
});

type FormValues = z.infer<typeof schema>;

export default function CreateOrganisationDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createOrganization, { isLoading }] = useCreateOrganizationMutation();
  const f = dict.organisations.create.fields;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", address: "", phone_number: "", email: "", type: "public" },
  });

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createOrganization({
          name: values.name,
          address: values.address || null,
          email: values.email || null,
          phone_number: normalizePhone(values.phone_number),
          type: values.type,
          folder_number: "", // backend will assign; required by serializer if not provided server-side
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.organisations.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.organisations.create.title}
      trigger={
        <Button>
          <Plus /> {dict.organisations.list.create_btn}
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
          {dict.organisations.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
        <FormField
          label={f.name}
          labelClassName="w-full"
          placeholder={f.name_placeholder}
          error={errors.name?.message}
          inputProps={register("name")}
        />

        <FormField
          label={f.address}
          labelClassName="w-full"
          placeholder={f.address_placeholder}
          inputProps={register("address")}
        />

        <FormField
          label={f.phone}
          labelClassName="w-full"
          placeholder={f.phone_placeholder}
          error={errors.phone_number?.message}
          inputProps={register("phone_number")}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <CustomSelect
              label={f.type}
              placeholder={f.type_placeholder}
              value={field.value}
              onChange={(v) => field.onChange(v as FormValues["type"])}
              options={[
                { value: "public", label: dict.organisations.types.public },
                { value: "para-public", label: dict.organisations.types["para-public"] },
              ]}
            />
          )}
        />

        <FormField
          label={f.email}
          labelClassName="w-full"
          type="email"
          placeholder={f.email_placeholder}
          error={errors.email?.message}
          inputProps={register("email")}
        />
      </form>
    </ReusableDialog>
  );
}
