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
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import QRCode from "qrcode";
import { generateQrisPayloadString } from "@/lib/doku";
import { playVoteNotificationSound } from "@/lib/sound";

export type DokuPaymentChannel = "QRIS" | "SHOPEEPAY" | "DANA" | "OVO";

export interface DokuPaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
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
  successTitle,
  successSubtitle,
  onSuccess,
  onClose,
}: DokuPaymentModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<DokuPaymentChannel>("QRIS");
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [ovoPhone, setOvoPhone] = useState<string>(customerPhone);
  const [ovoPushed, setOvoPushed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins

  // Generate real QR image on open
  useEffect(() => {
    if (isOpen) {
      const qrisString = generateQrisPayloadString(orderNumber, grossAmount);
      QRCode.toDataURL(qrisString, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      }).then(setQrDataUrl).catch(console.error);

      setTimeLeft(15 * 60);
      setIsSuccessView(false);
      setOvoPushed(false);
    }
  }, [isOpen, orderNumber, grossAmount]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccessView || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSuccessView, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleSimulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsSuccessView(true);
      playVoteNotificationSound();
    }, 500);
  };

  const handleCompleteSuccess = () => {
    setIsSuccessView(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-red-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* DOKU Direct API Official Header */}
        <div className="bg-[#E1251B] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            {/* DOKU Brand Icon */}
            <div className="h-8 w-8 rounded-xl bg-white text-[#E1251B] font-black text-sm flex items-center justify-center shadow-xs">
              D
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-2">
                <span>DOKU DIRECT API</span>
                <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full border border-white/30">
                  SNAP BI ASPI
                </span>
              </div>
              <div className="text-[10px] text-white/80">
                Payment Gateway Resmi • CETAS Ecosystem
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONDITION: PAYMENT SUCCESS WITH ANTY MASCOT */}
        {isSuccessView ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto">
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

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                DOKU Direct API Settlement Sukses
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {successTitle || "Pembayaran Sukses Terverifikasi! 🎉"}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successSubtitle || (
                  <>
                    Transaksi senilai <strong>{formatRupiah(grossAmount)}</strong> telah lunas via DOKU ({selectedChannel}). Tiket pass ber-QR / suara voting Anda telah diterbitkan secara instan!
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Nomor Invoice DOKU:</span>
                <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-[#E1251B]">DOKU Direct ({selectedChannel})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status Gateway:</span>
                <span className="font-bold text-emerald-600">PAID & SETTLED (0 Detik)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E1251B] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold py-3 text-xs shadow-lg shadow-red-500/25 transition active:scale-95"
              >
                <span>Lihat Tiket / Hasil Vote</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Checkout & Payment Channel Selector */
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Invoice & Countdown Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Nomor Tagihan DOKU
                </div>
                <div className="text-xs font-mono font-bold text-slate-800">{orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Bayar
                </div>
                <div className="text-base font-black text-[#E1251B]">
                  {formatRupiah(grossAmount)}
                </div>
              </div>
            </div>

            {/* Direct API Channel Tabs (QRIS & E-Wallet: OVO, ShopeePay, DANA) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Pilih Saluran Pembayaran DOKU Direct:
                </label>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Clock className="h-3 w-3" />
                  <span>Batas: {formattedTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("QRIS")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedChannel === "QRIS"
                      ? "border-[#E1251B] bg-red-50/70 text-[#E1251B] shadow-sm ring-1 ring-[#E1251B]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-red-100 text-[#E1251B] flex items-center justify-center font-black">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-black">QRIS</span>
                </button>

                {/* ShopeePay */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("SHOPEEPAY")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedChannel === "SHOPEEPAY"
                      ? "border-orange-500 bg-orange-50/70 text-orange-700 shadow-sm ring-1 ring-orange-500"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-[10px]">
                    SPay
                  </div>
                  <span className="text-[11px] font-black">ShopeePay</span>
                </button>

                {/* DANA */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("DANA")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedChannel === "DANA"
                      ? "border-blue-500 bg-blue-50/70 text-blue-700 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px]">
                    DANA
                  </div>
                  <span className="text-[11px] font-black">DANA</span>
                </button>

                {/* OVO */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("OVO")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedChannel === "OVO"
                      ? "border-purple-600 bg-purple-50/70 text-purple-700 shadow-sm ring-1 ring-purple-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-[10px]">
                    OVO
                  </div>
                  <span className="text-[11px] font-black">OVO</span>
                </button>
              </div>
            </div>

            {/* CHANNEL CONTENT */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              {/* 1. QRIS CHANNEL */}
              {selectedChannel === "QRIS" && (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                    {qrDataUrl ? (
                      <Image
                        src={qrDataUrl}
                        alt="DOKU QRIS Code"
                        width={180}
                        height={180}
                        className="rounded-lg object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                        <QrCode className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-800">
                      Scan QRIS dengan Aplikasi Mobile Banking & E-Wallet Apapun
                    </div>
                    <div className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      BCA, Mandiri, BRImo, BNI, Jago, Seabank, GoPay, ShopeePay, OVO, DANA, LinkAja.
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SHOPEEPAY CHANNEL */}
              {selectedChannel === "SHOPEEPAY" && (
                <div className="space-y-3 py-2">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">
                    🛍️
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      DOKU Direct API • ShopeePay E-Wallet
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                      Buka aplikasi Shopee di smartphone Anda untuk mengonfirmasi pembayaran instan senilai <strong>{formatRupiah(grossAmount)}</strong>.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Auto-Deeplink ke ShopeePay App Siap</span>
                  </div>
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
                      DOKU Direct API • DANA Dompet Digital
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                      Transaksi langsung terhubung ke akun DANA Anda dengan proteksi DANA Protection.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>DANA Direct Web/App Checkout Siap</span>
                  </div>
                </div>
              )}

              {/* 4. OVO CHANNEL (PUSH NOTIFICATION FLOW) */}
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
                      <span>Notifikasi pembayaran telah dikirim ke HP {ovoPhone}. Silakan buka aplikasi OVO dalam 30 detik.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sandbox Simulation Button */}
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
                <span>DOKU Direct API Sandbox • QRIS MPM & E-Wallet (OVO, SPay, DANA) Resmi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
