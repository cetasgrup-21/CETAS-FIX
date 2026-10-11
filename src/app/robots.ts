import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/favicon.ico",
          "/cetas-favicon-v2.png",
          "/cetas-favicon-96-v2.png",
          "/cetas-icon-192-v2.png",
          "/cetas-icon-512-v2.png",
          "/cetas-apple-icon-v2.png",
          "/favicon-48x48.png",
          "/favicon-96x96.png",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-touch-icon.png",
          "/logo/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/judge/",
          "/rekap/",
          "/timer/",
          "/login",
        ],
      },
    ],
    sitemap: "https://www.cetas.co.id/sitemap.xml",
    host: "https://www.cetas.co.id",
  };
}
