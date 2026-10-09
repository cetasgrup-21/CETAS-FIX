import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * ============================================================
 * POST
 * TAMBAH SUBKATEGORI
 *
 * SUBKATEGORI TIDAK MEMILIKI BOBOT.
 * Bobot hanya berada pada CATEGORY.
 * ============================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const categoryId = String(body.categoryId || "").trim();
    const name = String(body.name || "").trim();

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama subkategori wajib diisi.",
        },
        { status: 400 }
      );
    }

    /**
     * Pastikan kategori benar-benar ada.
     */
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        name: true,
        eventId: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    /**
     * Jangan izinkan nama subkategori duplikat
     * dalam kategori yang sama.
     */
    const existing = await db.subCategory.findFirst({
      where: {
        categoryId,
        name: {
          equals: name,
        },
        status: "ACTIVE",
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Subkategori "${name}" sudah ada pada kategori "${category.name}".`,
        },
        { status: 409 }
      );
    }

    /**
     * Ambil urutan terakhir.
     */
    const maxSort = await db.subCategory.aggregate({
      where: {
        categoryId,
      },
      _max: {
        sortOrder: true,
      },
    });

    /**
     * PENTING:
     *
     * percentage = 0
     *
     * Subkategori tidak mempunyai bobot.
     * Bobot penilaian mengikuti category.percentage.
     */
    const saved = await db.subCategory.create({
      data: {
        categoryId,
        name,
        percentage: 0,
        sortOrder:
          Number(maxSort._max.sortOrder ?? -1) + 1,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Subkategori berhasil ditambahkan.",
        subCategory: saved,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE SUBCATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan subkategori.",
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
 * EDIT / REORDER SUBKATEGORI
 * ============================================================
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const action = String(
      body.action || ""
    ).trim();

    /**
     * --------------------------------------------------------
     * REORDER
     * --------------------------------------------------------
     */
    if (action === "reorder") {
      const categoryId = String(
        body.categoryId || ""
      ).trim();

      const orderedIds = Array.isArray(
        body.orderedIds
      )
        ? body.orderedIds
            .map((id: unknown) =>
              String(id).trim()
            )
            .filter(Boolean)
        : [];

      if (
        !categoryId ||
        orderedIds.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Data urutan subkategori tidak lengkap.",
          },
          {
            status: 400,
          }
        );
      }

      const current =
        await db.subCategory.findMany({
          where: {
            categoryId,
            status: "ACTIVE",
          },
          orderBy: {
            sortOrder: "asc",
          },
        });

      if (
        current.length !==
        orderedIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Jumlah subkategori tidak sesuai.",
          },
          {
            status: 400,
          }
        );
      }

      const currentIds = current
        .map((item) => item.id)
        .sort();

      const incomingIds = [
        ...orderedIds,
      ].sort();

      if (
        JSON.stringify(currentIds) !==
        JSON.stringify(incomingIds)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Urutan subkategori tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      await db.$transaction(
        orderedIds.map(
          (
            id: string,
            index: number
          ) =>
            db.subCategory.update({
              where: {
                id,
              },
              data: {
                sortOrder: index,
              },
            })
        )
      );

      return NextResponse.json({
        success: true,
        message:
          "Urutan subkategori berhasil diperbarui.",
      });
    }

    /**
     * --------------------------------------------------------
     * EDIT SUBKATEGORI
     * --------------------------------------------------------
     */
    const id = String(
      body.id || ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID subkategori wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const current =
      await db.subCategory.findUnique({
        where: {
          id,
        },
      });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Subkategori tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const name = String(
      body.name ?? current.name
    ).trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nama subkategori wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Jangan izinkan nama duplikat.
     */
    const duplicate =
      await db.subCategory.findFirst({
        where: {
          categoryId:
            current.categoryId,
          name,
          status: "ACTIVE",
          id: {
            not: current.id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Subkategori "${name}" sudah ada.`,
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Kalau nama berubah, sinkronkan
     * section materi.
     *
     * percentage selalu 0 karena
     * subkategori tidak mempunyai bobot.
     */
    const saved =
      await db.$transaction(
        async (tx) => {
          const updated =
            await tx.subCategory.update({
              where: {
                id: current.id,
              },
              data: {
                name,
                percentage: 0,
              },
            });

          if (
            current.name.trim() !== name
          ) {
            await tx.criterion.updateMany({
              where: {
                categoryId:
                  current.categoryId,
                OR: [
                  {
                    subCategoryId:
                      current.id,
                  },
                  {
                    section:
                      current.name,
                  },
                ],
              },
              data: {
                section: name,
                subCategoryId:
                  current.id,
              },
            });

            const category =
              await tx.category.findUnique({
                where: {
                  id:
                    current.categoryId,
                },
              });

            if (category) {
              await tx.masterMaterial.updateMany(
                {
                  where: {
                    category:
                      category.name,
                    section:
                      current.name,
                  },
                  data: {
                    section: name,
                  },
                }
              );
            }
          }

          return updated;
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Subkategori berhasil diperbarui.",
      subCategory: saved,
    });
  } catch (error) {
    console.error(
      "PATCH SUBCATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengubah subkategori.",
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
 * ============================================================
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const id = String(
      body.id || ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID subkategori wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const subCategory =
      await db.subCategory.findUnique({
        where: {
          id,
        },
        include: {
          criteria: true,
        },
      });

    if (!subCategory) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Subkategori tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Jangan hapus subkategori yang
     * masih mempunyai materi.
     */
    if (
      subCategory.criteria.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Subkategori "${subCategory.name}" masih memiliki ${subCategory.criteria.length} materi. Hapus materinya terlebih dahulu.`,
        },
        {
          status: 409,
        }
      );
    }

    await db.subCategory.delete({
      where: {
        id,
      },
    });

    /**
     * Rapikan sortOrder.
     */
    const remaining =
      await db.subCategory.findMany({
        where: {
          categoryId:
            subCategory.categoryId,
          status: "ACTIVE",
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

    await db.$transaction(
      remaining.map(
        (
          item,
          index
        ) =>
          db.subCategory.update({
            where: {
              id: item.id,
            },
            data: {
              sortOrder: index,
            },
          })
      )
    );

    return NextResponse.json({
      success: true,
      message:
        "Subkategori berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "DELETE SUBCATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus subkategori.",
      },
      {
        status: 500,
      }
    );
  }
}