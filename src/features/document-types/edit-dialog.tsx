"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { usePartialUpdateDocumentTypeMutation } from "@/redux/features/documents/documentTypesApiSlice";
import type { DocumentType } from "@/types/document";

import { documentTypeSchema, type DocumentTypeFormValues } from "./schema";

export interface EditDocumentTypeDialogProps {
  dict: Dict;
  docType: DocumentType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDocumentTypeDialog({
  dict,
  docType,
  open,
  onOpenChange,
}: EditDocumentTypeDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdateDocumentTypeMutation();
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

  useEffect(() => {
    if (docType) {
      reset({
        name: docType.name,
        short_name: docType.short_name ?? "",
        is_opening_doc_type: docType.is_opening_doc_type ?? false,
      });
    }
  }, [docType, reset]);

  const submit = handleSubmit(async (values) => {
    if (!docType?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: docType.uuid,
        data: {
          name: values.name,
          short_name: values.short_name || null,
          is_opening_doc_type: values.is_opening_doc_type,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.document_types.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.document_types.edit.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
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
              {dict.document_types.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
