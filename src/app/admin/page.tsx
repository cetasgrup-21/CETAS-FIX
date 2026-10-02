"use client";

import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Ticket,
  Award,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Megaphone,
  Users,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { formatRupiah, formatDateTime } from "@/lib/utils";

interface Submission {
  id: string;
  eventName: string;
  organizer: string;
  phone: string;
  features: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-01",
      eventName: "Festival Seni & Musik Indie Jakarta 2026",
      organizer: "Komunitas Nada Kita",
      phone: "081299887766",
      features: "Cetas Ticketing, Iklan Cetas Kita",
      status: "PENDING",
      submittedAt: "2026-10-02T10:15:00",
    },
    {
      id: "sub-02",
      eventName: "Grand Final Pemilihan Duta Pariwisata Daerah",
      organizer: "Dinas Pemuda & Olahraga",
      phone: "081388776655",
      features: "Cetas Vote, Cetas Production",
      status: "PENDING",
      submittedAt: "2026-10-01T14:30:00",
    },
    {
      id: "sub-03",
      eventName: "Hackathon & Tech Expo 2026",
      organizer: "Himpunan Mahasiswa Informatika",
      phone: "085611223344",
      features: "Pendaftaran Peserta, Cetas Ticketing",
      status: "APPROVED",
      submittedAt: "2026-09-28T09:00:00",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "ADS" | "AUDIT">("SUBMISSIONS");

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );
  };

  const handleReject = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "REJECTED" } : s))
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Portal Lingkup Kerja Perusahaan Cetas (Internal Backoffice)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Manajemen Operasional Cetas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas Midtrans, review proposal event, atur penempatan iklan, dan kontrol divisi lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Midtrans Gateway Online
          </span>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Omzet Cetas</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(84500000)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +18.4% bulan ini
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Penjualan Tiket (Cetas Ticketing)</span>
            <Ticket className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(42300000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">428 tiket terjual</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Pendapatan Cetas Vote</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(18700000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">9.350 suara berbayar</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Order Cetas Production</span>
            <ShoppingBag className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(23500000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Merch & sewa sound/lighting</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "SUBMISSIONS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Pengajuan Event Masuk ({submissions.filter((s) => s.status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveTab("ADS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "ADS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          Iklan Cetas Kita
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "AUDIT"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Log Audit & Keamanan
        </button>
      </div>

      {/* Tab 1: Pengajuan Event Masuk */}
      {activeTab === "SUBMISSIONS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Daftar Proposal Event yang Butuh Verifikasi Admin Cetas
            </h3>
            <span className="text-xs text-slate-500">
              Total {submissions.length} Proposal Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Nama Acara & Penyelenggara</th>
                  <th className="p-4">Fitur Diminta</th>
                  <th className="p-4">Waktu Pengajuan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {sub.eventName}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {sub.organizer} • {sub.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-medium text-[11px]">
                        {sub.features}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td className="p-4">
                      {sub.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold">
                          <Clock className="h-3 w-3" /> Menunggu Review
                        </span>
                      )}
                      {sub.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle className="h-3 w-3" /> Disetujui
                        </span>
                      )}
                      {sub.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold">
                          <XCircle className="h-3 w-3" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {sub.status === "PENDING" ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(sub.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-xs transition"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(sub.id)}
                            className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-semibold px-3 py-1.5 text-xs transition"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Selesai Ditinjau</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Iklan Cetas Kita */}
      {activeTab === "ADS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Slot Kampanye & Banner &ldquo;Iklan Cetas Kita&rdquo;
              </h3>
              <p className="text-xs text-slate-500">
                Kelola iklan sponsor atau promosi internal Cetas Production yang tampil di homepage dan e-tiket.
              </p>
            </div>
            <button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 text-xs">
              + Tambah Slot Iklan Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
                  Homepage Top Banner
                </span>
                <span className="text-xs font-bold text-emerald-600">● Tayang Aktif</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Promo Sewa Sound & Lighting Cetas Production Disc 25%
              </h4>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Impresi: 14.820 kali</span>
                <span>Klik: 1.240 CTR (8.3%)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  Footer E-Ticket PDF
                </span>
                <span className="text-xs font-bold text-emerald-600">● Tayang Aktif</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Merchandise Kaos Cetas Festival 2026
              </h4>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Impresi: 428 unduhan tiket</span>
                <span>Klik: 89 scan QR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Log & Keamanan */}
      {activeTab === "AUDIT" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Log Audit Aktivitas & Transaksi Sistem
          </h3>

          <div className="space-y-3">
            {[
              {
                time: "Baru saja",
                action: "MIDTRANS_SETTLEMENT",
                detail: "Pembayaran Rp180.000 untuk 10 Suara Cetas Vote (#01 Nadia Safira) diverifikasi.",
                type: "success",
              },
              {
                time: "12 menit lalu",
                action: "TICKET_CHECKIN",
                detail: "Tiket #CETAS-TCK-99128 berhasil divalidasi oleh Gate Scanner Staff A.",
                type: "info",
              },
              {
                time: "1 jam lalu",
                action: "EVENT_SUBMISSION",
                detail: "Proposal event baru 'Festival Seni & Musik Indie' masuk ke antrean review.",
                type: "warning",
              },
              {
                time: "3 jam lalu",
                action: "PRODUCTION_ORDER_CREATED",
                detail: "Invoice pesanan merchandise 50 pcs kaos #CETAS-PROD-2026 diterbitkan.",
                type: "info",
              },
            ].map((log, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    [{log.action}]
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{log.detail}</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 ml-4">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
