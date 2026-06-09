import { ShieldCheck } from "lucide-react";
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
    path: "/permissions",
    title: dict.seo.titles.permissions,
  });
}

export default async function PermissionsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.permissions.title}</h1>
        <p className="text-sm text-[#585757]">{dict.permissions.subtitle}</p>
      </div>

      <div className="rounded-xl border border-[#E7F0ED] bg-white p-8 flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">{dict.permissions.deferred_title}</h2>
          <p className="text-sm text-[#585757] max-w-prose">{dict.permissions.deferred_body}</p>
        </div>
      </div>
    </section>
  );
}
