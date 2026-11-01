import Link from "next/link";
import Image from "next/image";
import { Sparkles, Mail, Phone, MapPin, MessageCircle, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-blue-500/20 bg-[#06132E] text-slate-100 select-none">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info with Official Logo */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src="/logo/cetas_logo_transparent.png"
                  alt="CETAS Official Logo"
                  width={40}
                  height={40}
                  className="object-contain drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-white leading-none">
                    CETAS
                  </span>
                  <span className="rounded bg-gradient-to-r from-[#00D9FF] to-[#006BFF] px-1.5 py-0.2 text-[8px] font-black uppercase text-slate-950 font-mono">
                    HUB
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-[#00D9FF] uppercase tracking-wider mt-0.5">
                  Move Different
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              Not Just an Event. It&apos;s an Experience. Platform ekosistem digital resmi untuk ticketing, e-voting turnamen, rekap juri zero-touch, dan produksi event.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#00D9FF] font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Satu Platform, Pengalaman Maksimal</span>
            </div>
          </div>

          {/* 4 Layanan Utama CETAS */}
          <div>
            <h4 className="text-xs font-black text-[#00D9FF] tracking-wider uppercase mb-4 font-mono">
              Layanan CETAS
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/events" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  <strong className="text-[#00D9FF]">CETAS.TIKET</strong> — Tiket & Registrasi Event
                </Link>
              </li>
              <li>
                <Link href="/vote" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  <strong className="text-amber-400">CETAS.ID</strong> — E-Voting Turnamen Live
                </Link>
              </li>
              <li>
                <Link href="/production" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  <strong className="text-indigo-400">CETAS.PRODUCTION</strong> — Rental Alat & Panggung
                </Link>
              </li>
              <li>
                <Link href="/score" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  <strong className="text-emerald-400">CETAS.SCORE</strong> — Rekap Penilaian Juri LKBB
                </Link>
              </li>
              <li>
                <Link href="/tournament-hub" className="text-[#00D9FF] hover:underline transition font-black flex items-center gap-1">
                  <span>🏆 Tournament Hub 3D Live</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================================= */}
          {/* LEGAL & BANTUAN SECTION (PERSIS KAYA GAMBAR 1 DARI USER)   */}
          {/* ========================================================= */}
          <div>
            <h4 className="text-xs font-black text-[#00D9FF] tracking-wider uppercase mb-4 font-mono">
              LEGAL & BANTUAN
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  FAQ (Tanya Jawab)
                </Link>
              </li>
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  Paket & Harga
                </Link>
              </li>
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  Testimoni Pelatih & Juri
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20butuh%20bantuan."
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-[#00D9FF] transition font-semibold"
                >
                  Hubungi Kontak
                </a>
              </li>
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/#bantuan" className="text-white hover:text-[#00D9FF] transition font-semibold">
                  Kebijakan Privasi
                </Link>
              </li>
              {/* All Systems Operational Indicator */}
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400 px-3 py-1 text-xs font-black text-emerald-300 shadow-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>All Systems Operational</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Kontak & Dukungan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white tracking-wider uppercase mb-4 font-mono">
              Hubungi Kami
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              Butuh asistensi sistem scoring, tiket, atau sewa peralatan panggung?
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/6281584682345?text=Halo%20Tim%20CETAS%2C%20saya%20ingin%20berkonsultasi."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:underline font-bold"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: 0815-8468-2345</span>
              </a>
              <div className="flex items-center gap-2 text-white font-medium">
                <Mail className="h-4 w-4 text-[#00D9FF]" />
                <span>support@cetas.co.id</span>
              </div>
              <div className="flex items-center gap-2 text-white font-medium">
                <MapPin className="h-4 w-4 text-[#00D9FF]" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-6 border-t border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CETAS (Centralized Electronic Tournament & Award System).</span>
            <span className="hidden sm:inline font-bold text-[#00D9FF]">Move Different.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/#bantuan" className="text-slate-200 hover:text-[#00D9FF]">Ketentuan Layanan</Link>
            <Link href="/#bantuan" className="text-slate-200 hover:text-[#00D9FF]">Kebijakan Privasi</Link>
            <Link href="/#bantuan" className="text-slate-200 hover:text-[#00D9FF]">Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
