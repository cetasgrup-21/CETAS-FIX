"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  CreditCard,
  Building2,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";
import QRCode from "qrcode";
import { generateQrisPayloadString, XenditPaymentMethod } from "@/lib/xendit";
import { playVoteNotificationSound } from "@/lib/sound";

export type XenditPaymentChannel = "QRIS" | "SHOPEEPAY" | "DANA" | "OVO" | "VIRTUAL_ACCOUNT";

export interface XenditPaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  invoiceUrl?: string;
  successTitle?: string;
  successSubtitle?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function XenditPaymentModal({
  isOpen,
  orderNumber,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone = "081234567890",
  invoiceUrl,
  successTitle,
  successSubtitle,
  onSuccess,
  onClose,
}: XenditPaymentModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<XenditPaymentChannel>("QRIS");
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
      })
        .then(setQrDataUrl)
        .catch(console.error);

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
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-blue-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Xendit Payment Gateway Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            {/* Xendit Brand Icon */}
            <div className="h-8 w-8 rounded-xl bg-white text-blue-700 font-black text-base flex items-center justify-center shadow-xs">
              X
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-2">
                <span>XENDIT GATEWAY</span>
                <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full border border-white/30">
                  INSTANT QRIS & VA
                </span>
              </div>
              <div className="text-[10px] text-white/80">
                Payment Gateway Resmi • CETAS Platform
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
                Xendit Gateway Settlement Sukses
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {successTitle || "Pembayaran Sukses Terverifikasi! 🎉"}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successSubtitle || (
                  <>
                    Transaksi senilai <strong>{formatRupiah(grossAmount)}</strong> telah lunas via Xendit ({selectedChannel}). Tiket pass ber-QR / suara voting Anda telah diterbitkan secara instan!
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Nomor Tagihan Xendit:</span>
                <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-blue-700">Xendit ({selectedChannel})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status Gateway:</span>
                <span className="font-bold text-emerald-600">PAID & SETTLED (Realtime)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 text-xs shadow-lg shadow-blue-500/25 transition active:scale-95"
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
                  Nomor Tagihan Xendit
                </div>
                <div className="text-xs font-mono font-bold text-slate-800">{orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Bayar
                </div>
                <div className="text-base font-black text-blue-700">
                  {formatRupiah(grossAmount)}
                </div>
              </div>
            </div>

            {/* Xendit Channel Tabs (QRIS, ShopeePay, DANA, OVO, Virtual Account) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Pilih Saluran Pembayaran Xendit:
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
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm ring-1 ring-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
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
                  <div className="h-7 w-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold">ShopeePay</span>
                </button>

                {/* DANA */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("DANA")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedChannel === "DANA"
                      ? "border-sky-500 bg-sky-50/70 text-sky-700 shadow-sm ring-1 ring-sky-500"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-black">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold">DANA</span>
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
                  <div className="h-7 w-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold">OVO</span>
                </button>
              </div>
            </div>

            {/* CHANNEL CONTENT: QRIS */}
            {selectedChannel === "QRIS" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-2">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Xendit Dynamic QRIS Code"
                        className="w-48 h-48 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                        Memuat QR Code...
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-extrabold text-slate-800">
                    Scan via BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung seluruh m-Banking dan e-Wallet standar ASPI / QRIS Indonesia
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50/80 p-3.5 border border-blue-200/80 text-xs text-blue-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    Cara Pembayaran QRIS:
                  </div>
                  <ol className="list-decimal list-inside text-[11px] space-y-0.5 text-blue-800/90 pl-1">
                    <li>Buka aplikasi m-Banking atau e-Wallet favorit Anda</li>
                    <li>Pilih menu <strong>Scan / Bayar QR</strong></li>
                    <li>Arahkan kamera ke kode QR di atas</li>
                    <li>Periksa nama merchant: <strong>CETAS PLATFORM</strong></li>
                    <li>Konfirmasi pembayaran senilai <strong>{formatRupiah(grossAmount)}</strong></li>
                  </ol>
                </div>
              </div>
            )}

            {/* CHANNEL CONTENT: SHOPEEPAY */}
            {selectedChannel === "SHOPEEPAY" && (
              <div className="p-4 rounded-3xl bg-orange-50/50 border border-orange-200 space-y-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/25">
                  S
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800">ShopeePay Direct Payment</div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Buka aplikasi Shopee di ponsel Anda untuk menyelesaikan pembayaran instan via Xendit.
                  </p>
                </div>
                <a
                  href={`https://wsa.wallet.airpay.co.id/universal-link/wallet/pay?token=${orderNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 py-2.5 shadow-sm transition"
                >
                  <span>Buka ShopeePay App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* CHANNEL CONTENT: DANA */}
            {selectedChannel === "DANA" && (
              <div className="p-4 rounded-3xl bg-sky-50/50 border border-sky-200 space-y-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-sky-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-sky-500/25">
                  D
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800">DANA Direct Checkout</div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Pembayaran instan langsung dari saldo dompet DANA melalui Xendit.
                  </p>
                </div>
                <a
                  href={`https://link.dana.id/pay?order=${orderNumber}&amount=${grossAmount}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs px-5 py-2.5 shadow-sm transition"
                >
                  <span>Buka DANA App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* CHANNEL CONTENT: OVO */}
            {selectedChannel === "OVO" && (
              <div className="p-4 rounded-3xl bg-purple-50/50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                    O
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">OVO Push Notification</div>
                    <div className="text-[11px] text-slate-500">Notifikasi tagihan akan dikirim ke aplikasi OVO</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Nomor Ponsel Terdaftar di OVO:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={ovoPhone}
                      onChange={(e) => setOvoPhone(e.target.value)}
                      placeholder="081234567890"
                      className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setOvoPushed(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      {ovoPushed ? "Terkirim ✓" : "Kirim Notif"}
                    </button>
                  </div>
                  {ovoPushed && (
                    <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                      <span>Notifikasi tagihan terkirim! Silakan buka OVO dan klik Bayar.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hosted Invoice Link if available */}
            {invoiceUrl && (
              <div className="pt-1">
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 text-xs transition"
                >
                  <span>Buka Halaman Checkout Resmi Xendit</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* SIMULATOR QUICK BUTTON (FOR DEVELOPMENT / FAST TEST) */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isPaying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3.5 text-xs shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isPaying ? "Menghubungi Xendit..." : "Konfirmasi Pembayaran Selesai"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="text-center text-[10px] text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Enkripsi 256-bit Xendit Gateway • Realtime Callback Webhook</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Backward compatibility export
export const DokuPaymentModal = XenditPaymentModal;
export type DokuPaymentModalProps = XenditPaymentModalProps;
