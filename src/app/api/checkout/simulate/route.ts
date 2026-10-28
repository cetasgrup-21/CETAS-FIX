import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Simulasi pelunasan lokal dinonaktifkan demi integritas audit pembayaran. Gunakan tautan Checkout Resmi Xendit untuk melakukan simulasi transaksi resmi yang terhubung langsung dengan Webhook Xendit.",
    },
    { status: 400 }
  );
}
