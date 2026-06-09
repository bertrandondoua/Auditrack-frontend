import type { Metadata } from "next";

import TeamsList from "@/features/teams/list";
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
    path: "/configuration/teams",
    title: dict.seo.titles.teams,
  });
}

export default async function ConfigTeamsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <TeamsList dict={dict} />;
}
