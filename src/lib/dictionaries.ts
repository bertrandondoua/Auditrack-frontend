import "server-only";

import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
} as const;

/**
 * Narrows `lang` from the JSON-inferred `string` back to `Locale`. The
 * incoming `locale` parameter already has the right literal type, so we
 * pin `lang` to it explicitly. Without this, every consumer needs
 * `dict.lang as Locale`.
 */
export const getDictionary = async (locale: Locale) => {
  const loader = dictionaries[locale] ?? dictionaries.fr;
  const dict = await loader();
  return { ...dict, lang: locale };
};

/** Shared dictionary type — drop-in replacement for the per-file alias every feature was defining. */
export type Dict = Awaited<ReturnType<typeof getDictionary>>;
