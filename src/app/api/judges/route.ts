import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { db } from "@/lib/db";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    // ==========================================================
    // EVENT
    // ==========================================================

    const events = await db.event.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });

    const eventIds = events.map((event) => event.id);

    // ==========================================================
    // TINGKATAN
    //
    // Kita ambil terpisah supaya tidak bergantung pada nama
    // relation Prisma Event -> EventLevel.
    // ==========================================================

    const levels =
      eventIds.length > 0
        ? await db.eventLevel.findMany({
            where: {
              eventId: {
                in: eventIds,
              },
              status: "ACTIVE",
            },

            orderBy: [
              {
                eventId: "asc",
              },
              {
                sortOrder: "asc",
              },
            ],

            select: {
              id: true,
              eventId: true,
              code: true,
              name: true,
              sortOrder: true,
              status: true,
            },
          })
        : [];

    // ==========================================================
    // KATEGORI
    // ==========================================================

    const categories =
      eventIds.length > 0
        ? await db.category.findMany({
            where: {
              eventId: {
                in: eventIds,
              },
              status: "ACTIVE",
            },

            orderBy: [
              {
                eventId: "asc",
              },
              {
                sortOrder: "asc",
              },
            ],

            select: {
              id: true,
              eventId: true,
              eventLevelId: true,
              name: true,
              percentage: true,
              sortOrder: true,
              status: true,
            },
          })
        : [];

    // ==========================================================
    // SUSUN EVENT
    //
    // Event
    //   └── levels
    //        └── categories
    // ==========================================================

    const formattedEvents = events.map((event) => {
      const eventLevels = levels
        .filter((level) => level.eventId === event.id)
        .map((level) => ({
          id: level.id,
          eventId: level.eventId,
          code: level.code,
          name: level.name,
          sortOrder: level.sortOrder,
          status: level.status,

          categories: categories
            .filter(
              (category) =>
                category.eventId === event.id &&
                category.eventLevelId === level.id
            )
            .map((category) => ({
              id: category.id,
              eventId: category.eventId,
              eventLevelId: category.eventLevelId,
              name: category.name,
              percentage: category.percentage,
              sortOrder: category.sortOrder,
              status: category.status,
            })),
        }));

      // ========================================================
      // KATEGORI TANPA TINGKATAN
      //
      // Ini hanya fallback agar data lama tidak hilang.
      // ========================================================

      const categoriesWithoutLevel = categories
        .filter(
          (category) =>
            category.eventId === event.id &&
            !category.eventLevelId
        )
        .map((category) => ({
          id: category.id,
          eventId: category.eventId,
          eventLevelId: null,
          name: category.name,
          percentage: category.percentage,
          sortOrder: category.sortOrder,
          status: category.status,
        }));

      if (categoriesWithoutLevel.length > 0) {
        eventLevels.push({
          id: `__NO_LEVEL__${event.id}`,
          eventId: event.id,
          code: "NO_LEVEL",
          name: "Tanpa Tingkatan",
          sortOrder: 999999,
          status: "ACTIVE",

          categories: categoriesWithoutLevel,
        });
      }

      return {
        id: event.id,
        name: event.name,
        status: event.status,
        levels: eventLevels,
      };
    });

    // ==========================================================
    // JURI
    // ==========================================================

    const judges = await db.user.findMany({
      where: {
        role: "JUDGE",
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        categoryLinks: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                eventId: true,
                eventLevelId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      events: formattedEvents,
      judges,
    });
  } catch (error) {
    console.error("GET JUDGES ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data juri.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// ============================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const action = clean(body.action);

    // ==========================================================
    // TAMBAH JURI
    // ==========================================================

    if (action === "create") {
      const name = clean(body.name);
      const username = clean(body.username).toLowerCase();
      const pin = clean(body.pin);

      if (!name || !username || !pin) {
        return NextResponse.json(
          {
            error:
              "Nama, username, dan PIN wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      if (pin.length < 4) {
        return NextResponse.json(
          {
            error: "PIN minimal 4 angka.",
          },
          {
            status: 400,
          }
        );
      }

      if (!/^\d+$/.test(pin)) {
        return NextResponse.json(
          {
            error: "PIN hanya boleh berisi angka.",
          },
          {
            status: 400,
          }
        );
      }

      const existing = await db.user.findUnique({
        where: {
          username,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "Username sudah digunakan.",
          },
          {
            status: 409,
          }
        );
      }

      const judge = await db.user.create({
        data: {
          name,
          username,
          pinHash: pinHash(pin),
          role: "JUDGE",
          status: "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          judge,
        },
        {
          status: 201,
        }
      );
    }

    // ==========================================================
    // EDIT JURI
    // ==========================================================

    if (action === "update") {
      const id = clean(body.id);
      const name = clean(body.name);
      const username = clean(body.username).toLowerCase();
      const pin = clean(body.pin);
      const status =
        clean(body.status) || "ACTIVE";

      if (!id || !name || !username) {
        return NextResponse.json(
          {
            error:
              "ID, nama, dan username wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      const current = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (!current || current.role !== "JUDGE") {
        return NextResponse.json(
          {
            error: "Juri tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      const usernameOwner =
        await db.user.findUnique({
          where: {
            username,
          },
        });

      if (
        usernameOwner &&
        usernameOwner.id !== id
      ) {
        return NextResponse.json(
          {
            error:
              "Username sudah digunakan juri lain.",
          },
          {
            status: 409,
          }
        );
      }

      const data: {
        name: string;
        username: string;
        status: string;
        pinHash?: string;
      } = {
        name,
        username,
        status:
          status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
      };

      if (pin) {
        if (
          !/^\d+$/.test(pin) ||
          pin.length < 4
        ) {
          return NextResponse.json(
            {
              error:
                "PIN baru minimal 4 angka dan hanya boleh angka.",
            },
            {
              status: 400,
            }
          );
        }

        data.pinHash = pinHash(pin);
      }

      const judge = await db.user.update({
        where: {
          id,
        },

        data,

        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        judge,
      });
    }

    // ==========================================================
    // AKTIFKAN / NONAKTIFKAN
    // ==========================================================

    if (action === "toggle-status") {
      const id = clean(body.id);

      if (!id) {
        return NextResponse.json(
          {
            error: "ID juri wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      const judge = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          {
            error: "Juri tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      const updated = await db.user.update({
        where: {
          id,
        },

        data: {
          status:
            judge.status === "ACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        judge: updated,
      });
    }

    // ==========================================================
    // HAPUS JURI
    // ==========================================================

    if (action === "delete") {
      const id = clean(body.id);

      if (!id) {
        return NextResponse.json(
          {
            error: "ID juri wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      const judge = await db.user.findUnique({
        where: {
          id,
        },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          {
            error: "Juri tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      await db.user.update({
        where: {
          id,
        },

        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Juri "${judge.name}" dinonaktifkan.`,
      });
    }

    // ==========================================================
    // PENUGASAN JURI
    //
    // Frontend mengirim SEMUA categoryIds yang dipilih
    // dari seluruh tingkatan.
    //
    // Jadi pindah tingkatan di UI tidak menghilangkan
    // pilihan sebelumnya.
    // ==========================================================

    if (action === "assign") {
      const judgeId = clean(body.judgeId);
      const eventId = clean(body.eventId);

      const categoryIds = Array.isArray(
        body.categoryIds
      )
        ? body.categoryIds
            .map((id: unknown) =>
              clean(id)
            )
            .filter(Boolean)
        : [];

      if (!judgeId || !eventId) {
        return NextResponse.json(
          {
            error:
              "Juri dan event wajib dipilih.",
          },
          {
            status: 400,
          }
        );
      }

      const judge = await db.user.findUnique({
        where: {
          id: judgeId,
        },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          {
            error: "Juri tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      const event = await db.event.findUnique({
        where: {
          id: eventId,
        },

        select: {
          id: true,
          name: true,
        },
      });

      if (!event) {
        return NextResponse.json(
          {
            error: "Event tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      // ========================================================
      // VALIDASI KATEGORI
      // ========================================================

      const categories =
        categoryIds.length > 0
          ? await db.category.findMany({
              where: {
                id: {
                  in: categoryIds,
                },

                eventId,

                status: "ACTIVE",
              },

              select: {
                id: true,
                eventLevelId: true,
              },
            })
          : [];

      if (
        categories.length !==
        categoryIds.length
      ) {
        return NextResponse.json(
          {
            error:
              "Ada kategori yang tidak valid untuk event tersebut.",
          },
          {
            status: 400,
          }
        );
      }

      // ========================================================
      // SIMPAN
      //
      // Hanya assignment juri pada event ini yang diganti.
      // Assignment event lain tetap aman.
      // ========================================================

      await db.$transaction(
        async (tx) => {
          await tx.categoryJudge.deleteMany({
            where: {
              judgeId,

              category: {
                eventId,
              },
            },
          });

          if (categoryIds.length > 0) {
            await tx.categoryJudge.createMany({
              data: categoryIds.map(
                (categoryId: string) => ({
                  categoryId,
                  judgeId,
                })
              ),
            });
          }
        }
      );

      return NextResponse.json({
        success: true,

        message:
          "Penugasan juri berhasil disimpan.",

        totalCategories:
          categoryIds.length,
      });
    }

    return NextResponse.json(
      {
        error: "Aksi tidak dikenali.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "JUDGE ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memproses data juri.",
      },
      {
        status: 500,
      }
    );
  }
}