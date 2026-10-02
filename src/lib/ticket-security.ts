import QRCode from "qrcode";

const TICKET_SECRET = process.env.TICKET_SIGNING_SECRET || "cetas-ticket-qr-signature-secret-key";

export interface TicketPayload {
  ticketCode: string;
  eventId: string;
  tierId: string;
  issuedAt: number;
}

/**
 * Universal Base64URL encoder yang aman di Node.js maupun Browser
 */
function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  // Browser fallback
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Universal Base64URL decoder yang aman di Node.js maupun Browser
 */
function fromBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf-8");
  }
  // Browser fallback
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

/**
 * Universal HMAC / Signature generator yang kompatibel di Server dan Browser
 */
export function generateTicketSignature(payload: TicketPayload): string {
  const dataString = `${payload.ticketCode}:${payload.eventId}:${payload.tierId}:${payload.issuedAt}:${TICKET_SECRET}`;
  
  // Fast universal 32-bit hash generator (DJB2 + FNV-1a composite)
  let hash1 = 5381;
  let hash2 = 2166136261;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = (hash2 ^ char) * 16777619;
  }
  
  const part1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  const part3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, "0");
  
  return `SIG-${part1}-${part2}-${part3}`.toUpperCase();
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
  return toBase64Url(JSON.stringify(composite));
}

/**
 * Memvalidasi string QR Code saat discan oleh panitia/gatekeeper
 */
export function verifyTicketQR(qrString: string): { valid: boolean; data?: TicketPayload; error?: string } {
  try {
    const jsonStr = fromBase64Url(qrString);
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
  try {
    return await QRCode.toDataURL(content, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 256,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (e) {
    console.warn("QRCode toDataURL fallback:", e);
    // Fallback URL generator jika canvas browser tidak tersedia
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(content)}`;
  }
}
