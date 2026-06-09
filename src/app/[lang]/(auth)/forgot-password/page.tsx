import type { Metadata } from "next";

import ForgotPasswordForm from "@/features/auth/forgot-password/form";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    path: "/forgot-password",
    title: dict.seo.titles.forgot_password,
  });
}

export default async function ForgotPasswordPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ForgotPasswordForm dict={dict} />;
}
