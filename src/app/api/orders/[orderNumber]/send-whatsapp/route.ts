import { NextRequest, NextResponse } from "next/server";
import { findOrder, getTicketsByOrder } from "@/lib/order-store";
import { sendTicketWhatsAppNotification } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: "Nomor order tidak valid" },
        { status: 400 }
      );
    }

    const order = await findOrder(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        { success: false, message: "Pesanan belum lunas" },
        { status: 400 }
      );
    }

    const tickets = await getTicketsByOrder(order.orderNumber);
    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada tiket aktif untuk pesanan ini" },
        { status: 400 }
      );
    }

    const result = await sendTicketWhatsAppNotification(order, tickets);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sentTo: order.customerPhone
        ? `${order.customerPhone.slice(0, 4)}****${order.customerPhone.slice(-3)}`
        : "-",
    });
  } catch (error: any) {
    console.error("send-whatsapp error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pengiriman WhatsApp" },
      { status: 500 }
    );
  }
}
