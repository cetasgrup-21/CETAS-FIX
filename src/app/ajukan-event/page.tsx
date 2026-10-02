"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles, Megaphone } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

export default function AjukanEventPage() {
  const [formData, setFormData] = useState({
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    eventName: "",
    targetAudience: "",
    proposalFileUrl: "",
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Cetas Ticketing",
    "Iklan Cetas Kita",
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableFeatures = [
    {
      id: "Cetas Ticketing",
      title: "Cetas Ticketing & Scanner Gate",
      desc: "Penjualan tiket online dengan barcode/QR dinamis dan scanner panitia.",
    },
    {
      id: "Cetas Vote",
      title: "Cetas Vote (E-Voting Live)",
      desc: "Pemilihan duta/juara favorit berbayar (paid vote) atau gratis terverifikasi.",
    },
    {
      id: "Pendaftaran Peserta",
      title: "Pendaftaran & Registrasi Peserta",
      desc: "Formulir pendaftaran custom data dan penerbitan e-badge peserta otomatis.",
    },
    {
      id: "Iklan Cetas Kita",
      title: "Promosi 'Iklan Cetas Kita'",
      desc: "Penempatan banner sponsor di homepage dan footer tiket untuk jangkau lebih banyak audiens.",
    },
    {
      id: "Cetas Production",
      title: "Dukungan Cetas Production",
      desc: "Paket cetak merchandise, panggung, lighting, sound system, & live streaming.",
    },
  ];

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          featuresRequested: selectedFeatures,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim pengajuan");
      }

      setSuccessMsg(
        `Pengajuan event "${formData.eventName}" berhasil dikirim! Tim Admin Cetas akan meninjau proposal dan menghubungi nomor WhatsApp Anda dalam 1x24 jam.`
      );
      setFormData({
        organizerName: "",
        organizerEmail: "",
        organizerPhone: "",
        eventName: "",
        targetAudience: "",
        proposalFileUrl: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700 mb-3 border border-purple-200">
          <Megaphone className="h-3.5 w-3.5" />
          Kemitraan & Penyelenggaraan Event
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Formulir Pengajuan Event & Iklan Cetas Kita
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Ajukan event Anda untuk dikurasi oleh tim Cetas. Nikmati integrasi penjualan tiket, e-voting, pendaftaran peserta, dan slot promosi iklan.
        </p>
      </div>

      {successMsg && (
        <div className="mb-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Pengajuan Berhasil Terkirim!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Gagal Mengirim Pengajuan
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Section 1: Profil Penyelenggara */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
            Data Penyelenggara (Event Organizer)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap / Nama Komunitas / Instansi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: BEM Universitas / Cetas Media EO"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={formData.organizerPhone}
                onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Penyelenggara *
              </label>
              <input
                type="email"
                required
                placeholder="email@instansi.com"
                value={formData.organizerEmail}
                onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Detail Acara */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
            Detail Rencana Acara
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Acara / Event *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Cetas Festival Musik & Expo Kreatif 2026"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Audiens & Estimasi Jumlah Penonton *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Mahasiswa se-Jabodetabek & Umum, target 3.000 pengunjung"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <FileUpload
                label="Dokumen Proposal / TOR Event (Upload File)"
                description="Upload file proposal acara (Format PDF, DOC, DOCX, ZIP)"
                accept=".pdf,.doc,.docx,.zip,application/pdf"
                value={formData.proposalFileUrl}
                onChange={(dataUrl) => setFormData({ ...formData, proposalFileUrl: dataUrl })}
                aspectRatio="document"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Fitur Cetas yang Dibutuhkan */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
            Paket Fitur Cetas yang Ingin Digunakan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableFeatures.map((feat) => {
              const isChecked = selectedFeatures.includes(feat.id);
              return (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition ${
                    isChecked
                      ? "border-blue-500 bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by div click
                      className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold px-7 py-3 text-sm shadow-lg shadow-purple-500/25 transition active:scale-95"
          >
            <Send className="h-4 w-4" />
            {loading ? "Mengirim Proposal..." : "Kirim Pengajuan ke Admin Cetas"}
          </button>
        </div>
      </form>
    </div>
  );
}
