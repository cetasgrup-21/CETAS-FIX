import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureOrderTables, StoredTicket } from "@/lib/order-store";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

function maskName(name: string): string {
  if (!name) return "***";
  return name
    .split(" ")
    .map((w) => (w.length > 2 ? w[0] + "***" + w[w.length - 1] : w[0] + "***"))
    .join(" ");
}

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [user, domain] = email.split("@");
  const maskedUser = user.length > 2 ? user[0] + "***" + user[user.length - 1] : user[0] + "***";
  return `${maskedUser}@${domain}`;
}

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 6) return "0812****";
  const clean = phone.replace(/\D/g, "");
  return clean.slice(0, 4) + "****" + clean.slice(-3);
}

function formatWhatsAppLink(
  phone: string,
  holderName: string,
  eventName: string,
  tierName: string,
  orderNumber: string
): string {
  let clean = (phone || "").replace(/\D/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.slice(1);
  if (!clean.startsWith("62")) clean = "62" + clean;

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cetas.co.id");

  const msg =
    `*CETAS E-TICKET RESMI* 🎟️\n` +
    `Halo *${holderName}*,\n\n` +
    `Berikut akses tiket resmi Anda:\n` +
    `📍 Acara: *${eventName}*\n` +
    `🎫 Kategori: *${tierName}*\n` +
    `🔢 No. Pesanan: *${orderNumber}*\n\n` +
    `Buka dan simpan QR Code tiket masuk Anda pada tautan resmi berikut:\n` +
    `🔗 ${appBaseUrl}/order/${orderNumber}/success\n\n` +
    `Tunjukkan QR Code pada tautan di atas kepada petugas scan di pintu masuk venue. Terima kasih!`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (
      searchParams.get("query") ||
      searchParams.get("email") ||
      searchParams.get("orderNumber") ||
      ""
    ).trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Masukkan minimal 3 karakter (Email, No. WhatsApp, atau Order ID)",
        },
        { status: 400 }
      );
    }

    await ensureOrderTables();

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
        message: "Tidak ditemukan tiket aktif untuk data ini. Pastikan email atau Order ID sudah sesuai.",
      });
    }

    // PENCEGAHAN PENCURIAN TIKET:
    // Jika dicari menggunakan Order ID spesifik -> Dianggap Pemilik Asli yang memegang bukti transaksi
    const isAuthorizedByOrderId = rows.some(
      (r) => r.orderNumber.toLowerCase() === cleanQuery || r.ticketCode.toLowerCase() === cleanQuery
    );

    const processedTickets = await Promise.all(
      rows.map(async (t) => {
        const isAuthorized = isAuthorizedByOrderId;

        let qrDataUrl = "";
        if (isAuthorized) {
          try {
            qrDataUrl = await QRCode.toDataURL(t.qrString, {
              errorCorrectionLevel: "M",
              margin: 1,
              width: 280,
              color: { dark: "#0F172A", light: "#FFFFFF" },
            });
          } catch {}
        }

        const waUrl = formatWhatsAppLink(
          t.holderPhone || "",
          t.holderName,
          t.eventName,
          t.tierName,
          t.orderNumber
        );

        return {
          id: t.id,
          orderNumber: isAuthorized ? t.orderNumber : `${t.orderNumber.slice(0, 10)}...`,
          rawOrderNumber: isAuthorized ? t.orderNumber : undefined,
          eventName: t.eventName,
          tierName: t.tierName,
          ticketCode: isAuthorized ? t.ticketCode : "CETAS-TCK-***-***",
          holderName: isAuthorized ? t.holderName : maskName(t.holderName),
          holderEmail: isAuthorized ? t.holderEmail : maskEmail(t.holderEmail),
          holderPhoneMasked: maskPhone(t.holderPhone),
          hasPhone: !!t.holderPhone && t.holderPhone.length >= 8,
          status: t.status,
          isAuthorized,
          isProtected: !isAuthorized,
          qrDataUrl: isAuthorized ? qrDataUrl : "",
          whatsappUrl: waUrl,
          createdAt: t.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      query,
      isProtected: !isAuthorizedByOrderId,
      protectionNotice: !isAuthorizedByOrderId
        ? "Demi perlindungan dari pencurian tiket, QR Code hanya dapat dikirim langsung ke WhatsApp terdaftar atau dibuka menggunakan Nomor Pesanan (Order ID)."
        : undefined,
      tickets: processedTickets,
    });
  } catch (error: any) {
    console.error("[Ticket Lookup Error]:", error?.message);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pencarian tiket" },
      { status: 500 }
    );
  }
}
