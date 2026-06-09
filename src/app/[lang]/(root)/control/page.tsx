import ControlsList from "@/features/controls/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ControlsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ControlsList dict={dict} />;
}
