import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    path: "/control/questionnaires",
    title: dict.seo.titles.questionnaires,
  });
}

/**
 * NOTE: the backend exposes no `/core/sent-questionnaire/` endpoint.
 * See BACKEND_MISMATCHES.md §1. Page replaced with a deferred-state card.
 * Restore `<QuestionnairesList dict={dict} />` once the endpoint lands.
 */
export default async function ControlQuestionnairesPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.questionnaires.list.title}</h1>
      </div>

      <div className="rounded-xl border border-[#E7F0ED] bg-white p-8 flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
        <p className="text-sm text-[#585757] max-w-prose">{dict.deferred_backend.questionnaires}</p>
      </div>
    </section>
  );
}
