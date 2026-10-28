import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterEventId = searchParams.get("eventId");

    // 1. Global aggregate dari CetasOrder & CetasTicket
    const [globalOrders, totalTicketsRow, usedTicketsRow, paidOrdersWithEvents] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ orderType: string; count: number; sumAmount: number }>>(`
        SELECT 
          "orderType",
          COUNT(*)::int as count,
          COALESCE(SUM("totalAmount"), 0)::float as "sumAmount"
        FROM "CetasOrder"
        WHERE "paymentStatus" = 'PAID'
        GROUP BY "orderType"
      `).catch(() => []),

      prisma.$queryRawUnsafe<Array<{ count: number }>>(`
        SELECT COUNT(*)::int as count
        FROM "CetasTicket"
        WHERE "status" IN ('ACTIVE', 'USED')
      `).catch(() => [{ count: 0 }]),

      prisma.$queryRawUnsafe<Array<{ count: number }>>(`
        SELECT COUNT(*)::int as count
        FROM "CetasTicket"
        WHERE "status" = 'USED'
      `).catch(() => [{ count: 0 }]),

      // 2. Transaksi berbayar beserta event mapping
      prisma.$queryRawUnsafe<Array<{
        orderNumber: string;
        orderType: string;
        totalAmount: number;
        paymentStatus: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        paymentChannel: string;
        createdAt: Date;
        eventId: string;
        eventName: string;
      }>>(`
        SELECT 
          o."orderNumber", 
          o."orderType", 
          o."totalAmount", 
          o."paymentStatus", 
          o."customerName", 
          o."customerEmail", 
          o."customerPhone", 
          o."paymentChannel", 
          o."createdAt",
          COALESCE(t."eventId", o."metadata"->>'eventId', 'ev-unknown') as "eventId",
          COALESCE(t."eventName", o."metadata"->>'eventTitle', 'Event Cetas') as "eventName"
        FROM "CetasOrder" o
        LEFT JOIN LATERAL (
          SELECT "eventId", "eventName" 
          FROM "CetasTicket" tk 
          WHERE tk."orderNumber" = o."orderNumber" 
          LIMIT 1
        ) t ON true
        WHERE o."paymentStatus" = 'PAID'
        ORDER BY o."createdAt" DESC
      `).catch(() => []),
    ]);

    // Hitung KPI Global
    let ticketOmzet = 0;
    let voteOmzet = 0;
    let prodOmzet = 0;
    let votesCount = 0;

    for (const row of globalOrders) {
      if (row.orderType === "TICKET") {
        ticketOmzet += Number(row.sumAmount) || 0;
      } else if (row.orderType === "VOTE") {
        voteOmzet += Number(row.sumAmount) || 0;
        votesCount += Number(row.count) || 0;
      } else if (row.orderType === "PRODUCT") {
        prodOmzet += Number(row.sumAmount) || 0;
      }
    }

    const totalOmzet = ticketOmzet + voteOmzet + prodOmzet;
    const ticketsSold = totalTicketsRow[0]?.count || 0;
    const ticketsCheckedIn = usedTicketsRow[0]?.count || 0;

    // 3. Ambil data tiket per event untuk breakdown mendalam
    const ticketsPerEvent = await prisma.$queryRawUnsafe<Array<{
      eventId: string;
      eventName: string;
      tierName: string;
      totalCount: number;
      usedCount: number;
    }>>(`
      SELECT 
        "eventId",
        "eventName",
        COALESCE("tierName", 'Regular') as "tierName",
        COUNT(*)::int as "totalCount",
        COUNT(CASE WHEN "status" = 'USED' THEN 1 END)::int as "usedCount"
      FROM "CetasTicket"
      GROUP BY "eventId", "eventName", "tierName"
    `).catch(() => []);

    // Bangun breakdown per-event
    const eventMap = new Map<string, {
      eventId: string;
      eventName: string;
      ticketRevenue: number;
      voteRevenue: number;
      totalRevenue: number;
      ticketsSold: number;
      ticketsCheckedIn: number;
      ticketsPending: number;
      tiers: Array<{ tierName: string; sold: number; checkedIn: number }>;
      recentOrders: Array<any>;
    }>();

    // Map tiket
    for (const t of ticketsPerEvent) {
      if (!t.eventId) continue;
      if (!eventMap.has(t.eventId)) {
        eventMap.set(t.eventId, {
          eventId: t.eventId,
          eventName: t.eventName || "Event Cetas",
          ticketRevenue: 0,
          voteRevenue: 0,
          totalRevenue: 0,
          ticketsSold: 0,
          ticketsCheckedIn: 0,
          ticketsPending: 0,
          tiers: [],
          recentOrders: [],
        });
      }
      const ev = eventMap.get(t.eventId)!;
      ev.ticketsSold += Number(t.totalCount) || 0;
      ev.ticketsCheckedIn += Number(t.usedCount) || 0;
      ev.ticketsPending += Math.max(0, (Number(t.totalCount) || 0) - (Number(t.usedCount) || 0));
      ev.tiers.push({
        tierName: t.tierName,
        sold: Number(t.totalCount) || 0,
        checkedIn: Number(t.usedCount) || 0,
      });
    }

    // Map omzet dan recent orders dari paid orders
    for (const o of paidOrdersWithEvents) {
      if (!o.eventId) continue;
      if (!eventMap.has(o.eventId)) {
        eventMap.set(o.eventId, {
          eventId: o.eventId,
          eventName: o.eventName || "Event Cetas",
          ticketRevenue: 0,
          voteRevenue: 0,
          totalRevenue: 0,
          ticketsSold: 0,
          ticketsCheckedIn: 0,
          ticketsPending: 0,
          tiers: [],
          recentOrders: [],
        });
      }
      const ev = eventMap.get(o.eventId)!;
      const amt = Number(o.totalAmount) || 0;
      if (o.orderType === "TICKET") {
        ev.ticketRevenue += amt;
      } else if (o.orderType === "VOTE") {
        ev.voteRevenue += amt;
      }
      ev.totalRevenue += amt;
      if (ev.recentOrders.length < 15) {
        ev.recentOrders.push(o);
      }
    }

    const eventBreakdowns = Array.from(eventMap.values());

    return NextResponse.json({
      success: true,
      finances: {
        totalOmzet,
        ticketOmzet,
        ticketsSold,
        ticketsCheckedIn,
        voteOmzet,
        votesCount,
        prodOmzet,
      },
      eventBreakdowns,
      singleEvent: filterEventId ? eventMap.get(filterEventId) || null : null,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/finances] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
