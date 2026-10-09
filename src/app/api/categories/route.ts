import { NextResponse } from "next/server";

import { db } from "@/lib/db";

async function activeEvent() {
  return db.event.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

async function getLevelForEvent(eventId: string, eventLevelId: string | null) {
  if (!eventLevelId) return null;

  const level = await db.eventLevel.findFirst({
    where: {
      id: eventLevelId,
      eventId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  });

  if (!level) {
    throw new Error("Tingkatan kategori tidak ditemukan pada event ini.");
  }

  if (level.status !== "ACTIVE") {
    throw new Error("Tingkatan yang dipilih sedang nonaktif.");
  }

  return level;
}

/*
 * Total bobot efektif untuk satu tingkatan:
 *   kategori global + kategori khusus tingkatan.
 *
 * Kategori global (eventLevelId = null) berlaku untuk semua tingkatan.
 */
async function effectiveWeight(eventId: string, eventLevelId: string | null) {
  const categories = await db.category.findMany({
    where: {
      eventId,
      OR: [
        { eventLevelId: null },
        ...(eventLevelId ? [{ eventLevelId }] : []),
      ],
    },
    select: {
      id: true,
      percentage: true,
      eventLevelId: true,
    },
  });

  return categories.reduce(
    (sum, category) => sum + Number(category.percentage || 0),
    0
  );
}

async function validateGlobalWeight(
  eventId: string,
  nextPercentage: number,
  ignoreId?: string
) {
  const levels = await db.eventLevel.findMany({
    where: {
      eventId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  /*
   * Kalau belum ada tingkatan, cukup validasi terhadap kategori global.
   */
  if (levels.length === 0) {
    const currentGlobal = await db.category.aggregate({
      where: {
        eventId,
        eventLevelId: null,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      _sum: { percentage: true },
    });

    if ((currentGlobal._sum.percentage || 0) + nextPercentage > 100.000001) {
      throw new Error(
        `Total bobot kategori umum tidak boleh lebih dari 100%. Saat ini akan menjadi ${
          (currentGlobal._sum.percentage || 0) + nextPercentage
        }%.`
      );
    }

    return;
  }

  for (const level of levels) {
    const currentSpecific = await db.category.aggregate({
      where: {
        eventId,
        eventLevelId: level.id,
      },
      _sum: { percentage: true },
    });

    const currentGlobal = await db.category.aggregate({
      where: {
        eventId,
        eventLevelId: null,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      _sum: { percentage: true },
    });

    /*
     * ignoreId hanya bisa menjadi kategori global ketika fungsi ini
     * dipakai dari PATCH global. Jika ignoreId adalah kategori khusus,
     * currentSpecific di atas masih harus mengecualikannya.
     */
    let specific = currentSpecific._sum.percentage || 0;

    if (ignoreId) {
      const ignored = await db.category.findUnique({
        where: { id: ignoreId },
        select: { eventLevelId: true, percentage: true },
      });

      if (ignored?.eventLevelId === level.id) {
        specific -= Number(ignored.percentage || 0);
      }
    }

    const total =
      (currentGlobal._sum.percentage || 0) + specific + nextPercentage;

    if (total > 100.000001) {
      throw new Error(
        `Total bobot untuk tingkatan ${level.id} tidak boleh lebih dari 100%. Total setelah perubahan: ${total}%.`
      );
    }
  }
}

export async function POST(req: Request) {
  try {
    const event = await activeEvent();

    if (!event) {
      return NextResponse.json(
        { error: "Belum ada event aktif." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const name = clean(body.name);
    const percentage = Number(body.percentage);
    const eventLevelId = body.eventLevelId
      ? clean(body.eventLevelId)
      : null;

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Bobot kategori harus antara 1 sampai 100." },
        { status: 400 }
      );
    }

    try {
      await getLevelForEvent(event.id, eventLevelId);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Tingkatan kategori tidak valid.",
        },
        { status: 400 }
      );
    }

    /*
     * Kategori khusus:
     *   global + kategori khusus tingkatan <= 100.
     *
     * Kategori global:
     *   global baru + kategori khusus setiap tingkatan <= 100.
     */
    if (eventLevelId) {
      const current = await effectiveWeight(event.id, eventLevelId);

      if (current + percentage > 100.000001) {
        return NextResponse.json(
          {
            error: `Total bobot untuk tingkatan ini tidak boleh lebih dari 100%. Saat ini ${current}%, tambahan ${percentage}% akan menjadi ${current + percentage}%.`,
          },
          { status: 400 }
        );
      }
    } else {
      try {
        await validateGlobalWeight(event.id, percentage);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Total bobot kategori umum tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    const count = await db.category.count({
      where: {
        eventId: event.id,
        eventLevelId,
      },
    });

    const category = await db.category.create({
      data: {
        eventId: event.id,
        eventLevelId,
        name,
        percentage,
        sortOrder: count + 1,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan kategori.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = clean(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori wajib diisi." },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { id },
      select: {
        id: true,
        eventId: true,
        eventLevelId: true,
        name: true,
        percentage: true,
        sortOrder: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const name =
      body.name !== undefined ? clean(body.name) : category.name;
    const nextPercentage =
      body.percentage !== undefined
        ? Number(body.percentage)
        : Number(category.percentage);

    const nextEventLevelId =
      body.eventLevelId !== undefined
        ? body.eventLevelId
          ? clean(body.eventLevelId)
          : null
        : category.eventLevelId;

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(nextPercentage) ||
      nextPercentage <= 0 ||
      nextPercentage > 100
    ) {
      return NextResponse.json(
        { error: "Bobot kategori harus antara 1 sampai 100." },
        { status: 400 }
      );
    }

    try {
      await getLevelForEvent(category.eventId, nextEventLevelId);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Tingkatan kategori tidak valid.",
        },
        { status: 400 }
      );
    }

    if (nextEventLevelId) {
      /*
       * Kategori ini akan menjadi bagian dari:
       * global + khusus tingkatan.
       *
       * Hitung semua kategori lain pada scope tersebut.
       */
      const others = await db.category.aggregate({
        where: {
          eventId: category.eventId,
          id: { not: id },
          OR: [
            { eventLevelId: null },
            { eventLevelId: nextEventLevelId },
          ],
        },
        _sum: { percentage: true },
      });

      const total = (others._sum.percentage || 0) + nextPercentage;

      if (total > 100.000001) {
        return NextResponse.json(
          {
            error: `Total bobot untuk tingkatan ini tidak boleh lebih dari 100%. Total setelah perubahan: ${total}%.`,
          },
          { status: 400 }
        );
      }
    } else {
      /*
       * Kategori global berlaku ke semua tingkatan.
       * Pastikan tidak membuat salah satu tingkatan melewati 100%.
       */
      try {
        await validateGlobalWeight(
          category.eventId,
          nextPercentage,
          id
        );
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Total bobot kategori umum tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        name,
        percentage: nextPercentage,
        eventLevelId: nextEventLevelId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengubah kategori.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = clean(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori wajib diisi." },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus kategori.",
      },
      { status: 500 }
    );
  }
}
