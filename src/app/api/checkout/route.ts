import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createMidtransTransaction } from "@/lib/midtrans";
import { createTicketQRString } from "@/lib/ticket-security";

const checkoutSchema = z.object({
  orderType: z.enum(["TICKET", "VOTE", "PRODUCTION", "REGISTRATION"]),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerEmail: z.string().email("Format email tidak valid"),
  customerPhone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  items: z.array(
    z.object({
      id: z.string(), // tierId, productId, or candidateId
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
      eventId: z.string().optional(),
    })
  ).min(1, "Minimal 1 item pesanan"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    const totalAmount = validatedData.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Format order number: CETAS-[TYPE]-[TIMESTAMP]-[RANDOM]
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `CETAS-${validatedData.orderType.slice(0, 3)}-${timestamp}-${randomHex}`;

    // 1. Simpan order ke database
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          orderType: validatedData.orderType,
          totalAmount,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          paymentStatus: totalAmount === 0 ? "PAID" : "PENDING",
          items: {
            create: validatedData.items.map((item) => ({
              itemDescription: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
              tierId: validatedData.orderType === "TICKET" ? item.id : undefined,
              productionProductId: validatedData.orderType === "PRODUCTION" ? item.id : undefined,
            })),
          },
        },
      });

      // Jika order Tiket, siapkan draft tiket
      if (validatedData.orderType === "TICKET") {
        for (const item of validatedData.items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = `CETAS-TCK-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const qrHash = createTicketQRString({
              ticketCode,
              eventId: item.eventId || "general-event",
              tierId: item.id,
              issuedAt: Date.now(),
            });

            await tx.ticket.create({
              data: {
                orderId: newOrder.id,
                tierId: item.id,
                ticketCode,
                qrHash,
                holderName: validatedData.customerName,
                holderEmail: validatedData.customerEmail,
                holderPhone: validatedData.customerPhone,
              },
            });
          }
        }
      }

      // Jika order Vote, siapkan record vote log
      if (validatedData.orderType === "VOTE") {
        for (const item of validatedData.items) {
          await tx.voteLog.create({
            data: {
              candidateId: item.id,
              orderId: newOrder.id,
              voteCount: item.quantity,
            },
          });
        }
      }

      return newOrder;
    });

    // 2. Jika transaksi gratis (Rp0), langsung selesaikan tanpa Midtrans
    if (totalAmount === 0) {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        isFree: true,
        redirectUrl: `/order/${order.orderNumber}/success`,
      });
    }

    // 3. Generate Snap Token via Midtrans
    const midtransRes = await createMidtransTransaction({
      orderId: order.orderNumber,
      grossAmount: totalAmount,
      customerDetails: {
        first_name: validatedData.customerName,
        email: validatedData.customerEmail,
        phone: validatedData.customerPhone,
      },
      itemDetails: validatedData.items.map((i) => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        name: i.name.slice(0, 50),
      })),
    });

    // Simpan snapToken ke database
    await prisma.payment.create({
      data: {
        orderId: order.id,
        snapToken: midtransRes.token,
        redirectUrl: midtransRes.redirectUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      snapToken: midtransRes.token,
      redirectUrl: midtransRes.redirectUrl,
    });
  } catch (error) {
    console.error("[Checkout API Error]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Gagal memproses pesanan" }, { status: 500 });
  }
}
