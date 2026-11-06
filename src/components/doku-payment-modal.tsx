"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  CreditCard,
  Building,
} from "lucide-react";
import QRCode from "qrcode";
import { generateQrisPayloadString } from "@/lib/doku";
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
  customerName,
  customerEmail,
  customerPhone = "081234567890",
  paymentUrl,
  qrDataUrl: initialQrDataUrl,
  qrContent: initialQrContent,
  successTitle,
  successSubtitle,
  onSuccess,
  onClose,
}: DokuPaymentModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<DokuPaymentChannel>("QRIS");
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>(initialQrDataUrl || "");
  const [ovoPhone, setOvoPhone] = useState<string>(customerPhone);
  const [ovoPushed, setOvoPushed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins

  // Generate real QR image on open if not provided
  useEffect(() => {
    if (isOpen) {
      if (initialQrDataUrl) {
        setQrDataUrl(initialQrDataUrl);
      } else {
        const qrisString = initialQrContent || generateQrisPayloadString(orderNumber, grossAmount);
        QRCode.toDataURL(qrisString, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 240,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        })
          .then(setQrDataUrl)
          .catch(console.error);
      }

      setTimeLeft(60 * 60);
      setIsSuccessView(false);
      setOvoPushed(false);
    }
  }, [isOpen, orderNumber, grossAmount, initialQrDataUrl, initialQrContent]);

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
          if (data?.status === "PAID" || data?.order?.paymentStatus === "PAID") {
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

  // Sandbox testing simulation
  const handleSimulatePayment = async () => {
    setIsPaying(true);
    try {
      // Hit local webhook test to mark order as paid
      await fetch("/api/webhooks/doku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            invoice_number: orderNumber,
            amount: grossAmount,
          },
          transaction: {
            status: "SUCCESS",
            id: `SIM-DOKU-${Date.now()}`,
          },
          channel: {
            id: selectedChannel,
          },
        }),
      });

      setIsPaying(false);
      setIsSuccessView(true);
      try {
        playVoteNotificationSound();
      } catch {}
    } catch (err) {
      setIsPaying(false);
      setIsSuccessView(true);
    }
  };

  const handleCompleteSuccess = () => {
    setIsSuccessView(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-red-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* DOKU Direct API Official Header */}
        <div className="bg-[#E1251B] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            {/* DOKU Brand Icon */}
            <div className="h-9 w-9 rounded-xl bg-white text-[#E1251B] font-black text-base flex items-center justify-center shadow-sm">
              D
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-2">
                <span>DOKU DIRECT API</span>
                <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full border border-white/30">
                  SNAP BI ASPI
                </span>
              </div>
              <div className="text-[10px] text-white/90">
                Payment Gateway Resmi • CETAS Platform
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
                  `Transaksi dengan nomor ${orderNumber} telah terverifikasi lunas melalui DOKU Direct API.`}
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
                <span className="font-bold text-slate-900">DOKU {selectedChannel} (0.7% MDR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Settlement</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Lunas Realtime
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

            {/* Payment Channel Selector */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">
                Pilih Jalur Direct API:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("QRIS")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    selectedChannel === "QRIS"
                      ? "border-[#E1251B] bg-red-50/60 text-[#E1251B] shadow-sm ring-1 ring-[#E1251B]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-black">QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("SHOPEEPAY")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    selectedChannel === "SHOPEEPAY"
                      ? "border-orange-500 bg-orange-50/60 text-orange-600 shadow-sm ring-1 ring-orange-500"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-black">ShopeePay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("DANA")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    selectedChannel === "DANA"
                      ? "border-blue-500 bg-blue-50/60 text-blue-600 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-black">DANA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("OVO")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    selectedChannel === "OVO"
                      ? "border-purple-500 bg-purple-50/60 text-purple-600 shadow-sm ring-1 ring-purple-500"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-black">OVO</span>
                </button>
              </div>
            </div>

            {/* CHANNEL CONTENT */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-center">
              {/* 1. QRIS CHANNEL (DIRECT ON-SCREEN QR) */}
              {selectedChannel === "QRIS" && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#E1251B] text-[10px] font-black border border-red-200">
                    <ShieldCheck className="h-3 w-3" />
                    <span>DOKU QRIS NATIONAL (ASPI MPM)</span>
                  </div>

                  {qrDataUrl ? (
                    <div className="mx-auto w-fit p-3 bg-white rounded-2xl border border-slate-200 shadow-inner">
                      <img
                        src={qrDataUrl}
                        alt="QRIS DOKU"
                        className="w-48 h-48 object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-48 mx-auto flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-xs">
                      Memuat QRIS...
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 font-medium">
                    Scan via <strong>BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA</strong>
                  </p>

                  {paymentUrl && (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline"
                    >
                      <span>Buka Halaman Checkout DOKU Resmi</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* 2. SHOPEEPAY CHANNEL */}
              {selectedChannel === "SHOPEEPAY" && (
                <div className="space-y-3 py-2">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">
                    📱
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      DOKU Direct API • ShopeePay
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                      Aplikasi Shopee akan terbuka secara otomatis untuk konfirmasi pembayaran instan.
                    </p>
                  </div>
                  {paymentUrl ? (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl shadow-md transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka ShopeePay Checkout</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Deeplink ShopeePay Siap</span>
                    </div>
                  )}
                </div>
              )}

              {/* 3. DANA CHANNEL */}
              {selectedChannel === "DANA" && (
                <div className="space-y-3 py-2">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                    💳
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      DOKU Direct API • DANA
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                      Transaksi terhubung langsung ke akun DANA Anda dengan proteksi DANA Protection.
                    </p>
                  </div>
                  {paymentUrl ? (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka DANA Checkout</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>DANA Direct Checkout Siap</span>
                    </div>
                  )}
                </div>
              )}

              {/* 4. OVO CHANNEL */}
              {selectedChannel === "OVO" && (
                <div className="space-y-3 py-1 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                      🟣
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        DOKU Direct Push Notification ke OVO
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Masukkan nomor HP terdaftar OVO untuk menerima notifikasi pop-up bayar
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Nomor Ponsel OVO:</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={ovoPhone}
                        onChange={(e) => setOvoPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="flex-1 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                      <button
                        type="button"
                        onClick={() => setOvoPushed(true)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
                      >
                        {ovoPushed ? "Terkirim ✓" : "Kirim Push"}
                      </button>
                    </div>
                  </div>

                  {ovoPushed && (
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-800 font-semibold flex items-center gap-2">
                      <Smartphone className="h-4 w-4 shrink-0 text-purple-600 animate-bounce" />
                      <span>
                        Notifikasi pembayaran telah dikirim ke {ovoPhone}. Silakan buka aplikasi OVO.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sandbox Simulation / Instant Test Button */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                disabled={isPaying}
                onClick={handleSimulatePayment}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isPaying
                    ? "Memverifikasi DOKU Direct API..."
                    : `Simulasikan Pembayaran Berhasil via DOKU (${selectedChannel})`}
                </span>
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>DOKU Direct API Sandbox • Tarif Murah 0.7% MDR ASPI Nasional</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Backward compatibility alias
export const XenditPaymentModal = DokuPaymentModal;
export type XenditPaymentModalProps = DokuPaymentModalProps;
export type XenditPaymentChannel = DokuPaymentChannel;
