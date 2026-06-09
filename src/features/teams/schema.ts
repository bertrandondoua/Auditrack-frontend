import { z } from "zod";

import { normalizePhone, phoneSchema } from "@/lib/phone";

export const teamSchema = z.object({
  name: z.string().min(1),
  team_lead_name: z.string().min(1),
  team_lead_email: z.string().email(),
  team_lead_phone_number: phoneSchema,
  number_of_members: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? null : Number(v)))
    .nullable()
    .optional(),
  section: z.string().uuid().optional().or(z.literal("")),
});

export type TeamFormValues = z.infer<typeof teamSchema>;

export { normalizePhone };
