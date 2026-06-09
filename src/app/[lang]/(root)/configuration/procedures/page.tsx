import type { Metadata } from "next";

import ProceduresList from "@/features/procedures/list";
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
    path: "/configuration/procedures",
    title: dict.seo.titles.procedures,
  });
}

export default async function ConfigProceduresPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ProceduresList dict={dict} />;
}
