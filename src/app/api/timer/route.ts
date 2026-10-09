import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import {
  verifySessionToken,
} from "@/lib/auth";

// =========================================================
// SESSION
// =========================================================

async function getSession(
  req: Request
) {
  const cookie =
    req.headers.get("cookie") || "";

  const match = cookie.match(
    /(?:^|;\s*)cetas_session=([^;]+)/
  );

  const token =
    match?.[1];

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(
      decodeURIComponent(token)
    );
  } catch {
    return null;
  }
}

// =========================================================
// ROLE
// =========================================================

function allowed(
  role: string
) {
  return [
    "TIMER",
    "OPERATOR",
    "SUPER_ADMIN",
  ].includes(role);
}

function managementAllowed(
  role: string
) {
  return [
    "OPERATOR",
    "SUPER_ADMIN",
  ].includes(role);
}

// =========================================================
// HELPER
// =========================================================

function cleanString(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (
          item: unknown
        ): item is string =>
          typeof item ===
            "string" &&
          item.trim()
            .length > 0
      ).map(
        (item) =>
          item.trim()
      )
    )
  );
}

// =========================================================
// CANONICAL CATEGORY KEY
//
// Penting:
// PBB + KOMANDAN
//
// sama dengan:
//
// KOMANDAN + PBB
//
// Karena ID di-sort terlebih dahulu.
// =========================================================

function makeCategoryRunKey(
  categoryIds: string[],
  participantId: string
) {
  const sorted =
    [...categoryIds].sort();

  return `CATEGORY:${sorted.join(",")}:${participantId}`;
}

// =========================================================
// GET TIMER DATA
// =========================================================

export async function GET(
  req: Request
) {
  try {
    const session =
      await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Belum login.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      !allowed(
        session.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Akses Timer ditolak.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // EVENT AKTIF
    // =====================================================

    const event =
      await db.event.findFirst({
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          id: true,
          name: true,
          logo: true,
          location: true,
          date: true,
        },
      });

    if (!event) {
      return NextResponse.json(
        {
          error:
            "Event aktif belum tersedia.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // DATA
    // =====================================================

    const [
      participants,
      categories,
      levels,
      groups,
      records,
    ] =
      await Promise.all([
        // =================================================
        // PESERTA
        // =================================================

        db.participant.findMany({
          where: {
            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          orderBy: [
            {
              displayOrder:
                "asc",
            },

            {
              number:
                "asc",
            },

            {
              name:
                "asc",
            },
          ],

          select: {
            id: true,
            number: true,
            displayOrder:
              true,
            name: true,
            school: true,
            level: true,
            photo: true,
            logo: true,

            eventLevel: {
              select: {
                id: true,
                code: true,
                name: true,
                sortOrder:
                  true,
              },
            },
          },
        }),

        // =================================================
        // KATEGORI
        // =================================================

        db.category.findMany({
          where: {
            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            id: true,
            name: true,
            sortOrder:
              true,
            eventLevelId:
              true,

            eventLevel: {
              select: {
                id: true,
                code: true,
                name: true,
                sortOrder:
                  true,
              },
            },
          },
        }),

        // =================================================
        // TINGKATAN
        // =================================================

        db.eventLevel.findMany({
          where: {
            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            id: true,
            code: true,
            name: true,
            sortOrder:
              true,
          },
        }),

        // =================================================
        // GROUP
        //
        // Dipertahankan untuk:
        // - group lama
        // - history
        // - gabungan otomatis
        // =================================================

        db.timerGroup.findMany({
          where: {
            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            id: true,
            name: true,
            sortOrder:
              true,

            categories: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                categoryId:
                  true,
                sortOrder:
                  true,

                category: {
                  select: {
                    id: true,
                    name: true,
                    sortOrder:
                      true,
                    eventLevelId:
                      true,

                    eventLevel: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                        sortOrder:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        // =================================================
        // RECORD TIMER
        // =================================================

        db.timerRecord.findMany({
          where: {
            eventId:
              event.id,
          },

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
            participantId:
              true,
            timerGroupId:
              true,
            mode: true,
            runKey: true,
            startedAt:
              true,
            stoppedAt:
              true,
            durationSec:
              true,
            status:
              true,
          },
        }),
      ]);

    return NextResponse.json(
      {
        success: true,

        role:
          session.role,

        event,

        levels,

        participants,

        categories,

        groups,

        records,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET TIMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data Timer.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// POST TIMER
// =========================================================

export async function POST(
  req: Request
) {
  try {
    const session =
      await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Belum login.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      !allowed(
        session.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Akses Timer ditolak.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await req.json();

    const action =
      cleanString(
        body.action
      );

    const participantId =
      cleanString(
        body.participantId
      );

    /*
     * FORMAT BARU
     *
     * categoryIds:
     * [
     *   "id-pbb",
     *   "id-komandan"
     * ]
     */
    const categoryIds =
      cleanStringArray(
        body.categoryIds
      );

    /*
     * BACKWARD COMPATIBILITY
     *
     * Tetap menerima categoryId /
     * timerGroupId kalau ada data lama.
     */

    const oldTimerGroupId =
      cleanString(
        body.timerGroupId
      ) || null;

    const oldCategoryId =
      cleanString(
        body.categoryId
      ) || null;

    // =====================================================
    // EVENT
    // =====================================================

    const event =
      await db.event.findFirst({
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          id: true,
        },
      });

    if (!event) {
      return NextResponse.json(
        {
          error:
            "Event aktif belum tersedia.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CREATE GROUP LAMA
    //
    // Dipertahankan supaya API lama tidak rusak.
    // Frontend baru tidak memakai fitur ini.
    // =====================================================

    if (
      action ===
      "CREATE_GROUP"
    ) {
      if (
        !managementAllowed(
          session.role
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Hanya Operator/Super Admin yang dapat mengatur gabungan kategori.",
          },
          {
            status: 403,
          }
        );
      }

      const name =
        cleanString(
          body.name
        );

      const createCategoryIds =
        cleanStringArray(
          body.categoryIds
        );

      if (!name) {
        return NextResponse.json(
          {
            error:
              "Nama gabungan wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        createCategoryIds.length ===
        0
      ) {
        return NextResponse.json(
          {
            error:
              "Pilih minimal satu kategori.",
          },
          {
            status: 400,
          }
        );
      }

      const categories =
        await db.category.findMany({
          where: {
            id: {
              in:
                createCategoryIds,
            },

            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          select: {
            id: true,
            sortOrder:
              true,
          },
        });

      if (
        categories.length !==
        createCategoryIds.length
      ) {
        return NextResponse.json(
          {
            error:
              "Ada kategori yang tidak tersedia pada event aktif.",
          },
          {
            status: 400,
          }
        );
      }

      const maxSort =
        await db.timerGroup.findFirst({
          where: {
            eventId:
              event.id,
          },

          orderBy: {
            sortOrder:
              "desc",
          },

          select: {
            sortOrder:
              true,
          },
        });

      const group =
        await db.timerGroup.create({
          data: {
            eventId:
              event.id,

            name,

            sortOrder:
              (maxSort?.sortOrder ??
                -1) + 1,

            categories: {
              create:
                [...categories]
                  .sort(
                    (a, b) =>
                      a.sortOrder -
                      b.sortOrder
                  )
                  .map(
                    (
                      category,
                      index
                    ) => ({
                      categoryId:
                        category.id,

                      sortOrder:
                        index,
                    })
                  ),
            },
          },

          include: {
            categories: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                categoryId:
                  true,
                sortOrder:
                  true,

                category: {
                  select: {
                    id: true,
                    name: true,
                    sortOrder:
                      true,
                    eventLevelId:
                      true,

                    eventLevel: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                        sortOrder:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      return NextResponse.json(
        {
          success: true,
          group,
        },
        {
          status: 201,
        }
      );
    }

    // =====================================================
    // DELETE GROUP
    //
    // Tetap dipertahankan.
    // =====================================================

    if (
      action ===
      "DELETE_GROUP"
    ) {
      if (
        !managementAllowed(
          session.role
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Hanya Operator/Super Admin yang dapat menghapus gabungan kategori.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        !oldTimerGroupId
      ) {
        return NextResponse.json(
          {
            error:
              "Grup kategori wajib dipilih.",
          },
          {
            status: 400,
          }
        );
      }

      const group =
        await db.timerGroup.findFirst({
          where: {
            id:
              oldTimerGroupId,

            eventId:
              event.id,
          },

          select: {
            id: true,
          },
        });

      if (!group) {
        return NextResponse.json(
          {
            error:
              "Grup kategori tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      await db.timerGroup.delete({
        where: {
          id:
            oldTimerGroupId,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================================
    // PESERTA WAJIB
    // =====================================================

    if (!participantId) {
      return NextResponse.json(
        {
          error:
            "Peserta wajib dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI PESERTA
    // =====================================================

    const participant =
      await db.participant.findFirst({
        where: {
          id:
            participantId,

          eventId:
            event.id,

          status:
            "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          level: true,
          eventLevelId:
            true,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          error:
            "Peserta tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // RESOLVE CATEGORY IDS
    // =====================================================

    let resolvedCategoryIds =
      [...categoryIds];

    /*
     * Backward compatibility:
     *
     * kalau frontend lama masih kirim categoryId,
     * masukkan ke array.
     */

    if (
      resolvedCategoryIds.length ===
        0 &&
      oldCategoryId
    ) {
      resolvedCategoryIds = [
        oldCategoryId,
      ];
    }

    // =====================================================
    // TIMER PARTICIPANT
    // =====================================================

    if (
      action ===
        "START" &&
      resolvedCategoryIds.length ===
        0 &&
      !oldTimerGroupId
    ) {
      const runKey =
        `PARTICIPANT:${participantId}`;

      const existing =
        await db.timerRecord.findUnique({
          where: {
            runKey,
          },
        });

      if (
        existing?.status ===
        "RUNNING"
      ) {
        return NextResponse.json({
          success: true,
          record: existing,
        });
      }

      const record =
        await db.timerRecord.upsert({
          where: {
            runKey,
          },

          create: {
            eventId:
              event.id,

            participantId,

            timerGroupId:
              null,

            mode:
              "PARTICIPANT",

            runKey,

            startedAt:
              new Date(),

            stoppedAt:
              null,

            durationSec:
              null,

            status:
              "RUNNING",
          },

          update: {
            startedAt:
              new Date(),

            stoppedAt:
              null,

            durationSec:
              null,

            status:
              "RUNNING",
          },
        });

      return NextResponse.json({
        success: true,
        record,
      });
    }

    // =====================================================
    // STOP / RESET TIMER PESERTA MANUAL
    // =====================================================
    //
    // Timer sekarang boleh dipakai manual tanpa kategori.
    // Jika frontend mengirim STOP/RESET tanpa categoryIds,
    // langsung proses record RUNNING peserta tersebut.
    // Jangan jatuh ke validasi "Pilih minimal satu kategori".
    //

    if (
      (action === "STOP" || action === "RESET") &&
      resolvedCategoryIds.length === 0 &&
      !oldTimerGroupId
    ) {
      let existing =
        await db.timerRecord.findFirst({
          where: {
            eventId: event.id,
            participantId,
            status: "RUNNING",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (!existing) {
        existing =
          await db.timerRecord.findUnique({
            where: {
              runKey: `PARTICIPANT:${participantId}`,
            },
          });
      }

      if (!existing) {
        return NextResponse.json(
          {
            error: "Timer belum dimulai.",
          },
          {
            status: 400,
          }
        );
      }

      if (action === "RESET") {
        const record =
          await db.timerRecord.update({
            where: {
              id: existing.id,
            },
            data: {
              startedAt: null,
              stoppedAt: null,
              durationSec: null,
              status: "READY",
            },
          });

        return NextResponse.json({
          success: true,
          record,
        });
      }

      if (!existing.startedAt) {
        return NextResponse.json(
          {
            error: "Timer belum dimulai.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        existing.status === "STOPPED" &&
        existing.durationSec !== null
      ) {
        return NextResponse.json({
          success: true,
          record: existing,
        });
      }

      const stoppedAt = new Date();

      const durationSec = Math.max(
        0,
        Math.floor(
          (stoppedAt.getTime() -
            existing.startedAt.getTime()) /
            1000
        )
      );

      const record =
        await db.timerRecord.update({
          where: {
            id: existing.id,
          },
          data: {
            stoppedAt,
            durationSec,
            status: "STOPPED",
          },
        });

      return NextResponse.json({
        success: true,
        record,
      });
    }

    // =====================================================
    // TIMER CATEGORY
    // =====================================================

    /*
     * Kalau pakai timer kategori,
     * harus ada kategori.
     *
     * Untuk group lama, kita ambil
     * kategori dari TimerGroup.
     */

    if (
      oldTimerGroupId &&
      resolvedCategoryIds.length ===
        0
    ) {
      const oldGroup =
        await db.timerGroup.findFirst({
          where: {
            id:
              oldTimerGroupId,

            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          select: {
            categories: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                categoryId:
                  true,
              },
            },
          },
        });

      if (oldGroup) {
        resolvedCategoryIds =
          oldGroup.categories.map(
            (item) =>
              item.categoryId
          );
      }
    }

    if (
      resolvedCategoryIds.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "Pilih minimal satu kategori untuk timer kategori.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDATE CATEGORIES
    // =====================================================

    const selectedCategories =
      await db.category.findMany({
        where: {
          id: {
            in:
              resolvedCategoryIds,
          },

          eventId:
            event.id,

          status:
            "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          sortOrder:
            true,
          eventLevelId:
            true,
        },
      });

    if (
      selectedCategories.length !==
      resolvedCategoryIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "Ada kategori yang tidak ditemukan pada event aktif.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI TINGKATAN
    // =====================================================

    for (
      const category of
        selectedCategories
    ) {
      if (
        category.eventLevelId &&
        participant.eventLevelId &&
        category.eventLevelId !==
          participant.eventLevelId
      ) {
        return NextResponse.json(
          {
            error:
              `Kategori "${category.name}" tidak sesuai dengan tingkatan peserta.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // SORT CATEGORY
    // =====================================================

    selectedCategories.sort(
      (a, b) =>
        a.sortOrder -
        b.sortOrder
    );

    resolvedCategoryIds =
      selectedCategories.map(
        (category) =>
          category.id
      );

    // =====================================================
    // RUN KEY
    // =====================================================

    const runKey =
      makeCategoryRunKey(
        resolvedCategoryIds,
        participantId
      );

    // =====================================================
    // RESOLVE TIMER GROUP
    //
    // Kalau:
    //
    // PBB
    //
    // tidak perlu group.
    //
    // Kalau:
    //
    // PBB + KOMANDAN
    //
    // otomatis cari / buat group.
    // =====================================================

    let resolvedTimerGroupId:
      | string
      | null =
      null;

    if (
      resolvedCategoryIds.length >
      1
    ) {
      // ===================================================
      // CARI GROUP YANG PERSIS SAMA
      // ===================================================

      const existingGroups =
        await db.timerGroup.findMany({
          where: {
            eventId:
              event.id,

            status:
              "ACTIVE",
          },

          include: {
            categories: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                categoryId:
                  true,
              },
            },
          },
        });

      const wanted =
        [
          ...resolvedCategoryIds,
        ].sort();

      const matchingGroup =
        existingGroups.find(
          (group) => {
            const ids =
              group.categories
                .map(
                  (item) =>
                    item.categoryId
                )
                .sort();

            return (
              ids.length ===
                wanted.length &&
              ids.every(
                (
                  id,
                  index
                ) =>
                  id ===
                  wanted[
                    index
                  ]
              )
            );
          }
        );

      if (
        matchingGroup
      ) {
        resolvedTimerGroupId =
          matchingGroup.id;
      } else {
        // ===============================================
        // BUAT GROUP OTOMATIS
        // ===============================================

        const maxSort =
          await db.timerGroup.findFirst(
            {
              where: {
                eventId:
                  event.id,
              },

              orderBy: {
                sortOrder:
                  "desc",
              },

              select: {
                sortOrder:
                  true,
              },
            }
          );

        const groupName =
          selectedCategories
            .map(
              (category) =>
                category.name
            )
            .join(" + ");

        const createdGroup =
          await db.timerGroup.create(
            {
              data: {
                eventId:
                  event.id,

                name:
                  groupName,

                sortOrder:
                  (maxSort?.sortOrder ??
                    -1) + 1,

                categories: {
                  create:
                    selectedCategories.map(
                      (
                        category,
                        index
                      ) => ({
                        categoryId:
                          category.id,

                        sortOrder:
                          index,
                      })
                    ),
                },
              },

              select: {
                id: true,
              },
            }
          );

        resolvedTimerGroupId =
          createdGroup.id;
      }
    }

    // =====================================================
    // START
    // =====================================================

    if (
      action ===
      "START"
    ) {
      const existing =
        await db.timerRecord.findUnique({
          where: {
            runKey,
          },
        });

      if (
        existing?.status ===
        "RUNNING"
      ) {
        return NextResponse.json({
          success: true,
          record: existing,
        });
      }

      const record =
        await db.timerRecord.upsert({
          where: {
            runKey,
          },

          create: {
            eventId:
              event.id,

            participantId,

            timerGroupId:
              resolvedTimerGroupId,

            mode:
              "CATEGORY",

            runKey,

            startedAt:
              new Date(),

            stoppedAt:
              null,

            durationSec:
              null,

            status:
              "RUNNING",
          },

          update: {
            timerGroupId:
              resolvedTimerGroupId,

            mode:
              "CATEGORY",

            startedAt:
              new Date(),

            stoppedAt:
              null,

            durationSec:
              null,

            status:
              "RUNNING",
          },
        });

      return NextResponse.json({
        success: true,
        record,
      });
    }

    // =====================================================
    // STOP / RESET
    // =====================================================

    if (
      action ===
        "STOP" ||
      action ===
        "RESET"
    ) {
      /*
       * ===================================================
       * CARI RECORD TIMER
       * ===================================================
       *
       * Prioritas:
       * 1. runKey yang sedang dikirim frontend.
       * 2. Jika tidak ketemu, cari timer RUNNING terakhir
       *    milik peserta yang sama.
       *
       * Fallback #2 penting karena UI dapat berubah pilihan
       * kategori/group setelah START. STOP tetap harus
       * menghentikan timer yang benar-benar sedang berjalan.
       */
      let existing =
        await db.timerRecord.findUnique({
          where: {
            runKey,
          },
        });

      if (!existing) {
        existing =
          await db.timerRecord.findFirst({
            where: {
              eventId:
                event.id,

              participantId,

              status:
                "RUNNING",
            },

            orderBy: {
              createdAt:
                "desc",
            },
          });
      }

      if (!existing) {
        return NextResponse.json(
          {
            error:
              "Timer belum dimulai.",
          },
          {
            status: 400,
          }
        );
      }

      // ===================================================
      // RESET
      // ===================================================

      if (
        action ===
        "RESET"
      ) {
        const record =
          await db.timerRecord.update(
            {
              where: {
                id:
                  existing.id,
              },

              data: {
                startedAt:
                  null,

                stoppedAt:
                  null,

                durationSec:
                  null,

                status:
                  "READY",
              },
            }
          );

        return NextResponse.json({
          success: true,
          record,
        });
      }

      // ===================================================
      // STOP
      // ===================================================

      if (
        !existing.startedAt
      ) {
        return NextResponse.json(
          {
            error:
              "Timer belum dimulai.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        existing.status ===
          "STOPPED" &&
        existing.durationSec !==
          null
      ) {
        return NextResponse.json({
          success: true,
          record: existing,
        });
      }

      // ===================================================
      // SERVER TIME
      // ===================================================

      const stoppedAt =
        new Date();

      const durationSec =
        Math.max(
          0,
          Math.floor(
            (
              stoppedAt.getTime() -
              existing.startedAt.getTime()
            ) /
              1000
          )
        );

      const record =
        await db.timerRecord.update(
          {
            where: {
              id:
                existing.id,
            },

            data: {
              stoppedAt,

              durationSec,

              status:
                "STOPPED",
            },
          }
        );

      return NextResponse.json({
        success: true,
        record,
      });
    }

    // =====================================================
    // UNKNOWN ACTION
    // =====================================================

    return NextResponse.json(
      {
        error:
          "Action Timer tidak dikenal.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "POST TIMER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan Timer.",
      },
      {
        status: 500,
      }
    );
  }
}