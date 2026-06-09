import type { Metadata } from "next";

import DocumentTypesList from "@/features/document-types/list";
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
    path: "/configuration/document-types",
    title: dict.seo.titles.document_types,
  });
}

export default async function ConfigDocumentTypesPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <DocumentTypesList dict={dict} />;
}
