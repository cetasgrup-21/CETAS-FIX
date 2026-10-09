import { db } from "@/lib/db";

import {
  getCategoryMaximum,
  getPerJudgeMaximum,
  generateCategoryScoreOptions,
} from "@/lib/scoring-engine";

export async function regenerateCategoryScoreOptions(
  categoryId: string
) {
  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      event: true,
      criteria: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!category) {
    throw new Error("Kategori tidak ditemukan.");
  }

  const criteria = [...category.criteria].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const categoryMaximum = getCategoryMaximum(
    category.event.totalPoints,
    category.percentage
  );

  const assignedJudgeCount = await db.categoryJudge.count({
    where: {
      categoryId: category.id,
    },
  });

  const judgeCount = Math.max(
    1,
    Math.floor(Number(assignedJudgeCount || 1))
  );

  const maximumPerJudge = getPerJudgeMaximum(
    categoryMaximum,
    judgeCount
  );

  if (criteria.length === 0) {
    return {
      categoryMaximum,
      judgeCount,
      maximumPerJudge,
      criteriaCount: 0,
      optionCount: 0,
    };
  }

  /**
   * ==========================================================
   * GENERATE SEMUA NILAI DI MEMORY
   * ==========================================================
   */
  const generated = generateCategoryScoreOptions(
    criteria,
    maximumPerJudge
  );

  /**
   * Gabungkan seluruh ScoreOption menjadi SATU array.
   *
   * Nilai <= 0 sudah dibuang oleh scoring-engine.
   */
  const allOptions = generated.flatMap(
    (generatedItem, index) => {
      const criterion = criteria[index];

      if (!criterion) {
        return [];
      }

      return generatedItem.options.map((option) => ({
        criterionId: criterion.id,
        label: option.label,
        score: Math.floor(Number(option.score)),
        sortOrder: option.sortOrder,
      }));
    }
  );

  /**
   * ==========================================================
   * SIMPAN SEKALIGUS
   * ==========================================================
   *
   * Hanya:
   *
   * 1. DELETE semua ScoreOption untuk materi kategori
   * 2. INSERT semua ScoreOption baru
   *
   * Tidak ada loop query per materi.
   */
  const criterionIds = criteria.map(
    (criterion) => criterion.id
  );

  await db.$transaction(
    async (tx) => {
      await tx.scoreOption.deleteMany({
        where: {
          criterionId: {
            in: criterionIds,
          },
        },
      });

      if (allOptions.length > 0) {
        await tx.scoreOption.createMany({
          data: allOptions,
        });
      }
    },
    {
      /**
       * Sedikit diperbesar sebagai pengaman untuk
       * event dengan materi yang sangat banyak.
       *
       * Normalnya transaksi sekarang jauh lebih cepat
       * karena hanya 2 query utama.
       */
      timeout: 15000,
    }
  );

  return {
    categoryMaximum,
    judgeCount,
    maximumPerJudge,
    criteriaCount: criteria.length,
    optionCount: allOptions.length,
  };
}

/**
 * ============================================================
 * REGENERATE SEMUA KATEGORI DALAM EVENT
 * ============================================================
 */
export async function regenerateEventScoreOptions(
  eventId: string
) {
  const categories = await db.category.findMany({
    where: {
      eventId,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
    },
  });

  const results = [];

  for (const category of categories) {
    const result =
      await regenerateCategoryScoreOptions(
        category.id
      );

    results.push({
      categoryId: category.id,
      ...result,
    });
  }

  return results;
}