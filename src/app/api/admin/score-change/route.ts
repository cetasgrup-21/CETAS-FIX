import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

async function getAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get("cetas_session")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Session login tidak ditemukan.",
        },
        { status: 401 }
      ),
    };
  }

  let session;

  try {
    session = await verifySessionToken(token);
  } catch {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Session sudah tidak valid.",
        },
        { status: 401 }
      ),
    };
  }

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

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "User tidak ditemukan.",
        },
        { status: 401 }
      ),
    };
  }

  if (
    user.role !== "OPERATOR" &&
    user.role !== "SUPER_ADMIN"
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error:
            "Anda tidak memiliki akses Admin.",
        },
        { status: 403 }
      ),
    };
  }

  if (user.status !== "ACTIVE") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Akun Admin tidak aktif.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
  };
}

/*
 * ============================================================
 * GET
 * Daftar permintaan perubahan nilai yang masih menunggu.
 * ============================================================
 */
export async function GET() {
  try {
    const auth = await getAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const requests = await db.auditLog.findMany({
      where: {
        action: "REQUEST_SCORE_CHANGE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const result = [];

    for (const request of requests) {
      let detail: {
        participantId?: string;
        categoryId?: string;
        judgeId?: string;
        reason?: string;
      } = {};

      try {
        detail = request.newValue
          ? JSON.parse(request.newValue)
          : {};
      } catch {
        detail = {};
      }

      const participant = detail.participantId
        ? await db.participant.findUnique({
            where: {
              id: detail.participantId,
            },
            select: {
              id: true,
              number: true,
              name: true,
              school: true,
            },
          })
        : null;

      const category = detail.categoryId
        ? await db.category.findUnique({
            where: {
              id: detail.categoryId,
            },
            select: {
              id: true,
              name: true,
              eventLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : null;

      const judge = detail.judgeId
        ? await db.user.findUnique({
            where: {
              id: detail.judgeId,
            },
            select: {
              id: true,
              name: true,
              username: true,
            },
          })
        : null;

      // ========================================================
      // CEK APAKAH REQUEST SUDAH DIPROSES ADMIN
      // ========================================================

      const handled = await db.auditLog.findFirst({
        where: {
          targetType: "SCORE_CHANGE_REQUEST",
          targetId: request.id,
          action: {
            in: [
              "APPROVE_SCORE_CHANGE",
              "REJECT_SCORE_CHANGE",
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          action: true,
          createdAt: true,
          userId: true,
        },
      });

      const requestStatus =
        handled?.action === "APPROVE_SCORE_CHANGE"
          ? "APPROVED"
          : handled?.action === "REJECT_SCORE_CHANGE"
            ? "REJECTED"
            : "PENDING";

      let processedBy = null;

      if (handled?.userId) {
        const admin = await db.user.findUnique({
          where: {
            id: handled.userId,
          },
          select: {
            id: true,
            name: true,
            username: true,
          },
        });

        processedBy = admin
          ? {
              id: admin.id,
              name: admin.name,
              username: admin.username,
            }
          : null;
      }

      result.push({
        id: request.id,
        createdAt: request.createdAt,
        status: requestStatus,
        processedAt: handled?.createdAt || null,
        processedBy,
        reason:
          detail.reason ||
          request.reason ||
          "Tidak ada alasan.",
        participant,
        category,
        judge,
      });
    }

    return NextResponse.json({
      success: true,
      requests: result,
    });
  } catch (error) {
    console.error(
      "GET SCORE CHANGE REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil permintaan perubahan nilai.",
      },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * POST
 *
 * action:
 * APPROVE
 * REJECT
 *
 * ============================================================
 */
export async function POST(req: Request) {
  try {
    const auth = await getAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await req.json();

    const requestId = String(
      body.requestId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "requestId wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Action harus APPROVE atau REJECT.",
        },
        { status: 400 }
      );
    }

    const request =
      await db.auditLog.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Permintaan perubahan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (
      request.action !==
      "REQUEST_SCORE_CHANGE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Data tersebut bukan permintaan perubahan nilai.",
        },
        { status: 400 }
      );
    }

    let detail: {
      participantId?: string;
      categoryId?: string;
      judgeId?: string;
      reason?: string;
    } = {};

    try {
      detail = request.newValue
        ? JSON.parse(request.newValue)
        : {};
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Data permintaan perubahan tidak valid.",
        },
        { status: 400 }
      );
    }

    const participantId =
      String(detail.participantId || "").trim();

    const categoryId =
      String(detail.categoryId || "").trim();

    const judgeId =
      String(detail.judgeId || "").trim();

    if (
      !participantId ||
      !categoryId ||
      !judgeId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Data peserta, kategori, atau juri tidak lengkap.",
        },
        { status: 400 }
      );
    }

    /*
     * Cegah request yang sama diproses dua kali.
     */
    const alreadyHandled =
      await db.auditLog.findFirst({
        where: {
          targetType:
            "SCORE_CHANGE_REQUEST",
          targetId: requestId,
          action: {
            in: [
              "APPROVE_SCORE_CHANGE",
              "REJECT_SCORE_CHANGE",
            ],
          },
        },
        select: {
          id: true,
        },
      });

    if (alreadyHandled) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Permintaan ini sudah diproses sebelumnya.",
        },
        { status: 409 }
      );
    }

    /*
     * ========================================================
     * APPROVE
     *
     * Hanya Score SUBMITTED yang dibuka kembali.
     *
     * LOCKED tetap tidak disentuh.
     * ========================================================
     */
    if (action === "APPROVE") {
      const result =
        await db.$transaction(
          async (tx) => {
            const updated =
              await tx.score.updateMany({
                where: {
                  participantId,
                  categoryId,
                  judgeId,
                  status: "SUBMITTED",
                  lockedAt: null,
                },
                data: {
                  status: "DRAFT",
                  submittedAt: null,
                },
              });

            await tx.auditLog.create({
              data: {
                userId: auth.user.id,
                action:
                  "APPROVE_SCORE_CHANGE",
                targetType:
                  "SCORE_CHANGE_REQUEST",
                targetId: requestId,
                oldValue:
                  request.newValue,
                newValue: JSON.stringify({
                  participantId,
                  categoryId,
                  judgeId,
                  scoresReopened:
                    updated.count,
                }),
                reason:
                  `Permintaan perubahan nilai disetujui oleh ${auth.user.name}.`,
              },
            });

            return updated.count;
          }
        );

      return NextResponse.json({
        success: true,
        action: "APPROVE",
        scoresReopened: result,
      });
    }

    /*
     * ========================================================
     * REJECT
     *
     * Score tidak disentuh.
     * Status tetap SUBMITTED.
     * ========================================================
     */
    await db.auditLog.create({
      data: {
        userId: auth.user.id,
        action:
          "REJECT_SCORE_CHANGE",
        targetType:
          "SCORE_CHANGE_REQUEST",
        targetId: requestId,
        oldValue:
          request.newValue,
        newValue: JSON.stringify({
          participantId,
          categoryId,
          judgeId,
        }),
        reason:
          String(
            body.reason ||
              `Permintaan perubahan ditolak oleh ${auth.user.name}.`
          ).trim(),
      },
    });

    return NextResponse.json({
      success: true,
      action: "REJECT",
    });
  } catch (error) {
    console.error(
      "POST SCORE CHANGE REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal memproses permintaan perubahan nilai.",
      },
      { status: 500 }
    );
  }
}


