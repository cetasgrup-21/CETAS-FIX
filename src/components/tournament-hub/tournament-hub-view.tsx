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
  Calendar,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import {
  TournamentTeam,
  TournamentLevel,
  TournamentEvent,
  StagePerformance,
} from "./tournament-hub-types";
import { Podium3D } from "./podium-3d";
import { LiveStageTracker } from "./live-stage-tracker";
import { AdaptiveLeaderboard } from "./adaptive-leaderboard";
import { TeamDetailModal } from "./team-detail-modal";
import { launchConfettiShower } from "./confetti-shower";

interface SimpleEventOption {
  id: string;
  title: string;
  date?: string;
  category?: string;
}

interface VoteCandidateSummary {
  id: string;
  name: string;
  school?: string;
  photoUrl?: string;
  totalVotes: number;
  percentage: number;
  rank: number;
  candidateNumber?: string;
  categoryTitle?: string;
}

interface VoteCategoryOption {
  id: string;
  title: string;
}

export function TournamentHubView() {
  const [leaderboardMode, setLeaderboardMode] = useState<"score" | "vote">("score");

  // Dynamic Event Switcher state with instant session/URL hydration
  const [allEvents, setAllEvents] = useState<SimpleEventOption[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("cetas_hub_events");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParam = new URLSearchParams(window.location.search).get("eventId");
        if (urlParam) return urlParam;
        const cached = sessionStorage.getItem("cetas_hub_selected_event");
        if (cached) return cached;
      } catch {}
    }
    return "";
  });

  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [eventData, setEventData] = useState<TournamentEvent | null>(null);
  const [levels, setLevels] = useState<TournamentLevel[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [stageData, setStageData] = useState<StagePerformance | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TournamentTeam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Vote Leaderboard State
  const [voteCandidates, setVoteCandidates] = useState<VoteCandidateSummary[]>([]);
  const [voteCategoriesList, setVoteCategoriesList] = useState<VoteCategoryOption[]>([]);
  const [selectedVoteCategory, setSelectedVoteCategory] = useState<string>("ALL");
  const [voteCategoryName, setVoteCategoryName] = useState<string>("");

  // Keep ref of previous teams to detect rank changes and score updates
  const previousTeamsMapRef = useRef<Map<string, { rank: number | null; finalScore: number }>>(new Map());

  // Handle Event Change with persistence & URL update
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("cetas_hub_selected_event", eventId);
        const url = new URL(window.location.href);
        url.searchParams.set("eventId", eventId);
        window.history.replaceState(null, "", url.toString());
      } catch {}
    }
  };

  // 1. Fetch available events list on mount (lightweight summary for ultra-fast loading)
  useEffect(() => {
    fetch("/api/events?summary=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const list = data.events.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            category: e.category,
          }));
          setAllEvents(list);
          try {
            sessionStorage.setItem("cetas_hub_events", JSON.stringify(list));
          } catch {}

          setSelectedEventId((prev) => {
            if (prev && list.some((e: any) => e.id === prev)) return prev;
            const fallback = list[0]?.id || "";
            if (fallback && typeof window !== "undefined") {
              try {
                sessionStorage.setItem("cetas_hub_selected_event", fallback);
              } catch {}
            }
            return fallback;
          });
        }
      })
      .catch((err) => console.warn("Failed to load events list:", err));
  }, []);

  // 2. Fetch Score Recap Data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsRefreshing(true);

      try {
        const query = selectedEventId ? `?eventId=${encodeURIComponent(selectedEventId)}` : "";
        const res = await fetch(`/api/rekap${query}`);
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
        // ONLY show active team if there is actually a team currently on stage with an active running timer!
        const activeTeam = mappedTeams.find((t) => !t.complete && t.timerSeconds && t.timerSeconds > 0) || null;
        if (activeTeam) {
          setStageData({
            currentTeam: {
              number: activeTeam.number,
              name: activeTeam.name,
              school: activeTeam.school,
              category: activeTeam.categories[0]?.categoryName || "PBB & Variasi",
              level: activeTeam.level,
              durationSeconds: activeTeam.timerSeconds || 0,
              maxDurationSeconds: 600,
              status: "ON_STAGE",
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
        } else {
          setStageData(null);
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
    },
    [selectedEventId]
  );

  // 3. Fetch Vote Data for Vote Leaderboard (lightweight mode)
  const fetchVoteData = useCallback(async () => {
    try {
      const query = selectedEventId
        ? `?eventId=${encodeURIComponent(selectedEventId)}&lite=1`
        : "?lite=1";
      const res = await fetch(`/api/vote${query}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const rawList: any[] =
        data.eventVotings || data.votings || (data.eventVoting ? [data.eventVoting] : []);
      const matchedConfig =
        (selectedEventId ? rawList.find((v: any) => v.eventId === selectedEventId) : undefined) ||
        rawList[0];

      if (matchedConfig && Array.isArray(matchedConfig.categories)) {
        const catOptions: VoteCategoryOption[] = matchedConfig.categories.map((c: any) => ({
          id: c.id,
          title: c.title || c.name || "Kategori",
        }));
        setVoteCategoriesList(catOptions);

        let filteredCandidates: any[] = [];
        if (selectedVoteCategory === "ALL") {
          matchedConfig.categories.forEach((cat: any) => {
            (cat.candidates || []).forEach((c: any) => {
              filteredCandidates.push({
                ...c,
                categoryTitle: cat.title || cat.name || "Kategori",
              });
            });
          });
          setVoteCategoryName("Semua Kategori");
        } else {
          const activeCat =
            matchedConfig.categories.find((c: any) => c.id === selectedVoteCategory) ||
            matchedConfig.categories[0];
          if (activeCat) {
            setVoteCategoryName(activeCat.title || activeCat.name || "Kategori Terfavorit");
            (activeCat.candidates || []).forEach((c: any) => {
              filteredCandidates.push({
                ...c,
                categoryTitle: activeCat.title || activeCat.name || "Kategori Terfavorit",
              });
            });
          }
        }

        const totalVotes = filteredCandidates.reduce(
          (sum: number, c: any) => sum + (Number(c.totalVotes) || 0),
          0
        );

        const sorted: VoteCandidateSummary[] = [...filteredCandidates]
          .sort((a, b) => (Number(b.totalVotes) || 0) - (Number(a.totalVotes) || 0))
          .map((c, idx) => ({
            id: c.id,
            name: c.name,
            school: c.institution || c.school || c.tagline || c.name,
            photoUrl: c.photoUrl,
            candidateNumber: c.candidateNumber,
            categoryTitle: c.categoryTitle,
            totalVotes: Number(c.totalVotes) || 0,
            percentage:
              totalVotes > 0
                ? Math.round(((Number(c.totalVotes) || 0) / totalVotes) * 100)
                : 0,
            rank: idx + 1,
          }));

        setVoteCandidates(sorted);
      } else {
        setVoteCandidates([]);
        setVoteCategoriesList([]);
      }
    } catch (err) {
      console.warn("Failed to fetch vote data:", err);
    }
  }, [selectedEventId, selectedVoteCategory]);

  // Initial load when selectedEventId or selectedVoteCategory changes
  useEffect(() => {
    fetchData();
    fetchVoteData();
  }, [fetchData, fetchVoteData]);

  // Live polling every 15 seconds (pauses automatically when tab is hidden)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchData(true);
      fetchVoteData();
    }, 15000);

    const handleVisibility = () => {
      if (!document.hidden) {
        fetchData(true);
        fetchVoteData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData, fetchVoteData]);

  // Sorted top 3 for score podium
  const topTeams = [...teams]
    .filter((t) => t.rank !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 3);

  // Convert top 3 vote candidates to tournament teams shape for Podium3D
  const topVoteTeams: TournamentTeam[] = voteCandidates.slice(0, 3).map((v) => ({
    id: v.id,
    number: Number(v.candidateNumber) || v.rank,
    name: v.name,
    school: v.school || v.name,
    level: v.categoryTitle || "FAVORIT",
    eventLevelId: null,
    displayOrder: v.rank,
    rawScore: v.totalVotes,
    bonus: 0,
    penalty: 0,
    finalScore: v.totalVotes,
    complete: true,
    rank: v.rank,
    categories: [
      {
        categoryId: "vote",
        categoryName: "Perolehan Suara",
        percentage: v.percentage,
        maximum: 1000,
        score: v.totalVotes,
        complete: true,
        scored: 1,
        expected: 1,
        judgeCount: 1,
      },
    ],
  }));

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* ============================================================== */}
      {/* 1. TOP SPORT-TECH NAVBAR WITH DYNAMIC EVENT SWITCHER           */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Brand & Event Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0B0F19]">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white">CETAS</span>
                  <span className="rounded bg-gradient-to-r from-cyan-500 to-emerald-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-slate-950 font-mono">
                    SPACE
                  </span>
                </div>
              </div>
            </Link>

            {/* Dynamic Event Switcher Dropdown */}
            {allEvents.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => handleSelectEvent(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 pl-3 pr-8 py-1.5 text-xs font-bold text-white focus:border-cyan-500 focus:outline-none cursor-pointer max-w-[140px] xs:max-w-[180px] sm:max-w-xs truncate"
                >
                  {allEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                <span className="font-mono text-[11px] hidden sm:inline">Memuat Event...</span>
              </div>
            )}
          </div>

          {/* Dual Mode Switcher: Skor Juri vs Vote Favorit */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 p-1">
            <button
              onClick={() => setLeaderboardMode("score")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                leaderboardMode === "score"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Skor Juri</span>
            </button>
            <button
              onClick={() => setLeaderboardMode("vote")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                leaderboardMode === "vote"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Vote className="h-3.5 w-3.5" />
              <span>Vote Favorit</span>
            </button>
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

            <Link
              href="/pelatih"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 transition shadow-sm"
            >
              <UserCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Portal Pelatih &amp; Kontingen</span>
            </Link>

            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </Link>
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
                {leaderboardMode === "score" ? "Total Kontingen" : "Total Kandidat"}
              </span>
              <span className="text-base font-black text-white font-mono">
                {leaderboardMode === "score" ? `${teams.length} Tim` : `${voteCandidates.length} Peserta`}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                {leaderboardMode === "score" ? "Selesai Dinilai" : "Total Suara Masuk"}
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {leaderboardMode === "score"
                  ? `${teams.filter((t) => t.complete).length} / ${teams.length}`
                  : `${voteCandidates.reduce((sum, c) => sum + c.totalVotes, 0).toLocaleString("id-ID")} Suara`}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                {leaderboardMode === "score" ? "Pemuncak Nilai" : "Favorit #1"}
              </span>
              <span className="text-xs font-extrabold text-amber-300 truncate max-w-[120px] block">
                {leaderboardMode === "score"
                  ? topTeams[0]?.school || "Menunggu..."
                  : voteCandidates[0]?.school || voteCandidates[0]?.name || "Menunggu..."}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                Dimensi Hub
              </span>
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {leaderboardMode === "score" ? "CETAS.SCORE" : "CETAS.VOTE"}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODE A: LEADERBOARD SKOR CETAS.SCORE                           */}
        {/* ============================================================== */}
        {leaderboardMode === "score" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 3D Podium at the top of leaderboard */}
            <Podium3D topTeams={topTeams} onSelectTeam={setSelectedTeam} />

            {/* Live Stage Tracker */}
            <LiveStageTracker stageData={stageData} onRefresh={() => fetchData()} />

            {/* Adaptive Card View (Phone) & Desktop Data Grid */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Papan Skor Kontingen Juknis Resmi
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

        {/* ============================================================== */}
        {/* MODE B: LEADERBOARD VOTE CETAS.VOTE                            */}
        {/* ============================================================== */}
        {leaderboardMode === "vote" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 3D Podium for Top Vote Winners */}
            <Podium3D topTeams={topVoteTeams} mode="vote" scoreUnit="suara" />

            {/* Vote Ranking List & Quick Vote Action */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Leaderboard Perolehan Suara Terfavorit</span>
                    <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-mono">
                      REALTIME QRIS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {voteCategoryName || "Kategori Juara Favorit"}
                  </p>
                </div>

                <Link
                  href={`/vote?eventId=${selectedEventId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-4 py-2 text-xs shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <Vote className="h-3.5 w-3.5" />
                  <span>Beri Vote Sekarang</span>
                </Link>
              </div>

              {/* Category Filter Tabs */}
              {voteCategoriesList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setSelectedVoteCategory("ALL")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                      selectedVoteCategory === "ALL"
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {voteCategoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedVoteCategory(cat.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                        selectedVoteCategory === cat.id
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              )}

              {voteCandidates.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Belum ada perolehan suara vote pada event ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {voteCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono font-black text-xs ${
                            cand.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                              : cand.rank === 2
                              ? "bg-slate-300 text-slate-950"
                              : cand.rank === 3
                              ? "bg-amber-700 text-amber-100"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          #{cand.rank}
                        </span>

                        {cand.photoUrl && (
                          <img
                            src={
                              !cand.photoUrl || cand.photoUrl.includes("photo-1534528741775")
                                ? "/logo/cetas_logo.png"
                                : cand.photoUrl
                            }
                            alt={cand.name}
                            className={`h-9 w-9 rounded-lg border border-slate-700 shrink-0 ${
                              !cand.photoUrl ||
                              cand.photoUrl.includes("photo-1534528741775") ||
                              cand.photoUrl.includes("cetas_logo")
                                ? "object-contain p-1 bg-slate-900"
                                : "object-cover"
                            }`}
                          />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{cand.school}</h4>
                            {selectedVoteCategory === "ALL" && cand.categoryTitle && (
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 shrink-0">
                                {cand.categoryTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {cand.candidateNumber ? `[No. ${cand.candidateNumber}] ` : ""}
                            {cand.name}
                          </p>
                        </div>
                      </div>

                      {/* Vote Count & Progress Bar */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="flex-1">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-white">
                              {cand.totalVotes.toLocaleString("id-ID")} Suara
                            </span>
                            <span className="text-amber-400">{cand.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${cand.percentage}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/vote?eventId=${selectedEventId}&candidateId=${cand.id}`}
                          className="shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-amber-300"
                        >
                          Vote
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
}
