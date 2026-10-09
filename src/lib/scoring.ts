export type ScoreLevel = "MUDAH" | "SULIT";

export const SCORE_TEMPLATES = {
  MUDAH: {
    "SANGAT KURANG": [18, 21, 24],
    "KURANG": [27, 30, 33],
    "BAGUS": [36, 39, 42],
    "SANGAT BAGUS": [45, 48, 50]
  },
  SULIT: {
    "SANGAT KURANG": [3, 6, 9],
    "KURANG": [12, 15, 18],
    "BAGUS": [21, 24, 27],
    "SANGAT BAGUS": [30, 33, 35]
  }
} as const;

export function weightedMaterialScore(
  rawScore: number,
  maxRawScore: number,
  categoryWeight: number,
  subCategoryWeight: number
) {
  if (!maxRawScore) return 0;
  const normalized = Math.max(0, Math.min(1, rawScore / maxRawScore));
  return normalized * categoryWeight * subCategoryWeight;
}