import { z } from "zod";

export const documentTypeSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().optional().default(""),
  is_opening_doc_type: z.boolean().default(false),
});

export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>;
