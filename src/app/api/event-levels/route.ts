import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const LEVELS = [
  {
    code: "SD_MI",
    name: "SD/MI",
    sortOrder: 1,
  },
  {
    code: "SMP_MTS",
    name: "SMP/MTS",
    sortOrder: 2,
  },
  {
    code: "SMA_SMK_MA",
    name: "SMA/SMK/MA",
    sortOrder: 3,
  },
  {
    code: "PURNA_CLUB_UMUM",
    name: "PURNA/CLUB/UMUM",
    sortOrder: 4,
  },
] as const;

function clean(value: unknown) {
  return String(value ?? "").trim();
}

/**
 * ============================================================
 * ENSURE DEFAULT LEVELS
 * ============================================================
 *
 * Setiap event otomatis mempunyai 4 tingkatan:
 *
 * 1. SD/MI
 * 2. SMP/MTS
 * 3. SMA/SMK/MA
 * 4. PURNA/CLUB/UMUM
 *
 * Status masing-masing level tetap bisa diaktifkan/nonaktifkan.
 */
async function ensureLevels(eventId: string) {
  const existing = await db.eventLevel.findMany({
    where: {
      eventId,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const existingCodes = new Set(
    existing.map((level) => level.code)
  );

  const missing = LEVELS.filter(
    (level) => !existingCodes.has(level.code)
  );

  if (missing.length > 0) {
    try {
      await db.eventLevel.createMany({
        data: missing.map((level) => ({
          eventId,
          code: level.code,
          name: level.name,
          sortOrder: level.sortOrder,
          status: "ACTIVE",
        })),
      });
    } catch (error: any) {
      /**
       * React / Next.js development mode kadang menjalankan
       * GET bersamaan sehingga dua request bisa mencoba
       * membuat level yang sama.
       *
       * P2002 = unique constraint.
       * Kalau request lain sudah membuatnya, tidak masalah.
       */
      if (error?.code !== "P2002") {
        throw error;
      }
    }
  }

  /**
   * ==========================================================
   * AMBIL LEVEL
   * ==========================================================
   *
   * Schema Prisma saat ini menggunakan:
   *
   * EventLevel
   *    └── categories
   *
   * BUKAN:
   *
   * EventLevel
   *    └── categoryLinks
   *
   * Karena itu kita menggunakan `categories`.
   */
  const levels = await db.eventLevel.findMany({
    where: {
      eventId,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      categories: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          sortOrder: "asc",
        },
      },

      _count: {
        select: {
          categories: true,
        },
      },
    },
  });

  /**
   * ==========================================================
   * AMBIL PESERTA
   * ==========================================================
   *
   * Peserta lama mungkin belum mempunyai eventLevelId.
   *
   * Karena itu kita tetap mempertahankan fallback:
   *
   * 1. eventLevelId
   * 2. field level = nama level
   * 3. field level = code level
   */
  const participants = await db.participant.findMany({
    where: {
      eventId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      eventLevelId: true,
      level: true,
    },
  });

  /**
   * ==========================================================
   * GABUNGKAN DATA
   * ==========================================================
   */
  const result = levels.map((level) => {
    const participantCount = participants.filter(
      (participant) => {
        /**
         * PRIORITAS 1
         *
         * Peserta sudah mempunyai relasi langsung.
         */
        if (
          participant.eventLevelId === level.id
        ) {
          return true;
        }

        /**
         * PRIORITAS 2
         *
         * Peserta belum mempunyai eventLevelId.
         * Gunakan field level sebagai fallback.
         */
        if (
          participant.eventLevelId === null
        ) {
          const participantLevel = clean(
            participant.level
          );

          return (
            participantLevel === level.name ||
            participantLevel === level.code
          );
        }

        return false;
      }
    ).length;

    return {
      ...level,

      _count: {
        ...level._count,

        /**
         * Jumlah peserta dihitung dengan logika
         * kompatibilitas data lama di atas.
         */
        participants: participantCount,
      },

      /**
       * ======================================================
       * KATEGORI
       * ======================================================
       *
       * Untuk schema sekarang, Category mempunyai
       * eventLevelId.
       *
       * Jadi kategori yang terhubung ke level ini
       * dikirim sebagai `categories`.
       */
      categories: level.categories.map(
        (category) => ({
          ...category,

          eventLevelId: level.id,
        })
      ),
    };
  });

  return result;
}

/**
 * ============================================================
 * GET
 * ============================================================
 *
 * GET /api/event-levels?eventId=xxxxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const eventId = clean(
      searchParams.get("eventId")
    );

    if (!eventId) {
      return NextResponse.json(
        {
          error: "eventId wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Pastikan event memang ada.
     */
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

    /**
     * Pastikan semua level tersedia.
     */
    const levels = await ensureLevels(
      eventId
    );

    return NextResponse.json({
      event,
      levels,
    });
  } catch (error) {
    console.error(
      "GET EVENT LEVELS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil tingkatan event.",
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
 * ============================================================
 *
 * Mengubah status tingkatan:
 *
 * ACTIVE
 * INACTIVE
 *
 * Tidak mengubah peserta.
 * Tidak mengubah kategori.
 * Tidak mengubah bobot.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const id = clean(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error: "ID tingkatan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Pastikan level ada.
     */
    const existing = await db.eventLevel.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Tingkatan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const data: {
      status?: string;
    } = {};

    /**
     * Update status jika dikirim.
     */
    if (body.status !== undefined) {
      const status = clean(body.status);

      if (
        status !== "ACTIVE" &&
        status !== "INACTIVE"
      ) {
        return NextResponse.json(
          {
            error:
              "Status tingkatan tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      data.status = status;
    }

    /**
     * Kalau tidak ada data yang mau diubah,
     * kembalikan data lama.
     */
    if (Object.keys(data).length === 0) {
      return NextResponse.json(existing);
    }

    const level = await db.eventLevel.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error(
      "UPDATE EVENT LEVEL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui tingkatan.",
      },
      {
        status: 500,
      }
    );
  }
}