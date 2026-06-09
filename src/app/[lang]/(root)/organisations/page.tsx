import type { Metadata } from "next";

import OrganisationsList from "@/features/organisations/list";
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
    path: "/organisations",
    title: dict.seo.titles.organisations,
  });
}

export default async function OrganisationsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <OrganisationsList dict={dict} />;
}
