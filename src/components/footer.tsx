import Link from "next/link";
import Image from "next/image";
import { Sparkles, Mail, MapPin, MessageCircle, ShieldCheck, CheckCircle2, FileText, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-blue-500/20 bg-[#06132E] text-slate-100 select-none">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info with Official Logo */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-11 w-11 shrink-0 rounded-full bg-white p-1.5 shadow-lg shadow-cyan-500/25 border-2 border-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo/cetas_logo_transparent.png"
                  alt="CETAS Official Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-white leading-none">
                    CETAS
                  </span>
                  <span className="rounded bg-gradient-to-r from-[#00D9FF] to-[#126BDE] px-1.5 py-0.2 text-[8px] font-black uppercase text-slate-950 font-mono">
                    OFFICIAL
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mt-0.5 font-display">
                  Make it a story!
                </span>
              </div>
            </Link>
            <p className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Centralized Electronic Tournament & Award System
            </p>
            <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
              Platform ekosistem teknologi resmi untuk mendukung pengelolaan event, registrasi peserta, ticketing QR anti-fraud, bilik e-voting turnamen terverifikasi, dan rekap penilaian juri zero-touch.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#00D9FF] font-bold">
              <ShieldCheck className="h-4 w-4 text-[#00D9FF]" />
              <span>Teknologi Event Andal, Terenkripsi &amp; Terpercaya</span>
            </div>
          </div>

          {/* Kolom 1: Platform */}
          <div>
            <h4 className="text-xs font-black text-[#00D9FF] tracking-wider uppercase mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/events" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  CETAS.TIKET (Tiket &amp; Gate)
                </Link>
              </li>
              <li>
                <Link href="/vote" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  CETAS.ID (E-Voting Live)
                </Link>
              </li>
              <li>
                <Link href="/production" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  CETAS.PRODUCTION (Rental Alat)
                </Link>
              </li>
              <li>
                <Link href="/score" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  CETAS.SCORE (Engine Juri)
                </Link>
              </li>
              <li>
                <Link href="/pelatih" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Portal Pelatih &amp; Kontingen
                </Link>
              </li>
              <li>
                <Link href="/tournament-hub" className="text-cyan-300 hover:underline transition font-bold flex items-center gap-1">
                  <span>🏆 Tournament Hub 3D</span>
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Semua Layanan &amp; Ekosistem
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Tentang Platform CETAS
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Legalitas & Kepatuhan */}
          <div>
            <h4 className="text-xs font-black text-[#00D9FF] tracking-wider uppercase mb-4 font-mono">
              Legal &amp; Kepatuhan
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/legalitas" className="text-white hover:text-[#00D9FF] transition font-semibold flex items-center gap-1">
                  <span>Legalitas Perusahaan</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Privacy Policy (UU PDP)
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-layanan" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  Kebijakan Pembayaran &amp; Refund
                </Link>
              </li>
              <li>
                <Link href="/legalitas#faq" className="text-slate-100 hover:text-[#00D9FF] transition font-medium">
                  FAQ &amp; Bantuan Hukum
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Media Sosial */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#00D9FF] tracking-wider uppercase mb-4 font-mono">
              Kontak &amp; Media Sosial
            </h4>
            <div className="space-y-3 text-xs text-slate-200">
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">Instagram Resmi</span>
                <a
                  href="https://www.instagram.com/cetas__id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-cyan-300 transition flex items-center gap-1.5 mt-0.5"
                >
                  <span>@cetas__id</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">Email Bantuan</span>
                <a
                  href="mailto:support@cetas.co.id"
                  className="font-bold text-white hover:text-cyan-300 transition mt-0.5 block"
                >
                  support@cetas.co.id
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">WhatsApp CS 24/7</span>
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

        {/* Bottom Bar: Copyright & Tagline */}
        <div className="mt-12 pt-6 border-t border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CETAS — Centralized Electronic Tournament &amp; Award System. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-cyan-300 font-display italic">Make it a story!</span>
            <Link href="/legalitas" className="text-slate-200 hover:text-[#00D9FF]">Legalitas</Link>
            <Link href="/kebijakan-privasi" className="text-slate-200 hover:text-[#00D9FF]">Privasi</Link>
            <Link href="/syarat-ketentuan" className="text-slate-200 hover:text-[#00D9FF]">Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
