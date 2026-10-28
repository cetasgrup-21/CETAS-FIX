import { StoredOrder, StoredTicket } from "@/lib/order-store";
import { logPaymentTrace } from "@/lib/payment-logger";

const ADMIN_CETAS_PHONE = "081584682345"; // Admin CETAS Official Support

function normalizeIndonesianPhone(phone?: string): string {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }
  return clean;
}

export function formatTicketWhatsAppMessage(
  order: StoredOrder,
  tickets: StoredTicket[]
): string {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cetas.co.id");

  const primaryTicket = tickets[0];
  const eventName = primaryTicket?.eventName || "Event Resmi CETAS";
  const tierName = primaryTicket?.tierName || "Reguler";

  const ticketList = tickets
    .map((t, idx) => `• Tiket #${idx + 1}: *${t.ticketCode}* (${t.holderName})`)
    .join("\n");

  return (
    `*CETAS.TIKET - E-TIKET RESMI* 🎟️\n` +
    `Halo Kak *${order.customerName}*,\n\n` +
    `Pembayaran tiket Anda telah *BERHASIL* diverifikasi oleh sistem CETAS.\n\n` +
    `📋 *Rincian Pesanan:*\n` +
    `• Acara: *${eventName}*\n` +
    `• Kategori: *${tierName}* (x${tickets.length} Tiket)\n` +
    `• No. Pesanan: *${order.orderNumber}*\n` +
    `• Total Bayar: *Rp ${order.totalAmount.toLocaleString("id-ID")}*\n\n` +
    `🎫 *Kode Tiket Masuk:*\n` +
    `${ticketList}\n\n` +
    `📲 *Akses QR Code Gate Resmi:*\n` +
    `${appBaseUrl}/order/${order.orderNumber}/success\n\n` +
    `_Harap simpan pesan ini dan tunjukkan barcode QR pada tautan di atas kepada petugas scan di pintu masuk venue._\n\n` +
    `Pesan ini dikirim otomatis oleh:\n` +
    `*Admin CETAS Official*`
  );
}

/**
 * Send automated WhatsApp notification from Admin CETAS to Customer phone
 * (Transactional / OTP style via WhatsApp Gateway API)
 */
export async function sendTicketWhatsAppNotification(
  order: StoredOrder,
  tickets: StoredTicket[]
): Promise<{ success: boolean; message: string }> {
  const recipientPhone = normalizeIndonesianPhone(order.customerPhone);

  if (!recipientPhone || recipientPhone.length < 9) {
    logPaymentTrace({
      correlationId: order.orderNumber,
      step: "WHATSAPP_DISPATCH_SKIPPED",
      message: "Nomor WhatsApp pembeli tidak valid atau tidak diisi",
    });
    return { success: false, message: "Nomor WhatsApp tidak valid" };
  }

  const messageText = formatTicketWhatsAppMessage(order, tickets);
  const token =
    process.env.WHATSAPP_GATEWAY_TOKEN ||
    process.env.FONNTE_TOKEN ||
    process.env.WHATSAPP_API_TOKEN;
  const gatewayUrl =
    process.env.WHATSAPP_GATEWAY_URL || "https://api.fonnte.com/send";

  // Jika token WhatsApp Gateway (misal Fonnte / Wablas) telah dikonfigurasi di .env
  if (token) {
    try {
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: recipientPhone,
          message: messageText,
          countryCode: "62",
        }),
      });

      const resJson = await res.json().catch(() => null);

      if (res.ok) {
        logPaymentTrace({
          correlationId: order.orderNumber,
          step: "WHATSAPP_DISPATCH_SUCCESS",
          message: `E-tiket berhasil dikirim ke WhatsApp pembeli (${recipientPhone}) dari Admin CETAS`,
        });
        return { success: true, message: "Pesan WhatsApp berhasil dikirim" };
      } else {
        logPaymentTrace({
          correlationId: order.orderNumber,
          step: "WHATSAPP_DISPATCH_FAILED",
          error: JSON.stringify(resJson || "HTTP Error"),
        });
        return { success: false, message: "Gateway WhatsApp gagal mengirim pesan" };
      }
    } catch (err: any) {
      logPaymentTrace({
        correlationId: order.orderNumber,
        step: "WHATSAPP_DISPATCH_ERROR",
        error: err?.message || String(err),
      });
      return { success: false, message: err?.message || "Kesalahan jaringan gateway" };
    }
  }

  // Jika token belum disetel di .env, catat log antrean pengiriman secara aman
  logPaymentTrace({
    correlationId: order.orderNumber,
    step: "WHATSAPP_DISPATCH_READY",
    message: `Pesan siap dikirim ke ${recipientPhone.slice(0, 4)}****${recipientPhone.slice(-3)} dari Admin CETAS (${ADMIN_CETAS_PHONE}). Pasang WHATSAPP_GATEWAY_TOKEN di .env untuk pengiriman instan.`,
  });

  return {
    success: true,
    message: "Pesan transaksi tercatat dan siap dialirkan ke nomor pelanggan",
  };
}
