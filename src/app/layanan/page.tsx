import React from "react";
import Link from "next/link";
import {
  Ticket,
  Award,
  Vote,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "Layanan & Ekosistem Platform — CETAS",
  description:
    "Empat pilar layanan resmi CETAS: CETAS.TIKET, CETAS.ID E-Voting, CETAS.PRODUCTION, dan CETAS.SCORE Engine Rekapitulasi Juri.",
};

export default function LayananPage() {
  const services = [
    {
      id: "tiket",
      title: "CETAS.TIKET",
      subtitle: "Reservasi tiket elektronik, registrasi kontingen & gate scanner mobile.",
      description:
        "Sistem ticketing anti-duplikasi dengan dynamic HMAC QR Code. Validasi instan di pintu gerbang turnamen via mobile scanner resmi serta integrasi pembayaran QRIS & Virtual Account real-time.",
      icon: Ticket,
      features: [
        "Dynamic HMAC QR Code anti-screenshot & anti-duplikasi",
        "Mobile Gatekeeper Scanner dengan verifikasi < 1 detik",
        "Manajemen kuota kontingen & registrasi peserta online",
        "Laporan check-in pengunjung dan okupansi venue live",
      ],
      href: "/events",
      cta: "Jelajahi Event & Tiket",
      badge: "Tiket & Registrasi",
      accentBg: "bg-blue-500/10 text-cyan-300 border-cyan-500/30",
    },
    {
      id: "id",
      title: "CETAS.ID",
      subtitle: "Bilik e-voting publik turnamen & dukungan kontingen transparan.",
      description:
        "Bilik suara digital transparan untuk kontes dan turnamen nasional. Mendukung Free Vote harian dan Paid Vote QRIS dengan leaderboard live tanpa risiko manipulasi suara.",
      icon: Award,
      features: [
        "Audit trail suara terenkripsi anti-bot & anti-spam",
        "Dukungan QRIS Real-time Settlement instan",
        "Live vote rank shifting realtime leaderboard",
        "Integrasi panggung penghargaan & piagam juara favorit",
      ],
      href: "/vote",
      cta: "Buka Bilik E-Voting",
      badge: "E-Voting Live",
      accentBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    {
      id: "production",
      title: "CETAS.PRODUCTION",
      subtitle: "Penyedia panggung rigging, sound system konser & multimedia videotron.",
      description:
        "Penyedia kebutuhan teknis event satu atap: rental sound system line-array konser, lighting panggung, videotron LED screen indoor/outdoor, panggung rigging kokoh, hingga official merchandise turnamen.",
      icon: ShoppingBag,
      features: [
        "Sound system line-array standar konser & festival",
        "Videotron LED Screen P3.9 / P2.5 indoor & outdoor",
        "Lighting beam, par LED, laser & smoke effect panggung",
        "Panggung rigging kokoh standar keselamatan MICE",
      ],
      href: "/production",
      cta: "Katalog Sewa Alat",
      badge: "Alat & Panggung",
      accentBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    },
    {
      id: "score",
      title: "CETAS.SCORE",
      subtitle: "Engine rekapitulasi penilaian dewan juri zero-touch 0 detik.",
      description:
        "Mesin rekapitulasi penilaian juri zero-touch untuk LKBB dan turnamen olahraga/seni nasional. Perhitungan bobot akurat 0 detik, berita acara digital sah F4, dan tampilan 3D Tournament Hub panggung utama.",
      icon: ShieldCheck,
      features: [
        "Kalkulasi juknis otomatis bebas human-error matematika",
        "Kunci nilai digital & tanda tangan dewan hakim sah",
        "Cetak Berita Acara resmi format standar Folio / F4",
        "Sinkronisasi panggung arena live tracker & podium 3D",
      ],
      href: "/score",
      cta: "Buka Cetas.Score Engine",
      badge: "Rekap Juri 0 Detik",
      accentBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E]">
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-24 border-b border-blue-500/20 bg-gradient-to-b from-[#0A1E44] to-[#06132E]">
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 px-4 py-1.5 text-xs font-bold text-[#00D9FF] font-mono shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" />
            <span>Ekosistem Platform Terintegrasi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display">
            Layanan &amp; Solusi CETAS
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Empat pilar teknologi yang dirancang modular untuk mendukung keberhasilan acara, perlindungan hak peserta kontingen, dan transparansi mutlak bagi panitia.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="rounded-3xl border border-blue-500/30 bg-[#0B1C3D] p-7 sm:p-8 flex flex-col justify-between shadow-xl hover:border-cyan-400/60 transition-all duration-300 group"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${svc.accentBg}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                        {svc.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        {svc.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-cyan-200 mt-1">
                        {svc.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {svc.description}
                    </p>

                    {/* Features List */}
                    <div className="pt-2 border-t border-blue-500/20 space-y-2">
                      {svc.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-blue-500/20">
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black px-5 py-3 text-xs tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{svc.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Consultation Card */}
          <div className="rounded-3xl border border-blue-400/40 bg-gradient-to-r from-blue-700 to-indigo-900 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 font-mono">
                Konsultasi Kebutuhan Event Anda
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                Butuh Kombinasi Paket Layanan Khusus?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Tim teknis CETAS siap membantu merancang sistem penjurian, ticketing online, dan penyediaan perlengkapan panggung turnamen Anda dari awal hingga akhir.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/ajukan-event"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-[#06132E] font-black px-6 py-3.5 text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <span>Daftarkan Event</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20tertarik%20konsultasi%20paket%20layanan%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 text-xs transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat WhatsApp 24/7</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
