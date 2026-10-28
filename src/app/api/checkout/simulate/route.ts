import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid } from "@/lib/order-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Keamanan: Blokir simulasi jika sistem berada di lingkungan Production
    const isProduction = process.env.XENDIT_IS_PRODUCTION === "true";
    if (isProduction) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Fitur simulasi pembayaran dinonaktifkan secara permanen pada mode Production",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: "Parameter orderNumber diperlukan" },
        { status: 400 }
      );
    }

    const order = await findOrder(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan di database" },
        { status: 404 }
      );
    }

    // 2. Jalankan simulasi pembayaran resmi untuk Test Mode
    const settlement = await markOrderAsPaid(order.orderNumber, {
      gatewayTxId: `SIM_XND_${Date.now()}`,
      paymentChannel: "XENDIT_TEST_SIMULATOR",
      amountPaid: order.totalAmount,
    });

    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran Test Mode berhasil diverifikasi",
      orderNumber: order.orderNumber,
      paymentStatus: "PAID",
      alreadyPaid: settlement.alreadyPaid,
      ticketsIssued: settlement.tickets.length,
    });
  } catch (error) {
    console.error("[Simulate API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses simulasi pembayaran" },
      { status: 500 }
    );
  }
}
