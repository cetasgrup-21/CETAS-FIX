
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { regenerateCategoryScoreOptions } from "@/lib/scoring-server";

export const runtime = "nodejs";
export const maxDuration = 300;

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
  const startedAt = Date.now();

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

    const results = [];

    for (const category of categories) {
      const result = await regenerateCategoryScoreOptions(
        category.id
      );

      results.push({
        categoryId: category.id,
        ...result,
      });
    }

    console.info("[REVIEW REFRESH] Completed", {
      eventId: event.id,
      refreshedCategories: results.length,
      totalOptions: results.reduce(
        (sum, item) => sum + item.optionCount,
        0
      ),
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      refreshedCategories: results.length,
      results,
    });
  } catch (error) {
    console.error("REVIEW SCORE REFRESH ERROR:", error);

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
