import { NextRequest, NextResponse } from "next/server";
import { verifyXenditWebhookToken } from "@/lib/xendit";
import { findOrder, markOrderAsPaid, ensureOrderTables } from "@/lib/order-store";
import { prisma } from "@/lib/prisma";

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

    // 1. Verifikasi Xendit Webhook Token (Signature/Security Token)
    if (callbackToken && !verifyXenditWebhookToken(callbackToken)) {
      console.warn(`[Xendit Webhook] Unauthorized callback token: ${callbackToken}`);
      return NextResponse.json({ message: "Unauthorized callback token" }, { status: 401 });
    }

    // 2. Ekstrak data transaksi Xendit (Invoice format, QR Code event, atau eWallet event)
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

    // 3. Cari pesanan di tabel CetasOrder database PostgreSQL
    const order = await findOrder(orderNumber);

    if (!order) {
      console.warn(`[Xendit Webhook] Order ${orderNumber} not found in database, acknowledging to prevent retry loop`);
      return NextResponse.json({ success: true, message: "Order not found in database, acknowledged" }, { status: 200 });
    }

    // 4. Verifikasi nominal pembayaran: pastikan jumlah yang dibayar tidak kurang dari total tagihan pesanan
    if (amountPaid > 0 && amountPaid < order.totalAmount) {
      console.error(
        `[Xendit Webhook Security Alert] Underpayment detected for ${orderNumber}: expected ${order.totalAmount}, received ${amountPaid}`
      );
      return NextResponse.json(
        { success: false, message: "Nominal pembayaran tidak sesuai (underpayment)" },
        { status: 200 }
      );
    }

    // 5. Tentukan status pembayaran
    const isPaid =
      status === "PAID" ||
      status === "SETTLED" ||
      status === "COMPLETED" ||
      status === "SUCCEEDED";

    if (isPaid) {
      // Tandai order sebagai PAID dan terbitkan e-tiket secara atomik & idempoten
      const settlement = await markOrderAsPaid(order.orderNumber, {
        gatewayTxId,
        paymentChannel,
        amountPaid: amountPaid || order.totalAmount,
        rawPayload: rawBody,
      });

      console.log(
        `[Xendit Webhook] Order ${orderNumber} verified and marked as PAID. Tickets issued: ${settlement.tickets.length}. Already paid previously: ${settlement.alreadyPaid}`
      );
    } else if (status === "EXPIRED") {
      await ensureOrderTables();
      await prisma.$executeRawUnsafe(
        `UPDATE "CetasOrder" SET "paymentStatus" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
        order.orderNumber
      );
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
  } catch (error) {
    console.error("[Xendit Webhook Processing Error]:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
