import type { Metadata } from "next";

import SectionDetail from "@/features/sections/details";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; id: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    path: `/configuration/sections/${params.id}`,
    title: dict.seo.titles.section_detail,
  });
}

export default async function ConfigSectionDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <SectionDetail dict={dict} />;
}
