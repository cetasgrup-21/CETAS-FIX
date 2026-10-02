"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { ShieldCheck, QrCode, CreditCard, Building2, CheckCircle2, X } from "lucide-react";

interface MidtransSimulatorModalProps {
  isOpen: boolean;
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function MidtransSimulatorModal({
  isOpen,
  orderNumber,
  grossAmount,
  customerName,
  onSuccess,
  onClose,
}: MidtransSimulatorModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"QRIS" | "BCA" | "GOPAY">("QRIS");
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Midtrans Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-500 font-black text-white text-xs flex items-center justify-center">
              M
            </div>
            <div>
              <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                MIDTRANS SNAP SIMULATOR
                <span className="text-[9px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                  SANDBOX
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Merchant: CETAS PLATFORM INDONESIA</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div>
              <div className="text-[10px] text-slate-500">Nomor Pesanan</div>
              <div className="text-xs font-mono font-bold">{orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Total Tagihan</div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400">
                {formatRupiah(grossAmount)}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("QRIS")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedMethod === "QRIS"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("BCA")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedMethod === "BCA"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>BCA VA</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("GOPAY")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  selectedMethod === "GOPAY"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>GoPay / E-Wallet</span>
              </button>
            </div>
          </div>

          {/* Payment Details Container */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center">
            {selectedMethod === "QRIS" && (
              <div className="space-y-2 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm inline-block">
                  <div className="h-32 w-32 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                    <QrCode className="h-24 w-24 text-slate-800" />
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Scan QRIS menggunakan BCA Mobile, GoPay, ShopeePay, atau OVO
                </div>
              </div>
            )}

            {selectedMethod === "BCA" && (
              <div className="space-y-1 py-3">
                <div className="text-[11px] text-slate-500">Nomor Virtual Account BCA</div>
                <div className="text-lg font-mono font-black text-blue-600 tracking-wider">
                  80777 0812 3456 7890
                </div>
                <div className="text-[10px] text-slate-400">Atas Nama: CETAS - {customerName}</div>
              </div>
            )}

            {selectedMethod === "GOPAY" && (
              <div className="space-y-1 py-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Bayar dengan Saldo GoPay / GoPay Later
                </div>
                <div className="text-[11px] text-slate-500">
                  Notifikasi pembayaran dikirimkan ke aplikasi Gojek di nomor Anda.
                </div>
              </div>
            )}
          </div>

          {/* Action Simulator Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isPaying}
              onClick={handleSimulatePayment}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isPaying ? "Memverifikasi Pembayaran..." : "Simulasikan Pembayaran Sukses (Settlement)"}
            </button>
            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Mode Sandbox Cetas • Memastikan alur penerbitan tiket & voting berjalan lancar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
