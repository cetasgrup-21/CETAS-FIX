import { NextRequest, NextResponse } from "next/server";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;
    const transactionId = notification.transaction_id;

    // 1. Verifikasi Signature Midtrans untuk keamanan
    const isValidSignature = verifyMidtransSignature(orderId, statusCode, grossAmount, signatureKey);
    if (!isValidSignature) {
      console.error(`[Midtrans Webhook] Invalid signature key for Order ${orderId}`);
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // 2. Ambil data order dari database
    const order = await (prisma as any).order.findUnique({
      where: { orderNumber: orderId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      console.warn(`[Midtrans Webhook] Order ${orderId} not found in database`);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3. Evaluasi status transaksi Midtrans
    let newPaymentStatus: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        newPaymentStatus = "PAID";
      }
    } else if (transactionStatus === "settlement") {
      newPaymentStatus = "PAID";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny") {
      newPaymentStatus = "CANCELLED";
    } else if (transactionStatus === "expire") {
      newPaymentStatus = "EXPIRED";
    } else if (transactionStatus === "pending") {
      newPaymentStatus = "PENDING";
    }

    // 4. Update status pembayaran di database
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: newPaymentStatus },
      });

      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          gatewayTransactionId: transactionId,
          paymentType: paymentType,
          amountPaid: parseFloat(grossAmount),
          status: newPaymentStatus,
          payloadJson: JSON.stringify(notification),
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
        update: {
          gatewayTransactionId: transactionId,
          paymentType: paymentType,
          status: newPaymentStatus,
          payloadJson: JSON.stringify(notification),
          settledAt: newPaymentStatus === "PAID" ? new Date() : null,
        },
      });

      // Jika pembayaran sukses dan merupakan Cetas Vote, tambahkan total vote ke kandidat
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

      // Catat ke audit log
      await tx.auditLog.create({
        data: {
          action: `PAYMENT_${newPaymentStatus}`,
          entityName: "Order",
          entityId: order.id,
          detailsJson: JSON.stringify({
            orderNumber: order.orderNumber,
            orderType: order.orderType,
            amount: grossAmount,
            paymentType,
          }),
        },
      });
    });

    return NextResponse.json({ message: "Webhook processed successfully", status: newPaymentStatus }, { status: 200 });
  } catch (error) {
    console.error("[Midtrans Webhook Error]:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
