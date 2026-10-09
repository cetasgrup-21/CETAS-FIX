"use client";

// Backward compatibility alias: re-export DokuPaymentModal as MidtransSimulatorModal
import { DokuPaymentModal, DokuPaymentModalProps } from "./doku-payment-modal";

export type MidtransSimulatorModalProps = DokuPaymentModalProps;

export function MidtransSimulatorModal(props: DokuPaymentModalProps) {
  return <DokuPaymentModal {...props} />;
}
