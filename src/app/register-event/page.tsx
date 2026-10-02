"use client";

import { useState } from "react";
import { CheckCircle2, UserCheck, Calendar, MapPin, QrCode, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RegisterEventPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    category: "MAHASISWA",
    portfolioUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badgeResult, setBadgeResult] = useState<{
    badgeCode: string;
    name: string;
    category: string;
    institution: string;
    eventName: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulasi penyimpanan pendaftaran peserta & generate kode badge QR
      await new Promise((r) => setTimeout(r, 800));
      const badgeCode = `CETAS-RSVP-${Date.now().toString().slice(-6)}`;
      setBadgeResult({
        badgeCode,
        name: form.fullName,
        category: form.category,
        institution: form.institution,
        eventName: "Workshop Nasional: Desain UI/UX & Generative AI",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-2 border border-emerald-200 dark:border-emerald-800/60">
          <UserCheck className="h-3.5 w-3.5" />
          Pendaftaran & RSVP Peserta Event
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Formulir Registrasi Peserta Event
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Lengkapi data pendaftaran Anda untuk mendapatkan E-Badge digital resmi dengan kode QR absensi kehadiran di lokasi acara.
        </p>
      </div>

      {badgeResult ? (
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-8 shadow-xl max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Pendaftaran Berhasil!
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {badgeResult.name}
            </h2>
            <p className="text-xs text-slate-500">{badgeResult.institution}</p>
          </div>

          {/* Digital Badge Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white text-left relative overflow-hidden shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1">
              Official Attendee E-Badge
            </div>
            <div className="text-base font-black mb-4">{badgeResult.eventName}</div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <div className="text-[10px] text-slate-400">Kategori Peserta</div>
                <div className="text-xs font-bold text-white">{badgeResult.category}</div>
                <div className="text-[10px] text-slate-400 mt-2">Nomor Registrasi</div>
                <div className="text-xs font-mono font-bold text-orange-400">
                  {badgeResult.badgeCode}
                </div>
              </div>

              <div className="h-20 w-20 rounded-xl bg-white p-2 flex flex-col items-center justify-center text-slate-900">
                <QrCode className="h-14 w-14" />
                <span className="text-[8px] font-bold font-mono">SCAN GATE</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setBadgeResult(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Daftar Peserta Lain
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          {/* Info Event yang Diikuti */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase">Acara Dipilih</span>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Workshop Nasional: Desain UI/UX & Generative AI
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> 15 November 2026
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Jakarta Creative Hub
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              Registrasi Gratis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Peserta *
              </label>
              <input
                type="text"
                required
                placeholder="Nama sesuai sertifikat"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Aktif *
              </label>
              <input
                type="email"
                required
                placeholder="email@anda.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instansi / Universitas / Perusahaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Universitas Indonesia"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Peserta *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MAHASISWA">Mahasiswa / Pelajar</option>
                <option value="PROFESIONAL">Praktisi / Profesional</option>
                <option value="UMUM">Masyarakat Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Dokumen / KTM (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={form.portfolioUrl}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-emerald-500/25 transition active:scale-95"
            >
              <FileText className="h-4 w-4" />
              {isSubmitting ? "Mendaftarkan..." : "Dapatkan E-Badge Peserta"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
