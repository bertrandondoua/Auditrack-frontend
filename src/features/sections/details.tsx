"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Loading from "@/app/[lang]/loading";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useGetSectionQuery,
  usePartialUpdateSectionMutation,
} from "@/redux/features/sections/sectionsApiSlice";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;

export default function SectionDetail({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const params = useParams<{ id: string; lang: Locale }>();
  const uuid = decodeURIComponent(params.id ?? "");

  const { data: section, isLoading } = useGetSectionQuery(uuid, { skip: !uuid });
  const [partialUpdate, { isLoading: isUpdating }] = usePartialUpdateSectionMutation();
  const [readOnly, setReadOnly] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (section) {
      reset({
        name: section.name ?? "",
        description: section.description ?? "",
      });
    }
  }, [section, reset]);

  const onSave = handleSubmit(async (values) => {
    if (!section?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: section.uuid,
        data: {
          name: values.name,
          description: values.description || null,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.sections.detail.modify_success, dict);
      setReadOnly(true);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  if (isLoading) return <Loading />;

  return (
    <section className="mt-2 space-y-6">
      <Link
        href={`/${params.lang}/configuration/sections`}
        className="inline-flex items-center gap-2 text-sm text-[#585757] hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {dict.sections.detail.back}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{section?.name ?? ""}</h1>
          <p className="text-sm text-[#585757]">{section?.description ?? ""}</p>
        </div>
        <Button
          isLoading={!readOnly && isUpdating}
          onClick={() => (readOnly ? setReadOnly(false) : onSave())}
          variant={readOnly ? "ghost" : "dark"}
        >
          {readOnly ? (
            <span className="flex flex-row items-center gap-1">
              <Edit3 /> {dict.sections.detail.modify_btn}
            </span>
          ) : (
            dict.sections.detail.save_btn
          )}
        </Button>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <FormField
          label={dict.sections.fields.name}
          readOnly={readOnly}
          placeholder={dict.sections.fields.name_placeholder}
          error={errors.name?.message}
          inputProps={register("name")}
        />
        <FormField
          label={dict.sections.fields.description}
          readOnly={readOnly}
          placeholder={dict.sections.fields.description_placeholder}
          inputProps={register("description")}
        />
      </form>
    </section>
  );
}
