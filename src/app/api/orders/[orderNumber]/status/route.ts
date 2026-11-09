import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid, getTicketsByOrder } from "@/lib/order-store";
import { queryDokuCheckoutStatus } from "@/lib/doku";
import { logPaymentTrace } from "@/lib/payment-logger";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

declare global {
  // Per-instance throttle prevents the UI's 3-second polling from becoming a
  // DOKU Check Status API request on every poll.
  var __cetasDokuCheckoutStatusChecks: Map<string, number> | undefined;
}

const statusChecks = globalThis.__cetasDokuCheckoutStatusChecks ?? new Map<string, number>();
globalThis.__cetasDokuCheckoutStatusChecks = statusChecks;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber: rawOrderNumber } = await params;
    const orderNumber = rawOrderNumber?.trim();
    if (!orderNumber) return NextResponse.json({ success: false, message: "Nomor pesanan diperlukan" }, { status: 400 });

    let order = await findOrder(orderNumber);
    if (!order) return NextResponse.json({ success: false, message: "Pesanan tidak ditemukan" }, { status: 404 });

    if (order.paymentStatus === "PENDING" && order.paymentGateway === "DOKU") {
      const ageMs = Date.now() - new Date(order.createdAt).getTime();
      const lastCheckAt = statusChecks.get(order.orderNumber) || 0;
      const shouldQueryDoku = ageMs >= 60_000 && Date.now() - lastCheckAt >= 60_000;

      if (shouldQueryDoku) {
        statusChecks.set(order.orderNumber, Date.now());
        try {
          const result = await queryDokuCheckoutStatus(order.orderNumber);
          const amount = Number(result.order?.amount);
          const expectedRequestId = order.metadata?.dokuRequestId;
          const verified =
            result.transaction?.status === "SUCCESS" &&
            result.order?.invoice_number === order.orderNumber &&
            amount === order.totalAmount &&
            (typeof expectedRequestId !== "string" ||
              typeof result.transaction?.original_request_id !== "string" ||
              result.transaction.original_request_id === expectedRequestId);

          if (verified) {
            await markOrderAsPaid(order.orderNumber, {
              amountPaid: amount,
              paymentChannel: result.channel?.id || result.service?.id || "DOKU_CHECKOUT",
              gatewayTxId: result.transaction?.original_request_id,
            });
            order = await findOrder(orderNumber);
          }
        } catch (error) {
          // A status check is a fallback; keep the local PENDING state and let
          // a later poll or signed DOKU notification resolve the order.
          console.warn("[DOKU Checkout status check failed]:", error instanceof Error ? error.message : "unknown error");
        }
      }
    }

    logPaymentTrace({ correlationId: orderNumber, step: "STATUS_CHECK_POLL", statusBefore: order?.paymentStatus });
    const tickets = order?.paymentStatus === "PAID" ? await getTicketsByOrder(order.orderNumber) : [];
    const ticketsWithQr = await Promise.all(tickets.map(async (ticket) => {
      let qrDataUrl = "";
      try { qrDataUrl = await QRCode.toDataURL(ticket.qrString, { errorCorrectionLevel: "M", margin: 1, width: 280 }); } catch {}
      return { ...ticket, qrDataUrl };
    }));

    return NextResponse.json({
      success: true,
      orderNumber: order?.orderNumber,
      isPaid: order?.paymentStatus === "PAID",
      paymentStatus: order?.paymentStatus || "PENDING",
      paymentChannel: order?.paymentChannel || order?.paymentMethod,
      totalAmount: order?.totalAmount,
      settledAt: order?.settledAt,
      tickets: ticketsWithQr,
    });
  } catch (error) {
    console.error("[Order Status API Error]:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "Gagal memeriksa status pesanan" }, { status: 502 });
  }
}
