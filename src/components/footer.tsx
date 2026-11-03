import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-[#06132E] text-slate-200 select-none">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
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

          {/* Kolom 2: Navigasi Layanan */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 font-mono">
              NAVIGASI LAYANAN
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Utama (Home)
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-cyan-400 font-semibold hover:underline transition"
                >
                  Event Publik
                </Link>
              </li>
              <li>
                <Link
                  href="/production"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  CetasStore Rental &amp; Merch
                </Link>
              </li>
              <li>
                <Link
                  href="/pelatih"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Portal Pelatih
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  E-Ticket
                </Link>
              </li>
              <li>
                <Link
                  href="/vote"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  E-Voting
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281584682345?text=Halo%20CETAS%2C%20saya%20ingin%20mengirim%20ulasan%20dan%20rating."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Kirim Ulasan &amp; Rating
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Legal & Bantuan */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 font-mono">
              LEGAL &amp; BANTUAN
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/legalitas#faq"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  FAQ (Tanya Jawab)
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Paket &amp; Harga
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Testimoni Pelatih &amp; Juri
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281584682345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Hubungi Kontak
                </a>
              </li>
              <li>
                <Link
                  href="/kebijakan-layanan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="text-slate-300 hover:text-cyan-300 transition"
                >
                  Kebijakan Privasi
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

        {/* Bottom Bar: Paling Bawah */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div>
            &copy; {currentYear} CETAS DIGITAL SYSTEM.
          </div>
          <div className="tracking-wider uppercase text-slate-400">
            SELF-HEALING SECURE CONNECTION
          </div>
        </div>
      </div>
    </footer>
  );
}
