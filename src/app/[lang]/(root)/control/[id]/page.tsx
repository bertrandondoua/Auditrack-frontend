import ControlDetail from "@/features/controls/details";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ControlDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <ControlDetail dict={dict} />;
}
