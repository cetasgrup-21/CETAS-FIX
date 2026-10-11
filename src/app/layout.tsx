import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MascotWhatsAppWidget } from "@/components/mascot-whatsapp-widget";
import { MobileBottomDock } from "@/components/mobile-bottom-dock";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cetas.co.id"),
  title: {
    default:
      "CETAS — Centralized Electronic Tournament & Award System | Platform Event, Penilaian Juri, E-Voting & Ticketing",
    template: "%s | CETAS (cetas.co.id)",
  },
  description:
    "CETAS (Centralized Electronic Tournament & Award System) adalah ekosistem digital resmi untuk penyelenggaraan event, penilaian lomba & rekap juri real-time (Cetas.Score), e-voting turnamen (Cetas Vote), tiket QR terenkripsi, registrasi peserta, dan sewa peralatan panggung Cetas Production.",
  applicationName: "CETAS",
  authors: [{ name: "CETAS Official", url: "https://www.cetas.co.id" }],
  creator: "CETAS (Centralized Electronic Tournament & Award System)",
  publisher: "CETAS Official",
  keywords: [
    "CETAS",
    "cetas",
    "cetas.co.id",
    "Centralized Electronic Tournament & Award System",
    "Cetas Score",
    "Cetas.Score",
    "Cetas Vote",
    "Cetas Ticketing",
    "Cetas Production",
    "aplikasi penilaian lomba",
    "sistem rekap nilai juri",
    "aplikasi LKBB paskibra",
    "e-voting turnamen live",
    "tiket event QR code",
    "sewa sound system videotron jakarta",
  ],
  alternates: {
    canonical: "https://www.cetas.co.id",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.cetas.co.id",
    siteName: "CETAS",
    title: "CETAS — Centralized Electronic Tournament & Award System",
    description:
      "CETAS menghubungkan penyelenggaraan event, penilaian juri real-time (Cetas.Score), registrasi peserta, ticketing QR, e-voting, hingga kebutuhan Cetas Production dalam satu ekosistem digital terintegrasi.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Logo Resmi CETAS — Centralized Electronic Tournament & Award System",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CETAS — Centralized Electronic Tournament & Award System",
    description:
      "Platform resmi penyelenggaraan event, penilaian juri real-time (Cetas.Score), e-voting, ticketing QR, dan Cetas Production.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.cetas.co.id/#organization",
      name: "CETAS",
      legalName: "CETAS — Centralized Electronic Tournament & Award System",
      alternateName: [
        "CETAS Official",
        "Centralized Electronic Tournament & Award System",
        "Cetas.Score",
        "Cetas Vote",
        "Cetas Production",
        "cetas.co.id",
      ],
      url: "https://www.cetas.co.id",
      logo: {
        "@type": "ImageObject",
        url: "https://www.cetas.co.id/icon-512.png",
        width: 512,
        height: 512,
      },
      image: "https://www.cetas.co.id/icon-512.png",
      email: "cetasgrup@gmail.com",
      telephone: "+62-815-8468-2345",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Jl. Pesing Got Kedoya, RT.001/007, Kedoya Utara, Kebon Jeruk",
        addressLocality: "Jakarta Barat",
        addressRegion: "DKI Jakarta",
        postalCode: "11520",
        addressCountry: "ID",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+62-815-8468-2345",
        contactType: "customer service",
        email: "cetasgrup@gmail.com",
        areaServed: "ID",
        availableLanguage: ["Indonesian"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.cetas.co.id/#website",
      url: "https://www.cetas.co.id",
      name: "CETAS",
      alternateName: "Centralized Electronic Tournament & Award System",
      publisher: {
        "@id": "https://www.cetas.co.id/#organization",
      },
      inLanguage: "id-ID",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFBFE] text-slate-900 selection:bg-purple-600 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MascotWhatsAppWidget />
        <MobileBottomDock />
      </body>
    </html>
  );
}
