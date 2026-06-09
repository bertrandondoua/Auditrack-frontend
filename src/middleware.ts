import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { i18n, type Locale } from "./i18n-config";

const locales: readonly Locale[] = i18n.locales;
const PUBLIC_FILE = /\.(.*)$/;

function getLocale(request: NextRequest): string {
  const acceptedLanguage = request.headers.get("accept-language");
  // Negotiator + intl-localematcher both throw "Incorrect locale information"
  // on requests without a parseable Accept-Language header (curl, health
  // probes, etc.). Bail to the default locale early instead of try/catching.
  if (!acceptedLanguage) return i18n.defaultLocale;
  try {
    const languages = new Negotiator({
      headers: { "accept-language": acceptedLanguage },
    }).languages();
    return match(languages, [...locales], i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public files (anything with a file extension)
  if (
    PUBLIC_FILE.test(pathname) ||
    ["/manifest.json", "/favicon.ico", "/logo.svg", "/sm-logo.svg"].includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Identify locale segment (if any) and strip it for auth checks
  const localeMatch = locales.find((locale) => pathname.startsWith(`/${locale}/`));
  const cleanPathname = localeMatch ? pathname.replace(`/${localeMatch}`, "") : pathname;
  const authToken = request.cookies.get("token")?.value;

  const isAuthPage = ["/signin", "/forgot-password", "/verification"].some((path) =>
    cleanPathname.startsWith(path),
  );

  // Authenticated user hitting an auth page → bounce to home
  if (authToken && isAuthPage) {
    const locale = localeMatch ?? getLocale(request);
    const homePath = `/${locale}/`;
    if (pathname !== homePath) {
      request.nextUrl.pathname = homePath;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // Unauthenticated user hitting a protected page → bounce to signin
  if (!authToken && !isAuthPage) {
    const locale = localeMatch ?? getLocale(request);
    const signinPath = `/${locale}/signin`;
    if (pathname !== signinPath) {
      request.nextUrl.pathname = signinPath;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // Ensure URL carries a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/public|_next/image|assets|favicon.ico|sw.js).*)"],
};
