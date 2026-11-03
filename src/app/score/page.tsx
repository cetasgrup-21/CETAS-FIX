"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  Award,
  BarChart3,
  Trophy,
  Clock,
  MonitorPlay,
  ArrowRight,
  Sparkles,
  Lock,
  ExternalLink,
  CheckCircle2,
  Activity,
  History,
  FileCheck,
  ChevronRight,
  Radio,
  ArrowLeft,
} from "lucide-react";
import { getStoredAdminSession, canAccessScoreRekapAndJuara, AdminUser } from "@/lib/admin-auth";

interface ActiveEventInfo {
  id: string;
  name: string;
  location?: string | null;
  totalPoints?: number;
  inputMode?: string;
  status?: string;
}

export default function CetasScorePortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeEvent, setActiveEvent] = useState<ActiveEventInfo | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    // 1. Cek sesi admin dari localStorage dan cookie
    const stored = getStoredAdminSession();
    if (stored) {
      setCurrentUser(stored);
      setIsCheckingAuth(false);
    } else {
      // Coba cek endpoint sesi /api/auth/me
      fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data?.authenticated && data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsCheckingAuth(false);
        });
    }

    // 2. Muat informasi event aktif untuk CETAS.SCORE
    fetch("/api/event", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setActiveEvent({
            id: data.id,
            name: data.name || "Event Resmi CETAS",
            location: data.location || "Arena Turnamen",
            totalPoints: data.totalPoints || 1000,
            inputMode: data.inputMode || "DIGITAL",
            status: data.status || "ACTIVE",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvent(false));
  }, []);

  // Modul Operasional CETAS.SCORE
  const modules = [
    {
      id: "rubrik-setup",
      title: "Admin Scoring & Master Rubrik",
      subtitle: "Setup Kategori, Bobot % & Materi",
      description:
        "Konfigurasi tingkatan lomba, kategori juri, subkategori, bobot persentase, rubrik materi LKBB, dan sinkronisasi nomor undian peserta.",
      href: "/admin/score",
      badge: "SETUP ENGINE",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      icon: Sliders,
      actionText: "Buka Konfigurasi Rubrik",
      accentBorder: "hover:border-amber-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    {
      id: "admin-dashboard",
      title: "Dashboard Master Scoring",
      subtitle: "Pusat Kendali Operasional Nilai",
      description:
        "Monitoring status penilaian per kategori, pergantian event aktif, tinjau ringkasan nilai kontingen, dan navigasi data score.",
      href: "/admin/dashboard",
      badge: "KONTROL UTAMA",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      icon: LayoutDashboard,
      actionText: "Buka Dashboard Score",
      accentBorder: "hover:border-cyan-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "penugasan-juri",
      title: "Penugasan Dewan Juri & PIN",
      subtitle: "Plotting Pos Juri & Kode Akses",
      description:
        "Tugaskan dewan hakim ke pos penilaian kategori tertentu, kelola generator PIN unik terenkripsi, dan isolasi akses bilik.",
      href: "/admin/judges",
      badge: "SECURITY & ACCESS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      icon: UserCheck,
      actionText: "Kelola Penugasan Juri",
      accentBorder: "hover:border-purple-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    {
      id: "bilik-juri",
      title: "Bilik Penilaian Juri (Tablet)",
      subtitle: "Input Nilai Realtime Pos 1 - 4",
      description:
        "Antarmuka tablet digital ramah sentuh untuk input nilai realtime dewan juri lapangan dengan validasi batas interval nilai.",
      href: "/judge",
      badge: "LIVE JUDGING",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
      icon: Award,
      actionText: "Masuk Bilik Juri",
      accentBorder: "hover:border-indigo-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "rekap-live",
      title: "Audit & Rekapitulasi Nilai",
      subtitle: "Matriks Skor Realtime 0 Detik",
      description:
        "Matriks akumulasi nilai seketika bebas human-error matematika, tracking pengisian pos juri, dan filter kategori lomba.",
      href: "/rekap",
      badge: "LIVE REKAP 0s",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
      icon: BarChart3,
      actionText: "Buka Rekapitulasi Live",
      accentBorder: "hover:border-emerald-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "penentuan-juara",
      title: "Penentuan Juara & Berita Acara",
      subtitle: "Auto Tie-Breaker & Cetak F4 Sah",
      description:
        "Kalkulasi juara umum/kategori, tie-breaker otomatis berdasarkan juknis LKBB resmi, dan cetak form Berita Acara sah F4 landscape.",
      href: "/penentuan-juara",
      badge: "HASIL RESMI & F4",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
      icon: Trophy,
      actionText: "Buka Penentuan Juara",
      accentBorder: "hover:border-yellow-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]",
      iconBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    },
    {
      id: "official-timer",
      title: "Official Timer Arena",
      subtitle: "Stopwatch Panggung & Penalti Waktu",
      description:
        "Stopwatch hitung mundur presisi tinggi untuk penampilan kontingen di arena lapangan, terhubung dengan deteksi penalti pinalti waktu.",
      href: "/timer",
      badge: "ARENA STOPWATCH",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
      icon: Clock,
      actionText: "Buka Arena Timer",
      accentBorder: "hover:border-rose-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    {
      id: "videotron-display",
      title: "Display Videotron Panggung",
      subtitle: "Layar Skor Visual Arena LED",
      description:
        "Tampilan visual scoreboard fullscreen untuk proyektor atau videotron LED panggung utama tanpa perlu login juri.",
      href: "/display",
      badge: "ARENA SCREEN",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/40",
      icon: MonitorPlay,
      actionText: "Tampilkan Videotron",
      accentBorder: "hover:border-sky-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]",
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    },
    {
      id: "audit-changes",
      title: "Audit Perubahan Nilai & Review",
      subtitle: "Log Revisi Nilai & Verifikasi Kertas",
      description:
        "Catatan riwayat audit persetujuan koreksi nilai juri dengan alasan terverifikasi dan verifikasi lembar nilai manual/kertas.",
      href: "/admin/score-changes",
      badge: "AUDIT TRAIL",
      badgeColor: "bg-slate-400/20 text-slate-300 border-slate-400/40",
      icon: History,
      actionText: "Buka Log Audit Nilai",
      accentBorder: "hover:border-slate-400/60",
      accentGlow: "group-hover:shadow-[0_0_30px_rgba(148,163,184,0.2)]",
      iconBg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    },
  ];

  // ==============================================================
  // TAMPILAN JIKA BELUM LOGIN / PENGUNJUNG PUBLIK (SECURITY GATE)
  // ==============================================================
  const isAuthorized = currentUser && canAccessScoreRekapAndJuara(currentUser.role);

  if (!isCheckingAuth && !isAuthorized) {
    return (
      <main className="min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/15 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 w-[600px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
          {/* Brand Logo & Lock Badge */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-[#0B1C3D] to-[#040C1F] p-4 border border-blue-500/40 shadow-2xl shadow-blue-500/20 flex items-center justify-center">
              <Image
                src="/logo/cetas_score_logo.png"
                alt="CETAS SCORE Official"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
              <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border-2 border-[#06132E]">
                <Lock className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-4 py-1.5 text-xs font-bold text-amber-300 font-mono">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>AKSES INTERNAL TERPROTEKSI • PANITIA &amp; JURI</span>
            </div>
          </div>

          {/* Heading & Penjelasan */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              CETAS.SCORE Command Engine
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Modul otomasi penjurian, rekapitulasi nilai LKBB zero-touch, dan pencetakan berita acara resmi telah dialihkan ke lingkungan tertutup internal panitia.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan login dengan akun Administrator Turnamen atau Dewan Juri resmi untuk mengakses seluruh instrumen penilaian.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#00D9FF] to-[#126BDE] hover:from-[#00C2E5] hover:to-[#0A4BB3] text-slate-950 font-black px-7 py-3.5 text-xs tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono"
            >
              <Lock className="h-4 w-4" />
              <span>MASUK PORTAL ADMIN CETAS</span>
            </Link>

            <Link
              href="/tournament-hub"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B1C3D] hover:bg-[#0E2450] border border-blue-500/40 text-cyan-300 font-bold px-6 py-3.5 text-xs transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Lihat Tournament Hub 3D (Publik)</span>
            </Link>
          </div>

          {/* Return Home Link */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Beranda Utama</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==============================================================
  // TAMPILAN ADMIN RESMI: CETAS.SCORE COMMAND CENTER (FUTURISTIK)
  // ==============================================================
  return (
    <main className="min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E] pb-24">
      {/* Glow ambient background elements */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1C3D] hover:bg-[#122A5A] border border-blue-500/30 px-3.5 py-2 text-xs font-bold text-cyan-300 transition-all hover:scale-105"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Master Admin</span>
            </Link>

            <span className="text-slate-600">/</span>

            <span className="text-xs font-mono font-bold text-slate-300">
              CETAS.SCORE Engine
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold text-emerald-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Operasional 0 Detik</span>
            </div>

            <Link
              href="/tournament-hub"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Hub 3D</span>
            </Link>
          </div>
        </div>

        {/* HERO BANNER: CETAS.SCORE COMMAND CENTER */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0B1C3D] via-[#071738] to-[#040C1F] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-blue-600/10 to-transparent blur-2xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-mono font-black text-cyan-300 uppercase tracking-widest">
                  <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" />
                  <span>CETAS.SCORE • OFFICIAL ADJUDICATION ENGINE</span>
                </div>

                {activeEvent && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-xs font-bold text-emerald-300 font-mono">
                    <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                    <span>EVENT: {activeEvent.name}</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                  Competition Scoring System
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  Sistem otomasi rekapitulasi nilai juri zero-touch, rubrik penilaian multi-kategori, penugasan PIN terenkripsi, timer arena presisi, dan kalkulasi berita acara digital F4 instan.
                </p>
              </div>

              {/* Fast Spec Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 text-center">
                  <p className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Rekap Realtime</p>
                  <p className="text-lg font-black text-white mt-0.5">0 Detik</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 text-center">
                  <p className="text-[10px] font-mono font-bold text-emerald-300 uppercase">Integritas Skor</p>
                  <p className="text-lg font-black text-white mt-0.5">Zero-Touch</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 text-center">
                  <p className="text-[10px] font-mono font-bold text-amber-300 uppercase">Berita Acara</p>
                  <p className="text-lg font-black text-white mt-0.5">Format F4 Sah</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 text-center">
                  <p className="text-[10px] font-mono font-bold text-purple-300 uppercase">Pos Juri Tablet</p>
                  <p className="text-lg font-black text-white mt-0.5">Pos 1 s/d 4</p>
                </div>
              </div>
            </div>

            {/* Official Logo Banner */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-blue-400/30 bg-[#06132E]/90 p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative h-44 w-full flex items-center justify-center p-2">
                <Image
                  src="/logo/cetas_score_logo.png"
                  alt="CETAS SCORE Official"
                  width={220}
                  height={220}
                  priority
                  className="h-full w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,217,255,0.3)] transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 text-center">
                <span className="text-[11px] font-black tracking-widest text-[#00D9FF] uppercase font-mono">
                  ADJUDICATION CORE v2.6
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Tersinkronisasi otomatis dengan Tournament Hub 3D
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* OPERATIONAL MODULES GRID (9 CORE INSTRUMENTS)                 */}
        {/* ============================================================== */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display flex items-center gap-2">
                <span>Modul Operasional Lapangan CETAS.SCORE</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Pilih modul kerja berikut untuk memulai persiapan, penjurian lapangan, rekapitulasi nilai, hingga pencetakan piala.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className={`group relative rounded-3xl border border-blue-500/30 bg-[#0B1C3D] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 ${mod.accentBorder} ${mod.accentGlow} flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${mod.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black font-mono tracking-wider ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs font-semibold text-cyan-200/80 mt-0.5">
                        {mod.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {mod.description}
                    </p>
                  </div>

                  {/* Action Link Row */}
                  <div className="mt-6 pt-4 border-t border-blue-500/20 flex items-center justify-between text-xs font-bold text-cyan-300 group-hover:text-white transition-colors">
                    <span>{mod.actionText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#00D9FF]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Security & System Info Footer Note */}
        <section className="rounded-2xl border border-blue-500/20 bg-[#0B1C3D]/60 p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Seluruh kalkulasi nilai diaudit secara terisolasi. Rekapitulasi nilai terkunci dengan checksum HMAC dan berita acara sah dapat diverifikasi via QR Code.
            </span>
          </div>

          <Link
            href="/admin"
            className="text-cyan-300 hover:text-white font-bold underline shrink-0 transition"
          >
            Kembali ke Portal Master Admin →
          </Link>
        </section>
      </div>
    </main>
  );
}
