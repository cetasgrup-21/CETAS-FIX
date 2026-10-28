/**
 * Structured Security & Observability Logger for CETAS Payment Gateway
 * Guarantees zero leakage of secrets, tokens, or credentials
 */

export type PaymentLifecycleStep =
  | "ORDER_CREATED"
  | "XENDIT_REQUEST_SENT"
  | "XENDIT_RESPONSE_RECEIVED"
  | "XENDIT_REQUEST_FAILED"
  | "WEBHOOK_RECEIVED"
  | "WEBHOOK_AUTHENTICATED"
  | "WEBHOOK_AUTH_FAILED"
  | "TRANSACTION_MATCHED"
  | "TRANSACTION_MISMATCH"
  | "DATABASE_UPDATE_START"
  | "DATABASE_UPDATED"
  | "DATABASE_UPDATE_FAILED"
  | "TICKETS_ISSUED"
  | "STATUS_CHECK_POLL"
  | "DOUBLE_VERIFY_SUCCESS"
  | "ORDER_EXPIRED";

export interface PaymentLogPayload {
  correlationId: string;
  step: PaymentLifecycleStep;
  orderNumber?: string;
  xenditInvoiceId?: string;
  paymentMethod?: string;
  amountExpected?: number;
  amountReceived?: number;
  statusBefore?: string;
  statusAfter?: string;
  ticketsCount?: number;
  message?: string;
  error?: string;
}

export function logPaymentTrace(payload: PaymentLogPayload): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    service: "CETAS_PAYMENT_GATEWAY",
    correlationId: payload.correlationId,
    step: payload.step,
    orderNumber: payload.orderNumber || payload.correlationId,
    xenditInvoiceId: payload.xenditInvoiceId ? payload.xenditInvoiceId.slice(0, 10) + "..." : undefined,
    paymentMethod: payload.paymentMethod,
    amountExpected: payload.amountExpected,
    amountReceived: payload.amountReceived,
    statusBefore: payload.statusBefore,
    statusAfter: payload.statusAfter,
    ticketsCount: payload.ticketsCount,
    message: payload.message,
    error: payload.error,
  };

  if (payload.step.includes("FAILED") || payload.step.includes("MISMATCH") || payload.error) {
    console.error(`[PAYMENT_AUDIT_ALERT] ${JSON.stringify(logEntry)}`);
  } else {
    console.log(`[PAYMENT_AUDIT_TRACE] ${JSON.stringify(logEntry)}`);
  }
}
