import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid, getTicketsByOrder } from "@/lib/order-store";
import { getXenditInvoice, getXenditQrCode } from "@/lib/xendit";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    if (!orderNumber) {
      return NextResponse.json({ success: false, message: "Nomor pesanan diperlukan" }, { status: 400 });
    }

    let order = await findOrder(orderNumber);
    if (!order) {
      return NextResponse.json({ success: false, message: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Jika status masih PENDING, lakukan verifikasi ganda langsung ke Xendit API
    if (order.paymentStatus === "PENDING") {
      let isVerifiedPaid = false;
      let paymentChannel = order.paymentMethod || "QRIS";
      let amountPaid = order.totalAmount;

      // 1. Cek status Invoice Xendit jika ada
      if (order.xenditInvoiceId) {
        const inv = await getXenditInvoice(order.xenditInvoiceId);
        if (inv && (inv.status === "PAID" || inv.status === "SETTLED")) {
          isVerifiedPaid = true;
          paymentChannel = inv.payment_method || paymentChannel;
          amountPaid = Number(inv.paid_amount || amountPaid);
        } else if (inv && inv.status === "EXPIRED") {
          // Update status expired
          order.paymentStatus = "EXPIRED";
        }
      }

      // 2. Cek status QR Code Xendit jika ada
      if (!isVerifiedPaid && order.xenditQrId) {
        const qr = await getXenditQrCode(order.xenditQrId);
        if (qr && (qr.status === "COMPLETED" || qr.status === "SUCCEEDED")) {
          isVerifiedPaid = true;
          paymentChannel = "QRIS";
          amountPaid = Number(qr.amount || amountPaid);
        } else if (qr && qr.status === "INACTIVE") {
          order.paymentStatus = "EXPIRED";
        }
      }

      // Jika terverifikasi lunas di Xendit, perbarui database dan terbitkan tiket secara atomik
      if (isVerifiedPaid) {
        await markOrderAsPaid(order.orderNumber, {
          paymentChannel,
          amountPaid,
          gatewayTxId: order.xenditInvoiceId || order.xenditQrId,
        });
        order = await findOrder(orderNumber);
      }
    }

    // Jika pembayaran sah dan lunas (PAID), kembalikan tiket yang terverifikasi
    if (order && order.paymentStatus === "PAID") {
      const dbTickets = await getTicketsByOrder(order.orderNumber);

      // Generate data URL untuk setiap QR Code tiket
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

    // Jika belum lunas, TIDAK ADA TIKET yang diterbitkan
    return NextResponse.json({
      success: true,
      orderNumber: order?.orderNumber,
      isPaid: false,
      paymentStatus: order?.paymentStatus || "PENDING",
      totalAmount: order?.totalAmount,
      tickets: [],
    });
  } catch (error) {
    console.error("[Order Status API Error]:", error);
    return NextResponse.json({ success: false, message: "Gagal memeriksa status pesanan" }, { status: 500 });
  }
}
