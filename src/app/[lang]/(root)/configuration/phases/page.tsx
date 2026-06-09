import { Layers } from "lucide-react";

import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

/**
 * NOTE: the backend (Auditrack-api) does not yet expose `/core/phases/`.
 * See BACKEND_MISMATCHES.md §1. This page shows a deferred-state card
 * instead of the broken list. Restore `<PhasesList dict={dict} />` once
 * the endpoint lands.
 */
export default async function ConfigPhasesPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.phases.list.title}</h1>
        <p className="text-sm text-[#585757]">{dict.configuration.landing.phases.description}</p>
      </div>

      <div className="rounded-xl border border-[#E7F0ED] bg-white p-8 flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center">
          <Layers className="h-5 w-5" />
        </div>
        <p className="text-sm text-[#585757] max-w-prose">{dict.deferred_backend.phases}</p>
      </div>
    </section>
  );
}
