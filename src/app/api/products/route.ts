import { NextRequest, NextResponse } from "next/server";
import { INITIAL_UNIFIED_PRODUCTS, UnifiedProduct } from "@/lib/production-unified-data";

// Global cache for unified products
declare global {
  var __cetasUnifiedProducts: UnifiedProduct[] | undefined;
}

if (!global.__cetasUnifiedProducts) {
  global.__cetasUnifiedProducts = [...INITIAL_UNIFIED_PRODUCTS];
}

// GET: Ambil seluruh katalog produk & alat sewa
export async function GET() {
  return NextResponse.json({
    success: true,
    total: global.__cetasUnifiedProducts?.length || 0,
    products: global.__cetasUnifiedProducts,
  });
}

// POST: Tambah Produk / Alat Rental Baru (Super Admin & Prod Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, message: "Nama dan harga produk wajib diisi" },
        { status: 400 }
      );
    }

    const newProduct: UnifiedProduct = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: body.name,
      category: body.category || "EQUIPMENT",
      subCategory: body.subCategory || "SOUND_SYSTEM",
      price: Number(body.price),
      unit: body.unit || "hari",
      stock: body.stock !== undefined ? Number(body.stock) : 1,
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
      description: body.description || "Deskripsi produk Cetas Production.",
      status: body.status || "TERSEDIA",
    };

    global.__cetasUnifiedProducts?.unshift(newProduct);

    return NextResponse.json({
      success: true,
      message: "Produk/alat baru berhasil ditambahkan!",
      product: newProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk baru" },
      { status: 500 }
    );
  }
}

// PUT: Edit Produk / Alat yang Ada
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID produk wajib disertakan" },
        { status: 400 }
      );
    }

    const prodIndex = global.__cetasUnifiedProducts?.findIndex((p) => p.id === id);
    if (prodIndex === undefined || prodIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = global.__cetasUnifiedProducts![prodIndex];
    const updatedProduct: UnifiedProduct = {
      ...existing,
      ...updates,
      id: existing.id,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
    };

    global.__cetasUnifiedProducts![prodIndex] = updatedProduct;

    return NextResponse.json({
      success: true,
      message: `Produk '${updatedProduct.name}' berhasil diperbarui!`,
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Produk
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID produk wajib disertakan" },
        { status: 400 }
      );
    }

    global.__cetasUnifiedProducts = global.__cetasUnifiedProducts?.filter((p) => p.id !== id);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari katalog Cetas",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
