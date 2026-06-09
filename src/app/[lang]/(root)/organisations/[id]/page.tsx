import type { Metadata } from "next";

import OrganisationDetail from "@/features/organisations/details";
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
    path: `/organisations/${params.id}`,
    title: dict.seo.titles.organisation_detail,
  });
}

export default async function OrganisationDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <OrganisationDetail dict={dict} />;
}
