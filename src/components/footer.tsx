import Link from "next/link";
import Image from "next/image";
import { Sparkles, Shield, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-purple-100 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info with Official Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
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
                <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
                  CETAS<span className="text-purple-600">.</span>
                </span>
                <span className="text-[8.5px] font-bold text-purple-700 uppercase tracking-tight mt-0.5">
                  Centralized Electronic Tournament & Award System
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Platform turnamen dan penghargaan elektronik terpusat untuk e-voting turnamen, tiket berkeamanan tinggi, registrasi peserta, dan Cetas Production.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E1251B] font-bold">
              <Sparkles className="h-4 w-4" />
              Didukung Pembayaran Otomatis DOKU Direct API
            </div>
          </div>

          {/* Fitur & Layanan */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              Layanan Cetas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/score" className="text-purple-700 font-bold hover:underline flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cetas.Score (Scoring & Rekap Juri)
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-600 hover:text-purple-700 transition">
                  Cetas Ticketing & Gate Scanner
                </Link>
              </li>
              <li>
                <Link href="/vote" className="text-slate-600 hover:text-purple-700 transition">
                  Cetas Vote (E-Voting Live Turnamen)
                </Link>
              </li>
              <li>
                <Link href="/production" className="text-slate-600 hover:text-purple-700 transition">
                  Cetas Production (Merch & Alat Event)
                </Link>
              </li>
              <li>
                <Link href="/pelatih" className="text-slate-600 hover:text-purple-700 transition">
                  Akses Pelatih & Rekap Nilai Live
                </Link>
              </li>
              <li>
                <Link href="/ajukan-event" className="text-slate-600 hover:text-purple-700 transition">
                  Pengajuan Event & Iklan Cetas Kita
                </Link>
              </li>
            </ul>
          </div>

          {/* Area Kerja & Keamanan */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              Keamanan & Staff
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="text-slate-600 hover:text-purple-700 transition">
                  Portal Lingkup Kerja Admin
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="text-slate-600 hover:text-purple-700 transition">
                  Scanner Pintu Masuk (Validator)
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-600 font-medium pt-1">
                <Shield className="h-3.5 w-3.5" />
                Validasi Enkripsi QR HMAC-SHA256
              </li>
            </ul>
          </div>

          {/* Kontak Perusahaan & WhatsApp Hotline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              Kontak & Bantuan
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Jl. Pesing Got Kedoya, RT.001/007, Kedoya Utara, Kebon Jeruk, Jakarta Barat, DKI Jakarta, Indonesia, 11520</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-600 shrink-0" />
                <a href="tel:081584682345" className="hover:text-purple-700 transition">0815-8468-2345</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <a
                  href="https://wa.me/6281584682345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  WhatsApp Support: 0815-8468-2345
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600 shrink-0" />
                <a href="mailto:cetasgrup@gmail.com" className="hover:text-purple-700 transition">cetasgrup@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-purple-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CETAS (Centralized Electronic Tournament & Award System). Hak cipta dilindungi undang-undang.</p>
          <p className="mt-2 sm:mt-0">Ditenagai oleh DOKU Direct API (QRIS & E-Wallet) & Next.js 15</p>
        </div>
      </div>
    </footer>
  );
}
