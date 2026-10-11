import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CETAS — Centralized Electronic Tournament & Award System",
    short_name: "CETAS",
    description:
      "Platform resmi penyelenggaraan event, penilaian juri real-time (Cetas.Score), e-voting, ticketing QR, dan Cetas Production.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFBFE",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/cetas-favicon-v2.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/cetas-favicon-96-v2.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/cetas-icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/cetas-icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
