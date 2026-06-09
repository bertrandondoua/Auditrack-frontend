import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import StoreProvider from "@/providers/ReduxProvider";
import { Toaster } from "@/components/ui/toaster";
import { i18n, type Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { localeAlternates, siteConfig } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const lang = params.lang ?? i18n.defaultLocale;
  const description = siteConfig.description[lang] ?? siteConfig.description.fr;
  const defaultTitle = siteConfig.defaultTitle[lang] ?? siteConfig.defaultTitle.fr;

  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
      default: defaultTitle,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    // Builder attribution.
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.company,
    publisher: siteConfig.company,
    generator: "Next.js",
    other: {
      developer: siteConfig.company,
      "developer-lead": siteConfig.author,
    },
    // Gated back-office: keep it out of search engines entirely.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    alternates: localeAlternates("/"),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: lang === "fr" ? "fr_FR" : "en_US",
      url: `/${lang}`,
      title: defaultTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: defaultTitle,
      description,
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
    },
  };
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
};

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);
  return (
    <StoreProvider>
      <html
        lang={params.lang ?? i18n.defaultLocale}
        className={`${inter.variable} antialiased h-screen overflow-hidden`}
      >
        <body>
          {children}
          <Toaster closeLabel={dict.common.close} />
        </body>
      </html>
    </StoreProvider>
  );
}
