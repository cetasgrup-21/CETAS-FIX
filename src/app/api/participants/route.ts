import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/*
 * =========================================================
 * HELPER
 * =========================================================
 */

function getId(value: unknown) {
  return String(value || "").trim();
}

function getNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function getLevel(value: unknown) {
  return String(value || "").trim();
}

/*
 * =========================================================
 * GET
 * =========================================================
 *
 * GET /api/participants
 *
 * Peserta berada di:
 *
 * EVENT
 *   ↓
 * LEVEL / TINGKATAN
 *   ↓
 * PESERTA
 *
 * Peserta TIDAK lagi terikat ke satu kategori.
 *
 * categoryId tetap diterima untuk kompatibilitas dengan
 * halaman lama, tetapi TIDAK digunakan sebagai filter.
 *
 * Contoh:
 *
 * /api/participants
 * /api/participants?level=SMP/MTS
 * /api/participants?categoryId=xxxxx
 *
 * Semua tetap mengambil peserta berdasarkan EVENT ACTIVE.
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    /*
     * Tetap dibaca supaya URL lama tidak error.
     *
     * PENTING:
     * categoryId TIDAK digunakan untuk filter peserta.
     */
    const categoryId =
      searchParams.get("categoryId")?.trim() || "";

    const level =
      searchParams.get("level")?.trim() || "";

    console.log(
      "GET PARTICIPANTS:",
      {
        categoryId,
        level,
      }
    );

    /*
     * =====================================================
     * EVENT ACTIVE
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
     * PESERTA
     * =====================================================
     *
     * JANGAN filter categoryId.
     *
     * Karena peserta sekarang:
     *
     * categoryId = null
     *
     * Kategori hanya menentukan:
     *
     * - juri
     * - materi
     * - bobot
     * - penilaian
     *
     * Bukan daftar peserta.
     */

    const participants =
      await db.participant.findMany({
        where: {
          eventId: event.id,

          /*
           * Filter tingkatan kalau dikirim.
           */
          ...(level
            ? {
                level,
              }
            : {}),
        },

        /*
         * Urutan:
         *
         * 1. Tingkatan
         * 2. displayOrder
         * 3. nomor peserta
         */

        orderBy: [
          {
            level: "asc",
          },
          {
            displayOrder: "asc",
          },
          {
            number: "asc",
          },
        ],

        include: {
          category: {
            select: {
              id: true,
              name: true,
              percentage: true,
              sortOrder: true,
            },
          },

          results: true,
        },
      });

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        event,

        participants,

        /*
         * Informasi tambahan agar frontend lama tahu
         * bahwa categoryId tidak lagi digunakan sebagai
         * pengikat peserta.
         */
        participantMode:
          "EVENT_LEVEL",

        categoryFilterIgnored:
          Boolean(categoryId),
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
      "GET PARTICIPANTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data peserta.",
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
 *
 * Tambah peserta ke EVENT ACTIVE.
 *
 * Struktur:
 *
 * EVENT
 *   ↓
 * LEVEL
 *   ↓
 * PESERTA
 *
 * Tidak ada categoryId.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /*
     * =====================================================
     * EVENT ACTIVE
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

    /*
     * =====================================================
     * BODY
     * =====================================================
     */

    const number =
      getNumber(body.number);

    const name =
      String(body.name || "").trim();

    const school =
      String(body.school || "").trim();

    const level =
      getLevel(body.level);

    const photo =
      body.photo
        ? String(body.photo)
        : null;

    const logo =
      body.logo
        ? String(body.logo)
        : null;

    /*
     * =====================================================
     * VALIDASI
     * =====================================================
     */

    if (!number) {
      return NextResponse.json(
        {
          error:
            "Nomor peserta harus berupa angka lebih dari 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (!level) {
      return NextResponse.json(
        {
          error:
            "Tingkatan peserta wajib dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Nama peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * VALIDASI TINGKATAN
     * =====================================================
     */

    const eventLevel =
      await db.eventLevel.findFirst({
        where: {
          eventId: event.id,

          OR: [
            {
              name: level,
            },
            {
              code: level,
            },
          ],
        },

        select: {
          id: true,
          name: true,
          code: true,
        },
      });

    if (!eventLevel) {
      return NextResponse.json(
        {
          error:
            `Tingkatan "${level}" tidak ditemukan pada event aktif.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Simpan nama level dari database.
     */

    const participantLevel =
      eventLevel.name || level;

    /*
     * =====================================================
     * CEK DUPLIKAT NOMOR
     * =====================================================
     *
     * Nomor unik berdasarkan:
     *
     * EVENT + LEVEL + NUMBER
     */

    const duplicateNumber =
      await db.participant.findFirst({
        where: {
          eventId: event.id,
          level: participantLevel,
          number,
        },

        select: {
          id: true,
          name: true,
          level: true,
          number: true,
        },
      });

    if (duplicateNumber) {
      return NextResponse.json(
        {
          error:
            `Nomor peserta ${number} pada tingkatan "${participantLevel}" sudah digunakan oleh "${duplicateNumber.name}".`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =====================================================
     * DISPLAY ORDER
     * =====================================================
     *
     * Urutan berdasarkan EVENT + LEVEL.
     */

    const lastParticipant =
      await db.participant.findFirst({
        where: {
          eventId: event.id,
          level: participantLevel,
        },

        orderBy: {
          displayOrder: "desc",
        },

        select: {
          displayOrder: true,
        },
      });

    const displayOrder =
      (lastParticipant?.displayOrder || 0) + 1;

    /*
     * =====================================================
     * CREATE
     * =====================================================
     */

    const participant =
      await db.participant.create({
        data: {
          eventId: event.id,

          /*
           * PENTING:
           *
           * Peserta tidak memiliki kategori.
           */
          categoryId: null,

          eventLevelId: eventLevel.id,

          number,

          displayOrder,

          name,

          school:
            school || null,

          level:
            participantLevel,

          photo,

          logo,

          status: "ACTIVE",
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
              percentage: true,
            },
          },
        },
      });

    return NextResponse.json(
      participant,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE PARTICIPANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan peserta.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =========================================================
 * PUT
 * =========================================================
 *
 * Edit peserta.
 *
 * Peserta tetap tidak terikat kategori.
 *
 * Nomor unik berdasarkan:
 *
 * EVENT + LEVEL + NUMBER
 */

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const id =
      getId(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * PESERTA LAMA
     * =====================================================
     */

    const existing =
      await db.participant.findUnique({
        where: {
          id,
        },

        include: {
          event: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

    if (!existing) {
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

    /*
     * =====================================================
     * BODY
     * =====================================================
     */

    const number =
      body.number !== undefined
        ? getNumber(body.number)
        : existing.number;

    const name =
      body.name !== undefined
        ? String(body.name || "").trim()
        : existing.name;

    const school =
      body.school !== undefined
        ? String(body.school || "").trim()
        : existing.school || "";

    const level =
      body.level !== undefined
        ? getLevel(body.level)
        : existing.level || "";

    const photo =
      body.photo !== undefined
        ? body.photo
          ? String(body.photo)
          : null
        : existing.photo;

    const logo =
      body.logo !== undefined
        ? body.logo
          ? String(body.logo)
          : null
        : existing.logo;

    /*
     * =====================================================
     * VALIDASI
     * =====================================================
     */

    if (!number) {
      return NextResponse.json(
        {
          error:
            "Nomor peserta tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    if (!level) {
      return NextResponse.json(
        {
          error:
            "Tingkatan peserta wajib dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Nama peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * VALIDASI TINGKATAN
     * =====================================================
     */

    const eventLevel =
      await db.eventLevel.findFirst({
        where: {
          eventId: existing.eventId,

          OR: [
            {
              name: level,
            },
            {
              code: level,
            },
          ],
        },

        select: {
          id: true,
          name: true,
          code: true,
        },
      });

    if (!eventLevel) {
      return NextResponse.json(
        {
          error:
            `Tingkatan "${level}" tidak ditemukan pada event.`,
        },
        {
          status: 400,
        }
      );
    }

    const participantLevel =
      eventLevel.name || level;

    /*
     * =====================================================
     * CEK DUPLIKAT
     * =====================================================
     */

    const duplicateNumber =
      await db.participant.findFirst({
        where: {
          eventId: existing.eventId,

          level:
            participantLevel,

          number,

          id: {
            not: id,
          },
        },

        select: {
          id: true,
          name: true,
          level: true,
          number: true,
        },
      });

    if (duplicateNumber) {
      return NextResponse.json(
        {
          error:
            `Nomor peserta ${number} pada tingkatan "${participantLevel}" sudah digunakan oleh "${duplicateNumber.name}".`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =====================================================
     * UPDATE
     * =====================================================
     */

    const participant =
      await db.participant.update({
        where: {
          id,
        },

        data: {
          /*
           * PENTING:
           * peserta tidak terikat kategori.
           */
          categoryId: null,

          eventLevelId: eventLevel.id,

          number,

          name,

          school:
            school || null,

          level:
            participantLevel,

          photo,

          logo,
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
              percentage: true,
            },
          },
        },
      });

    return NextResponse.json(
      participant
    );
  } catch (error) {
    console.error(
      "UPDATE PARTICIPANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui peserta.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =========================================================
 * DELETE
 * =========================================================
 */

export async function DELETE(req: Request) {
  try {
    const body =
      await req.json();

    const id =
      getId(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID peserta wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * CEK PESERTA
     * =====================================================
     */

    const participant =
      await db.participant.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          name: true,
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

    /*
     * =====================================================
     * DELETE
     * =====================================================
     */

    await db.participant.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        `Peserta "${participant.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error(
      "DELETE PARTICIPANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus peserta.",
      },
      {
        status: 500,
      }
    );
  }
}