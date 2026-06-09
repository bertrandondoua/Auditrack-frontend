import OrganisationDetail from "@/features/organisations/details";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function OrganisationDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <OrganisationDetail dict={dict} />;
}
