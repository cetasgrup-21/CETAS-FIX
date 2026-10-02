"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Clock,
  UserCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Printer,
  Search,
  Monitor,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

interface JudgeCategory {
  id: string;
  name: string;
  judgeName: string;
  maxPoints: number;
  criteria: {
    id: string;
    name: string;
    interval: number;
    peak: number;
    score: number;
  }[];
}

interface ParticipantScore {
  drawNumber: number;
  schoolName: string;
  teamName: string;
  level: "SMA" | "SMP" | "PURNA";
  pbbScore: number;
  variasiScore: number;
  dantonScore: number;
  kostumScore: number;
  penaltyTime: number;
  penaltyBoundary: number;
  totalScore: number;
  rank: number;
  awardTitle?: string;
  isLocked: boolean;
}

const INITIAL_PARTICIPANTS: ParticipantScore[] = [
  {
    drawNumber: 1,
    schoolName: "SMA Negeri 1 Jakarta",
    teamName: "Pasukan Garuda Sakti",
    level: "SMA",
    pbbScore: 945,
    variasiScore: 960,
    dantonScore: 935,
    kostumScore: 950,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3790,
    rank: 1,
    awardTitle: "Juara Umum 1 & Piala Bergilir",
    isLocked: true,
  },
  {
    drawNumber: 2,
    schoolName: "SMK Taruna Bhakti Depok",
    teamName: "Cakra Wibawa Nusantara",
    level: "SMA",
    pbbScore: 920,
    variasiScore: 945,
    dantonScore: 910,
    kostumScore: 930,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3705,
    rank: 2,
    awardTitle: "Juara Umum 2",
    isLocked: true,
  },
  {
    drawNumber: 3,
    schoolName: "SMP Negeri 2 Bandung",
    teamName: "Satria Muda Siliwangi",
    level: "SMP",
    pbbScore: 895,
    variasiScore: 920,
    dantonScore: 890,
    kostumScore: 910,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3615,
    rank: 3,
    awardTitle: "Juara Umum 3",
    isLocked: true,
  },
  {
    drawNumber: 4,
    schoolName: "SMA Bintang Nusantara",
    teamName: "Laskar Adhi Pratama",
    level: "SMA",
    pbbScore: 880,
    variasiScore: 905,
    dantonScore: 870,
    kostumScore: 895,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3550,
    rank: 4,
    awardTitle: "Juara Harapan 1",
    isLocked: false,
  },
  {
    drawNumber: 5,
    schoolName: "SMA Negeri 8 Jakarta",
    teamName: "Bhayangkara Delapan",
    level: "SMA",
    pbbScore: 865,
    variasiScore: 890,
    dantonScore: 855,
    kostumScore: 880,
    penaltyTime: 20,
    penaltyBoundary: 10,
    totalScore: 3460,
    rank: 5,
    awardTitle: "Juara Harapan 2",
    isLocked: false,
  },
];

export default function CetasScorePage() {
  const [activeMode, setActiveMode] = useState<
    "overview" | "judge" | "timer" | "rekap" | "display" | "print"
  >("overview");

  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "SMA" | "SMP">("ALL");
  const [participants, setParticipants] = useState<ParticipantScore[]>(INITIAL_PARTICIPANTS);

  // Judge Sheet State
  const [selectedJudgeCategory, setSelectedJudgeCategory] = useState<string>("pos-1");
  const [selectedDrawNumber, setSelectedDrawNumber] = useState<number>(1);
  const [judgeScores, setJudgeScores] = useState<Record<string, number>>({
    "crit-1": 95,
    "crit-2": 93,
    "crit-3": 96,
    "crit-4": 94,
    "crit-5": 97,
  });

  // Timer Arena State
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [boundaryPenalties, setBoundaryPenalties] = useState<number>(0);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentParticipant =
    participants.find((p) => p.drawNumber === selectedDrawNumber) || participants[0];

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-slate-800 pb-28 selection:bg-purple-600 selection:text-white">
      {/* 1. CETAS SCORE TOP BRANDING BAR */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-[#1e1135] to-purple-900 text-white pt-10 pb-12 border-b border-purple-800/40 shadow-lg">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                <Image
                  src="/logo/cetas_score_logo.png"
                  alt="CETAS SCORE"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  CETAS.SCORE • Competition Scoring System
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Sistem Rekapitulasi & Penilaian Juri Digital
                </h1>
                <p className="text-xs text-purple-200/80">
                  Event Aktif: <strong>LKBB Pandawa Jaya Nusantara 2026</strong> • GOR Soemantri Brodjonegoro
                </p>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode("display")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-900/30 transition"
              >
                <Monitor className="h-4 w-4" />
                Layar Videotron
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("print")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition"
              >
                <Printer className="h-4 w-4" />
                Cetak Berita Acara F4
              </button>
            </div>
          </div>

          {/* Mode Switcher Nav Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveMode("overview")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "overview"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <FileText className="h-4 w-4" />
              Dashboard Lomba
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("judge")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "judge"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Award className="h-4 w-4" />
              Input Penilaian Juri (Tablet)
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("timer")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "timer"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Clock className="h-4 w-4" />
              Timer Arena & Pinalti
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("rekap")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "rekap"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Rekapitulasi & Penentuan Juara
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("display")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "display"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Layar Display Videotron
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("print")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                activeMode === "print"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Printer className="h-4 w-4" />
              Format Cetak F4 Landscape
            </button>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT BASED ON ACTIVE MODE */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* OVERVIEW DASHBOARD */}
        {activeMode === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Total Kontingen</div>
                <div className="text-3xl font-black text-slate-900 mt-1">24 Regu</div>
                <div className="text-xs text-purple-700 font-semibold mt-1">SMP, SMA & Purna</div>
              </div>
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Dewan Juri Bertugas</div>
                <div className="text-3xl font-black text-purple-700 mt-1">4 Pos Juri</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">✓ Terhubung Tablet Live</div>
              </div>
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Status Rekapitulasi</div>
                <div className="text-3xl font-black text-emerald-600 mt-1">0 Detik</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Kalkulasi Otomatis</div>
              </div>
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Keamanan Nilai</div>
                <div className="text-3xl font-black text-indigo-700 mt-1">HMAC SHA-256</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Kunci Nilai Juri Sah</div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveMode("judge")}
                className="cursor-pointer rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Penilaian Juri Digital</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Formulir penilaian juri interaktif dengan interval 2-6 dan 10 pilihan tombol nilai integer presisi.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <span>Buka Form Penilaian Juri</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div
                onClick={() => setActiveMode("timer")}
                className="cursor-pointer rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Timer Lapangan & Pinalti</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Stopwatch countdown 10 menit dengan indikator warna visual dan penghitung otomatis pinalti garis.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <span>Buka Timer Arena</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div
                onClick={() => setActiveMode("rekap")}
                className="cursor-pointer rounded-3xl border border-purple-100 bg-white p-6 shadow-xs purple-glow-hover transition space-y-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Rekapitulasi & Juara</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tabel peringkat otomatis lengkap dengan tie breaker, lock/unlock hasil juri, dan cetak berita acara resmi.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>Buka Lembar Rekapitulasi</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: JUDGE SCORING SHEET (TABLET PENILAIAN JURI) */}
        {activeMode === "judge" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Judge & Participant Control */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Konfigurasi Juri & Kontingen
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pos Penilaian Juri:
                  </label>
                  <select
                    value={selectedJudgeCategory}
                    onChange={(e) => setSelectedJudgeCategory(e.target.value)}
                    className="w-full rounded-xl bg-purple-50/60 border border-purple-200 p-2.5 text-xs font-bold text-purple-900 outline-none"
                  >
                    <option value="pos-1">Pos 1: PBB Murni (Mayor TNI Suryadi)</option>
                    <option value="pos-2">Pos 2: Variasi & Formasi (Kapten Kav. Hendro)</option>
                    <option value="pos-3">Pos 3: Komandan Peleton / Danton (Lettu Agus)</option>
                    <option value="pos-4">Pos 4: Kostum & Kerapihan (Dra. Ratna)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kontingen yang Tampil:
                  </label>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {participants.map((p) => (
                      <button
                        key={p.drawNumber}
                        type="button"
                        onClick={() => setSelectedDrawNumber(p.drawNumber)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition ${
                          selectedDrawNumber === p.drawNumber
                            ? "bg-purple-600 text-white font-black shadow-xs"
                            : "bg-slate-50 hover:bg-purple-50 text-slate-700"
                        }`}
                      >
                        <span className="font-mono font-bold">
                          #{p.drawNumber < 10 ? `0${p.drawNumber}` : p.drawNumber}
                        </span>
                        <span className="truncate max-w-[150px]">{p.schoolName}</span>
                        {p.isLocked && <Lock className="h-3 w-3 shrink-0 opacity-70" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs space-y-1">
                  <div className="text-slate-500">Kontingen Terpilih:</div>
                  <div className="font-black text-slate-900">{currentParticipant.schoolName}</div>
                  <div className="text-[11px] text-purple-700 font-bold">&ldquo;{currentParticipant.teamName}&rdquo;</div>
                </div>
              </div>
            </div>

            {/* Right: Scoring Criteria Matrix */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Lembar Penilaian Pos 1: PBB Murni
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pilih nilai integer untuk setiap materi gerakan baris berbaris
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    Mode Juri Aktif
                  </span>
                </div>

                {/* 5 Criteria Items with 10 Interval Buttons */}
                <div className="space-y-4">
                  {[
                    { id: "crit-1", title: "1. Kerapihan Barisan & Sikap Sempurna", interval: 3, peak: 100 },
                    { id: "crit-2", title: "2. Gerakan di Tempat (Hadap Kanan/Kiri, Balik Kanan)", interval: 4, peak: 100 },
                    { id: "crit-3", title: "3. Gerakan Berjalan (Langkah Biasa & Langkah Tegap)", interval: 5, peak: 100 },
                    { id: "crit-4", title: "4. Perubahan Arah & Haluan", interval: 4, peak: 100 },
                    { id: "crit-5", title: "5. Penghormatan & Periksa Kerapihan", interval: 3, peak: 100 },
                  ].map((crit) => {
                    // Generate 10 buttons using Cetas Score Engine math
                    const options = Array.from({ length: 10 }, (_, i) => crit.peak - crit.interval * (9 - i));
                    const selectedVal = judgeScores[crit.id] || crit.peak;

                    return (
                      <div key={crit.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{crit.title}</span>
                          <span className="text-sm font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-lg">
                            Nilai: {selectedVal}
                          </span>
                        </div>

                        {/* 10 Option Buttons (Kurang to Sangat Baik) */}
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                          {options.map((val, idx) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setJudgeScores({ ...judgeScores, [crit.id]: val })}
                              className={`py-2 rounded-xl text-xs font-bold transition ${
                                selectedVal === val
                                  ? "bg-purple-700 text-white shadow-xs font-black scale-105"
                                  : "bg-white text-slate-700 hover:bg-purple-100/70 border border-purple-100"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal & Submit */}
                <div className="pt-4 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Subtotal Nilai Pos Juri 1:</div>
                    <div className="text-2xl font-black text-purple-700">
                      {Object.values(judgeScores).reduce((a, b) => a + b, 0)} Poin
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert("Nilai juri berhasil dikunci dan disubmit ke mesin rekapitulasi CETAS!")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition active:scale-95"
                  >
                    <Lock className="h-4 w-4" />
                    Kunci & Kirim Nilai Juri Terenkripsi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMER ARENA & PINALTI */}
        {activeMode === "timer" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-3xl border border-purple-100 bg-white p-8 sm:p-12 shadow-md text-center space-y-6">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200 uppercase tracking-wider mb-2">
                  Timer Arena Lomba • Batas Waktu 10:00 Menit
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {currentParticipant.schoolName} ({currentParticipant.teamName})
                </h3>
              </div>

              {/* Digital LED Clock View */}
              <div
                className={`py-8 px-6 rounded-3xl font-mono text-6xl sm:text-8xl font-black tracking-widest transition-all ${
                  timerSeconds > 180
                    ? "bg-slate-950 text-emerald-400 shadow-inner"
                    : timerSeconds > 60
                    ? "bg-slate-950 text-amber-400 shadow-inner animate-pulse"
                    : "bg-slate-950 text-rose-500 shadow-inner animate-bounce"
                }`}
              >
                {formatTimer(timerSeconds)}
              </div>

              {/* Timer Controls */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition ${
                    isTimerRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {isTimerRunning ? "Pause Timer" : "Mulai Waktu Tampil"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(600);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset 10:00
                </button>

                <button
                  type="button"
                  onClick={() => setTimerSeconds((prev) => prev + 30)}
                  className="px-4 py-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm transition"
                >
                  +30 Detik
                </button>
              </div>

              {/* Lapangan Line Boundary Penalty */}
              <div className="pt-6 border-t border-purple-50 max-w-md mx-auto space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  Pelanggaran Garis Lapangan / Garuk (Pinalti -10 Poin):
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setBoundaryPenalties((prev) => Math.max(0, prev - 1))}
                    className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-lg"
                  >
                    -
                  </button>
                  <span className="font-mono text-2xl font-black text-purple-900 w-16 text-center">
                    {boundaryPenalties}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBoundaryPenalties((prev) => prev + 1)}
                    className="h-10 w-10 rounded-xl bg-purple-100 hover:bg-purple-200 font-black text-purple-800 flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Pengurangan Pinalti: <strong className="text-rose-600">-{boundaryPenalties * 10} Poin</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REKAPITULASI KESELURUHAN & PENENTUAN JUARA */}
        {activeMode === "rekap" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Lembar Rekapitulasi & Penentuan Juara (Live)
                </h3>
                <p className="text-xs text-slate-500">
                  Perangkingan otomatis dewan juri dengan sistem tie breaker sesuai juklak resmi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Seluruh lembar nilai berhasil dikunci!")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <Lock className="h-4 w-4" />
                  Kunci Semua Hasil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("print")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Berita Acara F4
                </button>
              </div>
            </div>

            {/* Rekap Table */}
            <div className="rounded-3xl border border-purple-100 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-purple-50/80 border-b border-purple-100 text-purple-900">
                      <th className="p-3.5 font-bold">Rank</th>
                      <th className="p-3.5 font-bold">No. Undian</th>
                      <th className="p-3.5 font-bold">Sekolah & Pasukan</th>
                      <th className="p-3.5 font-bold">PBB Murni</th>
                      <th className="p-3.5 font-bold">Variasi</th>
                      <th className="p-3.5 font-bold">Danton</th>
                      <th className="p-3.5 font-bold">Kostum</th>
                      <th className="p-3.5 font-bold">Pinalti</th>
                      <th className="p-3.5 font-black text-purple-800">Total Nilai</th>
                      <th className="p-3.5 font-bold">Keterangan Juara</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {participants.map((p) => (
                      <tr key={p.drawNumber} className="hover:bg-purple-50/30 transition">
                        <td className="p-3.5">
                          <span
                            className={`h-7 w-7 rounded-lg font-black text-xs inline-flex items-center justify-center ${
                              p.rank === 1
                                ? "bg-amber-400 text-amber-950 font-black"
                                : p.rank === 2
                                ? "bg-slate-200 text-slate-800"
                                : p.rank === 3
                                ? "bg-amber-700/20 text-amber-900"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            #{p.rank}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">#{p.drawNumber}</td>
                        <td className="p-3.5">
                          <div className="font-black text-slate-900">{p.schoolName}</div>
                          <div className="text-[11px] text-purple-700 font-bold">&ldquo;{p.teamName}&rdquo;</div>
                        </td>
                        <td className="p-3.5 font-bold">{p.pbbScore}</td>
                        <td className="p-3.5 font-bold">{p.variasiScore}</td>
                        <td className="p-3.5 font-bold">{p.dantonScore}</td>
                        <td className="p-3.5 font-bold">{p.kostumScore}</td>
                        <td className="p-3.5 font-bold text-rose-600">
                          {p.penaltyTime + p.penaltyBoundary > 0 ? `-${p.penaltyTime + p.penaltyBoundary}` : "0"}
                        </td>
                        <td className="p-3.5 font-black text-purple-700 text-sm">
                          {p.totalScore}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[11px]">
                            {p.awardTitle}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAYAR DISPLAY VIDEOTRON PANGGUNG (BIG SCREEN) */}
        {activeMode === "display" && (
          <div className="rounded-3xl border border-purple-900 bg-slate-950 text-white p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/cetas_score_logo.png"
                  alt="CETAS SCORE"
                  width={40}
                  height={40}
                  className="object-contain bg-white rounded-xl p-1"
                />
                <div>
                  <h3 className="text-xl font-black text-white tracking-wider">
                    CETAS SCORE • LIVE LEADERBOARD ARENA
                  </h3>
                  <p className="text-xs text-purple-300">
                    Rekapitulasi Dewan Juri Resmi • LKBB Pandawa Jaya Nusantara 2026
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                Live Broadcast Videotron
              </span>
            </div>

            {/* Ranking Podium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {participants.slice(0, 3).map((item, idx) => (
                <div
                  key={item.schoolName}
                  className={`p-6 rounded-3xl border relative transition-transform ${
                    idx === 0
                      ? "bg-gradient-to-b from-amber-500/20 to-purple-950 border-amber-400/60 scale-105 shadow-xl shadow-amber-500/10"
                      : idx === 1
                      ? "bg-purple-950/60 border-purple-600/40"
                      : "bg-purple-950/40 border-purple-700/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-2xl font-black h-10 w-10 rounded-2xl flex items-center justify-center ${
                        idx === 0
                          ? "bg-amber-400 text-amber-950"
                          : idx === 1
                          ? "bg-slate-300 text-slate-900"
                          : "bg-amber-800 text-amber-100"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-purple-200">
                      No. Undian #{item.drawNumber}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white leading-tight">
                    {item.schoolName}
                  </h4>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">
                    &ldquo;{item.teamName}&rdquo;
                  </p>

                  <div className="mt-4 pt-3 border-t border-purple-800/40 flex items-baseline justify-between">
                    <span className="text-xs text-purple-300">Total Skor Juri:</span>
                    <span className="text-2xl font-black text-amber-300">
                      {item.totalScore} Poin
                    </span>
                  </div>

                  <div className="mt-2 text-center py-1 rounded-xl bg-white/10 text-[10px] font-black uppercase text-purple-200">
                    {item.awardTitle}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setActiveMode("overview")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard Lomba
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: FORMAT CETAK F4 LANDSCAPE (BERITA ACARA RESMI) */}
        {activeMode === "print" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Preview Format F4 Landscape • Berita Acara Rekapitulasi Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Format cetak standar lomba dengan kop panitia dan tanda tangan sah dewan juri
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition"
              >
                <Printer className="h-4 w-4" />
                Cetak Lembar F4 Sekarang
              </button>
            </div>

            {/* F4 Printable Paper Mockup */}
            <div className="rounded-2xl border-2 border-slate-300 bg-white p-8 sm:p-12 shadow-xl space-y-6 text-slate-900 text-xs">
              {/* Kop Surat Panitia */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-base font-black tracking-wider uppercase">
                  BERITA ACARA REKAPITULASI PENILAIAN DEWAN JURI
                </div>
                <div className="text-sm font-bold uppercase">
                  LOMBA KETANGKASAN BARIS BERBARIS (LKBB) PANDAWA JAYA NUSANTARA 2026
                </div>
                <div className="text-[11px] text-slate-600">
                  Diverifikasi dan Disahkan melalui Sistem Digital CETAS SCORE Engine
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-[11px] text-left border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 border border-slate-300 text-center">Rank</th>
                    <th className="p-2 border border-slate-300 text-center">Undian</th>
                    <th className="p-2 border border-slate-300">Nama Sekolah & Pasukan</th>
                    <th className="p-2 border border-slate-300 text-center">Pos 1 (PBB)</th>
                    <th className="p-2 border border-slate-300 text-center">Pos 2 (Variasi)</th>
                    <th className="p-2 border border-slate-300 text-center">Pos 3 (Danton)</th>
                    <th className="p-2 border border-slate-300 text-center">Pos 4 (Kostum)</th>
                    <th className="p-2 border border-slate-300 text-center">Pinalti</th>
                    <th className="p-2 border border-slate-300 text-center font-bold">Total Nilai</th>
                    <th className="p-2 border border-slate-300">Predikat Juara</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.drawNumber} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-bold">#{p.rank}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">#{p.drawNumber}</td>
                      <td className="p-2 border border-slate-300">
                        <strong>{p.schoolName}</strong> ({p.teamName})
                      </td>
                      <td className="p-2 border border-slate-300 text-center">{p.pbbScore}</td>
                      <td className="p-2 border border-slate-300 text-center">{p.variasiScore}</td>
                      <td className="p-2 border border-slate-300 text-center">{p.dantonScore}</td>
                      <td className="p-2 border border-slate-300 text-center">{p.kostumScore}</td>
                      <td className="p-2 border border-slate-300 text-center text-rose-600">
                        {p.penaltyTime + p.penaltyBoundary > 0 ? `-${p.penaltyTime + p.penaltyBoundary}` : "0"}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{p.totalScore}</td>
                      <td className="p-2 border border-slate-300 font-bold">{p.awardTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tanda Tangan Dewan Juri */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[11px]">
                <div className="space-y-12">
                  <div>Koordinator Pos 1 (PBB Murni)</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Mayor TNI Suryadi</div>
                </div>
                <div className="space-y-12">
                  <div>Koordinator Pos 2 (Variasi)</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Kapten Kav. Hendro</div>
                </div>
                <div className="space-y-12">
                  <div>Ketua Dewan Hakim Juri</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Drs. H. Mulyadi, M.Pd</div>
                </div>
              </div>

              <div className="text-center pt-4 text-[9px] text-slate-400">
                Dokumen resmi ini dicetak langsung dari sistem CETAS.SCORE pada tanggal {new Date().toLocaleDateString("id-ID")} dengan enkripsi hash HMAC SHA-256.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
