import type { Metadata } from "next";

import ProcedureStepsList from "@/features/procedure-steps/list";
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
    path: "/configuration/procedure-steps",
    title: dict.seo.titles.procedure_steps,
  });
}

export default async function ConfigProcedureStepsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ProcedureStepsList dict={dict} />;
}
