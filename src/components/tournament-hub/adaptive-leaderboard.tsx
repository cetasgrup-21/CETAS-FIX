"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  Award,
  Clock,
  Download,
} from "lucide-react";
import { TournamentTeam, TournamentLevel } from "./tournament-hub-types";

interface AdaptiveLeaderboardProps {
  teams: TournamentTeam[];
  levels: TournamentLevel[];
  selectedLevel: string;
  onSelectLevel: (levelCode: string) => void;
  onSelectTeam: (team: TournamentTeam) => void;
}

export function AdaptiveLeaderboard({
  teams,
  levels,
  selectedLevel,
  onSelectLevel,
  onSelectTeam,
}: AdaptiveLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Instant filtering by level and search
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchLevel =
        selectedLevel === "ALL" ||
        t.level?.toUpperCase() === selectedLevel.toUpperCase() ||
        t.eventLevelId === selectedLevel;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.school?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.number.toString().includes(q);

      return matchLevel && matchSearch;
    });
  }, [teams, selectedLevel, searchQuery]);

  // Rank change indicator helper
  const renderRankChange = (change?: number) => {
    if (change === undefined || change === null || change === 0) {
      return (
        <span className="inline-flex items-center text-slate-500 text-[10px] font-mono">
          <Minus className="h-2.5 w-2.5 mr-0.5" /> —
        </span>
      );
    }
    if (change > 0) {
      return (
        <span className="inline-flex items-center text-emerald-400 text-[10px] font-bold font-mono animate-bounce">
          <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> +{change}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-rose-400 text-[10px] font-bold font-mono">
        <ArrowDown className="h-2.5 w-2.5 mr-0.5" /> {change}
      </span>
    );
  };

  // Rank badge decoration
  const renderRankBadge = (rank: number | null) => {
    if (!rank) return <span className="text-slate-600 font-mono text-xs">-</span>;
    if (rank === 1) {
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(245,158,11,0.6)]">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300 text-slate-950 font-black text-xs shadow-[0_0_10px_rgba(203,213,225,0.4)]">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 text-amber-100 font-black text-xs shadow-[0_0_8px_rgba(217,119,6,0.4)]">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-bold font-mono text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Level Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Instant Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectLevel("ALL")}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
              selectedLevel === "ALL"
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            Semua Tingkat ({teams.length})
          </button>

          {levels.map((lvl) => {
            const count = teams.filter(
              (t) =>
                t.level?.toUpperCase() === lvl.code.toUpperCase() ||
                t.level?.toUpperCase() === lvl.name.toUpperCase() ||
                t.eventLevelId === lvl.id
            ).length;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onSelectLevel(lvl.code)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  selectedLevel === lvl.code
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {lvl.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Real-time Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik cari sekolah atau no. urut..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SMARTPHONE VIEW (< 768px): ADAPTIVE CARD VIEW (NO H-SCROLL) */}
      {/* ============================================================== */}
      <div className="block md:hidden space-y-2.5">
        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-500 text-xs">
            Tidak ada data kontingen yang sesuai filter.
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className={`group relative rounded-2xl border p-3.5 transition-all duration-300 active:scale-[0.99] cursor-pointer ${
                team.isRecentlyUpdated
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-pulse"
                  : team.rank === 1
                  ? "border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 shadow-md"
                  : "border-slate-800/80 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              {/* Card Header Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex flex-col items-center">
                    {renderRankBadge(team.rank)}
                    <div className="mt-1">{renderRankChange(team.rankChange)}</div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">
                        #{team.number.toString().padStart(2, "0")}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 uppercase">
                        {team.level}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px] mt-0.5">
                      {team.school || team.name}
                    </h4>
                  </div>
                </div>

                {/* Score & Action Indicator */}
                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-base font-black font-mono text-white group-hover:text-cyan-400 transition-colors">
                      {team.finalScore.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">pts</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>

              {/* Sub-bar Category Pills Summary */}
              {team.categories && team.categories.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {team.categories.slice(0, 4).map((c) => (
                    <span
                      key={c.categoryId}
                      className="shrink-0 rounded bg-slate-950/80 border border-slate-800 px-2 py-0.5 text-[9.5px] font-mono text-slate-300"
                    >
                      {c.categoryName.slice(0, 7)}:{" "}
                      <strong className="text-cyan-400">{Math.round(c.score)}</strong>
                    </span>
                  ))}
                  {team.categories.length > 4 && (
                    <span className="text-[9px] text-slate-500 font-mono">
                      +{team.categories.length - 4} Kategori
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP VIEW (>= 768px): SLEEK SPORT-TECH TABLE GRID        */}
      {/* ============================================================== */}
      <div className="hidden md:block rounded-2xl border border-slate-800/90 bg-slate-900/70 backdrop-blur-xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pl-4 pr-2 w-16 text-center">Rank</th>
              <th className="py-3.5 px-2 w-16 text-center">Shift</th>
              <th className="py-3.5 px-3 w-16 text-center">No</th>
              <th className="py-3.5 px-4">Kontingen & Sekolah</th>
              <th className="py-3.5 px-3 w-24 text-center">Tingkat</th>
              <th className="py-3.5 px-3 text-right">Nilai Murni</th>
              <th className="py-3.5 px-3 text-right">Penalti</th>
              <th className="py-3.5 px-4 text-right">Skor Akhir</th>
              <th className="py-3.5 pr-4 pl-2 w-16 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  Tidak ada kontingen yang memenuhi kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => onSelectTeam(team)}
                  className={`group cursor-pointer transition-colors duration-150 ${
                    team.isRecentlyUpdated
                      ? "bg-cyan-950/30 ring-1 ring-cyan-400 animate-pulse"
                      : team.rank === 1
                      ? "bg-amber-950/15 hover:bg-amber-950/30"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <td className="py-3 pl-4 pr-2 text-center">
                    <div className="flex justify-center">{renderRankBadge(team.rank)}</div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex justify-center">{renderRankChange(team.rankChange)}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-cyan-400">
                    {team.number.toString().padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {team.school || team.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                      {team.name}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="rounded-md bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                      {team.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {Math.round(team.rawScore).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {team.penalty > 0 ? (
                      <span className="text-rose-400 font-bold">-{Math.round(team.penalty)}</span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-black font-mono text-sm text-white group-hover:text-cyan-400 transition-colors">
                      {team.finalScore.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-1">pts</span>
                  </td>
                  <td className="py-3 pr-4 pl-2 text-center">
                    <button
                      type="button"
                      className="rounded-lg bg-slate-800/80 p-1.5 text-slate-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
