import { z } from "zod";

import { normalizePhone, phoneSchema } from "@/lib/phone";

const ROLES = [
  "clerk",
  "chief_clerk",
  "section_president",
  "magistrate",
  "attorney_general",
  "it_manager",
] as const;

export const userSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  // Phone is optional on users; only validate when non-empty.
  phone_number: phoneSchema.optional().or(z.literal("")),
  position: z.string().optional().default(""),
  role: z.enum(ROLES),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const ROLE_OPTIONS = ROLES.map((value) => ({ value, label: value }));

export { normalizePhone };
