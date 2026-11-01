"use client";

import React, { useState } from "react";
import { X, Trophy, ShieldCheck, AlertCircle, Clock, QrCode, FileText, ChevronRight, Sparkles } from "lucide-react";
import { TournamentTeam } from "./tournament-hub-types";
import { RadarSpiderChart } from "./radar-spider-chart";
import { SanggahanModal } from "./sanggahan-modal";
import { launchConfettiShower } from "./confetti-shower";

interface TeamDetailModalProps {
  team: TournamentTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  const [showSanggahan, setShowSanggahan] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);

  if (!isOpen || !team) return null;

  const isTopThree = team.rank !== null && team.rank <= 3;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0B0F19] shadow-2xl text-white overflow-hidden my-auto">
          {/* Header */}
          <div className="relative p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
            {/* Top ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/3 w-64 h-24 bg-cyan-500/10 blur-2xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black text-2xl font-mono shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                {team.number.toString().padStart(2, "0")}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 text-[10px] font-mono font-bold">
                    TINGKAT: {team.level}
                  </span>
                  {team.rank && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-black ${
                        team.rank === 1
                          ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                          : team.rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : team.rank === 3
                          ? "bg-amber-700 text-amber-100"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Trophy className="h-3 w-3" />
                      PERINGKAT #{team.rank}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white truncate drop-shadow-sm">
                  {team.school || team.name}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {team.name} • Total Skor:{" "}
                  <strong className="text-cyan-400 font-mono text-sm">
                    {team.finalScore.toLocaleString("id-ID")} pts
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Radar Spider Chart Section */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <span>Radar Analisis Juri (Spider Chart)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Multi-Axis Performance
                </span>
              </div>
              <div className="flex justify-center py-2">
                <RadarSpiderChart categories={team.categories} size={300} />
              </div>
            </div>

            {/* Score Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Rincian Nilai per Kategori Juknis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {team.categories.map((cat) => {
                  const percent = cat.maximum > 0 ? Math.round((cat.score / cat.maximum) * 100) : 0;
                  return (
                    <div
                      key={cat.categoryId}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {cat.categoryName}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-cyan-400">
                          {Math.round(cat.score)} / {cat.maximum}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>Bobot: {cat.percentage}%</span>
                        <span>{percent}% Maksimal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Penalties, Bonuses, & Timer */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5">
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Nilai Murni</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {Math.round(team.rawScore).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-2.5">
                <span className="text-[10px] uppercase text-rose-400 block font-medium">Penalti</span>
                <span className="text-sm font-bold font-mono text-rose-300 mt-0.5 block">
                  {team.penalty > 0 ? `-${Math.round(team.penalty)}` : "0"}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5">
                <span className="text-[10px] uppercase text-emerald-400 block font-medium">Bonus / Waktu</span>
                <span className="text-sm font-bold font-mono text-emerald-300 mt-0.5 block">
                  {team.bonus > 0 ? `+${Math.round(team.bonus)}` : team.timerText || "00:00"}
                </span>
              </div>
            </div>

            {/* National Verification QR & Certificate */}
            <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-cyan-950/30 to-slate-900 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">e-Sertifikat Terverifikasi Nasional</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: CETAS-VERIF-{team.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <a
                href={`/verifikasi?id=${team.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                Cek QR
              </a>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowSanggahan(true)}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors"
            >
              Ajukan Sanggahan (15 Mnt)
            </button>

            <div className="flex items-center gap-2">
              {isTopThree && (
                <button
                  type="button"
                  onClick={() => launchConfettiShower()}
                  className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Selebrasi</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Sanggahan Modal */}
      <SanggahanModal
        team={team}
        isOpen={showSanggahan}
        onClose={() => setShowSanggahan(false)}
      />
    </>
  );
}
