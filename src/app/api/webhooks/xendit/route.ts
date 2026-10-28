import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXenditWebhookToken } from "@/lib/xendit";

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

    // 1. Verify Xendit Webhook Token
    if (callbackToken && !verifyXenditWebhookToken(callbackToken)) {
      console.warn(`[Xendit Webhook] Unauthorized callback token: ${callbackToken}`);
      return NextResponse.json({ message: "Unauthorized callback token" }, { status: 401 });
    }

    // 2. Extract Order Number & Payment Status
    // Supports Invoice format, QR Code format (event: qr.payment), and E-Wallet format (event: ewallet.capture)
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
      // Standard Xendit Invoice format
      orderNumber = notification.external_id || notification.order_id || "";
      status = (notification.status || "").toUpperCase();
      amountPaid = Number(notification.paid_amount || notification.amount || 0);
      paymentChannel = notification.payment_method || notification.payment_channel || "QRIS";
      gatewayTxId = notification.id || `XND-INV-${Date.now()}`;
    }

    if (!orderNumber) {
      console.log("[Xendit Webhook] No order reference found (likely a dashboard test ping), returning 200 OK");
      return NextResponse.json({ success: true, message: "Test webhook received and acknowledged" }, { status: 200 });
    }

    // Check if this is a dummy test order from Xendit Dashboard "Tes dan simpan"
    const isDashboardTest =
      orderNumber.includes("123124123") ||
      orderNumber.includes("testing_id") ||
      orderNumber.startsWith("test-");

    if (isDashboardTest) {
      console.log(`[Xendit Webhook] Dashboard test ping detected for order: ${orderNumber}, returning 200 OK`);
      return NextResponse.json({
        success: true,
        message: "Xendit dashboard test ping verified successfully",
        orderNumber,
        status,
      }, { status: 200 });
    }

    // 3. Fetch Order from Database
    const order = await (prisma as any).order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      console.warn(`[Xendit Webhook] Order ${orderNumber} not found in database, acknowledging to prevent retry loop`);
      return NextResponse.json({ success: true, message: "Order not found in database, acknowledged" }, { status: 200 });
    }

    // 4. Determine new payment status
    let newPaymentStatus: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" = "PENDING";
    if (
      status === "PAID" ||
      status === "SETTLED" ||
      status === "COMPLETED" ||
      status === "SUCCEEDED"
    ) {
      newPaymentStatus = "PAID";
    } else if (status === "EXPIRED") {
      newPaymentStatus = "EXPIRED";
    } else if (status === "FAILED" || status === "CANCELLED") {
      newPaymentStatus = "CANCELLED";
    }

    // 5. Update Database within transaction
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: newPaymentStatus },
      });

      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          gatewayTransactionId: gatewayTxId,
          paymentType: `XENDIT_${paymentChannel}`,
          amountPaid: amountPaid || order.totalAmount,
          status: newPaymentStatus,
          payloadJson: rawBody,
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
        update: {
          gatewayTransactionId: gatewayTxId,
          paymentType: `XENDIT_${paymentChannel}`,
          status: newPaymentStatus,
          amountPaid: amountPaid || order.totalAmount,
          payloadJson: rawBody,
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
      });

      // Jika status PAID dan order TIKET, aktifkan tiket
      if (newPaymentStatus === "PAID" && order.orderType === "TICKET") {
        await tx.ticket.updateMany({
          where: { orderId: order.id },
          data: { status: "ACTIVE" },
        });
      }

      // Jika status PAID dan order VOTE, masukkan poin/suara
      if (newPaymentStatus === "PAID" && order.orderType === "VOTE") {
        const voteLogs = await tx.voteLog.findMany({
          where: { orderId: order.id },
        });

        for (const log of voteLogs) {
          const candidate = await tx.participant.findUnique({
            where: { id: log.candidateId },
          });

          if (candidate) {
            await tx.participant.update({
              where: { id: log.candidateId },
              data: {
                voteCount: {
                  increment: log.voteCount,
                },
              },
            });
          }
        }
      }
    });

    console.log(`[Xendit Webhook] Order ${orderNumber} successfully updated to status: ${newPaymentStatus}`);
    return NextResponse.json({
      success: true,
      orderNumber,
      status: newPaymentStatus,
      paymentGateway: "XENDIT",
    });
  } catch (error) {
    console.error("[Xendit Webhook Processing Error]:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
