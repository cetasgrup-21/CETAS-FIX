/**
 * ============================================================
 * CETAS SCORE ENGINE
 * ============================================================
 *
 * ALUR:
 *
 * NILAI DASAR EVENT
 *        ↓
 * NILAI KATEGORI
 *        ↓
 * NILAI MASTER MATERI
 *        ↓
 * SESUAIKAN JUMLAH JURI
 *        ↓
 * NILAI REVIEW + NILAI JURI
 *
 * ATURAN:
 *
 * 1. Nilai dasar Event ditentukan Admin.
 * 2. Nilai kategori = Event × persentase kategori.
 * 3. Komputer menentukan peak materi.
 * 4. Materi dengan INTERVAL SAMA harus mempunyai
 *    PEAK SAMA dan 10 NILAI SAMA.
 * 5. Nilai dari peak ke kiri selalu dikurangi interval.
 * 6. Ada 10 pilihan nilai.
 * 7. Setelah master dibuat, nilai disesuaikan
 *    dengan jumlah Juri.
 * 8. Pembagian Juri menggunakan Math.floor().
 * 9. Tidak boleh ada nilai desimal.
 *
 * CONTOH:
 *
 * Event = 5000
 * PBB = 60%
 *
 * 5000 × 60%
 * = 3000 MASTER PBB
 *
 * 2 Juri:
 *
 * 3000 ÷ 2
 * = 1500
 *
 * Jika satu materi Master:
 *
 * 19 25 31 37 43 49 55 61 67 73
 *
 * Maka Juri 2:
 *
 * 9 12 15 18 21 24 27 30 33 36
 *
 * karena semuanya menggunakan Math.floor().
 *
 * ============================================================
 */

export type Difficulty =
  | "MUDAH"
  | "SULIT";

export type ScoreOption = {
  label: string;
  score: number;
  sortOrder: number;
};

export type ScoreTemplate = {
  interval: number;
  peak: number;
  options: ScoreOption[];
};

/**
 * Interval yang diperbolehkan Admin.
 */
export const VALID_INTERVALS = [
  2,
  3,
  4,
  5,
  6,
] as const;

/**
 * ============================================================
 * NORMALIZE INTERVAL
 * ============================================================
 */

export function normalizeInterval(
  value: unknown
): number {
  const number =
    Number(value);

  if (
    VALID_INTERVALS.includes(
      number as 2 | 3 | 4 | 5 | 6
    )
  ) {
    return number;
  }

  return 2;
}

/**
 * ============================================================
 * NILAI MAKSIMUM KATEGORI
 * ============================================================
 *
 * Event 5000
 * Kategori 60%
 *
 * = 3000
 */

export function getCategoryMaxScore(
  totalPoints: number,
  categoryPercentage: number
): number {
  const total =
    Math.max(
      0,
      Math.floor(
        Number(totalPoints || 0)
      )
    );

  const percentage =
    Math.max(
      0,
      Number(
        categoryPercentage || 0
      )
    );

  return Math.floor(
    total *
      (percentage / 100)
  );
}

/**
 * ============================================================
 * NILAI PER JURI
 * ============================================================
 *
 * PENTING:
 *
 * Pembagian selalu FLOOR.
 *
 * 275 / 2
 * = 137.5
 *
 * menjadi:
 *
 * 137
 *
 * Tidak pernah menghasilkan desimal.
 */

export function getPerJudgeFromMaximum(
  maximum: number,
  judgeCount: number
): number {
  const value =
    Math.max(
      0,
      Math.floor(
        Number(maximum || 0)
      )
    );

  const count =
    Math.max(
      1,
      Math.floor(
        Number(judgeCount || 1)
      )
    );

  return Math.floor(
    value / count
  );
}

/**
 * ============================================================
 * NILAI MAKSIMUM KATEGORI PER JURI
 * ============================================================
 */

export function getPerJudgeMaximum(
  totalPoints: number,
  categoryPercentage: number,
  judgeCount: number
): number {
  const categoryMaximum =
    getCategoryMaxScore(
      totalPoints,
      categoryPercentage
    );

  return getPerJudgeFromMaximum(
    categoryMaximum,
    judgeCount
  );
}

/**
 * ============================================================
 * NILAI MASTER PER MATERI
 * ============================================================
 *
 * Digunakan untuk membagi nilai kategori kepada seluruh materi.
 *
 * Peak tidak dibuat satu-satu secara independen.
 *
 * Interval yang sama:
 *
 * INTERVAL 2
 * → satu peak
 *
 * INTERVAL 3
 * → satu peak
 *
 * INTERVAL 4
 * → satu peak
 *
 * INTERVAL 5
 * → satu peak
 *
 * INTERVAL 6
 * → satu peak
 *
 * Jadi:
 *
 * interval sama = nilai sama.
 */

/**
 * Materi yang diperlukan engine.
 */
type CriterionInput = {
  interval?: number | null;
};

/**
 * ============================================================
 * HITUNG JUMLAH MATERI PER INTERVAL
 * ============================================================
 */

function countIntervals(
  criteria: CriterionInput[]
): Map<number, number> {
  const result =
    new Map<number, number>();

  for (
    const criterion of criteria
  ) {
    const interval =
      normalizeInterval(
        criterion.interval
      );

    result.set(
      interval,
      (result.get(interval) || 0) + 1
    );
  }

  return result;
}

/**
 * ============================================================
 * CARI PEAK BERDASARKAN INTERVAL
 * ============================================================
 *
 * Peak harus:
 *
 * - integer
 * - interval lebih tinggi → peak lebih tinggi
 * - total seluruh peak = nilai maksimum master
 *
 * Untuk menjaga pembagian tetap bulat,
 * semua peak dibulatkan ke bawah terlebih dahulu,
 * kemudian sisa didistribusikan satu per satu
 * dengan tetap menjaga urutan interval.
 */

export function calculatePeaksByInterval(
  criteria: Array<{ interval?: number | null }>,
  totalPerJudge: number
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const criterion of criteria) {
    const interval = normalizeInterval(criterion.interval);
    counts.set(interval, (counts.get(interval) || 0) + 1);
  }

  const intervals = Array.from(counts.keys()).sort((a, b) => a - b);
  const result = new Map<number, number>();

  if (!intervals.length || totalPerJudge <= 0) return result;
  if (!Number.isInteger(totalPerJudge)) {
    throw new Error("Nilai per juri harus bilangan bulat.");
  }

  const minimumPeak = (interval: number) => interval * 9 + 1;
  const minimumPeaks = intervals.map(minimumPeak);
  const minimumTotal = intervals.reduce(
    (sum, interval, index) =>
      sum + minimumPeaks[index] * (counts.get(interval) || 0),
    0
  );

  if (minimumTotal > totalPerJudge) {
    throw new Error(
      `Nilai per juri ${totalPerJudge} terlalu kecil untuk ${criteria.length} materi.`
    );
  }

  /*
   * Exact integer allocation.
   * One interval = one peak.
   * Same interval => exactly the same 10 options.
   * Sum of all peaks, weighted by number of materials, = totalPerJudge.
   */
  type State = {
    cost: number;
    peaks: number[];
  };

  let states = new Map<string, State>();
  states.set("0|0", { cost: 0, peaks: [] });

  const remainingMinimum = (fromIndex: number) =>
    intervals.slice(fromIndex).reduce(
      (sum, interval, indexOffset) =>
        sum +
        minimumPeaks[fromIndex + indexOffset] *
          (counts.get(interval) || 0),
      0
    );

  const weight = intervals.reduce(
    (sum, interval) =>
      sum + interval * (counts.get(interval) || 0),
    0
  );

  for (let index = 0; index < intervals.length; index++) {
    const interval = intervals[index];
    const count = counts.get(interval) || 1;
    const minPeak = minimumPeaks[index];
    const minFuture = remainingMinimum(index + 1);
    const nextStates = new Map<string, State>();

    for (const state of states.values()) {
      const previousPeak =
        state.peaks.length > 0
          ? state.peaks[state.peaks.length - 1]
          : 0;

      const low = Math.max(minPeak, previousPeak + 1);
      const maxByTotal = Math.floor(
        (totalPerJudge - state.peaks.reduce((sum, _, i) => {
          const prevInterval = intervals[i];
          return sum + (state.peaks[i] || 0) * (counts.get(prevInterval) || 1);
        }, 0) - minFuture) /
          count
      );

      if (maxByTotal < low) continue;

      const currentSum = state.peaks.reduce((sum, peak, i) => {
        const prevInterval = intervals[i];
        return sum + peak * (counts.get(prevInterval) || 1);
      }, 0);

      const idealPeak =
        (totalPerJudge * interval) / Math.max(weight, 1);

      for (let peak = low; peak <= maxByTotal; peak++) {
        const newSum = currentSum + peak * count;
        if (newSum + minFuture > totalPerJudge) break;

        const cost =
          state.cost + Math.pow(peak - idealPeak, 2) * count;
        const key = `${newSum}|${peak}`;
        const old = nextStates.get(key);

        if (!old || cost < old.cost) {
          nextStates.set(key, {
            cost,
            peaks: [...state.peaks, peak],
          });
        }
      }
    }

    states = nextStates;
  }

  let best: State | null = null;
  for (const state of states.values()) {
    const sum = state.peaks.reduce((total, peak, index) => {
      const interval = intervals[index];
      return total + peak * (counts.get(interval) || 1);
    }, 0);

    if (sum !== totalPerJudge) continue;
    if (!best || state.cost < best.cost) best = state;
  }

  if (!best) {
    throw new Error(
      `Tidak ditemukan pembagian peak INTEGER untuk total ${totalPerJudge}.`
    );
  }

  intervals.forEach((interval, index) => {
    result.set(interval, best!.peaks[index]);
  });

  return result;
}

/**
 * ============================================================
 * BENTUK 10 NILAI MASTER
 * ============================================================
 *
 * PEAK → paling kanan
 *
 * Contoh:
 *
 * peak = 73
 * interval = 6
 *
 * 19
 * 25
 * 31
 * 37
 * 43
 * 49
 * 55
 * 61
 * 67
 * 73
 */

function buildMasterOptions(
  peak: number,
  interval: number
): ScoreOption[] {
  const step =
    normalizeInterval(
      interval
    );

  const options: ScoreOption[] =
    [];

  /**
   * Selalu tepat 10 nilai.
   */

  for (
    let index = 0;
    index < 10;
    index++
  ) {
    const score =
      peak -
      (
        9 - index
      ) *
        step;

    /**
     * Nilai tetap integer.
     */

    options.push({
      label: String(
        Math.floor(score)
      ),

      score:
        Math.floor(
          score
        ),

      sortOrder:
        index,
    });
  }

  return options;
}

/**
 * ============================================================
 * NILAI MASTER MATERI
 * ============================================================
 *
 * Fungsi ini digunakan Review maupun Juri.
 *
 * Sangat penting:
 *
 * Materi dengan interval sama
 * akan mendapat peak yang sama.
 */

export function getMasterOptionsForCriteria(
  criteria: CriterionInput[],
  categoryMaximum: number
): ScoreTemplate[] {
  const maximum =
    Math.max(
      0,
      Math.floor(
        Number(
          categoryMaximum || 0
        )
      )
    );

  const peaks =
    calculatePeaksByInterval(
      criteria,
      maximum
    );

  return criteria.map(
    (
      criterion
    ) => {
      const interval =
        normalizeInterval(
          criterion.interval
        );

      const peak =
        Math.floor(
          peaks.get(
            interval
          ) || 0
        );

      return {
        interval,

        peak,

        options:
          buildMasterOptions(
            peak,
            interval
          ),
      };
    }
  );
}

/**
 * ============================================================
 * KONVERSI MASTER → NILAI JURI
 * ============================================================
 *
 * INI TITIK PEMBAGIAN JURI.
 *
 * SEMUA OPTION dibagi jumlah Juri
 * menggunakan Math.floor().
 *
 * Contoh:
 *
 * MASTER:
 *
 * 19 25 31 37 43
 *
 * JURI 2:
 *
 * 9 12 15 18 21
 *
 * Tidak ada:
 *
 * 9.5
 * 12.5
 * 15.5
 *
 * ============================================================
 */

export function convertOptionsToJudge(
  options: ScoreOption[],
  judgeCount: number
): ScoreOption[] {
  const count =
    Math.max(
      1,
      Math.floor(
        Number(
          judgeCount || 1
        )
      )
    );

  return options.map(
    (
      option,
      index
    ) => {
      const score =
        Math.floor(
          Number(
            option.score || 0
          ) /
            count
        );

      return {
        label:
          String(
            score
          ),

        score,

        sortOrder:
          Number(
            option.sortOrder ??
              index
          ),
      };
    }
  );
}

/**
 * ============================================================
 * MASTER → JURI UNTUK SEMUA MATERI
 * ============================================================
 */

export function getJudgeOptionsForCriteria(
  criteria: CriterionInput[],
  categoryMaximum: number,
  judgeCount: number
): ScoreTemplate[] {
  const master =
    getMasterOptionsForCriteria(
      criteria,
      categoryMaximum
    );

  return master.map(
    (
      template
    ) => ({
      interval:
        template.interval,

      peak:
        Math.floor(
          template.peak /
            Math.max(
              1,
              Math.floor(
                Number(
                  judgeCount || 1
                )
              )
            )
        ),

      options:
        convertOptionsToJudge(
          template.options,
          judgeCount
        ),
    })
  );
}

/**
 * ============================================================
 * ALIAS UNTUK KOMPATIBILITAS
 * ============================================================
 */

export function generateScoreOptions(
  difficulty: Difficulty,
  maximum: number,
  interval?: number | null
): ScoreOption[] {
  const normalizedInterval =
    normalizeInterval(
      interval
    );

  const master =
    buildMasterOptions(
      Math.floor(
        maximum
      ),
      normalizedInterval
    );

  return master;
}

/**
 * ============================================================
 * FORMAT LABEL
 * ============================================================
 */

export function formatScore(
  score: number
): string {
  return String(
    Math.floor(
      Number(
        score || 0
      )
    )
  );
}

/**
 * ============================================================
 * CEK INTEGER
 * ============================================================
 */

export function isIntegerScore(
  value: unknown
): boolean {
  const number =
    Number(value);

  return (
    Number.isFinite(
      number
    ) &&
    Number.isInteger(
      number
    )
  );
}

/**
 * ============================================================
 * FLOOR DIVISION
 * ============================================================
 *
 * Helper umum.
 *
 * Semua pembagian nilai yang berhubungan
 * dengan jumlah Juri sebaiknya melalui fungsi ini.
 */

export function floorDivide(
  value: number,
  divisor: number
): number {
  const a =
    Math.floor(
      Number(value || 0)
    );

  const b =
    Math.max(
      1,
      Math.floor(
        Number(
          divisor || 1
        )
      )
    );

  return Math.floor(
    a / b
  );
}