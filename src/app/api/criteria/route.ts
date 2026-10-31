import { NextResponse } from "next/server";
import { db } from "@/lib/db";
type Difficulty = "MUDAH" | "SULIT";

const VALID_INTERVALS = [2, 3, 4, 5, 6] as const;
type ValidInterval = (typeof VALID_INTERVALS)[number];

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeInterval(value: unknown): ValidInterval {
  const n = Number(value);
  return VALID_INTERVALS.includes(n as ValidInterval)
    ? (n as ValidInterval)
    : 2;
}

function difficultyFromInterval(interval: number): Difficulty {
  return interval >= 5 ? "SULIT" : "MUDAH";
}

function calculatePeaksByInterval(
  criteria: Array<{ interval?: number | null }>,
  categoryMaximum: number
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const criterion of criteria) {
    const interval = normalizeInterval(criterion.interval);
    counts.set(interval, (counts.get(interval) || 0) + 1);
  }

  const result = new Map<number, number>();
  if (counts.size === 0 || categoryMaximum <= 0) return result;

  const totalDifficulty = Array.from(counts.entries()).reduce(
    (sum, [interval, count]) => sum + interval * count,
    0
  );

  for (const interval of counts.keys()) {
    result.set(
      interval,
      Math.max(1, Math.round((categoryMaximum * interval) / totalDifficulty))
    );
  }

  const intervals = Array.from(counts.keys()).sort((a, b) => a - b);

  const totalPeak = () =>
    intervals.reduce(
      (sum, interval) =>
        sum + (result.get(interval) || 1) * (counts.get(interval) || 0),
      0
    );

  const difference = categoryMaximum - totalPeak();

  if (difference !== 0) {
    for (let range = 1; range <= 25; range++) {
      const search = (
        index: number,
        remaining: number,
        changes: Map<number, number>
      ): Map<number, number> | null => {
        if (index === intervals.length) {
          if (remaining !== 0) return null;

          const candidate = new Map<number, number>();
          for (const interval of intervals) {
            candidate.set(
              interval,
              Math.max(1, (result.get(interval) || 1) + (changes.get(interval) || 0))
            );
          }

          for (let i = 1; i < intervals.length; i++) {
            const previous = candidate.get(intervals[i - 1]) || 0;
            const current = candidate.get(intervals[i]) || 0;
            if (current <= previous) return null;
          }

          return new Map(changes);
        }

        const interval = intervals[index];
        const count = counts.get(interval) || 1;
        const current = result.get(interval) || 1;

        for (let delta = -range; delta <= range; delta++) {
          const next = current + delta;
          if (next < 1) continue;

          changes.set(interval, delta);
          const found = search(index + 1, remaining - delta * count, changes);
          if (found) return found;
          changes.delete(interval);
        }

        return null;
      };

      const changes = search(0, difference, new Map());
      if (changes) {
        for (const [interval, delta] of changes.entries()) {
          result.set(interval, Math.max(1, (result.get(interval) || 1) + delta));
        }
        break;
      }
    }
  }

  return result;
}

function buildScoreTemplates(peak: number, interval: number) {
  const step = normalizeInterval(interval);
  const values: number[] = [];

  // Puncak selalu di paling kanan. Ke kiri berkurang persis sesuai interval.
  for (let i = 5; i >= 0; i--) {
    const value = peak - i * step;
    if (value > 0) values.push(value);
  }

  if (!values.includes(peak)) values.push(peak);

  return Array.from(new Set(values)).map((score, index) => ({
    label: String(score),
    score,
    sortOrder: index,
  }));
}

async function regenerateCategoryOptions(categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: {
      event: true,
      subCategories: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: {
          criteria: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      criteria: {
        where: { subCategoryId: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) throw new Error("Kategori tidak ditemukan.");

  // Semua materi dalam kategori adalah satu pool nilai.
  // Urutannya mengikuti subkategori -> materi, lalu materi langsung kategori.
  const criteria = [
    ...category.subCategories.flatMap((subCategory) => subCategory.criteria),
    ...category.criteria,
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  if (criteria.length === 0) return;

  const categoryMaximum = Math.round(
    category.event.totalPoints * (category.percentage / 100)
  );

  const peaks = calculatePeaksByInterval(criteria, categoryMaximum);

  const criterionIds = criteria.map((criterion) => criterion.id);

  const allOptions = criteria.flatMap((criterion) => {
    const interval = normalizeInterval(criterion.interval);

    const peak =
      peaks.get(interval) ||
      Math.max(1, Math.round(categoryMaximum / criteria.length));

    const options = buildScoreTemplates(peak, interval);

    return options.map((option) => ({
      criterionId: criterion.id,
      label: option.label,
      score: option.score,
      sortOrder: option.sortOrder,
    }));
  });

  await db.$transaction(async (tx) => {
    await tx.scoreOption.deleteMany({
      where: {
        criterionId: { in: criterionIds },
      },
    });

    if (allOptions.length > 0) {
      await tx.scoreOption.createMany({
        data: allOptions,
      });
    }
  });
}

/**
 * ============================================================
 * GET CRITERIA
 * ============================================================
 */
export async function GET(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const categoryId = normalize(
      searchParams.get("categoryId")
    );

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "categoryId wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const criteria =
      await db.criterion.findMany({
        where: {
          categoryId,
        },

        orderBy: {
          sortOrder: "asc",
        },

        include: {
          material: true,

          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    const sections = await db.subCategory.findMany({
      where: { categoryId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      criteria,
      sectionWeights: sections.map((section) => ({
        section: section.name,
        percentage: section.percentage,
        sortOrder: section.sortOrder,
      })),
    });
  } catch (error) {
    console.error(
      "GET CRITERIA ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Gagal mengambil materi.",
        detail:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * POST CRITERION / MATERI
 * ============================================================
 *
 * Alur:
 *
 * KATEGORI
 *    ↓
 * SUB KATEGORI
 *    ↓
 * MATERI
 *    ↓
 * DIFFICULTY
 *    ↓
 * CETAS ENGINE
 *
 * Jika materialId ada:
 *   gunakan materi dari MasterMaterial.
 *
 * Jika materialId kosong:
 *   buat / gunakan materi master berdasarkan
 *   category + section + name.
 * ============================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const categoryId = normalize(
      body.categoryId
    );

    const subCategoryId = normalize(
      body.subCategoryId
    );

    let materialId = normalize(
      body.materialId
    );

    let name = normalize(
      body.name
    );

    let section = normalize(
      body.section
    );

    const interval = normalizeInterval(body.interval);
    const difficulty = difficultyFromInterval(interval);

    /**
     * --------------------------------------------------------
     * VALIDASI KATEGORI
     * --------------------------------------------------------
     */
    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori belum dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * AMBIL KATEGORI
     * --------------------------------------------------------
     */
    const category =
      await db.category.findUnique({
        where: {
          id: categoryId,
        },

        include: {
          event: true,

          criteria: {
            orderBy: {
              sortOrder: "asc",
            },

            include: {
              material: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * JIKA MEMILIH MASTER MATERIAL
     * --------------------------------------------------------
     */
    if (materialId) {
      const master =
        await db.masterMaterial.findUnique({
          where: {
            id: materialId,
          },
        });

      if (!master) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Materi master tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      name = master.name;
      if (!section) {
        section = master.section;
      }
    }

    /**
     * --------------------------------------------------------
     * VALIDASI MATERI
     * --------------------------------------------------------
     */
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nama materi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sub kategori wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * CEK DUPLIKAT DALAM EVENT
     * --------------------------------------------------------
     */
    /**
     * --------------------------------------------------------
     * SIMPAN KE MASTER MATERIAL
     * --------------------------------------------------------
     *
     * Ini yang membuat materi manual event 1
     * bisa dipilih kembali di event berikutnya.
     */
    if (!materialId) {
      const existingMaster =
        await db.masterMaterial.findFirst({
          where: {
            category: category.name,
            section,
            name,
          },
        });

      const master = existingMaster
        ? await db.masterMaterial.update({
            where: { id: existingMaster.id },
            data: { status: "ACTIVE" },
          })
        : await db.masterMaterial.create({
            data: {
              category: category.name,
              section,
              name,
              status: "ACTIVE",
            },
          });

      materialId = master.id;
    }

    // Subkategori adalah sumber kebenaran untuk section.
    // Jangan percaya subCategoryId dari frontend tanpa memvalidasi kategorinya.
    let resolvedSubCategory = await db.subCategory.findFirst({
      where: {
        categoryId,
        name: section,
      },
    });

    if (!resolvedSubCategory) {
      const maxSort = await db.subCategory.aggregate({
        where: { categoryId },
        _max: { sortOrder: true },
      });

      resolvedSubCategory = await db.subCategory.create({
        data: {
          categoryId,
          name: section,
          percentage: 0,
          sortOrder: Number(maxSort._max.sortOrder ?? -1) + 1,
        },
      });
    }

    if (subCategoryId && subCategoryId !== resolvedSubCategory.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Sub kategori tidak sesuai dengan kategori/section yang dipilih.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------------
     * SORT ORDER
     * --------------------------------------------------------
     */
    const maxSort = await db.criterion.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const sortOrder =
      Number(maxSort._max.sortOrder ?? -1) + 1;

    /**
     * --------------------------------------------------------
     * CREATE CRITERION
     * --------------------------------------------------------
     */
    const criterion =
      await db.criterion.create({
        data: {
          categoryId,
          subCategoryId: resolvedSubCategory.id,
          materialId,
          name,
          section,
          interval,
          difficulty,
          sortOrder,
          inputType: "RATING",
        },
      });

    /**
     * --------------------------------------------------------
     * REGENERATE ANGKA
     * --------------------------------------------------------
     */
    await regenerateCategoryOptions(
      categoryId
    );

    /**
     * --------------------------------------------------------
     * AMBIL HASIL
     * --------------------------------------------------------
     */
    const result =
      await db.criterion.findUnique({
        where: {
          id: criterion.id,
        },

        include: {
          material: true,

          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Materi berhasil ditambahkan.",

        criterion: result,

        materialId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CRITERION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Gagal menambahkan materi.",

        detail:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * PATCH
 * EDIT / REORDER MATERI
 * ============================================================
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const action = normalize(body.action);

    /**
     * --------------------------------------------------------
     * REORDER SUB KATEGORI
     * --------------------------------------------------------
     *
     * Sub kategori tidak memiliki kolom sortOrder sendiri.
     * Urutannya disimpan melalui sortOrder Criterion secara global
     * dalam satu kategori, dengan semua materi dalam satu sub
     * kategori tetap mempertahankan urutan internalnya.
     */
    if (action === "setSectionWeight") {
      const categoryId = normalize(body.categoryId);
      const section = normalize(body.section);
      const percentage = Number(body.percentage);

      if (!categoryId || !section || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return NextResponse.json({ success: false, error: "Data bobot sub kategori tidak valid." }, { status: 400 });
      }

      const others = await db.subCategory.aggregate({
        where: { categoryId, NOT: { name: section } },
        _sum: { percentage: true },
      });
      const otherTotal = Number(others._sum.percentage || 0);
      if (otherTotal + percentage > 100) {
        return NextResponse.json({ success: false, error: `Total bobot sub kategori tidak boleh lebih dari 100%. Sub kategori lain saat ini ${otherTotal}%.` }, { status: 400 });
      }

      const maxSort = await db.subCategory.aggregate({
        where: { categoryId },
        _max: { sortOrder: true },
      });

      const existing = await db.subCategory.findFirst({
        where: { categoryId, name: section },
      });

      const saved = existing
        ? await db.subCategory.update({
            where: { id: existing.id },
            data: { percentage },
          })
        : await db.subCategory.create({
            data: {
              categoryId,
              name: section,
              percentage,
              sortOrder: Number(maxSort._max.sortOrder || 0) + 1,
            },
          });

      await regenerateCategoryOptions(categoryId);

      return NextResponse.json({ success: true, section: saved });
    }

    if (action === "reorderSections") {
      const categoryId =
        normalize(body.categoryId);

      const orderedSections: string[] = Array.isArray(
        body.orderedSections
      )
        ? (body.orderedSections as unknown[])
            .map((value: unknown) => normalize(value))
            .filter((value: string) => Boolean(value))
        : [];

      if (
        !categoryId ||
        orderedSections.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Data reorder sub kategori tidak lengkap.",
          },
          {
            status: 400,
          }
        );
      }

      const criteria =
        await db.criterion.findMany({
          where: {
            categoryId,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });

      const currentSections: string[] = [];
      const seen = new Set<string>();

      for (const criterion of criteria) {
        const section = normalize(
          criterion.section ||
            "Tanpa Sub Kategori"
        );
        const key = section.toLowerCase();

        if (!seen.has(key)) {
          seen.add(key);
          currentSections.push(section);
        }
      }

      if (
        currentSections.length !==
        orderedSections.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Jumlah sub kategori tidak sesuai.",
          },
          {
            status: 400,
          }
        );
      }

      const currentKeys = currentSections
        .map((section: string) => section.toLowerCase())
        .sort();

      const incomingKeys = orderedSections
        .map((section: string) => section.toLowerCase())
        .sort();

      if (
        JSON.stringify(currentKeys) !==
        JSON.stringify(incomingKeys)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Sub kategori yang diurutkan tidak sesuai dengan kategori.",
          },
          {
            status: 400,
          }
        );
      }

      const criteriaBySection = new Map<
        string,
        typeof criteria
      >();

      for (const criterion of criteria) {
        const section = normalize(
          criterion.section ||
            "Tanpa Sub Kategori"
        );
        const key = section.toLowerCase();
        const current =
          criteriaBySection.get(key) || [];

        current.push(criterion);
        criteriaBySection.set(key, current);
      }

      const finalOrder = orderedSections.flatMap(
        (section: string) =>
          criteriaBySection.get(
            section.toLowerCase()
          ) || []
      );

      if (
        finalOrder.length !== criteria.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Urutan sub kategori tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      await db.$transaction(
        finalOrder.map(
          (criterion: (typeof criteria)[number], index: number) =>
            db.criterion.update({
              where: {
                id: criterion.id,
              },
              data: {
                sortOrder: index,
              },
            })
        )
      );

      await db.$transaction(
        orderedSections.map((section: string, index: number) =>
          db.subCategory.updateMany({
            where: { categoryId, name: section },
            data: { sortOrder: index },
          })
        )
      );

      await regenerateCategoryOptions(
        categoryId
      );

      return NextResponse.json({
        success: true,
        message:
          "Urutan sub kategori berhasil diperbarui.",
      });
    }

    /**
     * --------------------------------------------------------
     * DELETE SUB KATEGORI
     * --------------------------------------------------------
     *
     * Hanya boleh menghapus master materi yang belum digunakan
     * oleh Criterion. Materi penilaian tidak ikut terhapus.
     */
    if (action === "deleteSection") {
      const categoryId =
        normalize(body.categoryId);
      const categoryName =
        normalize(body.categoryName);
      const section =
        normalize(body.section);

      if (
        !categoryId ||
        !categoryName ||
        !section
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Data hapus sub kategori tidak lengkap.",
          },
          {
            status: 400,
          }
        );
      }

      const usedCriteria =
        await db.criterion.count({
          where: {
            categoryId,
            section: {
              equals: section,
            },
          },
        });

      if (usedCriteria > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Sub kategori "${section}" masih digunakan oleh ${usedCriteria} materi. Hapus materinya terlebih dahulu.`,
          },
          {
            status: 409,
          }
        );
      }

      await db.subCategory.deleteMany({
        where: { categoryId, name: section },
      });

      const deleted = { count: 0 }; // Master material tetap dipertahankan secara global

      return NextResponse.json({
        success: true,
        message:
          deleted.count > 0
            ? `Sub kategori "${section}" berhasil dihapus.`
            : `Sub kategori "${section}" tidak memiliki master materi aktif.`,
      });
    }

    /**
     * --------------------------------------------------------
     * REORDER
     * --------------------------------------------------------
     */
    if (action === "reorder") {
      const categoryId =
        normalize(body.categoryId);

      const section =
        normalize(body.section);

      const orderedIds = Array.isArray(
        body.orderedIds
      )
        ? body.orderedIds
            .map(normalize)
            .filter(Boolean)
        : [];

      if (
        !categoryId ||
        !section ||
        orderedIds.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Data reorder materi tidak lengkap.",
          },
          {
            status: 400,
          }
        );
      }

      const criteria =
        await db.criterion.findMany({
          where: {
            categoryId,
          },

          orderBy: {
            sortOrder: "asc",
          },
        });

      const sectionCriteria =
        criteria.filter(
          (criterion) =>
            normalize(
              criterion.section
            ) === section
        );

      if (
        sectionCriteria.length !==
        orderedIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Urutan materi tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      const currentIds =
        sectionCriteria
          .map(
            (criterion) =>
              criterion.id
          )
          .sort();

      const incomingIds =
        [...orderedIds].sort();

      if (
        JSON.stringify(
          currentIds
        ) !==
        JSON.stringify(
          incomingIds
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Materi yang diurutkan tidak sesuai dengan sub kategori.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Pertahankan semua materi di luar sub kategori
       * pada posisi relatifnya, lalu sisipkan materi
       * sub kategori sesuai urutan baru.
       *
       * sortOrder tetap global dalam satu kategori.
       */
      let sectionIndex = 0;

      const finalOrder =
        criteria.map(
          (criterion) => {
            if (
              normalize(
                criterion.section
              ) === section
            ) {
              const nextId =
                orderedIds[
                  sectionIndex++
                ];

              return nextId;
            }

            return criterion.id;
          }
        );

      await db.$transaction(
        finalOrder.map(
          (criterionId, index) =>
            db.criterion.update({
              where: {
                id: criterionId,
              },
              data: {
                sortOrder: index,
              },
            })
        )
      );

      await regenerateCategoryOptions(
        categoryId
      );

      return NextResponse.json({
        success: true,
        message:
          "Urutan materi berhasil diperbarui.",
      });
    }

    /**
     * --------------------------------------------------------
     * EDIT
     * --------------------------------------------------------
     */
    const id = normalize(body.id);
    const categoryId =
      normalize(body.categoryId);

    const name = normalize(body.name);
    const section =
      normalize(body.section);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID materi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await db.criterion.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Materi tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const interval = normalizeInterval(
      body.interval ?? existing.interval
    );
    const difficulty = difficultyFromInterval(interval);

    const targetCategoryId =
      categoryId ||
      existing.categoryId;

    const category =
      await db.category.findUnique({
        where: {
          id: targetCategoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nama materi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sub kategori wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    let resolvedSubCategory = await db.subCategory.findFirst({
      where: {
        categoryId: targetCategoryId,
        name: section,
      },
    });

    if (!resolvedSubCategory) {
      const maxSort = await db.subCategory.aggregate({
        where: { categoryId: targetCategoryId },
        _max: { sortOrder: true },
      });

      resolvedSubCategory = await db.subCategory.create({
        data: {
          categoryId: targetCategoryId,
          name: section,
          percentage: 0,
          sortOrder: Number(maxSort._max.sortOrder ?? -1) + 1,
        },
      });
    }

    /*
     * Update / buat Master Material baru.
     * Master lama tidak dihapus karena bisa digunakan
     * oleh event lain.
     */
    const existingMaster =
      await db.masterMaterial.findFirst({
        where: {
          category: category.name,
          section,
          name,
        },
      });

    const master = existingMaster
      ? await db.masterMaterial.update({
          where: { id: existingMaster.id },
          data: { status: "ACTIVE" },
        })
      : await db.masterMaterial.create({
          data: {
            category: category.name,
            section,
            name,
            status: "ACTIVE",
          },
        });

    const updated =
      await db.criterion.update({
        where: {
          id,
        },

        data: {
          categoryId:
            targetCategoryId,
          subCategoryId:
            resolvedSubCategory.id,
          materialId:
            master.id,
          name,
          section,
          interval,
          difficulty,
        },

        include: {
          material: true,

          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    await regenerateCategoryOptions(
      targetCategoryId
    );

    const result =
      await db.criterion.findUnique({
        where: {
          id: updated.id,
        },

        include: {
          material: true,

          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Materi berhasil diperbarui.",
      criterion: result,
    });
  } catch (error) {
    console.error(
      "PATCH CRITERION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengubah materi.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * DELETE
 * HAPUS MATERI
 * ============================================================
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    /*
     * HAPUS SUB KATEGORI
     * Frontend mengirim action=deleteSection lewat DELETE.
     * Jangan masuk ke handler hapus materi di bawahnya.
     */
    const action = normalize(body.action);

    if (action === "deleteSection") {
      const categoryId = normalize(body.categoryId);
      const categoryName = normalize(body.categoryName);
      const section = normalize(body.section);

      if (!categoryId || !categoryName || !section) {
        return NextResponse.json(
          {
            success: false,
            error: "Data hapus sub kategori tidak lengkap.",
          },
          { status: 400 }
        );
      }

      /*
       * Jangan menghapus sub kategori yang masih mempunyai
       * materi/criterion pada kategori event ini.
       */
      const usedCriteria = await db.criterion.count({
        where: {
          categoryId,
          section: {
            equals: section,
          },
        },
      });

      if (usedCriteria > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Sub kategori "${section}" masih digunakan oleh ${usedCriteria} materi. Hapus materinya terlebih dahulu.`,
          },
          { status: 409 }
        );
      }

      const deleted = { count: 0 }; // Master material tetap dipertahankan secara global

      await db.subCategory.deleteMany({
        where: {
          categoryId,
          name: section,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          deleted.count > 0
            ? `Sub kategori "${section}" berhasil dihapus.`
            : `Sub kategori "${section}" tidak memiliki master materi aktif.`,
      });
    }

    const id = normalize(body.id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID materi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const criterion =
      await db.criterion.findUnique({
        where: {
          id,
        },
      });

    if (!criterion) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Materi tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Jangan menghapus materi yang sudah dipakai
     * untuk penilaian juri.
     */
    const scoreCount =
      await db.score.count({
        where: {
          criterionId: id,
        },
      });

    if (scoreCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Materi tidak dapat dihapus karena sudah memiliki nilai juri.",
        },
        {
          status: 409,
        }
      );
    }

    const categoryId =
      criterion.categoryId;

    await db.criterion.delete({
      where: {
        id,
      },
    });

    /*
     * Rapikan sortOrder setelah delete.
     */
    const remaining =
      await db.criterion.findMany({
        where: {
          categoryId,
        },

        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

    await db.$transaction(
      remaining.map(
        (item, index) =>
          db.criterion.update({
            where: {
              id: item.id,
            },
            data: {
              sortOrder: index,
            },
          })
      )
    );

    await regenerateCategoryOptions(
      categoryId
    );

    return NextResponse.json({
      success: true,
      message:
        `Materi "${criterion.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error(
      "DELETE CRITERION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus materi.",
      },
      {
        status: 500,
      }
    );
  }
}