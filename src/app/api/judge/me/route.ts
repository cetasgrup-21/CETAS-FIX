import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

/*
 * =========================================================
 * GET /api/judge/me
 * =========================================================
 *
 * Fungsi:
 *
 * 1. Membaca session CETAS
 * 2. Memastikan user adalah JUDGE
 * 3. Mengambil event ACTIVE
 * 4. Mengambil kategori yang ditugaskan kepada juri
 * 5. Mengambil TINGKATAN dari Category.eventLevel
 * 6. Mengambil SubCategory
 *
 * Hasil akhirnya dipakai halaman:
 *
 * /judge
 *
 * Struktur:
 *
 * Event
 * ├── Tingkatan SMP/MTS
 * │   ├── PBB
 * │   ├── KOMANDAN
 * │   └── ...
 * │
 * └── Tingkatan SMA/SMK/MA
 *     ├── PBB
 *     ├── KOMANDAN
 *     └── ...
 *
 * =========================================================
 */

export async function GET() {
  try {
    // =====================================================
    // 1. AMBIL COOKIE SESSION
    // =====================================================

    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get("cetas_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        {
          error: "Session login tidak ditemukan.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 2. VERIFIKASI JWT
    // =====================================================

    let session;

    try {
      session = await verifySessionToken(
        sessionCookie.value
      );
    } catch (error) {
      console.error(
        "VERIFY JUDGE SESSION ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Session login tidak valid atau sudah kedaluwarsa.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 3. VALIDASI USER ID
    // =====================================================

    if (!session.userId) {
      return NextResponse.json(
        {
          error: "User session tidak valid.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 4. AMBIL USER
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

    // =====================================================
    // USER TIDAK DITEMUKAN
    // =====================================================

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Akun tidak ditemukan. Silakan login kembali.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 5. CEK ROLE
    // =====================================================

    if (user.role !== "JUDGE") {
      return NextResponse.json(
        {
          error:
            "Akun ini bukan akun Juri.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 6. CEK STATUS
    // =====================================================

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Akun Juri sedang tidak aktif.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =====================================================
    // 7. AMBIL EVENT AKTIF
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
          date: true,
          location: true,
          logo: true,
          banner: true,
          totalPoints: true,
        },
      });

    // =====================================================
    // BELUM ADA EVENT
    // =====================================================

    if (!event) {
      return NextResponse.json(
        {
          user,

          event: null,

          categories: [],
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // =====================================================
    // 8. AMBIL KATEGORI YANG DITUGASKAN
    // =====================================================
    //
    // HANYA:
    //
    // event aktif
    // +
    // category ACTIVE
    // +
    // category punya CategoryJudge untuk user
    //
    // DAN SEKARANG:
    //
    // eventLevel ikut diambil.
    //
    // =====================================================

    const categories =
      await db.category.findMany({
        where: {
          eventId: event.id,

          status: "ACTIVE",

          judgeLinks: {
            some: {
              judgeId: user.id,
            },
          },
        },

        orderBy: [
          {
            eventLevel: {
              sortOrder: "asc",
            },
          },
          {
            sortOrder: "asc",
          },
        ],

        include: {
          // =================================================
          // TINGKATAN
          // =================================================

          eventLevel: {
            select: {
              id: true,
              code: true,
              name: true,
              sortOrder: true,
              status: true,
            },
          },

          // =================================================
          // PENUGASAN JURI
          // =================================================

          judgeLinks: {
            select: {
              judgeId: true,
            },
          },

          // =================================================
          // MATERI / KRITERIA
          // =================================================

          criteria: {
            select: {
              id: true,
            },
          },

          // =================================================
          // SUBKATEGORI
          // =================================================

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
              status: true,
            },
          },
        },
      });

    // =====================================================
    // 9. NORMALISASI DATA
    // =====================================================

    const normalizedCategories =
      categories.map((category) => {
        return {
          id: category.id,

          name: category.name,

          percentage:
            category.percentage,

          sortOrder:
            category.sortOrder,

          eventId:
            category.eventId,

          // =================================================
          // INI YANG PENTING
          // =================================================

          eventLevelId:
            category.eventLevelId,

          eventLevel:
            category.eventLevel
              ? {
                  id:
                    category.eventLevel.id,

                  code:
                    category.eventLevel.code,

                  name:
                    category.eventLevel.name,

                  sortOrder:
                    category.eventLevel.sortOrder,

                  status:
                    category.eventLevel.status,
                }
              : null,

          // =================================================
          // JUMLAH MATERI
          // =================================================

          materialCount:
            category.criteria.length,

          // =================================================
          // SUBKATEGORI
          // =================================================

          subCategories:
            category.subCategories,

          // =================================================
          // JURI
          // =================================================

          judgeLinks:
            category.judgeLinks,
        };
      });

    // =====================================================
    // 10. RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        user,

        event,

        categories:
          normalizedCategories,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    // =====================================================
    // ERROR
    // =====================================================

    console.error(
      "GET JUDGE ME ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data juri.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}