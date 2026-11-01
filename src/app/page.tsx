"use client";

import React, { useState, useEffect } from "react";
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
  MessageCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Trophy,
  CheckCircle2,
  Users,
  Layers,
  Search,
  ExternalLink,
  Activity,
  Radio,
  HelpCircle,
  Clock,
  FileText,
  Lock,
  Building2,
  Scale,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import { CetasIntroAnimation } from "@/components/opening/cetas-intro-animation";
import { CetasHorizontalSlider } from "@/components/home/cetas-horizontal-slider";
import { UnifiedEvent, getStoredEvents, saveStoredEvents } from "@/lib/events-unified-data";
import { formatRupiah } from "@/lib/utils";

export default function HomePage() {
  const [eventsList, setEventsList] = useState<UnifiedEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [sliderMode, setSliderMode] = useState<"score" | "vote">("score");

  useEffect(() => {
    const cached = getStoredEvents();
    if (cached && cached.length > 0) {
      setEventsList(cached);
      setIsLoadingEvents(false);
    }

    fetch("/api/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEventsList(data.events);
          saveStoredEvents(data.events);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch events:", err);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, []);

  const totalEventsCount = eventsList.length;
  const totalTeamsCount = eventsList.reduce((sum, ev) => sum + (ev.lkbbTeams?.length || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E] font-sans">
      {/* ============================================================== */}
      {/* 0. WEBSITE OPENING ANIMATED INTRO                              */}
      {/* ============================================================== */}
      <CetasIntroAnimation />

      {/* ============================================================== */}
      {/* 1. HALAMAN BERANDA (HERO SECTION) — DEEP NAVY (#06132E)         */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:py-24 bg-[#06132E] border-b border-blue-500/20">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-b from-[#00D9FF]/15 via-[#126BDE]/15 to-transparent blur-3xl rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Brand & Editorial Headline — RATA TENGAH (GAMBAR 2) */}
            <div className="lg:col-span-7 space-y-6 text-center">
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 px-4 py-1.5 text-xs font-bold text-[#00D9FF] font-mono shadow-xs mx-auto">
                <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" />
                <span>Centralized Electronic Tournament &amp; Award System</span>
              </div>

              {/* Main Headline — Rata Tengah "Make it a story!" di bawah "CETAS." */}
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none font-display">
                  CETAS.
                </h1>
                <div className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#55DFFF] to-[#126BDE] font-display">
                  Make it a story!
                </div>
                <p className="text-base sm:text-lg font-normal text-slate-200 max-w-xl mx-auto leading-relaxed pt-2">
                  Ekosistem teknologi terpadu untuk registrasi peserta, tiket QR anti-duplikasi, bilik e-voting real-time, dan rekap penilaian juri zero-touch.
                </p>
              </div>

              {/* Action Buttons — Rata Tengah */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#turnamen-live"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black px-6 py-3.5 text-xs tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Jelajahi Event &amp; Tiket</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href="/tournament-hub"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 font-black px-5 py-3.5 text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>3D Tournament Hub</span>
                </Link>
              </div>

              {/* Trust Metric Chips */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3.5 rounded-2xl bg-[#0A2450]/80 border border-blue-500/30 text-center shadow-md">
                  <div className="text-xl font-black text-[#00D9FF] font-mono">0 Detik</div>
                  <div className="text-[11px] text-slate-200 font-bold">Rekap Juri Live</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0A2450]/80 border border-blue-500/30 text-center shadow-md">
                  <div className="text-xl font-black text-white font-mono">100% Sah</div>
                  <div className="text-[11px] text-slate-200 font-bold">Bebas Manipulasi</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0A2450]/80 border border-blue-500/30 text-center shadow-md">
                  <div className="text-xl font-black text-emerald-400 font-mono">Anti-Bot</div>
                  <div className="text-[11px] text-slate-200 font-bold">QRIS E-Voting</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0A2450]/80 border border-blue-500/30 text-center shadow-md">
                  <div className="text-xl font-black text-amber-400 font-mono">Satu Atap</div>
                  <div className="text-[11px] text-slate-200 font-bold">Production Vendor</div>
                </div>
              </div>
            </div>

            {/* Right Column: Official Mascot & Interaction */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-[#00D9FF]/20 via-[#126BDE]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Mascot Speech Bubble */}
              <div className="w-full max-w-sm mb-2 z-20">
                <div className="relative rounded-2xl bg-[#0A2450]/95 backdrop-blur-md p-3.5 shadow-2xl border border-[#00D9FF]/60 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00D9FF] font-mono">
                        ANTY • Maskot Resmi CETAS
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#126BDE]/20 text-cyan-200 border border-blue-400/40">
                      Make it a story!
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white leading-snug">
                    &ldquo;Selamat datang di CETAS! Cari tiket turnamen, dukung tim di bilik voting, atau kelola nilai juri tanpa kompromi bersama Anty.&rdquo;
                  </p>
                  <div className="absolute -bottom-1.5 left-12 w-3 h-3 bg-[#0A2450] border-b border-r border-[#00D9FF]/60 transform rotate-45 pointer-events-none" />
                </div>
              </div>

              {/* The Mascot */}
              <div className="relative z-10 animate-mascot-gentle-breathe">
                <AntmanMascot pose="waving" size={480} />
              </div>

              {/* WhatsApp Helpdesk */}
              <div className="w-full max-w-xs mt-1 z-20">
                <a
                  href="https://wa.me/6281584682345?text=Halo%20Anty%2C%20saya%20mau%20konsultasi%20layanan%20CETAS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>Konsultasi WhatsApp Resmi (24/7)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. REKAM JEJAK OPERASIONAL — MIDNIGHT NAVY (#0A1E44)           */}
      {/* ============================================================== */}
      <section id="rekam-jejak" className="py-20 bg-[#0A1E44] text-white border-b border-blue-500/25">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00D9FF] font-mono">
              Rekam Jejak Operasional
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Keandalan Teknologi di Setiap Detik Kompetisi
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
              Performa pemrosesan data riil turnamen, ribuan kontingen terdata, dan rekapitulasi penilaian juri tanpa manipulasi.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#06132E]/90 border border-blue-500/30 space-y-1 shadow-lg hover:border-[#00D9FF]/60 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-[#00D9FF] font-mono">
                {totalEventsCount > 0 ? `${totalEventsCount}+` : "24+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Event Terselenggara</p>
              <p className="text-[11px] text-cyan-200">Skala Daerah &amp; Nasional</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06132E]/90 border border-blue-500/30 space-y-1 shadow-lg hover:border-emerald-400/60 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
                {totalTeamsCount > 0 ? `${totalTeamsCount}+` : "1.200+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Kontingen &amp; Tim</p>
              <p className="text-[11px] text-emerald-200">SD, SMP, SMA, &amp; Purna</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06132E]/90 border border-blue-500/30 space-y-1 shadow-lg hover:border-blue-400/60 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-white font-mono">
                0 Detik
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Rekapitulasi Juri</p>
              <p className="text-[11px] text-cyan-200">Zero-Touch Score Engine</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06132E]/90 border border-blue-500/30 space-y-1 shadow-lg hover:border-amber-400/60 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">Sah &amp; Terverifikasi</p>
              <p className="text-[11px] text-amber-200">HMAC QR &amp; Berita Acara</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. EVENT BERJALAN & LIVE SCORING — DEEP NAVY (#06132E)          */}
      {/* ============================================================== */}
      <section id="turnamen-live" className="py-20 bg-[#06132E] text-white border-b border-blue-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 px-3.5 py-1 text-xs font-bold border border-emerald-400/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pusat Turnamen &amp; Bilik Suara</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
                {sliderMode === "score" ? "Event Berjalan & Live Scoring" : "Bilik E-Voting Turnamen"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                Gulir kartu event di bawah untuk melihat live scoreboard, membeli tiket resmi, atau memberikan suara vote favorit secara realtime.
              </p>
            </div>

            {/* Slider Switcher */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[#0A2450] border border-blue-500/40 p-1.5 shadow-md">
              <button
                type="button"
                onClick={() => setSliderMode("score")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                  sliderMode === "score"
                    ? "bg-[#126BDE] text-white shadow-md shadow-blue-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Live Scoring</span>
              </button>
              <button
                type="button"
                onClick={() => setSliderMode("vote")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                  sliderMode === "vote"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Vote className="h-3.5 w-3.5" />
                <span>E-Voting Live</span>
              </button>
            </div>
          </div>

          {/* Slider Component */}
          {isLoadingEvents ? (
            <div className="py-16 text-center text-slate-300 text-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-white mb-3" />
              <span>Memuat data kompetisi resmi...</span>
            </div>
          ) : (
            <CetasHorizontalSlider events={eventsList} mode={sliderMode} />
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. KEMITRAAN PENYELENGGARA — PRIMARY BLUE (#126BDE)            */}
      {/* ============================================================== */}
      <section id="kemitraan" className="py-20 bg-gradient-to-b from-[#126BDE] to-[#0A4BB3] text-white border-b border-blue-400/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block rounded-full bg-white/20 border border-white/30 px-4 py-1 text-xs font-bold uppercase tracking-wider font-mono shadow-sm">
            Kemitraan Penyelenggara
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            Siap Mengangkat Standar Acara Anda?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Gunakan CETAS untuk mengelola tiket, voting transparan, sewa peralatan panggung, dan rekapitulasi penilaian kompetisi sekolah atau festival Anda.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/ajukan-event"
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-[#06132E] font-black px-6 py-4 text-xs tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <span>Daftarkan Event Anda</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20tertarik%20bekerja%20sama%20menggunakan%20platform%20CETAS%20untuk%20event%20kami."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-950/60 hover:bg-blue-950/80 border border-white/40 text-white font-bold px-6 py-4 text-xs transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Hubungi Tim Kemitraan</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. TRANSPARANSI LEGALITAS PERUSAHAAN — DEEP NAVY (#06132E)      */}
      {/* ============================================================== */}
      <section id="legalitas" className="py-20 bg-[#06132E] text-white border-b border-blue-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1 text-xs font-bold text-emerald-300 mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Kepatuhan Hukum &amp; Regulasi Republik Indonesia</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
                Transparansi Legalitas Perusahaan
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl mt-1 leading-relaxed">
                CETAS dioperasikan secara legal dan bertanggung jawab demi keamanan transaksi seluruh pengguna.
              </p>
            </div>

            <Link
              href="/legalitas"
              className="inline-flex items-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black px-5 py-3 text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Halaman Legalitas Lengkap</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-blue-500/30 bg-[#0B1C3D] p-5 space-y-2.5 shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase tracking-wider">KEMENTERIAN HUKUM RI</span>
                <h4 className="text-base font-black text-white">Pendaftaran AHU</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Perseroan Perorangan terdaftar secara sah pada Ditjen AHU Kemenkumham RI.
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/20">
                <span className="text-[9px] text-cyan-300 font-mono uppercase block">Nomor SK AHU</span>
                <span className="text-xs font-mono font-bold text-white break-all">AHU-A016435.AH.01.31.Tahun 2026</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-[#0B1C3D] p-5 space-y-2.5 shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase tracking-wider">OSS INDONESIA</span>
                <h4 className="text-base font-black text-white">NIB Berizin Efektif</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Nomor Induk Berusaha berbasis risiko terdaftar pada sistem OSS BKPM.
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/20">
                <span className="text-[9px] text-cyan-300 font-mono uppercase block">Nomor NIB</span>
                <span className="text-xs font-mono font-bold text-white">2410260001294</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-[#0B1C3D] p-5 space-y-2.5 shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase tracking-wider">KOMINFO RI</span>
                <h4 className="text-base font-black text-white">Penyelenggara PSE</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Penyelenggara Sistem Elektronik (PSE) Lingkup Privat resmi terdaftar.
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/20">
                <span className="text-[9px] text-cyan-300 font-mono uppercase block">Tanda Daftar PSE</span>
                <span className="text-xs font-mono font-bold text-white break-all">030704.01/DJAI.PSE/10/2026</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-[#0B1C3D] p-5 space-y-2.5 shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase tracking-wider">DITJEN PAJAK RI</span>
                <h4 className="text-base font-black text-white">NPWP Perusahaan</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Kepatuhan pajak badan usaha resmi terdaftar pada Kantor Pelayanan Pajak (KPP).
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/20">
                <span className="text-[9px] text-cyan-300 font-mono uppercase block">Nomor NPWP</span>
                <span className="text-xs font-mono font-bold text-white">1000000011203939</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
