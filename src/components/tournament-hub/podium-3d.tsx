"use client";

import React from "react";
import { Trophy, Medal, Sparkles, Award } from "lucide-react";
import { TournamentTeam } from "./tournament-hub-types";
import { launchConfettiShower } from "./confetti-shower";

interface Podium3DProps {
  topTeams: TournamentTeam[];
  onSelectTeam?: (team: TournamentTeam) => void;
}

export function Podium3D({ topTeams, onSelectTeam }: Podium3DProps) {
  const first = topTeams[0] || null;
  const second = topTeams[1] || null;
  const third = topTeams[2] || null;

  return (
    <div className="relative w-full rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-[#0B0F19] p-4 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-500/15 via-cyan-500/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-10 left-1/4 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />

      {/* Header with celebration trigger */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              3D Champion Podium
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Leaderboard 3 Besar Teratas — Realtime CETAS.SCORE Engine
          </p>
        </div>

        <button
          type="button"
          onClick={() => launchConfettiShower()}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 border border-amber-500/40 px-3.5 py-1.5 text-xs font-semibold text-amber-300 transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-12" />
          <span>Selebrasi Juara (Confetti)</span>
        </button>
      </div>

      {/* Podium Stage Container */}
      <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-6 pt-10 pb-4 min-h-[320px]">
        {/* ================= JUARA 2 (PERAK - KIRI) ================= */}
        <div className="flex-1 max-w-[190px] flex flex-col items-center">
          {second ? (
            <div
              onClick={() => onSelectTeam && onSelectTeam(second)}
              className="w-full flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge & Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_20px_rgba(148,163,184,0.3)] transition-transform duration-300 group-hover:scale-110">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#0F172A]">
                    <Medal className="h-7 w-7 text-slate-300" />
                  </div>
                </div>
                <span className="absolute -bottom-2 inline-flex items-center justify-center rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-extrabold text-slate-900 shadow">
                  #2
                </span>
              </div>

              {/* Info Card */}
              <div className="w-full text-center px-1">
                <div className="text-[11px] font-bold text-slate-300 truncate font-mono">
                  No. {second.number.toString().padStart(2, "0")}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full group-hover:text-cyan-400 transition-colors">
                  {second.school || second.name}
                </div>
                <div className="text-[11px] font-extrabold text-slate-300 font-mono mt-0.5">
                  {second.finalScore.toLocaleString("id-ID")} pts
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-600 italic mb-2">Menunggu Nilai</div>
          )}

          {/* 3D Pedestal Block (Silver) */}
          <div className="w-full mt-3 h-28 sm:h-36 rounded-t-xl bg-gradient-to-b from-slate-400/30 via-slate-700/40 to-slate-900 border-t-2 border-x border-slate-400/60 shadow-[0_-5px_25px_rgba(148,163,184,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <span className="text-2xl sm:text-3xl font-black text-slate-400/50 font-mono">
              2
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
              Runner Up
            </span>
          </div>
        </div>

        {/* ================= JUARA 1 (EMAS - TENGAH, TERTINGGI) ================= */}
        <div className="flex-1 max-w-[220px] flex flex-col items-center">
          {first ? (
            <div
              onClick={() => onSelectTeam && onSelectTeam(first)}
              className="w-full flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Crown / Golden Trophy Badge */}
              <div className="relative mb-3 flex flex-col items-center">
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 opacity-75 blur-md animate-pulse" />
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-110">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#0B0F19]">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
                  </div>
                </div>
                <span className="absolute -bottom-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950 shadow-lg">
                  JUARA 1
                </span>
              </div>

              {/* Info Card */}
              <div className="w-full text-center px-1">
                <div className="text-xs font-bold text-amber-400 truncate font-mono">
                  No. {first.number.toString().padStart(2, "0")}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white truncate max-w-full group-hover:text-amber-300 transition-colors">
                  {first.school || first.name}
                </div>
                <div className="text-xs sm:text-sm font-black text-amber-400 font-mono mt-0.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {first.finalScore.toLocaleString("id-ID")} pts
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-600 italic mb-2">Menunggu Nilai</div>
          )}

          {/* 3D Pedestal Block (Gold - Highest) */}
          <div className="w-full mt-3 h-36 sm:h-48 rounded-t-xl bg-gradient-to-b from-amber-500/40 via-amber-700/30 to-slate-900 border-t-2 border-x border-amber-400/80 shadow-[0_-8px_35px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_10px_#F59E0B]" />
            <span className="text-3xl sm:text-5xl font-black text-amber-400/60 font-mono">
              1
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-300 mt-1">
              CHAMPION
            </span>
          </div>
        </div>

        {/* ================= JUARA 3 (PERUNGGU - KANAN) ================= */}
        <div className="flex-1 max-w-[190px] flex flex-col items-center">
          {third ? (
            <div
              onClick={() => onSelectTeam && onSelectTeam(third)}
              className="w-full flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge & Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-700 p-0.5 shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-transform duration-300 group-hover:scale-110">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#0F172A]">
                    <Award className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
                <span className="absolute -bottom-2 inline-flex items-center justify-center rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-extrabold text-amber-100 shadow">
                  #3
                </span>
              </div>

              {/* Info Card */}
              <div className="w-full text-center px-1">
                <div className="text-[11px] font-bold text-amber-600 truncate font-mono">
                  No. {third.number.toString().padStart(2, "0")}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full group-hover:text-amber-500 transition-colors">
                  {third.school || third.name}
                </div>
                <div className="text-[11px] font-extrabold text-amber-500 font-mono mt-0.5">
                  {third.finalScore.toLocaleString("id-ID")} pts
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-600 italic mb-2">Menunggu Nilai</div>
          )}

          {/* 3D Pedestal Block (Bronze) */}
          <div className="w-full mt-3 h-24 sm:h-28 rounded-t-xl bg-gradient-to-b from-amber-800/30 via-stone-800/40 to-slate-900 border-t-2 border-x border-amber-700/60 shadow-[0_-5px_25px_rgba(217,119,6,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            <span className="text-2xl sm:text-3xl font-black text-amber-700/50 font-mono">
              3
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 mt-1">
              3rd Place
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-2 text-center text-[11px] text-slate-500">
        💡 Klik kontingen pada podium untuk membuka Spider Chart & rincian nilai juri
      </div>
    </div>
  );
}
