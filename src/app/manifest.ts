import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo";

/**
 * Web app manifest (served at /manifest.webmanifest) for PWA installability.
 *
 * Icons are SVG for crispness; add raster PNGs (192×192, 512×512, and a
 * 180×180 apple-touch-icon) for full Android/iOS install fidelity.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.defaultTitle.fr,
    short_name: siteConfig.name,
    description: siteConfig.description.fr,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
