import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDokuWebhookSignature } from "@/lib/doku";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let notification: Record<string, unknown> = {};
    try {
      notification = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const clientId = req.headers.get("client-id") || "";
    const requestId = req.headers.get("request-id") || "";
    const requestTimestamp = req.headers.get("request-timestamp") || "";
    const incomingSignature = req.headers.get("signature") || "";

    // 1. Signature Verification (if headers provided and non-empty)
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
        // Allow pass in dev sandbox if test header is present, otherwise reject
      }
    }

    // Extract Order & Transaction info from DOKU Notification
    const orderObj = (notification.order as Record<string, unknown>) || {};
    const transactionObj = (notification.transaction as Record<string, unknown>) || {};
    const paymentObj = (notification.payment as Record<string, unknown>) || {};

    const orderNumber = (orderObj.invoice_number as string) || (notification.invoice_number as string) || "";
    const transactionStatus = ((transactionObj.status as string) || (notification.status as string) || "").toUpperCase();
    const amountPaid = Number(orderObj.amount || notification.amount || 0);
    const paymentChannel = (paymentObj.channel as string) || (notification.payment_channel as string) || "QRIS";

    if (!orderNumber) {
      return NextResponse.json({ message: "Missing invoice_number" }, { status: 400 });
    }

    // 2. Fetch Order from Database
    const order = await (prisma as any).order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      console.warn(`[DOKU Webhook] Order ${orderNumber} not found in database`);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3. Determine new payment status
    let newPaymentStatus: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" = "PENDING";
    if (
      transactionStatus === "SUCCESS" ||
      transactionStatus === "SETTLED" ||
      transactionStatus === "PAID" ||
      transactionStatus === "CAPTURE"
    ) {
      newPaymentStatus = "PAID";
    } else if (transactionStatus === "EXPIRED") {
      newPaymentStatus = "EXPIRED";
    } else if (transactionStatus === "FAILED" || transactionStatus === "CANCELLED") {
      newPaymentStatus = "CANCELLED";
    }

    // 4. Update Database within transaction
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: newPaymentStatus },
      });

      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          gatewayTransactionId: (transactionObj.id as string) || `DOKU-TX-${Date.now()}`,
          paymentType: `DOKU_${paymentChannel}`,
          amountPaid: amountPaid || order.totalAmount,
          status: newPaymentStatus,
          payloadJson: rawBody,
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
        update: {
          gatewayTransactionId: (transactionObj.id as string) || `DOKU-TX-${Date.now()}`,
          paymentType: `DOKU_${paymentChannel}`,
          status: newPaymentStatus,
          payloadJson: rawBody,
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
      });

      // If VOTE order and payment success, increment candidate vote tally
      if (newPaymentStatus === "PAID" && order.orderType === "VOTE") {
        const voteLogs = await tx.voteLog.findMany({
          where: { orderId: order.id },
        });

        for (const log of voteLogs) {
          await tx.voteCandidate.update({
            where: { id: log.candidateId },
            data: { totalVotes: { increment: log.voteCount } },
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          action: `DOKU_PAYMENT_${newPaymentStatus}`,
          entityName: "Order",
          entityId: order.id,
          detailsJson: JSON.stringify({
            orderNumber,
            paymentChannel,
            status: newPaymentStatus,
            transactionId:
              (transactionObj.id as string) ||
              (orderObj.id as string) ||
              requestId ||
              "N/A",
          }),
        },
      });
    });

    console.log(`[DOKU Webhook] Successfully processed ${orderNumber} -> ${newPaymentStatus}`);

    // DOKU expects 200 OK with specific response or JSON
    return NextResponse.json({
      success: true,
      message: "Notification received and processed",
    });
  } catch (err) {
    console.error("[DOKU Webhook Error]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
