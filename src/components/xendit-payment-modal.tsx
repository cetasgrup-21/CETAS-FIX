"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  AlertCircle,
  FlaskConical,
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
  onSuccess: (verifiedTickets?: any[]) => void;
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
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [ovoPhone, setOvoPhone] = useState<string>(customerPhone);
  const [ovoPushed, setOvoPushed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusSeverity, setStatusSeverity] = useState<"info" | "warning">("info");
  const [verifiedTickets, setVerifiedTickets] = useState<any[]>([]);

  // Function to verify payment status with backend API
  const verifyPaymentStatus = useCallback(
    async (isManual = false) => {
      if (!orderNumber || isSuccessView) return;
      if (isManual) {
        setIsChecking(true);
        setStatusMessage("Menghubungi server untuk memverifikasi pembayaran...");
        setStatusSeverity("info");
      }

      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`);
        if (!res.ok) {
          if (isManual) {
            setStatusMessage("Pesanan belum terkonfirmasi oleh sistem pembayaran.");
            setStatusSeverity("warning");
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.isPaid) {
          setVerifiedTickets(data.tickets || []);
          setIsSuccessView(true);
          playVoteNotificationSound();
        } else if (isManual) {
          setStatusMessage("Pembayaran belum terdeteksi. Silakan selesaikan transaksi lalu klik tombol ini lagi.");
          setStatusSeverity("warning");
        }
      } catch (err) {
        console.error("Gagal memeriksa status pembayaran:", err);
        if (isManual) {
          setStatusMessage("Gagal memeriksa status. Periksa koneksi internet Anda.");
          setStatusSeverity("warning");
        }
      } finally {
        if (isManual) {
          setIsChecking(false);
          setTimeout(() => setStatusMessage(""), 5000);
        }
      }
    },
    [orderNumber, isSuccessView]
  );

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
      setVerifiedTickets([]);
      setStatusMessage("");
    }
  }, [isOpen, orderNumber, grossAmount]);

  // Automatic real-time status polling every 3 seconds
  useEffect(() => {
    if (!isOpen || isSuccessView || timeLeft <= 0) return;
    const pollTimer = setInterval(() => {
      verifyPaymentStatus(false);
    }, 3000);
    return () => clearInterval(pollTimer);
  }, [isOpen, isSuccessView, timeLeft, verifyPaymentStatus]);

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

  const handleCompleteSuccess = () => {
    setIsSuccessView(false);
    onSuccess(verifiedTickets);
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
                Xendit Gateway Settlement Terverifikasi
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {successTitle || "Pembayaran Sukses Terverifikasi! 🎉"}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successSubtitle || (
                  <>
                    Transaksi senilai <strong>{formatRupiah(grossAmount)}</strong> telah diverifikasi lunas oleh sistem Xendit. Tiket pass ber-QR / suara voting Anda telah sah diterbitkan!
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Nomor Tagihan:</span>
                <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-blue-700">Xendit ({selectedChannel})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status Gateway:</span>
                <span className="font-bold text-emerald-600">PAID & SETTLED (Server Verified)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 text-xs shadow-lg shadow-blue-500/25 transition active:scale-95"
              >
                <span>Lihat Tiket / Hasil Transaksi</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Checkout & Payment Channel Selector */
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Amount and Countdown Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Total Tagihan
                </span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatRupiah(grossAmount)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Order ID: <span className="font-mono font-bold">{orderNumber}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 font-mono font-bold text-xs shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  <span>{formattedTime}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Batas Waktu Bayar</span>
              </div>
            </div>

            {/* Notification message if any */}
            {statusMessage && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  statusSeverity === "warning"
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Xendit Channel Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Pilih Saluran Pembayaran Xendit:</span>
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verifikasi Otomatis
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("QRIS")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    selectedChannel === "QRIS"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <QrCode className="h-5 w-5 mb-1 text-blue-600" />
                  <span>QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("SHOPEEPAY")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    selectedChannel === "SHOPEEPAY"
                      ? "border-orange-500 bg-orange-50/70 text-orange-700 ring-2 ring-orange-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1 text-orange-500" />
                  <span>ShopeePay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("DANA")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    selectedChannel === "DANA"
                      ? "border-sky-500 bg-sky-50/70 text-sky-700 ring-2 ring-sky-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1 text-sky-500" />
                  <span>DANA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("OVO")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    selectedChannel === "OVO"
                      ? "border-purple-600 bg-purple-50/70 text-purple-700 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Smartphone className="h-5 w-5 mb-1 text-purple-600" />
                  <span>OVO</span>
                </button>
              </div>
            </div>

            {/* CHANNEL CONTENT: QRIS */}
            {selectedChannel === "QRIS" && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                    Scan QRIS untuk Bayar
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                    BCA • Mandiri • GoPay • OVO • DANA • LinkAja
                  </span>
                </div>

                <div className="flex justify-center p-3 bg-white rounded-2xl border border-slate-200 max-w-[210px] mx-auto shadow-inner">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Xendit Dynamic QRIS Code"
                      className="h-44 w-44 object-contain"
                    />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400">
                      Membuat QR Code...
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Buka aplikasi mobile banking atau e-wallet pilihan Anda, arahkan kamera ke kode QR di atas, dan selesaikan pembayaran. Sistem akan memverifikasi secara otomatis.
                </p>
              </div>
            )}

            {/* CHANNEL CONTENT: SHOPEEPAY */}
            {selectedChannel === "SHOPEEPAY" && (
              <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-orange-700 font-black text-sm">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                  <span>ShopeePay QR &amp; Deeplink</span>
                </div>
                <div className="flex justify-center p-3 bg-white rounded-2xl border border-orange-200 max-w-[210px] mx-auto shadow-inner">
                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="ShopeePay QRIS"
                      className="h-44 w-44 object-contain"
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Buka aplikasi Shopee di ponsel Anda untuk menyelesaikan pembayaran via Xendit.
                </p>
              </div>
            )}

            {/* CHANNEL CONTENT: DANA */}
            {selectedChannel === "DANA" && (
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sky-700 font-black text-sm">
                  <Smartphone className="h-5 w-5 text-sky-600" />
                  <span>DANA E-Wallet</span>
                </div>
                <div className="flex justify-center p-3 bg-white rounded-2xl border border-sky-200 max-w-[210px] mx-auto shadow-inner">
                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="DANA QRIS"
                      className="h-44 w-44 object-contain"
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pembayaran instan langsung dari saldo dompet DANA melalui Xendit.
                </p>
              </div>
            )}

            {/* CHANNEL CONTENT: OVO */}
            {selectedChannel === "OVO" && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <span>OVO Push Payment</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Tagihan pembayaran akan langsung dikirimkan ke aplikasi OVO yang terpasang pada nomor handphone Anda:
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={ovoPhone}
                      onChange={(e) => setOvoPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-purple-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setOvoPushed(true)}
                      className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 text-xs font-bold transition"
                    >
                      Kirim Tagihan
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

            {/* ACTION BUTTONS (SECURE REAL-TIME VERIFICATION & OFFICIAL CHECKOUT) */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              {/* Primary Action: Hosted Checkout via Xendit */}
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 text-xs shadow-md shadow-blue-500/25 transition active:scale-95"
                >
                  <span>Buka Halaman Checkout Resmi Xendit (Bayar QRIS / VA / E-Wallet)</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {/* Status Check Button */}
              <button
                type="button"
                onClick={() => verifyPaymentStatus(true)}
                disabled={isChecking}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 text-xs transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin text-blue-600" : ""}`} />
                <span>{isChecking ? "Memverifikasi dengan Xendit Gateway..." : "Cek Status Pembayaran (Real-Time)"}</span>
              </button>

              {/* Test Mode Guidance Banner */}
              <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-800">
                  <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
                  <span>Xendit Sandbox Test Mode</span>
                </div>
                <p className="text-[10px] text-amber-700/90 leading-relaxed max-w-sm mx-auto">
                  Untuk menguji simulasi pembayaran resmi, klik tombol <strong>Buka Halaman Checkout Resmi Xendit</strong> di atas, lalu klik banner merah simulasi di halaman Xendit untuk memicu Webhook & pelunasan resmi.
                </p>
              </div>

              <div className="text-center text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
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
