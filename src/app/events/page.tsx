"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  QrCode as QrIcon,
  Download,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createTicketQRString, generateQRCodeDataUrl } from "@/lib/ticket-security";
import { DokuPaymentModal } from "@/components/doku-payment-modal";
import {
  INITIAL_UNIFIED_EVENTS,
  UnifiedEvent,
  getStoredEvents,
  saveStoredEvents,
} from "@/lib/events-unified-data";
import { getEventTheme, EventThemePreset } from "@/lib/event-theme";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quotaRemaining: number;
  quotaTotal: number;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  bannerUrl: string;
  description: string;
  themePreset?: EventThemePreset;
  tiers: TicketTier[];
}

interface IssuedTicket {
  ticketCode: string;
  eventName: string;
  tierName: string;
  holderName: string;
  holderEmail: string;
  date: string;
  location: string;
  qrDataUrl: string;
}

function mapToTicketingEvents(list: UnifiedEvent[]): EventItem[] {
  return list
    .filter((e: UnifiedEvent) => e.status !== "FINISHED" && e.isOpenTicketing !== false)
    .map((e: UnifiedEvent) => {
      const tiers: TicketTier[] =
        Array.isArray(e.tiers) && e.tiers.length > 0
          ? e.tiers.map((t) => ({
              id: t.id || `tier-${e.id}`,
              name: t.name || "Tiket Reguler",
              price: Number(t.price) || Number(e.price) || 50000,
              quotaTotal: Number(t.quotaTotal) || Number(e.quotaTotal) || 200,
              quotaRemaining:
                t.quotaRemaining !== undefined
                  ? Number(t.quotaRemaining)
                  : Number(e.quotaRemaining) || 200,
            }))
          : [
              {
                id: `tier-${e.id}-1`,
                name: "Tiket Reguler",
                price: Number(e.price) || 50000,
                quotaTotal: Number(e.quotaTotal) || 200,
                quotaRemaining: Number(e.quotaRemaining) || 200,
              },
            ];
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        bannerUrl: e.bannerUrl,
        description: e.description,
        themePreset: e.themePreset,
        tiers,
      };
    });
}

const DEFAULT_EVENTS: EventItem[] = mapToTicketingEvents(INITIAL_UNIFIED_EVENTS);

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);

  useEffect(() => {
    const stored = getStoredEvents();
    if (stored && stored.length > 0) {
      setEvents(mapToTicketingEvents(stored));
    }

    fetch("/api/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          saveStoredEvents(data.events);
          setEvents(mapToTicketingEvents(data.events));
        }
      })
      .catch(() => {});
  }, []);

  const [selectedTier, setSelectedTier] = useState<{ event: EventItem; tier: TicketTier } | null>(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isBuying, setIsBuying] = useState(false);

  // Digital Ticket Pass Modal
  const [issuedTicket, setIssuedTicket] = useState<IssuedTicket | null>(null);
  const [simulatorData, setSimulatorData] = useState<{
    orderNumber: string;
    grossAmount: number;
    customerName: string;
  } | null>(null);

  const generateTicketPass = async (
    event: EventItem,
    tier: TicketTier,
    holderName: string,
    holderEmail: string,
    holderPhone: string,
    qty: number
  ) => {
    const ticketCode = `CETAS-TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrString = createTicketQRString({
      ticketCode,
      eventId: event.id,
      tierId: tier.id,
      issuedAt: Date.now(),
    });
    const qrDataUrl = await generateQRCodeDataUrl(qrString);

    // Sync ticket purchase to PostgreSQL /api/events (reduce quota) and /api/attendees
    try {
      const evRes = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REDUCE_TICKET_QUOTA",
          id: event.id,
          tierId: tier.id,
          quantity: qty,
        }),
      });
      const evData = await evRes.json();
      if (evData.success && Array.isArray(evData.events)) {
        saveStoredEvents(evData.events);
        setEvents(
          evData.events
            .filter((e: UnifiedEvent) => e.status !== "FINISHED" && e.isOpenTicketing !== false)
            .map((e: UnifiedEvent) => ({
              id: e.id,
              title: e.title,
              date: e.date,
              location: e.location,
              bannerUrl: e.bannerUrl,
              description: e.description,
              themePreset: e.themePreset,
              tiers: e.tiers || [],
            }))
        );
      }
    } catch {}

    try {
      await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: holderName,
          email: holderEmail,
          phone: holderPhone || "-",
          institution: `Pemegang Tiket (${tier.name} x${qty})`,
          category: tier.name,
          eventId: event.id,
          eventName: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          notes: `Kode Tiket: ${ticketCode}`,
        }),
      });
    } catch {}

    setIssuedTicket({
      ticketCode,
      eventName: event.title,
      tierName: `${tier.name} (${qty} Tiket)`,
      holderName,
      holderEmail,
      date: event.date,
      location: event.location,
      qrDataUrl,
    });
  };

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setIsBuying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "TICKET",
          customerName: buyerName,
          customerEmail: buyerEmail,
          customerPhone: buyerPhone,
          items: [
            {
              id: selectedTier.tier.id,
              name: `${selectedTier.event.title} - ${selectedTier.tier.name}`,
              quantity: ticketQty,
              price: selectedTier.tier.price,
              eventId: selectedTier.event.id,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat transaksi tiket");
      }

      // Tampilkan DOKU Direct API Modal (QRIS & E-Wallet)
      setSimulatorData({
        orderNumber: data.orderNumber,
        grossAmount: selectedTier.tier.price * ticketQty,
        customerName: buyerName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kesalahan koneksi";
      alert(msg);
    } finally {
      setIsBuying(false);
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700 mb-2 border border-purple-200">
          <Ticket className="h-3.5 w-3.5" />
          Cetas Ticketing • Sistem Tiket Digital Ber-QR Aman
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Jelajah & Beli Tiket Event Resmi
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Setiap e-tiket dilengkapi tanda tangan digital HMAC SHA-256 untuk memastikan keaslian tiket di pintu masuk gerbang (anti-calo & anti-duplikasi).
        </p>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center space-y-3 bg-white dark:bg-slate-900">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
          <div className="text-base font-bold text-slate-700 dark:text-slate-300">
            Belum ada tiket event yang tersedia saat ini
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Event dan penjualan tiket dapat dibuat dan diaktifkan melalui Lingkup Kerja Admin.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition"
            >
              Buka Lingkup Kerja Admin →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {events.map((event) => {
          const theme = getEventTheme(event.themePreset);
          return (
            <div
              key={event.id}
              className={`overflow-hidden rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${theme.borderLightClass}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Event Image */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.bannerUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm backdrop-blur-md bg-slate-950/80 text-white border border-white/20 flex items-center gap-1.5`}>
                      <span className={`h-2 w-2 rounded-full ${theme.bgGradient}`} />
                      Tema: {theme.name.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Event Details & Tiers */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                      <span className={`flex items-center gap-1 font-bold ${theme.textClass}`}>
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {event.location}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {event.title}
                      </h2>
                      <Link
                        href={`/vote?eventId=${event.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-950 text-cyan-300 border border-blue-500/40 text-xs font-bold shrink-0 hover:bg-blue-900/60 transition shadow-sm"
                      >
                        Buka Dashboard Event &rarr;
                      </Link>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {event.description}
                    </p>
                  </div>

                  {/* Ticket Tiers */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pilihan Kategori Tiket
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {event.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              {tier.name}
                            </div>
                            <div className={`text-sm font-black mt-1 ${theme.textClass}`}>
                              {formatRupiah(tier.price)}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Sisa kuota: {tier.quotaRemaining} tiket
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedTier({ event, tier })}
                            className={`mt-3 w-full rounded-xl font-bold py-2 text-xs transition active:scale-95 shadow-sm ${theme.buttonClass}`}
                          >
                            Pilih Tiket
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Buy Ticket Form Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Konfirmasi Pembelian Tiket
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedTier.tier.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedTier.event.title}</p>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBuyTicket} className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Tiket
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setTicketQty(num)}
                      className={`h-9 w-9 rounded-xl font-bold text-xs border transition ${
                        ticketQty === num
                          ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Pemilik Tiket *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai KTP / SIM"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email E-Tiket *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@anda.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Total Pembayaran Tiket</div>
                  <div className="text-base font-black text-blue-600 dark:text-blue-400">
                    {formatRupiah(selectedTier.tier.price * ticketQty)}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isBuying}
                  className="rounded-xl bg-[#E1251B] hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-red-500/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isBuying ? "Memproses..." : "Bayar via DOKU (QRIS / E-Wallet)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official E-Ticket Pass Modal */}
      {issuedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 text-white p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-4">
            {/* Header Ticket */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-extrabold text-xs">
                  C
                </div>
                <span className="font-black text-sm tracking-tight">
                  CETAS OFFICIAL E-TICKET
                </span>
              </div>
              <button
                onClick={() => setIssuedTicket(null)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Ant-Man Thumbs Up Celebration Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-950/80 border border-blue-500/40">
              <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-cyan-400/40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot/cetas_ant_thumbsup.png"
                  alt="Anty Thumbs Up CETAS"
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-200 flex items-center gap-1">
                  <span>Anty: Mantap! Tiket Berhasil Diterbitkan!</span>
                  <span>👍</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  Tunjukkan kode QR di bawah ke petugas gerbang scanner saat masuk acara.
                </div>
              </div>
            </div>

            {/* Ticket Card Body */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {issuedTicket.tierName}
                </span>
                <h3 className="text-lg font-black leading-tight mt-0.5">
                  {issuedTicket.eventName}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Nama Tamu</span>
                  <div className="font-bold">{issuedTicket.holderName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Kode Tiket</span>
                  <div className="font-mono font-bold text-cyan-400">
                    {issuedTicket.ticketCode}
                  </div>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400">Lokasi Acara</span>
                  <div className="text-[11px] text-slate-300 font-medium">
                    {issuedTicket.location}
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issuedTicket.qrDataUrl}
                  alt="Dynamic QR Code"
                  className="h-44 w-44 object-contain"
                />
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  HMAC-SHA256 SECURED PASS
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs shadow-md transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak / Simpan Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOKU Direct API Modal (QRIS & E-Wallet) */}
      {simulatorData && selectedTier && (
        <DokuPaymentModal
          isOpen={!!simulatorData}
          orderNumber={simulatorData.orderNumber}
          grossAmount={simulatorData.grossAmount}
          customerName={simulatorData.customerName}
          customerEmail={buyerEmail}
          onClose={() => setSimulatorData(null)}
          onSuccess={async () => {
            try {
              await generateTicketPass(
                selectedTier.event,
                selectedTier.tier,
                buyerName,
                buyerEmail,
                buyerPhone,
                ticketQty
              );
            } catch (err) {
              console.error("Error generating ticket pass:", err);
            } finally {
              setSelectedTier(null);
              setSimulatorData(null);
            }
          }}
        />
      )}

    </div>
  );
}

