import Link from "next/link";
import {
  Ticket,
  Award,
  ShoppingBag,
  Send,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const ecosystemPillars = [
    {
      title: "Cetas Ticketing",
      badge: "Keamanan Tinggi",
      description:
        "Penjualan tiket resmi online dengan kode QR dinamis berenkripsi HMAC SHA-256. Didukung gate scanner mobile dan pembayaran instan via Midtrans (QRIS & Virtual Account).",
      icon: Ticket,
      href: "/events",
      accent: "from-blue-500 to-indigo-600",
      cta: "Beli Tiket",
    },
    {
      title: "Cetas Vote",
      badge: "Real-time Live",
      description:
        "Platform e-voting transparan untuk kontes duta, awards, dan lomba. Mendukung Free Voting harian maupun Paid Voting dengan leaderboard terverifikasi otomatis.",
      icon: Award,
      href: "/vote",
      accent: "from-amber-500 to-orange-600",
      cta: "Mulai Vote",
    },
    {
      title: "Pendaftaran Peserta",
      badge: "Custom Form",
      description:
        "Registrasi peserta seminar, workshop, dan kompetisi dengan formulir dinamis, upload berkas, auto-issued E-Badge, dan absensi kehadiran otomatis.",
      icon: CheckCircle2,
      href: "/register-event",
      accent: "from-emerald-500 to-teal-600",
      cta: "Daftar Event",
    },
    {
      title: "Cetas Production",
      badge: "Jasa & Merchandise",
      description:
        "Lini produksi event terpadu: cetak merchandise resmi (kaos, lanyard, ID card) serta rental lighting, sound system panggung, videotron LED, & live streaming.",
      icon: ShoppingBag,
      href: "/production",
      accent: "from-purple-500 to-pink-600",
      cta: "Katalog Production",
    },
    {
      title: "Pengajuan Event & Iklan",
      badge: "Untuk Event Organizer",
      description:
        "Ajukan proposal acara Anda ke tim kurasi Cetas untuk mendapatkan sponsor, integrasi ticketing & voting, serta promosi melalui slot 'Iklan Cetas Kita'.",
      icon: Send,
      href: "/ajukan-event",
      accent: "from-rose-500 to-red-600",
      cta: "Ajukan Proposal",
    },
    {
      title: "Lingkup Kerja Cetas",
      badge: "Backoffice Admin",
      description:
        "Pusat kendali manajemen perusahaan Cetas untuk review proposal event, pemantauan omzet transaksi Midtrans, penugasan validator gate, dan log audit.",
      icon: ShieldCheck,
      href: "/admin",
      accent: "from-slate-700 to-slate-900",
      cta: "Portal Admin",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-16 pb-20 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/60 px-4 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400 mb-6 border border-orange-200 dark:border-orange-800/60">
            <Sparkles className="h-3.5 w-3.5" />
            Ekosistem Lengkap Penyelenggaraan Event & Hiburan Cetas
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Satu Platform untuk Semua Kebutuhan{" "}
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Event & Produksi Anda
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mulai dari pengajuan event, tiket aman QR code, sistem E-Voting Cetas Vote, pendaftaran peserta, hingga vendor Cetas Production yang terintegrasi dengan Midtrans Payment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 text-sm shadow-lg shadow-orange-500/25 transition transform active:scale-95"
            >
              <Ticket className="h-4 w-4" />
              Cari & Beli Tiket
            </Link>
            <Link
              href="/vote"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold px-6 py-3.5 text-sm shadow-md transition"
            >
              <Award className="h-4 w-4 text-orange-400" />
              Cetas Vote Live
            </Link>
            <Link
              href="/ajukan-event"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-5 py-3.5 text-sm transition"
            >
              <Send className="h-4 w-4 text-orange-500" />
              Ajukan Event ke Admin
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl font-black text-orange-500">100%</div>
              <div className="text-xs text-slate-500">Anti-Duplikasi Tiket</div>
            </div>
            <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl font-black text-slate-900 dark:text-white">Realtime</div>
              <div className="text-xs text-slate-500">Cetas Vote Tallying</div>
            </div>
            <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl font-black text-slate-900 dark:text-white">QRIS & VA</div>
              <div className="text-xs text-slate-500">Midtrans Verified</div>
            </div>
            <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl font-black text-slate-900 dark:text-white">All-in-One</div>
              <div className="text-xs text-slate-500">Cetas Production Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IKLAN CETAS KITA (SLOT PROMOSI UTAMA) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-rose-600 to-purple-700 p-8 sm:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide uppercase">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Iklan Cetas Kita • Promo Spesial
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Paket Komplit Sound System & Panggung Cetas Production
              </h2>
              <p className="text-sm text-white/90 max-w-xl">
                Dapatkan potongan harga hingga 25% untuk sewa lighting, audio line-array, dan LED Videotron untuk festival musik & pameran kampus Anda.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/production"
                className="rounded-xl bg-white text-orange-600 hover:bg-slate-100 font-bold px-6 py-3 text-sm shadow-md transition"
              >
                Lihat Paket Promo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 PILAR UTAMA EKOSISTEM CETAS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            6 Pilar Layanan Ekosistem Cetas
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Semua modul dirancang terhubung untuk efisiensi penyelenggara dan kenyamanan pengunjung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${pillar.accent} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:gap-2.5 transition-all pt-4 border-t border-slate-100 dark:border-slate-800"
                >
                  {pillar.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CETAS VOTE SHOWCASE & LEADERBOARD TEASER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 text-orange-400 px-3 py-1 text-xs font-semibold border border-orange-500/30">
                <TrendingUp className="h-3.5 w-3.5" />
                Cetas Vote • Live Event Pemilihan
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Pemilihan Duta Kampus & Brand Ambassador Favorit 2026
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Suarakan pilihanmu dengan aman! Setiap suara diverifikasi langsung oleh payment gateway Midtrans dan langsung update ke leaderboard tanpa manipulasi.
              </p>
              <div className="pt-2 flex gap-3">
                <Link
                  href="/vote"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 text-xs transition shadow-lg shadow-orange-500/30"
                >
                  Buka Voting Sekarang
                </Link>
              </div>
            </div>

            {/* Candidate Mock Standings */}
            <div className="space-y-3 bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Top 3 Perolehan Suara Terkini
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 font-extrabold flex items-center justify-center text-xs">
                    01
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Nadia Safira</div>
                    <div className="text-[11px] text-slate-400">Teknik Informatika</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-orange-400">1.482 Suara</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">44.8%</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 font-extrabold flex items-center justify-center text-xs">
                    02
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Reza Pratama</div>
                    <div className="text-[11px] text-slate-400">Ilmu Komunikasi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-200">1.120 Suara</div>
                  <div className="text-[10px] text-slate-400 font-semibold">33.9%</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 font-extrabold flex items-center justify-center text-xs">
                    03
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Citra Lestari</div>
                    <div className="text-[11px] text-slate-400">Desain Komunikasi Visual</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-200">702 Suara</div>
                  <div className="text-[10px] text-slate-400 font-semibold">21.3%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
