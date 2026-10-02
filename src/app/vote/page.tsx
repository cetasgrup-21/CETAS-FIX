"use client";

import { useState } from "react";
import { Award, Zap, CheckCircle2, ShieldCheck, Heart, Users } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface Candidate {
  id: string;
  number: string;
  name: string;
  major: string;
  photoUrl: string;
  tagline: string;
  votes: number;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snap?: any;
  }
}

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "cand-01",
      number: "01",
      name: "Nadia Safira",
      major: "Teknik Informatika 2023",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      tagline: "Inovasi digital untuk pemberdayaan generasi muda kampus.",
      votes: 1482,
    },
    {
      id: "cand-02",
      number: "02",
      name: "Reza Pratama",
      major: "Ilmu Komunikasi 2022",
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      tagline: "Kolaborasi aktif dan kepemimpinan inklusif berkarakter.",
      votes: 1120,
    },
    {
      id: "cand-03",
      number: "03",
      name: "Citra Lestari",
      major: "Desain Komunikasi Visual 2024",
      photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      tagline: "Kreativitas tanpa batas mengangkat budaya Nusantara.",
      votes: 702,
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [voteCount, setVoteCount] = useState<number>(5);
  const [pricePerVote] = useState<number>(2000);

  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voteStatus, setVoteStatus] = useState<string | null>(null);

  const totalVotesOverall = candidates.reduce((sum, c) => sum + c.votes, 0);

  const votePackages = [
    { count: 1, label: "1 Suara", price: 2000 },
    { count: 5, label: "5 Suara (Hemat 5%)", price: 9500 },
    { count: 10, label: "10 Suara (Hemat 10%)", price: 18000 },
    { count: 50, label: "50 Suara (Best Value)", price: 85000 },
    { count: 100, label: "100 Suara (VIP Pack)", price: 160000 },
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
              name: `Paket Voting (${voteCount} Suara) untuk #${selectedCandidate.number} ${selectedCandidate.name}`,
              quantity: voteCount,
              price: currentPackagePrice / voteCount,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat transaksi voting");
      }

      // Jika Midtrans Snap aktif di browser
      if (typeof window !== "undefined" && window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: function (result: unknown) {
            console.log("Midtrans payment success:", result);
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === selectedCandidate.id ? { ...c, votes: c.votes + voteCount } : c
              )
            );
            setVoteStatus(
              `Terima kasih! Pembayaran ${formatRupiah(currentPackagePrice)} berhasil. ${voteCount} suara telah ditambahkan ke ${selectedCandidate.name}.`
            );
            setSelectedCandidate(null);
          },
          onPending: function (result: unknown) {
            console.log("Payment pending:", result);
            setVoteStatus("Menunggu penyelesaian pembayaran di Midtrans...");
          },
          onError: function (err: unknown) {
            console.error("Payment error:", err);
            setVoteStatus("Pembayaran dibatalkan atau gagal.");
          },
          onClose: function () {
            setIsLoading(false);
          },
        });
      } else {
        // Fallback simulasi jika di mode development tanpa kunci API live
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id ? { ...c, votes: c.votes + voteCount } : c
          )
        );
        setVoteStatus(
          `[Simulasi Sukses] ${voteCount} suara berhasil diberikan kepada #${selectedCandidate.number} ${selectedCandidate.name}!`
        );
        setSelectedCandidate(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala koneksi";
      setVoteStatus(`Gagal: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title & Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/60 px-4 py-1 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-3 border border-amber-200 dark:border-amber-800/60">
          <Award className="h-4 w-4" />
          Cetas Vote • E-Voting Terpercaya & Anti-Manipulasi
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Pemilihan Duta Inspiratif & Brand Ambassador 2026
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Dukung kandidat favoritmu! Setiap transaksi voting menggunakan QRIS / Virtual Account Midtrans yang langsung dicatat secara real-time ke papan peringkat.
        </p>

        {voteStatus && (
          <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {voteStatus}
          </div>
        )}
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {candidates.map((cand) => {
          const percentage = ((cand.votes / totalVotesOverall) * 100).toFixed(1);
          return (
            <div
              key={cand.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition hover:shadow-xl"
            >
              {/* Candidate Image & Tag */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cand.photoUrl}
                  alt={cand.name}
                  className="h-full w-full object-cover object-top transition duration-500 hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/90 text-white font-black text-base shadow-md backdrop-blur-md">
                  {cand.number}
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-orange-500/90 text-white px-3 py-1 text-[11px] font-bold shadow backdrop-blur-sm flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-current" />
                  {percentage}% Suara
                </div>
              </div>

              {/* Bio & Standings */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {cand.name}
                  </h3>
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">
                    {cand.major}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-4">
                    &ldquo;{cand.tagline}&rdquo;
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Total Dukungan
                    </span>
                    <span className="text-slate-900 dark:text-white font-black">
                      {cand.votes.toLocaleString("id-ID")} Suara
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-xs shadow-md shadow-orange-500/20 transition active:scale-95"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    Vote #{cand.number} {cand.name}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voting Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Cetas Vote • Pop-Up
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Dukung #{selectedCandidate.number} {selectedCandidate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayVote} className="space-y-4">
              {/* Paket Suara */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Paket Jumlah Suara
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {votePackages.map((pkg) => (
                    <button
                      type="button"
                      key={pkg.count}
                      onClick={() => setVoteCount(pkg.count)}
                      className={`rounded-xl p-2.5 text-left border text-xs transition ${
                        voteCount === pkg.count
                          ? "border-orange-500 bg-orange-50 text-orange-950 font-bold dark:bg-orange-950/40 dark:text-orange-200"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div>{pkg.label}</div>
                      <div className="text-[11px] text-orange-600 dark:text-orange-400 font-extrabold mt-0.5">
                        {formatRupiah(pkg.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Pendukung */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pendukung *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@anda.com"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={voterPhone}
                      onChange={(e) => setVoterPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Total Pembayaran Midtrans</div>
                  <div className="text-base font-black text-orange-600 dark:text-orange-400">
                    {formatRupiah(currentPackagePrice)}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-orange-500/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isLoading ? "Menyiapkan..." : "Bayar via Midtrans"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
