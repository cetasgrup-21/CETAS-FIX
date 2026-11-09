import crypto from "node:crypto";

const CHECKOUT_PATH = "/checkout/v1/payment";
const CHECK_STATUS_PATH = "/orders/v1/status";

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type DokuRequestContext = {
  clientId: string;
  secretKey: string;
  apiBaseUrl: string;
};

// DOKU Checkout validates request strings against a restricted character set.
// Keep the original customer/order data in our database and normalize only
// display fields sent to DOKU, so accents, emoji, and unsupported punctuation
// cannot make the entire payment request fail.
function sanitizeDokuDisplayText(value: string, fallback: string, maxLength: number): string {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 .\-/+,=_:'@%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return sanitized || fallback;
}

export type DokuPaymentMethod = "QRIS" | "SHOPEEPAY" | "DANA" | "OVO" | "VA" | "CHECKOUT";

export interface DokuCheckoutStatus {
  order?: { invoice_number?: string; amount?: string | number };
  transaction?: {
    status?: string;
    original_request_id?: string;
    date?: string;
  };
  service?: { id?: string };
  channel?: { id?: string };
}

function getDokuRequestContext(): DokuRequestContext {
  const clientId = process.env.DOKU_CLIENT_ID?.trim();
  const secretKey = process.env.DOKU_SECRET_KEY?.trim();
  if (!clientId) throw new Error("DOKU_CLIENT_ID belum dikonfigurasi");
  if (!secretKey) throw new Error("DOKU_SECRET_KEY belum dikonfigurasi");

  const configuredBase = process.env.DOKU_BASE_URL?.trim();
  const requestedProduction =
    process.env.DOKU_IS_PRODUCTION?.toLowerCase() === "true" ||
    process.env.DOKU_ENV?.toLowerCase() === "production";
  const defaultBase = requestedProduction
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com";
  const parsedBase = new URL(configuredBase || defaultBase);
  const allowedHosts = new Set(["api.doku.com", "api-sandbox.doku.com"]);
  if (parsedBase.protocol !== "https:" || !allowedHosts.has(parsedBase.hostname)) {
    throw new Error("DOKU_BASE_URL harus memakai endpoint resmi DOKU");
  }

  return { clientId, secretKey, apiBaseUrl: parsedBase.origin };
}

function getDokuSignature(input: {
  context: DokuRequestContext;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  body?: string;
}): string {
  const components = [
    `Client-Id:${input.context.clientId}`,
    `Request-Id:${input.requestId}`,
    `Request-Timestamp:${input.requestTimestamp}`,
    `Request-Target:${input.requestTarget}`,
  ];
  if (input.body !== undefined) {
    const digest = crypto.createHash("sha256").update(input.body, "utf8").digest("base64");
    components.push(`Digest:${digest}`);
  }

  const signature = crypto
    .createHmac("sha256", input.context.secretKey)
    .update(components.join("\n"), "utf8")
    .digest("base64");
  return `HMACSHA256=${signature}`;
}

function getCallbackUrl(orderNumber: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").trim();
  const base = new URL(appUrl);
  const callback = new URL(`/order/${encodeURIComponent(orderNumber)}/success`, base);
  return callback.toString();
}

function formatPhoneForDoku(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("62")) return digits.slice(0, 16);
  if (digits.startsWith("0")) return `62${digits.slice(1)}`.slice(0, 16);
  return `62${digits}`.slice(0, 16);
}

async function readDokuJson(response: Response): Promise<Record<string, any>> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Respons DOKU bukan JSON (HTTP ${response.status})`);
  }
}

async function requestDoku(input: {
  method: "GET" | "POST";
  path: string;
  body?: string;
}): Promise<Record<string, any>> {
  const context = getDokuRequestContext();
  const requestId = crypto.randomUUID();
  // DOKU Jokul / Checkout requires ISO-8601 UTC timestamp strictly without milliseconds (YYYY-MM-DDTHH:mm:ssZ)
  const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
  const signature = getDokuSignature({
    context,
    requestId,
    requestTimestamp,
    requestTarget: input.path,
    body: input.body,
  });
  const response = await fetch(`${context.apiBaseUrl}${input.path}`, {
    method: input.method,
    headers: {
      "Client-Id": context.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
      ...(input.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(input.body !== undefined ? { body: input.body } : {}),
    cache: "no-store",
  });
  const data = await readDokuJson(response);
  if (!response.ok) {
    const rawMessage = data.message ?? data.responseMessage ?? data.error_description;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    const responseCode = data.responseCode ?? data.errorCode ?? data.error_code;
    const providerRequestId =
      response.headers.get("response-id") || response.headers.get("request-id") || requestId;
    const diagnostic = [
      `HTTP ${response.status}`,
      responseCode ? `code ${String(responseCode).slice(0, 80)}` : undefined,
      `request ${providerRequestId.slice(0, 128)}`,
    ].filter(Boolean).join(", ");
    throw new Error(
      `DOKU menolak request (${diagnostic})${message ? `: ${String(message).slice(0, 300)}` : ""}`
    );
  }
  return { ...data, __requestId: requestId };
}

function getCheckoutUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("DOKU tidak mengembalikan payment URL");
  const paymentUrl = new URL(value);
  const isDokuHost =
    paymentUrl.hostname === "doku.com" ||
    paymentUrl.hostname.endsWith(".doku.com");
  if (paymentUrl.protocol !== "https:" || !isDokuHost) {
    throw new Error(`DOKU mengembalikan payment URL yang tidak dikenal: ${paymentUrl.hostname}`);
  }
  return paymentUrl.toString();
}

export async function createDokuPayment(input: {
  orderId: string;
  grossAmount: number;
  paymentMethod?: DokuPaymentMethod;
  customerDetails: { first_name: string; email: string; phone?: string };
  itemDetails: CheckoutItem[];
  description?: string;
}): Promise<{
  paymentUrl: string;
  requestId: string;
  sessionId?: string;
  expiredAt?: string;
  paymentMethodTypes?: string[];
}> {
  if (!Number.isSafeInteger(input.grossAmount) || input.grossAmount <= 0) {
    throw new Error("Nominal checkout DOKU harus berupa bilangan rupiah positif");
  }

  const callbackUrl = getCallbackUrl(input.orderId);
  const notificationUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const notificationEndpoint = notificationUrl ? new URL("/api/webhooks/doku", notificationUrl) : null;

  const body: Record<string, any> = {
    order: {
      amount: input.grossAmount,
      invoice_number: input.orderId,
      currency: "IDR",
      callback_url: callbackUrl,
      callback_url_result: callbackUrl,
      language: "ID",
      auto_redirect: true,
      line_items: input.itemDetails.map((item) => ({
        id: sanitizeDokuDisplayText(item.id, "ITEM", 64),
        name: sanitizeDokuDisplayText(item.name, "CETAS Item", 255),
        price: item.price,
        quantity: item.quantity,
      })),
    },
    payment: { payment_due_date: 60 },
    customer: {
      name: sanitizeDokuDisplayText(input.customerDetails.first_name, "Customer", 255),
      email: input.customerDetails.email.slice(0, 128),
      phone: formatPhoneForDoku(input.customerDetails.phone),
      country: "ID",
    },
  };

  if (notificationEndpoint?.protocol === "https:") {
    body.additional_info = { override_notification_url: notificationEndpoint.toString() };
  }

  const rawBody = JSON.stringify(body);
  const data = await requestDoku({ method: "POST", path: CHECKOUT_PATH, body: rawBody });
  const response = data.response || data;
  const payment = response.payment;
  const invoiceNumber = response.order?.invoice_number;
  if (invoiceNumber !== input.orderId || !payment?.url) {
    throw new Error("Respons DOKU Checkout tidak cocok dengan invoice yang dikirim");
  }

  return {
    paymentUrl: getCheckoutUrl(payment.url),
    requestId: String(data.__requestId),
    sessionId: typeof response.order?.session_id === "string" ? response.order.session_id : undefined,
    expiredAt: typeof payment.expired_date === "string" ? payment.expired_date : undefined,
    paymentMethodTypes: Array.isArray(payment.payment_method_types)
      ? payment.payment_method_types.filter((item: unknown): item is string => typeof item === "string")
      : undefined,
  };
}

export async function queryDokuCheckoutStatus(invoiceNumber: string): Promise<DokuCheckoutStatus> {
  const path = `${CHECK_STATUS_PATH}/${encodeURIComponent(invoiceNumber)}`;
  const data = await requestDoku({ method: "GET", path });
  return data as DokuCheckoutStatus;
}

export function verifyDokuWebhookSignature(input: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  body: string;
  signature: string;
}): boolean {
  try {
    const context = getDokuRequestContext();
    if (input.clientId !== context.clientId || !input.requestId || !input.requestTimestamp) return false;
    const expected = getDokuSignature({
      context,
      requestId: input.requestId,
      requestTimestamp: input.requestTimestamp,
      requestTarget: input.requestTarget,
      body: input.body,
    });
    const normalize = (value: string) => value.trim().replace(/^HMACSHA256=/i, "");
    const expectedBuffer = Buffer.from(normalize(expected));
    const receivedBuffer = Buffer.from(normalize(input.signature));
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}
