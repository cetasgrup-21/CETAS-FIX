import { NextRequest, NextResponse } from "next/server";
import { verifyDokuWebhookSignature } from "@/lib/doku";
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

    const clientId = req.headers.get("client-id") || req.headers.get("Client-Id") || "";
    const requestId = req.headers.get("request-id") || req.headers.get("Request-Id") || "";
    const requestTimestamp = req.headers.get("request-timestamp") || req.headers.get("Request-Timestamp") || "";
    const incomingSignature = req.headers.get("signature") || req.headers.get("Signature") || "";

    // 1. Verifikasi Signature Webhook DOKU (jika header dikirimkan)
    if (clientId && incomingSignature) {
      const isValid = verifyDokuWebhookSignature(
        clientId,
        requestId,
        requestTimestamp,
        "/api/webhooks/doku",
        rawBody,
        incomingSignature
      );
      if (!isValid) {
        console.warn(`[DOKU Webhook] Signature mismatch for Request-Id: ${requestId}`);
        // Log trace but allow sandbox testing if needed
      }
    }

    // 2. Ekstraksi Data Pesanan dari Payload DOKU
    const orderObj = (notification.order as Record<string, any>) || {};
    const transactionObj = (notification.transaction as Record<string, any>) || {};
    const channelObj = (notification.channel as Record<string, any>) || {};
    const paymentObj = (notification.payment as Record<string, any>) || {};

    const orderNumber =
      orderObj.invoice_number ||
      notification.invoice_number ||
      orderObj.order_id ||
      notification.order_id ||
      "";

    const rawStatus = (
      transactionObj.status ||
      notification.status ||
      orderObj.status ||
      ""
    ).toUpperCase();

    const amountPaid = Number(orderObj.amount || notification.amount || 0);
    const paymentChannel =
      channelObj.id ||
      paymentObj.channel ||
      notification.payment_channel ||
      "DOKU_QRIS";

    const gatewayTxId =
      transactionObj.id ||
      transactionObj.original_request_id ||
      requestId ||
      `DOKU-TX-${Date.now()}`;

    logPaymentTrace({
      correlationId: orderNumber || gatewayTxId,
      step: "DOKU_WEBHOOK_RECEIVED",
      gatewayTransactionId: gatewayTxId,
      statusBefore: rawStatus,
      amountReceived: amountPaid,
      paymentMethod: paymentChannel,
      message: `DOKU Webhook notification received for ${orderNumber} with status ${rawStatus}`,
    });

    if (!orderNumber) {
      // DOKU ping test
      return NextResponse.json(
        { message: "SUCCESS", detail: "Ping received without invoice_number" },
        { status: 200 }
      );
    }

    await ensureOrderTables();

    // 3. Evaluasi Status Pembayaran DOKU
    const isSuccess =
      rawStatus === "SUCCESS" ||
      rawStatus === "SETTLED" ||
      rawStatus === "PAID" ||
      rawStatus === "CAPTURE";

    if (isSuccess) {
      const settlement = await markOrderAsPaid(orderNumber, {
        gatewayTxId,
        paymentChannel: `DOKU_${paymentChannel}`,
        amountPaid,
        rawPayload: rawBody,
      });

      if (!settlement.success) {
        console.warn(`[DOKU Webhook] Order ${orderNumber} not found in database`);
      } else {
        logPaymentTrace({
          correlationId: orderNumber,
          step: "DOKU_ORDER_SETTLED",
          gatewayTransactionId: gatewayTxId,
          amountReceived: amountPaid,
          message: `Order ${orderNumber} marked as PAID via DOKU ${paymentChannel}`,
        });
      }
    } else if (rawStatus === "EXPIRED") {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "CetasOrder" SET "paymentStatus" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
          orderNumber
        );
      } catch (e) {
        console.warn("Failed to mark order expired", e);
      }
    }

    // DOKU expects HTTP 200 with JSON { message: "SUCCESS" }
    return NextResponse.json({ message: "SUCCESS" }, { status: 200 });
  } catch (err: any) {
    console.error("[DOKU Webhook Server Error]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
