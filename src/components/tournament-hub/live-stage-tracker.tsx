"use client";

import React, { useState, useEffect } from "react";
import { Mic2, Clock, Users, ShieldCheck, ChevronRight, Activity, Radio } from "lucide-react";
import { StagePerformance } from "./tournament-hub-types";

interface LiveStageTrackerProps {
  stageData: StagePerformance | null;
  onRefresh?: () => void;
}

export function LiveStageTracker({ stageData }: LiveStageTrackerProps) {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Fallback realistic stage data if not provided
  const current = stageData?.currentTeam || {
    number: 14,
    name: "PASUS SATRIA BHINNEKA",
    school: "SMK NEGERI 1 JAKARTA",
    category: "PBB & Variasi Formasi",
    level: "SMA/SMK",
    durationSeconds: 385,
    maxDurationSeconds: 600, // 10 minutes max
    status: "ON_STAGE" as const,
  };

  const nextTeams = stageData?.nextTeams || [
    {
      number: 15,
      name: "PASKIBRA PANDU WIJAYA",
      school: "SMA TARUNA NUSANTARA",
      level: "SMA/SMK",
      callOrder: 1,
      standbyArea: "Holding Bay A (Pintu Barat)",
    },
    {
      number: 16,
      name: "BRIGADE MANDALA 48",
      school: "SMAN 48 JAKARTA",
      level: "SMA/SMK",
      callOrder: 2,
      standbyArea: "Backstage Warming Area",
    },
  ];

  const activeJudges = stageData?.activeJudgesCount ?? 3;
  const totalJudges = stageData?.totalJudgesCount ?? 3;

  useEffect(() => {
    setSecondsElapsed(current.durationSeconds);
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [current.durationSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent = Math.min(100, Math.round((secondsElapsed / current.maxDurationSeconds) * 100));

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow pulse */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Tracker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <span>Arena & Stage Live Tracker</span>
            <span className="rounded-md bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-semibold">
              LIVE BROADCAST
            </span>
          </h3>
        </div>

        {/* Jury Sync Pill */}
        <div className="flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 border border-slate-700/80 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-300">
            Juri Terhubung:{" "}
            <strong className="text-emerald-400 font-mono font-semibold">
              {activeJudges}/{totalJudges} Aktif
            </strong>
          </span>
        </div>
      </div>

      {/* Main Grid: On Stage vs Next in Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Current Active Team On Stage */}
        <div className="lg:col-span-7 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 text-[11px] font-bold">
              <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
              SEDANG TAMPIL DI ARENA
            </span>
            <span className="text-xs font-mono text-slate-400">
              Kategori: <strong className="text-white">{current.category}</strong>
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black text-2xl font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {current.number.toString().padStart(2, "0")}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-lg sm:text-xl font-black text-white truncate drop-shadow-sm">
                {current.school}
              </h4>
              <p className="text-xs text-cyan-400 font-semibold truncate mt-0.5">
                {current.name} • Tingkat {current.level}
              </p>
            </div>
          </div>

          {/* Stage Timer & Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Durasi Panggung:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-white">
                  {formatTimer(secondsElapsed)}
                </span>
                <span className="text-slate-500">/ {formatTimer(current.maxDurationSeconds)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  progressPercent > 90
                    ? "bg-rose-500 animate-pulse"
                    : progressPercent > 75
                    ? "bg-amber-400"
                    : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
              <span>Mulai Waktu Bersih</span>
              <span>{progressPercent}% Terpakai</span>
            </div>
          </div>
        </div>

        {/* Backstage / Standby Queue */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>Antrean Backstage & Panggilan</span>
            </div>

            <div className="space-y-2.5">
              {nextTeams.map((team, idx) => (
                <div
                  key={team.number}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                      P{team.callOrder}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {team.school}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        No. {team.number} • {team.standbyArea}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              Arena Ready • Floor Judge Siap
            </span>
            <span className="font-mono text-[10px] text-slate-500">Auto-sync 5s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
