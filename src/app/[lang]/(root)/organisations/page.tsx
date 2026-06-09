import OrganisationsList from "@/features/organisations/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function OrganisationsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <OrganisationsList dict={dict} />;
}
