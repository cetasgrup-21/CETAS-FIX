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

    // Ambil master materi & kriteria interval secara paralel dan flat (super cepat <20ms)
    const [materials, recentCriteria] = await Promise.all([
      db.masterMaterial.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          id: true,
          category: true,
          section: true,
          name: true,
          status: true,
        },
        orderBy: { name: "asc" },
      }),
      db.criterion.findMany({
        where: {
          materialId: { not: null },
          interval: { not: null },
        },
        select: {
          materialId: true,
          interval: true,
        },
        take: 300,
        orderBy: { id: "desc" },
      }),
    ]);

    const intervalMap = new Map<string, number>();
    for (const c of recentCriteria) {
      if (c.materialId && c.interval && !intervalMap.has(c.materialId)) {
        intervalMap.set(c.materialId, c.interval);
      }
    }

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
      defaultInterval: intervalMap.get(m.id) || 2,
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
    const name = clean(body.name);

    if (!id && !name) {
      return NextResponse.json(
        { success: false, error: "ID atau nama materi wajib diisi." },
        { status: 400 }
      );
    }

    let targetName = name;
    if (!targetName && id) {
      const found = await db.masterMaterial.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
      if (found) {
        targetName = found.name;
      }
    }

    // Nonaktifkan SEMUA entri master material dengan ID ini
    if (id) {
      await db.masterMaterial.updateMany({
        where: { id },
        data: { status: "INACTIVE" },
      });
    }

    // Dan nonaktifkan SEMUA entri master material dengan NAMA yang sama (case-insensitive)
    // agar materi benar-benar hilang dari seluruh riwayat dan tidak muncul lagi
    if (targetName) {
      await db.masterMaterial.updateMany({
        where: {
          name: {
            equals: targetName.trim(),
            mode: "insensitive",
          },
        },
        data: { status: "INACTIVE" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `"${targetName || "Materi"}" berhasil dihapus dari riwayat.`,
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
