import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

/* =========================================================
   SESSION
========================================================= */

async function getSession(req: Request) {
  const cookieHeader =
    req.headers.get("cookie") || "";

  const match = cookieHeader.match(
    /(?:^|;\s*)cetas_session=([^;]+)/
  );

  const token = match?.[1];

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

/* =========================================================
   ACCESS
========================================================= */

async function requireOperator(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: "Belum login.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (
    session.role !== "OPERATOR" &&
    session.role !== "SUPER_ADMIN"
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Akses hanya untuk Tim Rekap / Operator.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

/* =========================================================
   GET
========================================================= */

export async function GET(req: Request) {
  try {
    const auth = await requireOperator(req);

    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(req.url);

    const eventId =
      url.searchParams.get("eventId") || "";

    const eventLevelId =
      url.searchParams.get("eventLevelId") || "";

    const judgeId =
      url.searchParams.get("judgeId") || "";

    const categoryId =
      url.searchParams.get("categoryId") || "";

    const participantId =
      url.searchParams.get("participantId") || "";

    /* =====================================================
       EVENT
    ===================================================== */

    const events = await db.event.findMany({
      where: {
        status: "ACTIVE",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        inputMode: true,
        date: true,
        location: true,
        status: true,
      },
    });

    if (!eventId) {
      return NextResponse.json({
        success: true,
        events,
        levels: [],
        judges: [],
        categories: [],
        participants: [],
        criteria: [],
        scores: [],
      });
    }

    const event = await db.event.findUnique({
      where: {
        id: eventId,
      },

      select: {
        id: true,
        name: true,
        inputMode: true,
        status: true,
      },
    });

    if (!event || event.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Event tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       TINGKATAN
    ===================================================== */

    const levels =
      await db.eventLevel.findMany({
        where: {
          eventId,
          status: "ACTIVE",
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
          code: true,
          name: true,
          sortOrder: true,
        },
      });

    if (!eventLevelId) {
      return NextResponse.json({
        success: true,
        events,
        event,
        levels,
        judges: [],
        categories: [],
        participants: [],
        criteria: [],
        scores: [],
      });
    }

    const level =
      await db.eventLevel.findFirst({
        where: {
          id: eventLevelId,
          eventId,
          status: "ACTIVE",
        },

        select: {
          id: true,
          code: true,
          name: true,
          sortOrder: true,
        },
      });

    if (!level) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tingkatan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
   KATEGORI
   Hanya kategori aktif pada event + tingkatan.
   
   Jika JURI sudah dipilih:
   hanya kategori yang ditugaskan kepada JURI tersebut.
===================================================== */

const categories =
  await db.category.findMany({
    where: {
      eventId,
      eventLevelId,
      status: "ACTIVE",

      ...(judgeId
        ? {
            judgeLinks: {
              some: {
                judgeId,
              },
            },
          }
        : {}),
    },

    orderBy: {
      sortOrder: "asc",
    },

    select: {
      id: true,
      name: true,
      percentage: true,
      sortOrder: true,
      eventLevelId: true,

      judgeLinks: {
        where: {
          judge: {
            status: "ACTIVE",
          },
        },

        select: {
          judgeId: true,
        },
      },
    },
  });

    /* =====================================================
       JURI

       Juri ditampilkan berdasarkan penugasan yang benar-benar ada
       pada kategori di tingkatan ini. LevelJudge boleh ada, tetapi
       CategoryJudge menjadi sumber utama agar rekap tetap membaca
       juri yang sudah dipasang pada kategori.
    ===================================================== */

    const categoryJudgeLinks =
      await db.categoryJudge.findMany({
        where: {
          category: {
            eventId,
            eventLevelId,
            status: "ACTIVE",
          },
          judge: {
            status: "ACTIVE",
          },
        },
        select: {
          judgeId: true,
          judge: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              status: true,
            },
          },
        },
      });

    const levelJudgeLinks =
      await db.levelJudge.findMany({
        where: {
          levelId: eventLevelId,
          judge: {
            status: "ACTIVE",
          },
        },
        select: {
          judgeId: true,
          judge: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              status: true,
            },
          },
        },
      });

    const judgeMap = new Map<
      string,
      (typeof categoryJudgeLinks)[number]["judge"]
    >();

    for (const item of levelJudgeLinks) {
      judgeMap.set(item.judgeId, item.judge);
    }

    for (const item of categoryJudgeLinks) {
      judgeMap.set(item.judgeId, item.judge);
    }

    const allowedJudgeIds = new Set(
      Array.from(judgeMap.keys())
    );

    let judges = Array.from(judgeMap.values());

    if (categoryId) {
      const selectedCategory = categories.find(
        (itemCategory) =>
          itemCategory.id === categoryId
      );

      if (selectedCategory) {
        const assignedToCategory = new Set(
          selectedCategory.judgeLinks.map(
            (link) => link.judgeId
          )
        );

        judges = judges.filter((judge) =>
          assignedToCategory.has(judge.id)
        );
      } else {
        judges = [];
      }
    }

    /* =====================================================
       PESERTA
       
       Peserta tidak bergantung pada categoryId.
       PBB / Komandan / Variasi menggunakan peserta
       dalam tingkatan yang sama.
    ===================================================== */

    const participants =
      await db.participant.findMany({
        where: {
          eventId,
          status: "ACTIVE",

          OR: [
            {
              eventLevelId,
            },
            {
              eventLevelId: null,
              level: level.name,
            },
            {
              eventLevelId: null,
              level: level.code,
            },
          ],
        },

        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            number: "asc",
          },
          {
            name: "asc",
          },
        ],

        select: {
          id: true,
          number: true,
          displayOrder: true,
          name: true,
          school: true,
          level: true,
          eventLevelId: true,
          categoryId: true,
        },
      });

    /* =====================================================
       BELUM PILIH JURI / KATEGORI
    ===================================================== */

    if (
      !judgeId ||
      !categoryId ||
      !participantId
    ) {
      return NextResponse.json({
        success: true,
        events,
        event,
        levels,
        level,
        judges,
        categories,
        participants,
        criteria: [],
        scores: [],
      });
    }

    /* =====================================================
       VALIDASI JURI
    ===================================================== */

    if (!allowedJudgeIds.has(judgeId)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Juri tersebut tidak ditugaskan pada tingkatan ini.",
        },
        {
          status: 403,
        }
      );
    }

    const category =
      await db.category.findFirst({
        where: {
          id: categoryId,
          eventId,
          eventLevelId,
          status: "ACTIVE",

          judgeLinks: {
            some: {
              judgeId,
            },
          },
        },

        select: {
          id: true,
          name: true,
          percentage: true,
          sortOrder: true,
          eventLevelId: true,

          subCategories: {
            where: {
              status: "ACTIVE",
            },

            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              name: true,
              percentage: true,
              sortOrder: true,

              criteria: {
                orderBy: {
                  sortOrder: "asc",
                },

                select: {
                  id: true,
                  name: true,
                  section: true,
                  interval: true,
                  sortOrder: true,
                  inputType: true,
                  difficulty: true,

                  options: {
                    orderBy: {
                      sortOrder: "asc",
                    },

                    select: {
                      id: true,
                      label: true,
                      score: true,
                      sortOrder: true,
                    },
                  },
                },
              },
            },
          },

          criteria: {
            where: {
              subCategoryId: null,
            },

            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              name: true,
              section: true,
              interval: true,
              sortOrder: true,
              inputType: true,
              difficulty: true,

              options: {
                orderBy: {
                  sortOrder: "asc",
                },

                select: {
                  id: true,
                  label: true,
                  score: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori tidak ditemukan atau juri tidak ditugaskan pada kategori tersebut.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       VALIDASI PESERTA
    ===================================================== */

    const participant =
      await db.participant.findFirst({
        where: {
          id: participantId,
          eventId,
          status: "ACTIVE",

          OR: [
            {
              eventLevelId,
            },
            {
              eventLevelId: null,
              level: level.name,
            },
            {
              eventLevelId: null,
              level: level.code,
            },
          ],
        },

        select: {
          id: true,
          number: true,
          displayOrder: true,
          name: true,
          school: true,
          level: true,
          eventLevelId: true,
          categoryId: true,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Peserta tidak termasuk dalam tingkatan yang dipilih.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       FLATTEN CRITERIA
    ===================================================== */

    const directCriteria =
      category.criteria || [];

    const subCriteria =
      category.subCategories.flatMap(
        (subCategory) =>
          subCategory.criteria || []
      );

    const criteria = [
      ...directCriteria,
      ...subCriteria,
    ].map((criterion) => ({
      ...criterion,

      options: (criterion.options || [])
        .filter(
          (option) =>
            Number(option.score) > 0
        )
        .sort(
          (a, b) =>
            Number(a.sortOrder) -
            Number(b.sortOrder)
        )
        .map((option) => ({
          id: option.id,
          label:
            String(
              option.label ??
                option.score
            ),
          score:
            Number(option.score),
          sortOrder:
            Number(
              option.sortOrder || 0
            ),
        })),
    }));

    /* =====================================================
       NILAI YANG SUDAH ADA
    ===================================================== */

    const scores =
      await db.score.findMany({
        where: {
          participantId,
          categoryId,
          judgeId,
        },

        select: {
          id: true,
          participantId: true,
          criterionId: true,
          categoryId: true,
          judgeId: true,
          score: true,
          label: true,
          note: true,
          status: true,
          submittedAt: true,
          lockedAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,

        events,

        event,

        levels,

        level,

        judges,

        categories: categories.map(
          (item) => ({
            id: item.id,
            name: item.name,
            percentage:
              item.percentage,
            sortOrder:
              item.sortOrder,
          })
        ),

        participants,

        category: {
          id: category.id,
          name: category.name,
          percentage:
            category.percentage,
        },

        participant,

        criteria,

        scores,
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
      "REKAP INPUT GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data rekap.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   Simpan satu peserta sekaligus.

   Tim Rekap memilih semua nilai berdasarkan kertas,
   kemudian SUBMIT.

   Status langsung SUBMITTED.
========================================================= */

export async function POST(req: Request) {
  try {
    const auth = await requireOperator(req);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json();

    const eventId =
      String(body.eventId || "").trim();

    const eventLevelId =
      String(
        body.eventLevelId || ""
      ).trim();

    const judgeId =
      String(body.judgeId || "").trim();

    const categoryId =
      String(
        body.categoryId || ""
      ).trim();

    const participantId =
      String(
        body.participantId || ""
      ).trim();

    const values =
      body.values;

    if (
      !eventId ||
      !eventLevelId ||
      !judgeId ||
      !categoryId ||
      !participantId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Event, tingkatan, juri, kategori, dan peserta wajib dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        inputMode: true,
        status: true,
      },
    });

    if (!event || event.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Event tidak ditemukan atau sudah tidak aktif.",
        },
        { status: 404 }
      );
    }

    if (event.inputMode !== "PAPER") {
      return NextResponse.json(
        {
          success: false,
          error: "Rekap lembar kertas hanya dapat digunakan untuk event dengan mode Kertas.",
        },
        { status: 409 }
      );
    }

    if (
      !Array.isArray(values) ||
      values.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Belum ada nilai yang dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       EVENT + LEVEL
    ===================================================== */

    const level =
      await db.eventLevel.findFirst({
        where: {
          id: eventLevelId,
          eventId,
          status: "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          code: true,
        },
      });

    if (!level) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tingkatan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       JURI / PENUGASAN

       Juri boleh ditugaskan langsung ke kategori.
       Untuk kompatibilitas, LevelJudge tetap diterima bila tersedia.
    ===================================================== */

    const levelAssignment =
      await db.levelJudge.findUnique({
        where: {
          levelId_judgeId: {
            levelId: eventLevelId,
            judgeId,
          },
        },
      });

    const categoryJudgeAssignment =
      await db.categoryJudge.findUnique({
        where: {
          categoryId_judgeId: {
            categoryId,
            judgeId,
          },
        },
      });

    if (!levelAssignment && !categoryJudgeAssignment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Juri tidak ditugaskan pada tingkatan/kategori ini.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       KATEGORI + PENUGASAN JURI
    ===================================================== */

    const category =
      await db.category.findFirst({
        where: {
          id: categoryId,
          eventId,
          eventLevelId,
          status: "ACTIVE",

          judgeLinks: {
            some: {
              judgeId,
            },
          },
        },

        select: {
          id: true,
          eventId: true,
          eventLevelId: true,
          status: true,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori tidak valid atau juri tidak ditugaskan.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       PESERTA
    ===================================================== */

    const participant =
      await db.participant.findFirst({
        where: {
          id: participantId,
          eventId,
          status: "ACTIVE",

          OR: [
            {
              eventLevelId,
            },
            {
              eventLevelId: null,
              level: level.name,
            },
            {
              eventLevelId: null,
              level: level.code,
            },
          ],
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Peserta tidak valid.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       CRITERIA VALID
    ===================================================== */

    const criteria =
      await db.criterion.findMany({
        where: {
          categoryId,
        },

        select: {
          id: true,

          options: {
            select: {
              id: true,
              label: true,
              score: true,
            },
          },
        },
      });

    const criterionMap =
      new Map(
        criteria.map(
          (criterion) => [
            criterion.id,
            criterion,
          ]
        )
      );

    /* =====================================================
       VALIDASI SEMUA NILAI
    ===================================================== */

    const cleanedValues: {
      criterionId: string;
      score: number;
      label: string | null;
    }[] = [];

    for (const item of values) {
      const criterionId =
        String(
          item?.criterionId || ""
        ).trim();

      const score =
        Number(item?.score);

      if (!criterionId) {
        continue;
      }

      if (
        !Number.isFinite(score) ||
        score < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ada nilai yang tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      const criterion =
        criterionMap.get(
          criterionId
        );

      if (!criterion) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ada materi penilaian yang tidak termasuk kategori.",
          },
          {
            status: 403,
          }
        );
      }

      const validOption =
        criterion.options.find(
          (option) =>
            Number(option.score) ===
            score
        );

      if (!validOption) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Nilai ${score} tidak tersedia untuk materi tersebut.`,
          },
          {
            status: 400,
          }
        );
      }

      cleanedValues.push({
        criterionId,
        score,
        label:
          item?.label !== undefined &&
          item?.label !== null
            ? String(item.label)
            : String(
                validOption.label ??
                  score
              ),
      });
    }

    if (
      cleanedValues.length !==
      criteria.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Semua materi penilaian harus diisi sebelum Submit.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CEK LOCKED
    ===================================================== */

    const existing =
      await db.score.findMany({
        where: {
          participantId,
          categoryId,
          judgeId,
        },

        select: {
          criterionId: true,
          status: true,
        },
      });

    const hasLocked =
      existing.some(
        (item) =>
          item.status === "LOCKED"
      );

    if (hasLocked) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nilai peserta ini sudah LOCKED dan tidak dapat diubah melalui Tim Rekap.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       TRANSACTION
    ===================================================== */

    await db.$transaction(
      cleanedValues.map(
        (item) =>
          db.score.upsert({
            where: {
              participantId_criterionId_judgeId:
                {
                  participantId,
                  criterionId:
                    item.criterionId,
                  judgeId,
                },
            },

            update: {
              categoryId,
              score: item.score,
              label: item.label,
              status: "SUBMITTED",
              submittedAt:
                new Date(),
            },

            create: {
              participantId,
              criterionId:
                item.criterionId,
              categoryId,
              judgeId,
              score: item.score,
              label: item.label,
              status: "SUBMITTED",
              submittedAt:
                new Date(),
            },
          })
      )
    );

    return NextResponse.json({
      success: true,
      message:
        "Penilaian berhasil direkap dan disubmit.",
      participantId,
      judgeId,
      categoryId,
      savedCount:
        cleanedValues.length,
    });
  } catch (error) {
    console.error(
      "REKAP INPUT POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan nilai rekap.",
      },
      {
        status: 500,
      }
    );
  }
}