import type { Metadata } from "next";

import UsersList from "@/features/users/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({ lang: params.lang, path: "/account", title: dict.seo.titles.account });
}

export default async function AccountsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <UsersList dict={dict} />;
}
