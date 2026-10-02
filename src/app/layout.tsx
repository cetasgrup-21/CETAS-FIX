import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MascotWhatsAppWidget } from "@/components/mascot-whatsapp-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CETAS - Centralized Electronic Tournament & Award System",
  description:
    "Platform resmi Centralized Electronic Tournament & Award System (CETAS): e-voting terintegrasi, ticketing berkeamanan tinggi ber-QR HMAC, registrasi peserta, dan layanan Cetas Production.",
};

const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DEV_KEY_PLACEHOLDER";
const snapUrl = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src={snapUrl}
          data-client-key={midtransClientKey}
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FCFBFE] text-slate-900 selection:bg-purple-600 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MascotWhatsAppWidget />
      </body>
    </html>
  );
}
