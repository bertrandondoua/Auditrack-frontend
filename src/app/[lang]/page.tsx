import { redirect } from "next/navigation";
import type { Locale } from "@/i18n-config";

export default function Home({ params }: { params: { lang: Locale } }) {
  redirect(`/${params.lang}/dashboard`);
}
