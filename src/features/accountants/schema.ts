import { z } from "zod";

import { normalizePhone, phoneSchema } from "@/lib/phone";

export const accountantSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: phoneSchema,
  title: z.string().optional().default(""),
  accountant_id: z.string().optional().default(""),
});

export type AccountantFormValues = z.infer<typeof accountantSchema>;

export { normalizePhone };
