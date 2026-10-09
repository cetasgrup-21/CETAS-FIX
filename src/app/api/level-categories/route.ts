import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

async function getCategory(id: string) {
  return db.category.findUnique({
    where: { id },
    select: {
      id: true,
      eventId: true,
      eventLevelId: true,
      name: true,
      percentage: true,
      status: true,
      sortOrder: true,
    },
  });
}

async function copyLevelConfiguration(sourceLevelId: string, targetLevelId: string) {
  if (!sourceLevelId || !targetLevelId) {
    throw new Error("Tingkatan sumber dan tujuan wajib dipilih.");
  }

  if (sourceLevelId === targetLevelId) {
    throw new Error("Tingkatan sumber dan tujuan tidak boleh sama.");
  }

  const [source, target] = await Promise.all([
    db.eventLevel.findUnique({
      where: { id: sourceLevelId },
      select: {
        id: true,
        eventId: true,
        name: true,
        status: true,
        categories: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          include: {
            subCategories: {
              where: { status: "ACTIVE" },
              orderBy: { sortOrder: "asc" },
              include: {
                criteria: {
                  where: {},
                  orderBy: { sortOrder: "asc" },
                  include: {
                    options: { orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
            criteria: {
              where: {
                subCategoryId: null,
              },
              orderBy: { sortOrder: "asc" },
              include: {
                options: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    }),
    db.eventLevel.findUnique({
      where: { id: targetLevelId },
      select: {
        id: true,
        eventId: true,
        name: true,
        status: true,
        _count: { select: { categories: true } },
      },
    }),
  ]);

  if (!source) throw new Error("Tingkatan sumber tidak ditemukan.");
  if (!target) throw new Error("Tingkatan tujuan tidak ditemukan.");
  if (source.eventId !== target.eventId) {
    throw new Error("Tingkatan sumber dan tujuan harus berada pada event yang sama.");
  }
  if (source.status !== "ACTIVE" || target.status !== "ACTIVE") {
    throw new Error("Tingkatan sumber dan tujuan harus aktif.");
  }
  if (source.categories.length === 0) {
    throw new Error(`Tingkatan ${source.name} belum memiliki kategori untuk disalin.`);
  }
  if ((target._count?.categories || 0) > 0) {
    throw new Error(`Tingkatan ${target.name} sudah memiliki kategori. Kosongkan tingkatan tujuan terlebih dahulu agar salinan tidak menggandakan konfigurasi.`);
  }

  await db.$transaction(async (tx) => {
    for (const sourceCategory of source.categories) {
      // Buat kategori tujuan terlebih dahulu supaya kita mendapatkan
      // categoryId baru yang benar untuk seluruh materi/kriteria.
      const targetCategory = await tx.category.create({
        data: {
          eventId: source.eventId,
          eventLevelId: target.id,
          name: sourceCategory.name,
          percentage: sourceCategory.percentage,
          status: sourceCategory.status,
          sortOrder: sourceCategory.sortOrder,
        },
      });

      // Subkategori harus dibuat satu per satu karena Criterion memiliki
      // dua relasi wajib: categoryId dan (opsional) subCategoryId.
      // Nested create dari SubCategory sebelumnya hanya mengisi
      // subCategoryId, sehingga categoryId yang wajib menjadi kosong.
      for (const sourceSubCategory of sourceCategory.subCategories) {
        const targetSubCategory = await tx.subCategory.create({
          data: {
            categoryId: targetCategory.id,
            name: sourceSubCategory.name,
            percentage: sourceSubCategory.percentage,
            status: sourceSubCategory.status,
            sortOrder: sourceSubCategory.sortOrder,
          },
        });

        for (const sourceCriterion of sourceSubCategory.criteria) {
          const targetCriterion = await tx.criterion.create({
            data: {
              categoryId: targetCategory.id,
              subCategoryId: targetSubCategory.id,
              materialId: sourceCriterion.materialId,
              name: sourceCriterion.name,
              section: sourceCriterion.section,
              interval: sourceCriterion.interval,
              sortOrder: sourceCriterion.sortOrder,
              inputType: sourceCriterion.inputType,
              difficulty: sourceCriterion.difficulty,
            },
          });

          if (sourceCriterion.options.length > 0) {
            await tx.scoreOption.createMany({
              data: sourceCriterion.options.map((option) => ({
                criterionId: targetCriterion.id,
                label: option.label,
                score: option.score,
                sortOrder: option.sortOrder,
              })),
            });
          }
        }
      }

      // Materi yang berada langsung di kategori (tanpa subkategori).
      for (const sourceCriterion of sourceCategory.criteria) {
        const targetCriterion = await tx.criterion.create({
          data: {
            categoryId: targetCategory.id,
            subCategoryId: null,
            materialId: sourceCriterion.materialId,
            name: sourceCriterion.name,
            section: sourceCriterion.section,
            interval: sourceCriterion.interval,
            sortOrder: sourceCriterion.sortOrder,
            inputType: sourceCriterion.inputType,
            difficulty: sourceCriterion.difficulty,
          },
        });

        if (sourceCriterion.options.length > 0) {
          await tx.scoreOption.createMany({
            data: sourceCriterion.options.map((option) => ({
              criterionId: targetCriterion.id,
              label: option.label,
              score: option.score,
              sortOrder: option.sortOrder,
            })),
          });
        }
      }
    }
  });

  return {
    sourceLevel: source.name,
    targetLevel: target.name,
    categoryCount: source.categories.length,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (clean(body.action) === "copy-level") {
      try {
        const result = await copyLevelConfiguration(
          clean(body.sourceLevelId),
          clean(body.targetLevelId)
        );

        return NextResponse.json({
          success: true,
          message: `Konfigurasi ${result.sourceLevel} berhasil disalin ke ${result.targetLevel}.`,
          ...result,
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Gagal menyalin konfigurasi tingkatan.",
          },
          { status: 400 }
        );
      }
    }

    const eventLevelId = clean(body.eventLevelId);
    const name = clean(body.name);
    const percentage = Number(body.percentage ?? 0);

    if (!eventLevelId) {
      return NextResponse.json(
        { error: "Tingkatan wajib dipilih." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Bobot kategori harus antara 1 sampai 100." },
        { status: 400 }
      );
    }

    const level = await db.eventLevel.findUnique({
      where: { id: eventLevelId },
      select: { id: true, eventId: true, status: true },
    });

    if (!level) {
      return NextResponse.json(
        { error: "Tingkatan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (level.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tingkatan sedang tidak aktif." },
        { status: 400 }
      );
    }

    const total = await db.category.aggregate({
      where: {
        eventId: level.eventId,
        eventLevelId,
        status: "ACTIVE",
      },
      _sum: { percentage: true },
    });

    if (Number(total._sum.percentage || 0) + percentage > 100.000001) {
      return NextResponse.json(
        { error: "Total bobot kategori pada tingkatan ini tidak boleh lebih dari 100%." },
        { status: 400 }
      );
    }

    const last = await db.category.findFirst({
      where: { eventId: level.eventId, eventLevelId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const category = await db.category.create({
      data: {
        eventId: level.eventId,
        eventLevelId,
        name,
        percentage,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("CREATE LEVEL CATEGORY ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan kategori.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = clean(body.id);
    const category = await getCategory(id);

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const name = body.name !== undefined ? clean(body.name) : category.name;
    const percentage =
      body.percentage !== undefined
        ? Number(body.percentage)
        : category.percentage;
    const requestedLevelId =
      body.eventLevelId !== undefined
        ? clean(body.eventLevelId)
        : category.eventLevelId || "";

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Bobot kategori harus antara 1 sampai 100." },
        { status: 400 }
      );
    }

    if (requestedLevelId) {
      const level = await db.eventLevel.findUnique({
        where: { id: requestedLevelId },
        select: { id: true, eventId: true, status: true },
      });

      if (!level || level.eventId !== category.eventId) {
        return NextResponse.json(
          { error: "Tingkatan tujuan tidak ditemukan atau bukan milik event yang sama." },
          { status: 400 }
        );
      }

      if (level.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Tingkatan tujuan sedang tidak aktif." },
          { status: 400 }
        );
      }

      const total = await db.category.aggregate({
        where: {
          eventId: category.eventId,
          eventLevelId: requestedLevelId,
          status: "ACTIVE",
          id: { not: id },
        },
        _sum: { percentage: true },
      });

      if (Number(total._sum.percentage || 0) + percentage > 100.000001) {
        return NextResponse.json(
          { error: "Total bobot kategori pada tingkatan ini tidak boleh lebih dari 100%." },
          { status: 400 }
        );
      }
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        name,
        percentage,
        eventLevelId: requestedLevelId || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE LEVEL CATEGORY ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengubah kategori.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = clean(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori wajib diisi." },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE LEVEL CATEGORY ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus kategori.",
      },
      { status: 500 }
    );
  }
}
