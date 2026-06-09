import DocumentTypesList from "@/features/document-types/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ConfigDocumentTypesPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <DocumentTypesList dict={dict} />;
}
