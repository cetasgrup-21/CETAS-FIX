import { NextRequest, NextResponse } from "next/server";
import { verifyTicketQR } from "@/lib/ticket-security";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { qrString, staffId } = await req.json();

    if (!qrString) {
      return NextResponse.json({ success: false, message: "Kode QR tidak ditemukan" }, { status: 400 });
    }

    // 1. Verifikasi tanda tangan digital QR Code
    const verification = verifyTicketQR(qrString);
    if (!verification.valid || !verification.data) {
      return NextResponse.json(
        {
          success: false,
          code: "FORGERY_DETECTED",
          message: verification.error || "Tanda tangan digital QR Code tidak sah!",
        },
        { status: 400 }
      );
    }

    const { ticketCode } = verification.data;

    // 2. Ambil data tiket dari database
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

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          code: "TICKET_NOT_FOUND",
          message: "Tiket tidak terdaftar di sistem Cetas.",
        },
        { status: 404 }
      );
    }

    // 3. Pastikan pembayaran tiket sudah settlement/paid
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

    // 4. Periksa apakah sudah pernah check-in sebelumnya
    if (ticket.isCheckedIn) {
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_CHECKED_IN",
          message: `Tiket sudah pernah digunakan pada ${ticket.checkedInAt?.toLocaleString("id-ID")}`,
          holderName: ticket.holderName,
          ticketCode: ticket.ticketCode,
          tierName: ticket.tier.name,
          eventName: ticket.tier.event.title,
        },
        { status: 409 }
      );
    }

    // 5. Lakukan Check-in sukses
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date(),
        checkedInById: staffId || null,
      },
    });

    // Catat log scanner
    await prisma.auditLog.create({
      data: {
        action: "TICKET_CHECKIN_SUCCESS",
        entityName: "Ticket",
        entityId: ticket.id,
        detailsJson: JSON.stringify({
          ticketCode: ticket.ticketCode,
          holderName: ticket.holderName,
          eventName: ticket.tier.event.title,
        }),
      },
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
  } catch (error) {
    console.error("[Scanner API Error]:", error);
    return NextResponse.json({ success: false, message: "Gagal memproses validasi tiket" }, { status: 500 });
  }
}
