import { NextRequest, NextResponse } from "next/server";
import { UnifiedProduct } from "@/lib/production-unified-data";
import { getProductsStore, saveProductsStore } from "@/lib/cetas-store";

export const dynamic = "force-dynamic";

// GET: Ambil seluruh katalog produk & alat sewa dari PostgreSQL CetasStore
export async function GET() {
  const products = await getProductsStore();
  return NextResponse.json(
    {
      success: true,
      total: products.length,
      products,
    },
    {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}

// POST: Tambah Produk / Alat Rental Baru (Super Admin & Prod Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, message: "Nama dan harga produk wajib diisi" },
        { status: 400 }
      );
    }

    const products = await getProductsStore();
    const stockVal = body.stock !== undefined ? Math.max(0, Number(body.stock)) : 1;

    const newProduct: UnifiedProduct = {
      id: body.id || `prod-${Date.now().toString().slice(-6)}`,
      name: body.name,
      category: body.category || "EQUIPMENT",
      subCategory: body.subCategory || "SOUND_SYSTEM",
      price: Number(body.price),
      unit: body.unit || "hari",
      stock: stockVal,
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85",
      description: body.description || "Deskripsi produk Cetas Production.",
      status: stockVal === 0 ? "HABIS" : body.status || "TERSEDIA",
    };

    const nextProducts = [newProduct, ...products.filter((p) => p.id !== newProduct.id)];
    await saveProductsStore(nextProducts);

    return NextResponse.json({
      success: true,
      message: "Produk/alat baru berhasil ditambahkan & disinkronkan!",
      product: newProduct,
      products: nextProducts,
    });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk baru" },
      { status: 500 }
    );
  }
}

// PUT: Edit Produk / Alat yang Ada (Upsert Aman)
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

    const products = await getProductsStore();
    const prodIndex = products.findIndex((p) => p.id === id);

    let updatedProduct: UnifiedProduct;
    if (prodIndex === -1) {
      const stockVal = updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : 1;
      updatedProduct = {
        id,
        name: updates.name || "Produk Cetas Production",
        category: updates.category || "EQUIPMENT",
        subCategory: updates.subCategory || "SOUND_SYSTEM",
        price: Number(updates.price) || 0,
        unit: updates.unit || "hari",
        stock: stockVal,
        imageUrl:
          updates.imageUrl ||
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85",
        description: updates.description || "Deskripsi produk Cetas Production.",
        status: stockVal === 0 ? "HABIS" : updates.status || "TERSEDIA",
      };
      products.unshift(updatedProduct);
    } else {
      const existing = products[prodIndex];
      const nextStock =
        updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : existing.stock;
      updatedProduct = {
        ...existing,
        ...updates,
        id: existing.id,
        price: updates.price !== undefined ? Number(updates.price) : existing.price,
        stock: nextStock,
        status:
          nextStock === 0
            ? "HABIS"
            : updates.status !== undefined
            ? updates.status
            : existing.status === "HABIS" && nextStock > 0
            ? "TERSEDIA"
            : existing.status,
      };
      products[prodIndex] = updatedProduct;
    }

    await saveProductsStore(products);

    return NextResponse.json({
      success: true,
      message: `Produk '${updatedProduct.name}' berhasil diperbarui!`,
      product: updatedProduct,
      products,
    });
  } catch (error) {
    console.error("PUT /api/products error:", error);
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

    const products = await getProductsStore();
    const nextProducts = products.filter((p) => p.id !== id);
    await saveProductsStore(nextProducts);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari katalog Cetas",
      products: nextProducts,
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
