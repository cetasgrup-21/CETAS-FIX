import Link from "next/link";
import { Sparkles, Shield, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-blue-900/40 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                C
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                CETAS<span className="text-cyan-400">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ekosistem platform all-in-one untuk pengajuan event, e-voting (Cetas Vote), ticketing berkeamanan tinggi, registrasi peserta, dan vendor Cetas Production.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Sparkles className="h-4 w-4" />
              Didukung Pembayaran Otomatis Midtrans
            </div>
          </div>

          {/* Fitur & Layanan */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Layanan Cetas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition">
                  Cetas Ticketing & Gate Scanner
                </Link>
              </li>
              <li>
                <Link href="/vote" className="hover:text-cyan-400 transition">
                  Cetas Vote (E-Voting Live)
                </Link>
              </li>
              <li>
                <Link href="/production" className="hover:text-cyan-400 transition">
                  Cetas Production (Merch & Alat Event)
                </Link>
              </li>
              <li>
                <Link href="/ajukan-event" className="hover:text-cyan-400 transition">
                  Pengajuan Event & Iklan Cetas Kita
                </Link>
              </li>
            </ul>
          </div>

          {/* Area Kerja & Keamanan */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Keamanan & Staff
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-cyan-400 transition">
                  Portal Lingkup Kerja Admin
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="hover:text-cyan-400 transition">
                  Scanner Pintu Masuk (Validator)
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400 pt-1">
                <Shield className="h-3.5 w-3.5" />
                Validasi Enkripsi QR HMAC-SHA256
              </li>
            </ul>
          </div>

          {/* Kontak Perusahaan & WhatsApp Hotline */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Kontak & Bantuan
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Jl. Cetas Kreatif No. 88, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>+62 (021) 555-CETAS</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/6281299887766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  WhatsApp Support: +62 812-9988-7766
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>support@cetas.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cetas Ecosystem. Hak cipta dilindungi undang-undang.</p>
          <p className="mt-2 sm:mt-0">Ditenagai oleh Midtrans Snap API & Next.js 15</p>
        </div>
      </div>
    </footer>
  );
}
