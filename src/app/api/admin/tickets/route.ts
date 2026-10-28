import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Ambil daftar tiket penonton berdasarkan eventId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const filterStatus = searchParams.get("status"); // 'ALL' | 'USED' | 'ACTIVE'

    let query = `
      SELECT 
        "id",
        "ticketCode",
        "orderNumber",
        "eventId",
        "eventName",
        "tierId",
        "tierName",
        "holderName",
        "holderEmail",
        "holderPhone",
        "status",
        "checkedInAt",
        "createdAt"
      FROM "CetasTicket"
      WHERE 1=1
    `;
    const params: any[] = [];

    if (eventId) {
      params.push(eventId);
      query += ` AND "eventId" = $${params.length}`;
    }

    if (filterStatus && filterStatus !== "ALL") {
      params.push(filterStatus.toUpperCase());
      query += ` AND "status" = $${params.length}`;
    }

    query += ` ORDER BY "createdAt" DESC`;

    const rawTickets = await prisma.$queryRawUnsafe<Array<{
      id: string;
      ticketCode: string;
      orderNumber: string;
      eventId: string;
      eventName: string;
      tierId: string;
      tierName: string;
      holderName: string;
      holderEmail: string;
      holderPhone: string;
      status: string;
      checkedInAt: Date | null;
      createdAt: Date;
    }>>(query, ...params);

    // Filter search client/server
    const tickets = rawTickets.filter((t) => {
      if (!search) return true;
      return (
        (t.ticketCode && t.ticketCode.toLowerCase().includes(search)) ||
        (t.holderName && t.holderName.toLowerCase().includes(search)) ||
        (t.holderEmail && t.holderEmail.toLowerCase().includes(search)) ||
        (t.holderPhone && t.holderPhone.toLowerCase().includes(search)) ||
        (t.tierName && t.tierName.toLowerCase().includes(search)) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(search))
      );
    });

    const totalTickets = rawTickets.length;
    const attendedCount = rawTickets.filter((t) => t.status === "USED" || t.checkedInAt !== null).length;
    const pendingCount = totalTickets - attendedCount;

    return NextResponse.json({
      success: true,
      totalTickets,
      attendedCount,
      pendingCount,
      attendanceRate: totalTickets > 0 ? Math.round((attendedCount / totalTickets) * 100) : 0,
      tickets,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/tickets] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Toggle kehadiran penonton secara manual oleh petugas gate / admin
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode, isAttended } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, error: "ticketCode wajib diisi." }, { status: 400 });
    }

    const newStatus = isAttended ? "USED" : "ACTIVE";

    let updatedRows: any[] = [];
    if (isAttended) {
      updatedRows = await prisma.$queryRawUnsafe<any[]>(
        `UPDATE "CetasTicket"
         SET "status" = 'USED', "checkedInAt" = CURRENT_TIMESTAMP
         WHERE "ticketCode" = $1 OR "id" = $1
         RETURNING *`,
        ticketCode
      );
    } else {
      updatedRows = await prisma.$queryRawUnsafe<any[]>(
        `UPDATE "CetasTicket"
         SET "status" = 'ACTIVE', "checkedInAt" = NULL
         WHERE "ticketCode" = $1 OR "id" = $1
         RETURNING *`,
        ticketCode
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ success: false, error: "Tiket tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket: updatedRows[0],
      message: isAttended
        ? `Tiket ${ticketCode} berhasil ditandai SUDAH HADIR di gate.`
        : `Tiket ${ticketCode} status kehadiran dibatalkan (BELUM HADIR).`,
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/tickets] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
