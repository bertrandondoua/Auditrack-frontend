import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

/**
 * NOTE: Auditrack-api dropped the OTP / verification step from the signin
 * flow. This route is kept so stale bookmarks don't 404; it just nudges
 * users back to the sign-in screen.
 *
 * If OTP returns server-side, restore the prior client component at
 * `features/auth/verification/form.tsx` (still on disk).
 */
export default async function VerificationPage({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <section className="flex items-center justify-center flex-1 w-full text-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">{dict.signin.welcome}</h2>
        <p className="text-sm text-[#585757]">
          {dict.deferred_backend?.otp_disabled ?? "OTP verification is not enabled on this server."}
        </p>
        <Link href={`/${params.lang}/signin`}>
          <Button className="w-full">{dict.signin.login}</Button>
        </Link>
      </div>
    </section>
  );
}
