import LoginForm from "@/features/auth/signin/form";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function LoginPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <LoginForm dict={dict} />;
}
