import ProcedureStepsList from "@/features/procedure-steps/list";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

export default async function ConfigProcedureStepsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <ProcedureStepsList dict={dict} />;
}
