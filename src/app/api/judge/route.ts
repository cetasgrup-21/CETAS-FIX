import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { db } from "@/lib/db";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET() {
  try {
    const [events, judges] = await Promise.all([
      db.event.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          categories: {
            where: { status: "ACTIVE" },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              percentage: true,
              sortOrder: true,
              eventId: true,
            },
          },
        },
      }),
      db.user.findMany({
        where: { role: "JUDGE" },
        orderBy: { createdAt: "asc" },
        include: {
          categoryLinks: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  eventId: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ events, judges });
  } catch (error) {
    console.error("GET JUDGES ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data juri.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = clean(body.action);

    // ============================================================
    // TAMBAH JURI
    // ============================================================
    if (action === "create") {
      const name = clean(body.name);
      const username = clean(body.username).toLowerCase();
      const pin = clean(body.pin);

      if (!name || !username || !pin) {
        return NextResponse.json(
          { error: "Nama, username, dan PIN wajib diisi." },
          { status: 400 }
        );
      }

      if (pin.length < 4) {
        return NextResponse.json(
          { error: "PIN minimal 4 angka." },
          { status: 400 }
        );
      }

      if (!/^\d+$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN hanya boleh berisi angka." },
          { status: 400 }
        );
      }

      const existing = await db.user.findUnique({
        where: { username },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username sudah digunakan." },
          { status: 409 }
        );
      }

      const judge = await db.user.create({
        data: {
          name,
          username,
          pinHash: pinHash(pin),
          role: "JUDGE",
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json(
        { success: true, judge },
        { status: 201 }
      );
    }

    // ============================================================
    // EDIT JURI
    // ============================================================
    if (action === "update") {
      const id = clean(body.id);
      const name = clean(body.name);
      const username = clean(body.username).toLowerCase();
      const pin = clean(body.pin);
      const status = clean(body.status) || "ACTIVE";

      if (!id || !name || !username) {
        return NextResponse.json(
          { error: "ID, nama, dan username wajib diisi." },
          { status: 400 }
        );
      }

      const current = await db.user.findUnique({
        where: { id },
      });

      if (!current || current.role !== "JUDGE") {
        return NextResponse.json(
          { error: "Juri tidak ditemukan." },
          { status: 404 }
        );
      }

      const usernameOwner = await db.user.findUnique({
        where: { username },
      });

      if (usernameOwner && usernameOwner.id !== id) {
        return NextResponse.json(
          { error: "Username sudah digunakan juri lain." },
          { status: 409 }
        );
      }

      const data: {
        name: string;
        username: string;
        status: string;
        pinHash?: string;
      } = {
        name,
        username,
        status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      };

      if (pin) {
        if (!/^\d+$/.test(pin) || pin.length < 4) {
          return NextResponse.json(
            { error: "PIN baru minimal 4 angka dan hanya boleh angka." },
            { status: 400 }
          );
        }

        data.pinHash = pinHash(pin);
      }

      const judge = await db.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        judge,
      });
    }

    // ============================================================
    // AKTIFKAN / NONAKTIFKAN JURI
    // ============================================================
    if (action === "toggle-status") {
      const id = clean(body.id);

      if (!id) {
        return NextResponse.json(
          { error: "ID juri wajib diisi." },
          { status: 400 }
        );
      }

      const judge = await db.user.findUnique({
        where: { id },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          { error: "Juri tidak ditemukan." },
          { status: 404 }
        );
      }

      const updated = await db.user.update({
        where: { id },
        data: {
          status:
            judge.status === "ACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        judge: updated,
      });
    }

    // ============================================================
    // HAPUS JURI
    //
    // Sengaja soft-delete supaya Score lama tidak ikut terhapus.
    // ============================================================
    if (action === "delete") {
      const id = clean(body.id);

      if (!id) {
        return NextResponse.json(
          { error: "ID juri wajib diisi." },
          { status: 400 }
        );
      }

      const judge = await db.user.findUnique({
        where: { id },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          { error: "Juri tidak ditemukan." },
          { status: 404 }
        );
      }

      await db.user.update({
        where: { id },
        data: { status: "INACTIVE" },
      });

      return NextResponse.json({
        success: true,
        message: `Juri "${judge.name}" dinonaktifkan.`,
      });
    }

    // ============================================================
    // PENUGASAN JURI KE KATEGORI PADA EVENT TERTENTU
    //
    // Penting:
    // Hanya assignment pada event yang dipilih yang diganti.
    // Assignment juri di event lain tetap aman.
    // ============================================================
    if (action === "assign") {
      const judgeId = clean(body.judgeId);
      const eventId = clean(body.eventId);
      const categoryIds = Array.isArray(body.categoryIds)
        ? body.categoryIds.map((id: unknown) => clean(id)).filter(Boolean)
        : [];

      if (!judgeId || !eventId) {
        return NextResponse.json(
          { error: "Juri dan event wajib dipilih." },
          { status: 400 }
        );
      }

      const judge = await db.user.findUnique({
        where: { id: judgeId },
      });

      if (!judge || judge.role !== "JUDGE") {
        return NextResponse.json(
          { error: "Juri tidak ditemukan." },
          { status: 404 }
        );
      }

      const event = await db.event.findUnique({
        where: { id: eventId },
        select: { id: true, name: true },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event tidak ditemukan." },
          { status: 404 }
        );
      }

      const categories = await db.category.findMany({
        where: {
          id: { in: categoryIds },
          eventId,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      if (categories.length !== categoryIds.length) {
        return NextResponse.json(
          { error: "Ada kategori yang tidak valid untuk event tersebut." },
          { status: 400 }
        );
      }

      await db.$transaction(async (tx) => {
        await tx.categoryJudge.deleteMany({
          where: {
            judgeId,
            category: {
              eventId,
            },
          },
        });

        if (categoryIds.length > 0) {
          await tx.categoryJudge.createMany({
            data: categoryIds.map((categoryId: string) => ({
              categoryId,
              judgeId,
            })),
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: "Penugasan juri berhasil disimpan.",
      });
    }

    return NextResponse.json(
      { error: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("JUDGE ACTION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memproses data juri.",
      },
      { status: 500 }
    );
  }
}