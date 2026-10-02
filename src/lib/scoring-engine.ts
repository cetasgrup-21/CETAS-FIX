export const VALID_INTERVALS = [2, 3, 4, 5, 6] as const;

export type ValidInterval = (typeof VALID_INTERVALS)[number];
export type Difficulty = "MUDAH" | "SULIT";

export type CriterionForScoring = {
  interval?: number | null;
};

export type ScoreOptionGenerated = {
  label: string;
  score: number;
  sortOrder: number;
};

/**
 * Interval yang diperbolehkan.
 */
export function normalizeInterval(value: unknown): ValidInterval {
  const n = Number(value);

  return VALID_INTERVALS.includes(n as ValidInterval)
    ? (n as ValidInterval)
    : 2;
}

export function difficultyFromInterval(interval: number): Difficulty {
  return interval >= 5 ? "SULIT" : "MUDAH";
}

/**
 * Nilai maksimum kategori sebelum dibagi jumlah juri.
 *
 * Contoh:
 * 5000 x 60% = 3000
 * 6000 x 60% = 3600
 *
 * Semua hasil INTEGER.
 */
export function getCategoryMaximum(
  totalPoints: number,
  categoryPercentage: number
): number {
  return Math.floor(
    Number(totalPoints || 0) *
      (Number(categoryPercentage || 0) / 100)
  );
}

/**
 * Nilai maksimum untuk SATU JURI.
 *
 * Contoh:
 * 3000 / 2 = 1500
 * 3000 / 3 = 1000
 * 500 / 3 = 166
 *
 * Tidak pernah menghasilkan desimal.
 */
export function getPerJudgeMaximum(
  categoryMaximum: number,
  judgeCount: number
): number {
  const count = Math.max(
    1,
    Math.floor(Number(judgeCount || 1))
  );

  return Math.floor(
    Number(categoryMaximum || 0) / count
  );
}

/**
 * ============================================================
 * HITUNG PEAK PER INTERVAL
 * ============================================================
 *
 * Aturan:
 *
 * 1. Interval yang sama => peak yang sama.
 * 2. Interval lebih besar => peak lebih besar.
 * 3. Semua peak INTEGER.
 * 4. Total peak diusahakan mendekati maksimum per juri.
 * 5. Peak minimum hanya sebesar interval.
 *
 * PENTING:
 *
 * Kita TIDAK lagi memaksa 10 nilai harus positif.
 *
 * Contoh:
 *
 * peak 10
 * interval 3
 *
 * nilai mentah:
 * -17 -14 -11 -8 -5 -2 1 4 7 10
 *
 * setelah nilai <= 0 dihapus:
 * 1 4 7 10
 *
 * jumlah opsi = 4
 *
 * Jadi format:
 * K, C, B, SB
 */
export function calculatePeaksByInterval(
  criteria: CriterionForScoring[],
  targetMaximum: number
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const criterion of criteria) {
    const interval = normalizeInterval(
      criterion.interval
    );

    counts.set(
      interval,
      (counts.get(interval) || 0) + 1
    );
  }

  const intervals = Array.from(
    counts.keys()
  ).sort((a, b) => a - b);

  const target = Math.max(
    0,
    Math.floor(Number(targetMaximum || 0))
  );

  const result = new Map<number, number>();

  if (!intervals.length) {
    return result;
  }

  /**
   * Kalau target 0, semua peak = 0.
   *
   * Nanti buildScoreOptions() akan menghasilkan
   * options kosong karena semua nilai <= 0.
   */
  if (target <= 0) {
    for (const interval of intervals) {
      result.set(interval, 0);
    }

    return result;
  }

  /**
   * Peak minimal cukup sebesar interval.
   *
   * Kenapa?
   *
   * Karena:
   *
   * peak = interval
   *
   * akan menghasilkan satu nilai positif:
   *
   * interval
   *
   * sedangkan nilai lain <= 0 dan akan dihapus.
   */
  const minimumPeak = (interval: number) =>
    interval;

  /**
   * Bobot interval untuk menentukan distribusi peak.
   *
   * Interval besar mendapatkan peak lebih besar
   * daripada interval kecil.
   */
  const weightedIntervals =
    intervals.reduce(
      (sum, interval) =>
        sum +
        interval *
          (counts.get(interval) || 0),
      0
    );

  const factor =
    weightedIntervals > 0
      ? target / weightedIntervals
      : 0;

  type State = {
    cost: number;
    peaks: number[];
  };

  let states = new Map<string, State>();

  states.set("0|0", {
    cost: 0,
    peaks: [],
  });

  /**
   * Batasi pencarian supaya tidak meledak
   * kalau target sangat besar.
   */
  const MAX_SEARCH_PEAK = Math.max(
    1000,
    target
  );

  for (const interval of intervals) {
    const count =
      counts.get(interval) || 0;

    const next = new Map<
      string,
      State
    >();

    for (const [key, state] of states.entries()) {
      const [sumText, lastText] =
        key.split("|");

      const sum = Number(sumText);
      const last = Number(lastText);

      /**
       * Peak harus:
       *
       * - minimal interval
       * - lebih besar dari peak interval sebelumnya
       */
      const low = Math.max(
        minimumPeak(interval),
        last + 1
      );

      /**
       * Karena satu interval bisa dipakai
       * beberapa materi, seluruh peak dikalikan
       * jumlah materi interval tersebut.
       */
      const maxPeak = Math.floor(
        (target - sum) / count
      );

      if (low > maxPeak) {
        continue;
      }

      const upper = Math.min(
        maxPeak,
        MAX_SEARCH_PEAK
      );

      for (
        let peak = low;
        peak <= upper;
        peak++
      ) {
        const nextSum =
          sum + peak * count;

        if (nextSum > target) {
          break;
        }

        /**
         * Peak lebih dekat ke proporsi interval
         * dianggap lebih baik.
         */
        const cost =
          state.cost +
          count *
            Math.pow(
              peak -
                factor * interval,
              2
            );

        const nextKey =
          `${nextSum}|${peak}`;

        const previous =
          next.get(nextKey);

        if (
          !previous ||
          cost < previous.cost
        ) {
          next.set(nextKey, {
            cost,
            peaks: [
              ...state.peaks,
              peak,
            ],
          });
        }
      }
    }

    states = next;

    if (!states.size) {
      break;
    }
  }

  /**
   * PRIORITAS 1:
   * Cari pembagian yang totalnya persis
   * sama dengan target.
   */
  const exact =
    Array.from(states.entries())
      .filter(
        ([key]) =>
          Number(
            key.split("|")[0]
          ) === target
      )
      .sort(
        (a, b) =>
          a[1].cost -
          b[1].cost
      )[0]?.[1];

  let chosen = exact;

  /**
   * PRIORITAS 2:
   * Kalau tidak ada pembagian exact,
   * ambil total terbesar yang tidak
   * melebihi target.
   */
  if (!chosen) {
    const fallback =
      Array.from(
        states.entries()
      )
        .map(
          ([key, state]) => ({
            sum: Number(
              key.split("|")[0]
            ),
            state,
          })
        )
        .filter(
          (item) =>
            item.sum <= target
        )
        .sort((a, b) => {
          if (
            b.sum !== a.sum
          ) {
            return (
              b.sum - a.sum
            );
          }

          return (
            a.state.cost -
            b.state.cost
          );
        })[0];

    chosen =
      fallback?.state;
  }

  /**
   * Kalau tidak ada solusi,
   * semua peak = 0.
   */
  if (!chosen) {
    for (const interval of intervals) {
      result.set(interval, 0);
    }

    return result;
  }

  intervals.forEach(
    (interval, index) => {
      result.set(
        interval,
        Math.floor(
          chosen!.peaks[index]
        )
      );
    }
  );

  return result;
}

/**
 * ============================================================
 * PEMBAGIAN LABEL 8 KOTAK
 * ============================================================
 *
 * 1  = B
 * 2  = C, B
 * 3  = K, C, B
 * 4  = K, C, B, SB
 * 5  = K, C(2), B, SB
 * 6  = K, C(2), B(2), SB
 * 7  = K, C(3), B(2), SB
 * 8  = K, C(3), B(3), SB
 * 9  = K(2), C(3), B(3), SB
 * 10 = K(3), C(3), B(3), SB
 */
function getScoreLabels(count: number): string[] {
  // Sistem CETAS: SELALU 8 pilihan.
  // P = Perlu Perbaikan (1 kotak)
  // C = Cukup (2 kotak)
  // B = Baik (2 kotak)
  // I = Istimewa (3 kotak)
  const labels = [
    "PERLU PERBAIKAN",
    "CUKUP",
    "CUKUP",
    "BAIK",
    "BAIK",
    "ISTIMEWA",
    "ISTIMEWA",
    "ISTIMEWA",
  ];

  return Array.from({ length: Math.min(8, Math.max(0, count)) }, (_, index) =>
    labels[index] || "BAIK"
  );
}

/**
 * ============================================================
 * BUAT SCORE OPTIONS
 * ============================================================
 *
 * SELALU menghasilkan maksimal 10 nilai mentah.
 *
 * Nilai <= 0:
 * → DIBUANG.
 *
 * Setelah dibuang:
 * → jumlah opsi bisa 0 sampai 10.
 *
 * Jumlah opsi positif menentukan label.
 */
export function buildScoreOptions(
  peak: number,
  interval: number
): ScoreOptionGenerated[] {
  const step = normalizeInterval(interval);

  const maximum = Math.max(
    0,
    Math.floor(Number(peak || 0))
  );

  // CETAS selalu memakai tepat 8 kotak.
  // Posisi nilai dibentuk dari nilai tertinggi (peak) mundur
  // dengan interval yang sama.
  //
  // Contoh peak 100, interval 5:
  // 65, 70, 75, 80, 85, 90, 95, 100
  const start = maximum - 7 * step;

  // Bila peak terlalu kecil sehingga ada nilai <= 0,
  // tetap pertahankan 8 pilihan dengan menaikkan peak minimum.
  const safePeak = Math.max(maximum, 8 * step);
  const safeStart = safePeak - 7 * step;

  const labels = getScoreLabels(8);

  return Array.from({ length: 8 }, (_, index) => {
    const score = safeStart + index * step;

    return {
      label: labels[index],
      score: Math.floor(score),
      sortOrder: index,
    };
  });
}

/**
 * ============================================================
 * GENERATOR UTAMA
 * ============================================================
 */
export function generateCategoryScoreOptions(
  criteria: CriterionForScoring[],
  categoryMaximumPerJudge: number
) {
  const peaks =
    calculatePeaksByInterval(
      criteria,
      categoryMaximumPerJudge
    );

  return criteria.map(
    (criterion) => {
      const interval =
        normalizeInterval(
          criterion.interval
        );

      const peak =
        peaks.get(interval) ??
        0;

      return {
        interval,
        peak,

        options:
          buildScoreOptions(
            peak,
            interval
          ),
      };
    }
  );
}