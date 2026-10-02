"use client";

import { useState, useEffect } from "react";
import { Award, Zap, CheckCircle2, ShieldCheck, Heart, Users, Sparkles, School, GraduationCap, Medal, Calendar, ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { MidtransSimulatorModal } from "@/components/midtrans-simulator-modal";
import { getEventTheme } from "@/lib/event-theme";
import {
  INITIAL_EVENT_VOTINGS,
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
} from "@/lib/vote-unified-data";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snap?: any;
  }
}

export default function VotePage() {
  const [eventVotings, setEventVotings] = useState<EventVotingConfig[]>(INITIAL_EVENT_VOTINGS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENT_VOTINGS[0].eventId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    INITIAL_EVENT_VOTINGS[0].categories[0].id
  );

  // Candidate selection & voting modal
  const [selectedCandidate, setSelectedCandidate] = useState<VoteCandidate | null>(null);
  const [voteCount, setVoteCount] = useState<number>(5);
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voteStatus, setVoteStatus] = useState<string | null>(null);
  const [simulatorData, setSimulatorData] = useState<{
    orderNumber: string;
    grossAmount: number;
    customerName: string;
  } | null>(null);

  // Fetch updated data from API
  useEffect(() => {
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.eventVotings && data.eventVotings.length > 0) {
          setEventVotings(data.eventVotings);
        }
      })
      .catch(() => {});
  }, []);

  const activeEvent =
    eventVotings.find((e) => e.eventId === selectedEventId) || eventVotings[0];

  const theme = getEventTheme(activeEvent?.themePreset);

  const activeCategory =
    activeEvent.categories.find((c) => c.id === selectedCategoryId) ||
    activeEvent.categories[0];

  const candidates = activeCategory ? activeCategory.candidates : [];

  // Update selected category if activeEvent changes
  useEffect(() => {
    if (activeEvent && activeEvent.categories.length > 0) {
      const exists = activeEvent.categories.some((c) => c.id === selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId(activeEvent.categories[0].id);
      }
    }
  }, [selectedEventId, activeEvent, selectedCategoryId]);

  const totalVotesInCategory = candidates.reduce((sum, c) => sum + c.totalVotes, 0);

  const pricePerVote = activeCategory?.pricePerVote || 2000;
  const votePackages = [
    { count: 1, label: "1 Suara", price: pricePerVote },
    { count: 5, label: "5 Suara (Diskon 5%)", price: Math.round(pricePerVote * 5 * 0.95) },
    { count: 10, label: "10 Suara (Diskon 10%)", price: Math.round(pricePerVote * 10 * 0.9) },
    { count: 50, label: "50 Suara (Best Value)", price: Math.round(pricePerVote * 50 * 0.85) },
    { count: 100, label: "100 Suara (VIP Pack)", price: Math.round(pricePerVote * 100 * 0.8) },
  ];

  const currentPackagePrice =
    votePackages.find((p) => p.count === voteCount)?.price ?? voteCount * pricePerVote;

  const handlePayVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsLoading(true);
    setVoteStatus(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "VOTE",
          customerName: voterName,
          customerEmail: voterEmail,
          customerPhone: voterPhone,
          items: [
            {
              id: selectedCandidate.id,
              name: `Paket Voting (${voteCount} Suara) untuk #${selectedCandidate.candidateNumber} ${selectedCandidate.name} [${activeCategory.title}]`,
              quantity: voteCount,
              price: currentPackagePrice / voteCount,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal checkout");

      // Midtrans Live or Simulator
      if (data.isSimulationFallback || !data.snapToken || data.snapToken.startsWith("SNAP-SIMULATION")) {
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: currentPackagePrice,
          customerName: voterName,
        });
      } else if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => applySuccessfulVote(),
          onPending: () => setVoteStatus("Pembayaran sedang menunggu settlement Midtrans."),
          onError: () => setVoteStatus("Pembayaran dibatalkan atau gagal."),
        });
      } else {
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: currentPackagePrice,
          customerName: voterName,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setVoteStatus(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuccessfulVote = () => {
    if (!selectedCandidate) return;
    const addedVotes = voteCount;

    // Update in-memory / state
    setEventVotings((prev) =>
      prev.map((ev) => {
        if (ev.eventId !== activeEvent.eventId) return ev;
        return {
          ...ev,
          categories: ev.categories.map((cat) => {
            if (cat.id !== activeCategory.id) return cat;
            return {
              ...cat,
              candidates: cat.candidates.map((cand) =>
                cand.id === selectedCandidate.id
                  ? { ...cand, totalVotes: cand.totalVotes + addedVotes }
                  : cand
              ),
            };
          }),
        };
      })
    );

    // Call API update with secure RECORD_VOTE
    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "RECORD_VOTE",
        eventId: activeEvent.eventId,
        categoryId: activeCategory.id,
        candidateId: selectedCandidate.id,
        addedVotes: addedVotes,
        orderNumber: simulatorData?.orderNumber || `VOTE-${Date.now()}`,
        voterName: voterName || "Voter Publik Cetas",
      }),
    }).catch(() => {});

    setVoteStatus(`Terima kasih! ${addedVotes} Suara berhasil diverifikasi untuk ${selectedCandidate.name}.`);
    setSimulatorData(null);
  };

  const sortedCandidates = [...candidates].sort((a, b) => b.totalVotes - a.totalVotes);

  const getCategoryIcon = (title: string) => {
    if (title.toLowerCase().includes("smp")) return <School className="h-4 w-4" />;
    if (title.toLowerCase().includes("sma")) return <GraduationCap className="h-4 w-4" />;
    return <Medal className="h-4 w-4" />;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border transition shadow-sm ${theme.badgeClass}`}>
          <Award className="h-4 w-4" />
          Sistem E-Voting Terpadu Cetas Vote
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Papan Voting & Pemilihan Favorit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Dukung peserta jagoan Anda sesuai <strong>Event & Kategori (SMP, SMA, Purna)</strong> secara transparan, aman, dan terverifikasi otomatis via Midtrans.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SELEKTOR EVENT (Sesuai Event Yang Ada di Cetas) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Pilih Event Cetas:
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {eventVotings.length} Event Membuka Voting Online
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {eventVotings.map((ev) => {
            const evTheme = getEventTheme(ev.themePreset);
            const isActive = ev.eventId === activeEvent.eventId;
            return (
              <button
                key={ev.eventId}
                onClick={() => setSelectedEventId(ev.eventId)}
                className={`px-4 py-3 rounded-2xl border text-left transition shrink-0 flex items-center gap-3 ${
                  isActive
                    ? `${evTheme.borderClass} ${evTheme.bgSoftClass} ring-2 ring-opacity-20 shadow-sm scale-[1.01]`
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${evTheme.bgGradient}`}>
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                    {ev.eventTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{ev.eventDate}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className={`font-semibold ${evTheme.textClass}`}>{evTheme.name.split(" ")[0]}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SELEKTOR KATEGORI (Misal: SMP, SMA, Purna) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
              Event: {activeEvent.eventTitle}
            </span>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              2. Pilih Kategori Lomba / Divisi:
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Total {totalVotesInCategory.toLocaleString()} Suara Masuk di Kategori Ini
          </span>
        </div>

        {/* Category Tabs: SMP, SMA, Purna */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeEvent.categories.map((cat) => {
            const isSelected = cat.id === activeCategory.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border ${
                  isSelected
                    ? `${theme.buttonClass} shadow-md scale-[1.02]`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                {getCategoryIcon(cat.title)}
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-black/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat.candidates.length} Peserta
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory?.description && (
          <p className="text-xs text-slate-500 italic pt-1">
            &ldquo;{activeCategory.description}&rdquo;
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. DAFTAR PESERTA / KANDIDAT (BERBEDA PER KATEGORI) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            3. Peserta Terdaftar di Kategori &ldquo;{activeCategory.title}&rdquo; ({candidates.length} Peserta)
          </h3>
          <span className="text-xs text-slate-500">
            Biaya per suara: <strong>{formatRupiah(pricePerVote)}</strong>
          </span>
        </div>

        {voteStatus && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            {voteStatus}
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
            Belum ada peserta yang didaftarkan pada kategori ini. Silakan tambahkan peserta melalui Lingkup Kerja Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCandidates.map((cand, idx) => {
              const percentage =
                totalVotesInCategory > 0
                  ? Math.round((cand.totalVotes / totalVotesInCategory) * 100)
                  : 0;

              return (
                <div
                  key={cand.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="h-24 w-24 rounded-2xl object-cover border-2 border-orange-500/20 shadow-md"
                        />
                        <span className="absolute -bottom-2 -left-2 rounded-lg bg-orange-500 text-white font-black text-xs px-2 py-0.5 shadow">
                          #{cand.candidateNumber}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Peringkat #{idx + 1}
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {cand.totalVotes.toLocaleString()}
                        </div>
                        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                          {percentage}% Suara
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {cand.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {cand.institution}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2">
                      &ldquo;{cand.tagline}&rdquo;
                    </p>

                    {/* Progress Bar Suara */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.bgGradient}`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setVoteCount(5);
                        setVoteStatus(null);
                      }}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-extrabold py-2.5 text-xs shadow-md transition active:scale-95 ${theme.buttonClass}`}
                    >
                      <Heart className="h-4 w-4" />
                      Vote #{cand.candidateNumber} {cand.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL CHECKOUT VOTE VIA MIDTRANS */}
      {/* ------------------------------------------------------------- */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">
                  Kategori: {activeCategory.title}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Vote untuk #{selectedCandidate.candidateNumber} {selectedCandidate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayVote} className="space-y-4">
              {/* Pilihan Paket Vote */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Paket Jumlah Suara:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {votePackages.map((pkg) => (
                    <button
                      key={pkg.count}
                      type="button"
                      onClick={() => setVoteCount(pkg.count)}
                      className={`p-3 rounded-xl border text-left transition ${
                        voteCount === pkg.count
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 ring-2 ring-orange-500/20 font-bold"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="text-xs">{pkg.label}</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {formatRupiah(pkg.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Pemilih */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pemilih *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@anda.com"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={voterPhone}
                      onChange={(e) => setVoterPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Total Pembayaran
                  </span>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-400">
                    {formatRupiah(currentPackagePrice)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {isLoading ? "Menyiapkan..." : "Lanjut Pembayaran →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal jika offline merchant key */}
      <MidtransSimulatorModal
        isOpen={Boolean(simulatorData)}
        onClose={() => setSimulatorData(null)}
        orderNumber={simulatorData?.orderNumber || ""}
        grossAmount={simulatorData?.grossAmount || 0}
        customerName={simulatorData?.customerName || ""}
        onSuccess={applySuccessfulVote}
      />
    </div>
  );
}
