"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Activity,
  Flame,
  Radio,
  Vote,
  UserCheck,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  TournamentTeam,
  TournamentLevel,
  TournamentEvent,
  StagePerformance,
  HubTab,
} from "./tournament-hub-types";
import { Podium3D } from "./podium-3d";
import { LiveStageTracker } from "./live-stage-tracker";
import { AdaptiveLeaderboard } from "./adaptive-leaderboard";
import { TeamDetailModal } from "./team-detail-modal";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { launchConfettiShower } from "./confetti-shower";

export function TournamentHubView() {
  const [activeTab, setActiveTab] = useState<HubTab>("leaderboard");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [eventData, setEventData] = useState<TournamentEvent | null>(null);
  const [levels, setLevels] = useState<TournamentLevel[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [stageData, setStageData] = useState<StagePerformance | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TournamentTeam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Keep ref of previous teams to detect rank changes and score updates
  const previousTeamsMapRef = useRef<Map<string, { rank: number | null; finalScore: number }>>(new Map());

  // Data fetching logic connected strictly to existing GET /api/rekap
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);

    try {
      const res = await fetch("/api/rekap", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data rekap");

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal memproses data");

      setEventData(data.event);
      if (Array.isArray(data.levels)) {
        setLevels(data.levels);
      }

      const rows: any[] = Array.isArray(data.rows) ? data.rows : [];
      const prevMap = previousTeamsMapRef.current;

      const mappedTeams: TournamentTeam[] = rows.map((r) => {
        const p = r.participant;
        const currentRank = r.rank ?? null;
        const currentScore = Number(r.finalScore || 0);

        const prev = prevMap.get(p.id);
        let rankChange = 0;
        let isRecentlyUpdated = false;

        if (prev) {
          if (prev.rank !== null && currentRank !== null) {
            // When rank number decreases (e.g. from 3 to 1), team climbed +2
            rankChange = prev.rank - currentRank;
          }
          if (prev.finalScore !== currentScore) {
            isRecentlyUpdated = true;
          }
        }

        return {
          id: p.id,
          number: p.number,
          name: p.name,
          school: p.school || p.name,
          level: p.level || "UMUM",
          eventLevelId: p.eventLevelId || null,
          displayOrder: p.displayOrder || p.number,
          rawScore: Number(r.rawScore || 0),
          bonus: Number(r.bonus || 0),
          penalty: Number(r.penalty || 0),
          finalScore: currentScore,
          complete: Boolean(r.complete),
          rank: currentRank,
          previousRank: prev?.rank ?? currentRank,
          rankChange,
          isRecentlyUpdated,
          timerSeconds: r.timerSeconds,
          timerText: r.timerText,
          categories: (r.categories || []).map((c: any) => ({
            categoryId: c.categoryId,
            categoryName: c.categoryName,
            percentage: c.percentage,
            maximum: c.maximum,
            score: c.score,
            complete: c.complete,
            scored: c.scored,
            expected: c.expected,
            judgeCount: c.judgeCount,
            judges: c.judges,
          })),
        };
      });

      // Update map for next tick comparison
      const nextMap = new Map<string, { rank: number | null; finalScore: number }>();
      mappedTeams.forEach((t) => nextMap.set(t.id, { rank: t.rank, finalScore: t.finalScore }));
      previousTeamsMapRef.current = nextMap;

      setTeams(mappedTeams);

      // Construct live stage tracker performance data
      const activeTeam = mappedTeams.find((t) => !t.complete) || mappedTeams[0] || null;
      if (activeTeam) {
        setStageData({
          currentTeam: {
            number: activeTeam.number,
            name: activeTeam.name,
            school: activeTeam.school,
            category: activeTeam.categories[0]?.categoryName || "PBB & Variasi",
            level: activeTeam.level,
            durationSeconds: activeTeam.timerSeconds || 320,
            maxDurationSeconds: 600,
            status: activeTeam.complete ? "FINISHED" : "ON_STAGE",
          },
          nextTeams: mappedTeams
            .filter((t) => t.id !== activeTeam.id && !t.complete)
            .slice(0, 3)
            .map((t, idx) => ({
              number: t.number,
              name: t.name,
              school: t.school,
              level: t.level,
              callOrder: idx + 1,
              standbyArea: `Holding Area ${String.fromCharCode(65 + idx)}`,
            })),
          activeJudgesCount: 3,
          totalJudgesCount: 3,
        });
      }

      setLastSyncTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Tournament Hub fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling every 5 seconds for live rank-shift sync
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Sorted top 3 for podium
  const topTeams = [...teams]
    .filter((t) => t.rank !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* ============================================================== */}
      {/* 1. TOP SPORT-TECH NAVBAR                                       */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Event Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0B0F19]">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white">CETAS</span>
                  <span className="rounded bg-gradient-to-r from-cyan-500 to-emerald-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-slate-950 font-mono">
                    HUB
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-xs">
                  {eventData?.name || "Tournament Leaderboard Live"}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 p-1">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "leaderboard"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Skor Live</span>
            </button>
            <button
              onClick={() => setActiveTab("podium")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "podium"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Podium 3D</span>
            </button>
            <button
              onClick={() => setActiveTab("stage")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "stage"
                  ? "bg-emerald-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Stage Tracker</span>
            </button>
            <Link
              href="/vote"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <Vote className="h-3.5 w-3.5" />
              <span>Cetas Vote</span>
            </Link>
            <Link
              href="/pelatih"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Portal Pelatih</span>
            </Link>
          </div>

          {/* Sync Status & Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing..." : lastSyncTime || "Sync"}
              </span>
            </button>

            <button
              onClick={() => launchConfettiShower()}
              title="Selebrasi Juara"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-transform active:scale-90"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN HUB CONTENT                                            */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Total Kontingen
              </span>
              <span className="text-base font-black text-white font-mono">
                {teams.length} Tim
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Selesai Dinilai
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {teams.filter((t) => t.complete).length} / {teams.length}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Pemuncak Skor
              </span>
              <span className="text-xs font-extrabold text-amber-300 truncate max-w-[120px] block">
                {topTeams[0]?.school || "Menunggu..."}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Engine Status
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero-Touch Active
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Leaderboard View (Podium + Adaptive Table) */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 3D Podium at the top of leaderboard */}
            <Podium3D topTeams={topTeams} onSelectTeam={setSelectedTeam} />

            {/* Adaptive Card View (Phone) & Desktop Data Grid */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Papan Skor Kontingen (Leaderboard)
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {teams.length} Peserta Terdaftar
                </span>
              </div>

              <AdaptiveLeaderboard
                teams={teams}
                levels={levels}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                onSelectTeam={setSelectedTeam}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Visual 3D Podium Dedicated View */}
        {activeTab === "podium" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Podium3D topTeams={topTeams} onSelectTeam={setSelectedTeam} />

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
              <h4 className="text-sm font-bold text-white mb-2">
                Aturan & Algoritma Penentuan Juara
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penentuan peringkat podium menggunakan rumus akumulasi bobot persentase juknis
                resmi CETAS.SCORE. Jika terdapat nilai akhir sama (*tie*), tie-breaker dijalankan
                berdasarkan urutan prioritas kategori utama (PBB Murni), disusul Variasi &
                Formasi, Danton, dan penalti pelanggaran.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Live Stage Tracker Dedicated View */}
        {activeTab === "stage" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <LiveStageTracker stageData={stageData} onRefresh={() => fetchData()} />

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
              <h4 className="text-sm font-bold text-white mb-2">
                Informasi Antrean Panggung & Arena
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kontingen wajib standby di Holding Area minimal 2 penampilan sebelum nomor urut
                tampil. Pengurangan poin durasi diberlakukan apabila penampilan melebihi batas waktu
                maksimal yang ditentukan pada petunjuk teknis.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Cetas Vote Direct Link & Preview */}
        {activeTab === "vote" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Vote className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Bilik E-Voting Juara Favorit</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Dukung sekolah dan kontingen jagoanmu secara realtime menggunakan QRIS instan
              terverifikasi nasional dengan sistem anti-bot.
            </p>
            <div className="pt-2">
              <Link
                href="/vote"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <span>Buka Cetas Vote</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 5: Sanggahan Digital */}
        {activeTab === "dispute" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UserCheck className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Portal Sanggahan & Pelatih</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Untuk mengajukan sanggahan resmi dengan batas waktu 15 menit pasca rilis nilai, pilih
              kontingen Anda melalui daftar skor di tab <strong>Skor Live</strong> atau klik tombol
              di bawah.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("leaderboard");
                  if (teams[0]) setSelectedTeam(teams[0]);
                }}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Pilih Kontingen Saya
              </button>
              <Link
                href="/pelatih"
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Login Portal Pelatih
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. DRILL-DOWN TEAM DETAIL & RADAR SPIDER MODAL                 */}
      {/* ============================================================== */}
      <TeamDetailModal
        team={selectedTeam}
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
      />

      {/* ============================================================== */}
      {/* 4. MOBILE FLOATING BOTTOM NAV (Thumb Navigation)                */}
      {/* ============================================================== */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
