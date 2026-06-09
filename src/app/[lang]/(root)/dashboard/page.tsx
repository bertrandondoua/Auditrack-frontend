import type { Metadata } from "next";

import DashboardMain from "@/features/dashboard/main";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({ lang: params.lang, path: "/dashboard", title: dict.seo.titles.dashboard });
}

export default async function DashboardPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <DashboardMain dict={dict} />;
}
