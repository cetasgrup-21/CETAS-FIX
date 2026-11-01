import Link from "next/link";
import Image from "next/image";
import { Sparkles, Mail, Phone, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
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
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-[#071A3D] leading-none">
                  CETAS<span className="text-[#0066FF]">.</span>
                </span>
                <span className="text-[9px] font-bold text-[#0066FF] uppercase tracking-wider mt-0.5">
                  Move Different
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Not Just an Event. It&apos;s an Experience. Platform ekosistem digital resmi untuk ticketing, e-voting turnamen, rekap juri zero-touch, dan produksi event.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#0066FF] font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Satu Platform, Pengalaman Maksimal</span>
            </div>
          </div>

          {/* 4 Layanan Utama CETAS */}
          <div>
            <h4 className="text-xs font-black text-[#071A3D] tracking-wider uppercase mb-4">
              Layanan CETAS
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/events" className="text-slate-600 hover:text-[#0066FF] transition font-medium">
                  <strong>CETAS.TIKET</strong> — Tiket & Registrasi Event
                </Link>
              </li>
              <li>
                <Link href="/vote" className="text-slate-600 hover:text-[#0066FF] transition font-medium">
                  <strong>CETAS.ID</strong> — E-Voting Turnamen Live
                </Link>
              </li>
              <li>
                <Link href="/production" className="text-slate-600 hover:text-[#0066FF] transition font-medium">
                  <strong>CETAS.PRODUCTION</strong> — Rental Alat & Panggung
                </Link>
              </li>
              <li>
                <Link href="/score" className="text-slate-600 hover:text-[#0066FF] transition font-medium">
                  <strong>CETAS.SCORE</strong> — Rekap Penilaian Juri LKBB
                </Link>
              </li>
              <li>
                <Link href="/tournament-hub" className="text-[#0066FF] hover:underline transition font-bold flex items-center gap-1">
                  <span>🏆 Tournament Hub 3D</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Akses & Tentang */}
          <div>
            <h4 className="text-xs font-black text-[#071A3D] tracking-wider uppercase mb-4">
              Akses & Portal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pelatih" className="text-slate-600 hover:text-[#0066FF] transition">
                  Portal Pelatih & Official
                </Link>
              </li>
              <li>
                <Link href="/judge" className="text-slate-600 hover:text-[#0066FF] transition">
                  Bilik Penilaian Juri
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-600 hover:text-[#0066FF] transition">
                  Admin Backoffice Dashboard
                </Link>
              </li>
              <li>
                <Link href="/ajukan-event" className="text-slate-600 hover:text-[#0066FF] transition">
                  Pengajuan & Kemitraan Event
                </Link>
              </li>
              <li>
                <Link href="/verifikasi" className="text-slate-600 hover:text-[#0066FF] transition">
                  Verifikasi Sertifikat Nasional
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Dukungan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#071A3D] tracking-wider uppercase mb-4">
              Hubungi Kami
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Butuh asistensi sistem scoring, tiket, atau sewa peralatan panggung?
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/6281584682345?text=Halo%20Tim%20CETAS%2C%20saya%20ingin%20berkonsultasi."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:underline font-bold"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: 0815-8468-2345</span>
              </a>
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4 text-[#0066FF]" />
                <span>support@cetas.co.id</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 text-[#0066FF]" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CETAS (Centralized Electronic Tournament & Award System).</span>
            <span className="hidden sm:inline font-bold text-[#0066FF]">Move Different.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/events" className="hover:text-[#0066FF]">Ketentuan Layanan</Link>
            <Link href="/events" className="hover:text-[#0066FF]">Kebijakan Privasi</Link>
            <Link href="/events" className="hover:text-[#0066FF]">Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
