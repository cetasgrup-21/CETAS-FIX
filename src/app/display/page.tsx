"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Level = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type Participant = {
  id: string;
  number: number;
  name: string;
  school: string | null;
};

type OverallRow = {
  participant: Participant;
  finalScore: number;
  complete: boolean;
  rank: number | null;
};

type AwardWinner = {
  id: string;
  participantId: string;
  winnerOrder: number;
  score: number | null;
  participant: Participant;
};

type AwardCategory = {
  id: string;
  eventId: string;
  eventLevelId: string | null;
  name: string;
  method: string;
  sortOrder: number;
  status: string;
  winners: AwardWinner[];
};

type RekapResponse = {
  success: boolean;
  error?: string;
  event?: {
    id: string;
    name: string;
    totalPoints: number;
  };
  levels?: Level[];
  rows?: OverallRow[];
};

type AwardResponse = {
  success: boolean;
  error?: string;
  event?: {
    id: string;
    name: string;
    totalPoints: number;
  };
  levels?: Level[];
  awards?: AwardCategory[];
};

const formatNumber = (value: unknown) =>
  Number(value || 0).toLocaleString("id-ID");

export default function DisplayPage() {
  const [eventName, setEventName] = useState("Memuat event...");
  const [levels, setLevels] = useState<Level[]>([]);
  const [overallRows, setOverallRows] = useState<OverallRow[]>([]);
  const [awards, setAwards] = useState<AwardCategory[]>([]);

  const [levelId, setLevelId] = useState("");
  const [awardId, setAwardId] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true);
        else setLoading(true);

        setError("");

        const query = levelId
          ? `?eventLevelId=${encodeURIComponent(levelId)}`
          : "";

        const [rekapRes, awardRes] = await Promise.all([
          fetch(`/api/rekap${query}`, { cache: "no-store" }),
          fetch(`/api/award${query}`, { cache: "no-store" }),
        ]);

        const rekap = (await rekapRes.json()) as RekapResponse;
        const award = (await awardRes.json()) as AwardResponse;

        if (!rekapRes.ok || !rekap.success) {
          throw new Error(
            rekap.error || "Gagal mengambil hasil keseluruhan."
          );
        }

        if (!awardRes.ok || !award.success) {
          throw new Error(
            award.error || "Gagal mengambil kategori juara."
          );
        }

        setEventName(
          award.event?.name ||
            rekap.event?.name ||
            "CETAS SCORE"
        );

        setLevels(
          [...(award.levels || rekap.levels || [])].sort(
            (a, b) => a.sortOrder - b.sortOrder
          )
        );

        setOverallRows(
          (rekap.rows || [])
            .filter((row) => row.complete)
            .sort((a, b) => {
              const rankA = a.rank ?? 999999;
              const rankB = b.rank ?? 999999;
              if (rankA !== rankB) return rankA - rankB;
              return a.participant.number - b.participant.number;
            })
        );

        setAwards(
          [...(award.awards || [])]
            .filter((item) => item.status !== "ARCHIVED")
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );

        setLastUpdated(new Date());
      } catch (err) {
        console.error("DISPLAY LOAD ERROR:", err);

        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil data display."
          );
        }
      } finally {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [levelId]
  );

  useEffect(() => {
    void loadData(false);

    // Display diperbarui otomatis setiap 1 menit agar ringan di jaringan LAN.
    const interval = window.setInterval(() => {
      void loadData(true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const handleFullscreen = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreen);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("FULLSCREEN ERROR:", err);
    }
  };

  const visibleAwards = useMemo(() => {
    if (!levelId) return awards;

    return awards.filter(
      (award) => !award.eventLevelId || award.eventLevelId === levelId
    );
  }, [awards, levelId]);

  useEffect(() => {
    if (!awardId) return;

    const exists = visibleAwards.some((award) => award.id === awardId);

    if (!exists) setAwardId("");
  }, [visibleAwards, awardId]);

  const selectedAward = useMemo(
    () => visibleAwards.find((award) => award.id === awardId) || null,
    [visibleAwards, awardId]
  );

  const selectedAwardRows = useMemo(() => {
    if (!selectedAward) return [];

    return [...selectedAward.winners]
      .sort((a, b) => a.winnerOrder - b.winnerOrder)
      .slice(0, 3)
      .map((winner) => ({
        participant: winner.participant,
        displayScore: winner.score ?? 0,
        displayRank: winner.winnerOrder,
      }));
  }, [selectedAward]);

  const awardBoards = useMemo(
    () =>
      visibleAwards.map((award) => ({
        award,
        winners: [...award.winners]
          .sort((a, b) => a.winnerOrder - b.winnerOrder)
          .slice(0, 3),
      })),
    [visibleAwards]
  );

  return (
    <main className="min-h-screen bg-[#071a3d] text-white">
      <div className="min-h-screen px-5 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-[1800px]">
          <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.35em] text-blue-300">
                CETAS SCORE
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
                LIVE RESULTS
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/60 md:text-lg">
                {eventName}
              </p>

              {selectedAward && (
                <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                  {selectedAward.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={levelId}
                onChange={(event) => {
                  setLevelId(event.target.value);
                  setAwardId("");
                }}
                className="min-w-[230px] rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white outline-none backdrop-blur focus:border-blue-400/50"
              >
                <option value="" className="text-slate-900">
                  Semua Tingkatan
                </option>

                {levels.map((level) => (
                  <option
                    key={level.id}
                    value={level.id}
                    className="text-slate-900"
                  >
                    {level.name}
                  </option>
                ))}
              </select>

              <select
                value={awardId}
                onChange={(event) => setAwardId(event.target.value)}
                className="min-w-[280px] rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white outline-none backdrop-blur focus:border-blue-400/50"
              >
                <option value="" className="text-slate-900">
                  Semua Kategori Juara
                </option>

                {visibleAwards.map((award) => (
                  <option
                    key={award.id}
                    value={award.id}
                    className="text-slate-900"
                  >
                    {award.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black transition hover:bg-blue-500"
              >
                {fullscreen ? "Keluar Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <section className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-400" />
                <p className="mt-4 text-sm font-bold text-white/60">
                  Memuat hasil...
                </p>
              </div>
            </section>
          ) : (!selectedAward && awardBoards.length === 0) ? (
            <section className="flex min-h-[60vh] items-center justify-center">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center">
                <p className="text-2xl font-black">
                  BELUM ADA HASIL
                </p>
                <p className="mt-2 text-sm text-white/50">
                  Kategori juara akan muncul setelah ditentukan.
                </p>
              </div>
            </section>
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-white/30">
                    {selectedAward
                      ? "KATEGORI JUARA"
                      : "SELURUH KATEGORI JUARA"}
                  </p>

                  <p className="mt-1 text-xl font-black text-white/80">
                    {selectedAward?.name || "HASIL KATEGORI JUARA"}
                  </p>
                </div>

                <p className="hidden text-xs font-bold text-white/30 md:block">
                  3 PERINGKAT TERATAS
                </p>
              </div>

              {selectedAward ? (
                <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  <div className="border-b border-white/10 bg-white/[0.06] px-5 py-4">
                    <p className="text-lg font-black text-white">
                      {selectedAward.name}
                    </p>
                  </div>

                  <div className="divide-y divide-white/5">
                    {selectedAwardRows.map((row) => {
                      const school =
                        row.participant.school ||
                        row.participant.name ||
                        "-";

                      return (
                        <div
                          key={row.participant.id}
                          className="grid grid-cols-[52px_1fr_auto] items-center gap-3 px-5 py-3"
                        >
                          <div className="text-2xl font-black text-white/70">
                            {row.displayRank}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-base font-black text-white">
                              {school}
                            </p>
                            <p className="truncate text-xs font-semibold text-white/35">
                              {row.participant.name}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black text-blue-300">
                              {formatNumber(row.displayScore)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : awardBoards.length > 0 ? (
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {awardBoards.map(({ award, winners }) => (
                    <div
                      key={award.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                    >
                      <div className="border-b border-white/10 bg-white/[0.06] px-4 py-3">
                        <p className="truncate text-sm font-black uppercase tracking-wide text-white">
                          {award.name}
                        </p>
                      </div>

                      <div className="divide-y divide-white/5">
                        {winners.length > 0 ? (
                          winners.map((winner) => (
                            <div
                              key={winner.id}
                              className="grid grid-cols-[34px_1fr] items-center gap-3 px-4 py-2.5"
                            >
                              <div className="text-lg font-black text-white/60">
                                {winner.winnerOrder}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">
                                  {winner.participant.school ||
                                    winner.participant.name ||
                                    "-"}
                                </p>
                                <p className="truncate text-[11px] font-semibold text-white/30">
                                  {winner.participant.name}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-xs font-semibold text-white/30">
                            Belum ada pemenang.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-12 text-center">
                  <p className="text-lg font-black text-white/60">
                    BELUM ADA KATEGORI JUARA
                  </p>
                  <p className="mt-2 text-sm text-white/30">
                    Kategori juara akan tampil setelah ditentukan.
                  </p>
                </section>
              )}

              <footer className="mt-6 flex flex-col gap-2 text-xs font-semibold text-white/30 md:flex-row md:items-center md:justify-between">
                <span>
                  {selectedAward
                    ? `MENAMPILKAN ${selectedAwardRows.length} PEMENANG`
                    : `MENAMPILKAN ${awardBoards.length} KATEGORI JUARA`}
                </span>

                <span>
                  {refreshing
                    ? "Memperbarui..."
                    : lastUpdated
                      ? `Update terakhir ${lastUpdated.toLocaleTimeString(
                          "id-ID"
                        )}`
                      : "Menunggu update"}
                </span>
              </footer>
            </>
          )}
        </div>
      </div>
    </main>
  );
}