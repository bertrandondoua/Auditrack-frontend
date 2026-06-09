import type { Metadata } from "next";

import AssignationsList from "@/features/assignations/list";
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
    path: "/configuration/assignations",
    title: dict.seo.titles.assignations,
  });
}

export default async function ConfigAssignationsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <AssignationsList dict={dict} />;
}
