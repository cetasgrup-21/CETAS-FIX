"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { ShieldCheck, QrCode, CreditCard, Building2, CheckCircle2, X, ArrowRight } from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

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
  const [isSuccessView, setIsSuccessView] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsSuccessView(true);
    }, 400);
  };

  const handleCompleteSuccess = () => {
    setIsSuccessView(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white text-slate-900 shadow-2xl border border-blue-100 overflow-hidden">
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

        {/* CONDITION: SUCCESS WITH THUMBS UP ANT-MAN MASCOT */}
        {isSuccessView ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="relative flex justify-center">
              <AntmanMascot
                pose="thumbsup"
                interactive={true}
                size={160}
                className="drop-shadow-md"
              />
              <div className="absolute bottom-0 right-1/3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-white text-sm">
                👍
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Midtrans Settlement Sukses
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Mantap! Pembayaran Berhasil! 👍
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Transaksi senilai {formatRupiah(grossAmount)} telah lunas. Maskot Anty Cetas siap menerbitkan tiket / mencatat suaramu!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 text-xs shadow-lg shadow-blue-500/25 transition active:scale-95"
              >
                <span>Lihat Tiket / Hasil Vote</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Order Details & Simulator Form */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-500">Nomor Pesanan</div>
                <div className="text-xs font-mono font-bold text-slate-800">{orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500">Total Tagihan</div>
                <div className="text-base font-black text-blue-600">
                  {formatRupiah(grossAmount)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("QRIS")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    selectedMethod === "QRIS"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>GoPay / Wallet</span>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-center">
              {selectedMethod === "QRIS" && (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm inline-block border border-slate-200">
                    <div className="h-28 w-28 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                      <QrCode className="h-20 w-20 text-slate-800" />
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
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
                  <div className="text-xs font-bold text-slate-800">
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
                Mode Sandbox Cetas • Memastikan alur penerbitan tiket & voting lancar
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
