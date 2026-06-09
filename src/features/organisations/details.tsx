"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Loading from "@/app/[lang]/loading";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import AssignationsList from "@/features/assignations/list";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { normalizePhone, phoneSchema } from "@/lib/phone";
import {
  useGetOrganizationByIdQuery,
  usePartialUpdateOrganizationMutation,
} from "@/redux/features/organizations/organizationApiSlice";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().optional().default(""),
  phone_number: phoneSchema,
  email: z.string().email().or(z.literal("")).optional(),
  type: z.enum(["public", "para-public"]),
});

type FormValues = z.infer<typeof schema>;

export default function OrganisationDetail({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const params = useParams<{ id: string; lang: Locale }>();
  const uuid = decodeURIComponent(params.id ?? "");

  const { data: organization, isLoading } = useGetOrganizationByIdQuery(uuid, {
    skip: !uuid,
  });
  const [partialUpdate, { isLoading: isUpdating }] = usePartialUpdateOrganizationMutation();

  const [readOnly, setReadOnly] = useState(true);

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

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name ?? "",
        address: organization.address ?? "",
        phone_number: organization.phone_number ?? "",
        email: organization.email ?? "",
        type: (organization.type ?? "public") as FormValues["type"],
      });
    }
  }, [organization, reset]);

  const f = dict.organisations.create.fields;
  const d = dict.organisations.detail;

  const onSave = handleSubmit(async (values) => {
    if (!organization?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: organization.uuid,
        data: {
          name: values.name,
          address: values.address || null,
          email: values.email || null,
          phone_number: normalizePhone(values.phone_number),
          type: values.type,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, d.modify_success, dict);
      setReadOnly(true);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  const handleToggle = () => {
    if (readOnly) {
      setReadOnly(false);
    } else {
      onSave();
    }
  };

  if (isLoading) return <Loading />;

  return (
    <section className="mt-2 space-y-6">
      <Link
        href={`/${params.lang}/organisations`}
        className="inline-flex items-center gap-2 text-sm text-[#585757] hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {d.back}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{organization?.name ?? ""}</h1>
          <p className="text-sm text-[#585757]">{organization?.email ?? ""}</p>
        </div>
        <Button
          isLoading={!readOnly && isUpdating}
          onClick={handleToggle}
          variant={readOnly ? "ghost" : "dark"}
        >
          {readOnly ? (
            <span className="flex flex-row items-center gap-1">
              <Edit3 /> {d.modify_btn}
            </span>
          ) : (
            d.save_btn
          )}
        </Button>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.name}
            readOnly={readOnly}
            placeholder={f.name_placeholder}
            error={errors.name?.message}
            inputProps={register("name")}
          />
          <FormField
            label={f.address}
            readOnly={readOnly}
            placeholder={f.address_placeholder}
            inputProps={register("address")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={f.phone}
            readOnly={readOnly}
            placeholder={f.phone_placeholder}
            error={errors.phone_number?.message}
            inputProps={register("phone_number")}
          />
          <FormField
            label={f.email}
            readOnly={readOnly}
            type="email"
            placeholder={f.email_placeholder}
            error={errors.email?.message}
            inputProps={register("email")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <CustomSelect
                label={f.type}
                placeholder={f.type_placeholder}
                value={field.value}
                onChange={(v) => field.onChange(v as FormValues["type"])}
                readOnly={readOnly}
                options={[
                  { value: "public", label: dict.organisations.types.public },
                  {
                    value: "para-public",
                    label: dict.organisations.types["para-public"],
                  },
                ]}
              />
            )}
          />
        </div>
      </form>

      {organization?.uuid && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xl font-semibold text-gray-800">{d.assignments_title}</h2>
          <AssignationsList dict={dict} organizationUuid={organization.uuid} embedded />
        </div>
      )}
    </section>
  );
}
