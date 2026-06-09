import ProgramDetail from "@/features/programs/details";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ConfigProgramDetailPage({
  params,
}: Readonly<{
  params: { lang: Locale; id: string };
}>) {
  const dict = await getDictionary(params.lang);
  return <ProgramDetail dict={dict} />;
}
