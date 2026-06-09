import Layout from "@/components/shared/Layout/layout";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function RootGroupLayout({
  children,
  breadcrumbs,
  params,
}: Readonly<{
  children: React.ReactNode;
  breadcrumbs: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return (
    <Layout dict={dict}>
      {breadcrumbs}
      {children}
    </Layout>
  );
}
