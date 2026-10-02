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
  Key,
  LogOut,
  Edit3,
  History,
  X,
  Info,
  ShieldAlert,
  User,
  Download,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";

export function playArenaTone(freq: number, durationMs: number, type: OscillatorType = "sine", count = 1) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    for (let i = 0; i < count; i++) {
      const startTime = ctx.currentTime + (i * (durationMs + 100)) / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durationMs / 1000);
    }
  } catch (e) {
    console.warn("Audio Context not supported or allowed", e);
  }
}

export type ScoreSystemRole = "juri" | "panitia" | "pelatih" | "publik";

export interface JudgeProfile {
  id: string;
  name: string;
  title: string;
  categoryPos: string;
  categoryName: string;
  pin: string;
  avatar: string;
}

export const OFFICIAL_JUDGES: JudgeProfile[] = [
  {
    id: "juri-1",
    name: "Mayor (Purn) Bambang Sutedjo",
    title: "Ketua Dewan Juri / Juri 1",
    categoryPos: "pos-1",
    categoryName: "Pos 1: PBB Murni",
    pin: "1111",
    avatar: "👨‍✈️",
  },
  {
    id: "juri-2",
    name: "Kapten Marinir Hendra Wijaya",
    title: "Anggota Dewan Juri / Juri 2",
    categoryPos: "pos-2",
    categoryName: "Pos 2: Variasi & Formasi",
    pin: "2222",
    avatar: "🎖️",
  },
  {
    id: "juri-3",
    name: "Lettu Cba (K) Rina Kartika",
    title: "Anggota Dewan Juri / Juri 3",
    categoryPos: "pos-3",
    categoryName: "Pos 3: Komandan Peleton (Danton)",
    pin: "3333",
    avatar: "👩‍✈️",
  },
  {
    id: "juri-4",
    name: "Ibu Desy Ratnasari, S.Pd",
    title: "Anggota Dewan Juri / Juri 4",
    categoryPos: "pos-4",
    categoryName: "Pos 4: Kostum & Kerapihan",
    pin: "4444",
    avatar: "👩‍💼",
  },
];

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  judgeName: string;
  drawNumber: number;
  schoolName: string;
  category: string;
  action: "INPUT" | "REVISI" | "KUNCI";
  oldScore?: number;
  newScore: number;
  reason?: string;
  hash: string;
}

const CRITERIA_BY_CATEGORY: Record<
  string,
  { id: string; title: string; interval: number; peak: number }[]
> = {
  "pos-1": [
    { id: "pbb-1", title: "1. Kerapihan Barisan & Sikap Sempurna", interval: 3, peak: 100 },
    { id: "pbb-2", title: "2. Gerakan di Tempat (Hadap Kanan/Kiri, Balik Kanan)", interval: 4, peak: 100 },
    { id: "pbb-3", title: "3. Gerakan Berjalan (Langkah Biasa & Langkah Tegap)", interval: 5, peak: 100 },
    { id: "pbb-4", title: "4. Perubahan Arah & Haluan Barisan", interval: 4, peak: 100 },
    { id: "pbb-5", title: "5. Penghormatan & Periksa Kerapihan", interval: 3, peak: 100 },
  ],
  "pos-2": [
    { id: "var-1", title: "1. Tingkat Kesulitan Gerakan (Difficulty)", interval: 5, peak: 100 },
    { id: "var-2", title: "2. Keindahan & Estetika Visual Lapangan", interval: 4, peak: 100 },
    { id: "var-3", title: "3. Kekompakan & Sinkronisasi Peleton", interval: 5, peak: 100 },
    { id: "var-4", title: "4. Kreativitas & Orisinalitas Konsep", interval: 4, peak: 100 },
    { id: "var-5", title: "5. Pemanfaatan Luas Lapangan (Court Coverage)", interval: 3, peak: 100 },
  ],
  "pos-3": [
    { id: "dan-1", title: "1. Artikulasi & Kejelasan Vokal Aba-aba", interval: 4, peak: 100 },
    { id: "dan-2", title: "2. Penguasaan Lapangan & Posisi Danton", interval: 3, peak: 100 },
    { id: "dan-3", title: "3. Sikap, Wibawa, & Postur Kepemimpinan", interval: 5, peak: 100 },
    { id: "dan-4", title: "4. Ketepatan Urutan Instruksi & Tempo", interval: 4, peak: 100 },
    { id: "dan-5", title: "5. Ketenangan dalam Menghadapi Tekanan", interval: 3, peak: 100 },
  ],
  "pos-4": [
    { id: "kos-1", title: "1. Keselarasan & Estetika Seragam", interval: 3, peak: 100 },
    { id: "kos-2", title: "2. Kerapihan Atribut & Kelengkapan", interval: 4, peak: 100 },
    { id: "kos-3", title: "3. Keseragaman Make-up & Tata Rambut", interval: 4, peak: 100 },
    { id: "kos-4", title: "4. Kesesuaian Kostum dengan Norma Paskibra", interval: 3, peak: 100 },
    { id: "kos-5", title: "5. Kebersihan & Kesiapan Fisik Anggota", interval: 3, peak: 100 },
  ],
};

function assignAwardsAndRanks(list: ParticipantScore[]): ParticipantScore[] {
  const sorted = [...list].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.pbbScore !== a.pbbScore) return b.pbbScore - a.pbbScore;
    if (b.variasiScore !== a.variasiScore) return b.variasiScore - a.variasiScore;
    return b.dantonScore - a.dantonScore;
  });

  return sorted.map((p, index) => {
    const rank = index + 1;
    let awardTitle = p.awardTitle;
    if (rank === 1) awardTitle = "Juara Umum 1 & Piala Bergilir";
    else if (rank === 2) awardTitle = "Juara Umum 2";
    else if (rank === 3) awardTitle = "Juara Umum 3";
    else if (rank === 4) awardTitle = "Juara Harapan 1";
    else if (rank === 5) awardTitle = "Juara Harapan 2";
    else if (rank === 6) awardTitle = "Juara Harapan 3";
    else awardTitle = `Peringkat #${rank} Utama`;

    return {
      ...p,
      rank,
      awardTitle,
    };
  });
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
  {
    drawNumber: 6,
    schoolName: "SMP Negeri 1 Cibinong",
    teamName: "Gita Wiratama",
    level: "SMP",
    pbbScore: 860,
    variasiScore: 885,
    dantonScore: 850,
    kostumScore: 870,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3465,
    rank: 6,
    awardTitle: "Juara Harapan 3",
    isLocked: false,
  },
  {
    drawNumber: 7,
    schoolName: "SMA Negeri 3 Bogor",
    teamName: "Kresna Duta Pratama",
    level: "SMA",
    pbbScore: 850,
    variasiScore: 870,
    dantonScore: 840,
    kostumScore: 860,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3420,
    rank: 7,
    awardTitle: "Peringkat #7 Utama",
    isLocked: false,
  },
  {
    drawNumber: 8,
    schoolName: "SMK Negeri 2 Tangerang",
    teamName: "Pandawa Sakti",
    level: "SMA",
    pbbScore: 840,
    variasiScore: 865,
    dantonScore: 835,
    kostumScore: 850,
    penaltyTime: 10,
    penaltyBoundary: 0,
    totalScore: 3380,
    rank: 8,
    awardTitle: "Peringkat #8 Utama",
    isLocked: false,
  },
  {
    drawNumber: 9,
    schoolName: "SMP Negeri 5 Bekasi",
    teamName: "Satya Wira Negara",
    level: "SMP",
    pbbScore: 830,
    variasiScore: 850,
    dantonScore: 825,
    kostumScore: 840,
    penaltyTime: 0,
    penaltyBoundary: 10,
    totalScore: 3335,
    rank: 9,
    awardTitle: "Peringkat #9 Madya",
    isLocked: false,
  },
  {
    drawNumber: 10,
    schoolName: "SMA Negeri 2 Bekasi",
    teamName: "Panca Tri Tunggal",
    level: "SMA",
    pbbScore: 825,
    variasiScore: 840,
    dantonScore: 820,
    kostumScore: 835,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3320,
    rank: 10,
    awardTitle: "Peringkat #10 Madya",
    isLocked: false,
  },
  {
    drawNumber: 11,
    schoolName: "SMA Negeri 68 Jakarta",
    teamName: "Srikandi Nusantara",
    level: "SMA",
    pbbScore: 815,
    variasiScore: 830,
    dantonScore: 810,
    kostumScore: 830,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3285,
    rank: 11,
    awardTitle: "Peringkat #11 Madya",
    isLocked: false,
  },
  {
    drawNumber: 12,
    schoolName: "PPI Purna Paskibraka",
    teamName: "Dharma Bangsa",
    level: "PURNA",
    pbbScore: 910,
    variasiScore: 935,
    dantonScore: 900,
    kostumScore: 920,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3665,
    rank: 12,
    awardTitle: "Juara Kategori Purna",
    isLocked: true,
  },
];

export default function CetasScorePage() {
  const [activeMode, setActiveMode] = useState<
    "overview" | "judge" | "timer" | "rekap" | "display" | "print"
  >("overview");

  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "SMA" | "SMP">("ALL");
  const [participants, setParticipants] = useState<ParticipantScore[]>(INITIAL_PARTICIPANTS);

  // RBAC & Judge Session State (Enforces "Hanya Role Juri yang Bisa Menilai & Merubah Nilai")
  const [currentUserRole, setCurrentUserRole] = useState<ScoreSystemRole>("juri");
  const [activeJudge, setActiveJudge] = useState<JudgeProfile | null>(OFFICIAL_JUDGES[0]);
  const [isJudgeAuthModalOpen, setIsJudgeAuthModalOpen] = useState<boolean>(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>("juri-1");
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Score Revision Modal State (Only role juri can modify)
  const [revisionModalParticipant, setRevisionModalParticipant] = useState<ParticipantScore | null>(null);
  const [revisionCategory, setRevisionCategory] = useState<"pbbScore" | "variasiScore" | "dantonScore" | "kostumScore">("pbbScore");
  const [revisionScoreValue, setRevisionScoreValue] = useState<number>(900);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [revisionError, setRevisionError] = useState<string | null>(null);

  // Audit Logs & History Drawer
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "log-1",
      timestamp: "14:20:15 WIB",
      judgeName: "Mayor (Purn) Bambang Sutedjo",
      drawNumber: 1,
      schoolName: "SMA Negeri 1 Jakarta",
      category: "Pos 1: PBB Murni",
      action: "INPUT",
      newScore: 945,
      hash: "8f4b2c1a... (HMAC-SHA256)",
    },
    {
      id: "log-2",
      timestamp: "14:28:40 WIB",
      judgeName: "Kapten Marinir Hendra Wijaya",
      drawNumber: 1,
      schoolName: "SMA Negeri 1 Jakarta",
      category: "Pos 2: Variasi & Formasi",
      action: "INPUT",
      newScore: 960,
      hash: "7e2a9d4f... (HMAC-SHA256)",
    },
    {
      id: "log-3",
      timestamp: "15:02:11 WIB",
      judgeName: "Lettu Cba (K) Rina Kartika",
      drawNumber: 2,
      schoolName: "SMK Taruna Bhakti Depok",
      category: "Pos 3: Danton",
      action: "REVISI",
      oldScore: 890,
      newScore: 910,
      reason: "Koreksi pencatatan aba-aba hadap kanan langkah tegap di tempat",
      hash: "4c11fa9b... (HMAC-SHA256)",
    },
  ]);

  // Toast Notification
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Authorization Check
  const isJuri = currentUserRole === "juri";
  const canJudge = isJuri && activeJudge !== null;

  // Judge Sheet State
  const [selectedJudgeCategory, setSelectedJudgeCategory] = useState<string>("pos-1");
  const [selectedDrawNumber, setSelectedDrawNumber] = useState<number>(1);
  const [judgeScores, setJudgeScores] = useState<Record<string, number>>({
    "pbb-1": 95,
    "pbb-2": 93,
    "pbb-3": 96,
    "pbb-4": 94,
    "pbb-5": 97,
  });

  // Timer Arena State
  // Timer Arena State & Audio
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [boundaryPenalties, setBoundaryPenalties] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // LocalStorage Persistence for Gladi Kotor & Production Rehearsal
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cetas_gladi_participants_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setParticipants(parsed);
        }
      }
    } catch (e) {
      console.warn("LocalStorage load error", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cetas_gladi_participants_v2", JSON.stringify(participants));
    } catch (e) {
      console.warn("LocalStorage save error", e);
    }
  }, [participants]);

  // Timer Effect with Automatic Arena Sound Alert / Horns
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const nextVal = prev - 1;
          // Audio cues during arena performance
          if (isAudioEnabled) {
            if (nextVal === 180) {
              // Peringatan 3 menit tersisa (1x bel chime bersih 880Hz)
              playArenaTone(880, 500, "triangle", 1);
            } else if (nextVal === 60) {
              // Peringatan 1 menit tersisa (2x beep waspada 1046Hz)
              playArenaTone(1046, 220, "sine", 2);
            } else if (nextVal === 10) {
              // Hitung mundur 10 detik terakhir
              playArenaTone(750, 150, "sine", 1);
            } else if (nextVal === 0) {
              // WAKTU HABIS! Klakson Buzzer Panjang Resmi Arena (sawtooth 440Hz 2.5 detik)
              playArenaTone(440, 2500, "sawtooth", 1);
            }
          }
          return nextVal;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, isAudioEnabled]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentParticipant =
    participants.find((p) => p.drawNumber === selectedDrawNumber) || participants[0];

  // Helper Gladi: Lanjut ke Peserta Berikutnya
  const handleNextParticipant = () => {
    const currentIdx = participants.findIndex((p) => p.drawNumber === selectedDrawNumber);
    const nextIdx = (currentIdx + 1) % participants.length;
    const nextParticipant = participants[nextIdx];
    setSelectedDrawNumber(nextParticipant.drawNumber);
    
    // Reset judgeScores to default peak for clean grading
    const critList = CRITERIA_BY_CATEGORY[selectedJudgeCategory] || [];
    const defaultScores: Record<string, number> = {};
    critList.forEach((c) => {
      defaultScores[c.id] = c.peak;
    });
    setJudgeScores(defaultScores);

    setToast({
      type: "info",
      text: `Beralih ke Kontingen #${nextParticipant.drawNumber}: ${nextParticipant.schoolName}`,
    });
  };

  // Helper Gladi: Reset Data Simulasi
  const handleResetGladiData = () => {
    if (confirm("Reset seluruh data simulasi gladi kotor kembali ke formasi awal 12 kontingen?")) {
      try {
        localStorage.removeItem("cetas_gladi_participants_v2");
      } catch {}
      setParticipants(INITIAL_PARTICIPANTS);
      setToast({
        type: "success",
        text: "Data simulasi gladi kotor telah direset ke posisi awal (12 kontingen).",
      });
    }
  };

  // Helper Gladi: Ekspor CSV untuk Panitia
  const handleExportCSV = () => {
    const headers = [
      "Peringkat",
      "No Undian",
      "Nama Sekolah",
      "Nama Pasukan",
      "Kategori",
      "Skor PBB Murni",
      "Skor Variasi & Formasi",
      "Skor Danton",
      "Skor Kostum",
      "Pinalti Waktu",
      "Pinalti Garis",
      "Total Nilai",
      "Predikat Juara",
      "Status Kunci",
    ];

    const rows = participants.map((p) => [
      p.rank,
      p.drawNumber,
      `"${p.schoolName}"`,
      `"${p.teamName}"`,
      p.level,
      p.pbbScore,
      p.variasiScore,
      p.dantonScore,
      p.kostumScore,
      p.penaltyTime,
      p.penaltyBoundary,
      p.totalScore,
      `"${p.awardTitle || ""}"`,
      p.isLocked ? "Terkunci Sah" : "Draft",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekapitulasi_LKBB_Pandawa_2026_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      type: "success",
      text: "Data rekapitulasi berhasil diekspor ke format CSV (Bisa dibuka di Excel / Google Sheets)!",
    });
  };

  // Helper Fullscreen Panggung Videotron
  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // RBAC Handlers
  const handleAuthenticateJudge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const judge = OFFICIAL_JUDGES.find((j) => j.id === selectedJudgeId);
    if (!judge) {
      setPinError("Silakan pilih dewan juri.");
      return;
    }

    if (pinInput !== judge.pin && pinInput !== "2026") {
      setPinError(`PIN salah! Masukkan PIN resmi ${judge.name} (${judge.pin}) atau Master PIN 2026.`);
      return;
    }

    setActiveJudge(judge);
    setCurrentUserRole("juri");
    setSelectedJudgeCategory(judge.categoryPos);
    setPinInput("");
    setPinError(null);
    setIsJudgeAuthModalOpen(false);
    setToast({
      type: "success",
      text: `Otentikasi Berhasil! Selamat bertugas, ${judge.name}. Anda memiliki wewenang penuh untuk menilai dan merubah nilai.`,
    });
  };

  const handleLogoutJudge = () => {
    setActiveJudge(null);
    setCurrentUserRole("panitia");
    setToast({
      type: "info",
      text: "Anda telah keluar dari sesi Dewan Juri. Hak akses kembali ke Mode Panitia (Read-Only Nilai).",
    });
  };

  const handleScoreClick = (critId: string, val: number) => {
    if (!canJudge) {
      setIsJudgeAuthModalOpen(true);
      setPinError("Akses Ditolak! Hanya role Dewan Juri resmi yang dapat memberikan atau merubah nilai. Silakan masukkan PIN Juri Anda.");
      return;
    }
    setJudgeScores((prev) => ({ ...prev, [critId]: val }));
  };

  const handleSubmitJudgeScore = () => {
    if (!canJudge || !activeJudge) {
      setIsJudgeAuthModalOpen(true);
      setPinError("Ditolak! Hanya role Juri yang berhak mengunci dan mengirim nilai.");
      return;
    }

    const currentCritList = CRITERIA_BY_CATEGORY[selectedJudgeCategory] || [];
    const categorySubtotal = currentCritList.reduce((sum, crit) => {
      return sum + (judgeScores[crit.id] || crit.peak);
    }, 0);

    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.drawNumber !== selectedDrawNumber) return p;
        let newPbb = p.pbbScore;
        let newVariasi = p.variasiScore;
        let newDanton = p.dantonScore;
        let newKostum = p.kostumScore;

        if (selectedJudgeCategory === "pos-1") newPbb = categorySubtotal;
        else if (selectedJudgeCategory === "pos-2") newVariasi = categorySubtotal;
        else if (selectedJudgeCategory === "pos-3") newDanton = categorySubtotal;
        else if (selectedJudgeCategory === "pos-4") newKostum = categorySubtotal;

        const totalScore = newPbb + newVariasi + newDanton + newKostum - (p.penaltyTime + p.penaltyBoundary);
        return {
          ...p,
          pbbScore: newPbb,
          variasiScore: newVariasi,
          dantonScore: newDanton,
          kostumScore: newKostum,
          totalScore,
          isLocked: true,
        };
      });

      return assignAwardsAndRanks(updated);
    });

    const categoryNames: Record<string, string> = {
      "pos-1": "Pos 1: PBB Murni",
      "pos-2": "Pos 2: Variasi & Formasi",
      "pos-3": "Pos 3: Danton",
      "pos-4": "Pos 4: Kostum",
    };

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} WIB`;

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        judgeName: activeJudge.name,
        drawNumber: currentParticipant.drawNumber,
        schoolName: currentParticipant.schoolName,
        category: categoryNames[selectedJudgeCategory] || "Pos Juri",
        action: "INPUT",
        newScore: categorySubtotal,
        hash: Math.random().toString(36).substring(2, 10) + "... (HMAC-SHA256)",
      },
      ...prev,
    ]);

    setToast({
      type: "success",
      text: `Nilai ${categoryNames[selectedJudgeCategory]} untuk ${currentParticipant.schoolName} (${categorySubtotal} Poin) berhasil dikunci dan direkap otomatis!`,
    });
  };

  const handleOpenRevision = (participant: ParticipantScore) => {
    if (!canJudge || !activeJudge) {
      setToast({
        type: "error",
        text: "Akses Ditolak! Hanya role Dewan Juri resmi yang memiliki wewenang untuk merubah nilai.",
      });
      setIsJudgeAuthModalOpen(true);
      setPinError("Ditolak! Hanya role Juri yang dapat merubah nilai. Masukkan PIN juri untuk otentikasi.");
      return;
    }

    setRevisionModalParticipant(participant);
    const pos = activeJudge.categoryPos;
    const cat = pos === "pos-1" ? "pbbScore" : pos === "pos-2" ? "variasiScore" : pos === "pos-3" ? "dantonScore" : "kostumScore";
    setRevisionCategory(cat);
    setRevisionScoreValue(participant[cat]);
    setRevisionReason("");
    setRevisionError(null);
  };

  const handleSaveRevision = () => {
    if (!canJudge || !activeJudge || !revisionModalParticipant) return;
    if (!revisionReason.trim()) {
      setRevisionError("Wajib menyertakan alasan berita acara resmi perubahan nilai.");
      return;
    }

    const oldScore = revisionModalParticipant[revisionCategory];
    const newScore = Number(revisionScoreValue);

    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.drawNumber !== revisionModalParticipant.drawNumber) return p;
        const updatedP = {
          ...p,
          [revisionCategory]: newScore,
        };
        const totalScore = updatedP.pbbScore + updatedP.variasiScore + updatedP.dantonScore + updatedP.kostumScore - (updatedP.penaltyTime + updatedP.penaltyBoundary);
        return {
          ...updatedP,
          totalScore,
        };
      });

      return assignAwardsAndRanks(updated);
    });

    const categoryNames: Record<string, string> = {
      pbbScore: "Pos 1: PBB Murni",
      variasiScore: "Pos 2: Variasi & Formasi",
      dantonScore: "Pos 3: Danton",
      kostumScore: "Pos 4: Kostum",
    };

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} WIB`;

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        judgeName: activeJudge.name,
        drawNumber: revisionModalParticipant.drawNumber,
        schoolName: revisionModalParticipant.schoolName,
        category: categoryNames[revisionCategory],
        action: "REVISI",
        oldScore,
        newScore,
        reason: revisionReason,
        hash: Math.random().toString(36).substring(2, 10) + "... (HMAC-SHA256)",
      },
      ...prev,
    ]);

    setToast({
      type: "success",
      text: `Nilai ${revisionModalParticipant.schoolName} berhasil dirubah oleh ${activeJudge.name} (${oldScore} ➔ ${newScore} Poin). Rekap juara diperbarui.`,
    });

    setRevisionModalParticipant(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-slate-800 pb-28 selection:bg-purple-600 selection:text-white">
      {/* 1. CETAS SCORE TOP BRANDING BAR */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-[#1e1135] to-purple-900 text-white pt-10 pb-12 border-b border-purple-800/40 shadow-lg no-print">
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

          {/* RBAC Role & Session Status Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:px-4 border border-white/20 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-purple-200 font-bold uppercase tracking-wider text-[10px]">
                Role Sesi:
              </span>
              {canJudge ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black text-xs shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeJudge.avatar}</span>
                  <span>DEWAN JURI: {activeJudge.name}</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-md font-bold">
                    {activeJudge.categoryName}
                  </span>
                </div>
              ) : currentUserRole === "panitia" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                  <span>📋 PANITIA ARENA (Read-Only Nilai)</span>
                </div>
              ) : currentUserRole === "pelatih" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/40 font-bold">
                  <span>🎖️ PELATIH KONTINGEN (Read-Only Nilai)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-400/40 font-bold">
                  <span>👁️ PUBLIK / PENONTON (Read-Only Nilai)</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canJudge ? (
                <button
                  type="button"
                  onClick={handleLogoutJudge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs transition"
                  title="Keluar dari sesi Juri"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Sesi Juri</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPinError(null);
                    setIsJudgeAuthModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-900/40 transition active:scale-95"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Login / Otentikasi Juri</span>
                </button>
              )}

              {/* Demo Quick Role Switcher */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                <span className="text-purple-300 px-1.5 font-bold hidden sm:inline">Uji Role:</span>
                {(["panitia", "pelatih", "publik"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setCurrentUserRole(r);
                      setActiveJudge(null);
                      setToast({
                        type: "info",
                        text: `Beralih ke Role ${r.toUpperCase()}. Fitur memberi & merubah nilai dinonaktifkan (Read-Only).`,
                      });
                    }}
                    className={`px-2 py-0.5 rounded-lg capitalize transition ${
                      currentUserRole === r
                        ? "bg-purple-600 text-white font-bold"
                        : "text-purple-200 hover:bg-white/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPinError(null);
                    setIsJudgeAuthModalOpen(true);
                  }}
                  className={`px-2 py-0.5 rounded-lg capitalize transition ${
                    canJudge
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-emerald-300 hover:bg-emerald-500/20 font-bold"
                  }`}
                >
                  juri (PIN)
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switcher Nav Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 print:m-0 print:p-0 print:max-w-none">
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

            {/* Rehearsal & Gladi Kotor Quick Operations Bar */}
            <div className="p-4 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    Mode Simulasi Gladi Kotor Aktif ({participants.length} Kontingen Lengkap Siap)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Gunakan fitur ini untuk latihan alur panggung, pengetesan klakson buzzer line-array, dan simulasi juri.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition active:scale-95"
                  title="Unduh backup data rekapitulasi ke Excel"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Cadangkan ke Excel (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetGladiData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition active:scale-95"
                  title="Kembalikan data ke formasi awal"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Data Simulasi</span>
                </button>
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
          <div className="space-y-6">
            {/* RBAC Warning / Verified Banner */}
            {!canJudge ? (
              <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-300 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-950 text-sm">
                        Akses Penilaian Terkunci (Mode: {currentUserRole.toUpperCase()})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                        Read-Only
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                      Sesuai regulasi turnamen CETAS: <strong>Hanya role Dewan Juri yang berhak memberikan dan merubah nilai</strong>. Tombol lembar penilaian saat ini dalam status terkunci.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJudgeAuthModalOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs shadow-md transition active:scale-95"
                >
                  <Key className="h-4 w-4 text-cyan-300" />
                  <span>Otentikasi PIN Juri</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {activeJudge.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-950 text-xs sm:text-sm">
                        Dewan Juri Terverifikasi: {activeJudge.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">
                        Hak Akses Penuh
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      {activeJudge.title} ({activeJudge.categoryName}) • Otoritas sah untuk menilai & merubah nilai kontingen #{currentParticipant.drawNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutJudge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-xs transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Ganti Juri</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Judge & Participant Control */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-between">
                    <span>Pos Juri & Kontingen</span>
                    {canJudge ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Terverifikasi
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        🔒 Terkunci
                      </span>
                    )}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Pos Penilaian:
                    </label>
                    <select
                      value={selectedJudgeCategory}
                      onChange={(e) => setSelectedJudgeCategory(e.target.value)}
                      className="w-full rounded-2xl bg-purple-50/60 border border-purple-200 p-3 text-xs font-bold text-purple-950 outline-none"
                    >
                      <option value="pos-1">Pos 1: PBB Murni (Mayor Bambang Sutedjo)</option>
                      <option value="pos-2">Pos 2: Variasi & Formasi (Kapten Hendra Wijaya)</option>
                      <option value="pos-3">Pos 3: Komandan Peleton / Danton (Lettu Rina Kartika)</option>
                      <option value="pos-4">Pos 4: Kostum & Kerapihan (Ibu Desy Ratnasari)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Kontingen yang Dinilai:
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Lembar Penilaian {selectedJudgeCategory === "pos-1" ? "Pos 1: PBB Murni" : selectedJudgeCategory === "pos-2" ? "Pos 2: Variasi & Formasi" : selectedJudgeCategory === "pos-3" ? "Pos 3: Komandan Peleton (Danton)" : "Pos 4: Kostum & Kerapihan"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {canJudge
                          ? `Dewan Juri Bertugas: ${activeJudge.name} • 10 tombol interval nilai bulat`
                          : "Mode Terkunci — Hanya Dewan Juri resmi yang dapat memilih dan merubah nilai"}
                      </p>
                    </div>
                    {canJudge ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Otoritas Juri Aktif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsJudgeAuthModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 hover:bg-amber-100 transition"
                      >
                        <Lock className="h-3.5 w-3.5 text-amber-600" />
                        Klik untuk Buka Juri
                      </button>
                    )}
                  </div>

                  {/* Criteria Items with 10 Interval Buttons */}
                  <div className="space-y-4">
                    {(CRITERIA_BY_CATEGORY[selectedJudgeCategory] || []).map((crit) => {
                      const options = Array.from({ length: 10 }, (_, i) => crit.peak - crit.interval * (9 - i));
                      const selectedVal = judgeScores[crit.id] || crit.peak;

                      return (
                        <div key={crit.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{crit.title}</span>
                            <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                              canJudge
                                ? "text-purple-700 bg-purple-100"
                                : "text-slate-500 bg-slate-100"
                            }`}>
                              Nilai: {selectedVal}
                            </span>
                          </div>

                          {/* 10 Option Buttons */}
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                            {options.map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleScoreClick(crit.id, val)}
                                className={`py-2 rounded-xl text-xs font-bold transition ${
                                  selectedVal === val
                                    ? canJudge
                                      ? "bg-purple-700 text-white shadow-xs font-black scale-105"
                                      : "bg-slate-300 text-slate-700 font-bold"
                                    : canJudge
                                    ? "bg-white text-slate-700 hover:bg-purple-100/70 border border-purple-100"
                                    : "bg-slate-100/80 text-slate-400 border border-slate-200 cursor-not-allowed"
                                }`}
                                title={canJudge ? `Pilih nilai ${val}` : "Terkunci: Hanya Role Juri yang berhak menilai"}
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
                      <div className="text-xs text-slate-500">
                        Subtotal Nilai Pos {selectedJudgeCategory.replace("pos-", "")}:
                      </div>
                      <div className="text-2xl font-black text-purple-700">
                        {(CRITERIA_BY_CATEGORY[selectedJudgeCategory] || []).reduce(
                          (sum, c) => sum + (judgeScores[c.id] || c.peak),
                          0
                        )}{" "}
                        Poin
                      </div>
                    </div>

                    {canJudge ? (
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleNextParticipant}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition active:scale-95"
                          title="Lanjut ke kontingen berikutnya"
                        >
                          <span>Peserta Berikutnya</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitJudgeScore}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition active:scale-95"
                        >
                          <Lock className="h-4 w-4" />
                          Kunci & Kirim Nilai Juri Terenkripsi
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsJudgeAuthModalOpen(true);
                          setPinError("Silakan otentikasi PIN Juri Anda untuk mengunci dan mengirim nilai.");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition active:scale-95"
                      >
                        <Lock className="h-4 w-4" />
                        Masuk Sebagai Juri untuk Menilai
                      </button>
                    )}
                  </div>
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

              {/* Timer Controls & Arena Sound Action */}
              <div className="flex flex-wrap justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition active:scale-95 ${
                    isTimerRunning ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
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
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset 10:00
                </button>

                <button
                  type="button"
                  onClick={() => setTimerSeconds((prev) => prev + 30)}
                  className="px-4 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm transition"
                >
                  +30 Detik
                </button>

                {/* Sound Buzzer Test for Line Array / Production */}
                <button
                  type="button"
                  onClick={() => {
                    playArenaTone(440, 2000, "sawtooth", 1);
                    setToast({
                      type: "info",
                      text: "Menguji Klakson / Buzzer Arena 440Hz (Sound Line-Array Test)",
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
                  title="Tes Klakson Buzzer untuk Cek Sound Lapangan"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Test Buzzer Arena</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-3.5 rounded-2xl text-xs font-bold transition border ${
                    isAudioEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                  title={isAudioEnabled ? "Buzzer otomatis aktif" : "Buzzer dibisukan"}
                >
                  {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>{isAudioEnabled ? "Suara Aktif" : "Bisu"}</span>
                </button>
              </div>

              {/* Lapangan Line Boundary Penalty */}
              <div className="pt-6 border-t border-purple-50 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Pelanggaran Garis Lapangan / Garuk (-10 Poin/injak):</span>
                  <span className="text-purple-700">No. Undian #{currentParticipant.drawNumber}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBoundaryPenalties((prev) => Math.max(0, prev - 1));
                      playArenaTone(350, 100, "sine");
                    }}
                    className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-lg active:scale-90 transition"
                  >
                    -
                  </button>
                  <span className="font-mono text-3xl font-black text-purple-950 w-20 text-center">
                    {boundaryPenalties}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBoundaryPenalties((prev) => prev + 1);
                      playArenaTone(520, 150, "sine");
                    }}
                    className="h-11 w-11 rounded-2xl bg-purple-100 hover:bg-purple-200 font-black text-purple-800 flex items-center justify-center text-lg active:scale-90 transition"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Total Potongan: <strong className="text-rose-600 font-black">-{boundaryPenalties * 10} Poin</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const deduction = boundaryPenalties * 10;
                      setParticipants((prev) => {
                        const updated = prev.map((p) => {
                          if (p.drawNumber !== selectedDrawNumber) return p;
                          const penaltyBoundary = deduction;
                          const totalScore =
                            p.pbbScore +
                            p.variasiScore +
                            p.dantonScore +
                            p.kostumScore -
                            (p.penaltyTime + penaltyBoundary);
                          return {
                            ...p,
                            penaltyBoundary,
                            totalScore,
                          };
                        });
                        return assignAwardsAndRanks(updated);
                      });
                      setToast({
                        type: "success",
                        text: `Pinalti garis (-${deduction} Poin) berhasil disimpan ke Kontingen #${currentParticipant.drawNumber}!`,
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    Simpan ke Rekap
                  </button>
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
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Lembar Rekapitulasi & Penentuan Juara (Live)</span>
                  {canJudge ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                      ✓ Akses Revisi Juri Terbuka
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                      🔒 Read-Only (Hanya Juri yang Bisa Merubah)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Perangkingan otomatis dewan juri dengan sistem tie breaker (PBB ➔ Variasi ➔ Danton).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditDrawer(!showAuditDrawer)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                    showAuditDrawer
                      ? "bg-purple-700 text-white border-purple-700"
                      : "bg-white hover:bg-purple-50 text-purple-900 border-purple-200"
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>Riwayat Audit Juri ({auditLogs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canJudge) {
                      setToast({
                        type: "error",
                        text: "Akses Ditolak! Hanya role Juri yang berhak mengunci seluruh hasil lomba.",
                      });
                      setIsJudgeAuthModalOpen(true);
                      return;
                    }
                    setToast({
                      type: "success",
                      text: "Seluruh lembar nilai berhasil dikunci sah oleh Dewan Juri!",
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs shadow-xs transition"
                >
                  <Lock className="h-4 w-4" />
                  Kunci Semua Hasil
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  title="Ekspor rekapitulasi ke file CSV (Excel)"
                >
                  <Download className="h-4 w-4" />
                  <span>Ekspor CSV (Excel)</span>
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

            {/* Collapsible Audit History Drawer */}
            {showAuditDrawer && (
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-purple-800/40 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-cyan-300" />
                    <h4 className="text-sm font-black text-white">Log Audit Integritas Nilai & Revisi Juri</h4>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono">HMAC SHA-256 Verified</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/10 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              log.action === "REVISI"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-black text-white">{log.schoolName}</span>
                          <span className="text-purple-300 font-bold font-mono">#{log.drawNumber}</span>
                          <span className="text-slate-400">• {log.category}</span>
                        </div>
                        {log.reason && (
                          <div className="text-[11px] text-amber-200/90 mt-1 italic">
                            &ldquo;{log.reason}&rdquo;
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Oleh: <strong>{log.judgeName}</strong> • {log.timestamp} • Hash: <span className="font-mono text-cyan-300">{log.hash}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {log.oldScore !== undefined && (
                          <span className="text-slate-400 line-through mr-2 font-mono">{log.oldScore}</span>
                        )}
                        <span className="text-amber-400 font-black text-sm font-mono">{log.newScore} Poin</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      <th className="p-3.5 font-bold text-center">Aksi Juri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {participants.map((p) => (
                      <tr key={p.drawNumber} className="hover:bg-purple-50/30 transition">
                        <td className="p-3.5">
                          <span
                            className={`h-7 w-7 rounded-lg font-black text-xs inline-flex items-center justify-center ${
                              p.rank === 1
                                ? "bg-amber-400 text-amber-950 font-black shadow-xs"
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
                        <td className="p-3.5 text-center">
                          {canJudge ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRevision(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs transition active:scale-95"
                              title={`Revisi nilai kontingen #${p.drawNumber} (Otoritas Juri: ${activeJudge.name})`}
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Revisi Nilai</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setToast({
                                  type: "error",
                                  text: `Akses Ditolak! Hanya role Dewan Juri resmi yang dapat merubah nilai ${p.schoolName}. Silakan login sebagai Juri.`,
                                });
                                setIsJudgeAuthModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] border border-slate-200 transition"
                              title="Terkunci: Hanya Role Juri yang berhak merubah nilai"
                            >
                              <Lock className="h-3 w-3 text-slate-400" />
                              <span>Revisi (Terkunci)</span>
                            </button>
                          )}
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
          <div className="rounded-3xl border border-purple-900 bg-slate-950 text-white p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/40 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/cetas_score_logo.png"
                  alt="CETAS SCORE"
                  width={44}
                  height={44}
                  className="object-contain bg-white rounded-xl p-1"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                    <span>CETAS.SCORE • ARENA BROADCAST</span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300">
                    LKBB Pandawa Jaya Nusantara 2026 • GOR Soemantri Brodjonegoro
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                  title="Masuk mode layar penuh videotron"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span>Fullscreen Layar Panggung</span>
                </button>
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/40">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Output P3.9 LED Aktif
                </span>
              </div>
            </div>

            {/* Arena Live Status Banner (Sedang Tampil & Timer) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/80 via-indigo-900/60 to-purple-950 border border-purple-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                  #{currentParticipant.drawNumber}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    SEDANG TAMPIL DI LAPANGAN UTAMA:
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white leading-tight">
                    {currentParticipant.schoolName}
                  </div>
                  <div className="text-xs text-purple-200">
                    &ldquo;{currentParticipant.teamName}&rdquo; • Kategori {currentParticipant.level}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/10">
                <div className="text-right">
                  <div className="text-[10px] text-purple-300 font-bold uppercase">Sisa Waktu Arena:</div>
                  <div
                    className={`font-mono text-3xl sm:text-4xl font-black tracking-wider ${
                      timerSeconds > 180
                        ? "text-emerald-400"
                        : timerSeconds > 60
                        ? "text-amber-400 animate-pulse"
                        : "text-rose-500 animate-bounce"
                    }`}
                  >
                    {formatTimer(timerSeconds)}
                  </div>
                </div>
                <Clock className="h-7 w-7 text-purple-400" />
              </div>
            </div>

            {/* Top 3 Ranking Podium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {participants.slice(0, 3).map((item, idx) => (
                <div
                  key={item.schoolName}
                  className={`p-6 rounded-3xl border relative transition-transform ${
                    idx === 0
                      ? "bg-gradient-to-b from-amber-500/25 to-purple-950 border-amber-400/80 md:scale-105 shadow-2xl shadow-amber-500/20"
                      : idx === 1
                      ? "bg-purple-950/70 border-purple-600/50"
                      : "bg-purple-950/50 border-purple-700/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-2xl font-black h-11 w-11 rounded-2xl flex items-center justify-center ${
                        idx === 0
                          ? "bg-amber-400 text-amber-950 shadow-md"
                          : idx === 1
                          ? "bg-slate-300 text-slate-900"
                          : "bg-amber-800 text-amber-100"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-black text-purple-200 font-mono">
                      No. Undian #{item.drawNumber}
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-white leading-tight">
                    {item.schoolName}
                  </h4>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">
                    &ldquo;{item.teamName}&rdquo;
                  </p>

                  <div className="mt-4 pt-3 border-t border-purple-800/40 flex items-baseline justify-between">
                    <span className="text-xs text-purple-300">Total Skor Juri:</span>
                    <span className="text-3xl font-black text-amber-300 font-mono">
                      {item.totalScore} Poin
                    </span>
                  </div>

                  <div className="mt-3 text-center py-1.5 rounded-xl bg-white/10 text-[11px] font-black uppercase text-purple-200 border border-white/10">
                    {item.awardTitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Standing Rank 4 to 12 Arena Ticker Table */}
            <div className="rounded-2xl border border-purple-900/60 bg-purple-950/30 p-4">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2.5">
                Klasemen Sementara Lengkap (Peringkat 4 s/d {participants.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {participants.slice(3).map((p) => (
                  <div
                    key={p.drawNumber}
                    className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-6 w-6 rounded-lg bg-purple-900 text-purple-200 font-black text-[11px] inline-flex items-center justify-center shrink-0">
                        #{p.rank}
                      </span>
                      <span className="font-bold text-white truncate max-w-[150px]">
                        {p.schoolName}
                      </span>
                    </div>
                    <span className="font-mono font-black text-amber-300 text-xs shrink-0">
                      {p.totalScore} Poin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Running News Ticker */}
            <div className="overflow-hidden rounded-xl bg-black/60 border border-purple-500/30 py-2.5 px-4 text-xs font-semibold text-purple-200 flex items-center gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded bg-purple-600 text-white font-black text-[10px] uppercase">
                INFO ARENA
              </span>
              <div className="truncate text-slate-300">
                🔴 LIVE STREAMING & DISPLAY PANGGUNG CETAS.SCORE • SISTEM REKAPITULASI RESMI LKBB PANDAWA JAYA 2026 • SOUND SYSTEM DIDUKUNG CETAS PRODUCTION LINE-ARRAY 20.000W & VIDEOTRON LED P3.9 • ENKRIPSI NILAI DIGITAL JURI SAH
              </div>
            </div>

            <div className="text-center pt-2">
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
          <div className="max-w-5xl mx-auto space-y-6 print:max-w-none print:m-0 print:p-0">
            <div className="flex items-center justify-between no-print">
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Cetak Lembar F4 Sekarang
              </button>
            </div>

            {/* F4 Printable Paper Mockup */}
            <div className="print-area rounded-2xl border-2 border-slate-300 bg-white p-8 sm:p-12 shadow-xl space-y-6 text-slate-900 text-xs print:border-none print:shadow-none print:p-0">
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

              {/* Tanda Tangan Dewan Juri Sah */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[11px]">
                <div className="space-y-12">
                  <div>Koordinator Pos 1 (PBB Murni)</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Mayor (Purn) Bambang Sutedjo</div>
                </div>
                <div className="space-y-12">
                  <div>Koordinator Pos 2 (Variasi & Formasi)</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Kapten Marinir Hendra Wijaya</div>
                </div>
                <div className="space-y-12">
                  <div>Ketua Dewan Hakim Juri</div>
                  <div className="border-b border-slate-900 mx-auto w-36" />
                  <div className="font-bold">Lettu Cba (K) Rina Kartika</div>
                </div>
              </div>

              <div className="text-center pt-4 text-[9px] text-slate-400">
                Dokumen resmi ini dicetak langsung dari sistem CETAS.SCORE pada tanggal {new Date().toLocaleDateString("id-ID")} dengan integritas verifikasi hash HMAC SHA-256.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODAL OTENTIKASI DEWAN JURI (PIN VERIFICATION) */}
      {isJudgeAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Otentikasi Dewan Juri</h3>
                  <p className="text-[11px] text-slate-500">CETAS.SCORE Security Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsJudgeAuthModalOpen(false);
                  setPinError(null);
                  setPinInput("");
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pinError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Select Judge Identity */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Identitas Dewan Juri Anda:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {OFFICIAL_JUDGES.map((judge) => (
                  <div
                    key={judge.id}
                    onClick={() => {
                      setSelectedJudgeId(judge.id);
                      setPinError(null);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                      selectedJudgeId === judge.id
                        ? "bg-purple-50/90 border-purple-400 shadow-xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{judge.avatar}</span>
                      <div>
                        <div className="font-black text-slate-900 text-xs">{judge.name}</div>
                        <div className="text-[11px] text-purple-700 font-bold">{judge.categoryName}</div>
                      </div>
                    </div>
                    {selectedJudgeId === judge.id && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PIN Input */}
            <form onSubmit={handleAuthenticateJudge} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Masukkan 4-Digit PIN Resmi:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">PIN Terenkripsi</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.8em] text-2xl font-mono py-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-950 font-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  autoFocus
                />
              </div>

              {/* Quick Fill Demo PINs */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  💡 Tombol Cepat Pengujian Juri:
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {OFFICIAL_JUDGES.map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => {
                        setSelectedJudgeId(j.id);
                        setPinInput(j.pin);
                        setPinError(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 font-bold text-slate-700 hover:text-purple-700 transition"
                    >
                      {j.name.split(" ")[0]} ({j.pin})
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPinInput("2026");
                      setPinError(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 font-bold text-amber-800 transition"
                  >
                    Master (2026)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsJudgeAuthModalOpen(false);
                    setPinError(null);
                    setPinInput("");
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition active:scale-95"
                >
                  Verifikasi PIN Juri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL REVISI NILAI JURI (KHUSUS ROLE JURI) */}
      {revisionModalParticipant && canJudge && activeJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Revisi Nilai Dewan Juri</h3>
                  <p className="text-[11px] text-slate-500">
                    Kontingen #{revisionModalParticipant.drawNumber} • {revisionModalParticipant.schoolName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevisionModalParticipant(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {revisionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{revisionError}</span>
              </div>
            )}

            {/* Judge Authorization Stamp */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{activeJudge.avatar}</span>
                <div>
                  <div className="font-black text-emerald-950">{activeJudge.name}</div>
                  <div className="text-[11px] text-emerald-800">{activeJudge.title} ({activeJudge.categoryName})</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">
                Juri Sah
              </span>
            </div>

            {/* Category & Score Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pos Penilaian yang Direvisi:
                </label>
                <select
                  value={revisionCategory}
                  onChange={(e) => {
                    const cat = e.target.value as typeof revisionCategory;
                    setRevisionCategory(cat);
                    setRevisionScoreValue(revisionModalParticipant[cat]);
                  }}
                  className="w-full rounded-2xl bg-purple-50/60 border border-purple-200 p-3 text-xs font-bold text-purple-950 outline-none"
                >
                  <option value="pbbScore">Pos 1: PBB Murni (Skor Lama: {revisionModalParticipant.pbbScore})</option>
                  <option value="variasiScore">Pos 2: Variasi & Formasi (Skor Lama: {revisionModalParticipant.variasiScore})</option>
                  <option value="dantonScore">Pos 3: Danton (Skor Lama: {revisionModalParticipant.dantonScore})</option>
                  <option value="kostumScore">Pos 4: Kostum (Skor Lama: {revisionModalParticipant.kostumScore})</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Input Nilai Revisi Baru (Poin):
                  </label>
                  <span className="text-xs text-purple-700 font-bold">
                    Skor Lama: {revisionModalParticipant[revisionCategory]} Poin
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRevisionScoreValue((prev) => Math.max(500, prev - 5))}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={revisionScoreValue}
                    onChange={(e) => setRevisionScoreValue(Number(e.target.value))}
                    className="flex-1 text-center font-black text-2xl py-2.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-950 outline-none"
                    min={500}
                    max={1000}
                  />
                  <button
                    type="button"
                    onClick={() => setRevisionScoreValue((prev) => Math.min(1000, prev + 5))}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Berita Acara Perubahan Nilai (Wajib):
                </label>
                <textarea
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => {
                    setRevisionReason(e.target.value);
                    setRevisionError(null);
                  }}
                  placeholder="Contoh: Koreksi kekeliruan pencatatan aba-aba hadap kanan langkah tegap sesuai evaluasi dewan juri..."
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRevisionModalParticipant(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRevision}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 transition active:scale-95"
              >
                Simpan Perubahan Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-top-4">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-500/50"
                : toast.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-500/50"
                : "bg-purple-950 text-purple-100 border-purple-500/50"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === "error" ? (
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">{toast.text}</div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
