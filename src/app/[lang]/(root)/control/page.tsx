import type { Metadata } from "next";

import ControlsList from "@/features/controls/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({ lang: params.lang, path: "/control", title: dict.seo.titles.control });
}

export default async function ControlsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ControlsList dict={dict} />;
}
