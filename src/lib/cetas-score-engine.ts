/**
 * CETAS SCORE ENGINE — FINAL INTEGER
 * Category maximum is divided by judge count.
 * Peak is the rightmost value. Left values subtract interval.
 * Exactly 10 integer options per criterion.
 */
export const VALID_INTERVALS = [2, 3, 4, 5, 6] as const;
export type ValidInterval = (typeof VALID_INTERVALS)[number];

export function normalizeInterval(value: unknown): ValidInterval {
  const n = Number(value);
  return VALID_INTERVALS.includes(n as ValidInterval) ? (n as ValidInterval) : 2;
}

export function getCategoryMaximum(totalPoints: number, percentage: number): number {
  return Math.round(Number(totalPoints || 0) * (Number(percentage || 0) / 100));
}

export function getMaxScorePerJudge(categoryMaximum: number, judgeCount: number): number {
  const count = Math.max(1, Math.trunc(Number(judgeCount) || 1));
  if (categoryMaximum % count !== 0) {
    throw new Error(
      `Nilai maksimum kategori ${categoryMaximum} tidak habis dibagi ${count} juri. Nilai per juri wajib bilangan bulat.`
    );
  }
  return categoryMaximum / count;
}

export type ScoreEngineCriterion = { id: string; interval?: number | null };
export type ScoreEngineOption = { label: string; score: number; sortOrder: number };

function solvePeaks(criteria: ScoreEngineCriterion[], target: number) {
  const counts = new Map<ValidInterval, number>();
  for (const c of criteria) {
    const i = normalizeInterval(c.interval);
    counts.set(i, (counts.get(i) || 0) + 1);
  }

  const intervals = Array.from(counts.keys()).sort((a, b) => a - b) as ValidInterval[];
  if (!intervals.length) return new Map<ValidInterval, number>();

  const minPeak = (i: number) => i * 9 + 1;
  const minimumTotal = intervals.reduce(
    (s, i) => s + minPeak(i) * (counts.get(i) || 0), 0
  );
  if (minimumTotal > target) {
    throw new Error(
      `Total ${target} terlalu kecil. Minimum untuk 10 pilihan adalah ${minimumTotal}.`
    );
  }

  const weighted = intervals.reduce(
    (s, i) => s + i * (counts.get(i) || 0), 0
  );
  const ideal = new Map<number, number>();
  for (const i of intervals) ideal.set(i, (target * i) / weighted);

  type State = { cost: number; peaks: number[] };
  let states = new Map<number, State>([[0, { cost: 0, peaks: [] }]]);

  for (let idx = 0; idx < intervals.length; idx++) {
    const i = intervals[idx];
    const count = counts.get(i) || 0;
    const next = new Map<number, State>();
    const later = intervals.slice(idx + 1);
    const laterMinimum = later.reduce(
      (s, x) => s + minPeak(x) * (counts.get(x) || 0), 0
    );

    for (const [sum, state] of states) {
      const previousPeak = state.peaks.length ? state.peaks[state.peaks.length - 1] : 0;
      const low = Math.max(minPeak(i), previousPeak + 1);
      const high = Math.floor((target - sum - laterMinimum) / Math.max(1, count));
      if (high < low) continue;

      for (let peak = low; peak <= high; peak++) {
        const newSum = sum + peak * count;
        const cost = state.cost + Math.pow(peak - (ideal.get(i) || peak), 2) * count;
        const old = next.get(newSum);
        if (!old || cost < old.cost) {
          next.set(newSum, { cost, peaks: [...state.peaks, peak] });
        }
      }
    }
    states = next;
  }

  const best = states.get(target);
  if (!best) throw new Error(`Tidak ditemukan pembagian peak INTEGER untuk total ${target}.`);

  for (let i = 1; i < best.peaks.length; i++) {
    if (best.peaks[i] <= best.peaks[i - 1]) {
      throw new Error("Peak harus naik saat interval naik.");
    }
  }

  return new Map(intervals.map((i, idx) => [i, best.peaks[idx]]));
}

export function buildScoreOptionsForCriteria(
  criteria: ScoreEngineCriterion[],
  categoryMaximum: number,
  judgeCount: number
) {
  const target = getMaxScorePerJudge(categoryMaximum, judgeCount);
  const peaks = solvePeaks(criteria, target);
  const result = new Map<string, ScoreEngineOption[]>();

  for (const c of criteria) {
    const interval = normalizeInterval(c.interval);
    const peak = peaks.get(interval);
    if (!peak) throw new Error(`Peak interval ${interval} tidak ditemukan.`);

    const options: ScoreEngineOption[] = [];
    for (let index = 0; index < 10; index++) {
      const score = peak - interval * (9 - index);
      if (score <= 0 || !Number.isInteger(score)) {
        throw new Error(`Nilai materi ${c.id} tidak valid.`);
      }
      options.push({ label: String(score), score, sortOrder: index });
    }
    result.set(c.id, options);
  }

  const totalPeak = criteria.reduce(
    (s, c) => s + (result.get(c.id)?.[9]?.score || 0), 0
  );
  if (totalPeak !== target) {
    throw new Error(`TOTAL PEAK PER JURI ${totalPeak}, seharusnya ${target}.`);
  }

  return result;
}
