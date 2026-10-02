"use client";

import React, { useState } from "react";
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
  UserCheck,
  Clock,
  Download,
  Star,
  Check,
  HelpCircle,
  FileText,
  Volume2,
  Monitor,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

interface ScoreboardRow {
  rank: number;
  school: string;
  team: string;
  category: string;
  pbbMurni: number;
  variasi: number;
  danton: number;
  kostum: number;
  penalty: number;
  totalScore: number;
  votes: number;
  status: "TERVERIFIKASI" | "SEDANG_DINILAI";
}

export default function HomePage() {
  const [selectedScoreTab, setSelectedScoreTab] = useState<
    "umum" | "pbb" | "variasi" | "danton" | "favorit"
  >("umum");

  const scoreboardData: ScoreboardRow[] = [
    {
      rank: 1,
      school: "SMA Negeri 1 Jakarta",
      team: "Pasukan Garuda Sakti",
      category: "Tingkat SMA",
      pbbMurni: 94.5,
      variasi: 96.0,
      danton: 93.5,
      kostum: 95.0,
      penalty: 0,
      totalScore: 379.0,
      votes: 2450,
      status: "TERVERIFIKASI",
    },
    {
      rank: 2,
      school: "SMK Taruna Bhakti Depok",
      team: "Cakra Wibawa Nusantara",
      category: "Tingkat SMA",
      pbbMurni: 92.0,
      variasi: 94.5,
      danton: 91.0,
      kostum: 93.0,
      penalty: 0,
      totalScore: 370.5,
      votes: 1820,
      status: "TERVERIFIKASI",
    },
    {
      rank: 3,
      school: "SMP Negeri 2 Bandung",
      team: "Satria Muda Siliwangi",
      category: "Tingkat SMP",
      pbbMurni: 89.5,
      variasi: 92.0,
      danton: 89.0,
      kostum: 91.0,
      penalty: 0,
      totalScore: 361.5,
      votes: 1410,
      status: "TERVERIFIKASI",
    },
    {
      rank: 4,
      school: "SMA Bintang Nusantara",
      team: "Laskar Adhi Pratama",
      category: "Tingkat SMA",
      pbbMurni: 88.0,
      variasi: 90.5,
      danton: 87.0,
      kostum: 89.5,
      penalty: 0,
      totalScore: 355.0,
      votes: 980,
      status: "SEDANG_DINILAI",
    },
  ];

  const sortedScoreboard = [...scoreboardData].sort((a, b) => {
    if (selectedScoreTab === "pbb") return b.pbbMurni - a.pbbMurni;
    if (selectedScoreTab === "variasi") return b.variasi - a.variasi;
    if (selectedScoreTab === "danton") return b.danton - a.danton;
    if (selectedScoreTab === "favorit") return b.votes - a.votes;
    return b.totalScore - a.totalScore;
  });

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
      title: "Akses Pelatih & Juri",
      badge: "Rekap Nilai 0 Detik",
      description:
        "Portal terpadu untuk pelatih dan official: unduh juklak/juknis, pantau urutan tampil di daerah persiapan (DP), lembar nilai juri transparan, dan e-sertifikat peserta ber-QR.",
      icon: UserCheck,
      href: "/pelatih",
      accent: "from-purple-800 to-purple-950",
      cta: "Masuk Portal Pelatih",
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
  ];

  return (
    <div className="space-y-16 pb-24 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION (GRAND UNBOXED CYBER MASCOT & FLOATING HUD BADGES) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-sky-50/40 to-[#F8FAFC] pt-12 pb-18 border-b border-blue-100/80">
        {/* Soft Glow Orbs */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[550px] h-[360px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-[420px] h-[340px] bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Hero Text & Badges */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Official Expansion Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-blue-900 border border-blue-200 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Centralized Electronic Tournament & Award System</span>
              </div>

              {/* Punchy Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Platform Rekapitulasi Digital,{" "}
                <span className="bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 bg-clip-text text-transparent">
                  E-Voting & Produksi
                </span>{" "}
                Turnamen Terlengkap
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Standardisasi baru turnamen modern: digitalisasi penilaian juri PBB & olahraga, rekapitulasi nilai instan 0 detik ke layar videotron, tiket berenkripsi HMAC dinamis, portal akses pelatih, dan vendor panggung satu atap.
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
                  href="/score"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3.5 text-sm shadow-md transition"
                >
                  <Award className="h-4 w-4 text-cyan-400" />
                  CETAS.SCORE (Juri Live)
                </Link>
                <Link
                  href="/vote"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-blue-50/60 text-blue-900 font-bold px-5 py-3.5 text-sm border border-blue-200 shadow-xs transition"
                >
                  <Award className="h-4 w-4 text-blue-600" />
                  Bilik Cetas Vote Live
                </Link>
                <a
                  href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20ingin%20konsultasi%20turnamen%20dan%20alat."
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
                <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-xs text-center">
                  <div className="text-xl font-black text-blue-700">0 Detik</div>
                  <div className="text-[11px] text-slate-500 font-medium">Rekapitulasi Juri Live</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">100% Sah</div>
                  <div className="text-[11px] text-slate-500 font-medium">Bebas Manipulasi</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-xs text-center">
                  <div className="text-xl font-black text-slate-900">QRIS & VA</div>
                  <div className="text-[11px] text-slate-500 font-medium">Midtrans Instant</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-xs text-center">
                  <div className="text-xl font-black text-blue-700">Satu Atap</div>
                  <div className="text-[11px] text-slate-500 font-medium">Cetas Production</div>
                </div>
              </div>
            </div>

            {/* Right Column: Ant-Man Mascot Showcase - GRAND, UNBOXED, WITH CETAS IDENTITY */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Grand Cyber Platform Glow Backdrop (No Box!) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-blue-600/15 via-cyan-400/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Interactive Speech Bubble (Above Mascot) */}
              <div className="w-full max-w-sm mb-2 z-20">
                <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 shadow-xl border border-blue-200/80 dark:border-blue-800 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        ANTY • Maskot Resmi CETAS
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                      Manusia Semut Cyber
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    &ldquo;Halo sobat turnamen! 👋 Butuh tiket, rekap nilai juri 0 detik, atau sewa panggung & sound? Tanya Anty di WhatsApp!&rdquo;
                  </p>
                  {/* Subtle speech tail pointing down to mascot */}
                  <div className="absolute -bottom-1.5 left-12 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-b border-r border-blue-200/80 dark:border-blue-800 transform rotate-45 pointer-events-none" />
                </div>
              </div>

              {/* Main Mascot Display - LARGE, UNBOXED, BOLD */}
              <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center">
                {/* Floating HUD Badge 1: Top Left */}
                <div className="absolute top-8 -left-4 sm:-left-8 z-30 hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 shadow-xl border border-blue-200 dark:border-blue-800">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-bold text-slate-500">Rekap Nilai Juri</div>
                    <div className="text-xs font-black text-blue-950 dark:text-blue-200">Real-time 0 Detik</div>
                  </div>
                </div>

                {/* Floating HUD Badge 2: Mid-Right */}
                <div className="absolute top-36 -right-4 sm:-right-8 z-30 hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 shadow-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-bold text-slate-500">Tiket Ber-QR</div>
                    <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">Anti-Duplikasi HMAC</div>
                  </div>
                </div>

                {/* THE UNBOXED MASCOT */}
                <div className="relative z-10 py-1">
                  <AntmanMascot pose="waving" size={480} />
                </div>

                {/* Quick Action Buttons Underneath Mascot */}
                <div className="w-full max-w-sm space-y-2 mt-1 z-20">
                  <a
                    href="https://wa.me/6281584682345?text=Halo%20Anty%2C%20saya%20mau%20konsultasi%20layanan%20Cetas."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-95 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="h-5 w-5 fill-white" />
                      <span>Chat WhatsApp Anty (0815-8468-2345)</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>

                  <Link
                    href="/pelatih"
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/95 hover:bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200 shadow-sm transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span>Masuk Portal Akses Pelatih & Kontingen</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE SCOREBOARD & REKAPITULASI JURI (KATHAREKAP KILLER FEATURE!) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-3.5 py-1 text-xs font-bold border border-purple-200">
                <TrendingUp className="h-3.5 w-3.5" />
                Scoreboard Turnamen • Rekapitulasi Real-Time Dewan Juri
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Peringkat & Nilai Lomba Terkini (Live)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Setiap nilai langsung masuk dari perangkat tablet juri, dihitung otomatis oleh mesin rekapitulasi, dan disiarkan langsung ke videotron arena.
              </p>
            </div>

            <Link
              href="/pelatih"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 shadow-md shadow-purple-600/30 transition shrink-0"
            >
              <UserCheck className="h-4 w-4" />
              Buka Lembar Nilai di Portal Pelatih
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-purple-50 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedScoreTab("umum")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedScoreTab === "umum"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-purple-50 text-slate-700 hover:bg-purple-100/70"
              }`}
            >
              🏆 Juara Umum LKBB
            </button>
            <button
              type="button"
              onClick={() => setSelectedScoreTab("pbb")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedScoreTab === "pbb"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-purple-50 text-slate-700 hover:bg-purple-100/70"
              }`}
            >
              🎖️ PBB Murni
            </button>
            <button
              type="button"
              onClick={() => setSelectedScoreTab("variasi")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedScoreTab === "variasi"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-purple-50 text-slate-700 hover:bg-purple-100/70"
              }`}
            >
              ✨ Variasi & Formasi
            </button>
            <button
              type="button"
              onClick={() => setSelectedScoreTab("danton")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedScoreTab === "danton"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-purple-50 text-slate-700 hover:bg-purple-100/70"
              }`}
            >
              🗣️ Danton Terbaik
            </button>
            <button
              type="button"
              onClick={() => setSelectedScoreTab("favorit")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedScoreTab === "favorit"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-purple-50 text-slate-700 hover:bg-purple-100/70"
              }`}
            >
              ❤️ Juara Favorit (Vote Publik)
            </button>
          </div>

          {/* Scoreboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedScoreboard.map((item, index) => (
              <div
                key={item.school}
                className="relative rounded-2xl border border-purple-100 bg-white p-5 shadow-xs purple-glow-hover transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`h-8 w-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      index === 0
                        ? "bg-amber-400 text-amber-950 shadow-xs"
                        : index === 1
                        ? "bg-slate-200 text-slate-800"
                        : index === 2
                        ? "bg-amber-700/20 text-amber-900"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "TERVERIFIKASI"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                    }`}
                  >
                    {item.status === "TERVERIFIKASI" ? "✓ Sah Juri" : "Proses"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                    {item.school}
                  </h3>
                  <p className="text-xs text-purple-700 font-bold mt-0.5 line-clamp-1">
                    &ldquo;{item.team}&rdquo;
                  </p>
                </div>

                {/* Score Detail Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-purple-50 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>PBB Murni:</span>
                    <span className="font-bold text-slate-800">{item.pbbMurni}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Variasi Formasi:</span>
                    <span className="font-bold text-slate-800">{item.variasi}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Komandan Peleton:</span>
                    <span className="font-bold text-slate-800">{item.danton}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Vote Publik:</span>
                    <span className="font-bold text-purple-700">{item.votes} Suara</span>
                  </div>
                </div>

                {/* Total Score Highlight */}
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Skor:</span>
                  <span className="text-lg font-black text-purple-700">
                    {item.totalScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ARSITEKTUR SISTEM PENILAIAN JURI DIGITAL (4 LANGKAH PRESISI) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            Transparansi Kompetisi
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Arsitektur Penilaian Digital Tanpa Manipulasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            Dirancang khusus untuk menghapus potensi kecurangan, kesalahan hitung manual, dan keterlambatan rekapitulasi pada event turnamen Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-600/30">
              01
            </div>
            <h3 className="text-base font-black text-slate-900">Input Tablet Juri</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dewan juri menginput nilai per butir gerakan melalui tablet/smartphone khusus dengan form terenkripsi. Sekali disubmit, nilai langsung terkunci.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/30">
              02
            </div>
            <h3 className="text-base font-black text-slate-900">Rekap Otomatis</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mesin kalkulasi algoritma menghitung total nilai, pengurangan pinalti garis/waktu, dan perangkingan secara otomatis tanpa rumus Excel manual.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-800 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-800/30">
              03
            </div>
            <h3 className="text-base font-black text-slate-900">Layar Videotron Live</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Peringkat dan skor langsung terpampang di layar videotron LED panggung utama secara real-time untuk transparansi penonton dan suporter.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/30">
              04
            </div>
            <h3 className="text-base font-black text-slate-900">Berita Acara & QR</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sekali klik langsung terbit berita acara resmi bertanda tangan digital serta e-sertifikat ber-QR code yang dapat diverifikasi keasliannya.
            </p>
          </div>
        </div>
      </section>

      {/* 4. IKLAN CETAS KITA & CETAS PRODUCTION (THE UNBEATABLE MOAT OVER KATHAREKAP!) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-cyan-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-200 border border-white/20">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                Infrastruktur Produksi Turnamen Terlengkap
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Sewa Audio Line-Array, Videotron LED & Rigging Panggung
              </h2>
              <p className="text-sm sm:text-base text-purple-100 max-w-2xl leading-relaxed">
                Berbeda dengan penyedia software biasa, CETAS memiliki vendor fisik satu atap: Sound System Line-Array 10.000-30.000 Watt, Videotron LED P3.9, Panggung Rigging Aluminium, Lighting Moving Head, serta cetak Kaos, Medali & Lanyard Turnamen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row shrink-0 gap-3">
              <Link
                href="/production"
                className="rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-md transition transform active:scale-95 text-center"
              >
                Katalog Alat & Sewa
              </Link>
              <a
                href="https://wa.me/6281584682345?text=Halo%20Tim%20Cetas%20Production%2C%20saya%20ingin%20konsultasi%20sewa%20sound%20dan%20panggung."
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

      {/* 5. 6 PILAR UTAMA EKOSISTEM CETAS */}
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

      {/* 6. PAKET LAYANAN & SKEMA HARGA TRANSPARAN (PRICING TIERS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <Award className="h-3.5 w-3.5 text-purple-600" />
            Pilihan Paket Event
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Skema Paket & Harga Transparan
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan skala turnamen Anda. Tanpa biaya tersembunyi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Paket 1: E-Voting */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Turnamen Mandiri
              </span>
              <h3 className="text-xl font-black text-slate-900">Cetas Vote</h3>
              <div className="text-3xl font-black text-purple-700">
                Rp 0 <span className="text-xs text-slate-500 font-normal">/ setup</span>
              </div>
              <p className="text-xs text-slate-500">
                Bilik suara e-voting juara favorit turnamen dengan sistem revenue share 10% per transaksi QRIS.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-purple-50">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Payment Gateway Midtrans QRIS</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Leaderboard Suara Real-time</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Anti-Bot & Verifikasi Akun</span>
                </li>
              </ul>
            </div>
            <Link
              href="/vote"
              className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs text-center transition"
            >
              Buka Bilik Vote
            </Link>
          </div>

          {/* Paket 2: E-Ticketing */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Gate Scanner
              </span>
              <h3 className="text-xl font-black text-slate-900">Cetas Ticketing</h3>
              <div className="text-3xl font-black text-purple-700">
                Rp 1.500 <span className="text-xs text-slate-500 font-normal">/ tiket</span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem e-tiket ber-QR HMAC dinamis untuk konser, seminar, dan tiket penonton turnamen.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-purple-50">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Kode QR Dinamis Anti-Screenshot</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Aplikasi Gate Scanner Validator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Laporan Omzet & Kapasitas Live</span>
                </li>
              </ul>
            </div>
            <Link
              href="/events"
              className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs text-center transition"
            >
              Pesan Tiket
            </Link>
          </div>

          {/* Paket 3: Sistem Penilaian Juri (Featured!) */}
          <div className="rounded-3xl border-2 border-purple-600 bg-gradient-to-b from-purple-50/40 to-white p-6 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
              Paling Direkomendasikan
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                Turnamen & LKBB
              </span>
              <h3 className="text-xl font-black text-slate-900">Rekap Juri Digital</h3>
              <div className="text-3xl font-black text-purple-700">
                Rp 2.500.000 <span className="text-xs text-slate-500 font-normal">/ event</span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem penilaian juri digital tablet, engine rekapitulasi otomatis, dan tayangan videotron.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-purple-100">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">Aplikasi Juri Tablet (3-5 Pos Juri)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">Rekap Nilai Otomatis 0 Detik</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">Portal Akses Pelatih & Kontingen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">Cetak Berita Acara & Piagam Ber-QR</span>
                </li>
              </ul>
            </div>
            <a
              href="https://wa.me/6281584682345?text=Halo%20Tim%20CETAS%2C%20saya%20tertarik%20dengan%20Paket%20Rekap%20Juri%20Digital."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs text-center shadow-md shadow-purple-600/30 transition active:scale-95"
            >
              Pilih Paket Ini
            </a>
          </div>

          {/* Paket 4: All-in-One Turnamen Akbar */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Satu Atap Lengkap
              </span>
              <h3 className="text-xl font-black text-slate-900">All-in-One Akbar</h3>
              <div className="text-2xl font-black text-purple-700">
                Konsultasi WA <span className="text-xs text-slate-500 font-normal">/ custom</span>
              </div>
              <p className="text-xs text-slate-500">
                Seluruh sistem digital + sewa Sound System Line-Array 10.000W + Videotron LED + Panggung Rigging Cetas Production.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-purple-50">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Sistem Juri + Tiket + E-Voting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Sound Line-Array & Lighting Panggung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Videotron LED Screen Outdoor/Indoor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Tim Operator & Soundman Standby</span>
                </li>
              </ul>
            </div>
            <a
              href="https://wa.me/6281584682345?text=Halo%20Tim%20CETAS%2C%20saya%20ingin%20konsultasi%20Paket%20All-in-One%20Turnamen%20Akbar."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs text-center transition"
            >
              Konsultasi WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 7. TABEL KOMPARASI: CETAS VS SISTEM TRADISIONAL / KOMPETITOR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Mengapa Penyelenggara Memilih CETAS?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Perbandingan keunggulan CETAS terhadap sistem konvensional maupun software rekap biasa.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50">
                  <th className="p-3.5 font-bold text-slate-700">Fitur & Kemampuan</th>
                  <th className="p-3.5 font-bold text-slate-500">Metode Konvensional</th>
                  <th className="p-3.5 font-bold text-slate-500">Software Rekap Biasa</th>
                  <th className="p-3.5 font-black text-purple-800 bg-purple-100/60">CETAS Ecosystem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">Kecepatan Rekapitulasi Nilai</td>
                  <td className="p-3.5 text-slate-500">1 - 3 Jam (Kalkulator/Excel)</td>
                  <td className="p-3.5 text-slate-500">10 - 20 Menit</td>
                  <td className="p-3.5 font-bold text-purple-700 bg-purple-50/30">0 Detik (Real-time Instan)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">Keamanan Nilai Juri</td>
                  <td className="p-3.5 text-slate-500">Kertas rawan tercecer / diubah</td>
                  <td className="p-3.5 text-slate-500">Biasa tanpa enkripsi</td>
                  <td className="p-3.5 font-bold text-purple-700 bg-purple-50/30">Terkunci Digital HMAC-SHA256</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">Tiket Masuk & Gate Scanner</td>
                  <td className="p-3.5 text-slate-500">Kertas sobek manual</td>
                  <td className="p-3.5 text-slate-500">Tidak ada gate scanner</td>
                  <td className="p-3.5 font-bold text-purple-700 bg-purple-50/30">QR Dinamis + Validator Cepat</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">E-Voting Juara Favorit</td>
                  <td className="p-3.5 text-slate-500">Kupon kertas manual</td>
                  <td className="p-3.5 text-slate-500">Sering bot / manipulasi</td>
                  <td className="p-3.5 font-bold text-purple-700 bg-purple-50/30">QRIS Midtrans Terverifikasi</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">Penyediaan Sound & Videotron</td>
                  <td className="p-3.5 text-slate-500">Cari vendor luar terpisah</td>
                  <td className="p-3.5 text-slate-500">Tidak ada alat</td>
                  <td className="p-3.5 font-bold text-purple-700 bg-purple-50/30">Cetas Production Satu Atap</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI PELATIH & PENYELENGGARA TURNAMEN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Kepuasan Komunitas
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dipercaya Pelatih & Penyelenggara Lomba
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {"★★★★★"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Baru kali ini ikut LKBB yang rekap nilainya detik itu juga langsung tayang di layar videotron panggung! Pasukan kami tidak perlu menunggu larut malam untuk tahu hasil penilaian juri.&rdquo;
            </p>
            <div className="pt-2 border-t border-purple-50 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                BW
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Bambang Wijaya, S.Pd</div>
                <div className="text-[11px] text-slate-500">Pelatih Paskibra SMAN 1 Jakarta</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {"★★★★★"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Sistem tiket ber-QR dinamis CETAS bikin gate masuk turnamen sangat tertib. Tidak ada lagi joki tiket atau screenshot palsu. Pendapatan tiket penonton langsung transparan di dashboard admin.&rdquo;
            </p>
            <div className="pt-2 border-t border-purple-50 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                RS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Rendi Saputra</div>
                <div className="text-[11px] text-slate-500">Ketua Panitia Festival Pelajar</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {"★★★★★"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Sangat terbantu dengan Cetas Production. Kami sewa sound line-array sekalian dengan aplikasi juri dan e-voting. Sangat praktis, tidak perlu pusing koordinasi vendor terpisah.&rdquo;
            </p>
            <div className="pt-2 border-t border-purple-50 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                DA
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Dra. Anisa Kusuma</div>
                <div className="text-[11px] text-slate-500">Pembina OSIS & Seni Pelajar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHATSAPP & SUPPORT CTA SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-100/60 via-purple-50/40 to-indigo-50/60 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-18 w-18 rounded-full bg-white border-2 border-purple-400 p-1 flex items-center justify-center shadow-md">
                <AntmanMascot pose="waving" enable3DArm={false} size={64} />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Siap Menyelenggarakan Turnamen Berkelas bersama CETAS?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Tim CETAS dan maskot Anty si Manusia Semut siap membantu konsultasi sistem juri, e-ticketing, e-voting, hingga rental sound & videotron untuk event Anda.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20ingin%20konsultasi%20sistem%20turnamen."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
              >
                <MessageCircle className="h-5 w-5 fill-white" />
                Chat WhatsApp CS Official (0815-8468-2345)
              </a>
              <Link
                href="/pelatih"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-purple-700/25 transition"
              >
                <UserCheck className="h-5 w-5" />
                Buka Portal Akses Pelatih
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
