"use client";

import { useEffect, useMemo, useState } from "react";

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

type Source = {
  id: string;
  categoryId: string;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    percentage: number;
  };
};

type EventCategory = {
  id: string;
  name: string;
  eventLevelId: string | null;
  percentage: number;
  sortOrder: number;
};

type Award = {
  id: string;
  name: string;
  method: string;
  eventLevelId: string | null;
  status: string;
  lockedAt: string | null;
  tieBreakers: string[] | string | null;
  categorySources: Source[];
  winners: Winner[];
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
  categoryScores?: Record<string, number>;
};

type Api = {
  success: boolean;
  error?: string;

  event?: {
    id?: string;
    name: string;
    logo: string | null;
    totalPoints?: number;
  };

  levels?: {
    id: string;
    code?: string;
    name: string;
    sortOrder?: number;
  }[];

  categories?: EventCategory[];

  selectedAward?: Award | null;
  award?: Award | null;
  awards?: Award[];

  ranking?: RankingRow[];
};

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

type AwardCardProps = {
  award: Award;
  rankingMap: Map<string, RankingRow>;
  categories: EventCategory[];
};

/* ============================================================
 * FORMAT
 * ============================================================ */

function formatNumber(value: unknown) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatScore(value: unknown) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("id-ID", {
    minimumFractionDigits:
      number % 1 !== 0 ? 3 : 0,
    maximumFractionDigits: 3,
  });
}

/* ============================================================
 * TIE BREAKER PARSER
 * ============================================================ */

function parseTieBreakers(
  award: Award
): string[] {
  if (!award.tieBreakers) {
    return [];
  }

  try {
    const raw =
      typeof award.tieBreakers === "string"
        ? JSON.parse(award.tieBreakers)
        : award.tieBreakers;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0
    );
  } catch {
    return [];
  }
}

/* ============================================================
 * NAMA TIE BREAKER
 * ============================================================ */

function getTieDefinitions(
  award: Award,
  categories: EventCategory[]
): TieDefinition[] {
  const ids = parseTieBreakers(award);

  return ids.map((id) => {
    const value = id.trim();

    /* TIMER */

    if (value.startsWith("TIMER_CLOSEST|")) {
      const target =
        value.split("|")[1] || "";

      return {
        key: value,
        label: `WAKTU ${target}`,
        type: "TIMER",
      };
    }

    if (value === "TIMER_FASTEST") {
      return {
        key: value,
        label: "WAKTU",
        type: "TIMER",
      };
    }

    /* TEKNIS */

    if (value === "FINAL_SCORE") {
      return {
        key: value,
        label: "NILAI AKHIR",
        type: "FINAL_SCORE",
      };
    }

    if (value === "RAW_SCORE") {
      return {
        key: value,
        label: "NILAI MENTAH",
        type: "RAW_SCORE",
      };
    }

    if (value === "BONUS") {
      return {
        key: value,
        label: "BONUS",
        type: "BONUS",
      };
    }

    if (value === "PENALTY") {
      return {
        key: value,
        label: "PENALTY",
        type: "PENALTY",
      };
    }

    if (value === "NUMBER") {
      return {
        key: value,
        label: "NOMOR",
        type: "NUMBER",
      };
    }

    /* KATEGORI */

    const category =
      categories.find(
        (item) => item.id === value
      );

    if (category) {
      return {
        key: value,
        label: category.name,
        type: "CATEGORY",
      };
    }

    /* FALLBACK DARI SOURCE */

    const source =
      award.categorySources.find(
        (item) =>
          item.categoryId === value
      );

    if (source?.category?.name) {
      return {
        key: value,
        label: source.category.name,
        type: "CATEGORY",
      };
    }

    return {
      key: value,
      label: "TIE BREAKER",
      type: "CATEGORY",
    };
  });
}

/* ============================================================
 * NILAI TIE BREAKER
 * ============================================================ */

function getTieValue(
  definition: TieDefinition,
  winner: Winner,
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
      return null;

    default:
      return null;
  }
}

/* ============================================================
 * CEK APAKAH ADA TIE
 *
 * Tie breaker hanya ditampilkan kalau memang ada
 * minimal 2 peserta dengan nilai utama yang sama.
 * ============================================================ */

function getTiedScoreSet(
  winners: Winner[]
) {
  const count = new Map<string, number>();

  for (const winner of winners) {
    const score = Number(
      winner.score ?? 0
    );

    const key = String(score);

    count.set(
      key,
      (count.get(key) || 0) + 1
    );
  }

  const tied = new Set<string>();

  for (const [
    key,
    value,
  ] of count.entries()) {
    if (value > 1) {
      tied.add(key);
    }
  }

  return tied;
}

/* ============================================================
 * AWARD CARD
 * ============================================================ */

function AwardCard({
  award,
  rankingMap,
  categories,
}: AwardCardProps) {
  const tieDefinitions =
    getTieDefinitions(
      award,
      categories
    );

  const tiedScores =
    getTiedScoreSet(
      award.winners || []
    );

  /*
   * Hanya tampilkan tie breaker apabila:
   *
   * 1. Ada konfigurasi tie breaker
   * 2. Ada nilai utama yang sama
   */

  const hasTie =
    tieDefinitions.length > 0 &&
    tiedScores.size > 0;

  /*
   * HANYA TAMPILKAN 1 TIE BREAKER TERAKHIR
   * yang menjadi patokan akhir penilaian.
   *
   * Contoh konfigurasi:
   * [PBB, KOMANDAN, VARIASI]
   * maka yang ditampilkan di hasil hanya VARIASI.
   */
  const visibleTieDefinitions =
    hasTie
      ? tieDefinitions.slice(-1)
      : [];

  /*
   * Kalau ada beberapa tie breaker,
   * hanya tie breaker TERAKHIR yang ditampilkan
   * sebagai patokan akhir penilaian.
   */

  return (
    <section className="award-card">
      {/* HEADER KATEGORI */}

      <div className="award-title">
        <div className="award-title-main">
          {award.name}
        </div>
      </div>

      <table className="award-table">
        <thead>
          <tr>
            <th className="col-rank">
              RANK
            </th>

            <th className="col-number">
              URUT
            </th>

            <th className="col-school">
              NAMA SEKOLAH
            </th>

            <th className="col-score">
              NILAI
            </th>

            {visibleTieDefinitions.map(
              (definition, index) => (
                <th
                  key={`${definition.key}-${index}`}
                  className="col-tie"
                >
                  {definition.label}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {award.winners.length === 0 ? (
            <tr>
              <td
                colSpan={
                  4 +
                  visibleTieDefinitions.length
                }
                className="empty-cell"
              >
                BELUM ADA PEMENANG
              </td>
            </tr>
          ) : (
            award.winners.map(
              (winner, index) => {
                const participantId =
                  winner.participantId ||
                  winner.participant?.id ||
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

                return (
                  <tr
                    key={winner.id}
                  >
                    <td className="rank-cell">
                      {index + 1}
                    </td>

                    <td className="number-cell">
                      {winner
                        .participant
                        ?.number ??
                        "—"}
                    </td>

                    <td className="school-cell">
                      <div className="school-name">
                        {winner.manualSchool ||
                          winner
                            .participant
                            ?.school ||
                          "—"}
                      </div>

                      {winner.manualName ||
                      winner.participant
                        ?.name ? (
                        <div className="participant-name">
                          {winner.manualName ||
                            winner
                              .participant
                              ?.name}
                        </div>
                      ) : null}
                    </td>

                    <td className="score-cell">
                      {formatScore(
                        winner.score
                      )}
                    </td>

                    {visibleTieDefinitions.map(
                      (
                        definition,
                        tieIndex
                      ) => {
                        /*
                         * Penting:
                         * hanya peserta yang
                         * sedang tie yang
                         * mendapat nilai tie
                         * breaker.
                         */

                        if (!isTied) {
                          return (
                            <td
                              key={`${winner.id}-tie-${tieIndex}`}
                              className="tie-cell empty-tie"
                              aria-hidden="true"
                            />
                          );
                        }

                        const value =
                          getTieValue(
                            definition,
                            winner,
                            ranking
                          );

                        return (
                          <td
                            key={`${winner.id}-tie-${tieIndex}`}
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
 * PAGE
 * ============================================================ */

export default function HasilPenentuanJuaraPage() {
  const [event, setEvent] =
    useState<Api["event"]>();

  const [levels, setLevels] =
    useState<Api["levels"]>([]);

  const [categories, setCategories] =
    useState<EventCategory[]>([]);

  const [awards, setAwards] =
    useState<Award[]>([]);

  const [ranking, setRanking] =
    useState<RankingRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [levelId, setLevelId] =
    useState("");

  /* ============================================================
   * AMBIL PARAMETER URL
   * ============================================================ */

  const urlParams = useMemo(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return {
        awardId: "",
        eventLevelId: "",
      };
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    return {
      awardId:
        params.get("awardId") ||
        params.get("id") ||
        "",

      eventLevelId:
        params.get(
          "eventLevelId"
        ) || "",
    };
  }, []);

  /* ============================================================
   * LOAD DATA
   * ============================================================ */

  async function load() {
    try {
      setLoading(true);
      setError("");

      /*
       * Kalau halaman dibuka dari awardId,
       * ambil award tersebut dulu untuk mengetahui
       * eventLevelId.
       */

      let selectedAward:
        Award | null = null;

      let firstResponse:
        Api | null = null;

      if (urlParams.awardId) {
        const response =
          await fetch(
            `/api/award?awardId=${encodeURIComponent(
              urlParams.awardId
            )}`,
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
              "Kategori juara tidak ditemukan."
          );
        }

        firstResponse = json;

        selectedAward =
          json.selectedAward ||
          json.award ||
          json.awards?.[0] ||
          null;
      }

      const resolvedLevelId =
        selectedAward?.eventLevelId ||
        urlParams.eventLevelId ||
        "";

      setLevelId(
        resolvedLevelId
      );

      /*
       * Ambil SEMUA kategori juara
       * pada tingkatan tersebut.
       */

      const query =
        resolvedLevelId
          ? `?eventLevelId=${encodeURIComponent(
              resolvedLevelId
            )}`
          : "";

      const response =
        await fetch(
          `/api/award${query}`,
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
            "Gagal mengambil kategori juara."
        );
      }

      setEvent(
        json.event ||
          firstResponse?.event
      );

      setLevels(
        json.levels ||
          firstResponse?.levels ||
          []
      );

      setCategories(
        json.categories ||
          firstResponse?.categories ||
          []
      );

      let loadedAwards =
        json.awards || [];

      /*
       * Fallback apabila API hanya mengembalikan
       * award tertentu.
       */

      if (
        loadedAwards.length === 0 &&
        selectedAward
      ) {
        loadedAwards = [
          selectedAward,
        ];
      }

      /*
       * Kalau awardId digunakan tapi API level
       * tidak menemukan data karena award manual
       * atau level kosong, tetap tampilkan award.
       */

      if (
        selectedAward &&
        !loadedAwards.some(
          (item) =>
            item.id ===
            selectedAward!.id
        )
      ) {
        loadedAwards = [
          selectedAward,
          ...loadedAwards,
        ];
      }

      setAwards(
        loadedAwards
      );

      setRanking(
        json.ranking ||
          firstResponse?.ranking ||
          []
      );
    } catch (err) {
      console.error(
        "HASIL JUARA ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil hasil."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [
    urlParams.awardId,
    urlParams.eventLevelId,
  ]);

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
   * ============================================================ */

 const levelName =
  (levels ?? []).find(
    (level) =>
      level.id ===
      levelId
  )?.name ||
    awards.find(
      (award) =>
        award.eventLevelId
    )?.eventLevelId ||
    "—";

  /* ============================================================
   * LOADING
   * ============================================================ */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg font-black">
            MEMUAT REKAP...
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Menyiapkan kategori juara
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
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <h1 className="font-black text-red-700">
            GAGAL MEMUAT REKAP
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <main className="min-h-screen bg-slate-200 p-4 print:bg-white print:p-0">
      {/* ========================================================
          BUTTON
         ======================================================== */}

      <div className="no-print mx-auto mb-4 flex max-w-[1400px] justify-end gap-2">
        <button
          onClick={() =>
            window.print()
          }
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow"
        >
          PRINT F4 LANDSCAPE
        </button>

        <button
          onClick={() =>
            window.close()
          }
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold"
        >
          TUTUP
        </button>
      </div>

      {/* ========================================================
          PRINT PAGE
         ======================================================== */}

      <section className="print-page mx-auto max-w-[1400px] bg-white p-5 shadow-xl print:max-w-none print:shadow-none">

        {/* ======================================================
            HEADER
           ====================================================== */}

        <header className="print-header">
          {/* LOGO KIRI */}

          <div className="header-logo">
            {event?.logo ? (
              <img
                src={event.logo}
                alt="Logo Event"
              />
            ) : (
              <div className="logo-placeholder">
                C
              </div>
            )}
          </div>

          {/* JUDUL */}

          <div className="header-center">
            <div className="event-title">
              REKAP NILAI KESELURUHAN
            </div>

            <div className="event-name">
              {event?.name ||
                "—"}
            </div>

            <div className="event-level">
              TINGKAT{" "}
              {levelName}
            </div>
          </div>

          {/* LOGO KANAN */}

          <div className="header-logo">
            {event?.logo ? (
              <img
                src={event.logo}
                alt="Logo Event"
              />
            ) : (
              <div className="logo-placeholder">
                C
              </div>
            )}
          </div>
        </header>

        {/* ======================================================
            CATEGORY GRID
           ====================================================== */}

        {awards.length === 0 ? (
          <div className="empty-page">
            BELUM ADA KATEGORI JUARA
          </div>
        ) : (
          <div className="award-grid">
            {awards.map(
              (award) => (
                <AwardCard
                  key={award.id}
                  award={award}
                  rankingMap={
                    rankingMap
                  }
                  categories={
                    categories
                  }
                />
              )
            )}
          </div>
        )}

        {/* ======================================================
            FOOTER
           ====================================================== */}

        <footer className="print-footer">
          <span>
            CETAS.ID · COMPETITION
            SCORING SYSTEM
          </span>

          <span>
            {awards.length} KATEGORI JUARA
          </span>
        </footer>
      </section>

      {/* ========================================================
          PRINT / SCREEN CSS
         ======================================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .print-page {
          min-height: 190mm;
        }

        .print-header {
          display: grid;
          grid-template-columns: 70px 1fr 70px;
          align-items: center;
          gap: 10px;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1.5px solid #111;
        }

        .header-logo {
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-logo img {
          width: 62px;
          height: 62px;
          object-fit: contain;
        }

        .logo-placeholder {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
        }

        .header-center {
          text-align: center;
          line-height: 1.1;
        }

        .event-title {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .event-name {
          margin-top: 3px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .event-level {
          margin-top: 3px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .award-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 7px;
          align-items: start;
        }

        .award-card {
          min-width: 0;
          border: 1px solid #111;
          background: white;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .award-title {
          min-height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px 5px;
          background: white;
          border-bottom: 1px solid #111;
          text-align: center;
        }

        .award-title-main {
          font-size: 10px;
          line-height: 1.05;
          font-weight: 900;
          text-transform: uppercase;
        }

        .award-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 7.5px;
          line-height: 1.05;
        }

        .award-table th,
        .award-table td {
          border: 1px solid #111;
          padding: 3px 3px;
          vertical-align: middle;
        }

        .award-table thead th {
          background: #f1f1f1;
          font-size: 7px;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .col-rank {
          width: 28px;
          text-align: center;
        }

        .col-number {
          width: 30px;
          text-align: center;
        }

        .col-school {
          width: auto;
          text-align: left;
        }

        .col-score {
          width: 42px;
          text-align: center;
        }

        .col-tie {
          width: 45px;
          text-align: center;
        }

        .rank-cell {
          text-align: center;
          font-weight: 900;
        }

        .number-cell {
          text-align: center;
          font-weight: 700;
        }

        .school-cell {
          min-width: 0;
          text-align: left;
          overflow: hidden;
        }

        .school-name {
          font-size: 7.6px;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
          word-break: break-word;
        }

        .participant-name {
          margin-top: 1px;
          color: #555;
          font-size: 6.6px;
          font-weight: 700;
          line-height: 1;
          text-transform: uppercase;
        }

        .score-cell {
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
        }

        .tie-cell {
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
          background: #fffdf0;
        }

        /*
         * Baris yang TIDAK tie tidak mendapatkan
         * kotak maupun nilai tie breaker.
         * Sel tetap ada untuk menjaga struktur tabel,
         * tetapi garis/border dibuat transparan.
         */
        .empty-tie {
          background: white !important;
          border-color: transparent !important;
          color: transparent !important;
        }

        .empty-cell {
          padding: 8px !important;
          text-align: center;
          font-weight: 900;
          color: #777;
        }

        .empty-page {
          padding: 80px 20px;
          text-align: center;
          font-size: 14px;
          font-weight: 900;
          color: #777;
        }

        .print-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 7px;
          padding-top: 4px;
          border-top: 1px solid #999;
          color: #666;
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
        }

        @media screen and (max-width: 1000px) {
          .award-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        @media screen and (max-width: 700px) {
          .award-grid {
            grid-template-columns: 1fr;
          }

          .print-header {
            grid-template-columns: 50px 1fr 50px;
          }

          .header-logo,
          .header-logo img {
            width: 45px;
            height: 45px;
          }
        }

        @media print {
          @page {
            size: 330mm 215mm;
            margin: 5mm;
          }

          html,
          body {
            width: 100%;
            min-width: 0;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          .print-header {
            margin-bottom: 5px !important;
            padding-bottom: 5px !important;
          }

          .header-logo,
          .header-logo img {
            width: 52px !important;
            height: 52px !important;
          }

          .event-title {
            font-size: 11px !important;
          }

          .event-name {
            font-size: 10px !important;
          }

          .event-level {
            font-size: 9px !important;
          }

          .award-grid {
            display: grid !important;
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            ) !important;
            gap: 4px !important;
            width: 100% !important;
          }

          .award-card {
            width: 100% !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .award-title {
            min-height: 18px !important;
            padding: 2px 3px !important;
          }

          .award-title-main {
            font-size: 8px !important;
          }

          .award-table {
            font-size: 6.4px !important;
          }

          .award-table th,
          .award-table td {
            padding: 2px 2px !important;
          }

          .award-table thead th {
            font-size: 6px !important;
          }

          .school-name {
            font-size: 6.5px !important;
          }

          .participant-name {
            font-size: 5.7px !important;
          }

          .col-rank {
            width: 24px !important;
          }

          .col-number {
            width: 25px !important;
          }

          .col-score {
            width: 37px !important;
          }

          .col-tie {
            width: 39px !important;
          }

          .print-footer {
            margin-top: 4px !important;
            padding-top: 3px !important;
            font-size: 5.8px !important;
          }
        }
      `}</style>
    </main>
  );
}