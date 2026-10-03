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
  RealJudge,
  RealParticipant,
} from "@/lib/cetas-real-data";
import { formatScore, getScoreGroups } from "@/lib/cetas-score-engine";

interface JudgeViewProps {
  canJudge: boolean;
  activeJudge: {
    id: string;
    name: string;
    pin: string;
    title?: string;
  };
  onOpenPinModal: () => void;
  onLogoutJudge: () => void;
  savedScores: Record<string, { score: number; label: string; note: string }>;
  onUpdateScore: (
    participantId: string,
    criterionId: string,
    score: number,
    label: string,
    note?: string
  ) => void;
}

export default function JudgeView({
  canJudge,
  activeJudge,
  onOpenPinModal,
  onLogoutJudge,
  savedScores,
  onUpdateScore,
}: JudgeViewProps) {
  // Category selection (default to PBB SMP/MTS: index 0)
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);
  const currentCategory: RealCategory = REAL_CATEGORIES[selectedCategoryIdx] || REAL_CATEGORIES[0];

  // Flatten all criteria of this category
  const allCriteria: RealCriterion[] = useMemo(() => {
    const list: RealCriterion[] = [];
    for (const sub of currentCategory.subCategories) {
      for (const crit of sub.criteria) {
        list.push(crit);
      }
    }
    return list;
  }, [currentCategory]);

  // Participant selection (default to 0: SMPN 220 JAKARTA)
  const [participantIndex, setParticipantIndex] = useState<number>(0);
  const currentParticipant: RealParticipant = REAL_PARTICIPANTS[participantIndex] || REAL_PARTICIPANTS[0];

  // Criterion step index (0 to allCriteria.length - 1)
  const [criterionIndex, setCriterionIndex] = useState<number>(0);
  const currentCriterion: RealCriterion | undefined = allCriteria[criterionIndex];

  // Local feedback states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const [showCriterionPicker, setShowCriterionPicker] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [changeRequestSent, setChangeRequestSent] = useState(false);

  // Submitted participants tracker (set of participant IDs)
  const [submittedParticipants, setSubmittedParticipants] = useState<Record<string, boolean>>({});

  const isCurrentParticipantSubmitted = Boolean(
    submittedParticipants[`${currentParticipant?.id}:${currentCategory?.id}`]
  );

  // Key for current selection
  const currentKey = currentParticipant && currentCriterion
    ? `${currentParticipant.id}:${currentCriterion.id}`
    : "";
  const currentValue = currentKey ? savedScores[currentKey] : undefined;

  // Completed criteria count for current participant in current category
  const completedCriteriaCount = useMemo(() => {
    if (!currentParticipant) return 0;
    return allCriteria.filter(
      (c) => savedScores[`${currentParticipant.id}:${c.id}`]?.score !== undefined
    ).length;
  }, [allCriteria, currentParticipant, savedScores]);

  // Score groups partitioned into 4 columns: KURANG (3), CUKUP (3), BAIK (3), SANGAT BAIK (1)
  const scoreGroups = useMemo(() => {
    if (!currentCriterion || !currentCriterion.options) {
      return { kurang: [], cukup: [], baik: [], sangatBaik: [] };
    }
    return getScoreGroups(currentCriterion.options);
  }, [currentCriterion]);

  // Score selection handler
  const handleSelectOption = (option: { id?: string; score: number; label: string }) => {
    if (!canJudge) {
      onOpenPinModal();
      return;
    }
    if (isCurrentParticipantSubmitted) {
      setShowChangeRequest(true);
      return;
    }

    if (!currentParticipant || !currentCriterion) return;

    setSaving(true);
    setSuccessMessage("");

    onUpdateScore(
      currentParticipant.id,
      currentCriterion.id,
      option.score,
      option.label,
      currentValue?.note || ""
    );

    setTimeout(() => {
      setSaving(false);
      setSuccessMessage(`Nilai ${option.score} tersimpan`);

      // Auto-advance to next criterion if available
      if (criterionIndex < allCriteria.length - 1) {
        setTimeout(() => {
          setCriterionIndex((prev) => prev + 1);
          setSuccessMessage("");
        }, 320);
      } else {
        // Last criterion reached, open Review modal
        setTimeout(() => {
          setShowReview(true);
          setSuccessMessage("");
        }, 500);
      }
    }, 180);
  };

  // Note change handler
  const handleNoteChange = (text: string) => {
    if (!canJudge || !currentParticipant || !currentCriterion) return;
    onUpdateScore(
      currentParticipant.id,
      currentCriterion.id,
      currentValue?.score ?? 0,
      currentValue?.label ?? "",
      text
    );
  };

  // Submit assessment for current participant
  const handleSubmitParticipant = () => {
    if (!currentParticipant) return;
    setSubmittedParticipants((prev) => ({
      ...prev,
      [`${currentParticipant.id}:${currentCategory.id}`]: true,
    }));
    setShowReview(false);

    // If there's a next participant, advance
    if (participantIndex < REAL_PARTICIPANTS.length - 1) {
      setParticipantIndex((prev) => prev + 1);
      setCriterionIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] -mx-4 -my-8 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 text-[#071a3d]">
      <div className="mx-auto max-w-6xl">
        {/* =================================================
            TOP BAR: RBAC VERIFICATION / PIN AUTHENTICATION
        ================================================= */}
        {!canJudge ? (
          <div className="mb-5 p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-950 text-sm">
                  Akses Penilaian Terkunci — Mode Baca Saja
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                  Perlu Otentikasi
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                Hanya <strong>Dewan Juri yang berwenang</strong> yang dapat memberikan atau merubah nilai materi turnamen.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPinModal}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-[#071a3d] hover:bg-blue-900 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              🔑 Masuk Sebagai Juri (PIN)
            </button>
          </div>
        ) : (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white text-base font-black">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-950 text-xs sm:text-sm">
                    Dewan Juri Terverifikasi: {activeJudge.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-black uppercase">
                    Otoritas Penuh
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Anda memiliki hak sah untuk menilai & mengunci nilai kontingen turnamen CETAS.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogoutJudge}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-sm transition"
            >
              Ganti Juri
            </button>
          </div>
        )}

        {/* =================================================
            HEADER IDENTIK CETAS.SCORE (#071a3d)
        ================================================= */}
        <header className="overflow-hidden rounded-2xl bg-[#071a3d] shadow-lg sm:rounded-3xl">
          <div className="p-4 sm:p-5 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-200">
                    JURI
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                    {currentCategory.levelName || "SMP/MTS"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <h1 className="break-words text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
                    {currentCategory.name}
                  </h1>
                  {/* Category Switcher Dropdown */}
                  <select
                    value={selectedCategoryIdx}
                    onChange={(e) => {
                      setSelectedCategoryIdx(Number(e.target.value));
                      setCriterionIndex(0);
                    }}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-blue-200 border border-white/20 outline-none hover:bg-white/20 transition"
                  >
                    {REAL_CATEGORIES.map((cat, idx) => (
                      <option key={cat.id} value={idx} className="bg-[#071a3d] text-white">
                        {cat.name} ({cat.levelName}) — {cat.percentage}%
                      </option>
                    ))}
                  </select>
                </div>

                <p className="mt-1 text-sm text-white/50">
                  {REAL_EVENT.name} • Bobot: {currentCategory.percentage}% • Skala Turnamen: 5.000 Pts
                </p>
              </div>

              {/* ACTION BUTTONS HEADER */}
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCriterionPicker(true)}
                  disabled={saving || allCriteria.length <= 1}
                  className="min-h-10 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  Pindah Materi
                </button>

                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  disabled={saving || completedCriteriaCount !== allCriteria.length || isCurrentParticipantSubmitted}
                  className="min-h-10 rounded-xl bg-blue-500 px-3 py-2.5 text-xs font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  {isCurrentParticipantSubmitted ? "✓ Sudah Submit" : "Review & Submit"}
                </button>

                {isCurrentParticipantSubmitted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setChangeReason("");
                      setShowChangeRequest(true);
                    }}
                    className="min-h-10 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-black text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                  >
                    {changeRequestSent ? "Menunggu Persetujuan Admin" : "Ajukan Perubahan Nilai"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowParticipantPicker(true)}
                  disabled={saving || REAL_PARTICIPANTS.length <= 1}
                  className="min-h-10 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  Pindah Peserta
                </button>

                <button
                  type="button"
                  onClick={onLogoutJudge}
                  className="min-h-10 rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-black text-red-200 sm:px-4 sm:text-sm transition hover:bg-red-500/20"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>

          {/* PROGRESS METRICS BOXES */}
          <div className="border-t border-white/10 bg-black/10 p-3 sm:p-4 md:p-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                  Peserta
                </p>
                <p className="mt-1 text-sm font-black text-white sm:text-base md:text-lg">
                  {participantIndex + 1} / {REAL_PARTICIPANTS.length}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                  Materi
                </p>
                <p className="mt-1 text-sm font-black text-white sm:text-base md:text-lg">
                  {criterionIndex + 1} / {allCriteria.length}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 text-center sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                  Sudah Dinilai
                </p>
                <p className="mt-1 text-sm font-black text-emerald-400 sm:text-base md:text-lg">
                  {completedCriteriaCount} / {allCriteria.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            CURRENT PARTICIPANT INFORMATION CARD
        ================================================= */}
        <section className="mt-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#071a3d] text-lg font-black text-white sm:h-16 sm:w-16 sm:text-xl">
                  {currentParticipant.number}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                    PESERTA {participantIndex + 1}
                  </p>
                  <h2 className="mt-1 break-words text-lg font-black leading-tight text-[#071a3d] sm:text-xl md:text-2xl">
                    {currentParticipant.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentParticipant.school || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Participant Navigation Bar */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setShowCriterionPicker(true)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-[#071a3d] transition hover:border-blue-200 hover:bg-blue-50 sm:px-4"
            >
              Pindah Materi
            </button>
            <button
              type="button"
              onClick={() => setShowParticipantPicker(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#071a3d] transition hover:border-blue-200 hover:bg-blue-50"
            >
              Pindah Peserta
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Peserta #${currentParticipant.number} ${currentParticipant.name} ditandai.`);
              }}
              className="col-span-2 min-h-11 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-50 sm:col-span-1"
            >
              Tandai Catatan Khusus
            </button>
          </div>

          {/* =================================================
              CURRENT CRITERION BOX (1 MATERI AT A TIME)
          ================================================= */}
          {currentCriterion ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Materi Header */}
              <div className="border-b border-slate-200 p-4 sm:p-5 md:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-base font-black text-blue-700 sm:h-12 sm:w-12 sm:text-lg">
                      {criterionIndex + 1}
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        MATERI {criterionIndex + 1} DARI {allCriteria.length}
                      </p>
                      <h3 className="mt-1 break-words text-lg font-black leading-tight text-[#071a3d] sm:text-xl md:text-2xl">
                        {currentCriterion.name}
                      </h3>
                      {currentCriterion.section ? (
                        <p className="mt-1 text-sm text-slate-400">
                          {currentCriterion.section}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {currentCriterion.difficulty ? (
                    <span
                      className={`self-start rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        currentCriterion.difficulty === "SULIT"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {currentCriterion.difficulty} (Interval: {currentCriterion.interval})
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Score Option Instruction Header */}
              <div className="p-4 sm:p-5 md:p-8">
                <div className="mb-7 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    PILIH NILAI
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    Tekan salah satu nilai sesuai hasil penilaian.
                  </p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-blue-500">
                    Nilai sesuai opsi materi · tanpa perhitungan
                  </p>
                </div>

                {/* =================================================
                    FOUR SCORE GROUPS (KURANG, CUKUP, BAIK, SANGAT BAIK)
                ================================================= */}
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 md:gap-6">
                  {/* KOLOM 1: KURANG (3 OPSI) */}
                  <div className="flex min-w-0 flex-col">
                    <div className="mb-3 text-center">
                      <h4 className="text-sm font-black uppercase text-[#071a3d] md:text-base">
                        KURANG
                      </h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {scoreGroups.kurang.map((option) => {
                        const isSelected = currentValue?.score === option.score;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={saving}
                            onClick={() => handleSelectOption(option)}
                            className={[
                              "relative flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 px-4 transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
                              isSelected
                                ? "border-[#1769e0] bg-[#1769e0] text-white shadow-md shadow-blue-100"
                                : "border-slate-300 bg-white text-[#071a3d] hover:border-[#1769e0] hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <span className={["text-xl font-black md:text-2xl", isSelected ? "text-white" : "text-[#071a3d]"].join(" ")}>
                              {formatScore(option.score)}
                            </span>
                            <span className={["absolute bottom-1 left-0 right-0 truncate px-2 text-[8px] font-bold uppercase", isSelected ? "text-white/70" : "text-slate-400"].join(" ")}>
                              {option.label}
                            </span>
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-[#1769e0]">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* KOLOM 2: CUKUP (3 OPSI) */}
                  <div className="flex min-w-0 flex-col">
                    <div className="mb-3 text-center">
                      <h4 className="text-sm font-black uppercase text-[#071a3d] md:text-base">
                        CUKUP
                      </h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {scoreGroups.cukup.map((option) => {
                        const isSelected = currentValue?.score === option.score;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={saving}
                            onClick={() => handleSelectOption(option)}
                            className={[
                              "relative flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 px-4 transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
                              isSelected
                                ? "border-[#1769e0] bg-[#1769e0] text-white shadow-md shadow-blue-100"
                                : "border-slate-300 bg-white text-[#071a3d] hover:border-[#1769e0] hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <span className={["text-xl font-black md:text-2xl", isSelected ? "text-white" : "text-[#071a3d]"].join(" ")}>
                              {formatScore(option.score)}
                            </span>
                            <span className={["absolute bottom-1 left-0 right-0 truncate px-2 text-[8px] font-bold uppercase", isSelected ? "text-white/70" : "text-slate-400"].join(" ")}>
                              {option.label}
                            </span>
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-[#1769e0]">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* KOLOM 3: BAIK (3 OPSI) */}
                  <div className="flex min-w-0 flex-col">
                    <div className="mb-3 text-center">
                      <h4 className="text-sm font-black uppercase text-[#071a3d] md:text-base">
                        BAIK
                      </h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {scoreGroups.baik.map((option) => {
                        const isSelected = currentValue?.score === option.score;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={saving}
                            onClick={() => handleSelectOption(option)}
                            className={[
                              "relative flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 px-4 transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
                              isSelected
                                ? "border-[#1769e0] bg-[#1769e0] text-white shadow-md shadow-blue-100"
                                : "border-slate-300 bg-white text-[#071a3d] hover:border-[#1769e0] hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <span className={["text-xl font-black md:text-2xl", isSelected ? "text-white" : "text-[#071a3d]"].join(" ")}>
                              {formatScore(option.score)}
                            </span>
                            <span className={["absolute bottom-1 left-0 right-0 truncate px-2 text-[8px] font-bold uppercase", isSelected ? "text-white/70" : "text-slate-400"].join(" ")}>
                              {option.label}
                            </span>
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-[#1769e0]">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* KOLOM 4: SANGAT BAIK (1 OPSI / PEAK) */}
                  <div className="flex min-w-0 flex-col">
                    <div className="mb-3 text-center">
                      <h4 className="text-sm font-black uppercase text-[#071a3d] md:text-base">
                        SANGAT BAIK
                      </h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {scoreGroups.sangatBaik.map((option) => {
                        const isSelected = currentValue?.score === option.score;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={saving}
                            onClick={() => handleSelectOption(option)}
                            className={[
                              "relative flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 px-4 transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
                              isSelected
                                ? "border-[#1769e0] bg-[#1769e0] text-white shadow-md shadow-blue-100"
                                : "border-slate-300 bg-white text-[#071a3d] hover:border-[#1769e0] hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <span className={["text-xl font-black md:text-2xl", isSelected ? "text-white" : "text-[#071a3d]"].join(" ")}>
                              {formatScore(option.score)}
                            </span>
                            <span className={["absolute bottom-1 left-0 right-0 truncate px-2 text-[8px] font-bold uppercase", isSelected ? "text-white/70" : "text-slate-400"].join(" ")}>
                              {option.label} (Peak)
                            </span>
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-[#1769e0]">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    CATATAN JURI — OPSIONAL
                ================================================= */}
                <div className="mt-8">
                  <label
                    htmlFor="judge-note"
                    className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400"
                  >
                    CATATAN JURI — OPSIONAL
                  </label>
                  <textarea
                    id="judge-note"
                    value={currentValue?.note || ""}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Catatan untuk materi ini..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* =================================================
                  BOTTOM NAVIGATION BAR
              ================================================= */}
              <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
                <button
                  type="button"
                  disabled={saving || criterionIndex === 0}
                  onClick={() => setCriterionIndex((prev) => Math.max(0, prev - 1))}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto hover:bg-slate-100 transition"
                >
                  ← Sebelumnya
                </button>

                <div className="order-first text-center sm:order-none">
                  {saving ? (
                    <p className="text-xs font-black text-blue-600 animate-pulse">
                      Menyimpan nilai...
                    </p>
                  ) : successMessage ? (
                    <p className="text-xs font-black text-emerald-600">
                      ✓ {successMessage}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-slate-400">
                      Pilih nilai untuk melanjutkan
                    </p>
                  )}
                </div>

                <div className="min-w-0 text-center text-xs font-bold leading-5 text-slate-400 sm:min-w-[180px] sm:text-right">
                  {criterionIndex < allCriteria.length - 1
                    ? "Pilih nilai → otomatis ke materi berikutnya"
                    : "Pilih nilai terakhir → Review & Submit"}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* =================================================
            MODAL: PINDAH MATERI (DRAWER)
        ================================================= */}
        {showCriterionPicker ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a3d]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
              <div className="shrink-0 border-b border-slate-200 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.18em] text-blue-600 sm:text-[10px]">
                      Navigasi Materi
                    </p>
                    <h2 className="mt-1 text-lg font-black text-[#071a3d] sm:text-xl">
                      Pindah Materi
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      Pilih materi yang ingin dibuka. Nilai yang sudah tersimpan tetap aman.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCriterionPicker(false)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 sm:p-4">
                {allCriteria.map((criterion, idx) => {
                  const key = `${currentParticipant.id}:${criterion.id}`;
                  const saved = savedScores[key];
                  const isActive = idx === criterionIndex;
                  const isCompleted = saved?.score !== undefined;

                  return (
                    <button
                      key={criterion.id}
                      type="button"
                      onClick={() => {
                        setCriterionIndex(idx);
                        setShowCriterionPicker(false);
                      }}
                      className={[
                        "flex min-h-[64px] w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99]",
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black sm:h-11 sm:w-11 sm:text-sm",
                          isActive ? "bg-[#1769e0] text-white" : "bg-[#071a3d] text-white",
                        ].join(" ")}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-xs font-black leading-5 text-[#071a3d] sm:text-sm">
                          {criterion.name}
                        </p>
                        {criterion.section ? (
                          <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400 sm:text-xs">
                            {criterion.section}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-right">
                        {isActive ? (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-[8px] font-black uppercase text-blue-700 sm:text-[9px]">
                            Aktif
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase text-emerald-700 sm:text-[9px]">
                            ✓ Dinilai
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500 sm:text-[9px]">
                            Belum
                          </span>
                        )}

                        {isCompleted && !isActive && saved ? (
                          <p className="mt-1 text-[10px] font-black text-[#071a3d] sm:text-xs">
                            {formatScore(saved.score)}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={() => setShowCriterionPicker(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-100"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* =================================================
            MODAL: PINDAH PESERTA (DRAWER)
        ================================================= */}
        {showParticipantPicker ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a3d]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                      Navigasi Peserta
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                      Pindah Peserta
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih pasukan yang ingin Anda nilai. Nilai yang sudah tersimpan tetap aman.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowParticipantPicker(false)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 sm:max-h-[60vh] sm:p-4">
                {REAL_PARTICIPANTS.map((participant, idx) => {
                  const isActive = idx === participantIndex;
                  const isSubmitted = Boolean(
                    submittedParticipants[`${participant.id}:${currentCategory.id}`]
                  );

                  return (
                    <button
                      key={participant.id}
                      type="button"
                      onClick={() => {
                        setParticipantIndex(idx);
                        setCriterionIndex(0);
                        setShowParticipantPicker(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black ${
                          isActive ? "bg-[#1769e0] text-white" : "bg-[#071a3d] text-white"
                        }`}
                      >
                        {participant.number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#071a3d]">
                          {participant.name}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-400">
                          {participant.school || "-"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Peserta
                        </p>
                        <p className="text-xs font-black text-[#071a3d]">
                          {idx + 1} / {REAL_PARTICIPANTS.length}
                        </p>
                        {isSubmitted ? (
                          <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                            ✓ Submit
                          </span>
                        ) : isActive ? (
                          <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase text-blue-700">
                            Aktif
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={() => setShowParticipantPicker(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* =================================================
            MODAL: REVIEW & SUBMIT
        ================================================= */}
        {showReview ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a3d]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
              <div className="shrink-0 border-b border-slate-200 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                      Review Penilaian
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                      {currentParticipant.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      No. {currentParticipant.number} • {currentParticipant.school || "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReview(false)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                        Kelengkapan Materi
                      </p>
                      <p className="mt-1 text-lg font-black text-[#071a3d]">
                        {completedCriteriaCount} / {allCriteria.length} materi
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <p className={`mt-0.5 text-xs font-black ${completedCriteriaCount === allCriteria.length ? "text-emerald-600" : "text-amber-600"}`}>
                        {completedCriteriaCount === allCriteria.length ? "SIAP SUBMIT" : "BELUM LENGKAP"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {allCriteria.map((criterion, idx) => {
                    const key = `${currentParticipant.id}:${criterion.id}`;
                    const value = savedScores[key];

                    return (
                      <div
                        key={criterion.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#071a3d] text-xs font-black text-white">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-xs font-black leading-5 text-[#071a3d] sm:text-sm">
                            {criterion.name}
                          </p>
                          {criterion.section ? (
                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                              {criterion.section}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-base font-black text-[#071a3d]">
                            {value?.score !== undefined ? formatScore(value.score) : "—"}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {value?.label || "Belum"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReview(false)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
                  >
                    Kembali Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitParticipant}
                    disabled={completedCriteriaCount !== allCriteria.length || isCurrentParticipantSubmitted}
                    className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCurrentParticipantSubmitted ? "Sudah Terkunci" : "Kunci & Submit Nilai"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* =================================================
            MODAL: AJUKAN PERUBAHAN NILAI
        ================================================= */}
        {showChangeRequest ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a3d]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-600">
                      Permintaan Perubahan
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                      Ajukan Perubahan Nilai
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Nilai tidak akan berubah sebelum disetujui Admin/Operator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChangeRequest(false)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                    Peserta
                  </p>
                  <p className="mt-1 text-sm font-black text-[#071a3d]">
                    {currentParticipant.name} (No. {currentParticipant.number})
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {currentCategory.name} • Status: SUBMITTED
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="score-change-reason"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-[#071a3d]"
                  >
                    Alasan Perubahan
                  </label>
                  <textarea
                    id="score-change-reason"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    rows={4}
                    placeholder="Contoh: Saya keliru memilih opsi nilai pada materi Berkumpul dan ingin mengoreksinya."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowChangeRequest(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangeRequestSent(true);
                    setShowChangeRequest(false);
                    alert("Permintaan perubahan nilai berhasil dikirimkan ke Admin.");
                  }}
                  disabled={changeReason.trim().length < 5}
                  className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-100 transition hover:bg-amber-600 disabled:opacity-50"
                >
                  Kirim Permintaan
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
