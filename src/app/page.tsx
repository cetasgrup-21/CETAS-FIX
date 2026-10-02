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
      accent: "from-blue-600 to-indigo-600",
      cta: "Beli & Cek Tiket",
    },
    {
      title: "Cetas Vote",
      badge: "Real-Time Tally",
      description:
        "Bilik suara digital transparan untuk kontes duta, pemilihan ketua, dan perlombaan. Mendukung Free Vote harian dan Paid Vote dengan leaderboard live tanpa manipulasi data.",
      icon: Award,
      href: "/vote",
      accent: "from-blue-500 to-cyan-500",
      cta: "Buka Bilik Suara",
    },
    {
      title: "Pendaftaran Peserta",
      badge: "Form & E-Badge",
      description:
        "Registrasi peserta seminar, workshop, dan lomba (seperti LKBB Paskibra) dengan upload berkas terpadu, nomor urut otomatis, dan konfirmasi instan.",
      icon: CheckCircle2,
      href: "/register-event",
      accent: "from-teal-500 to-emerald-600",
      cta: "Daftar Sekarang",
    },
    {
      title: "Cetas Production",
      badge: "Alat & Merch",
      description:
        "Vendor satu atap: rental sound system line-array konser, lighting panggung, videotron LED screen indoor/outdoor, panggung rigging, hingga cetak merchandise kaos & lanyard.",
      icon: ShoppingBag,
      href: "/production",
      accent: "from-indigo-600 to-purple-600",
      cta: "Katalog Alat & Sewa",
    },
    {
      title: "Pengajuan & Kurasi Event",
      badge: "Event Organizer",
      description:
        "Punya event atau kompetisi? Ajukan proposal ke tim kurator Cetas untuk mendapatkan sponsor, publikasi di slot 'Iklan Cetas Kita', dan integrasi tiket & voting.",
      icon: Send,
      href: "/ajukan-event",
      accent: "from-sky-500 to-blue-600",
      cta: "Ajukan Proposal",
    },
    {
      title: "Lingkup Kerja Cetas",
      badge: "Super Admin",
      description:
        "Pusat kendali manajemen Cetas Ecosystem untuk audit proposal, pemantauan omzet transaksi Midtrans, manajemen peran staff gate scanner, dan pengelolaan master event.",
      icon: ShieldCheck,
      href: "/admin",
      accent: "from-slate-700 to-slate-900",
      cta: "Masuk Portal Admin",
    },
  ];

  return (
    <div className="space-y-16 pb-24 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION (LIGHT THEME + INTERACTIVE ANT-MAN MASCOT) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 pt-12 pb-18 border-b border-slate-200/80">
        {/* Soft blue background radial glow */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[500px] h-[350px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-[350px] h-[300px] bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>The Premier Event, E-Voting & Production Platform</span>
              </div>

              {/* Punchy Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Satu Ekosistem untuk{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Sukseskan Seluruh Acara
                </span>{" "}
                & Hiburan Anda
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Kelola penjualan tiket berkeamanan tinggi dengan kode QR HMAC, sistem e-voting real-time terverifikasi Midtrans, pendaftaran peserta lomba, hingga vendor perlengkapan panggung Cetas Production.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 text-sm shadow-md shadow-blue-500/25 transition transform active:scale-95"
                >
                  <Ticket className="h-4 w-4" />
                  Jelajahi Event & Tiket
                </Link>
                <Link
                  href="/vote"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 text-sm border border-slate-200 shadow-xs transition"
                >
                  <Award className="h-4 w-4 text-blue-600" />
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
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                  <div className="text-xl font-black text-blue-600">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Anti-Duplikasi QR</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">Live</div>
                  <div className="text-[11px] text-slate-500 font-medium">Realtime Voting</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">QRIS & VA</div>
                  <div className="text-[11px] text-slate-500 font-medium">Midtrans Verified</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                  <div className="text-xl font-black text-blue-600">All-in-One</div>
                  <div className="text-[11px] text-slate-500 font-medium">Cetas Production</div>
                </div>
              </div>
            </div>

            {/* Right Column: Ant-Man Mascot Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Subtle blue accent background halo */}
                <div className="absolute -inset-2 rounded-3xl bg-blue-200/50 opacity-50 blur-xl" />

                <div className="relative rounded-3xl bg-white border border-blue-100 p-6 shadow-xl space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                        Kenalan dengan &ldquo;Anty&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Maskot Manusia Semut
                    </span>
                  </div>

                  {/* Mascot Centerpiece with Cursor-Tracking Eyes & Waving Arm ("Dadah Dadah" 👋) */}
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-gradient-to-b from-blue-50 via-slate-50 to-white flex items-center justify-center border border-blue-100 overflow-hidden">
                    <AntmanMascot
                      pose="waving"
                      interactive={true}
                      enableWaving={true}
                      size={230}
                    />

                    {/* Speech Tag Overlay */}
                    <div className="absolute bottom-2 inset-x-3 rounded-xl bg-white/95 border border-blue-200 p-2.5 text-center shadow-md backdrop-blur-xs">
                      <p className="text-xs font-semibold text-slate-800">
                        &ldquo;Dadah semuanya! 👋 Mataku ngikutin kursor kamu loh! Butuh tiket atau sewa alat?&rdquo;
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
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold text-xs border border-slate-200 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
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

      {/* 2. IKLAN CETAS KITA & PRODUCTION SHOWCASE (Vibrant Electric Blue Banner) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-cyan-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Iklan Cetas Kita • Rental & Vendor Terpercaya
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Paket Sound System Line-Array & Panggung Rigging Cetas
              </h2>
              <p className="text-sm sm:text-base text-blue-50 max-w-2xl leading-relaxed">
                Sukseskan konser musik, festival sekolah, dan seminar akbar Anda. Lengkap dengan Audio Line-Array 10.000 Watt, Moving Beam Lighting, Videotron LED Screen P3.9, dan live streaming multi-kamera.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row shrink-0 gap-3">
              <Link
                href="/production"
                className="rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-md transition transform active:scale-95 text-center"
              >
                Lihat Paket Alat & Sewa
              </Link>
              <a
                href="https://wa.me/6281299887766?text=Halo%20Tim%20Cetas%20Production%2C%20saya%20ingin%20konsultasi%20sewa%20sound%20dan%20panggung."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold px-5 py-3.5 text-xs sm:text-sm border border-blue-400/40 transition text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Tanya WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 PILAR UTAMA EKOSISTEM CETAS (Clean Light Cards) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
            <Layers className="h-3.5 w-3.5" />
            Integrasi Terpadu
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            6 Pilar Layanan Ekosistem Cetas
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Semua modul saling terhubung otomatis untuk memastikan kelancaran operasional panitia dan kepuasan pengunjung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${pillar.accent} text-white shadow-md shadow-blue-500/20`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 font-normal">
                    {pillar.description}
                  </p>
                </div>

                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:gap-3 transition-all pt-4 border-t border-slate-100"
                >
                  {pillar.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CETAS VOTE SHOWCASE & LEADERBOARD TEASER (Clean Light Container) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3.5 py-1 text-xs font-bold border border-blue-200">
                <TrendingUp className="h-3.5 w-3.5" />
                Cetas Vote • Bilik Suara Realtime
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Kompetisi & E-Voting Terpercaya Tanpa Manipulasi
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tiap suara diverifikasi langsung oleh payment gateway Midtrans dan dicatat secara transparan di leaderboard. Kategori terbatas dan terpisah per jenjang lomba (SMP, SMA, Purna).
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/vote"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 text-xs sm:text-sm transition shadow-md shadow-blue-500/25 active:scale-95"
                >
                  Buka Bilik Voting Sekarang
                </Link>
                <Link
                  href="/events"
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 text-xs sm:text-sm transition"
                >
                  Beli Tiket Masuk Event
                </Link>
              </div>
            </div>

            {/* Candidate Mock Standings in Clean Light Theme */}
            <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <span>Leaderboard Teratas (Live)</span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Realtime
                </span>
              </div>

              {/* Rank 1 */}
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-blue-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 font-black flex items-center justify-center text-xs text-white shadow-xs">
                    01
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      Nadia Safira
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold">Top 1</span>
                    </div>
                    <div className="text-[11px] text-slate-500">SMA Negeri 1 Jakarta • Duta Favorit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-blue-600">1.482 Suara</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">44.8%</div>
                </div>
              </div>

              {/* Rank 2 */}
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-slate-200">
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
              <div className="p-3.5 bg-white rounded-2xl flex items-center justify-between border border-slate-200">
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

      {/* 5. WHATSAPP & SUPPORT CTA SECTION (LIGHT THEME) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-white border-2 border-blue-400 p-1 flex items-center justify-center shadow-md">
                <AntmanMascot pose="waving" interactive={true} size={56} />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Punya Pertanyaan Seputar Tiket, Lomba, atau Sewa Vendor?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Tim Cetas dan maskot Anty si Manusia Semut siap membantu Anda 24/7. Hubungi kami via WhatsApp Official untuk respon kilat!
            </p>

            <div className="pt-2 flex justify-center">
              <a
                href="https://wa.me/6281299887766?text=Halo%20Admin%20Cetas%2C%20saya%20ingin%20bertanya%20seputar%20layanan%20Cetas."
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
