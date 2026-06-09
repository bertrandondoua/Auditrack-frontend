import { z } from "zod";

export const phaseSchema = z.object({
  name: z.string().min(1),
  duration: z.string().min(1),
});

export type PhaseFormValues = z.infer<typeof phaseSchema>;
