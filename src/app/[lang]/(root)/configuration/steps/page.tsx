import type { Metadata } from "next";

import StepsList from "@/features/steps/list";
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
    path: "/configuration/steps",
    title: dict.seo.titles.steps,
  });
}

export default async function ConfigStepsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <StepsList dict={dict} />;
}
