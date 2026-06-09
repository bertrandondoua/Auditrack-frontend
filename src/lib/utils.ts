import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coerce a backend "*_details" embed into a display string.
 *
 * drf-yasg types SerializerMethodFields as `string` in the OpenAPI spec, but
 * several embeds (e.g. `organization_details`) actually return a nested object
 * such as `{ name, email }`. Rendering that object directly throws React
 * error #31 ("Objects are not valid as a React child"). This safely extracts a
 * human-readable label whether the embed is a string, an object, or nullish.
 */
export function embedLabel(value: unknown, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const candidate = o.name ?? o.label ?? o.title ?? o.email ?? o.uuid;
    return typeof candidate === "string" && candidate ? candidate : fallback;
  }
  return String(value);
}
