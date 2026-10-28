"use client";

import React, { useState } from "react";
import {
  Search,
  Ticket,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  KeyRound,
} from "lucide-react";

interface LookupTicket {
  id: string;
  orderNumber: string;
  rawOrderNumber?: string;
  eventName: string;
  tierName: string;
  ticketCode: string;
  holderName: string;
  holderEmail: string;
  holderPhoneMasked?: string;
  hasPhone: boolean;
  status: string;
  isAuthorized: boolean;
  isProtected: boolean;
  qrDataUrl: string;
  whatsappUrl: string;
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
  const [unlockOrderId, setUnlockOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<LookupTicket[] | null>(null);
  const [isProtectedView, setIsProtectedView] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const runSearch = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 3) return;

    setLoading(true);
    setMessage(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/tickets/lookup?query=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      if (data.success) {
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
          setIsProtectedView(!!data.isProtected);
          if (data.protectionNotice) {
            setNotice(data.protectionNotice);
          }
        } else {
          setTickets(null);
          setMessage(data.message || "Tidak ditemukan tiket aktif untuk data ini.");
        }
      } else {
        setTickets(null);
        setMessage(data.message || "Gagal mencari data tiket.");
      }
    } catch {
      setTickets(null);
      setMessage("Terjadi kesalahan koneksi saat mencari tiket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleUnlockWithOrderId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockOrderId.trim()) return;
    setQuery(unlockOrderId.trim());
    runSearch(unlockOrderId.trim());
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">Cek & Unduh E-Tiket Saya</h3>
              <p className="text-[10px] text-slate-400">
                Sistem Aman Anti-Pencurian Tiket CETAS
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
              Cari berdasarkan Email, No. WhatsApp, atau Order ID:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Contoh: email@anda.com atau CETAS-TIC-..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-purple-600 focus:bg-white focus:outline-hidden"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 text-xs transition active:scale-95 shadow-md shadow-purple-500/20"
              >
                {loading ? "Mencari..." : "Cari"}
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

          {/* Anti-Theft Security Notice */}
          {isProtectedView && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-blue-800">
                <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Perlindungan Anti-Pencurian Tiket Aktif</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                {notice ||
                  "Demi melindungi tiket Anda agar tidak disalin orang lain yang sembarangan menebak email, QR Code gate disamarkan dan dapat dikirim langsung ke WhatsApp terdaftar."}
              </p>
            </div>
          )}

          {/* Tickets Found */}
          {tickets && tickets.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">
                  Ditemukan {tickets.length} Tiket Terverifikasi
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Aktif & Sah
                </span>
              </div>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                          {t.ticketCode}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">{t.eventName}</h4>
                        <div className="text-xs font-bold text-slate-700">Kategori: {t.tierName}</div>
                        <div className="text-[11px] text-slate-500">
                          Nama: <strong>{t.holderName}</strong> • Email: {t.holderEmail}
                        </div>
                      </div>

                      {/* Display QR Code if authorized */}
                      {t.isAuthorized && t.qrDataUrl ? (
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 text-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.qrDataUrl}
                            alt={`QR Code ${t.ticketCode}`}
                            className="h-20 w-20 object-contain mx-auto"
                          />
                          <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                            SCAN DI GATE
                          </span>
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-xl bg-slate-200/80 border border-slate-300 flex flex-col items-center justify-center p-1.5 text-center shrink-0">
                          <ShieldAlert className="h-5 w-5 text-slate-500 mb-0.5" />
                          <span className="text-[8px] font-bold text-slate-600 leading-tight">
                            QR Terkunci
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      {t.isProtected ? (
                        /* Protected Mode: Send to WhatsApp */
                        <div className="space-y-2">
                          <a
                            href={t.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition active:scale-95"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>
                              Kirim E-Tiket ke WhatsApp ({t.holderPhoneMasked || "Terdaftar"})
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          {/* Quick Unlock by Order Number */}
                          <form
                            onSubmit={handleUnlockWithOrderId}
                            className="flex items-center gap-1.5 pt-1"
                          >
                            <input
                              type="text"
                              placeholder="Ketik Order ID (CETAS-...) untuk buka di sini"
                              value={unlockOrderId}
                              onChange={(e) => setUnlockOrderId(e.target.value)}
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-mono focus:border-purple-600 focus:outline-hidden"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-slate-800 transition shrink-0 flex items-center gap-1"
                            >
                              <KeyRound className="h-3 w-3" />
                              <span>Buka</span>
                            </button>
                          </form>
                        </div>
                      ) : (
                        /* Authorized Mode: Direct Print / Download */
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Order: {t.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Cetak / Unduh Tiket</span>
                          </button>
                        </div>
                      )}
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
