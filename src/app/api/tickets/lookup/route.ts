import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureOrderTables, StoredTicket } from "@/lib/order-store";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || searchParams.get("email") || searchParams.get("orderNumber") || "").trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { success: false, message: "Masukkan minimal 3 karakter (Email, No. WhatsApp, atau Order ID)" },
        { status: 400 }
      );
    }

    await ensureOrderTables();

    // Query active tickets by holderEmail, orderNumber, or holderPhone
    const cleanQuery = query.toLowerCase();
    const rows = await prisma.$queryRawUnsafe<StoredTicket[]>(
      `SELECT * FROM "CetasTicket"
       WHERE LOWER("holderEmail") = $1
          OR LOWER("orderNumber") = $1
          OR "holderPhone" = $2
          OR "ticketCode" = $2
       ORDER BY "createdAt" DESC
       LIMIT 20`,
      cleanQuery,
      query
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        tickets: [],
        message: "Tidak ditemukan tiket aktif untuk kata kunci ini. Pastikan email atau ID pesanan sudah benar.",
      });
    }

    const ticketsWithQr = await Promise.all(
      rows.map(async (t) => {
        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(t.qrString, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 280,
            color: { dark: "#0F172A", light: "#FFFFFF" },
          });
        } catch {}
        return {
          ...t,
          qrDataUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      query,
      tickets: ticketsWithQr,
    });
  } catch (error: any) {
    console.error("[Ticket Lookup Error]:", error?.message);
    return NextResponse.json(
      { success: false, message: "Gagal mencari data tiket" },
      { status: 500 }
    );
  }
}
