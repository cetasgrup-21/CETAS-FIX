import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

/*
 * ============================================================
 * ALIAS TINGKATAN
 * ============================================================
 *
 * Tujuannya supaya data peserta lama dan data peserta baru
 * tetap bisa dibaca oleh sistem.
 *
 * Contoh:
 *
 * EventLevel:
 *   SMP/MTS
 *
 * Peserta bisa mempunyai:
 *   SMP/MTS
 *   SMP
 *   MTS
 *   SMP_MTS
 *
 * Kita tidak mengubah data peserta.
 * Kita hanya membuat pencarian lebih fleksibel.
 */

const LEVEL_ALIASES: Record<string, string[]> = {
  SD_MI: [
    "SD/MI",
    "SD",
    "MI",
    "SD_MI",
  ],

  "SD/MI": [
    "SD/MI",
    "SD",
    "MI",
    "SD_MI",
  ],

  SMP_MTS: [
    "SMP/MTS",
    "SMP",
    "MTS",
    "SMP_MTS",
  ],

  "SMP/MTS": [
    "SMP/MTS",
    "SMP",
    "MTS",
    "SMP_MTS",
  ],

  SMA_SMK_MA: [
    "SMA/SMK/MA",
    "SMA",
    "SMK",
    "MA",
    "SMA_SMK_MA",
  ],

  "SMA/SMK/MA": [
    "SMA/SMK/MA",
    "SMA",
    "SMK",
    "MA",
    "SMA_SMK_MA",
  ],

  PURNA_CLUB_UMUM: [
    "PURNA/CLUB/UMUM",
    "PURNA",
    "CLUB",
    "UMUM",
    "PURNA_CLUB_UMUM",
  ],

  "PURNA/CLUB/UMUM": [
    "PURNA/CLUB/UMUM",
    "PURNA",
    "CLUB",
    "UMUM",
    "PURNA_CLUB_UMUM",
  ],
};

function getLevelAliases(
  levelName: string,
  levelCode: string
) {
  const aliases = new Set<string>();

  const name = clean(levelName);
  const code = clean(levelCode);

  /*
   * Masukkan nama EventLevel.
   */
  if (name) {
    aliases.add(name);
  }

  /*
   * Masukkan code EventLevel.
   */
  if (code) {
    aliases.add(code);
  }

  /*
   * Tambahkan alias berdasarkan code.
   */
  if (code && LEVEL_ALIASES[code]) {
    for (const alias of LEVEL_ALIASES[code]) {
      aliases.add(alias);
    }
  }

  /*
   * Tambahkan alias berdasarkan nama.
   */
  if (name && LEVEL_ALIASES[name]) {
    for (const alias of LEVEL_ALIASES[name]) {
      aliases.add(alias);
    }
  }

  return Array.from(aliases);
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // =====================================================
    // 1. CATEGORY ID
    // =====================================================

    const { categoryId } = await context.params;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 2. SESSION
    // =====================================================

    const cookieStore = await cookies();

    const token = cookieStore.get(
      "cetas_session"
    )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Session login tidak ditemukan.",
        },
        {
          status: 401,
        }
      );
    }

    let session;

    try {
      session = await verifySessionToken(token);
    } catch (error) {
      console.error(
        "JUDGE CATEGORY SESSION ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Session sudah tidak valid. Silakan login kembali.",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // 3. USER
    // =====================================================

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
      return NextResponse.json(
        {
          success: false,
          error: "User tidak ditemukan.",
        },
        {
          status: 401,
        }
      );
    }

    if (user.role !== "JUDGE") {
      return NextResponse.json(
        {
          success: false,
          error: "Akun ini bukan akun Juri.",
        },
        {
          status: 403,
        }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Akun Juri tidak aktif.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // 4. CATEGORY
    // =====================================================

    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        id: true,
        name: true,
        eventId: true,
        eventLevelId: true,
        percentage: true,
        sortOrder: true,

        eventLevel: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },

        judgeLinks: {
          where: {
            judgeId: user.id,
          },

          select: {
            judgeId: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // 5. CEK PENUGASAN JURI
    // =====================================================

    if (category.judgeLinks.length === 0) {
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
    // 6. FILTER PESERTA
    // =====================================================
    //
    // Tetap:
    //
    // eventId
    // +
    // status ACTIVE
    //
    // Yang diperbaiki hanya pencocokan tingkatan.
    //
    // =====================================================

    const participantWhere: {
      eventId: string;
      status: string;
      level?: {
        in: string[];
      };
    } = {
      eventId: category.eventId,
      status: "ACTIVE",
    };

    // =====================================================
    // FILTER TINGKATAN
    // =====================================================

    let levelAliases: string[] = [];

    if (category.eventLevel) {
      const levelName = clean(
        category.eventLevel.name
      );

      const levelCode = clean(
        category.eventLevel.code
      );

      levelAliases = getLevelAliases(
        levelName,
        levelCode
      );

      /*
       * Jika ada alias, gunakan IN.
       *
       * Contoh SMP/MTS:
       *
       * level IN [
       *   "SMP/MTS",
       *   "SMP",
       *   "MTS",
       *   "SMP_MTS"
       * ]
       */
      if (levelAliases.length > 0) {
        participantWhere.level = {
          in: levelAliases,
        };
      }
    }

    // =====================================================
    // DEBUG LOG
    // =====================================================

    console.log(
      "========================================"
    );

    console.log(
      "JUDGE PARTICIPANT REQUEST"
    );

    console.log(
      "Category:",
      category.name
    );

    console.log(
      "Category ID:",
      category.id
    );

    console.log(
      "Event ID:",
      category.eventId
    );

    console.log(
      "Event Level:",
      category.eventLevel
    );

    console.log(
      "Level Aliases:",
      levelAliases
    );

    console.log(
      "Participant WHERE:",
      participantWhere
    );

    console.log(
      "========================================"
    );

    // =====================================================
    // 7. QUERY PESERTA
    // =====================================================

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

    console.log(
      "JUMLAH PESERTA:",
      participants.length
    );

    console.log(
      "PESERTA:",
      participants.map((participant) => ({
        id: participant.id,
        number: participant.number,
        name: participant.name,
        level: participant.level,
      }))
    );

    // =====================================================
    // 8. RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        category: {
          id: category.id,
          name: category.name,
          eventId: category.eventId,
          eventLevelId: category.eventLevelId,
          percentage: category.percentage,
          sortOrder: category.sortOrder,
          eventLevel: category.eventLevel,
        },

        participants,
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
      "GET JUDGE CATEGORY PARTICIPANTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil peserta.",
      },
      {
        status: 500,
      }
    );
  }
}