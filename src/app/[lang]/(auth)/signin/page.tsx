import type { Metadata } from "next";

import LoginForm from "@/features/auth/signin/form";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({ lang: params.lang, path: "/signin", title: dict.seo.titles.signin });
}

export default async function LoginPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <LoginForm dict={dict} />;
}
