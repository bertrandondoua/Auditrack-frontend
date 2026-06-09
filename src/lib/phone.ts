import { z } from "zod";

/**
 * Single source of truth for phone-number validation across forms.
 *
 * Auditrack is Cameroon-only — accepts mobile numbers in any of:
 *   6XX XXX XXX           (9 digits, leading 6 mandatory for mobile)
 *   06XX XXX XXX          (10 digits, common landline-formatter habit)
 *   +237 6XX XXX XXX      (E.164)
 *   2376XX XXX XXX        (without `+`)
 *
 * Spaces and dashes are permitted and stripped. Anything else fails Zod
 * validation. `normalizePhone` returns the canonical E.164 form.
 */
const STRIPPED = /^(\+?237)?0*6\d{8}$/;

/** Strip whitespace and dashes; preserves a leading `+`. */
function strip(raw: string): string {
  return raw.replace(/[\s\-]/g, "");
}

export const phoneSchema = z
  .string()
  .min(1)
  .refine((v) => STRIPPED.test(strip(v)), {
    message: "Expected a Cameroon mobile number, e.g. 6XX XXX XXX or +237 6XX XXX XXX",
  });

/** Canonical E.164 form `+237XXXXXXXXX`. Idempotent. */
export function normalizePhone(raw: string): string {
  const s = strip(raw);
  if (!s) return s;
  if (s.startsWith("+")) return s;
  if (s.startsWith("237")) return `+${s}`;
  // Trim any leading zeros from local form (e.g. "0699...")
  return `+237${s.replace(/^0+/, "")}`;
}
