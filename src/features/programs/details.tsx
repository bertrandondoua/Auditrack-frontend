"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Loading from "@/app/[lang]/loading";
import FileDropzone from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { fromYear, toYear } from "@/configs/constants";
import SectionsList from "@/features/sections/list";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import {
  useGetProgramQuery,
  usePartialUpdateProgramMutation,
  useUploadProgramMediaMutation,
} from "@/redux/features/programs/programsApiSlice";

const schema = z.object({
  program_year: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= fromYear && n <= toYear, {
      message: `Year must be between ${fromYear} and ${toYear}`,
    }),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function ProgramDetail({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const params = useParams<{ id: string; lang: Locale }>();
  const uuid = decodeURIComponent(params.id ?? "");

  const { data: program, isLoading } = useGetProgramQuery(uuid, { skip: !uuid });
  const [partialUpdate, { isLoading: isUpdating }] = usePartialUpdateProgramMutation();
  const [uploadMedia] = useUploadProgramMediaMutation();
  const [readOnly, setReadOnly] = useState(true);

  const handleMediaUpload = async (files: File[]) => {
    if (!program?.uuid || files.length === 0) return;
    const fd = new FormData();
    fd.append("media_file", files[0]);
    try {
      await uploadMedia({ uuid: program.uuid, data: fd }).unwrap();
      showSuccesToasts(toast, {}, dict.lang, dict.programs.upload.success, dict);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { program_year: new Date().getFullYear(), is_active: true },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (program) {
      reset({
        program_year: program.program_year,
        is_active: program.is_active ?? true,
      });
    }
  }, [program, reset]);

  const onSave = handleSubmit(async (values) => {
    if (!program?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: program.uuid,
        data: { program_year: values.program_year, is_active: values.is_active },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.programs.detail.modify_success, dict);
      setReadOnly(true);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  const handleToggle = () => (readOnly ? setReadOnly(false) : onSave());

  if (isLoading) return <Loading />;

  return (
    <section className="mt-2 space-y-6">
      <Link
        href={`/${params.lang}/configuration/programs`}
        className="inline-flex items-center gap-2 text-sm text-[#585757] hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {dict.programs.detail.back}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{program?.program_year ?? ""}</h1>
          <p className="text-sm text-[#585757]">
            {program?.is_active ? dict.programs.status.active : dict.programs.status.inactive}
          </p>
        </div>
        <Button
          isLoading={!readOnly && isUpdating}
          onClick={handleToggle}
          variant={readOnly ? "ghost" : "dark"}
        >
          {readOnly ? (
            <span className="flex flex-row items-center gap-1">
              <Edit3 /> {dict.programs.detail.modify_btn}
            </span>
          ) : (
            dict.programs.detail.save_btn
          )}
        </Button>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={dict.programs.fields.year}
            type="number"
            readOnly={readOnly}
            placeholder={dict.programs.fields.year_placeholder}
            error={errors.program_year?.message}
            inputProps={register("program_year")}
          />
        </div>
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={isActive}
            disabled={readOnly}
            onCheckedChange={(v) => setValue("is_active", v === true)}
          />
          <span>{dict.programs.fields.is_active}</span>
        </Label>
      </form>

      {program?.uuid && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xl font-semibold text-gray-800">{dict.programs.fields.media_file}</h2>
          {program.media_file && (
            <p className="text-sm">
              <span className="text-[#585757]">{dict.programs.fields.current_file}: </span>
              <a
                href={program.media_file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {program.media_file.split("/").pop() ?? program.media_file}
              </a>
            </p>
          )}
          {!readOnly && (
            <FileDropzone
              dropHint={dict.programs.upload.hint}
              selectLabel={dict.programs.upload.select}
              uploadLabel={dict.programs.upload.submit}
              uploadingLabel={dict.programs.upload.uploading}
              maxSizeLabel={(formatted) => `${dict.programs.upload.max_size}: ${formatted}`}
              errorTooLarge={dict.programs.upload.too_large}
              errorBadType={dict.programs.upload.bad_type}
              onUpload={handleMediaUpload}
            />
          )}
        </div>
      )}

      {program?.uuid && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xl font-semibold text-gray-800">{dict.sections.list.title}</h2>
          <SectionsList
            dict={dict}
            programUuid={program.uuid}
            defaultProgramYear={String(program.program_year)}
            embedded
          />
        </div>
      )}
    </section>
  );
}
