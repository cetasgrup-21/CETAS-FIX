"use client";

import React, { useState, useMemo } from "react";
import {
  REAL_EVENT,
  REAL_LEVELS,
  REAL_JUDGES,
  REAL_PARTICIPANTS,
  REAL_CATEGORIES,
  RealCategory,
  RealCriterion,
  RealOption,
  RealParticipant,
} from "@/lib/cetas-real-data";
import { formatScore, getDisplayGroups } from "@/lib/cetas-score-engine";

interface RekapInputViewProps {
  canJudge: boolean;
  savedScores: Record<string, { score: number; label: string; note: string }>;
  onUpdateScore: (
    participantId: string,
    criterionId: string,
    score: number,
    label: string,
    note?: string
  ) => void;
  onOpenPinModal: () => void;
}

export default function RekapInputView({
  canJudge,
  savedScores,
  onUpdateScore,
  onOpenPinModal,
}: RekapInputViewProps) {
  // Mode selection: PAPER or DIGITAL
  const [eventInputMode, setEventInputMode] = useState<"PAPER" | "DIGITAL">("PAPER");

  // Selection states
  const [selectedEventId, setSelectedEventId] = useState<string>(REAL_EVENT.id);
  const [selectedLevelId, setSelectedLevelId] = useState<string>(REAL_LEVELS[1]?.id || ""); // SMP/MTS default
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>(REAL_JUDGES[0]?.id || "");
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);
  const [selectedParticipantIdx, setSelectedParticipantIdx] = useState<number>(0);

  // Active selections
  const currentCategory: RealCategory = REAL_CATEGORIES[selectedCategoryIdx] || REAL_CATEGORIES[0];
  const currentParticipant: RealParticipant = REAL_PARTICIPANTS[selectedParticipantIdx] || REAL_PARTICIPANTS[0];

  // Flatten all criteria of this category
  const criteria: RealCriterion[] = useMemo(() => {
    const list: RealCriterion[] = [];
    for (const sub of currentCategory.subCategories) {
      for (const crit of sub.criteria) {
        list.push(crit);
      }
    }
    return list;
  }, [currentCategory]);

  // Selected scores count for this participant & category
  const selectedCount = useMemo(() => {
    if (!currentParticipant) return 0;
    return criteria.filter(
      (c) => savedScores[`${currentParticipant.id}:${c.id}`]?.score !== undefined
    ).length;
  }, [criteria, currentParticipant, savedScores]);

  // Total raw score accumulated
  const totalRawScore = useMemo(() => {
    if (!currentParticipant) return 0;
    return criteria.reduce((sum, c) => {
      const val = savedScores[`${currentParticipant.id}:${c.id}`]?.score;
      return sum + (val || 0);
    }, 0);
  }, [criteria, currentParticipant, savedScores]);

  // Header groups (K: 3, C: 3, B: 3, SB: 1)
  const headerGroups = getDisplayGroups(10);

  // Score selection handler
  const handleSelectScore = (criterion: RealCriterion, option: RealOption) => {
    if (!currentParticipant) return;
    onUpdateScore(
      currentParticipant.id,
      criterion.id,
      option.score,
      option.label,
      savedScores[`${currentParticipant.id}:${criterion.id}`]?.note || ""
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] -mx-4 -my-8 px-3 py-4 text-[#071a3d] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* =================================================
            HEADER IDENTIK
        ================================================= */}
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#6f87a8]">
            CETAS.SCORE
          </p>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-[#071a3d]">
                REKAP PENILAIAN
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-500">
                  {eventInputMode === "PAPER"
                    ? "Input nilai berdasarkan lembar penilaian juri (Salinan Fisik)."
                    : "Mode Digital / Manual — sinkronisasi langsung dari tablet penilaian digital juri."}
                </p>
                <span
                  className={
                    eventInputMode === "PAPER"
                      ? "rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800"
                      : "rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-800"
                  }
                >
                  {eventInputMode === "PAPER" ? "MODE KERTAS" : "MODE DIGITAL / MANUAL"}
                </span>
              </div>
            </div>

            {/* TOGGLE MODE BUTTON */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setEventInputMode((prev) => (prev === "PAPER" ? "DIGITAL" : "PAPER"))
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-[#071a3d] shadow-sm hover:bg-slate-50 transition active:scale-95"
              >
                Ganti ke {eventInputMode === "PAPER" ? "Mode Digital" : "Mode Kertas"}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            EVENT & TINGKATAN SELECTOR
        ================================================= */}
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6f87a8] mb-1">
                EVENT
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-[#071a3d] outline-none"
              >
                <option value={REAL_EVENT.id}>{REAL_EVENT.name}</option>
                <option value="uji-coba-1">UJI COBA 1</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6f87a8] mb-1">
                TINGKATAN
              </label>
              <select
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-[#071a3d] outline-none"
              >
                {REAL_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} ({lvl.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* =================================================
            DROPDOWN FILTER UTAMA (JURI, KATEGORI, PESERTA)
        ================================================= */}
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {eventInputMode !== "PAPER" ? (
            <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
              Event ini menggunakan <b>Digital / Manual</b>. Nilai tersinkronisasi otomatis dari tablet dewan juri.
            </div>
          ) : null}

          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#6f87a8]">
              PILIH DATA REKAP
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pilih juri, kategori, kemudian peserta yang nilainya akan disalin dari lembar kertas penilaian.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6f87a8] mb-1">
                JURI
              </label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-[#071a3d] outline-none"
              >
                {REAL_JUDGES.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name} ({j.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6f87a8] mb-1">
                KATEGORI
              </label>
              <select
                value={selectedCategoryIdx}
                onChange={(e) => setSelectedCategoryIdx(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-[#071a3d] outline-none"
              >
                {REAL_CATEGORIES.map((cat, idx) => (
                  <option key={cat.id} value={idx}>
                    {cat.name} ({cat.levelName}) — {cat.percentage}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6f87a8] mb-1">
                PESERTA
              </label>
              <select
                value={selectedParticipantIdx}
                onChange={(e) => setSelectedParticipantIdx(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-[#071a3d] outline-none"
              >
                {REAL_PARTICIPANTS.map((part, idx) => (
                  <option key={part.id} value={idx}>
                    {part.number} — {part.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* =================================================
            LEMBAR REKAP PARTICIPANT HEADER
        ================================================= */}
        <section className="mb-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                LEMBAR REKAP
              </p>
              <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                {currentParticipant.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                No. {currentParticipant.number} • {currentParticipant.school || "-"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                KATEGORI {currentCategory.name}
              </p>
              <p className="text-base font-black text-[#071a3d]">
                Total Nilai: {formatScore(totalRawScore)} Poin
              </p>
              <p className="mt-0.5 text-xs font-bold text-blue-600">
                {selectedCount} / {criteria.length} materi terisi
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            SCORE TABLE (MODE KERTAS)
        ================================================= */}
        {eventInputMode === "PAPER" ? (
          <section className="overflow-hidden rounded-xl border border-[#6f87a8] bg-white shadow-sm">
            <div className="border-b border-[#6f87a8] bg-[#071a3d] px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-wide text-white">
                {currentCategory.name} — LEMBAR REKAP INPUT
              </p>
              <span className="text-xs font-bold text-blue-200">
                {criteria.length} Materi Penilaian
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] border-collapse">
                <thead>
                  <tr className="bg-[#eaf2ff]">
                    <th
                      rowSpan={2}
                      className="w-[55px] border border-[#6f87a8] px-2 py-2 text-center text-xs font-black text-[#071a3d]"
                    >
                      NO.
                    </th>
                    <th
                      rowSpan={2}
                      className="min-w-[340px] border border-[#6f87a8] px-3 py-2 text-left text-xs font-black uppercase text-[#071a3d]"
                    >
                      MATERI PENILAIAN
                    </th>
                    <th
                      colSpan={10}
                      className="border border-[#6f87a8] px-2 py-2 text-center text-xs font-black uppercase text-[#071a3d]"
                    >
                      NILAI
                    </th>
                  </tr>
                  <tr className="bg-[#f7f9fc]">
                    {headerGroups.map((group, groupIndex) => (
                      <th
                        key={`${group.label}-${groupIndex}`}
                        colSpan={group.count}
                        className="border border-[#6f87a8] px-2 py-1.5 text-center text-[11px] font-black text-[#071a3d]"
                      >
                        {group.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {criteria.map((criterion, idx) => {
                    const currentSel = savedScores[`${currentParticipant.id}:${criterion.id}`];
                    const options = criterion.options.slice(0, 10);

                    return (
                      <tr key={criterion.id} className="bg-white hover:bg-slate-50/50">
                        {/* NO */}
                        <td className="border border-[#6f87a8] px-2 py-2 text-center text-xs font-bold text-slate-700">
                          {idx + 1}
                        </td>

                        {/* MATERI */}
                        <td className="border border-[#6f87a8] px-3 py-2 text-sm font-black text-[#071a3d]">
                          <div>{criterion.name}</div>
                          {criterion.section && (
                            <span className="text-[10px] font-medium text-slate-400">
                              {criterion.section}
                            </span>
                          )}
                        </td>

                        {/* 10 OPTION BUTTONS */}
                        {Array.from({ length: 10 }).map((_, optIdx) => {
                          const option = options[optIdx];
                          if (!option) {
                            return (
                              <td
                                key={optIdx}
                                className="border border-[#6f87a8] bg-slate-50"
                              />
                            );
                          }

                          const active =
                            currentSel !== undefined &&
                            Number(currentSel.score) === Number(option.score);

                          return (
                            <td
                              key={option.id}
                              className={`border border-[#6f87a8] p-0 ${
                                active ? "bg-blue-100" : "bg-white"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectScore(criterion, option)}
                                className={`flex min-h-[46px] w-full items-center justify-center px-2 text-sm font-black transition ${
                                  active
                                    ? "bg-[#1769e0] text-white shadow-inner"
                                    : "text-[#071a3d] hover:bg-blue-50 active:bg-blue-100"
                                }`}
                              >
                                {formatScore(option.score)}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          /* =================================================
              MODE DIGITAL / MANUAL SYNC OVERVIEW
          ================================================= */
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-[#071a3d] mb-4">
              Status Sinkronisasi Tablet Juri Turnamen (Digital)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3 font-black text-[#071a3d]">NO</th>
                    <th className="p-3 font-black text-[#071a3d]">KONTINGEN</th>
                    <th className="p-3 font-black text-[#071a3d]">ASAL SEKOLAH</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">PBB</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">KOMANDAN</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">VARIASI & FORMASI</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">KOSTUM</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">TOTAL SKOR</th>
                    <th className="p-3 font-black text-center text-[#071a3d]">STATUS TABLET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REAL_PARTICIPANTS.map((part, index) => {
                    return (
                      <tr key={part.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-blue-600">
                          #{part.number}
                        </td>
                        <td className="p-3 font-black text-slate-900">{part.name}</td>
                        <td className="p-3 text-slate-500">{part.school || "-"}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {part.number === 1 ? "1.470" : "1.435"}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {part.number === 1 ? "485" : "470"}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {part.number === 1 ? "955" : "940"}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {part.number === 1 ? "245" : "240"}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-blue-700 text-sm">
                          {part.number === 1 ? "3.155" : "3.085"}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            ✓ TERSINKRON
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
