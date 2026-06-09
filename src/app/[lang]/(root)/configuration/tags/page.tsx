import TagsList from "@/features/tags/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ConfigTagsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <TagsList dict={dict} />;
}
