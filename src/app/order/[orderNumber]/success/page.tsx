"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Printer,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

interface VerifiedTicket {
  id: string;
  orderNumber: string;
  eventName: string;
  tierName: string;
  ticketCode: string;
  holderName: string;
  holderEmail: string;
  status: string;
  qrDataUrl: string;
}

interface OrderStatusResponse {
  success: boolean;
  orderNumber?: string;
  isPaid: boolean;
  paymentStatus: string;
  paymentChannel?: string;
  totalAmount?: number;
  settledAt?: string;
  tickets?: VerifiedTicket[];
  message?: string;
}

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const [orderData, setOrderData] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, {
        cache: "no-store",
      });
      const data = await res.json();
      setOrderData(data);
    } catch (err) {
      console.error("Error fetching order status:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-poll every 4 seconds if pending
    const timer = setInterval(() => {
      fetchStatus();
    }, 4000);
    return () => clearInterval(timer);
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-xs font-bold text-slate-600">Memverifikasi status pesanan resmi...</p>
      </div>
    );
  }

  if (!orderData || !orderData.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-lg font-black text-slate-900">Pesanan Tidak Ditemukan</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nomor pesanan <strong>{orderNumber}</strong> tidak ditemukan pada sistem database CETAS.
          </p>
          <div className="pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Halaman Acara
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = orderData.isPaid;
  const tickets = orderData.tickets || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Portal CETAS
          </Link>
          <span className="text-xs font-mono font-bold text-slate-400">
            {orderNumber}
          </span>
        </div>

        {/* STATUS CARD: PAID (VERIFIED) */}
        {isPaid ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header Settlement */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white text-center space-y-3 relative overflow-hidden">
              <div className="relative flex justify-center">
                <AntmanMascot pose="thumbsup" interactive size={140} className="drop-shadow-lg" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-xs border border-white/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Xendit Gateway Settlement Terverifikasi</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Pembayaran Sukses Terverifikasi! 🎉
              </h1>
              <p className="text-xs text-white/90 max-w-md mx-auto leading-relaxed">
                Transaksi senilai <strong>{formatRupiah(orderData.totalAmount || 0)}</strong> telah sah lunas. E-tiket resmi Anda telah diterbitkan dan tersimpan di database CETAS.
              </p>
            </div>

            {/* Ticket Passes Cards */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    E-Ticket Masuk Resmi ({tickets.length} Tiket)
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    Siap Digunakan
                  </span>
                </div>

                {tickets.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center gap-5 justify-between"
                  >
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block">
                        {t.ticketCode}
                      </span>
                      <h3 className="text-base font-black text-slate-900">{t.eventName}</h3>
                      <div className="text-xs font-bold text-slate-700">Kategori: {t.tierName}</div>
                      <div className="text-[11px] text-slate-500">
                        Pemegang: <strong>{t.holderName}</strong> ({t.holderEmail})
                      </div>
                    </div>

                    <div className="shrink-0 text-center space-y-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      {t.qrDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.qrDataUrl}
                          alt={`QR Code ${t.ticketCode}`}
                          className="h-32 w-32 object-contain mx-auto"
                        />
                      ) : (
                        <div className="h-32 w-32 flex items-center justify-center text-xs text-slate-400">
                          QR Code Valid
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                        Scan di Pintu Gate
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Settlement Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Nomor Tagihan:</span>
                  <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Saluran Pembayaran:</span>
                  <span className="font-bold text-blue-700">{orderData.paymentChannel || "Xendit Gateway"}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Waktu Settlement:</span>
                  <span className="font-mono text-slate-700">{orderData.settledAt || "Real-Time"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 text-xs shadow-md transition active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak / Simpan PDF Tiket</span>
                </button>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 text-xs transition"
                >
                  <span>Selesai &amp; Kembali</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* STATUS CARD: PENDING / WAITING */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="h-7 w-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900">Menunggu Pembayaran Terverifikasi</h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Kami sedang menunggu konfirmasi pembayaran dari Xendit Payment Gateway untuk pesanan <strong>{orderNumber}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between text-slate-600">
                <span>Total Tagihan:</span>
                <span className="font-bold text-slate-900">{formatRupiah(orderData.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Saat Ini:</span>
                <span className="font-bold text-amber-700 uppercase">{orderData.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-3 max-w-md mx-auto space-y-2">
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={refreshing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 text-xs shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Memeriksa Status..." : "Cek Ulang Status Pembayaran Sekarang"}</span>
              </button>

              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Halaman ini memeriksa status secara otomatis setiap 4 detik</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
