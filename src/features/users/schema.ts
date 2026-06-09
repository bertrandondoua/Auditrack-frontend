import { z } from "zod";

import type { Dict } from "@/lib/dictionaries";
import { normalizePhone, phoneSchema } from "@/lib/phone";

/** Backend `accounts.User.role` enum (openapi.json). */
export const ROLES = ["clerk", "chief_clerk", "president", "it_manager"] as const;

/** Backend `accounts.User.gender` enum (openapi.json). */
export const GENDERS = ["M", "F"] as const;

export const userSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  // phone_number is REQUIRED on the backend User serializer.
  phone_number: phoneSchema,
  role: z.enum(ROLES),
  // gender is optional (nullable on the backend).
  gender: z.enum(GENDERS).or(z.literal("")).optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function roleOptions(dict: Dict) {
  return ROLES.map((value) => ({ value, label: dict.users.roles[value] }));
}

export function genderOptions(dict: Dict) {
  return GENDERS.map((value) => ({ value, label: dict.users.genders[value] }));
}

export { normalizePhone };
