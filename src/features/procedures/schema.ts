import { z } from "zod";

export const procedureSchema = z.object({
  name: z.string().min(1),
  duration: z.string().optional().default(""),
  alert: z.string().optional().default(""),
});

export type ProcedureFormValues = z.infer<typeof procedureSchema>;
