import { NextRequest, NextResponse } from "next/server";
import { verifyTicketQR } from "@/lib/ticket-security";
import { prisma } from "@/lib/prisma";

interface CheckedInRecord {
  checkedInAt: Date;
  holderName: string;
  tierName: string;
  eventName: string;
  staffId?: string;
}

// Global in-memory store agar status check-in tiket persisten di server Next.js
const globalForCheckins = globalThis as unknown as {
  cetasCheckedInStore?: Map<string, CheckedInRecord>;
};

export const checkedInStore =
  globalForCheckins.cetasCheckedInStore ?? new Map<string, CheckedInRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForCheckins.cetasCheckedInStore = checkedInStore;
}

export async function POST(req: NextRequest) {
  try {
    const { qrString, staffId } = await req.json();

    if (!qrString) {
      return NextResponse.json({ success: false, message: "Kode QR tidak ditemukan" }, { status: 400 });
    }

    // 1. Verifikasi tanda tangan digital QR Code secara kriptografi (HMAC-SHA256)
    const verification = verifyTicketQR(qrString);
    if (!verification.valid || !verification.data) {
      return NextResponse.json(
        {
          success: false,
          code: "FORGERY_DETECTED",
          message: verification.error || "Tanda tangan digital QR Code tidak sah! Kemungkinan tiket palsu.",
        },
        { status: 400 }
      );
    }

    const { ticketCode } = verification.data;

    // 2. Periksa apakah tiket sudah pernah digunakan (In-Memory Check)
    if (checkedInStore.has(ticketCode)) {
      const prev = checkedInStore.get(ticketCode)!;
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_CHECKED_IN",
          message: `Tiket sudah pernah digunakan pada pukul ${prev.checkedInAt.toLocaleTimeString("id-ID")} WIB! Akses ditolak.`,
          holderName: prev.holderName,
          ticketCode: ticketCode,
          tierName: prev.tierName,
          eventName: prev.eventName,
          checkedInAt: prev.checkedInAt.toLocaleTimeString("id-ID"),
        },
        { status: 409 }
      );
    }

    // 3. Periksa ke database PostgreSQL jika aktif
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { ticketCode },
        include: {
          tier: {
            include: {
              event: true,
            },
          },
          order: true,
        },
      });

      if (ticket) {
        // Cek pembayaran lunas
        if (ticket.order.paymentStatus !== "PAID") {
          return NextResponse.json(
            {
              success: false,
              code: "UNPAID_TICKET",
              message: `Pembayaran tiket ini belum lunas (Status: ${ticket.order.paymentStatus}).`,
            },
            { status: 400 }
          );
        }

        // Cek status check-in database
        if (ticket.isCheckedIn) {
          const checkinTimeStr = ticket.checkedInAt?.toLocaleTimeString("id-ID") || "sebelumnya";
          // Sync ke in-memory store
          checkedInStore.set(ticketCode, {
            checkedInAt: ticket.checkedInAt || new Date(),
            holderName: ticket.holderName,
            tierName: ticket.tier.name,
            eventName: ticket.tier.event.title,
            staffId: ticket.checkedInById || staffId,
          });

          return NextResponse.json(
            {
              success: false,
              code: "ALREADY_CHECKED_IN",
              message: `Tiket sudah pernah digunakan pada pukul ${checkinTimeStr} WIB! Akses ditolak.`,
              holderName: ticket.holderName,
              ticketCode: ticket.ticketCode,
              tierName: ticket.tier.name,
              eventName: ticket.tier.event.title,
            },
            { status: 409 }
          );
        }

        // Update database: tiket digunakan
        const updatedTicket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            isCheckedIn: true,
            checkedInAt: new Date(),
            checkedInById: staffId || null,
          },
        });

        // Simpan ke in-memory store
        checkedInStore.set(ticketCode, {
          checkedInAt: updatedTicket.checkedInAt!,
          holderName: updatedTicket.holderName,
          tierName: ticket.tier.name,
          eventName: ticket.tier.event.title,
          staffId,
        });

        return NextResponse.json({
          success: true,
          code: "CHECKIN_SUCCESS",
          message: "Check-in berhasil! Silakan masuk.",
          ticket: {
            code: updatedTicket.ticketCode,
            holderName: updatedTicket.holderName,
            tierName: ticket.tier.name,
            eventName: ticket.tier.event.title,
            checkedInAt: updatedTicket.checkedInAt,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Scanner DB Offline]: Menggunakan in-memory store untuk validasi tiket", dbErr);
    }

    // 4. Catat check-in pertama kali ke in-memory store (Mode Offline / Dev)
    const checkinTime = new Date();
    checkedInStore.set(ticketCode, {
      checkedInAt: checkinTime,
      holderName: "Pemegang Tiket Resmi",
      tierName: "Festival All Access Pass",
      eventName: "Cetas SoundFest 2026",
      staffId: staffId || "Gate-01",
    });

    return NextResponse.json({
      success: true,
      code: "CHECKIN_SUCCESS",
      message: "Check-in Berhasil! Silakan masuk ke arena acara.",
      ticket: {
        code: ticketCode,
        holderName: "Pemegang Tiket Resmi",
        tierName: "Festival All Access Pass",
        eventName: "Cetas SoundFest 2026",
        checkedInAt: checkinTime,
      },
    });
  } catch (error) {
    console.error("[Scanner API Error]:", error);
    return NextResponse.json({ success: false, message: "Gagal memproses validasi tiket" }, { status: 500 });
  }
}
