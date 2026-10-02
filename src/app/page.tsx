import Link from "next/link";
import Image from "next/image";
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
  MessageCircle,
  QrCode,
  Radio,
  Flame,
  Speaker,
  Users,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const ecosystemPillars = [
    {
      title: "Cetas Ticketing",
      badge: "Anti-Fraud HMAC",
      description:
        "Sistem e-tiket berenkripsi dinamis dengan validasi instan di pintu masuk via Mobile Gate Scanner. Terhubung langsung dengan payment gateway resmi Midtrans (QRIS, VA, Gopay).",
      icon: Ticket,
      href: "/events",
      accent: "from-blue-600 via-indigo-600 to-cyan-500",
      cta: "Beli & Cek Tiket",
    },
    {
      title: "Cetas Vote",
      badge: "Real-Time Tally",
      description:
        "Bilik suara digital transparan untuk kontes duta, pemilihan ketua, dan perlombaan. Mendukung Free Vote harian dan Paid Vote dengan leaderboard live tanpa manipulasi data.",
      icon: Award,
      href: "/vote",
      accent: "from-cyan-500 via-blue-600 to-indigo-700",
      cta: "Buka Bilik Suara",
    },
    {
      title: "Pendaftaran Peserta",
      badge: "Form & E-Badge",
      description:
        "Registrasi peserta seminar, workshop, dan lomba (seperti LKBB Paskibra) dengan upload berkas terpadu, nomor urut otomatis, dan konfirmasi instan.",
      icon: CheckCircle2,
      href: "/register-event",
      accent: "from-blue-500 to-teal-500",
      cta: "Daftar Sekarang",
    },
    {
      title: "Cetas Production",
      badge: "Alat & Merch",
      description:
        "Vendor satu atap: rental sound system line-array konser, lighting panggung, videotron LED screen indoor/outdoor, panggung rigging, hingga cetak merchandise kaos & lanyard.",
      icon: ShoppingBag,
      href: "/production",
      accent: "from-indigo-600 via-purple-600 to-blue-500",
      cta: "Katalog Alat & Sewa",
    },
    {
      title: "Pengajuan & Kurasi Event",
      badge: "Event Organizer",
      description:
        "Punya event atau kompetisi? Ajukan proposal ke tim kurator Cetas untuk mendapatkan sponsor, publikasi di slot 'Iklan Cetas Kita', dan integrasi tiket & voting.",
      icon: Send,
      href: "/ajukan-event",
      accent: "from-sky-500 via-blue-600 to-blue-800",
      cta: "Ajukan Proposal",
    },
    {
      title: "Lingkup Kerja Cetas",
      badge: "Super Admin",
      description:
        "Pusat kendali manajemen Cetas Ecosystem untuk audit proposal, pemantauan omzet transaksi Midtrans, manajemen peran staff gate scanner, dan pengelolaan master event.",
      icon: ShieldCheck,
      href: "/admin",
      accent: "from-slate-700 via-blue-900 to-slate-900",
      cta: "Masuk Portal Admin",
    },
  ];

  return (
    <div className="space-y-20 pb-24 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION WITH 3D MASCOT CETI */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 pt-14 pb-20 border-b border-blue-900/30">
        {/* Subtle glowing ambient spheres */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 px-4 py-1.5 text-xs font-bold text-cyan-300 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                <span>The Premier Event, E-Voting & Production Platform</span>
              </div>

              {/* Punchy Main Headline */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Satu Ekosistem untuk{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent underline decoration-blue-500/50 decoration-wavy">
                  Sukseskan Seluruh Acara
                </span>{" "}
                & Hiburan Anda
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kelola penjualan tiket berkeamanan tinggi dengan kode QR HMAC, sistem e-voting real-time terverifikasi Midtrans, pendaftaran peserta lomba, hingga vendor perlengkapan panggung Cetas Production.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 text-sm shadow-xl shadow-blue-600/30 transition transform active:scale-95 border border-blue-400/40"
                >
                  <Ticket className="h-4 w-4" />
                  Jelajahi Event & Tiket
                </Link>
                <Link
                  href="/vote"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white font-bold px-5 py-3.5 text-sm border border-blue-500/40 shadow-md transition"
                >
                  <Award className="h-4 w-4 text-cyan-400" />
                  Bilik Cetas Vote Live
                </Link>
                <a
                  href="https://wa.me/6281299887766?text=Halo%20Ceti%20dan%20Tim%20Cetas%2C%20saya%20ingin%20konsultasi%20sewa%20alat%20atau%20tiket."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold px-4 py-3.5 text-sm border border-emerald-500/40 transition"
                >
                  <MessageCircle className="h-4 w-4 fill-emerald-400" />
                  WhatsApp Support
                </a>
              </div>

              {/* Trust Metric Chips */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-blue-900/40 backdrop-blur-sm">
                  <div className="text-xl font-black text-cyan-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Anti-Duplikasi QR</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-blue-900/40 backdrop-blur-sm">
                  <div className="text-xl font-black text-white">Live</div>
                  <div className="text-[11px] text-slate-400 font-medium">Realtime Voting</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-blue-900/40 backdrop-blur-sm">
                  <div className="text-xl font-black text-white">QRIS & VA</div>
                  <div className="text-[11px] text-slate-400 font-medium">Midtrans Verified</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-blue-900/40 backdrop-blur-sm">
                  <div className="text-xl font-black text-cyan-400">All-in-One</div>
                  <div className="text-[11px] text-slate-400 font-medium">Cetas Production</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Mascot Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Neon Cyan Glow behind card */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 opacity-30 blur-xl animate-pulse" />

                <div className="relative rounded-3xl bg-slate-900/90 border border-blue-500/40 p-6 shadow-2xl backdrop-blur-xl space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                        Meet &ldquo;Ceti&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-500/40">
                      Asisten Cetas
                    </span>
                  </div>

                  {/* Mascot Image Centerpiece */}
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-gradient-to-b from-blue-950/60 via-slate-950/80 to-slate-900/90 flex items-center justify-center border border-blue-500/20 overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

                    <Image
                      src="/mascot/ceti_transparent.png"
                      alt="Ceti - Maskot Cetas"
                      width={220}
                      height={220}
                      priority
                      className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-300 animate-ceti-float"
                    />

                    {/* Speech Tag Overlay */}
                    <div className="absolute bottom-3 inset-x-3 rounded-xl bg-slate-950/90 border border-blue-500/40 p-2.5 text-center backdrop-blur-md">
                      <p className="text-xs font-semibold text-slate-200">
                        &ldquo;Ada kendala tiket atau mau konsultasi sound & panggung? Chat Ceti di WA yuk!&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Mascot Quick Action Buttons */}
                  <div className="space-y-2">
                    <a
                      href="https://wa.me/6281299887766?text=Halo%20Ceti%2C%20saya%20mau%20konsultasi%20layanan%20Cetas."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>Chat Langsung via WhatsApp</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </a>

                    <Link
                      href="/vote"
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-300 font-bold text-xs border border-blue-500/30 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-cyan-400" />
                        <span>Pilih & Vote Peserta Favorit</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IKLAN CETAS KITA & PRODUCTION SHOWCASE (Dominant Blue Banner) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-8 sm:p-12 border border-blue-500/40 shadow-2xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-blue-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-cyan-300 border border-blue-400/40">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Iklan Cetas Kita • Rental & Vendor Terpercaya
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Paket Sound System Line-Array & Panggung Rigging Cetas
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Sukseskan konser musik, festival sekolah, dan seminar akbar Anda. Lengkap dengan Audio Line-Array 10.000 Watt, Moving Beam Lighting, Videotron LED Screen P3.9, dan live streaming multi-kamera.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row shrink-0 gap-3">
              <Link
                href="/production"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition transform active:scale-95 text-center"
              >
                Lihat Paket Alat & Sewa
              </Link>
              <a
                href="https://wa.me/6281299887766?text=Halo%20Tim%20Cetas%20Production%2C%20saya%20ingin%20konsultasi%20sewa%20sound%20dan%20panggung."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-bold px-5 py-3.5 text-xs sm:text-sm border border-blue-500/40 transition text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4 fill-cyan-400" />
                Tanya WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 PILAR UTAMA EKOSISTEM CETAS (Modern Blue Grid) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 bg-blue-950/60 border border-blue-500/30">
            <Layers className="h-3.5 w-3.5" />
            Integrasi Terpadu
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            6 Pilar Layanan Ekosistem Cetas
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Semua modul saling terhubung otomatis untuk memastikan kelancaran operasional panitia dan kepuasan pengunjung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-blue-900/40 bg-slate-900/70 p-6 shadow-lg backdrop-blur-md hover:border-blue-500/60 hover:shadow-[0_0_25px_rgba(37,99,235,0.2)] transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${pillar.accent} text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-500/30">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:gap-3 transition-all pt-4 border-t border-slate-800/80"
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
        <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-slate-950 via-blue-950/50 to-slate-950 text-white p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/20 text-cyan-300 px-3.5 py-1 text-xs font-bold border border-blue-500/40">
                <TrendingUp className="h-3.5 w-3.5" />
                Cetas Vote • Bilik Suara Realtime
              </div>

              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Kompetisi & E-Voting Terpercaya Tanpa Manipulasi
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Tiap suara diverifikasi langsung oleh payment gateway Midtrans dan dicatat secara transparan di leaderboard. Kategori terbatas dan terpisah per jenjang lomba (SMP, SMA, Purna).
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/vote"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold px-6 py-3 text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  Buka Bilik Voting Sekarang
                </Link>
                <Link
                  href="/events"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold px-5 py-3 text-xs sm:text-sm border border-slate-700 transition"
                >
                  Beli Tiket Masuk Event
                </Link>
              </div>
            </div>

            {/* Candidate Mock Standings in Blue Cyber Theme */}
            <div className="space-y-3 bg-slate-900/90 p-6 rounded-3xl border border-blue-500/30 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <span>Leaderboard Teratas (Live)</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Realtime
                </span>
              </div>

              {/* Rank 1 */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950/80 to-slate-900 rounded-2xl flex items-center justify-between border border-blue-500/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 font-black flex items-center justify-center text-xs text-slate-950 shadow-md">
                    01
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      Nadia Safira
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold">Top 1</span>
                    </div>
                    <div className="text-[11px] text-slate-400">SMA Negeri 1 Jakarta • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-cyan-300">1.482 Suara</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">44.8%</div>
                </div>
              </div>

              {/* Rank 2 */}
              <div className="p-3.5 bg-slate-950/70 rounded-2xl flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 font-black flex items-center justify-center text-xs text-slate-300">
                    02
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Reza Pratama</div>
                    <div className="text-[11px] text-slate-400">SMK Taruna Bhakti • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-200">1.120 Suara</div>
                  <div className="text-[10px] text-slate-400 font-semibold">33.9%</div>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="p-3.5 bg-slate-950/70 rounded-2xl flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 font-black flex items-center justify-center text-xs text-slate-300">
                    03
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Citra Lestari</div>
                    <div className="text-[11px] text-slate-400">SMA Bintang Nusantara • Duta Favorit</div>
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

      {/* 5. WHATSAPP & SUPPORT CTA SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-900/50 bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-slate-950 border-2 border-cyan-400/80 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Image
                  src="/mascot/ceti_transparent.png"
                  alt="Ceti"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Punya Pertanyaan Seputar Tiket, Lomba, atau Sewa Vendor?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tim Cetas dan maskot Ceti siap membantu Anda 24/7. Hubungi kami via WhatsApp Official untuk respon kilat!
            </p>

            <div className="pt-2 flex justify-center">
              <a
                href="https://wa.me/6281299887766?text=Halo%20Admin%20Cetas%2C%20saya%20ingin%20bertanya%20seputar%20layanan%20Cetas."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 shadow-xl shadow-emerald-500/25 transition transform active:scale-95"
              >
                <MessageCircle className="h-5 w-5 fill-white" />
                Chat WhatsApp CS Official (+62 812-9988-7766)
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
