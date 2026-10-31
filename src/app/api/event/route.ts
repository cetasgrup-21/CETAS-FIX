import { getEventsStore } from "@/lib/cetas-store";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { regenerateCategoryScoreOptions } from "@/lib/scoring-server";


let isSyncing = false;
let lastSyncMasterEventsTime = 0;
const SYNC_COOLDOWN = 120 * 1000; // 120 detik cooldown

async function syncMasterEvents(force = false) {
  const now = Date.now();
  if (isSyncing || (!force && now - lastSyncMasterEventsTime < SYNC_COOLDOWN)) {
    return;
  }
  isSyncing = true;
  lastSyncMasterEventsTime = now;

  try {
    const masterEvents = await getEventsStore().catch(() => []);
    if (!masterEvents || !masterEvents.length) return;

    const existingEvents = await db.event.findMany({
      select: { id: true, banner: true, logo: true },
    });
    const existingMap = new Map(existingEvents.map((e) => [e.id, e]));

    for (const mEv of masterEvents) {
      if (!mEv.id) continue;
      const parsedDate = mEv.date ? new Date(mEv.date) : null;
      const validDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

      const existing = existingMap.get(mEv.id);
      if (!existing) {
        await db.event.create({
          data: {
            id: mEv.id,
            name: mEv.title || "Event Cetas",
            date: validDate,
            location: mEv.location || "Jakarta",
            logo: (mEv as any).logoUrl || null,
            banner: mEv.bannerUrl || null,
            totalPoints: 5000,
            status: "ACTIVE",
            inputMode: "DIGITAL",
          },
        });
      } else {
        await db.event.update({
          where: { id: mEv.id },
          data: {
            name: mEv.title,
            date: validDate,
            location: mEv.location || "Jakarta",
            banner: mEv.bannerUrl || existing.banner,
            logo: existing.logo || (mEv as any).logoUrl || null,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Auto sync master events to score DB error:", err);
  } finally {
    isSyncing = false;
  }
}

export async function GET(req: Request) {
  // Sync di background tanpa blocking GET request sama sekali
  void syncMasterEvents();
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    /*
     * =====================================================
     * DAFTAR SEMUA EVENT
     * =====================================================
     *
     * Dipakai dashboard/admin untuk:
     * - melihat event lama
     * - memilih event aktif
     *
     * Data event lama TIDAK dihapus.
     */
    if (all) {
      const events = await db.event.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          totalPoints: true,
          logo: true,
          status: true,
          inputMode: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(events);
    }

    /*
     * =====================================================
     * EVENT AKTIF
     * =====================================================
     *
     * Hanya event dengan status ACTIVE yang dipakai
     * oleh konfigurasi kategori, subkategori, materi,
     * peserta, juri, dan review.
     */
    const event = await db.event.findFirst({
      where: {
        status: "ACTIVE",
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        categories: {
          orderBy: {
            sortOrder: "asc",
          },

          include: {
            judgeLinks: {
              orderBy: {
                judgeId: "asc",
              },

              include: {
                judge: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                  },
                },
              },
            },

            subCategories: {
              orderBy: {
                sortOrder: "asc",
              },

              include: {
                criteria: {
                  orderBy: {
                    sortOrder: "asc",
                  },

                  include: {
                    material: true,
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

              include: {
                material: true,
                options: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: "Event aktif belum tersedia.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET EVENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data event.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const inputMode = body.inputMode === "PAPER" ? "PAPER" : "DIGITAL";

    if (!name) {
      return NextResponse.json(
        {
          error: "Nama event wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const event = await db.$transaction(async (tx) => {
      /*
       * Hanya boleh ada SATU event aktif.
       *
       * Event lama dibuat INACTIVE, bukan dihapus.
       */
      await tx.event.updateMany({
        where: {
          status: "ACTIVE",
        },
        data: {
          status: "INACTIVE",
        },
      });

      return tx.event.create({
        data: {
          name,
          date: body.date
            ? new Date(body.date)
            : null,

          location: body.location
            ? String(body.location)
            : null,

          totalPoints: Number(
            body.totalPoints || 5000
          ),

          logo: body.logo ? String(body.logo) : null,

          inputMode,
          status: "ACTIVE",
        },
      });
    });

    return NextResponse.json(event, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat event.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    let id = String(body.id || "").trim();

    // PATCH/PUT dari halaman admin boleh tidak mengirim id;
    // fallback ke event ACTIVE supaya edit identitas tidak gagal.
    if (!id) {
      const activeEvent = await db.event.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      id = activeEvent?.id || "";
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "ID event wajib diisi dan event aktif tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * GANTI EVENT AKTIF
     * =====================================================
     *
     * PUT /api/event
     * {
     *   id: "...",
     *   action: "activate"
     * }
     *
     * Event yang dipilih menjadi ACTIVE.
     * Semua event lainnya menjadi INACTIVE.
     */
    if (body.action === "activate") {
      const event = await db.$transaction(async (tx) => {
        const target = await tx.event.findUnique({
          where: {
            id,
          },
        });

        if (!target) {
          throw new Error("Event tidak ditemukan.");
        }

        await tx.event.updateMany({
          where: {
            status: "ACTIVE",
            id: {
              not: id,
            },
          },
          data: {
            status: "INACTIVE",
          },
        });

        return tx.event.update({
          where: {
            id,
          },
          data: {
            status: "ACTIVE",
          },
        });
      });

      return NextResponse.json(event);
    }

    /*
     * =====================================================
     * EDIT INFORMASI EVENT
     * =====================================================
     */
    const event = await db.event.update({
      where: {
        id,
      },

      data: {
        name: String(
          body.name || ""
        ).trim(),

        date: body.date
          ? new Date(body.date)
          : null,

        location: body.location
          ? String(body.location)
          : null,

        totalPoints: Number(
          body.totalPoints || 5000
        ),

        logo:
          body.logo !== undefined
            ? body.logo
              ? String(body.logo)
              : null
            : undefined,

        banner:
          body.banner !== undefined
            ? body.banner
              ? String(body.banner)
              : null
            : undefined,

        inputMode:
          body.inputMode === undefined
            ? undefined
            : body.inputMode === "PAPER"
              ? "PAPER"
              : "DIGITAL",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui event.",
      },
      {
        status: 500,
      }
    );
  }
}


export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let id = String(body.id || "").trim();

    if (!id) {
      const activeEvent = await db.event.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      id = activeEvent?.id || "";
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID event wajib diisi dan event aktif tidak ditemukan." },
        { status: 400 }
      );
    }

    const totalPoints = Number(body.totalPoints);
    if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
      return NextResponse.json({ error: "Total nilai event harus lebih dari 0." }, { status: 400 });
    }
    const event = await db.event.update({
      where: { id },
      data: {
        name: String(body.name || "").trim(),
        date: body.date ? new Date(body.date) : null,
        location: body.location ? String(body.location) : null,
        totalPoints,
        logo: body.logo !== undefined ? (body.logo ? String(body.logo) : null) : undefined,
        inputMode:
          body.inputMode === undefined
            ? undefined
            : body.inputMode === "PAPER"
              ? "PAPER"
              : "DIGITAL",
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH EVENT ERROR:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui event." }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "ID event wajib diisi." },
        { status: 400 }
      );
    }

    const target = await db.event.findUnique({
      where: { id },
      select: { id: true, name: true, status: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    const eventCount = await db.event.count();

    if (target.status === "ACTIVE" && eventCount > 1) {
      return NextResponse.json(
        {
          error:
            "Event yang sedang aktif tidak dapat dihapus. Aktifkan event lain terlebih dahulu, lalu hapus event ini.",
        },
        { status: 400 }
      );
    }

    await db.event.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Event "${target.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus event.",
      },
      { status: 500 }
    );
  }
}
