import { NextRequest, NextResponse } from "next/server";
import { verifyXenditWebhookToken } from "@/lib/xendit";
import { findOrder, markOrderAsPaid, ensureOrderTables } from "@/lib/order-store";
import { prisma } from "@/lib/prisma";
import { logPaymentTrace } from "@/lib/payment-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let notification: Record<string, any> = {};
    try {
      notification = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const callbackToken = req.headers.get("x-callback-token");

    // 1. Verifikasi Autentikasi Webhook Xendit secara Ketat
    if (!callbackToken || !verifyXenditWebhookToken(callbackToken)) {
      logPaymentTrace({
        correlationId: notification.external_id || notification.id || "UNKNOWN_REQ",
        step: "WEBHOOK_AUTH_FAILED",
        error: "Missing or invalid x-callback-token header",
      });
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid x-callback-token" },
        { status: 401 }
      );
    }

    // 2. Ekstraksi Payload Webhook Xendit (Standard Invoice Callback & QR / Ewallet fallback)
    let orderNumber = "";
    let status = "";
    let amountPaid = 0;
    let paymentChannel = "QRIS";
    let gatewayTxId = "";

    if (notification.event === "qr.payment" && notification.data) {
      orderNumber = notification.data.reference_id || "";
      status = (notification.data.status || "").toUpperCase();
      amountPaid = Number(notification.data.amount || 0);
      paymentChannel = "QRIS";
      gatewayTxId = notification.data.id || `XND-QR-${Date.now()}`;
    } else if (notification.event === "ewallet.capture" && notification.data) {
      orderNumber = notification.data.reference_id || "";
      status = (notification.data.status || "").toUpperCase();
      amountPaid = Number(notification.data.charge_amount || 0);
      paymentChannel = notification.data.channel_code || "EWALLET";
      gatewayTxId = notification.data.id || `XND-EW-${Date.now()}`;
    } else {
      // Standard Official Xendit Invoice format
      orderNumber = notification.external_id || notification.order_id || "";
      status = (notification.status || "").toUpperCase();
      amountPaid = Number(notification.paid_amount || notification.amount || 0);
      paymentChannel = notification.payment_method || notification.payment_channel || "QRIS";
      gatewayTxId = notification.id || `XND-INV-${Date.now()}`;
    }

    logPaymentTrace({
      correlationId: orderNumber || gatewayTxId,
      step: "WEBHOOK_AUTHENTICATED",
      xenditInvoiceId: gatewayTxId,
      statusBefore: status,
      amountReceived: amountPaid,
      paymentMethod: paymentChannel,
      message: `Webhook received for ${orderNumber || "Dashboard Ping"} with status ${status}`,
    });

    if (!orderNumber) {
      return NextResponse.json(
        { success: true, message: "Ping webhook diterima tanpa referensi order" },
        { status: 200 }
      );
    }

    // 3. Deteksi Uji Coba dari Dashboard Xendit ("Tes dan Simpan")
    const isDashboardTest =
      orderNumber.includes("123124123") ||
      orderNumber.includes("testing_id") ||
      orderNumber.startsWith("test-");

    if (isDashboardTest) {
      return NextResponse.json(
        {
          success: true,
          message: "Xendit dashboard webhook test ping acknowledged",
          orderNumber,
          status,
        },
        { status: 200 }
      );
    }

    // 4. Cari Pesanan di Database PostgreSQL Supabase
    const order = await findOrder(orderNumber);

    if (!order) {
      logPaymentTrace({
        correlationId: orderNumber,
        step: "TRANSACTION_MISMATCH",
        message: `Order ${orderNumber} not found in database`,
      });
      // Berikan respons 200 agar Xendit tidak terus melakukan retry loop untuk data yang memang tidak ada
      return NextResponse.json(
        { success: true, message: "Order tidak ditemukan di sistem, acknowledged" },
        { status: 200 }
      );
    }

    // 5. Evaluasi Status Pembayaran
    const isPaid =
      status === "PAID" ||
      status === "SETTLED" ||
      status === "COMPLETED" ||
      status === "SUCCEEDED";

    if (isPaid) {
      // Validasi Nominal Pembayaran (Mencegah Underpayment & Tampering)
      if (order.totalAmount > 0 && amountPaid < order.totalAmount) {
        logPaymentTrace({
          correlationId: orderNumber,
          step: "TRANSACTION_MISMATCH",
          amountExpected: order.totalAmount,
          amountReceived: amountPaid,
          error: `Underpayment detected: expected ${order.totalAmount}, got ${amountPaid}`,
        });
        return NextResponse.json(
          { success: false, message: "Nominal pembayaran tidak sesuai dengan total tagihan" },
          { status: 200 }
        );
      }

      logPaymentTrace({
        correlationId: orderNumber,
        step: "TRANSACTION_MATCHED",
        amountExpected: order.totalAmount,
        amountReceived: amountPaid,
        statusBefore: order.paymentStatus,
      });

      // Tandai order sebagai PAID dan terbitkan e-tiket secara atomik & idempoten
      const settlement = await markOrderAsPaid(order.orderNumber, {
        gatewayTxId,
        paymentChannel,
        amountPaid: amountPaid || order.totalAmount,
        rawPayload: rawBody,
      });

      logPaymentTrace({
        correlationId: orderNumber,
        step: "DATABASE_UPDATED",
        statusBefore: order.paymentStatus,
        statusAfter: "PAID",
        ticketsCount: settlement.tickets.length,
        message: settlement.alreadyPaid
          ? "Order already paid previously, idempotency preserved"
          : "Order successfully marked as PAID",
      });

      if (settlement.tickets.length > 0) {
        logPaymentTrace({
          correlationId: orderNumber,
          step: "TICKETS_ISSUED",
          ticketsCount: settlement.tickets.length,
        });
      }
    } else if (status === "EXPIRED") {
      await ensureOrderTables();
      await prisma.$executeRawUnsafe(
        `UPDATE "CetasOrder" SET "paymentStatus" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
        order.orderNumber
      );
      logPaymentTrace({
        correlationId: orderNumber,
        step: "ORDER_EXPIRED",
        statusBefore: order.paymentStatus,
        statusAfter: "EXPIRED",
      });
    } else if (status === "FAILED" || status === "CANCELLED") {
      await ensureOrderTables();
      await prisma.$executeRawUnsafe(
        `UPDATE "CetasOrder" SET "paymentStatus" = 'CANCELLED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
        order.orderNumber
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      status: isPaid ? "PAID" : status,
      paymentGateway: "XENDIT",
    });
  } catch (error: any) {
    console.error("[Xendit Webhook Processing Error]:", error?.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
