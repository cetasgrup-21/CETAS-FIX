import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid } from "@/lib/order-store";
import { verifyDokuWebhookSignature } from "@/lib/doku";
import { logPaymentTrace } from "@/lib/payment-logger";

export const dynamic = "force-dynamic";

interface DokuCheckoutNotification {
  order?: { invoice_number?: string; amount?: string | number };
  transaction?: {
    status?: string;
    original_request_id?: string;
    date?: string;
  };
  channel?: { id?: string };
  service?: { id?: string };
}

function acknowledgeNotification() {
  return NextResponse.json({ message: "SUCCESS" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const url = new URL(req.url);
  const requestTarget = `${url.pathname}${url.search}`;
  const clientId = req.headers.get("client-id") || "";
  const requestId = req.headers.get("request-id") || "";
  const requestTimestamp = req.headers.get("request-timestamp") || "";
  const signature = req.headers.get("signature") || "";

  const isValid = verifyDokuWebhookSignature({
    clientId,
    requestId,
    requestTimestamp,
    requestTarget,
    body: rawBody,
    signature,
  });
  if (!isValid) {
    logPaymentTrace({
      correlationId: requestId || "DOKU_WEBHOOK",
      step: "WEBHOOK_AUTH_FAILED",
      error: "Invalid DOKU Checkout notification signature",
    });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let notification: DokuCheckoutNotification;
  try {
    notification = JSON.parse(rawBody) as DokuCheckoutNotification;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const orderNumber = notification.order?.invoice_number;
  const status = notification.transaction?.status?.toUpperCase();
  const amountPaid = Number(notification.order?.amount);
  if (!orderNumber || !status || !Number.isFinite(amountPaid)) {
    return NextResponse.json({ message: "Incomplete DOKU notification" }, { status: 400 });
  }

  try {
    const order = await findOrder(orderNumber);
    if (!order || order.paymentGateway !== "DOKU") {
      // Authenticated but unrelated or legacy notification: acknowledge without settlement.
      return acknowledgeNotification();
    }

    const expectedRequestId = order.metadata?.dokuRequestId;
    const notificationRequestId = notification.transaction?.original_request_id;
    if (
      amountPaid !== order.totalAmount ||
      (typeof expectedRequestId === "string" &&
        typeof notificationRequestId === "string" &&
        expectedRequestId !== notificationRequestId)
    ) {
      logPaymentTrace({
        correlationId: orderNumber,
        step: "TRANSACTION_MISMATCH",
        amountExpected: order.totalAmount,
        amountReceived: amountPaid,
        error: "DOKU Checkout invoice, amount, or request reference mismatch",
      });
      return NextResponse.json({ message: "Transaction mismatch" }, { status: 409 });
    }

    // DOKU Checkout allows customers to retry another method; do not treat a
    // FAILED notification as final. Only signed SUCCESS events settle orders.
    if (status === "SUCCESS") {
      const settlement = await markOrderAsPaid(order.orderNumber, {
        amountPaid,
        paymentChannel: notification.channel?.id || notification.service?.id || "DOKU_CHECKOUT",
        gatewayTxId: notificationRequestId || requestId,
        rawPayload: rawBody,
      });
      logPaymentTrace({
        correlationId: orderNumber,
        step: "DOKU_ORDER_SETTLED",
        message: settlement.alreadyPaid ? "Duplicate success notification acknowledged" : undefined,
        amountExpected: order.totalAmount,
        amountReceived: amountPaid,
        statusBefore: order.paymentStatus,
        statusAfter: "PAID",
        ticketsCount: settlement.tickets.length,
      });
    }

    return acknowledgeNotification();
  } catch (error) {
    console.error("[DOKU Checkout Webhook Error]:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ message: "Notification processing failed" }, { status: 500 });
  }
}
