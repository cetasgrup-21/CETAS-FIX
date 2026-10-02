"use client";

import { useState, useEffect } from "react";
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
import { MidtransSimulatorModal } from "@/components/midtrans-simulator-modal";
import { UnifiedEvent } from "@/lib/events-unified-data";

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

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "ev-01",
    title: "Cetas SoundFest 2026: Live Music & Creative Carnival",
    date: "2026-11-20",
    location: "Stadion Madya GBK, Senayan, Jakarta",
    bannerUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    description:
      "Konser musik spektakuler yang menampilkan 12 musisi papan atas Indonesia dengan tata panggung dan sound system dari Cetas Production.",
    tiers: [
      { id: "tier-01", name: "Festival Early Bird", price: 150000, quotaRemaining: 18, quotaTotal: 200 },
      { id: "tier-02", name: "Festival Regular", price: 250000, quotaRemaining: 340, quotaTotal: 500 },
      { id: "tier-03", name: "VIP Lounge (Front Row + Merch)", price: 650000, quotaRemaining: 42, quotaTotal: 100 },
    ],
  },
  {
    id: "ev-02",
    title: "Seminar Nasional: Masa Depan Ekonomi Kreatif & AI",
    date: "2026-12-05",
    location: "Auditorium Graha Cakrawala & Hybrid Live Stream",
    bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    description:
      "Konferensi industri kreatif bersama para founder startup dan pelaku industri seni visual terkemuka.",
    tiers: [
      { id: "tier-04", name: "Online Streaming Pass", price: 50000, quotaRemaining: 210, quotaTotal: 500 },
      { id: "tier-05", name: "Offline All Access + E-Sertifikat", price: 120000, quotaRemaining: 65, quotaTotal: 150 },
    ],
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events && data.events.length > 0) {
          // Filter events that have ticketing enabled
          const ticketingEvents = data.events
            .filter((e: UnifiedEvent) => e.isOpenTicketing && e.tiers && e.tiers.length > 0)
            .map((e: UnifiedEvent) => ({
              id: e.id,
              title: e.title,
              date: e.date,
              location: e.location,
              bannerUrl: e.bannerUrl,
              description: e.description,
              tiers: e.tiers,
            }));
          if (ticketingEvents.length > 0) {
            setEvents(ticketingEvents);
          }
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
    holderEmail: string
  ) => {
    const ticketCode = `CETAS-TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrString = createTicketQRString({
      ticketCode,
      eventId: event.id,
      tierId: tier.id,
      issuedAt: Date.now(),
    });
    const qrDataUrl = await generateQRCodeDataUrl(qrString);

    setIssuedTicket({
      ticketCode,
      eventName: event.title,
      tierName: tier.name,
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

      const isRealMidtransToken =
        data.snapToken &&
        !data.snapToken.startsWith("SNAP-SIMULATION") &&
        !data.isSimulated;

      if (typeof window !== "undefined" && window.snap && isRealMidtransToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: async function (snapResult: unknown) {
            console.log("Success:", snapResult);
            await generateTicketPass(
              selectedTier.event,
              selectedTier.tier,
              buyerName,
              buyerEmail
            );
            setSelectedTier(null);
          },
          onClose: function () {
            setIsBuying(false);
          },
        });
      } else {
        // Tampilkan Midtrans Simulator Modal bawaan Cetas
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: selectedTier.tier.price * ticketQty,
          customerName: buyerName,
        });
      }
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
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950/60 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 border border-blue-200 dark:border-blue-800/60">
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
      <div className="space-y-12">
        {events.map((event) => (
          <div
            key={event.id}
            className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
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
              </div>

              {/* Event Details & Tiers */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {event.location}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {event.title}
                  </h2>
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
                          <div className="text-sm font-black text-orange-600 dark:text-orange-400 mt-1">
                            {formatRupiah(tier.price)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Sisa kuota: {tier.quotaRemaining} tiket
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedTier({ event, tier })}
                          className="mt-3 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold py-2 text-xs transition"
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
        ))}
      </div>

      {/* Buy Ticket Form Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
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

            <form onSubmit={handleBuyTicket} className="space-y-4">
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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Total Pembayaran Tiket</div>
                  <div className="text-base font-black text-blue-600 dark:text-blue-400">
                    {formatRupiah(selectedTier.tier.price * ticketQty)}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isBuying}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-blue-500/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isBuying ? "Memproses..." : "Bayar via Midtrans"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official E-Ticket Pass Modal */}
      {issuedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 text-white p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
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

            {/* Ticket Card Body */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
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
                  <div className="font-mono font-bold text-orange-400">
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
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold py-2.5 text-xs shadow-md transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak / Simpan Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Midtrans Sandbox Simulator Modal */}
      {simulatorData && selectedTier && (
        <MidtransSimulatorModal
          isOpen={!!simulatorData}
          orderNumber={simulatorData.orderNumber}
          grossAmount={simulatorData.grossAmount}
          customerName={simulatorData.customerName}
          onClose={() => setSimulatorData(null)}
          onSuccess={async () => {
            try {
              await generateTicketPass(
                selectedTier.event,
                selectedTier.tier,
                buyerName,
                buyerEmail
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

