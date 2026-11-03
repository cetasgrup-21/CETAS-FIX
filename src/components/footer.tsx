import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-[#06132E] text-slate-200 select-none">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-32 sm:pb-12 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* TAMPILAN MOBILE: Tetap Vertikal ke Bawah (Sesuai Gambar 1)*/}
        {/* ========================================================= */}
        <div className="block md:hidden space-y-8">
          {/* Header Brand Ringkas */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative h-8 w-8 shrink-0 rounded-full bg-white p-1 shadow-md shadow-cyan-500/20 border border-white/90 flex items-center justify-center">
                <Image
                  src="/logo/cetas_logo_transparent.png"
                  alt="CETAS Official Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-black text-lg tracking-tight text-white font-mono">
                CETAS
              </span>
              <span className="rounded bg-gradient-to-r from-[#00D9FF] to-[#126BDE] px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-950 font-mono">
                OFFICIAL
              </span>
            </Link>
            <p className="text-[11px] text-cyan-300 font-display italic">
              Make it a story!
            </p>
          </div>

          {/* Section 1: PLATFORM (Vertikal) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#00D9FF] tracking-wider uppercase font-mono">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/events"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  CETAS.TIKET (Tiket &amp; Gate)
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  CETAS.ID (E-Voting Live)
                </Link>
              </li>
              <li>
                <Link
                  href="/production"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  CETAS.PRODUCTION (Rental Alat)
                </Link>
              </li>
              <li>
                <Link
                  href="/pelatih"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Portal Pelatih &amp; Kontingen
                </Link>
              </li>
              <li>
                <Link
                  href="/tournament-hub"
                  className="text-cyan-300 font-bold hover:underline transition flex items-center gap-1 py-0.5"
                >
                  <span>🏆 Tournament Hub 3D</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Semua Layanan &amp; Ekosistem
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Tentang Platform CETAS
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 2: LEGAL & KEPATUHAN (Vertikal) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#00D9FF] tracking-wider uppercase font-mono">
              LEGAL &amp; KEPATUHAN
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/legalitas"
                  className="text-slate-200 hover:text-cyan-300 transition flex items-center gap-1.5 py-0.5"
                >
                  <span>Legalitas Perusahaan</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Privacy Policy (UU PDP)
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-layanan"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  Kebijakan Pembayaran &amp; Refund
                </Link>
              </li>
              <li>
                <Link
                  href="/legalitas#faq"
                  className="text-slate-200 hover:text-cyan-300 transition block py-0.5"
                >
                  FAQ &amp; Bantuan Hukum
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: KONTAK & MEDIA SOSIAL (Vertikal) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#00D9FF] tracking-wider uppercase font-mono">
              KONTAK &amp; MEDIA SOSIAL
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">
                  INSTAGRAM RESMI
                </span>
                <a
                  href="https://www.instagram.com/cetas__id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-cyan-300 transition inline-flex items-center gap-1 mt-0.5"
                >
                  <span>@cetas__id</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">
                  EMAIL BANTUAN
                </span>
                <a
                  href="mailto:support@cetas.co.id"
                  className="font-bold text-white hover:text-cyan-300 transition mt-0.5 block"
                >
                  support@cetas.co.id
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">
                  WHATSAPP CS 24/7
                </span>
                <a
                  href="https://wa.me/6281584682345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:text-emerald-300 transition mt-0.5 block"
                >
                  +62 815-8468-2345
                </a>
              </div>
              <div className="pt-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAMPILAN DESKTOP: 3 Kolom Rapi Horisontal (Sesuai Gambar 2) */}
        {/* ========================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Kolom 1: Profil, Kontak & Media Sosial */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative h-9 w-9 shrink-0 rounded-full bg-white p-1 shadow-md shadow-cyan-500/20 border border-white/90 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo/cetas_logo_transparent.png"
                  alt="CETAS Official Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-black text-xl tracking-tight text-white font-mono">
                CETAS
              </span>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Platform evaluasi digital premium yang dirancang untuk menjaga
              integritas, transparansi, serta kecepatan rekapitulasi nilai event
              nasional.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Alamat:</strong> Jl. Pesing Got Kedoya No. 88, Kebon Jeruk, Jakarta Barat, 11520
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:support@cetas.co.id"
                    className="hover:text-cyan-300 transition"
                  >
                    support@cetas.co.id
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">Kontak:</strong>{" "}
                  <a
                    href="https://wa.me/6281584682345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-300 transition"
                  >
                    0815-8468-2345
                  </a>
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://www.instagram.com/cetas__id/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Resmi CETAS"
                className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/70 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-300 flex items-center justify-center transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://youtube.com/@cetas_id"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Resmi CETAS"
                className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/70 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-300 flex items-center justify-center transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://wa.me/6281584682345"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp CS CETAS"
                className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/70 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-300 flex items-center justify-center transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Kolom 2: Platform / Navigasi Layanan */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 font-mono">
              PLATFORM
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/events"
                  className="text-cyan-400 font-semibold hover:underline transition"
                >
                  CETAS.TIKET (Tiket &amp; Gate)
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  CETAS.ID (E-Voting Live)
                </Link>
              </li>
              <li>
                <Link
                  href="/production"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  CETAS.PRODUCTION (Rental Alat)
                </Link>
              </li>
              <li>
                <Link
                  href="/pelatih"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Portal Pelatih &amp; Kontingen
                </Link>
              </li>
              <li>
                <Link
                  href="/tournament-hub"
                  className="text-amber-300 font-bold hover:underline transition"
                >
                  🏆 Tournament Hub 3D
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Semua Layanan &amp; Ekosistem
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Legalitas & Kepatuhan */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 font-mono">
              LEGAL &amp; KEPATUHAN
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/legalitas"
                  className="text-slate-300 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  <span>Legalitas Perusahaan</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Privacy Policy (UU PDP)
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-layanan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Kebijakan Pembayaran &amp; Refund
                </Link>
              </li>
              <li>
                <Link
                  href="/legalitas#faq"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  FAQ &amp; Bantuan Hukum
                </Link>
              </li>
            </ul>

            {/* Status Operasional */}
            <div className="pt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Bottom Bar: Paling Bawah                                   */}
        {/* ========================================================= */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div>
            &copy; {currentYear} CETAS DIGITAL SYSTEM. All Rights Reserved.
          </div>
          <div className="tracking-wider uppercase text-slate-400">
            SELF-HEALING SECURE CONNECTION
          </div>
        </div>
      </div>
    </footer>
  );
}
