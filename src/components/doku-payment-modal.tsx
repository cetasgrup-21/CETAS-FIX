"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { playVoteNotificationSound } from "@/lib/sound";

export type DokuPaymentChannel = "QRIS" | "SHOPEEPAY" | "DANA" | "OVO" | "VA";

export interface DokuPaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentUrl?: string;
  qrDataUrl?: string;
  qrContent?: string;
  successTitle?: string;
  successSubtitle?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DokuPaymentModal({
  isOpen,
  orderNumber,
  grossAmount,
  paymentUrl,
  successTitle,
  successSubtitle,
  onSuccess,
  onClose,
}: DokuPaymentModalProps) {
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60 * 60);
      setIsSuccessView(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccessView || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSuccessView, timeLeft]);

  // Auto-poll order status every 3 seconds to catch real webhook settlement
  useEffect(() => {
    if (!isOpen || isSuccessView || !orderNumber) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data?.paymentStatus === "PAID" && data?.isPaid === true) {
            setIsSuccessView(true);
            try {
              playVoteNotificationSound();
            } catch {}
          }
        }
      } catch (err) {
        // silent polling error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isSuccessView, orderNumber]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/checkout/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          paymentChannel: "DOKU_SANDBOX_QRIS",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccessView(true);
        try {
          playVoteNotificationSound();
        } catch {}
      } else {
        alert(data.message || "Simulasi pembayaran gagal.");
      }
    } catch (err: any) {
      alert("Gagal memproses simulasi: " + (err?.message || "Kesalahan jaringan"));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCompleteSuccess = () => {
    setIsSuccessView(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-red-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* DOKU Checkout Header */}
        <div className="bg-[#E1251B] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            {/* DOKU Brand Icon */}
            <div className="h-9 w-9 rounded-xl bg-white text-[#E1251B] font-black text-base flex items-center justify-center shadow-sm">
              D
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-2">
                <span>DOKU CHECKOUT</span>
                <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full border border-white/30">
                  SNAP BI ASPI
                </span>
              </div>
              <div className="text-[10px] text-white/90">
                Pembayaran aman melalui halaman DOKU
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccessView ? (
          /* ================= SUCCESS VIEW ================= */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {successTitle || "Pembayaran Berhasil Terverifikasi!"}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {successSubtitle ||
                `Transaksi dengan nomor ${orderNumber} telah terverifikasi lunas melalui DOKU Checkout.`}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Pesanan</span>
                <span className="font-mono font-bold text-slate-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Tagihan</span>
                <span className="font-bold text-emerald-600">{formatRupiah(grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar</span>
                <span className="font-bold text-slate-900">DOKU Checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Settlement</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Dikonfirmasi DOKU
                </span>
              </div>
            </div>

            <button
              onClick={handleCompleteSuccess}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-3.5 text-xs shadow-lg shadow-emerald-600/30 transition hover:scale-[1.02] active:scale-95"
            >
              <span>Lihat Tiket / Hasil Transaksi</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* ================= PAYMENT FORM VIEW ================= */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Amount & Timer Banner */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Pembayaran
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {formatRupiah(grossAmount)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  ID: <span className="font-mono font-semibold">{orderNumber}</span>
                </span>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>{formattedTime}</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Sisa Waktu Bayar</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#E1251B] shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Pilih metode pembayaran di DOKU Checkout</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                QRIS dan metode lain yang aktif untuk merchant akan ditampilkan di halaman pembayaran DOKU.
              </p>
              {paymentUrl ? (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1251B] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <span>Lanjutkan ke DOKU Checkout</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Link pembayaran belum tersedia. Muat ulang pesanan atau hubungi admin.
                </p>
              )}
            </div>
            {/* Sandbox Simulation / Instant Test Button */}
            <div className="pt-2 space-y-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleSimulatePayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isSimulating
                    ? "Memverifikasi Pembayaran Sandbox..."
                    : "⚡ Simulasikan Pembayaran Sandbox (Uji Coba Lunas)"}
                </span>
              </button>

              <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>DOKU Sandbox Mode • Simulasi Verifikasi Otomatis Realtime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
