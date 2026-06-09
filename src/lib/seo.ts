import type { Metadata } from "next";

import { i18n, type Locale } from "@/i18n-config";

/**
 * Central SEO / metadata configuration for Auditrack.
 *
 * Posture: this is a gated, authenticated back-office for the Chambre des
 * Comptes du Cameroun. It is intentionally NOT indexed (see app/robots.ts and
 * the `robots` directive in the root layout). The metadata here exists for
 * browser-tab hygiene, locale signals, PWA installability, and rich link
 * previews when the app URL is shared internally (Slack / Teams / WhatsApp).
 */
export const siteConfig = {
  name: "Auditrack",
  /** Absolute origin, used for metadataBase + canonical/OG URLs. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#126D4E",
  backgroundColor: "#ffffff",
  description: {
    fr: "Plateforme d'audit et de détection de fraude de la Chambre des Comptes du Cameroun.",
    en: "Audit and fraud-detection workflow platform for the Chambre des Comptes du Cameroun.",
  },
  defaultTitle: {
    fr: "Auditrack — Chambre des Comptes du Cameroun",
    en: "Auditrack — Chambre des Comptes du Cameroun",
  },
  /** Builder attribution. */
  company: "AI Technologies for Africa (AITECAF)",
  author: "Kenfack Anafack Alex Bruno",
} as const;

/** Locale-less canonical/alternate links for a given route path. */
export function localeAlternates(path: string): NonNullable<Metadata["alternates"]> {
  const clean = path === "/" ? "" : path;
  return {
    canonical: `/${i18n.defaultLocale}${clean}`,
    languages: {
      en: `/en${clean}`,
      fr: `/fr${clean}`,
      "x-default": `/${i18n.defaultLocale}${clean}`,
    },
  };
}

export interface PageMetadataArgs {
  lang: Locale;
  /** Locale-less route path, e.g. "/dashboard" or "/configuration/programs". */
  path: string;
  /** Page title (the "%s" in the root template "%s | Auditrack"). */
  title: string;
  /** Optional page-specific description; falls back to the site description. */
  description?: string;
}

/**
 * Build per-page metadata: localized title (the root layout appends
 * "| Auditrack"), hreflang alternates + canonical, and an Open Graph entry so
 * shared deep links unfurl with the right title.
 */
export function pageMetadata({ lang, path, title, description }: PageMetadataArgs): Metadata {
  const clean = path === "/" ? "" : path;
  const desc = description ?? siteConfig.description[lang];
  return {
    title,
    description: desc,
    alternates: localeAlternates(path),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: desc,
      url: `/${lang}${clean}`,
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description: desc,
    },
  };
}
