import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import StoreProvider from "@/providers/ReduxProvider";
import { Toaster } from "@/components/ui/toaster";
import { i18n, type Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Auditrack",
  description: "Audit & fraud-detection workflow — Chambre des Comptes du Cameroun",
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
