import { History } from "lucide-react";

import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

// NOTE: backend exposes no /core/history/ endpoint, and none of the per-model
// "/history/" actions land either. See BACKEND_MISMATCHES.md §1/§3. Restore
// <LogsList dict={dict} /> once a history feed lands.
export default async function LogsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.logs.list.title}</h1>
      </div>

      <div className="rounded-xl border border-[#E7F0ED] bg-white p-8 flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center">
          <History className="h-5 w-5" />
        </div>
        <p className="text-sm text-[#585757] max-w-prose">{dict.deferred_backend.logs}</p>
      </div>
    </section>
  );
}
