"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket,
  Award,
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
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import { CetasOpeningExperience } from "@/components/opening/cetas-opening-experience";
import { UnifiedEvent, getStoredEvents, saveStoredEvents } from "@/lib/events-unified-data";
import { formatRupiah } from "@/lib/utils";

export default function HomePage() {
  const [eventsList, setEventsList] = useState<UnifiedEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  useEffect(() => {
    // 1. Initial cached local events
    const cached = getStoredEvents();
    if (cached && cached.length > 0) {
      setEventsList(cached);
      setIsLoadingEvents(false);
    }

    // 2. Fetch live events from real backend API
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

  // Filter events by category if selected
  const filteredEvents = eventsList.filter((ev) => {
    if (selectedCategoryFilter === "ALL") return true;
    return ev.category?.toUpperCase() === selectedCategoryFilter.toUpperCase();
  });

  // Calculate real platform statistics
  const totalEventsCount = eventsList.length;
  const totalTeamsCount = eventsList.reduce((sum, ev) => sum + (ev.lkbbTeams?.length || 0), 0);
  const totalTicketTiersCount = eventsList.reduce((sum, ev) => sum + (ev.tiers?.length || 0), 0);

  const services = [
    {
      id: "tiket",
      title: "CETAS.TIKET",
      subtitle: "Pembelian tiket dan registrasi event.",
      description:
        "Sistem ticketing anti-fraud dengan dynamic HMAC QR Code. Validasi instan di gerbang gate masuk via Mobile Scanner serta verifikasi pembayaran otomatis.",
      icon: Ticket,
      href: "/events",
      accentBg: "bg-blue-50",
      accentBorder: "border-blue-200",
      accentText: "text-[#0066FF]",
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
      accentBg: "bg-cyan-50",
      accentBorder: "border-cyan-200",
      accentText: "text-cyan-600",
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
      accentBg: "bg-amber-50",
      accentBorder: "border-amber-200",
      accentText: "text-amber-600",
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
      accentBg: "bg-emerald-50",
      accentBorder: "border-emerald-200",
      accentText: "text-emerald-600",
      badge: "Rekap Juri 0 Detik",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#071A3D] selection:bg-[#0066FF] selection:text-white">
      {/* ============================================================== */}
      {/* 0. WEBSITE OPENING & LOGIN REVEAL EXPERIENCE                   */}
      {/* ============================================================== */}
      <CetasOpeningExperience />

      {/* ============================================================== */}
      {/* 1. HERO SECTION — MOVE DIFFERENT                               */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-blue-50/60 via-white to-white">
        {/* Ambient background light circles */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-400/15 via-cyan-400/10 to-transparent blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 border border-blue-200 px-4 py-1.5 text-xs font-bold text-[#0066FF] shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Not Just an Event. It&apos;s an Experience.</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#071A3D] tracking-tight leading-[1.08]">
                  MOVE <span className="text-[#0066FF]">DIFFERENT.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl font-normal text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Satu platform untuk menemukan event, membeli tiket, memberikan dukungan, dan mengelola kompetisi.
                </p>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#event-terbaru"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold px-6 py-4 text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Jelajahi Event</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071A3D] font-bold px-6 py-4 text-sm border border-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="h-4 w-4 text-[#0066FF]" />
                  <span>Lihat Cara Kerja</span>
                </a>

                <Link
                  href="/tournament-hub"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold px-5 py-4 text-sm transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span>3D Tournament Hub</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <div className="text-xl font-black text-[#0066FF]">0 Detik</div>
                  <div className="text-[10px] text-slate-500 font-medium">Rekap Juri Live</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <div className="text-xl font-black text-[#071A3D]">100% Sah</div>
                  <div className="text-[10px] text-slate-500 font-medium">Bebas Manipulasi</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <div className="text-xl font-black text-[#0066FF]">Anti-Bot</div>
                  <div className="text-[10px] text-slate-500 font-medium">QRIS E-Voting</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <div className="text-xl font-black text-[#071A3D]">Satu Atap</div>
                  <div className="text-[10px] text-slate-500 font-medium">Production Vendor</div>
                </div>
              </div>
            </div>

            {/* Right Mascot Column — ANTY MASCOT AS MAIN CHARACTER */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Mascot Stage Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] bg-gradient-to-tr from-blue-600/20 via-cyan-400/25 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Speech Bubble */}
              <div className="w-full max-w-sm mb-2 z-20">
                <div className="relative rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-blue-200 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0066FF]">
                        ANTY • Maskot Resmi CETAS
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200">
                      Move Different
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    &ldquo;Halo sobat turnamen! 👋 Mau beli tiket, dukung tim di bilik vote, atau pantau rekap juri? Semua serba cepat bareng Anty!&rdquo;
                  </p>
                  <div className="absolute -bottom-1.5 left-12 w-3 h-3 bg-white border-b border-r border-blue-200 transform rotate-45 pointer-events-none" />
                </div>
              </div>

              {/* The Ant Mascot with Floating Animation */}
              <div className="relative z-10 animate-mascot-float">
                <AntmanMascot pose="waving" size={480} />
              </div>

              {/* WhatsApp Quick Chat Underneath Mascot */}
              <div className="w-full max-w-xs mt-1 z-20">
                <a
                  href="https://wa.me/6281584682345?text=Halo%20Anty%2C%20saya%20mau%20konsultasi%20layanan%20CETAS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-transform active:scale-95 group"
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
      {/* 2. SERVICE SECTION — 4 LAYANAN CETAS                           */}
      {/* ============================================================== */}
      <section id="layanan" className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-[#0066FF] px-3.5 py-1 text-xs font-bold border border-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ekosistem Turnamen Terintegrasi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#071A3D] tracking-tight">
              Empat Pilar Layanan CETAS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
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
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#0066FF] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${svc.accentBg} ${svc.accentText} border ${svc.accentBorder} transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {svc.badge}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D] group-hover:text-[#0066FF] transition-colors">
                        {svc.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {svc.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  {/* CTA Link */}
                  <div className="pt-6">
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066FF] group-hover:underline"
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
      {/* 3. EVENT TERBARU — CAROUSEL / HORIZONTAL CARDS                 */}
      {/* ============================================================== */}
      <section id="event-terbaru" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3.5 py-1 text-xs font-bold border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Event & Kompetisi Terjadwal</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#071A3D] tracking-tight">
                Event Terbaru di CETAS
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Temukan turnamen bergengsi, dukung kontingen sekolah, dan dapatkan e-tiket resmi berkeamanan tinggi.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["ALL", "LKBB", "KONSER", "SEMINAR"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedCategoryFilter === cat
                      ? "bg-[#0066FF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "ALL" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Event Cards Grid */}
          {isLoadingEvents ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#0066FF] mb-3" />
              <span>Memuat daftar event resmi CETAS...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center space-y-3">
              <Calendar className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Event Aktif</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Daftarkan event atau kompetisi Anda sekarang untuk mulai menjual tiket dan mengelola penilaian juri di platform CETAS.
              </p>
              <Link
                href="/ajukan-event"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0066FF] text-white font-bold px-4 py-2 text-xs shadow-sm"
              >
                <span>Ajukan Event Sekarang</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const lowestPrice =
                  ev.tiers && ev.tiers.length > 0
                    ? Math.min(...ev.tiers.map((t) => t.price))
                    : 0;

                return (
                  <div
                    key={ev.id}
                    className="group rounded-3xl border border-slate-200 hover:border-[#0066FF] bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Event Banner Image */}
                      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.bannerUrl || "/logo/cetas_score_logo.png"}
                          alt={ev.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                        {/* Category & Status Pill */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="rounded-full bg-blue-600/90 backdrop-blur-md px-3 py-0.5 text-[10px] font-black uppercase text-white shadow">
                            {ev.category || "TURNAMEN"}
                          </span>
                          <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                            OPEN
                          </span>
                        </div>

                        {/* Title overlay on bottom of banner */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-base font-black text-white truncate drop-shadow-md">
                            {ev.title}
                          </h3>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#0066FF] shrink-0" />
                            <span className="font-semibold">{ev.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#0066FF] shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                          {ev.lkbbTeams && ev.lkbbTeams.length > 0 && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>{ev.lkbbTeams.length} Kontingen Peserta Terdaftar</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Tiket Mulai
                        </span>
                        <span className="text-sm font-black text-[#0066FF] font-mono">
                          {lowestPrice > 0 ? formatRupiah(lowestPrice) : "Gratis / Terbuka"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/events?id=${ev.id}`}
                          className="rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold px-3.5 py-2 text-xs shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                        >
                          <span>Tiket</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/vote?eventId=${ev.id}`}
                          title="Bilik Vote Peserta"
                          className="rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold px-2.5 py-2 text-xs border border-cyan-200 transition-colors"
                        >
                          <Award className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. STATISTICS SECTION                                          */}
      {/* ============================================================== */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -bottom-10 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#0066FF] font-mono">
                {totalEventsCount > 0 ? `${totalEventsCount}+` : "24+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-300">Event Terselenggara</p>
              <p className="text-[10px] text-slate-500">Skala Daerah & Nasional</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono">
                {totalTeamsCount > 0 ? `${totalTeamsCount}+` : "1.200+"}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-300">Tim & Kontingen</p>
              <p className="text-[10px] text-slate-500">SD, SMP, SMA, & Purna</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
                0 Detik
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-300">Rekapitulasi Juri</p>
              <p className="text-[10px] text-slate-500">Real-time Zero-Touch Engine</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-300">Sah & Terverifikasi</p>
              <p className="text-[10px] text-slate-500">HMAC QR & Berita Acara Juri</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. TENTANG CETAS SECTION                                       */}
      {/* ============================================================== */}
      <section id="tentang" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-8 sm:p-12 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#0066FF]">
                  Tentang Platform CETAS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#071A3D] tracking-tight">
                  Mengapa Kami Memilih &ldquo;MOVE DIFFERENT&rdquo;?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Kompetisi dan acara modern tidak lagi bisa dikelola dengan cara konvensional yang rawan sengketa, manipulasi nilai, dan antrean tiket berantakan. CETAS hadir untuk menyatukan seluruh siklus hidup turnamen — mulai dari pendaftaran kontingen, penjualan tiket anti-duplikasi, voting publik via QRIS, penilaian dewan juri tanpa jeda, hingga peralatan panggung konser — dalam satu ekosistem digital yang kokoh dan berkesan.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-[#071A3D]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Transparansi 100% Dewan Hakim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Gate Scanner Terenkripsi HMAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Layanan Alat Panggung Profesional</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-blue-200/80 shadow-md text-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0066FF]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-base font-black text-[#071A3D]">Ingin Berkolaborasi?</h4>
                <p className="text-xs text-slate-500">
                  Gunakan CETAS untuk turnamen sekolah, kompetisi baris-berbaris, atau festival musik Anda.
                </p>
                <Link
                  href="/ajukan-event"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold py-3 text-xs shadow-md shadow-blue-500/25 transition-transform active:scale-95"
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
