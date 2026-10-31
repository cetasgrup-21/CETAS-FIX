
import { db } from "@/lib/db";

import {
  getCategoryMaximum,
  getPerJudgeMaximum,
  generateCategoryScoreOptions,
} from "@/lib/scoring-engine";

const TRANSACTION_TIMEOUT = 60_000;
const TRANSACTION_MAX_WAIT = 10_000;
const INSERT_BATCH_SIZE = 500;

export async function regenerateCategoryScoreOptions(
  categoryId: string
) {
  const startedAt = Date.now();

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

  // Generate semua opsi di memory sebelum memulai transaksi.
  const generated = generateCategoryScoreOptions(
    criteria,
    maximumPerJudge
  );

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

  const criterionIds = criteria.map(
    (criterion) => criterion.id
  );

  console.info("[SCORE REFRESH] Prepared", {
    categoryId,
    criteriaCount: criteria.length,
    optionCount: allOptions.length,
    preparationMs: Date.now() - startedAt,
  });

  // Delete dan insert tetap berada dalam satu transaksi
  // supaya opsi lama tidak hilang jika insert gagal.
  await db.$transaction(
    async (tx) => {
      const deleteStartedAt = Date.now();

      const deleted = await tx.scoreOption.deleteMany({
        where: {
          criterionId: {
            in: criterionIds,
          },
        },
      });

      console.info("[SCORE REFRESH] Deleted", {
        categoryId,
        deletedCount: deleted.count,
        durationMs: Date.now() - deleteStartedAt,
      });

      for (
        let offset = 0;
        offset < allOptions.length;
        offset += INSERT_BATCH_SIZE
      ) {
        const batch = allOptions.slice(
          offset,
          offset + INSERT_BATCH_SIZE
        );

        await tx.scoreOption.createMany({
          data: batch,
        });
      }

      console.info("[SCORE REFRESH] Inserted", {
        categoryId,
        optionCount: allOptions.length,
      });
    },
    {
      maxWait: TRANSACTION_MAX_WAIT,
      timeout: TRANSACTION_TIMEOUT,
    }
  );

  console.info("[SCORE REFRESH] Completed", {
    categoryId,
    criteriaCount: criteria.length,
    optionCount: allOptions.length,
    totalDurationMs: Date.now() - startedAt,
  });

  return {
    categoryMaximum,
    judgeCount,
    maximumPerJudge,
    criteriaCount: criteria.length,
    optionCount: allOptions.length,
  };
}

/**
 * Regenerate opsi skor untuk seluruh kategori dalam event.
 * Diproses berurutan untuk menghindari concurrent database writes.
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
    const result = await regenerateCategoryScoreOptions(
      category.id
    );

    results.push({
      categoryId: category.id,
      ...result,
    });
  }

  return results;
}
