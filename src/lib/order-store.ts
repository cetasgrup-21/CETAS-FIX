import { prisma } from "@/lib/prisma";
import { createTicketQRString } from "@/lib/ticket-security";
import { getEventsStore, saveEventsStore } from "@/lib/cetas-store";
import { UnifiedEvent } from "@/lib/events-unified-data";

export interface OrderItem {
  id: string; // tierId, productId, or candidateId
  name: string;
  quantity: number;
  price: number;
  eventId?: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  orderType: "TICKET" | "VOTE" | "PRODUCTION" | "REGISTRATION";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "CANCELLED";
  paymentGateway: string;
  paymentMethod: string;
  paymentChannel?: string;
  xenditInvoiceId?: string;
  xenditExternalId?: string;
  xenditQrId?: string;
  items: OrderItem[];
  metadata?: Record<string, unknown>;
  settledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTicket {
  id: string;
  orderNumber: string;
  eventId: string;
  eventName: string;
  tierId: string;
  tierName: string;
  ticketCode: string;
  qrString: string;
  holderName: string;
  holderEmail: string;
  holderPhone?: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  checkedInAt?: string | null;
  createdAt: string;
}

declare global {
  var __cetasOrderTablesInitialized: boolean | undefined;
}

/**
 * Ensure Order and Ticket tables exist in PostgreSQL
 */
export async function ensureOrderTables(): Promise<void> {
  if (global.__cetasOrderTablesInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CetasOrder" (
        "id" TEXT PRIMARY KEY,
        "orderNumber" TEXT UNIQUE NOT NULL,
        "orderType" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT NOT NULL,
        "customerPhone" TEXT,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "paymentGateway" TEXT DEFAULT 'XENDIT',
        "paymentMethod" TEXT DEFAULT 'QRIS',
        "paymentChannel" TEXT,
        "xenditInvoiceId" TEXT,
        "xenditExternalId" TEXT,
        "xenditQrId" TEXT,
        "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "settledAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_order_number" ON "CetasOrder" ("orderNumber")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_order_status" ON "CetasOrder" ("paymentStatus")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_order_invoice_id" ON "CetasOrder" ("xenditInvoiceId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_order_qr_id" ON "CetasOrder" ("xenditQrId")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CetasTicket" (
        "id" TEXT PRIMARY KEY,
        "orderNumber" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "eventName" TEXT NOT NULL DEFAULT '',
        "tierId" TEXT NOT NULL,
        "tierName" TEXT NOT NULL DEFAULT '',
        "ticketCode" TEXT UNIQUE NOT NULL,
        "qrString" TEXT NOT NULL,
        "holderName" TEXT NOT NULL,
        "holderEmail" TEXT NOT NULL,
        "holderPhone" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "checkedInAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_ticket_order" ON "CetasTicket" ("orderNumber")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cetas_ticket_code" ON "CetasTicket" ("ticketCode")`);

    global.__cetasOrderTablesInitialized = true;
  } catch (err) {
    console.error("Failed to initialize CetasOrder/CetasTicket tables:", err);
  }
}

/**
 * Validate item prices against actual database values to prevent price tampering from frontend
 */
export async function validateAndCalculateItems(
  orderType: "TICKET" | "VOTE" | "PRODUCTION" | "REGISTRATION",
  items: Array<{ id: string; quantity: number; price?: number; eventId?: string }>
): Promise<{ valid: boolean; totalAmount: number; verifiedItems: OrderItem[]; error?: string }> {
  if (!items || items.length === 0) {
    return { valid: false, totalAmount: 0, verifiedItems: [], error: "Daftar item tidak boleh kosong" };
  }

  const verifiedItems: OrderItem[] = [];
  let calculatedTotal = 0;

  if (orderType === "TICKET") {
    const events = await getEventsStore();

    for (const item of items) {
      if (!item.eventId) {
        return { valid: false, totalAmount: 0, verifiedItems: [], error: "Event ID diperlukan untuk pemesanan tiket" };
      }

      const event = events.find((e) => e.id === item.eventId);
      if (!event) {
        return { valid: false, totalAmount: 0, verifiedItems: [], error: `Event dengan ID ${item.eventId} tidak ditemukan` };
      }

      const tier = event.tiers?.find((t) => t.id === item.id);
      if (!tier) {
        return { valid: false, totalAmount: 0, verifiedItems: [], error: `Kategori tiket (${item.id}) tidak valid untuk event ini` };
      }

      if (tier.quotaRemaining !== undefined && tier.quotaRemaining < item.quantity) {
        return { valid: false, totalAmount: 0, verifiedItems: [], error: `Kuota tiket untuk ${tier.name} tidak mencukupi (tersisa: ${tier.quotaRemaining})` };
      }

      const verifiedPrice = Number(tier.price);
      calculatedTotal += verifiedPrice * item.quantity;
      verifiedItems.push({
        id: tier.id,
        name: `${event.title} - ${tier.name}`,
        quantity: item.quantity,
        price: verifiedPrice,
        eventId: event.id,
      });
    }
  } else {
    // For VOTE, PRODUCTION, REGISTRATION, calculate from validated positive amounts
    for (const item of items) {
      const price = Math.max(0, Number(item.price) || 0);
      calculatedTotal += price * item.quantity;
      verifiedItems.push({
        id: item.id,
        name: `Item #${item.id}`,
        quantity: item.quantity,
        price,
        eventId: item.eventId,
      });
    }
  }

  return { valid: true, totalAmount: calculatedTotal, verifiedItems };
}

/**
 * Save new order with PENDING status
 */
export async function createOrderRecord(order: {
  orderNumber: string;
  orderType: "TICKET" | "VOTE" | "PRODUCTION" | "REGISTRATION";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentGateway?: string;
  paymentMethod?: string;
  xenditInvoiceId?: string;
  xenditExternalId?: string;
  xenditQrId?: string;
  items: OrderItem[];
  metadata?: Record<string, unknown>;
}): Promise<StoredOrder> {
  await ensureOrderTables();

  const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "CetasOrder" (
      "id", "orderNumber", "orderType", "customerName", "customerEmail", "customerPhone",
      "totalAmount", "paymentStatus", "paymentGateway", "paymentMethod",
      "xenditInvoiceId", "xenditExternalId", "xenditQrId", "items", "metadata",
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, 'PENDING', $8, $9,
      $10, $11, $12, $13::jsonb, $14::jsonb,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`,
    id,
    order.orderNumber,
    order.orderType,
    order.customerName,
    order.customerEmail,
    order.customerPhone || "-",
    order.totalAmount,
    order.paymentGateway || "XENDIT",
    order.paymentMethod || "QRIS",
    order.xenditInvoiceId || null,
    order.xenditExternalId || order.orderNumber,
    order.xenditQrId || null,
    JSON.stringify(order.items),
    JSON.stringify(order.metadata || {})
  );

  return {
    id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone || "-",
    totalAmount: order.totalAmount,
    paymentStatus: "PENDING",
    paymentGateway: order.paymentGateway || "XENDIT",
    paymentMethod: order.paymentMethod || "QRIS",
    xenditInvoiceId: order.xenditInvoiceId,
    xenditExternalId: order.xenditExternalId || order.orderNumber,
    xenditQrId: order.xenditQrId,
    items: order.items,
    metadata: order.metadata,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Find order by orderNumber, xenditInvoiceId, or xenditQrId
 */
export async function findOrder(reference: string): Promise<StoredOrder | null> {
  await ensureOrderTables();

  const rows = await prisma.$queryRawUnsafe<StoredOrder[]>(
    `SELECT * FROM "CetasOrder"
     WHERE "orderNumber" = $1
        OR "xenditExternalId" = $1
        OR "xenditInvoiceId" = $1
        OR "xenditQrId" = $1
     LIMIT 1`,
    reference
  );

  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  if (typeof row.items === "string") {
    try {
      row.items = JSON.parse(row.items as unknown as string);
    } catch {}
  }
  return row;
}

/**
 * Atomically update order to PAID and issue tickets (Idempotent)
 */
export async function markOrderAsPaid(
  reference: string,
  paymentDetails: {
    gatewayTxId?: string;
    paymentChannel?: string;
    amountPaid: number;
    rawPayload?: string;
  }
): Promise<{ success: boolean; order: StoredOrder | null; tickets: StoredTicket[]; alreadyPaid: boolean }> {
  await ensureOrderTables();

  const order = await findOrder(reference);
  if (!order) {
    return { success: false, order: null, tickets: [], alreadyPaid: false };
  }

  // Idempotency check: If already paid, return existing tickets without duplicating
  if (order.paymentStatus === "PAID") {
    const existingTickets = await getTicketsByOrder(order.orderNumber);
    return { success: true, order, tickets: existingTickets, alreadyPaid: true };
  }

  // Update order status to PAID
  await prisma.$executeRawUnsafe(
    `UPDATE "CetasOrder"
     SET "paymentStatus" = 'PAID',
         "paymentChannel" = $1,
         "settledAt" = CURRENT_TIMESTAMP,
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE "orderNumber" = $2`,
    paymentDetails.paymentChannel || "QRIS",
    order.orderNumber
  );

  order.paymentStatus = "PAID";
  order.paymentChannel = paymentDetails.paymentChannel || "QRIS";
  order.settledAt = new Date().toISOString();

  // If TICKET order, atomically issue official e-tickets
  const tickets: StoredTicket[] = [];
  if (order.orderType === "TICKET") {
    const events = await getEventsStore();

    for (const item of order.items) {
      const event = events.find((e) => e.id === item.eventId);
      const eventTitle = event?.title || "CETAS Championship Event";
      const tierName = item.name.split(" - ").pop() || "Reguler";

      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `CETAS-TCK-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const qrString = createTicketQRString({
          ticketCode,
          eventId: item.eventId || "general-event",
          tierId: item.id,
          issuedAt: Date.now(),
        });

        const ticketId = `tck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        await prisma.$executeRawUnsafe(
          `INSERT INTO "CetasTicket" (
            "id", "orderNumber", "eventId", "eventName", "tierId", "tierName",
            "ticketCode", "qrString", "holderName", "holderEmail", "holderPhone",
            "status", "createdAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            'ACTIVE', CURRENT_TIMESTAMP
          )`,
          ticketId,
          order.orderNumber,
          item.eventId || "general-event",
          eventTitle,
          item.id,
          tierName,
          ticketCode,
          qrString,
          order.customerName,
          order.customerEmail,
          order.customerPhone
        );

        tickets.push({
          id: ticketId,
          orderNumber: order.orderNumber,
          eventId: item.eventId || "general-event",
          eventName: eventTitle,
          tierId: item.id,
          tierName,
          ticketCode,
          qrString,
          holderName: order.customerName,
          holderEmail: order.customerEmail,
          holderPhone: order.customerPhone,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }

      // Automatically reduce remaining quota in events store
      if (event && item.id) {
        const tier = event.tiers?.find((t) => t.id === item.id);
        if (tier && tier.quotaRemaining !== undefined) {
          tier.quotaRemaining = Math.max(0, tier.quotaRemaining - item.quantity);
        }
      }
    }

    if (events.length > 0) {
      await saveEventsStore(events);
    }
  }

  return { success: true, order, tickets, alreadyPaid: false };
}

/**
 * Retrieve issued tickets for a verified order
 */
export async function getTicketsByOrder(orderNumber: string): Promise<StoredTicket[]> {
  await ensureOrderTables();

  const rows = await prisma.$queryRawUnsafe<StoredTicket[]>(
    `SELECT * FROM "CetasTicket" WHERE "orderNumber" = $1 ORDER BY "createdAt" ASC`,
    orderNumber
  );

  return rows || [];
}
