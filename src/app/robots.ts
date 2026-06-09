import type { MetadataRoute } from "next";

/**
 * Auditrack is a gated, authenticated back-office for the Chambre des Comptes
 * du Cameroun. It must never be indexed — disallow all crawlers. (There is
 * deliberately no sitemap.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
