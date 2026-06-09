import SectionDetail from "@/features/sections/details";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ConfigSectionDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <SectionDetail dict={dict} />;
}
