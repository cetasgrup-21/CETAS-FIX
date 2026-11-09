import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid } from "@/lib/order-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isProduction =
      process.env.DOKU_IS_PRODUCTION === "true" ||
      (process.env.NODE_ENV === "production" && process.env.DOKU_ENV === "production");

    if (isProduction) {
      return NextResponse.json(
        {
          success: false,
          message: "Simulasi pembayaran hanya tersedia di lingkungan DOKU Sandbox / Development.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const orderNumber = String(body.orderNumber || "").trim();

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

    const settlement = await markOrderAsPaid(order.orderNumber, {
      gatewayTxId: `SIM_DOKU_${Date.now()}`,
      paymentChannel: body.paymentChannel || "DOKU_SANDBOX_SIMULATOR",
      amountPaid: order.totalAmount,
    });

    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran DOKU Sandbox berhasil diverifikasi!",
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      paymentStatus: "PAID",
      alreadyPaid: settlement.alreadyPaid,
      ticketsIssued: settlement.tickets.length,
    });
  } catch (error: any) {
    console.error("[DOKU Sandbox Simulate Error]:", error?.message);
    return NextResponse.json(
      { success: false, message: "Gagal memproses simulasi pembayaran sandbox" },
      { status: 500 }
    );
  }
}
