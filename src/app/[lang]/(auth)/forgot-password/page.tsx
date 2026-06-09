import ForgotPasswordForm from "@/features/auth/forgot-password/form";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ForgotPasswordPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ForgotPasswordForm dict={dict} />;
}
