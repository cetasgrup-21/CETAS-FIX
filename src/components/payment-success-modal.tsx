"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, X, Download, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import { formatRupiah } from "@/lib/utils";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  orderNumber: string;
  grossAmount: number;
  customerName?: string;
  orderType?: "TICKET" | "VOTE" | "PRODUCTION";
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function PaymentSuccessModal({
  isOpen,
  orderNumber,
  grossAmount,
  customerName = "Pengunjung Cetas",
  orderType = "TICKET",
  onClose,
  onAction,
  actionLabel = "Lihat Tiket / Hasil",
}: PaymentSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getSubheading = () => {
    if (orderType === "VOTE") {
      return "Suaramu telah resmi masuk ke leaderboard secara realtime!";
    }
    if (orderType === "PRODUCTION") {
      return "Invoice lunas! Tim produksi Cetas segera menyiapkan pengiriman / sewa.";
    }
    return "E-Tiket QR dinamis telah resmi diterbitkan dan siap digunakan!";
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft purple celebration background glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-purple-100 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Ant-Man Mascot giving THUMBS UP */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-2">
            <AntmanMascot
              pose="thumbsup"
              size={170}
              className="drop-shadow-lg"
            />
            {/* Green Thumbs Up Badge */}
            <div className="absolute -bottom-2 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white text-base">
              👍
            </div>
          </div>

          {/* Headline */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Pembayaran Terverifikasi Midtrans</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Mantap! Transaksi Berhasil! 👍
          </h3>
          <p className="mt-1 text-xs text-slate-600 max-w-xs leading-relaxed">
            {getSubheading()}
          </p>

          {/* Transaction Summary Card */}
          <div className="w-full mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Nomor Pesanan</span>
              <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Atas Nama</span>
              <span className="font-semibold text-slate-800">{customerName}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Total Dibayar</span>
              <span className="text-base font-black text-purple-700">
                {formatRupiah(grossAmount)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full mt-6 space-y-2">
            {onAction && (
              <button
                type="button"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-2 transition"
            >
              Kembali ke Halaman
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
