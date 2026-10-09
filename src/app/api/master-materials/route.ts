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

    const materials = await db.masterMaterial.findMany({
      where: {
        status: "ACTIVE",
        ...(category ? { category } : {}),
        ...(section ? { section } : {}),
      },
      orderBy: [
        { section: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      materials,
    });
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
