"use client";

import { useEffect, useMemo, useState } from "react";
import ScoreStaffAuthGate from "@/components/ScoreStaffAuthGate";

/* ============================================================
 * TYPES
 * ============================================================ */

type Level = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type Category = {
  id: string;
  name: string;
  eventLevelId: string | null;
  percentage: number;
  sortOrder: number;
};

type Winner = {
  id: string;
  participantId: string | null;
  manualName?: string | null;
  manualSchool?: string | null;

  participant: {
    id: string;
    number: number;
    name: string;
    school: string | null;
  } | null;

  winnerOrder: number;
  source: string;
  score: number | null;
};

type AwardSource = {
  id: string;
  categoryId: string;
  sortOrder: number;

  category: {
    id: string;
    name: string;
    percentage: number;
  };
};

type Award = {
  id: string;
  name: string;
  method: string;
  eventLevelId: string | null;
  status: string;
  lockedAt: string | null;

  /*
   * Bisa berupa array dari API baru
   * atau string JSON dari API lama.
   */
  tieBreakers: string[] | string | null;

  categorySources: AwardSource[];
  winners: Winner[];
};

type Judge = {
  id: string;
  name: string;
  username?: string;
  role?: string;
  status?: string;

  categoryLinks?: {
    category?: {
      id: string;
      name: string;
      eventId: string;
    };
  }[];
};

type RankingRow = {
  participantId: string;

  number: number;
  name: string;
  school: string | null;

  finalScore: number;
  rawScore: number;
  bonus: number;
  penalty: number;

  rank: number | null;

  /*
   * Nilai masing-masing kategori.
   *
   * Contoh:
   * {
   *   "category-id-pbb": 1720,
   *   "category-id-komandan": 246
   * }
   */
  categoryScores?: Record<string, number>;
};

type Api = {
  success: boolean;
  error?: string;

  event?: {
    id: string;
    name: string;
    logo: string | null;
    totalPoints?: number;
  };

  levels?: Level[];

  categories?: Category[];

  awards?: Award[];

  ranking?: RankingRow[];
};

/* ============================================================
 * TIE BREAKER
 * ============================================================ */

type TieDefinition = {
  key: string;
  label: string;

  type:
    | "CATEGORY"
    | "RAW_SCORE"
    | "BONUS"
    | "PENALTY"
    | "NUMBER"
    | "FINAL_SCORE"
    | "TIMER";
};

/* ============================================================
 * FORMAT
 * ============================================================ */

function formatScore(value: unknown) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });
}

/* ============================================================
 * PARSE TIE BREAKER
 * ============================================================ */

function parseTieBreakers(
  award: Award
): string[] {
  if (!award.tieBreakers) {
    return [];
  }

  try {
    const value =
      typeof award.tieBreakers === "string"
        ? JSON.parse(award.tieBreakers)
        : award.tieBreakers;

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0
    );
  } catch {
    return [];
  }
}

/* ============================================================
 * TIE BREAKER NAME
 *
 * ID kategori otomatis diubah menjadi:
 *
 * categoryId PBB       -> PBB
 * categoryId KOMANDAN  -> KOMANDAN
 * TIMER_FASTEST        -> WAKTU
 * BONUS                -> BONUS
 * ============================================================ */

function getTieDefinitions(
  award: Award,
  categories: Category[]
): TieDefinition[] {
  const ids = parseTieBreakers(award);

  return ids.map((id) => {
    const key = id.trim();

    /* TIMER */

    if (key === "TIMER_FASTEST") {
      return {
        key,
        label: "WAKTU",
        type: "TIMER",
      };
    }

    if (
      key.startsWith(
        "TIMER_CLOSEST|"
      )
    ) {
      return {
        key,
        label: "WAKTU",
        type: "TIMER",
      };
    }

    /* TEKNIS */

    if (key === "FINAL_SCORE") {
      return {
        key,
        label: "NILAI AKHIR",
        type: "FINAL_SCORE",
      };
    }

    if (key === "RAW_SCORE") {
      return {
        key,
        label: "NILAI MENTAH",
        type: "RAW_SCORE",
      };
    }

    if (key === "BONUS") {
      return {
        key,
        label: "BONUS",
        type: "BONUS",
      };
    }

    if (key === "PENALTY") {
      return {
        key,
        label: "PENALTY",
        type: "PENALTY",
      };
    }

    if (key === "NUMBER") {
      return {
        key,
        label: "NOMOR",
        type: "NUMBER",
      };
    }

    /* KATEGORI */

    const category =
      categories.find(
        (item) => item.id === key
      );

    if (category) {
      return {
        key,
        label: category.name,
        type: "CATEGORY",
      };
    }

    /*
     * Fallback dari categorySources
     */

    const source =
      award.categorySources.find(
        (item) =>
          item.categoryId === key
      );

    if (source?.category?.name) {
      return {
        key,
        label: source.category.name,
        type: "CATEGORY",
      };
    }

    return {
      key,
      label: "TIE BREAKER",
      type: "CATEGORY",
    };
  });
}

/* ============================================================
 * TIE VALUE
 * ============================================================ */

function getTieValue(
  definition: TieDefinition,
  ranking: RankingRow | undefined
) {
  if (!ranking) {
    return null;
  }

  switch (definition.type) {
    case "CATEGORY":
      return (
        ranking.categoryScores?.[
          definition.key
        ] ?? null
      );

    case "RAW_SCORE":
      return ranking.rawScore;

    case "BONUS":
      return ranking.bonus;

    case "PENALTY":
      return ranking.penalty;

    case "NUMBER":
      return ranking.number;

    case "FINAL_SCORE":
      return ranking.finalScore;

    case "TIMER":
      /*
       * Timer tidak disediakan oleh endpoint
       * rekap keseluruhan. Timer tetap menjadi
       * fallback terakhir pada sistem penentuan
       * juara, tetapi tidak boleh dibuat-buat di
       * tabel jika datanya tidak tersedia.
       */
      return null;

    default:
      return null;
  }
}

/* ============================================================
 * TIE BREAKER EFEKTIF
 *
 * Dari seluruh urutan tie breaker, hanya ambil SATU yang
 * benar-benar menjadi pembeda pada kelompok nilai utama yang seri.
 *
 * Contoh: Nilai utama 1.500 = 1.500
 * - PBB berbeda -> tampilkan PBB saja.
 * - PBB sama, KOMANDAN berbeda -> tampilkan KOMANDAN saja.
 * - Semua masih sama -> lanjut ke tie berikutnya.
 * ============================================================ */

function getEffectiveTieDefinition(
  definitions: TieDefinition[],
  winners: Winner[],
  rankingMap: Map<string, RankingRow>
) {
  const tiedScores = getTiedScoreSet(winners);

  if (!tiedScores.size) {
    return null;
  }

  const tiedWinners = winners.filter((winner) =>
    tiedScores.has(
      String(Number(winner.score ?? 0))
    )
  );

  for (const definition of definitions) {
    const values = tiedWinners
      .map((winner) => {
        const participantId =
          winner.participantId ||
          winner.participant?.id ||
          "";

        return getTieValue(
          definition,
          rankingMap.get(participantId)
        );
      })
      .filter(
        (value): value is number =>
          value !== null &&
          value !== undefined &&
          Number.isFinite(Number(value))
      )
      .map((value) => Number(value));

    /*
     * Kalau datanya belum tersedia, jangan menganggap
     * tie breaker ini membedakan. Lanjut ke berikutnya.
     */
    if (values.length < 2) {
      continue;
    }

    const first = values[0];
    const hasDifference = values.some(
      (value) => value !== first
    );

    if (hasDifference) {
      return definition;
    }
  }

  /*
   * Tidak ada tie breaker yang berhasil membedakan.
   * Tetap gunakan tie breaker pertama yang datanya tersedia
   * sebagai informasi patokan terakhir.
   */
  for (const definition of definitions) {
    const hasValue = tiedWinners.some((winner) => {
      const participantId =
        winner.participantId ||
        winner.participant?.id ||
        "";

      return (
        getTieValue(
          definition,
          rankingMap.get(participantId)
        ) != null
      );
    });

    if (hasValue) {
      return definition;
    }
  }

  return null;
}

/* ============================================================
 * TIE GROUP
 *
 * Tie breaker hanya aktif kalau NILAI UTAMA sama.
 *
 * Contoh:
 *
 * 246
 * 246
 * 246
 * 243
 *
 * Maka hanya 3 peserta pertama yang
 * mendapatkan nilai PBB.
 * ============================================================ */

function getTiedScoreSet(
  winners: Winner[]
) {
  const counts =
    new Map<string, number>();

  for (const winner of winners) {
    const score = Number(
      winner.score ?? 0
    );

    const key = String(score);

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  }

  const tied =
    new Set<string>();

  for (const [
    key,
    count,
  ] of counts.entries()) {
    if (count > 1) {
      tied.add(key);
    }
  }

  return tied;
}

/* ============================================================
 * CATEGORY CARD
 * ============================================================ */

function CategoryCard({
  award,
  rankingMap,
  categories,
  levels,
  index,
}: {
  award: Award;
  rankingMap: Map<
    string,
    RankingRow
  >;
  categories: Category[];
  levels: Level[];
  index: number;
}) {
  const tieDefinitions =
    getTieDefinitions(
      award,
      categories
    );

  const tiedScores =
    getTiedScoreSet(
      award.winners
    );

  /*
   * HANYA SATU tie breaker efektif yang ditampilkan.
   * Bukan seluruh checklist.
   */
  const effectiveTieDefinition =
    getEffectiveTieDefinition(
      tieDefinitions,
      award.winners,
      rankingMap
    );

  const visibleTieBreakers =
    effectiveTieDefinition
      ? [effectiveTieDefinition]
      : [];

  const levelName =
    levels.find(
      (level) =>
        level.id ===
        award.eventLevelId
    )?.name || "—";

  return (
    <section className="category-block">
      {/* ======================================================
       * CATEGORY HEADER
       * ====================================================== */}

      <div className="category-header">
        <div className="category-header-left">
          <div className="category-number">
            KATEGORI {index + 1}
          </div>

          <div className="category-name">
            {award.name}
          </div>
        </div>

        <div className="category-level">
          <div>TINGKATAN</div>

          <strong>
            {levelName || "—"}
          </strong>
        </div>
      </div>

      {/* ======================================================
       * TABLE
       * ====================================================== */}

      <table className="category-table">
        <thead>
          <tr>
            <th className="rank-col">
              RANK
            </th>

            <th className="number-col">
              NO.
            </th>

            <th className="participant-col">
              PESERTA / PASUKAN
            </th>

            <th className="school-col">
              SEKOLAH
            </th>

            <th className="score-col">
              NILAI
            </th>

            {visibleTieBreakers.map(
              (definition) => (
                <th
                  key={
                    definition.key
                  }
                  className="tie-col"
                >
                  {definition.label}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {award.winners.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  5 +
                  visibleTieBreakers.length
                }
                className="empty-row"
              >
                BELUM ADA PEMENANG
              </td>
            </tr>
          ) : (
            award.winners.map(
              (
                winner,
                winnerIndex
              ) => {
                const participantId =
                  winner.participantId ||
                  winner.participant
                    ?.id ||
                  "";

                const ranking =
                  rankingMap.get(
                    participantId
                  );

                const mainScore =
                  Number(
                    winner.score ?? 0
                  );

                const isTied =
                  tiedScores.has(
                    String(mainScore)
                  );

                const rank =
                  winner.winnerOrder ||
                  winnerIndex + 1;

                return (
                  <tr
                    key={
                      winner.id
                    }
                  >
                    <td className="rank-cell">
                      {rank}
                    </td>

                    <td className="number-cell">
                      {winner
                        .participant
                        ?.number ??
                        "—"}
                    </td>

                    <td className="participant-cell">
                      {winner
                        .manualName ||
                        winner
                          .participant
                          ?.name ||
                        "—"}
                    </td>

                    <td className="school-cell">
                      {winner
                        .manualSchool ||
                        winner
                          .participant
                          ?.school ||
                        "—"}
                    </td>

                    <td className="score-cell">
                      {formatScore(
                        winner.score
                      )}
                    </td>

                    {visibleTieBreakers.map(
                      (
                        definition
                      ) => {
                        /*
                         * PESERTA YANG TIDAK TIE:
                         * kosong total.
                         *
                         * Tidak ada kotak kuning.
                         */
                        if (!isTied) {
                          return (
                            <td
                              key={
                                definition.key
                              }
                              className="tie-cell tie-empty"
                            />
                          );
                        }

                        const value =
                          getTieValue(
                            definition,
                            ranking
                          );

                        return (
                          <td
                            key={
                              definition.key
                            }
                            className="tie-cell"
                          >
                            {value == null
                              ? "—"
                              : formatScore(
                                  value
                                )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              }
            )
          )}
        </tbody>
      </table>
    </section>
  );
}

/* ============================================================
 * MAIN PAGE
 * ============================================================ */

function RekapKeseluruhanContent() {
  const [data, setData] =
    useState<Api | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [judges, setJudges] =
    useState<Judge[]>([]);

  /* ============================================================
   * LOAD
   * ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/award?overall=1",
            {
              cache: "no-store",
            }
          );

        const json =
          (await response.json()) as Api;

        if (
          !response.ok ||
          !json.success
        ) {
          throw new Error(
            json.error ||
              "Gagal mengambil rekap keseluruhan."
          );
        }

        /* ======================================================
         * JURI
         * ====================================================== */

        let eventJudges: Judge[] =
          [];

        try {
          const judgeResponse =
            await fetch(
              "/api/judges",
              {
                cache: "no-store",
              }
            );

          if (judgeResponse.ok) {
            const judgeJson =
              (await judgeResponse.json()) as {
                judges?: Judge[];
              };

            const seen =
              new Set<string>();

            eventJudges =
              (
                judgeJson.judges ||
                []
              ).filter(
                (judge) => {
                  if (
                    judge.status &&
                    judge.status !==
                      "ACTIVE"
                  ) {
                    return false;
                  }

                  const assignedToEvent =
                    (
                      judge.categoryLinks ||
                      []
                    ).some(
                      (link) =>
                        link.category
                          ?.eventId ===
                        json.event?.id
                    );

                  if (
                    !assignedToEvent ||
                    seen.has(
                      judge.id
                    )
                  ) {
                    return false;
                  }

                  seen.add(
                    judge.id
                  );

                  return true;
                }
              );
          }
        } catch {
          eventJudges = [];
        }

        /* ======================================================
         * AMBIL NILAI KATEGORI UNTUK TIE BREAKER
         *
         * Endpoint overall menampilkan seluruh award, tetapi
         * ranking/categoryScores hanya lengkap ketika endpoint
         * dipanggil dengan eventLevelId. Karena itu kita ambil
         * ranking per tingkatan lalu gabungkan berdasarkan peserta.
         * Ini yang membuat nilai PBB/KOMANDAN benar-benar muncul.
         * ====================================================== */

        const levelIds = Array.from(
          new Set(
            (json.awards || [])
              .map((award) => award.eventLevelId)
              .filter(
                (id): id is string =>
                  Boolean(id)
              )
          )
        );

        const mergedRanking = new Map<
          string,
          RankingRow
        >();

        /* Ranking dasar dari overall tetap dipakai. */
        for (const row of json.ranking || []) {
          mergedRanking.set(
            row.participantId,
            row
          );
        }

        /*
         * Ambil detail ranking per level agar categoryScores
         * berisi semua kategori yang dapat dijadikan tie breaker.
         */
        await Promise.all(
          levelIds.map(async (levelId) => {
            try {
              const levelResponse =
                await fetch(
                  `/api/award?eventLevelId=${encodeURIComponent(
                    levelId
                  )}`,
                  {
                    cache: "no-store",
                  }
                );

              if (!levelResponse.ok) {
                return;
              }

              const levelJson =
                (await levelResponse.json()) as Api;

              if (!levelJson.success) {
                return;
              }

              for (const row of levelJson.ranking || []) {
                const previous =
                  mergedRanking.get(
                    row.participantId
                  );

                mergedRanking.set(
                  row.participantId,
                  {
                    ...(previous || row),
                    ...row,
                    categoryScores: {
                      ...(previous?.categoryScores || {}),
                      ...(row.categoryScores || {}),
                    },
                  }
                );
              }
            } catch {
              /* Level tertentu gagal diambil -> lanjutkan level lain. */
            }
          })
        );

        const rankingWithTieValues = Array.from(
          mergedRanking.values()
        );

        const finalJson: Api = {
          ...json,
          ranking: rankingWithTieValues,
        };

        if (!cancelled) {
          setData(finalJson);
          setJudges(
            eventJudges
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil rekap keseluruhan."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
   * DATA
   * ============================================================ */

  const levels =
    data?.levels || [];

  const categories =
    data?.categories || [];

  const awards =
    data?.awards || [];

  const ranking =
    data?.ranking || [];

  const eventLogo =
    data?.event?.logo;

  /* ============================================================
   * RANKING MAP
   * ============================================================ */

  const rankingMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          RankingRow
        >();

      for (const row of ranking) {
        map.set(
          row.participantId,
          row
        );
      }

      return map;
    }, [ranking]);

  /* ============================================================
   * LEVEL NAME
   *
   * Kalau semua kategori hanya satu tingkatan,
   * tampilkan nama tingkatan tersebut.
   * Kalau lebih dari satu, tampilkan "SEMUA TINGKATAN".
   * ============================================================ */

  const pageLevelName =
    useMemo(() => {
      const ids = [
        ...new Set(
          awards
            .map(
              (award) =>
                award.eventLevelId
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            )
        ),
      ];

      if (ids.length === 1) {
        return (
          levels.find(
            (level) =>
              level.id === ids[0]
          )?.name ||
          "—"
        );
      }

      if (ids.length > 1) {
        return "SEMUA TINGKATAN";
      }

      return "—";
    }, [awards, levels]);

  /* ============================================================
   * SORT AWARDS
   *
   * Tingkatan lalu urutan kategori.
   * ============================================================ */

  const sortedAwards =
    useMemo(() => {
      return [...awards].sort(
        (a, b) => {
          const levelA =
            levels.find(
              (level) =>
                level.id ===
                a.eventLevelId
            );

          const levelB =
            levels.find(
              (level) =>
                level.id ===
                b.eventLevelId
            );

          const levelSortA =
            levelA?.sortOrder ??
            9999;

          const levelSortB =
            levelB?.sortOrder ??
            9999;

          if (
            levelSortA !==
            levelSortB
          ) {
            return (
              levelSortA -
              levelSortB
            );
          }

          const categoryA =
            a.categorySources?.[0]
              ?.sortOrder ??
            9999;

          const categoryB =
            b.categorySources?.[0]
              ?.sortOrder ??
            9999;

          return (
            categoryA -
            categoryB
          );
        }
      );
    }, [awards, levels]);

  /* ============================================================
   * LOADING
   * ============================================================ */

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          <div className="loading-title">
            Memuat Rekap Keseluruhan...
          </div>

          <div className="loading-subtitle">
            Mengambil hasil penentuan
            juara.
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
   * ERROR
   * ============================================================ */

  if (error) {
    return (
      <main className="error-page">
        <div className="error-box">
          <div className="error-title">
            Gagal Memuat Rekap
          </div>

          <div className="error-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <main className="app-page">
      {/* ======================================================
       * BUTTON
       * ====================================================== */}

      <div className="no-print toolbar">
        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="print-button"
        >
          PRINT F4 LANDSCAPE
        </button>

        <button
          type="button"
          onClick={() =>
            window.close()
          }
          className="close-button"
        >
          TUTUP
        </button>
      </div>

      {/* ======================================================
       * PRINT SHEET
       * ====================================================== */}

      <section className="print-sheet">
        {/* WATERMARK */}

        <div className="watermark">
          <img
            src="/icon.png"
            alt=""
            aria-hidden="true"
          />
        </div>

        <div className="document-content">
          {/* ==================================================
           * HEADER
           * ================================================== */}

          <header className="document-header">
            <div className="header-left">
              {eventLogo ? (
                <img
                  src={eventLogo}
                  alt="Logo Event"
                  className="event-logo"
                />
              ) : (
                <div className="event-logo-placeholder">
                  E
                </div>
              )}

              <div className="event-identity">
                <div className="eyebrow">
                  CETAS.ID · HASIL
                  PENENTUAN JUARA
                </div>

                <h1>
                  {data?.event
                    ?.name ||
                    "—"}
                </h1>

                <div className="subtitle">
                  REKAP KESELURUHAN
                  HASIL JUARA
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="header-result">
                <div className="result-small">
                  HASIL
                </div>

                <div className="result-title">
                  REKAP
                  KESELURUHAN
                </div>

                <div className="result-level">
                  {pageLevelName}
                </div>
              </div>

              <img
                src="/icon.png"
                alt="CETAS.ID"
                className="cetas-logo"
              />
            </div>
          </header>

          {/* ==================================================
           * TITLE
           * ================================================== */}

          <div className="section-heading">
            <div className="section-eyebrow">
              HASIL RESMI
            </div>

            <div className="section-title">
              Seluruh Ranking Kategori
              Juara
            </div>
          </div>

          {/* ==================================================
           * CATEGORY GRID
           *
           * INI BAGIAN PALING PENTING.
           *
           * Tidak lagi:
           *
           * category
           * category
           * category
           *
           * Tetapi:
           *
           * ┌───────┬───────┬───────┐
           * │  PBB  │ KOMAN │ VARIASI│
           * ├───────┼───────┼───────┤
           * │  ...  │  ...  │  ...  │
           * └───────┴───────┴───────┘
           * ================================================== */}

          {sortedAwards.length ===
          0 ? (
            <div className="empty-page">
              BELUM ADA HASIL JUARA.
            </div>
          ) : (
            <div className="category-grid">
              {sortedAwards.map(
                (
                  award,
                  index
                ) => (
                  <CategoryCard
                    key={
                      award.id
                    }
                    award={
                      award
                    }
                    rankingMap={
                      rankingMap
                    }
                    categories={
                      categories
                    }
                    levels={
                      levels
                    }
                    index={
                      index
                    }
                  />
                )
              )}
            </div>
          )}

          {/* ==================================================
           * TANDA TANGAN JURI
           * ================================================== */}

          {judges.length >
            0 && (
            <section className="signature-section">
              <div className="signature-title">
                TTD JURI
              </div>

              <div
                className="signature-grid"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    judges.length,
                    6
                  )}, minmax(0, 1fr))`,
                }}
              >
                {judges.map(
                  (
                    judge,
                    index
                  ) => (
                    <div
                      key={
                        judge.id
                      }
                      className="signature-item"
                    >
                      <div className="judge-number">
                        JURI{" "}
                        {index +
                          1}
                      </div>

                      <div className="signature-space" />

                      <div className="signature-line" />

                      <div className="judge-name">
                        {
                          judge.name
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* ==================================================
           * FOOTER
           * ================================================== */}

          <footer className="document-footer">
            <div className="footer-brand">
              <img
                src="/icon.png"
                alt="CETAS.ID"
              />

              <div>
                <div className="footer-name">
                  CETAS.ID
                </div>

                <div className="footer-desc">
                  Competition Scoring
                  System
                </div>
              </div>
            </div>

            <div className="footer-text">
              Rekap keseluruhan hasil
              penentuan juara
            </div>
          </footer>
        </div>
      </section>

      {/* ======================================================
       * CSS
       * ====================================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        body {
          background: #e5e7eb;
          color: #111827;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ======================================================
         * SCREEN
         * ====================================================== */

        .app-page {
          min-height: 100vh;
          padding: 18px;
          background: #e5e7eb;
        }

        .toolbar {
          width: min(1400px, 100%);
          margin: 0 auto 14px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .print-button,
        .close-button {
          border: 0;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .print-button {
          background: #111827;
          color: white;
        }

        .close-button {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        /* ======================================================
         * SHEET
         * ====================================================== */

        .print-sheet {
          position: relative;
          width: min(1400px, 100%);
          margin: 0 auto;
          overflow: hidden;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 18px;
          box-shadow:
            0 8px 30px
              rgba(
                15,
                23,
                42,
                0.08
              );
        }

        .document-content {
          position: relative;
          z-index: 2;
        }

        .watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 1;
        }

        .watermark img {
          width: 420px;
          height: 420px;
          object-fit: contain;
          opacity: 0.045;
        }

        /* ======================================================
         * HEADER
         * ====================================================== */

        .document-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #111827;
        }

        .header-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .event-logo,
        .event-logo-placeholder {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          object-fit: contain;
        }

        .event-logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #111827;
          color: white;
          font-size: 22px;
          font-weight: 900;
        }

        .event-identity {
          min-width: 0;
        }

        .eyebrow {
          color: #64748b;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }

        .event-identity h1 {
          margin: 2px 0 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
        }

        .subtitle {
          margin-top: 3px;
          color: #475569;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
        }

        .header-result {
          text-align: right;
        }

        .result-small {
          color: #94a3b8;
          font-size: 6px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .result-title {
          color: #0f172a;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.05;
        }

        .result-level {
          margin-top: 2px;
          color: #475569;
          font-size: 6px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .cetas-logo {
          width: 52px;
          height: 52px;
          object-fit: contain;
        }

        /* ======================================================
         * SECTION TITLE
         * ====================================================== */

        .section-heading {
          margin: 7px 0 6px;
        }

        .section-eyebrow {
          color: #94a3b8;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .section-title {
          margin-top: 1px;
          color: #0f172a;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.1;
        }

        /* ======================================================
         * CATEGORY GRID
         *
         * 3 KOLOM
         * ====================================================== */

        .category-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 5px;
          align-items: start;
        }

        /* ======================================================
         * CATEGORY BLOCK
         * ====================================================== */

        .category-block {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          background: rgba(
            255,
            255,
            255,
            0.96
          );

          break-inside: avoid;
          page-break-inside: avoid;
        }

        .category-header {
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          padding: 3px 5px;
          background: #f8fafc;
          border-bottom: 1px solid #cbd5e1;
        }

        .category-header-left {
          min-width: 0;
        }

        .category-number {
          color: #94a3b8;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .category-name {
          margin-top: 1px;
          color: #0f172a;
          font-size: 7px;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
          word-break: break-word;
        }

        .category-level {
          flex: 0 0 auto;
          text-align: right;
          color: #94a3b8;
          font-size: 4.5px;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
        }

        .category-level strong {
          display: block;
          margin-top: 1px;
          color: #475569;
          font-size: 5px;
        }

        /* ======================================================
         * TABLE
         * ====================================================== */

        .category-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 5.8px;
          line-height: 1.05;
        }

        .category-table th,
        .category-table td {
          border-right: 1px solid #cbd5e1;
          border-bottom: 1px solid #cbd5e1;
          padding: 2px 2px;
          vertical-align: middle;
        }

        .category-table th:last-child,
        .category-table td:last-child {
          border-right: 0;
        }

        .category-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .category-table thead th {
          background: #ffffff;
          color: #0f172a;
          font-size: 5px;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .rank-col {
          width: 24px;
          text-align: center;
        }

        .number-col {
          width: 25px;
          text-align: center;
        }

        .participant-col {
          width: 28%;
          text-align: left;
        }

        .school-col {
          width: auto;
          text-align: left;
        }

        .score-col {
          width: 38px;
          text-align: right;
        }

        .tie-col {
          width: 38px;
          text-align: right;
        }

        .rank-cell,
        .number-cell {
          text-align: center;
          font-weight: 900;
        }

        .participant-cell {
          color: #111827;
          font-weight: 900;
          text-transform: uppercase;
          word-break: break-word;
        }

        .school-cell {
          color: #334155;
          font-weight: 700;
          text-transform: uppercase;
          word-break: break-word;
        }

        .score-cell {
          color: #0f172a;
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
        }

        /*
         * Tie breaker:
         * KUNING hanya untuk peserta yang sedang tie.
         */

        .tie-cell {
          color: #111827;
          background: #fff9c4;
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
        }

        /*
         * Peserta yang tidak tie:
         * tidak diberi background kuning.
         */

        .tie-empty {
          background: white;
        }

        .empty-row {
          padding: 8px !important;
          color: #94a3b8;
          text-align: center;
          font-size: 6px;
          font-weight: 900;
        }

        /* ======================================================
         * SIGNATURE
         * ====================================================== */

        .signature-section {
          margin-top: 6px;
          padding-top: 4px;
          border-top: 1px solid #cbd5e1;
        }

        .signature-title {
          margin-bottom: 3px;
          color: #64748b;
          font-size: 5.5px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .signature-grid {
          display: grid;
          gap: 8px;
        }

        .signature-item {
          min-width: 0;
          text-align: center;
        }

        .judge-number {
          color: #64748b;
          font-size: 5px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .signature-space {
          height: 28px;
        }

        .signature-line {
          width: 55%;
          margin: 0 auto;
          border-bottom: 1px solid #64748b;
        }

        .judge-name {
          margin-top: 2px;
          color: #1e293b;
          font-size: 5.5px;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ======================================================
         * FOOTER
         * ====================================================== */

        .document-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 5px;
          padding-top: 4px;
          border-top: 1px solid #cbd5e1;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .footer-brand img {
          width: 15px;
          height: 15px;
          object-fit: contain;
        }

        .footer-name {
          color: #334155;
          font-size: 5.5px;
          font-weight: 900;
        }

        .footer-desc {
          color: #94a3b8;
          font-size: 4.5px;
        }

        .footer-text {
          color: #94a3b8;
          font-size: 4.5px;
          font-weight: 700;
          text-align: right;
        }

        /* ======================================================
         * LOADING
         * ====================================================== */

        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
        }

        .loading-box {
          padding: 30px;
          border-radius: 12px;
          background: white;
          text-align: center;
          box-shadow:
            0 5px 20px
              rgba(
                15,
                23,
                42,
                0.08
              );
        }

        .loading-title {
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
        }

        .loading-subtitle {
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
        }

        /* ======================================================
         * ERROR
         * ====================================================== */

        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f1f5f9;
        }

        .error-box {
          max-width: 600px;
          padding: 30px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: white;
          text-align: center;
        }

        .error-title {
          color: #b91c1c;
          font-size: 16px;
          font-weight: 900;
        }

        .error-message {
          margin-top: 5px;
          color: #ef4444;
          font-size: 11px;
        }

        .empty-page {
          padding: 50px;
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 900;
        }

        /* ======================================================
         * PRINT
         * ====================================================== */

        @media print {
          @page {
            size: 330mm 215mm;
            margin: 7mm;
          }

          html,
          body {
            width: 100%;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .app-page {
            min-height: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .print-sheet {
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .watermark {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          .watermark img {
            width: 380px !important;
            height: 380px !important;
            opacity: 0.045 !important;
          }

          .document-content {
            width: 100% !important;
          }

          /* ==================================================
           * HEADER PRINT
           * ================================================== */

          .document-header {
            padding-bottom: 7px !important;
            border-bottom-width: 2px !important;
          }

          .event-logo,
          .event-logo-placeholder {
            width: 68px !important;
            height: 68px !important;
            flex-basis: 68px !important;
          }

          .event-identity h1 {
            font-size: 22px !important;
          }

          .eyebrow {
            font-size: 8.5px !important;
          }

          .subtitle {
            font-size: 8.5px !important;
          }

          .cetas-logo {
            width: 68px !important;
            height: 68px !important;
          }

          .result-small {
            font-size: 8px !important;
          }

          .result-title {
            font-size: 12px !important;
          }

          .result-level {
            font-size: 8px !important;
          }

          /* ==================================================
           * TITLE PRINT
           * ================================================== */

          .section-heading {
            margin: 4px 0 !important;
          }

          .section-eyebrow {
            font-size: 8px !important;
          }

          .section-title {
            font-size: 12px !important;
          }

          /* ==================================================
           * 3 KOLOM PRINT
           * ================================================== */

          .category-grid {
            display: grid !important;

            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              ) !important;

            gap: 12px !important;

            width: 100% !important;

            align-items: start !important;
          }

          .category-block {
            width: 100% !important;
            min-width: 0 !important;

            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /*
           * Tidak dipaksa 1 halaman. Jika tinggi tidak cukup,
           * browser boleh melanjutkan ke halaman F4 berikutnya.
           */
          .category-grid {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .signature-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .category-header {
            min-height: 34px !important;
            padding: 5px 6px !important;
          }

          .category-number {
            font-size: 7px !important;
          }

          .category-name {
            font-size: 8.2px !important;
          }

          .category-level {
            font-size: 7px !important;
          }

          .category-level strong {
            font-size: 7.5px !important;
          }

          /* ==================================================
           * TABLE PRINT
           * ================================================== */

          .category-table {
            width: 100% !important;
            font-size: 8.5px !important;
          }

          .category-table th,
          .category-table td {
            padding: 3.8px 3px !important;
          }

          .category-table thead th {
            font-size: 8px !important;
          }

          .rank-col {
            width: 34px !important;
          }

          .number-col {
            width: 34px !important;
          }

          .participant-col {
            width: 28% !important;
          }

          .score-col {
            width: 58px !important;
          }

          .tie-col {
            width: 58px !important;
          }

          .participant-cell,
          .school-cell {
            font-size: 8.8px !important;
          }

          .score-cell,
          .tie-cell {
            font-size: 8.8px !important;
          }

          /* ==================================================
           * SIGNATURE PRINT
           * ================================================== */

          .signature-section {
            margin-top: 10px !important;
            padding-top: 6px !important;
          }

          .signature-title {
            margin-bottom: 5px !important;
            font-size: 8px !important;
          }

          .signature-grid {
            gap: 12px !important;
          }

          .judge-number {
            font-size: 7px !important;
          }

          .signature-space {
            height: 30px !important;
          }

          .judge-name {
            font-size: 8px !important;
          }

          /* ==================================================
           * FOOTER PRINT
           * ================================================== */

          .document-footer {
            margin-top: 8px !important;
            padding-top: 5px !important;
          }

          .footer-brand img {
            width: 20px !important;
            height: 20px !important;
          }

          .footer-name {
            font-size: 8px !important;
          }

          .footer-desc,
          .footer-text {
            font-size: 7px !important;
          }

          /*
           * Jangan membuat setiap section
           * pindah halaman.
           */

          table {
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }

        /* ======================================================
         * RESPONSIVE SCREEN
         * ====================================================== */

        @media screen and (max-width: 1000px) {
          .category-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media screen and (max-width: 650px) {
          .category-grid {
            grid-template-columns: 1fr;
          }

          .document-header {
            align-items: flex-start;
          }

          .header-right {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

export default function RekapKeseluruhanPage() {
  return (
    <ScoreStaffAuthGate
      pageTitle="Cetak Rekap Keseluruhan Juara"
      pageDescription="Halaman Cetak Rekap Keseluruhan wajib login menggunakan akun Admin atau Role &quot;STAFF REKAP&quot;."
    >
      <RekapKeseluruhanContent />
    </ScoreStaffAuthGate>
  );
}