import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = clean(searchParams.get("category"));
    const section = clean(searchParams.get("section"));

    // Ambil seluruh master materi aktif secara global (lintas event dan tingkatan)
    const materials = await db.masterMaterial.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        criteria: {
          take: 1,
          select: { interval: true },
        },
      },
      orderBy: [
        { name: "asc" },
      ],
    });

    // Urutkan: yang cocok dengan subkategori/kategori saat ini diletakkan paling atas
    const sorted = [...materials].sort((a, b) => {
      const aMatch =
        (section && a.section.toLowerCase() === section.toLowerCase()) ||
        (category && a.category.toLowerCase() === category.toLowerCase());
      const bMatch =
        (section && b.section.toLowerCase() === section.toLowerCase()) ||
        (category && b.category.toLowerCase() === category.toLowerCase());

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return a.name.localeCompare(b.name);
    });

    // Bersihkan duplikat nama materi agar dropdown riwayat rapi
    const seen = new Set<string>();
    const deduplicated: typeof sorted = [];
    for (const item of sorted) {
      const key = item.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    const formatted = deduplicated.map((m: any) => ({
      id: m.id,
      category: m.category,
      section: m.section,
      name: m.name,
      status: m.status,
      defaultInterval: m.criteria?.[0]?.interval || 2,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET MASTER MATERIAL ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil history materi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = clean(body.category);
    const section = clean(body.section);
    const name = clean(body.name);

    if (!category || !section || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori, sub kategori, dan nama materi wajib diisi.",
        },
        { status: 400 }
      );
    }

    let material = await db.masterMaterial.findFirst({
      where: { category, section, name },
    });

    if (material) {
      material = await db.masterMaterial.update({
        where: { id: material.id },
        data: { status: "ACTIVE" },
      });
    } else {
      material = await db.masterMaterial.create({
        data: {
          category,
          section,
          name,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json(
      { success: true, material },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE MASTER MATERIAL ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan history materi.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = clean(body.id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID materi wajib diisi." },
        { status: 400 }
      );
    }

    const material = await db.masterMaterial.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Materi history tidak ditemukan." },
        { status: 404 }
      );
    }

    // History dinonaktifkan, bukan dihapus, agar criterion lama aman.
    await db.masterMaterial.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({
      success: true,
      message: `"${material.name}" dihapus dari history materi.`,
    });
  } catch (error) {
    console.error("DELETE MASTER MATERIAL ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus history materi.",
      },
      { status: 500 }
    );
  }
}
