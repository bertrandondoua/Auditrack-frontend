"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import ReusableDialog from "@/components/shared/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateDocumentTypeMutation } from "@/redux/features/documents/documentTypesApiSlice";

import { documentTypeSchema, type DocumentTypeFormValues } from "./schema";

export default function CreateDocumentTypeDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createDocType, { isLoading }] = useCreateDocumentTypeMutation();
  const f = dict.document_types.fields;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentTypeFormValues>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: { name: "", short_name: "", is_opening_doc_type: false },
  });
  const isOpening = watch("is_opening_doc_type");

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createDocType({
          name: values.name,
          short_name: values.short_name || null,
          is_opening_doc_type: values.is_opening_doc_type,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.document_types.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.document_types.create.title}
      trigger={
        <Button>
          <Plus /> {dict.document_types.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.document_types.create.submit}
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
          label={f.short_name}
          placeholder={f.short_name_placeholder}
          inputProps={register("short_name")}
        />
        <Label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={isOpening}
            onCheckedChange={(v) => setValue("is_opening_doc_type", v === true)}
          />
          <span>{f.is_opening_doc_type}</span>
        </Label>
      </form>
    </ReusableDialog>
  );
}
