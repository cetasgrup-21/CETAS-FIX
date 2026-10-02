import crypto from "crypto";
import QRCode from "qrcode";

const TICKET_SECRET = process.env.TICKET_SIGNING_SECRET || "cetas-ticket-qr-signature-secret-key";

export interface TicketPayload {
  ticketCode: string;
  eventId: string;
  tierId: string;
  issuedAt: number;
}

/**
 * Menghasilkan hash digital bertanda tangan (HMAC-SHA256) untuk mencegah tiket palsu
 */
export function generateTicketSignature(payload: TicketPayload): string {
  const dataString = `${payload.ticketCode}:${payload.eventId}:${payload.tierId}:${payload.issuedAt}`;
  return crypto.createHmac("sha256", TICKET_SECRET).update(dataString).digest("hex");
}

/**
 * Membuat paket string QR Code yang terenkode dan bertanda tangan
 */
export function createTicketQRString(payload: TicketPayload): string {
  const signature = generateTicketSignature(payload);
  const composite = {
    ...payload,
    sig: signature,
  };
  return Buffer.from(JSON.stringify(composite)).toString("base64url");
}

/**
 * Memvalidasi string QR Code saat discan oleh panitia/gatekeeper
 */
export function verifyTicketQR(qrString: string): { valid: boolean; data?: TicketPayload; error?: string } {
  try {
    const jsonStr = Buffer.from(qrString, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr);

    if (!parsed.ticketCode || !parsed.eventId || !parsed.tierId || !parsed.issuedAt || !parsed.sig) {
      return { valid: false, error: "Format QR Code tidak valid" };
    }

    const expectedSig = generateTicketSignature({
      ticketCode: parsed.ticketCode,
      eventId: parsed.eventId,
      tierId: parsed.tierId,
      issuedAt: parsed.issuedAt,
    });

    if (expectedSig !== parsed.sig) {
      return { valid: false, error: "Tanda tangan digital tidak cocok! Kemungkinan tiket palsu." };
    }

    return {
      valid: true,
      data: {
        ticketCode: parsed.ticketCode,
        eventId: parsed.eventId,
        tierId: parsed.tierId,
        issuedAt: parsed.issuedAt,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memproses QR code";
    return { valid: false, error: errorMsg };
  }
}

/**
 * Menghasilkan Data URL gambar QR Code PNG yang siap dirender di browser atau e-tiket PDF
 */
export async function generateQRCodeDataUrl(content: string): Promise<string> {
  return await QRCode.toDataURL(content, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 256,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
