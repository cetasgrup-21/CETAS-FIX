import { NextRequest, NextResponse } from "next/server";
import { verifyTicketQR } from "@/lib/ticket-security";
import { prisma } from "@/lib/prisma";
import { ensureOrderTables, StoredTicket } from "@/lib/order-store";

export const dynamic = "force-dynamic";

interface CheckedInRecord {
  checkedInAt: Date;
  holderName: string;
  tierName: string;
  eventName: string;
  staffId?: string;
}

// In-memory cache fallback jika offline
const globalForCheckins = globalThis as unknown as {
  cetasCheckedInStore?: Map<string, CheckedInRecord>;
};

export const checkedInStore =
  globalForCheckins.cetasCheckedInStore ?? new Map<string, CheckedInRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForCheckins.cetasCheckedInStore = checkedInStore;
}

function formatWibTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(date)
      .replace(/:/g, ".");
  } catch {
    return date.toLocaleTimeString("id-ID").replace(/:/g, ".");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { qrString, staffId } = await req.json();

    if (!qrString || typeof qrString !== "string") {
      return NextResponse.json(
        { success: false, message: "Kode QR atau tiket tidak ditemukan" },
        { status: 400 }
      );
    }

    const cleanInput = qrString.trim();
    await ensureOrderTables();

    // 1. Ekstrak kode tiket (bisa berupa plain ticket code atau signed HMAC QR payload)
    let extractedTicketCode = cleanInput;
    let isSignedQr = false;

    if (cleanInput.startsWith("ey") || cleanInput.includes(".")) {
      const verification = verifyTicketQR(cleanInput);
      if (verification.valid && verification.data?.ticketCode) {
        extractedTicketCode = verification.data.ticketCode;
        isSignedQr = true;
      }
    }

    // 2. Query ke Database PostgreSQL ("CetasTicket")
    let dbTicket: StoredTicket | null = null;
    try {
      const rows = await prisma.$queryRawUnsafe<StoredTicket[]>(
        `SELECT * FROM "CetasTicket"
         WHERE "ticketCode" = $1
            OR "qrString" = $1
            OR "orderNumber" = $1
            OR "ticketCode" = $2
         LIMIT 1`,
        cleanInput,
        extractedTicketCode
      );
      if (rows && rows.length > 0) {
        dbTicket = rows[0];
      }
    } catch (dbErr) {
      console.warn("[Scanner DB Query Warning]:", dbErr);
    }

    // A. JIKA TIKET TERDAFTAR DI DATABASE POSTGRESQL:
    if (dbTicket) {
      // Periksa apakah sudah pernah check-in
      if (dbTicket.status === "USED") {
        const checkinDate = dbTicket.checkedInAt ? new Date(dbTicket.checkedInAt) : new Date();
        const checkinTimeStr = formatWibTime(checkinDate);

        return NextResponse.json(
          {
            success: false,
            code: "ALREADY_CHECKED_IN",
            message: `Tiket sudah pernah digunakan pada pukul ${checkinTimeStr} WIB! Akses ditolak.`,
            ticketCode: dbTicket.ticketCode,
            holderName: dbTicket.holderName,
            tierName: dbTicket.tierName,
            eventName: dbTicket.eventName,
            checkedInAt: `${checkinTimeStr} WIB`,
            time: `${checkinTimeStr} WIB`,
          },
          { status: 409 }
        );
      }

      // Check-in pertama kali: Update status di database menjadi USED
      const now = new Date();
      const nowWibStr = formatWibTime(now);

      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "CetasTicket"
           SET "status" = 'USED',
               "checkedInAt" = CURRENT_TIMESTAMP
           WHERE "id" = $1`,
          dbTicket.id
        );
      } catch (updateErr) {
        console.error("Failed to update ticket check-in status:", updateErr);
      }

      // Simpan ke memory cache
      checkedInStore.set(dbTicket.ticketCode, {
        checkedInAt: now,
        holderName: dbTicket.holderName,
        tierName: dbTicket.tierName,
        eventName: dbTicket.eventName,
        staffId: staffId || "Gate-01",
      });

      return NextResponse.json({
        success: true,
        code: "CHECKIN_SUCCESS",
        message: "Check-in Berhasil! Silakan masuk ke arena acara.",
        ticket: {
          code: dbTicket.ticketCode,
          holderName: dbTicket.holderName,
          tierName: dbTicket.tierName,
          eventName: dbTicket.eventName,
          checkedInAt: `${nowWibStr} WIB`,
          time: `${nowWibStr} WIB`,
        },
      });
    }

    // B. JIKA TIKET TIDAK DITEMUKAN DI DATABASE, PERIKSA TANDA TANGAN QR (HMAC-SHA256)
    if (isSignedQr) {
      // Cek in-memory check-in
      if (checkedInStore.has(extractedTicketCode)) {
        const prev = checkedInStore.get(extractedTicketCode)!;
        const prevTimeStr = formatWibTime(prev.checkedInAt);
        return NextResponse.json(
          {
            success: false,
            code: "ALREADY_CHECKED_IN",
            message: `Tiket sudah pernah digunakan pada pukul ${prevTimeStr} WIB! Akses ditolak.`,
            ticketCode: extractedTicketCode,
            holderName: prev.holderName,
            tierName: prev.tierName,
            eventName: prev.eventName,
            checkedInAt: `${prevTimeStr} WIB`,
            time: `${prevTimeStr} WIB`,
          },
          { status: 409 }
        );
      }

      const now = new Date();
      const nowWibStr = formatWibTime(now);
      checkedInStore.set(extractedTicketCode, {
        checkedInAt: now,
        holderName: "Pemegang Tiket Tamu",
        tierName: "Tiket Resmi (Valid Digital)",
        eventName: "Event Resmi CETAS",
        staffId: staffId || "Gate-01",
      });

      return NextResponse.json({
        success: true,
        code: "CHECKIN_SUCCESS",
        message: "Check-in Berhasil! Silakan masuk ke arena acara.",
        ticket: {
          code: extractedTicketCode,
          holderName: "Pemegang Tiket Tamu",
          tierName: "Tiket Resmi (Valid Digital)",
          eventName: "Event Resmi CETAS",
          checkedInAt: `${nowWibStr} WIB`,
          time: `${nowWibStr} WIB`,
        },
      });
    }

    // C. JIKA TIDAK DITEMUKAN DAN TANDA TANGAN TIDAK SAH
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_TICKET",
        message: "Tiket tidak terdaftar di database CETAS atau tanda tangan digital palsu! Akses ditolak.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Scanner API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses validasi tiket di gate" },
      { status: 500 }
    );
  }
}
