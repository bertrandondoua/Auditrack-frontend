import type { Params } from "@/types/user";

/**
 * Strip `undefined`, `null`, and empty-string values from a params object
 * before sending to the API. Mirrors what each slice was doing inline —
 * single source of truth now.
 */
export function compactParams(input: Record<string, string | number | undefined | null>): Params {
  const params: Params = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== null && v !== "") params[k] = v;
  }
  return params;
}
