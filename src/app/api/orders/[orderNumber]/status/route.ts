import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid, getTicketsByOrder, ensureOrderTables } from "@/lib/order-store";
import { getXenditInvoice, getXenditQrCode } from "@/lib/xendit";
import { prisma } from "@/lib/prisma";
import { logPaymentTrace } from "@/lib/payment-logger";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { success: false, message: "Nomor pesanan diperlukan" },
        { status: 400 }
      );
    }

    let order = await findOrder(orderNumber.trim());
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan di database" },
        { status: 404 }
      );
    }

    logPaymentTrace({
      correlationId: order.orderNumber,
      step: "STATUS_CHECK_POLL",
      statusBefore: order.paymentStatus,
      message: `Status poll query for ${order.orderNumber}`,
    });

    // Jika status masih PENDING di database lokal, lakukan verifikasi ganda langsung ke Xendit API
    if (order.paymentStatus === "PENDING") {
      let isVerifiedPaid = false;
      let paymentChannel = order.paymentMethod || "QRIS";
      let amountPaid = order.totalAmount;

      // 1. Cek status Invoice Resmi Xendit
      if (order.xenditInvoiceId) {
        const inv = await getXenditInvoice(order.xenditInvoiceId);
        if (inv && (inv.status === "PAID" || inv.status === "SETTLED")) {
          isVerifiedPaid = true;
          paymentChannel = inv.payment_method || paymentChannel;
          amountPaid = Number(inv.paid_amount || amountPaid);
          logPaymentTrace({
            correlationId: order.orderNumber,
            step: "DOUBLE_VERIFY_SUCCESS",
            xenditInvoiceId: order.xenditInvoiceId,
            message: "Invoice verified as PAID directly via Xendit API",
          });
        } else if (inv && inv.status === "EXPIRED") {
          await ensureOrderTables();
          await prisma.$executeRawUnsafe(
            `UPDATE "CetasOrder" SET "paymentStatus" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
            order.orderNumber
          );
          order.paymentStatus = "EXPIRED";
          logPaymentTrace({
            correlationId: order.orderNumber,
            step: "ORDER_EXPIRED",
            xenditInvoiceId: order.xenditInvoiceId,
            message: "Invoice expired directly from Xendit API",
          });
        }
      }

      // 2. Cek status QR Code jika invoiceId tidak tersedia
      if (!isVerifiedPaid && order.xenditQrId) {
        const qr = await getXenditQrCode(order.xenditQrId);
        if (qr && (qr.status === "COMPLETED" || qr.status === "SUCCEEDED")) {
          isVerifiedPaid = true;
          paymentChannel = "QRIS";
          amountPaid = Number(qr.amount || amountPaid);
        } else if (qr && qr.status === "INACTIVE") {
          await ensureOrderTables();
          await prisma.$executeRawUnsafe(
            `UPDATE "CetasOrder" SET "paymentStatus" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP WHERE "orderNumber" = $1`,
            order.orderNumber
          );
          order.paymentStatus = "EXPIRED";
        }
      }

      // 3. Jika terverifikasi lunas di Xendit, perbarui database dan terbitkan tiket secara atomik
      if (isVerifiedPaid) {
        await markOrderAsPaid(order.orderNumber, {
          paymentChannel,
          amountPaid,
          gatewayTxId: order.xenditInvoiceId || order.xenditQrId,
        });
        order = await findOrder(orderNumber);
      }
    }

    // Jika pembayaran sah dan lunas (PAID), kembalikan e-tiket yang telah diterbitkan
    if (order && order.paymentStatus === "PAID") {
      const dbTickets = await getTicketsByOrder(order.orderNumber);

      const ticketsWithQr = await Promise.all(
        dbTickets.map(async (t) => {
          let qrDataUrl = "";
          try {
            qrDataUrl = await QRCode.toDataURL(t.qrString, {
              errorCorrectionLevel: "M",
              margin: 1,
              width: 280,
              color: { dark: "#0F172A", light: "#FFFFFF" },
            });
          } catch {}
          return {
            ...t,
            qrDataUrl,
          };
        })
      );

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        isPaid: true,
        paymentStatus: "PAID",
        paymentChannel: order.paymentChannel || order.paymentMethod,
        totalAmount: order.totalAmount,
        settledAt: order.settledAt,
        tickets: ticketsWithQr,
      });
    }

    // Jika belum lunas, pastikan TIDAK ADA tiket yang diterbitkan
    return NextResponse.json({
      success: true,
      orderNumber: order?.orderNumber,
      isPaid: false,
      paymentStatus: order?.paymentStatus || "PENDING",
      totalAmount: order?.totalAmount,
      tickets: [],
    });
  } catch (error: any) {
    console.error("[Order Status API Error]:", error?.message);
    return NextResponse.json(
      { success: false, message: "Gagal memeriksa status pesanan" },
      { status: 500 }
    );
  }
}
