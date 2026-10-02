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
  Layers,
  ChevronRight,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

export default function HomePage() {
  const ecosystemPillars = [
    {
      title: "Cetas Ticketing",
      badge: "Anti-Fraud HMAC",
      description:
        "Sistem e-tiket berenkripsi dinamis dengan validasi instan di gerbang masuk via Mobile Gate Scanner. Terhubung langsung dengan payment gateway resmi Midtrans (QRIS, VA, Gopay).",
      icon: Ticket,
      href: "/events",
      accent: "from-purple-600 to-indigo-600",
      cta: "Beli & Cek Tiket",
    },
    {
      title: "Cetas Vote",
      badge: "Real-Time Tally",
      description:
        "Bilik suara digital transparan untuk kontes duta, pemilihan ketua, dan perlombaan turnamen. Mendukung Free Vote harian dan Paid Vote dengan leaderboard live tanpa manipulasi data.",
      icon: Award,
      href: "/vote",
      accent: "from-purple-700 to-violet-500",
      cta: "Buka Bilik Suara",
    },
    {
      title: "Pendaftaran Peserta",
      badge: "Form & E-Badge",
      description:
        "Registrasi peserta turnamen, seminar, workshop, dan kompetisi (seperti LKBB Paskibra) dengan upload berkas terpadu, nomor urut otomatis, dan konfirmasi instan.",
      icon: CheckCircle2,
      href: "/register-event",
      accent: "from-indigo-600 to-purple-600",
      cta: "Daftar Sekarang",
    },
    {
      title: "Cetas Production",
      badge: "Alat & Merch",
      description:
        "Vendor satu atap: rental sound system line-array konser, lighting panggung, videotron LED screen indoor/outdoor, panggung rigging, hingga cetak merchandise kaos & lanyard.",
      icon: ShoppingBag,
      href: "/production",
      accent: "from-violet-600 to-purple-700",
      cta: "Katalog Alat & Sewa",
    },
    {
      title: "Pengajuan & Kurasi Event",
      badge: "Event Organizer",
      description:
        "Punya event atau kompetisi turnamen? Ajukan proposal ke tim kurator Cetas untuk mendapatkan sponsor, publikasi di slot 'Iklan Cetas Kita', dan integrasi tiket & voting.",
      icon: Send,
      href: "/ajukan-event",
      accent: "from-purple-600 to-indigo-700",
      cta: "Ajukan Proposal",
    },
    {
      title: "Lingkup Kerja Cetas",
      badge: "Super Admin",
      description:
        "Pusat kendali manajemen Cetas Ecosystem untuk audit proposal, pemantauan omzet transaksi Midtrans, manajemen peran staff gate scanner, dan pengelolaan master event.",
      icon: ShieldCheck,
      href: "/admin",
      accent: "from-purple-900 to-slate-900",
      cta: "Masuk Portal Admin",
    },
  ];

  return (
    <div className="space-y-16 pb-24 text-slate-800 selection:bg-purple-600 selection:text-white">
      {/* 1. HERO SECTION (BERRY PURPLE LIGHT THEME + 3D ARM-WAVING ANT-MAN) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-100/70 via-purple-50/40 to-[#FCFBFE] pt-12 pb-18 border-b border-purple-100">
        {/* Soft Berry Glow Orbs */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[550px] h-[360px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-[380px] h-[320px] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Official Expansion Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-purple-800 border border-purple-200 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Centralized Electronic Tournament & Award System</span>
              </div>

              {/* Punchy Main Headline with Berry Violet Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Satu Ekosistem untuk{" "}
                <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                  Sukseskan Turnamen & Acara
                </span>{" "}
                Anda
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Platform resmi <strong>CETAS</strong> (Centralized Electronic Tournament & Award System): integrasi ticketing berkeamanan tinggi dengan kode QR HMAC, e-voting realtime terverifikasi Midtrans, registrasi peserta lomba, hingga vendor panggung & audio Cetas Production.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3.5 text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95"
                >
                  <Ticket className="h-4 w-4" />
                  Jelajahi Event & Tiket
                </Link>
                <Link
                  href="/vote"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-purple-50/60 text-purple-900 font-bold px-5 py-3.5 text-sm border border-purple-200 shadow-xs transition"
                >
                  <Award className="h-4 w-4 text-purple-600" />
                  Bilik Cetas Vote Live
                </Link>
                <a
                  href="https://wa.me/6281299887766?text=Halo%20Anty%20dan%20Tim%20Cetas%2C%20saya%20ingin%20konsultasi%20sewa%20alat%20atau%20tiket."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold px-4 py-3.5 text-sm border border-emerald-200 transition shadow-xs"
                >
                  <MessageCircle className="h-4 w-4 fill-emerald-600 text-white" />
                  WhatsApp Support
                </a>
              </div>

              {/* Trust Metric Chips */}
              <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-xs text-center">
                  <div className="text-xl font-black text-purple-700">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Anti-Duplikasi QR</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">Live</div>
                  <div className="text-[11px] text-slate-500 font-medium">Realtime Voting</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">QRIS & VA</div>
                  <div className="text-[11px] text-slate-500 font-medium">Midtrans Verified</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-xs text-center">
                  <div className="text-xl font-black text-purple-700">All-in-One</div>
                  <div className="text-[11px] text-slate-500 font-medium">Cetas Production</div>
                </div>
              </div>
            </div>

            {/* Right Column: Ant-Man Mascot Showcase Card with True 3D Waving Arm */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Soft Berry accent background halo */}
                <div className="absolute -inset-2 rounded-3xl bg-purple-200/50 opacity-60 blur-xl" />

                <div className="relative rounded-3xl bg-white border border-purple-100 p-6 shadow-xl space-y-4">
                  {/* Card Header with Official Logo Icon */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo/cetas_logo_transparent.png"
                        alt="CETAS"
                        width={26}
                        height={26}
                        className="object-contain"
                      />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-800">
                        Kenalan dengan &ldquo;Anty&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Maskot Manusia Semut
                    </span>
                  </div>

                  {/* Mascot Centerpiece: ONLY THE ARM MOVES IN 3D! Clean cutout without black box! */}
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-gradient-to-b from-purple-50/60 via-purple-50/20 to-white flex items-center justify-center border border-purple-100/80 overflow-hidden">
                    <AntmanMascot
                      pose="waving"
                      enable3DArm={true}
                      size={240}
                    />

                    {/* Speech Tag Overlay */}
                    <div className="absolute bottom-2 inset-x-3 rounded-xl bg-white/95 border border-purple-200 p-2.5 text-center shadow-md backdrop-blur-xs">
                      <p className="text-xs font-semibold text-slate-800">
                        &ldquo;Dadah semuanya! 👋 Tanganku melambai 3D nyapa kamu! Butuh tiket, vote, atau sewa panggung?&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <a
                      href="https://wa.me/6281299887766?text=Halo%20Anty%2C%20saya%20mau%20konsultasi%20layanan%20Cetas."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition transform active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>Chat WhatsApp Anty (+62 812-9988-7766)</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </a>

                    <Link
                      href="/vote"
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-purple-800 font-bold text-xs border border-purple-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-700" />
                        <span>Pilih & Vote Peserta Turnamen Favorit</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-purple-500" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IKLAN CETAS KITA (BERRY PURPLE LUXURY BANNER - Aroma Ice Berry Tea Reference) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-cyan-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-200 border border-white/20">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Iklan Cetas Kita • Rental & Vendor Terpercaya
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Paket Sound System Line-Array & Panggung Rigging Cetas
              </h2>
              <p className="text-sm sm:text-base text-purple-100 max-w-2xl leading-relaxed">
                Sukseskan konser musik, festival sekolah, turnamen, dan seminar akbar Anda. Lengkap dengan Audio Line-Array 10.000 Watt, Moving Beam Lighting, Videotron LED Screen P3.9, dan live streaming multi-kamera.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row shrink-0 gap-3">
              <Link
                href="/production"
                className="rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-md transition transform active:scale-95 text-center"
              >
                Lihat Paket Alat & Sewa
              </Link>
              <a
                href="https://wa.me/6281299887766?text=Halo%20Tim%20Cetas%20Production%2C%20saya%20ingin%20konsultasi%20sewa%20sound%20dan%20panggung."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-purple-950/80 hover:bg-purple-900 text-white font-bold px-5 py-3.5 text-xs sm:text-sm border border-purple-400/40 transition text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Tanya WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 PILAR UTAMA EKOSISTEM CETAS (Clean Berry Purple Cards) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            Integrasi Terpadu
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            6 Pilar Layanan Ekosistem Cetas
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Semua modul saling terhubung otomatis untuk memastikan kelancaran turnamen, ticketing, dan kenyamanan pengunjung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${pillar.accent} text-white shadow-md shadow-purple-500/20`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 font-normal">
                    {pillar.description}
                  </p>
                </div>

                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 group-hover:gap-3 transition-all pt-4 border-t border-purple-50"
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
        <div className="rounded-3xl border border-purple-100 bg-white p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-3.5 py-1 text-xs font-bold border border-purple-200">
                <TrendingUp className="h-3.5 w-3.5" />
                Cetas Vote • Bilik Suara Realtime
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Kompetisi & E-Voting Turnamen Terpercaya Tanpa Manipulasi
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tiap suara diverifikasi langsung oleh payment gateway Midtrans dan dicatat secara transparan di leaderboard turnamen. Kategori terbatas dan terpisah per jenjang lomba (SMP, SMA, Purna).
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/vote"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-3 text-xs sm:text-sm transition shadow-md shadow-purple-500/25 active:scale-95"
                >
                  Buka Bilik Voting Sekarang
                </Link>
                <Link
                  href="/events"
                  className="rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold px-5 py-3 text-xs sm:text-sm border border-purple-200 transition"
                >
                  Beli Tiket Masuk Event
                </Link>
              </div>
            </div>

            {/* Candidate Mock Standings in Purple Theme */}
            <div className="space-y-3 bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                <span>Leaderboard Teratas (Live)</span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Realtime
                </span>
              </div>

              {/* Rank 1 */}
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-purple-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 font-black flex items-center justify-center text-xs text-white shadow-xs">
                    01
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      Nadia Safira
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold">Top 1</span>
                    </div>
                    <div className="text-[11px] text-slate-500">SMA Negeri 1 Jakarta • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-purple-700">1.482 Suara</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">44.8%</div>
                </div>
              </div>

              {/* Rank 2 */}
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 font-black flex items-center justify-center text-xs text-slate-700">
                    02
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Reza Pratama</div>
                    <div className="text-[11px] text-slate-500">SMK Taruna Bhakti • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-800">1.120 Suara</div>
                  <div className="text-[10px] text-slate-500 font-semibold">33.9%</div>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 font-black flex items-center justify-center text-xs text-slate-700">
                    03
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Citra Lestari</div>
                    <div className="text-[11px] text-slate-500">SMA Bintang Nusantara • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-800">702 Suara</div>
                  <div className="text-[10px] text-slate-500 font-semibold">21.3%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP & SUPPORT CTA SECTION (BERRY PURPLE) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-100/60 via-purple-50/40 to-indigo-50/60 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-18 w-18 rounded-full bg-white border-2 border-purple-400 p-1 flex items-center justify-center shadow-md">
                <AntmanMascot pose="waving" enable3DArm={false} size={64} />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Punya Pertanyaan Seputar Turnamen, Tiket, atau Sewa Alat?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Tim CETAS dan maskot Anty si Manusia Semut siap membantu Anda 24/7. Hubungi kami via WhatsApp Official untuk respon kilat!
            </p>

            <div className="pt-2 flex justify-center">
              <a
                href="https://wa.me/6281299887766?text=Halo%20Admin%20Cetas%2C%20saya%20ingin%20bertanya%20seputar%20turnamen%20dan%20layanan%20Cetas."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
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
