import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createXenditPayment, XenditPaymentMethod } from "@/lib/xendit";
import {
  validateAndCalculateItems,
  createOrderRecord,
  markOrderAsPaid,
} from "@/lib/order-store";
import { logPaymentTrace } from "@/lib/payment-logger";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  orderType: z.enum(["TICKET", "VOTE", "PRODUCTION", "REGISTRATION"]),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerEmail: z.string().email("Format email tidak valid"),
  customerPhone: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length >= 8 ? val.trim() : "081234567890")),
  paymentMethod: z.enum(["QRIS", "OVO", "SHOPEEPAY", "DANA"]).optional().default("QRIS"),
  ovoPhoneNumber: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(), // tierId, productId, or candidateId
        name: z.string().optional(),
        quantity: z.number().int().positive("Jumlah tiket/item minimal 1"),
        price: z.number().nonnegative().optional(),
        eventId: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item pesanan"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    // 1. Validasi harga dan ketersediaan kuota secara ketat di sisi server
    const calculation = await validateAndCalculateItems(
      validatedData.orderType,
      validatedData.items
    );

    if (!calculation.valid) {
      return NextResponse.json(
        { success: false, message: calculation.error || "Validasi item pesanan gagal" },
        { status: 400 }
      );
    }

    const totalAmount = calculation.totalAmount;
    const verifiedItems = calculation.verifiedItems;

    // 2. Format order number unik: CETAS-[TYPE]-[TIMESTAMP]-[RANDOM]
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `CETAS-${validatedData.orderType.slice(0, 3)}-${timestamp}-${randomHex}`;

    logPaymentTrace({
      correlationId: orderNumber,
      step: "ORDER_CREATED",
      orderNumber,
      amountExpected: totalAmount,
      message: `Order created for ${validatedData.orderType}`,
    });

    // 3. Jika transaksi gratis (Rp0), langsung selesaikan secara atomik di database
    if (totalAmount === 0) {
      await createOrderRecord({
        orderNumber,
        orderType: validatedData.orderType,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        totalAmount: 0,
        paymentGateway: "INTERNAL_FREE",
        paymentMethod: "FREE",
        items: verifiedItems,
      });

      const settlement = await markOrderAsPaid(orderNumber, {
        amountPaid: 0,
        paymentChannel: "FREE_PASS",
      });

      return NextResponse.json({
        success: true,
        orderNumber,
        isFree: true,
        paymentStatus: "PAID",
        tickets: settlement.tickets,
        redirectUrl: `/order/${orderNumber}/success`,
      });
    }

    // 4. Buat transaksi resmi di Xendit Payment Gateway (Invoice API)
    const xenditResult = await createXenditPayment({
      orderId: orderNumber,
      grossAmount: totalAmount,
      paymentMethod: validatedData.paymentMethod as XenditPaymentMethod,
      ovoPhoneNumber: validatedData.ovoPhoneNumber,
      customerDetails: {
        first_name: validatedData.customerName,
        email: validatedData.customerEmail,
        phone: validatedData.customerPhone,
      },
      itemDetails: verifiedItems.map((i) => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        name: i.name.slice(0, 50),
      })),
      description: `CETAS ${validatedData.orderType} - ${orderNumber}`,
    });

    // 5. Simpan pesanan ke database PostgreSQL Supabase dengan status PENDING
    await createOrderRecord({
      orderNumber,
      orderType: validatedData.orderType,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      totalAmount,
      paymentGateway: "XENDIT",
      paymentMethod: validatedData.paymentMethod || "QRIS",
      xenditInvoiceId: xenditResult?.invoiceId,
      xenditExternalId: orderNumber,
      xenditQrId: xenditResult?.qrId,
      items: verifiedItems,
      metadata: {
        invoiceUrl: xenditResult?.invoiceUrl,
        qrId: xenditResult?.qrId,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentGateway: "XENDIT",
      paymentMethod: validatedData.paymentMethod || "QRIS",
      grossAmount: totalAmount,
      xendit: xenditResult,
      isSimulated: xenditResult?.isSimulated,
      invoiceUrl: xenditResult?.invoiceUrl,
      qrDataUrl: xenditResult?.qrDataUrl,
      qrContent: xenditResult?.qrContent,
      expiredAt: xenditResult?.expiredAt,
    });
  } catch (error: any) {
    console.error("[Checkout API Error]:", error?.message);
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message || "Data formulir tidak valid";
      return NextResponse.json(
        { success: false, message: firstIssue, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: "Gagal memproses pesanan" }, { status: 500 });
  }
}
