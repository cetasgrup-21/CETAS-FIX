import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

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
 * POST
 * =========================================================
 *
 * POST /api/judge/participant
 *
 * Action:
 *   WITHDRAW
 *
 * Fungsi:
 *   Menandai peserta sebagai mengundurkan diri.
 *
 * CATATAN:
 *   Data peserta TIDAK dihapus.
 *   Nilai / Score TIDAK dihapus.
 *   Status peserta berubah:
 *
 *      ACTIVE -> INACTIVE
 *
 *   Pindah peserta sendiri tidak membutuhkan API karena
 *   hanya mengubah posisi tampilan di halaman juri.
 */

export async function POST(req: Request) {
  try {
    // =====================================================
    // 1. SESSION
    // =====================================================

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

    // =====================================================
    // 2. ROLE
    // =====================================================

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

    // =====================================================
    // 3. REQUEST BODY
    // =====================================================

    const body = await req.json();

    const participantId = String(
      body?.participantId || ""
    ).trim();

    const categoryId = String(
      body?.categoryId || ""
    ).trim();

    const action = String(
      body?.action || ""
    )
      .trim()
      .toUpperCase();

    const reason =
      body?.reason !== undefined &&
      body?.reason !== null &&
      String(body.reason).trim()
        ? String(body.reason).trim()
        : null;

    // =====================================================
    // 4. VALIDASI
    // =====================================================

    if (!participantId || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori dan ID peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (action !== "WITHDRAW") {
      return NextResponse.json(
        {
          success: false,
          error: "Aksi peserta tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 5. USER JURI
    // =====================================================

    const user =
      await db.user.findUnique({
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

    if (
      !user ||
      user.status !== "ACTIVE"
    ) {
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

    // =====================================================
    // 6. EVENT AKTIF
    // =====================================================

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
          status: true,
        },
      });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Event aktif tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // 7. CEK PENUGASAN JURI
    // =====================================================

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

    // =====================================================
    // 8. VALIDASI KATEGORI
    // =====================================================

    const category =
      assignment.category;

    if (
      category.status !== "ACTIVE" ||
      category.eventId !== event.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori tidak tersedia pada event aktif.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // 9. TINGKATAN
    // =====================================================
    //
    // Peserta digunakan bersama oleh kategori dalam
    // tingkatan yang sama.
    //
    // Contoh:
    //
    // SMP/MTS
    //   ├── PBB
    //   └── KOMANDAN
    //
    // Peserta PBB dan KOMANDAN adalah peserta yang sama.
    //
    // =====================================================

    const participantLevel =
      category.eventLevel?.name?.trim() ||
      category.eventLevel?.code?.trim() ||
      null;

    // =====================================================
    // 10. CARI PESERTA
    // =====================================================

    const participant =
      await db.participant.findFirst({
        where: {
          id: participantId,

          eventId: event.id,

          ...(participantLevel
            ? {
                level:
                  participantLevel,
              }
            : {}),
        },

        select: {
          id: true,
          eventId: true,
          number: true,
          name: true,
          school: true,
          level: true,
          status: true,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Peserta tidak ditemukan pada event aktif.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // 11. PASTIKAN MASIH ACTIVE
    // =====================================================

    if (
      participant.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Peserta sudah tidak aktif.",
        },
        {
          status: 409,
        }
      );
    }

    // =====================================================
    // 12. WITHDRAW
    // =====================================================
    //
    // JANGAN DELETE.
    //
    // Hanya:
    //
    // ACTIVE -> INACTIVE
    //
    // Score tetap aman karena relasi Participant tidak
    // disentuh dan tidak ada delete cascade.
    //
    // =====================================================

    const updated =
      await db.participant.update({
        where: {
          id: participant.id,
        },

        data: {
          status: "INACTIVE",
        },

        select: {
          id: true,
          eventId: true,
          number: true,
          name: true,
          school: true,
          level: true,
          status: true,
        },
      });

    // =====================================================
    // 13. LOG
    // =====================================================

    console.info(
      "JUDGE WITHDRAW PARTICIPANT",
      {
        eventId: event.id,

        participantId:
          participant.id,

        participantNumber:
          participant.number,

        participantName:
          participant.name,

        judgeId: user.id,

        judgeUsername:
          user.username,

        reason:
          reason || null,
      }
    );

    // =====================================================
    // 14. RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      message:
        `Peserta "${updated.name}" ` +
        `ditandai mengundurkan diri.`,

      participant: updated,
    });
  } catch (error) {
    console.error(
      "JUDGE WITHDRAW PARTICIPANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status peserta.",
      },
      {
        status: 500,
      }
    );
  }
}