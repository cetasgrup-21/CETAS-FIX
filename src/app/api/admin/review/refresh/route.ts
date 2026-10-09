import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { regenerateCategoryScoreOptions } from "@/lib/scoring-server";

/*
 * =========================================================
 * CETAS SCORE - REFRESH REVIEW
 * =========================================================
 *
 * /api/event tetap dibiarkan seperti versi awal.
 * Endpoint ini hanya memastikan ScoreOption di database dihitung
 * ulang sebelum halaman Review membaca data event terbaru.
 *
 * Dipakai oleh Admin Review, bukan oleh Juri.
 * =========================================================
 */

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

export async function POST(req: Request) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Belum login.",
        },
        { status: 401 }
      );
    }

    if (
      session.role !== "OPERATOR" &&
      session.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses hanya untuk Admin/Operator.",
        },
        { status: 403 }
      );
    }

    const event = await db.event.findFirst({
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
          success: false,
          error: "Event aktif belum tersedia.",
        },
        { status: 404 }
      );
    }

    const categories = await db.category.findMany({
      where: {
        eventId: event.id,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
      },
    });

    // Jalankan generator yang sama dengan endpoint Juri.
    // Sengaja sequential agar aman untuk SQLite dan menghindari
    // concurrent write/"database is locked" ketika banyak kategori.
    for (const category of categories) {
      await regenerateCategoryScoreOptions(category.id);
    }

    return NextResponse.json({
      success: true,
      eventId: event.id,
      refreshedCategories: categories.length,
    });
  } catch (error) {
    console.error(
      "REVIEW SCORE REFRESH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui konfigurasi nilai.",
      },
      { status: 500 }
    );
  }
}
