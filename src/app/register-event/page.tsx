"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  Users,
  Copy,
  Info,
} from "lucide-react";
import {
  INITIAL_REGISTRATION_EVENTS,
  EventRegistrationItem,
  RegisteredAttendee,
} from "@/lib/events-registration-data";
import { generateQRCodeDataUrl } from "@/lib/ticket-security";

export default function RegisterEventPage() {
  const [events, setEvents] = useState<EventRegistrationItem[]>(INITIAL_REGISTRATION_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>("ev-workshop-ai");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [badgeResult, setBadgeResult] = useState<{
    attendee: RegisteredAttendee;
    event: EventRegistrationItem;
    qrDataUrl: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form inputs
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    category: "",
    notes: "",
    portfolioUrl: "",
  });

  // Fetch updated events list from API if available
  useEffect(() => {
    fetch("/api/attendees?type=events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {
        // Fallback to static initial data
      });
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Set default category when selected event changes
  useEffect(() => {
    if (activeEvent && activeEvent.categoryOptions.length > 0) {
      setForm((prev) => ({
        ...prev,
        category: activeEvent.categoryOptions[0],
      }));
    }
  }, [selectedEventId, activeEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeEvent.isOpenOnlineRegistration) {
      setErrorMessage("Event ini tidak membuka pendaftaran online via web Cetas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: activeEvent.id,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          institution: form.institution,
          category: form.category || activeEvent.categoryOptions[0] || "Umum",
          notes: form.notes,
          portfolioUrl: form.portfolioUrl,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses pendaftaran");
      }

      // Generate QR data url
      const qrDataUrl = await generateQRCodeDataUrl(json.attendee.qrPayload || json.attendee.badgeCode);

      setBadgeResult({
        attendee: json.attendee,
        event: activeEvent,
        qrDataUrl,
      });

      // Update remaining quota locally
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === activeEvent.id
            ? { ...ev, quotaRemaining: Math.max(0, ev.quotaRemaining - 1) }
            : ev
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <UserCheck className="h-4 w-4" />
          Pendaftaran & RSVP Peserta Event Cetas
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Pendaftaran Peserta Event Online
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Khusus untuk event yang membuka jalur pendaftaran peserta secara online melalui web Cetas.
          Dapatkan konfirmasi instan serta <strong>Official Attendee E-Badge</strong> ber-QR Code untuk absensi pintu masuk.
        </p>
      </div>

      {badgeResult ? (
        /* SUKSES: TAMPILAN DIGITAL ATTENDEE E-BADGE */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-8 shadow-2xl text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Pendaftaran Berhasil Diverifikasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Selamat, {badgeResult.attendee.fullName}!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                E-Badge peserta Anda telah resmi diterbitkan dan dicatat pada sistem kehadiran Gate Cetas.
              </p>
            </div>

            {/* Official Digital Badge Pass Card (Printable) */}
            <div
              id="cetas-attendee-pass"
              className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 text-left relative overflow-hidden border border-slate-800 shadow-2xl print:border-none print:shadow-none"
            >
              {/* Lanyard Hole Mockup */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-slate-800/80 border border-slate-700/60" />

              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs">
                    C
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase text-white">
                      CETAS ECOSYSTEM
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-bold">
                      OFFICIAL ATTENDEE E-PASS
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                  VERIFIED ATTENDEE
                </span>
              </div>

              {/* Event Title */}
              <div className="py-5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Nama Acara
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 leading-snug">
                  {badgeResult.event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400" /> {badgeResult.event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> {badgeResult.event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" /> {badgeResult.event.location}
                  </span>
                </div>
              </div>

              {/* Attendee Details & QR Code Grid */}
              <div className="border-t border-slate-800/80 pt-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-3 w-full sm:w-auto">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Nama Peserta</div>
                    <div className="text-sm sm:text-base font-extrabold text-white">
                      {badgeResult.attendee.fullName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Instansi / Asal</div>
                      <div className="text-xs font-semibold text-slate-200">
                        {badgeResult.attendee.institution}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Kategori</div>
                      <div className="text-xs font-semibold text-emerald-400">
                        {badgeResult.attendee.category}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Nomor Registrasi Unik
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-black text-orange-400 bg-slate-800 px-2 py-0.5 rounded">
                        {badgeResult.attendee.badgeCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(badgeResult.attendee.badgeCode)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedCode ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-inner">
                  {badgeResult.qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={badgeResult.qrDataUrl}
                      alt="Attendee QR Code"
                      className="h-28 w-28 object-contain"
                    />
                  ) : (
                    <div className="h-28 w-28 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      Memuat QR...
                    </div>
                  )}
                  <span className="text-[8px] font-mono font-black text-slate-900 tracking-wider mt-1">
                    CETAS GATE CHECK-IN
                  </span>
                </div>
              </div>

              {/* Security watermark footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Tanda Tangan Digital SHA-256 Valid
                </span>
                <span>Tunjukkan saat tiba di meja registrasi gate</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-bold px-6 py-3 text-xs shadow-md transition active:scale-95"
              >
                <Printer className="h-4 w-4" />
                Cetak / Simpan Pass PDF
              </button>
              <button
                onClick={() => {
                  setBadgeResult(null);
                  setForm({
                    fullName: "",
                    email: "",
                    phone: "",
                    institution: "",
                    category: activeEvent.categoryOptions[0] || "",
                    notes: "",
                    portfolioUrl: "",
                  });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-6 py-3 text-xs transition"
              >
                Daftar Peserta Lain
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* FORM PENDAFTARAN & SELECTOR EVENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Pilihan Event yang Buka Pendaftaran Online (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-600" />
                1. Pilih Event Pendaftaran
              </h2>
              <span className="text-[11px] text-slate-500">
                {events.filter((e) => e.isOpenOnlineRegistration).length} Event Buka Jalur Online
              </span>
            </div>

            <div className="space-y-3">
              {events.map((ev) => {
                const isSelected = ev.id === selectedEventId;
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setErrorMessage(null);
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {ev.isOpenOnlineRegistration ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Pendaftaran Online Buka
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 text-[10px] font-bold">
                              Tidak Buka Online
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {ev.category}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {ev.title}
                        </h3>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ev.organizer}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          {ev.price === 0 ? "GRATIS" : ev.priceLabel}
                        </span>
                        {ev.isOpenOnlineRegistration && (
                          <span className="text-[10px] text-slate-400">
                            Sisa: <strong className="text-slate-700 dark:text-slate-200">{ev.quotaRemaining}</strong> kuota
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {ev.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        {isSelected ? "Sedang Dipilih ✓" : "Pilih Event →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Detail Event Terpilih & Formulir Pendaftaran (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kartu Detail Event Terpilih */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Acara Yang Anda Daftarkan
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {activeEvent.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" /> {activeEvent.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" /> {activeEvent.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {activeEvent.location}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      Biaya Pendaftaran
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                      {activeEvent.price === 0 ? "100% GRATIS" : activeEvent.priceLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi & Fasilitas */}
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeEvent.description}
              </div>

              {activeEvent.facilities && activeEvent.facilities.length > 0 && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    Fasilitas & Keuntungan Peserta:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {activeEvent.facilities.map((fac, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Peringatan Jika Event TIDAK Buka Pendaftaran Online */}
              {!activeEvent.isOpenOnlineRegistration ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    Perhatian: Event Ini Tidak Membuka Pendaftaran Peserta Secara Online Melalui Web Cetas
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Penyelenggara acara ini menggunakan sistem ticketing berbayar resmi atau pendaftaran di tempat (on the spot).
                    Untuk membeli tiket resmi pertunjukan, silakan menuju halaman <strong>Cetas Ticketing</strong>.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 text-xs transition"
                  >
                    Buka Cetas Ticketing →
                  </Link>
                </div>
              ) : (
                /* FORMULIR PENDAFTARAN PESERTA */
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      2. Formulir Registrasi Peserta
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Sisa Kuota: {activeEvent.quotaRemaining} Kursi
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lengkap Peserta *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama sesuai identitas / sertifikat"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Aktif (Pengiriman E-Badge) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor WhatsApp Aktif *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Instansi / Kampus / Perusahaan *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Univ. Indonesia / Freelance"
                        value={form.institution}
                        onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kategori Pendaftaran *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {activeEvent.categoryOptions.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Link Berkas / Portofolio / KTM (Opsional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={form.portfolioUrl}
                        onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan Tambahan / Ekspektasi Mengikuti Acara
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tuliskan apa yang ingin Anda pelajari atau pertanyaan untuk pemateri..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-emerald-500" />
                      E-Badge langsung diterbitkan setelah pendaftaran disubmit.
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-7 py-3 text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95"
                    >
                      <UserCheck className="h-4 w-4" />
                      {isSubmitting ? "Memproses Registrasi..." : "Konfirmasi & Dapatkan E-Badge"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
