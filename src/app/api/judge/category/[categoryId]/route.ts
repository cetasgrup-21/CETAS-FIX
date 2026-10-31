import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { regenerateCategoryScoreOptions } from "@/lib/scoring-server";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};


/*
 * =========================================================
 * CETAS SCORE ENGINE - JUDGE
 * =========================================================
 * ScoreOption adalah nilai yang dipilih OLEH SATU JURI.
 * Setiap juri menilai secara independen.
 * Jumlah juri tidak membagi nilai pilihan.
 */

const VALID_INTERVALS = [2, 3, 4, 5, 6] as const;
type ValidInterval = (typeof VALID_INTERVALS)[number];

function normalizeInterval(value: unknown): ValidInterval {
  const n = Number(value);
  return VALID_INTERVALS.includes(n as ValidInterval)
    ? (n as ValidInterval)
    : 2;
}

async function getSession(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";

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

/*
 * =========================================================
 * GET
 * =========================================================
 */

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Belum login.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      session.role !== "JUDGE" &&
      session.role !== "OPERATOR" &&
      session.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses hanya untuk juri.",
        },
        {
          status: 403,
        }
      );
    }

    const { categoryId } =
      await context.params;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * =====================================================
     * USER
     * =====================================================
     */

    const user = await db.user.findUnique({
      where: {
        id: session.userId,
      },

      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akun tidak aktif atau tidak ditemukan.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * =====================================================
     * EVENT AKTIF
     * =====================================================
     */

    const event =
      await db.event.findFirst({
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          logo: true,
          banner: true,
          totalPoints: true,
        },
      });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Event aktif belum tersedia.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =====================================================
     * CEK PENUGASAN JURI
     * =====================================================
     */

    const assignment =
      await db.categoryJudge.findUnique({
        where: {
          categoryId_judgeId: {
            categoryId,
            judgeId: user.id,
          },
        },

        include: {
          category: {
            select: {
              id: true,
              eventId: true,
              name: true,
              percentage: true,
              sortOrder: true,
              status: true,
              eventLevelId: true,

              event: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  totalPoints: true,
                },
              },

              eventLevel: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  sortOrder: true,
                },
              },

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
          },
        },
      });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Anda tidak ditugaskan pada kategori ini.",
        },
        {
          status: 403,
        }
      );
    }

    const category =
      assignment.category;

    if (
      category.status !== "ACTIVE" ||
      category.eventId !== event.id ||
      category.event.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori ini tidak tersedia pada event aktif.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =====================================================
     * URUTAN KATEGORI PENILAIAN
     * =====================================================
     *
     * Alur Juri: semua materi kategori saat ini -> kategori
     * berikutnya -> setelah kategori terakhir, kembali ke
     * kategori pertama untuk peserta berikutnya.
     */
    const assignedCategories =
      await db.categoryJudge.findMany({
        where: {
          judgeId: user.id,
          category: {
            eventId: event.id,
            status: "ACTIVE",
            eventLevelId: category.eventLevelId,
          },
        },
        select: {
          category: {
            select: {
              id: true,
              sortOrder: true,
            },
          },
        },
      });

    const orderedCategoryIds =
      assignedCategories
        .map((item) => item.category)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const currentCategoryPosition =
      orderedCategoryIds.findIndex(
        (item) => item.id === category.id
      );

    const nextCategoryId =
      currentCategoryPosition >= 0 &&
      currentCategoryPosition < orderedCategoryIds.length - 1
        ? orderedCategoryIds[currentCategoryPosition + 1].id
        : null;

    const firstCategoryId =
      orderedCategoryIds[0]?.id || category.id;


    const judgeCount =
      await db.categoryJudge.count({
        where: {
          categoryId: category.id,

          judge: {
            status: "ACTIVE",
          },
        },
      });

    const safeJudgeCount =
      Math.max(1, judgeCount);

    /*
     * =====================================================
     * ALOKASI NILAI
     * =====================================================
     */

    const categoryMaxScore = Math.floor(
      event.totalPoints *
      (category.percentage / 100)
    );

    // ScoreOption di database sudah merupakan nilai UNTUK SATU JURI.
    // Karena itu maksimum kategori juga harus dibagi jumlah juri.
    const maxScorePerJudge = Math.floor(
      categoryMaxScore / safeJudgeCount
    );

    /*
     * =====================================================
     * PESERTA
     * =====================================================
     *
     * PENTING:
     *
     * Peserta TIDAK difilter berdasarkan categoryId.
     *
     * Peserta digunakan bersama oleh kategori dalam
     * tingkatan yang sama.
     */

    const participantWhere: {
      eventId: string;
      status: string;
      level?: string;
    } = {
      eventId: event.id,
      status: "ACTIVE",
    };

    /*
     * =====================================================
     * FILTER TINGKATAN
     * =====================================================
     */

    if (category.eventLevel) {
      const levelName =
        category.eventLevel.name?.trim();

      const levelCode =
        category.eventLevel.code?.trim();

      if (levelName) {
        participantWhere.level =
          levelName;
      } else if (levelCode) {
        participantWhere.level =
          levelCode;
      }
    }

    const participants =
      await db.participant.findMany({
        where: participantWhere,

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
          eventId: true,
          categoryId: true,
          number: true,
          displayOrder: true,
          name: true,
          school: true,
          level: true,
          photo: true,
          logo: true,
          status: true,
        },
      });

    /*
     * =====================================================
     * OPTIONS JURI â€” SUMBER KEBENARAN
     * =====================================================
     *
     * ScoreOption yang tersimpan di Criterion adalah pilihan nilai
     * untuk SATU JURI. Dua juri boleh memilih angka yang berbeda.
     *
     * Contoh 2 juri:
     *   Juri 1 -> 61
     *   Juri 2 -> 55
     *   Hasil gabungan/Review -> dihitung dari 61 dan 55
     *
     * Jangan membagi option dengan judgeCount.
     */

    const toJudgeCriterion = (criterion: any) => {
      const masterOptions = Array.isArray(criterion.options)
        ? [...criterion.options]
        : [];

      return {
        ...criterion,
        interval: normalizeInterval(criterion.interval),
        options: masterOptions
          .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
          .map((option) => ({
            id: option.id,
            label: String(option.label ?? option.score),
            score: Number(option.score),
            sortOrder: Number(option.sortOrder ?? 0),
          })),
      };
    };

    const judgeSubCategories = (category.subCategories || []).map(
      (subCategory) => ({
        ...subCategory,
        criteria: (subCategory.criteria || []).map(toJudgeCriterion),
      })
    );

    const judgeCriteria = (category.criteria || []).map(
      toJudgeCriterion
    );

    const scores =
      await db.score.findMany({
        where: {
          judgeId: user.id,
          categoryId: category.id,

          participant: {
            eventId: event.id,
          },
        },

        select: {
          id: true,
          participantId: true,
          criterionId: true,
          categoryId: true,
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

        user,

        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          logo: event.logo,
          banner: event.banner,
          totalPoints: event.totalPoints,
        },

        category: {
          id: category.id,
          name: category.name,
          eventId: category.eventId,
          eventLevelId:
            category.eventLevelId,
          percentage: category.percentage,
          sortOrder: category.sortOrder,
          eventLevel:
            category.eventLevel,
        },

        judgeCount:
          safeJudgeCount,

        categoryMaxScore,

        maxScorePerJudge,

        nextCategoryId,
        firstCategoryId,

        subCategories:
          judgeSubCategories,

        criteria:
          judgeCriteria,

        participants,

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
      "GET JUDGE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data penilaian.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =========================================================
 * POST
 * =========================================================
 */

export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const session =
      await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          error: "Belum login.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      session.role !== "JUDGE" &&
      session.role !== "OPERATOR" &&
      session.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Akses hanya untuk juri.",
        },
        {
          status: 403,
        }
      );
    }

    const { categoryId } =
      await context.params;

    const body = await req.json();

    const action = String(body.action || "SAVE").trim().toUpperCase();

    const participantId =
      String(
        body.participantId || ""
      ).trim();

    const criterionId =
      String(
        body.criterionId || ""
      ).trim();

    const score =
      Number(body.score);

    const label =
      body.label !== undefined &&
      body.label !== null
        ? String(body.label)
        : null;

    const note =
      body.note !== undefined &&
      body.note !== null
        ? String(body.note)
        : null;

    if (!categoryId || !participantId) {
      return NextResponse.json(
        {
          error: "Kategori dan peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // SUBMIT tidak membutuhkan criterionId maupun score.
    // SAVE tetap wajib membawa keduanya.
    if (action !== "SUBMIT" && action !== "REQUEST_CHANGE" && !criterionId) {
      return NextResponse.json(
        {
          error: "Materi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action !== "SUBMIT" &&
      action !== "REQUEST_CHANGE" &&
      (!Number.isFinite(score) || score < 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Nilai tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * USER
     * =====================================================
     */

    // Optimasi Parallel: Ambil user, event aktif, dan assignment juri dalam 1 roundtrip
    const [user, event, assignment] = await Promise.all([
      db.user.findUnique({
        where: {
          id: session.userId,
        },
        select: {
          id: true,
          status: true,
          role: true,
        },
      }),
      db.event.findFirst({
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          totalPoints: true,
        },
      }),
      db.categoryJudge.findUnique({
        where: {
          categoryId_judgeId: {
            categoryId,
            judgeId: session.userId,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              eventId: true,
              percentage: true,
              status: true,
              eventLevelId: true,
              eventLevel: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun tidak aktif." },
        { status: 401 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event aktif tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            "Anda tidak ditugaskan pada kategori ini.",
        },
        {
          status: 403,
        }
      );
    }

    const category =
      assignment.category;

    if (
      category.eventId !== event.id ||
      category.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          error:
            "Kategori tidak tersedia pada event aktif.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =====================================================
     * CEK PESERTA
     * =====================================================
     *
     * JANGAN gunakan:
     *
     * categoryId: category.id
     *
     * karena PBB dan KOMANDAN menggunakan peserta
     * yang sama.
     *
     * Yang dicek:
     *
     * 1. Peserta ada
     * 2. Milik event yang sama
     * 3. ACTIVE
     * 4. Tingkatannya sama dengan kategori
     */

    const participant =
      await db.participant.findFirst({
        where: {
          id: participantId,
          eventId: event.id,
          status: "ACTIVE",

          ...(category.eventLevel
            ? {
                level:
                  category.eventLevel.name,
              }
            : {}),
        },

        select: {
          id: true,
          eventId: true,
          categoryId: true,
          level: true,
          name: true,
        },
      });

    /*
     * Jika nama level tidak cocok dengan data lama,
     * coba menggunakan code level.
     */

    let resolvedParticipant =
      participant;

    if (
      !resolvedParticipant &&
      category.eventLevel?.code
    ) {
      resolvedParticipant =
        await db.participant.findFirst({
          where: {
            id: participantId,
            eventId: event.id,
            status: "ACTIVE",
            level:
              category.eventLevel.code,
          },

          select: {
            id: true,
            eventId: true,
            categoryId: true,
            level: true,
            name: true,
          },
        });
    }

    if (!resolvedParticipant) {
      console.error(
        "PESERTA SCORE TIDAK VALID",
        {
          participantId,
          categoryId,
          eventId: event.id,
          eventLevel:
            category.eventLevel,
        }
      );

      return NextResponse.json(
        {
          error:
            "Peserta tidak termasuk dalam tingkatan kategori ini.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =====================================================
     * REQUEST PERUBAHAN NILAI
     * =====================================================
     *
     * Juri tidak boleh membuka kembali nilai SUBMITTED.
     *
     * Request hanya dicatat ke AuditLog.
     * Nilai TIDAK diubah.
     *
     * Admin yang nantinya menentukan:
     * APPROVE -> SUBMITTED menjadi DRAFT
     * REJECT  -> tetap SUBMITTED
     */

    if (action === "REQUEST_CHANGE") {
      const reason =
        body.reason !== undefined &&
        body.reason !== null
          ? String(body.reason).trim()
          : "";

      if (!reason) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Alasan perubahan wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      if (reason.length < 5) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Alasan perubahan terlalu singkat.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Ambil semua nilai Juri pada peserta + kategori.
       */
      const participantScores =
        await db.score.findMany({
          where: {
            participantId,
            categoryId: category.id,
            judgeId: user.id,
          },
          select: {
            id: true,
            criterionId: true,
            score: true,
            label: true,
            note: true,
            status: true,
            submittedAt: true,
            lockedAt: true,
          },
        });

      if (participantScores.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Belum ada nilai yang dapat diajukan untuk perubahan.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Nilai LOCKED tidak boleh diminta untuk dibuka.
       */
      const lockedScore =
        participantScores.find(
          (item) => item.lockedAt
        );

      if (lockedScore) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Sebagian nilai sudah dikunci dan tidak dapat diajukan untuk perubahan.",
          },
          {
            status: 423,
          }
        );
      }

      /*
       * Request hanya boleh dibuat jika memang
       * sudah ada nilai SUBMITTED.
       */
      const submittedScores =
        participantScores.filter(
          (item) =>
            item.status === "SUBMITTED"
        );

      if (submittedScores.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Belum ada nilai SUBMITTED yang dapat diajukan untuk perubahan.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Cegah request ganda yang masih menunggu.
       *
       * Request yang sudah pernah diproses tetap boleh
       * dibuat kembali setelahnya.
       */
      const previousRequests =
        await db.auditLog.findMany({
          where: {
            action:
              "REQUEST_SCORE_CHANGE",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
          select: {
            id: true,
            newValue: true,
          },
        });

      const pendingRequest =
        previousRequests.find(
          (item) => {
            try {
              const detail =
                item.newValue
                  ? JSON.parse(item.newValue)
                  : null;

              return (
                detail?.participantId ===
                  participantId &&
                detail?.categoryId ===
                  category.id &&
                detail?.judgeId ===
                  user.id &&
                detail?.status ===
                  "PENDING"
              );
            } catch {
              return false;
            }
          }
        );

      if (pendingRequest) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Permintaan perubahan untuk peserta ini masih menunggu persetujuan Admin.",
            code:
              "SCORE_CHANGE_REQUEST_PENDING",
          },
          {
            status: 409,
          }
        );
      }

      /*
       * Snapshot nilai saat request dibuat.
       *
       * Nilai ini hanya untuk audit.
       * Tidak digunakan untuk mengubah score.
       */
      const scoreSnapshot =
        submittedScores.map(
          (item) => ({
            scoreId: item.id,
            criterionId:
              item.criterionId,
            score: item.score,
            label: item.label,
            note: item.note,
            status: item.status,
            submittedAt:
              item.submittedAt,
          })
        );

      const requestData = {
        participantId,
        categoryId: category.id,
        judgeId: user.id,
        reason,
        status: "PENDING",
        requestedAt:
          new Date().toISOString(),
        scoreCount:
          submittedScores.length,
        scores:
          scoreSnapshot,
      };

      const audit =
        await db.auditLog.create({
          data: {
            userId: user.id,
            action:
              "REQUEST_SCORE_CHANGE",
            targetType:
              "SCORE_CHANGE_REQUEST",
            targetId:
              `${participantId}:${category.id}:${user.id}:${Date.now()}`,
            oldValue:
              JSON.stringify(
                scoreSnapshot
              ),
            newValue:
              JSON.stringify(
                requestData
              ),
            reason,
          },
        });

      return NextResponse.json({
        success: true,
        action:
          "REQUEST_CHANGE",
        requestId: audit.id,
        status: "PENDING",
        message:
          "Permintaan perubahan nilai berhasil dikirim kepada Admin.",
      });
    }
    /*
     * =====================================================
     * SUBMIT SATU PESERTA UNTUK SATU KATEGORI
     * =====================================================
     *
     * Penting:
     * - SUBMIT tidak memakai criterionId.
     * - Tidak mengubah nilai score.
     * - Tidak melakukan rumus apa pun.
     * - Hanya memastikan seluruh materi kategori sudah dinilai.
     * - Setelah lengkap, semua Score milik Juri ini menjadi SUBMITTED.
     */
    if (action === "SUBMIT") {
      const categoryCriteria =
        await db.criterion.findMany({
          where: {
            categoryId: category.id,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });

      const criterionIds = categoryCriteria.map(
        (item) => item.id
      );

      if (criterionIds.length === 0) {
        return NextResponse.json(
          {
            error: "Kategori ini belum memiliki materi penilaian.",
          },
          { status: 400 }
        );
      }

      const participantScores =
        await db.score.findMany({
          where: {
            participantId,
            categoryId: category.id,
            judgeId: user.id,
            criterionId: {
              in: criterionIds,
            },
          },
          select: {
            id: true,
            criterionId: true,
            score: true,
            status: true,
            lockedAt: true,
          },
        });

      const scoreByCriterion = new Map(
        participantScores.map((item) => [
          item.criterionId,
          item,
        ])
      );

      const missingCriteria = categoryCriteria.filter(
        (criterion) => !scoreByCriterion.has(criterion.id)
      );

      if (missingCriteria.length > 0) {
        return NextResponse.json(
          {
            error: `Nilai belum lengkap. ${missingCriteria.length} materi belum dinilai.`,
            missingCriteria: missingCriteria.map((item) => ({
              id: item.id,
              name: item.name,
            })),
          },
          { status: 400 }
        );
      }

      const lockedScore = participantScores.find(
        (item) => item.lockedAt
      );

      if (lockedScore) {
        return NextResponse.json(
          {
            error: "Sebagian nilai sudah dikunci dan tidak dapat disubmit ulang.",
          },
          { status: 423 }
        );
      }

      const submittedAt = new Date();

      await db.score.updateMany({
        where: {
          participantId,
          categoryId: category.id,
          judgeId: user.id,
          criterionId: {
            in: criterionIds,
          },
        },
        data: {
          status: "SUBMITTED",
          submittedAt,
        },
      });

      return NextResponse.json({
        success: true,
        action: "SUBMIT",
        participantId,
        categoryId: category.id,
        submittedAt: submittedAt.toISOString(),
      });
    }

    /*
     * =====================================================
     * CEK CRITERION
     * =====================================================
     */

    const criterion =
      await db.criterion.findFirst({
        where: {
          id: criterionId,

          OR: [
            {
              categoryId:
                category.id,
            },

            {
              category: {
                id: category.id,
              },
            },
          ],
        },

        select: {
          id: true,
          name: true,
          categoryId: true,
          subCategoryId: true,
        },
      });

    if (!criterion) {
      return NextResponse.json(
        {
          error:
            "Materi penilaian tidak termasuk kategori ini.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =====================================================
     * VALIDASI NILAI JURI
     * =====================================================
     *
     * Nilai yang dikirim adalah nilai INDIVIDUAL JURI.
     * Contoh: option master = 61 -> Juri mengirim 61.
     * Tidak ada perkalian dengan jumlah juri.
     */
    // Optimasi Parallel: Ambil opsi penilaian materi dan data nilai lama secara paralel
    const [scoreOptions, existing] = await Promise.all([
      db.scoreOption.findMany({
        where: {
          criterionId,
        },
        select: {
          id: true,
          label: true,
          score: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      }),
      db.score.findUnique({
        where: {
          participantId_criterionId_judgeId: {
            participantId,
            criterionId,
            judgeId: user.id,
          },
        },
        select: {
          id: true,
          score: true,
          label: true,
          note: true,
          status: true,
          submittedAt: true,
          lockedAt: true,
        },
      }),
    ]);

    const scoreOption = scoreOptions.find(
      (option) =>
        Math.abs(Number(option.score) - Number(score)) < 0.001
    ) || null;

    if (!scoreOption) {
      console.error("NILAI JURI TIDAK SESUAI OPSI MATERI", {
        score,
        criterionId,
        availableScores: scoreOptions.map((option) => option.score),
      });

      return NextResponse.json(
        {
          error:
            "Nilai juri tidak sesuai dengan pilihan nilai materi.",
        },
        {
          status: 400,
        }
      );
    }

    
    // Nilai yang sudah SUBMITTED tidak boleh diubah langsung.
    // Perubahan harus melalui persetujuan Admin.
    if (existing?.status === "SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nilai sudah disubmit. Ajukan perubahan kepada Admin terlebih dahulu.",
          code:
            "SCORE_CHANGE_APPROVAL_REQUIRED",
        },
        {
          status: 423,
        }
      );
    }
if (existing?.lockedAt) {
      return NextResponse.json(
        {
          error:
            "Nilai sudah dikunci dan tidak dapat diubah.",
        },
        {
          status: 423,
        }
      );
    }

    /*
     * =====================================================
     * UPSERT
     * =====================================================
     */

    const saved =
      await db.score.upsert({
        where: {
          participantId_criterionId_judgeId: {
            participantId,
            criterionId,
            judgeId: user.id,
          },
        },

        create: {
          participantId,
          criterionId,
          categoryId,
          judgeId: user.id,
          score,
          label:
            label ||
            scoreOption?.label ||
            null,
          note,
          status: "DRAFT",
        },

        update: {
          score,
          label:
            label ||
            scoreOption?.label ||
            null,
          note,
          status: "DRAFT",
          submittedAt: null,
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

    return NextResponse.json({
      success: true,
      score: saved,
    });
  } catch (error) {
    console.error(
      "SAVE JUDGE SCORE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan nilai.",
      },
      {
        status: 500,
      }
    );
  }
}




