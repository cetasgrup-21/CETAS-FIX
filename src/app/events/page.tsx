"use client";

import { useState } from "react";
import { Ticket, Calendar, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

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

export default function EventsPage() {
  const events: EventItem[] = [
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

  const [selectedTier, setSelectedTier] = useState<{ event: EventItem; tier: TicketTier } | null>(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setIsBuying(true);
    setTicketSuccess(null);

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

      if (typeof window !== "undefined" && window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: function (res: unknown) {
            console.log("Success:", res);
            setTicketSuccess(
              `Pembayaran tiket ${data.orderNumber} berhasil! E-Tiket ber-QR code aman telah dikirimkan ke email ${buyerEmail}.`
            );
            setSelectedTier(null);
          },
          onClose: function () {
            setIsBuying(false);
          },
        });
      } else {
        setTicketSuccess(
          `[Simulasi Sukses] E-Tiket ber-QR Code untuk pesanan ${data.orderNumber} berhasil diterbitkan!`
        );
        setSelectedTier(null);
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
          Cetas Ticketing • Sistem Tiket QR Digital Aman
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Jelajah & Beli Tiket Event Resmi
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Setiap e-tiket dilengkapi tanda tangan digital HMAC SHA-256 untuk memastikan keaslian tiket di pintu masuk gerbang (anti-calo & anti-duplikasi).
        </p>
      </div>

      {ticketSuccess && (
        <div className="mb-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Penerbitan E-Tiket Berhasil!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{ticketSuccess}</p>
          </div>
        </div>
      )}

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

      {/* Buy Ticket Modal */}
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
              {/* Jumlah Tiket */}
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

              {/* Data Pemilik Tiket */}
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

              {/* Total & Action */}
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
    </div>
  );
}
