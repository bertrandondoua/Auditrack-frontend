import VerificationForm from "@/features/auth/verification/form";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

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
