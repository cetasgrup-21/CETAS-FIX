"use client";

import React, { useState } from "react";
import { Search, Ticket, CheckCircle2, Printer, X, AlertCircle } from "lucide-react";

interface StoredTicketWithQr {
  id: string;
  orderNumber: string;
  eventName: string;
  tierName: string;
  ticketCode: string;
  qrString: string;
  holderName: string;
  holderEmail: string;
  holderPhone?: string;
  status: string;
  qrDataUrl: string;
  createdAt: string;
}

export function TicketLookupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<StoredTicketWithQr[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 3) return;

    setLoading(true);
    setMessage(null);
    setTickets(null);

    try {
      const res = await fetch(`/api/tickets/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
        } else {
          setMessage(data.message || "Tidak ditemukan tiket aktif untuk data ini.");
        }
      } else {
        setMessage(data.message || "Gagal mencari data tiket.");
      }
    } catch {
      setMessage("Terjadi kesalahan koneksi saat mencari tiket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">Cari & Unduh Ulang E-Tiket Saya</h3>
              <p className="text-[10px] text-slate-400">
                Temukan tiket yang sudah Anda bayar kapan saja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Masukkan Email Pemesan, No. WhatsApp, atau Order ID:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Contoh: email@anda.com atau CETAS-TIC-..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-blue-600 focus:bg-white focus:outline-hidden"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 text-xs transition active:scale-95 shadow-md shadow-blue-500/20"
              >
                {loading ? "Mencari..." : "Cari Tiket"}
              </button>
            </div>
          </form>

          {/* Not Found Message */}
          {message && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Tickets Found */}
          {tickets && tickets.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">
                  Ditemukan {tickets.length} Tiket Sah
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  Status: Aktif
                </span>
              </div>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {t.ticketCode}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{t.eventName}</h4>
                        <div className="text-xs font-bold text-slate-700">Kategori: {t.tierName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Atas Nama: <strong>{t.holderName}</strong> ({t.holderEmail})
                        </div>
                      </div>
                      {t.qrDataUrl && (
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.qrDataUrl}
                            alt={`QR Code ${t.ticketCode}`}
                            className="h-20 w-20 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Order: {t.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Cetak Tiket</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
