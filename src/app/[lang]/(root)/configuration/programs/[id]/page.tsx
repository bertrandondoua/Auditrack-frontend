import type { Metadata } from "next";

import ProgramDetail from "@/features/programs/details";
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
    path: `/configuration/programs/${params.id}`,
    title: dict.seo.titles.program_detail,
  });
}

export default async function ConfigProgramDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <ProgramDetail dict={dict} />;
}
