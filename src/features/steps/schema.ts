import { z } from "zod";

export const stepSchema = z.object({
  name: z.string().min(1),
});

export type StepFormValues = z.infer<typeof stepSchema>;
