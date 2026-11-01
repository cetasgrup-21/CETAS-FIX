"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket,
  Award,
  Vote,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
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
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import { CetasOpeningExperience } from "@/components/opening/cetas-opening-experience";
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

  const services = [
    {
      id: "tiket",
      title: "CETAS.TIKET",
      subtitle: "Pembelian tiket dan registrasi event.",
      description:
        "Sistem ticketing anti-fraud dengan dynamic HMAC QR Code. Validasi instan di gerbang gate masuk via Mobile Scanner serta verifikasi pembayaran otomatis.",
      icon: Ticket,
      href: "/events",
      accentBg: "bg-cyan-500/10",
      accentBorder: "border-cyan-500/30",
      accentText: "text-cyan-400",
      badge: "Tiket & Registrasi",
    },
    {
      id: "id",
      title: "CETAS.ID",
      subtitle: "Voting dan dukungan untuk peserta favorit.",
      description:
        "Bilik suara digital transparan untuk kontes dan turnamen. Mendukung Free Vote harian dan Paid Vote QRIS dengan leaderboard live tanpa manipulasi data.",
      icon: Award,
      href: "/vote",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      accentText: "text-amber-400",
      badge: "E-Voting Live",
    },
    {
      id: "production",
      title: "CETAS.PRODUCTION",
      subtitle: "Kebutuhan produksi dan perlengkapan event.",
      description:
        "Vendor satu atap: rental sound system line-array konser, lighting panggung, videotron LED screen indoor/outdoor, panggung rigging, hingga merchandise resmi.",
      icon: ShoppingBag,
      href: "/production",
      accentBg: "bg-indigo-500/10",
      accentBorder: "border-indigo-500/30",
      accentText: "text-indigo-400",
      badge: "Alat & Panggung",
    },
    {
      id: "score",
      title: "CETAS.SCORE",
      subtitle: "Pengelolaan penilaian dan hasil kompetisi.",
      description:
        "Mesin rekapitulasi penilaian juri zero-touch untuk LKBB dan kompetisi nasional. Perhitungan bobot akurat 0 detik, berita acara resmi F4, dan 3D Tournament Hub.",
      icon: ShieldCheck,
      href: "/score",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      accentText: "text-emerald-400",
      badge: "Rekap Juri 0 Detik",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#070A12] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* ============================================================== */}
      {/* 0. WEBSITE OPENING & VECTOR LOGO INTRO ANIMATION               */}
      {/* ============================================================== */}
      <CetasOpeningExperience />

      {/* ============================================================== */}
      {/* 1. HERO SECTION — MOVE DIFFERENT (HIGH CONTRAST SPORT-TECH)    */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-[#0B0F19] via-[#070A12] to-[#070A12] border-b border-slate-800/80">
        {/* Ambient background lighting */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/40 px-4 py-1.5 text-xs font-bold text-cyan-300 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Not Just an Event. It&apos;s an Experience.</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
                  MOVE{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    DIFFERENT.
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-200 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Satu platform untuk menemukan event, membeli tiket, memberikan dukungan, dan mengelola kompetisi.
                </p>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#event-terbaru"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black px-6 py-4 text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all hover:scale-105 active:scale-95"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Jelajahi Event</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-6 py-4 text-sm border border-slate-700 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Lihat Cara Kerja</span>
                </a>

                <Link
                  href="/tournament-hub"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-black px-5 py-4 text-sm shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>3D Tournament Hub</span>
                </Link>
              </div>

              {/* Trust Metric Chips in High-Contrast Dark Glass */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="p-3.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-700/80 shadow-md text-center">
                  <div className="text-xl font-black text-cyan-400 font-mono">0 Detik</div>
                  <div className="text-[10px] text-slate-300 font-medium">Rekap Juri Live</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-700/80 shadow-md text-center">
                  <div className="text-xl font-black text-white font-mono">100% Sah</div>
                  <div className="text-[10px] text-slate-300 font-medium">Bebas Manipulasi</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-700/80 shadow-md text-center">
                  <div className="text-xl font-black text-emerald-400 font-mono">Anti-Bot</div>
                  <div className="text-[10px] text-slate-300 font-medium">QRIS E-Voting</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-700/80 shadow-md text-center">
                  <div className="text-xl font-black text-amber-400 font-mono">Satu Atap</div>
                  <div className="text-[10px] text-slate-300 font-medium">Production Vendor</div>
                </div>
              </div>
            </div>

            {/* Right Mascot Column — ANTY MASCOT WITH 3D STAGE & GLOW */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-cyan-500/25 via-emerald-500/20 to-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Interactive Speech Bubble */}
              <div className="w-full max-w-sm mb-2 z-20">
                <div className="relative rounded-2xl bg-slate-900/95 backdrop-blur-md p-3.5 shadow-2xl border border-cyan-500/50 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                        ANTY • Maskot Resmi CETAS
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Move Different
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug">
                    &ldquo;Halo sobat turnamen! 👋 Mau beli tiket, dukung tim di bilik vote, atau pantau rekap juri? Semua serba cepat bareng Anty!&rdquo;
                  </p>
                  <div className="absolute -bottom-1.5 left-12 w-3 h-3 bg-slate-900 border-b border-r border-cyan-500/50 transform rotate-45 pointer-events-none" />
                </div>
              </div>

              {/* The Mascot with Floating Animation */}
              <div className="relative z-10 animate-mascot-float">
                <AntmanMascot pose="waving" size={480} />
              </div>

              {/* WhatsApp Quick Chat */}
              <div className="w-full max-w-xs mt-1 z-20">
                <a
                  href="https://wa.me/6281584682345?text=Halo%20Anty%2C%20saya%20mau%20konsultasi%20layanan%20CETAS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>Tanya Anty di WhatsApp (24/7)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. EVENT & VOTE HORIZONTAL CAROUSEL (PERSIS KAYA GAMBAR 2)     */}
      {/* ============================================================== */}
      <section id="event-terbaru" className="py-16 sm:py-24 bg-[#070A12] border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header with Mode Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 px-3.5 py-1 text-xs font-bold border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pusat Turnamen & Bilik Suara Publik</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {sliderMode === "score" ? "Event & Live Scoring" : "Bilik E-Voting Turnamen"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Gulir kartu event di bawah untuk melihat live scoreboard, membeli tiket resmi, atau memberikan suara vote favorit secara realtime.
              </p>
            </div>

            {/* Slider Mode Switcher: Scoring vs Voting */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 p-1.5">
              <button
                type="button"
                onClick={() => setSliderMode("score")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  sliderMode === "score"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Live Scoring</span>
              </button>
              <button
                type="button"
                onClick={() => setSliderMode("vote")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  sliderMode === "vote"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Vote className="h-3.5 w-3.5" />
                <span>E-Voting Live</span>
              </button>
            </div>
          </div>

          {/* Horizontal Coverflow Slider Component */}
          {isLoadingEvents ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400 mb-3" />
              <span>Memuat kartu event interaktif...</span>
            </div>
          ) : (
            <CetasHorizontalSlider events={eventsList} mode={sliderMode} />
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SERVICE SECTION — 4 LAYANAN CETAS (DARK SPORT-TECH)         */}
      {/* ============================================================== */}
      <section id="layanan" className="py-16 sm:py-24 bg-[#0B0F19]/90 border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 text-cyan-300 px-3.5 py-1 text-xs font-bold border border-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ekosistem Turnamen Terintegrasi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Empat Pilar Layanan CETAS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dari pengadaan tiket, bilik suara publik, perlengkapan panggung rigging, hingga engine rekap juri resmi tanpa kompromi.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${svc.accentBg} ${svc.accentText} border ${svc.accentBorder} transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                        {svc.badge}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                        {svc.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-0.5">
                        {svc.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  {/* CTA Link */}
                  <div className="pt-6">
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:underline"
                    >
                      <span>Buka Layanan</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. STATISTICS SECTION (SPORT-TECH COUNTERS)                    */}
      {/* ============================================================== */}
      <section className="py-16 bg-[#070A12] text-white relative overflow-hidden border-b border-slate-800/80">
        <div className="pointer-events-none absolute -bottom-10 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono">
                {totalEventsCount > 0 ? `${totalEventsCount}+` : "24+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Event Terselenggara</p>
              <p className="text-[10px] text-slate-400">Skala Daerah & Nasional</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
                {totalTeamsCount > 0 ? `${totalTeamsCount}+` : "1.200+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Tim & Kontingen</p>
              <p className="text-[10px] text-slate-400">SD, SMP, SMA, & Purna</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-cyan-300 font-mono">
                0 Detik
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Rekapitulasi Juri</p>
              <p className="text-[10px] text-slate-400">Real-time Zero-Touch Engine</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Sah & Terverifikasi</p>
              <p className="text-[10px] text-slate-400">HMAC QR & Berita Acara Juri</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. LEGAL & BANTUAN SECTION (PERSIS KAYA GAMBAR 1 DARI USER)     */}
      {/* ============================================================== */}
      <section id="bantuan" className="py-16 sm:py-20 bg-[#0B0F19]/80 border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-400 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All Systems Operational • Uptime 99.9%</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pusat Bantuan & Jaminan Legalitas CETAS
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                Transparansi, keamanan transaksi, dan perlindungan data peserta adalah komitmen utama kami.
              </p>
            </div>

            <a
              href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20butuh%20bantuan%20terkait%20event."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Hubungi Helpdesk 24/7</span>
            </a>
          </div>

          {/* Quick FAQ / Help Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <HelpCircle className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">FAQ (Tanya Jawab)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Panduan lengkap cara pembelian tiket QR, registrasi tim, dan penggunaan aplikasi juri.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">Paket & Harga</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skema sewa sistem scoring, gate scanner, sound system line-array, dan videotron LED.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Users className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">Testimoni Pelatih & Juri</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ulasan kepuasan dewan juri nasional dan pelatih kontingen terhadap kecepatan 0 detik CETAS.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">Refund & Garansi</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jaminan pengembalian dana 100% apabila event dibatalkan oleh pihak penyelenggara resmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. TENTANG CETAS SECTION                                       */}
      {/* ============================================================== */}
      <section id="tentang" className="py-16 sm:py-24 bg-[#070A12]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-[#0B0F19]/90 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                  Tentang Platform CETAS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Mengapa Kami Memilih &ldquo;MOVE DIFFERENT&rdquo;?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Kompetisi dan acara modern tidak lagi bisa dikelola dengan cara konvensional yang rawan sengketa, manipulasi nilai, dan antrean tiket berantakan. CETAS hadir untuk menyatukan seluruh siklus hidup turnamen — mulai dari pendaftaran kontingen, penjualan tiket anti-duplikasi, voting publik via QRIS, penilaian dewan juri tanpa jeda, hingga peralatan panggung konser — dalam satu ekosistem digital yang kokoh dan berkesan.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Transparansi 100% Dewan Hakim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Gate Scanner Terenkripsi HMAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Layanan Alat Panggung Profesional</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-base font-black text-white">Ingin Berkolaborasi?</h4>
                <p className="text-xs text-slate-300">
                  Gunakan CETAS untuk turnamen sekolah, kompetisi baris-berbaris, atau festival musik Anda.
                </p>
                <Link
                  href="/ajukan-event"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black py-3 text-xs shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                >
                  <span>Daftarkan Event Anda</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
