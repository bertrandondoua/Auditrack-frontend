import type { Metadata } from "next";

import UsersList from "@/features/users/list";
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
    path: "/permissions",
    title: dict.seo.titles.permissions,
  });
}

/**
 * User management (create / update / delete). Gated to `it_manager` via
 * DashboardRoutes in src/configs/constants.ts. The backend exposes full CRUD
 * at /accounts/users/ (there is no separate /accounts/permissions/ RBAC matrix
 * endpoint — see BACKEND_MISMATCHES.md §7).
 */
export default async function PermissionsPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return <UsersList dict={dict} />;
}
