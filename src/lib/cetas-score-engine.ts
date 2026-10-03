/**
 * CETAS SCORE ENGINE — 100% MATCH DENGAN REPO ASLI CETAS.SCORE
 * Sumber: C:\Users\Reza Aditya Arifin\Documents\Cetas.Score\scoring-engine.ts
 *
 * Aturan Utama:
 * 1. Event Scale: 5.000 Poin
 * 2. Kategori: (5.000 * percentage) / 100
 * 3. Nilai Maksimum Per Juri: categoryMaximum / judgeCount (integer bulat, tanpa desimal)
 * 4. Tepat 10 opsi per materi:
 *    - KURANG: 3 opsi
 *    - CUKUP: 3 opsi
 *    - BAIK: 3 opsi
 *    - SANGAT BAIK: 1 opsi (Peak / Nilai Maksimal Materi)
 * 5. Bergerak ke kiri dari peak berkurang persis sebesar interval [2, 3, 4, 5, 6].
 * 6. Jumlah peak seluruh materi dalam kategori = nilai target per juri.
 */

export const VALID_INTERVALS = [2, 3, 4, 5, 6] as const;
export type ValidInterval = (typeof VALID_INTERVALS)[number];
export type Difficulty = "MUDAH" | "SULIT";

export type CriterionForScoring = {
  id?: string;
  name?: string;
  section?: string | null;
  interval?: number | null;
  difficulty?: string;
  sortOrder?: number;
};

export type ScoreOptionGenerated = {
  id?: string;
  label: string;
  score: number;
  sortOrder: number;
};

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
 * Nilai kategori sebelum pembagian jumlah juri.
 * Contoh: 5.000 x 60% = 3.000
 */
export function getCategoryMaximum(
  totalPoints: number,
  categoryPercentage: number
): number {
  return Math.floor(
    Number(totalPoints || 0) * (Number(categoryPercentage || 0) / 100)
  );
}

/**
 * Nilai maksimum yang tersedia untuk SATU JURI.
 * Tidak pernah menghasilkan desimal.
 *
 * Contoh:
 * 3.000 / 2 = 1.500
 * 500 / 3 = 166 (dibulatkan ke bawah)
 */
export function getPerJudgeMaximum(
  categoryMaximum: number,
  judgeCount: number
): number {
  const count = Math.max(1, Math.floor(Number(judgeCount || 1)));
  return Math.floor(Number(categoryMaximum || 0) / count);
}

/**
 * Cari peak per interval dengan aturan:
 * 1. Interval yang sama => peak yang sama.
 * 2. Interval lebih besar => peak lebih besar.
 * 3. Semua peak integer.
 * 4. Diusahakan jumlah seluruh peak = target per juri.
 * 5. Setiap peak minimal cukup untuk membuat 10 pilihan (peak - 9*interval ... peak).
 */
export function calculatePeaksByInterval(
  criteria: CriterionForScoring[],
  targetMaximum: number
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const criterion of criteria) {
    const interval = normalizeInterval(criterion.interval);
    counts.set(interval, (counts.get(interval) || 0) + 1);
  }

  const intervals = Array.from(counts.keys()).sort((a, b) => a - b);
  const target = Math.max(0, Math.floor(Number(targetMaximum || 0)));
  const result = new Map<number, number>();

  if (!intervals.length || target <= 0) return result;

  // Minimum peak agar tersedia 10 nilai positif.
  const minimumPeak = (interval: number) => 9 * interval + 1;

  // Cari solusi integer terbaik dengan dynamic programming.
  const weightedIntervals = intervals.reduce(
    (sum, interval) => sum + interval * (counts.get(interval) || 0),
    0
  );
  const factor = weightedIntervals > 0 ? target / weightedIntervals : 0;

  type State = { cost: number; peaks: number[] };
  let states = new Map<string, State>();
  states.set("0|0", { cost: 0, peaks: [] });

  for (const interval of intervals) {
    const count = counts.get(interval) || 0;
    const next = new Map<string, State>();

    for (const [key, state] of states.entries()) {
      const [sumText, lastText] = key.split("|");
      const sum = Number(sumText);
      const last = Number(lastText);

      const low = Math.max(minimumPeak(interval), last + 1);
      const maxPeak = Math.floor((target - sum) / count);

      if (low > maxPeak) continue;

      for (let peak = low; peak <= maxPeak; peak++) {
        const nextSum = sum + peak * count;
        if (nextSum > target) break;

        const cost =
          state.cost +
          count * Math.pow(peak - factor * interval, 2);

        const nextKey = `${nextSum}|${peak}`;
        const previous = next.get(nextKey);

        if (!previous || cost < previous.cost) {
          next.set(nextKey, {
            cost,
            peaks: [...state.peaks, peak],
          });
        }
      }
    }

    states = next;
    if (!states.size) break;
  }

  const exact = Array.from(states.entries())
    .filter(([key]) => Number(key.split("|")[0]) === target)
    .sort((a, b) => a[1].cost - b[1].cost)[0]?.[1];

  let chosen = exact;

  // Kalau tidak ada solusi exact, ambil solusi terbesar yang <= target.
  if (!chosen) {
    const fallback = Array.from(states.entries())
      .map(([key, state]) => ({
        sum: Number(key.split("|")[0]),
        state,
      }))
      .filter((item) => item.sum <= target)
      .sort((a, b) => {
        if (b.sum !== a.sum) return b.sum - a.sum;
        return a.state.cost - b.state.cost;
      })[0];

    chosen = fallback?.state;
  }

  if (!chosen) return result;

  intervals.forEach((interval, index) => {
    result.set(interval, Math.floor(chosen!.peaks[index]));
  });

  return result;
}

/**
 * Buat tepat 10 pilihan.
 * Kolom paling kanan = peak.
 * Bergerak ke kiri selalu berkurang persis sebesar interval.
 */
export function buildScoreOptions(
  peak: number,
  interval: number
): ScoreOptionGenerated[] {
  const step = normalizeInterval(interval);
  const maximum = Math.max(0, Math.floor(Number(peak || 0)));

  const labels = [
    "KURANG",
    "KURANG",
    "KURANG",
    "CUKUP",
    "CUKUP",
    "CUKUP",
    "BAIK",
    "BAIK",
    "BAIK",
    "SANGAT BAIK",
  ];

  const values = Array.from({ length: 10 }, (_, index) =>
    maximum - (9 - index) * step
  );

  if (values.some((value) => value <= 0)) {
    throw new Error(
      `Peak ${maximum} terlalu kecil untuk interval ${step}. Minimal peak adalah ${9 * step + 1}.`
    );
  }

  return values.map((score, index) => ({
    id: `opt-${index}-${score}`,
    label: labels[index] || String(score),
    score: Math.floor(score),
    sortOrder: index,
  }));
}

/**
 * Pembagian 10 opsi ke dalam 4 Kolom:
 * 1. KURANG: 3 opsi
 * 2. CUKUP: 3 opsi
 * 3. BAIK: 3 opsi
 * 4. SANGAT BAIK: 1 opsi
 */
export function getScoreGroups(options: ScoreOptionGenerated[]) {
  const sorted = [...options].sort((a, b) => a.sortOrder - b.sortOrder);
  const total = sorted.length;

  if (total === 0) {
    return {
      kurang: [],
      cukup: [],
      baik: [],
      sangatBaik: [],
    };
  }

  const firstSize =
    total >= 4 ? Math.ceil(total * 0.3) : Math.ceil(total / 3);

  const secondSize =
    total >= 4 ? Math.ceil(total * 0.3) : Math.ceil((total - firstSize) / 2);

  const thirdSize =
    total >= 4
      ? Math.ceil(total * 0.3)
      : Math.max(0, total - firstSize - secondSize);

  const kurang = sorted.slice(0, firstSize);
  const cukup = sorted.slice(firstSize, firstSize + secondSize);
  const baik = sorted.slice(
    firstSize + secondSize,
    firstSize + secondSize + thirdSize
  );
  const sangatBaik = sorted.slice(firstSize + secondSize + thirdSize);

  return {
    kurang,
    cukup,
    baik,
    sangatBaik,
  };
}

/**
 * Header grouping untuk tabel input rekap mode Kertas
 */
export function getDisplayGroups(count: number) {
  const formats: Record<number, { label: string; count: number }[]> = {
    10: [
      { label: "K", count: 3 },
      { label: "C", count: 3 },
      { label: "B", count: 3 },
      { label: "SB", count: 1 },
    ],
  };
  return formats[count] || formats[10];
}

/**
 * Format angka score standar Indonesia (titik ribuan, koma desimal)
 */
export function formatScore(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
