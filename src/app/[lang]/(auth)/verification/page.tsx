import type { Metadata } from "next";

import VerificationForm from "@/features/auth/verification/form";
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
    path: "/verification",
    title: dict.seo.titles.verification,
  });
}

/**
 * OTP verification step. Reached from signin / forgot-password when the
 * backend reports `login_require_otp: true` (see /accounts/auth/config/).
 * Completes the token exchange (or password reset) with the entered code.
 */
export default async function VerificationPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <VerificationForm dict={dict} />;
}
