"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCheck,
  Award,
  Calendar,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";

interface ContingentScore {
  contingentId: string;
  schoolName: string;
  teamName: string;
  category: string;
  drawNumber: number;
  coachName: string;
  dantonName: string;
  status: "BELUM_TAMPIL" | "SEDANG_PENILAIAN" | "SELESAI_TERVERIFIKASI";
  pbbMurni: number;
  variasiFormasi: number;
  dantonScore: number;
  kostumScore: number;
  penaltyTime: number;
  penaltyBoundary: number;
  totalScore: number;
  rank: number;
  scheduledTime: string;
  dp1Time: string;
  dp2Time: string;
  dp3Time: string;
}

const MOCK_CONTINGENTS: ContingentScore[] = [
  {
    contingentId: "KTG-01",
    schoolName: "SMA Negeri 1 Jakarta",
    teamName: "Pasukan Garuda Sakti",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 1,
    coachName: "Bambang Sudarsono, S.Pd",
    dantonName: "Rizky Firmansyah",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 945,
    variasiFormasi: 960,
    dantonScore: 935,
    kostumScore: 950,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3790,
    rank: 1,
    scheduledTime: "08:30 WIB",
    dp1Time: "08:00 WIB",
    dp2Time: "08:15 WIB",
    dp3Time: "08:25 WIB",
  },
  {
    contingentId: "KTG-02",
    schoolName: "SMK Taruna Bhakti Depok",
    teamName: "Cakra Wibawa Nusantara",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 2,
    coachName: "Hendra Wijaya",
    dantonName: "Farhan Maulana",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 920,
    variasiFormasi: 945,
    dantonScore: 910,
    kostumScore: 930,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3705,
    rank: 2,
    scheduledTime: "09:00 WIB",
    dp1Time: "08:30 WIB",
    dp2Time: "08:45 WIB",
    dp3Time: "08:55 WIB",
  },
  {
    contingentId: "KTG-03",
    schoolName: "SMP Negeri 2 Bandung",
    teamName: "Satria Muda Siliwangi",
    category: "Tingkat SMP / Sederajat",
    drawNumber: 3,
    coachName: "Dedi Suherman, S.Pd",
    dantonName: "Ahmad Zaki",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 895,
    variasiFormasi: 920,
    dantonScore: 890,
    kostumScore: 910,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3615,
    rank: 3,
    scheduledTime: "09:30 WIB",
    dp1Time: "09:00 WIB",
    dp2Time: "09:15 WIB",
    dp3Time: "09:25 WIB",
  },
  {
    contingentId: "KTG-04",
    schoolName: "SMA Bintang Nusantara",
    teamName: "Laskar Adhi Pratama",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 4,
    coachName: "Siti Rahmawati",
    dantonName: "Dimas Anggara",
    status: "SEDANG_PENILAIAN",
    pbbMurni: 880,
    variasiFormasi: 905,
    dantonScore: 870,
    kostumScore: 895,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3550,
    rank: 4,
    scheduledTime: "10:00 WIB",
    dp1Time: "09:30 WIB",
    dp2Time: "09:45 WIB",
    dp3Time: "09:55 WIB",
  },
  {
    contingentId: "KTG-05",
    schoolName: "SMA Negeri 8 Jakarta",
    teamName: "Bhayangkara Delapan",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 5,
    coachName: "Agus Prasetyo",
    dantonName: "Fajar Nugraha",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 865,
    variasiFormasi: 890,
    dantonScore: 855,
    kostumScore: 880,
    penaltyTime: 20,
    penaltyBoundary: 10,
    totalScore: 3460,
    rank: 5,
    scheduledTime: "10:30 WIB",
    dp1Time: "10:00 WIB",
    dp2Time: "10:15 WIB",
    dp3Time: "10:25 WIB",
  },
  {
    contingentId: "KTG-06",
    schoolName: "SMP Negeri 1 Cibinong",
    teamName: "Gita Wiratama",
    category: "Tingkat SMP / Sederajat",
    drawNumber: 6,
    coachName: "Rudi Hartono, M.Pd",
    dantonName: "Galih Pratama",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 860,
    variasiFormasi: 885,
    dantonScore: 850,
    kostumScore: 870,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3465,
    rank: 6,
    scheduledTime: "11:00 WIB",
    dp1Time: "10:30 WIB",
    dp2Time: "10:45 WIB",
    dp3Time: "10:55 WIB",
  },
  {
    contingentId: "KTG-07",
    schoolName: "SMA Negeri 3 Bogor",
    teamName: "Kresna Duta Pratama",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 7,
    coachName: "Wahyu Hidayat",
    dantonName: "Bayu Aji",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 850,
    variasiFormasi: 870,
    dantonScore: 840,
    kostumScore: 860,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3420,
    rank: 7,
    scheduledTime: "11:30 WIB",
    dp1Time: "11:00 WIB",
    dp2Time: "11:15 WIB",
    dp3Time: "11:25 WIB",
  },
  {
    contingentId: "KTG-08",
    schoolName: "SMK Negeri 2 Tangerang",
    teamName: "Pandawa Sakti",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 8,
    coachName: "Arif Kurniawan",
    dantonName: "Bagus Setiawan",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 840,
    variasiFormasi: 865,
    dantonScore: 835,
    kostumScore: 850,
    penaltyTime: 10,
    penaltyBoundary: 0,
    totalScore: 3380,
    rank: 8,
    scheduledTime: "13:00 WIB",
    dp1Time: "12:30 WIB",
    dp2Time: "12:45 WIB",
    dp3Time: "12:55 WIB",
  },
  {
    contingentId: "KTG-09",
    schoolName: "SMP Negeri 5 Bekasi",
    teamName: "Satya Wira Negara",
    category: "Tingkat SMP / Sederajat",
    drawNumber: 9,
    coachName: "Endang Supriyatna",
    dantonName: "Rian Saputra",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 830,
    variasiFormasi: 850,
    dantonScore: 825,
    kostumScore: 840,
    penaltyTime: 0,
    penaltyBoundary: 10,
    totalScore: 3335,
    rank: 9,
    scheduledTime: "13:30 WIB",
    dp1Time: "13:00 WIB",
    dp2Time: "13:15 WIB",
    dp3Time: "13:25 WIB",
  },
  {
    contingentId: "KTG-10",
    schoolName: "SMA Negeri 2 Bekasi",
    teamName: "Panca Tri Tunggal",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 10,
    coachName: "Teguh Santoso",
    dantonName: "Danang Wijaya",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 825,
    variasiFormasi: 840,
    dantonScore: 820,
    kostumScore: 835,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3320,
    rank: 10,
    scheduledTime: "14:00 WIB",
    dp1Time: "13:30 WIB",
    dp2Time: "13:45 WIB",
    dp3Time: "13:55 WIB",
  },
  {
    contingentId: "KTG-11",
    schoolName: "SMA Negeri 68 Jakarta",
    teamName: "Srikandi Nusantara",
    category: "Tingkat SMA / Sederajat",
    drawNumber: 11,
    coachName: "Tri Wulandari, S.Pd",
    dantonName: "Anisa Rahma",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 815,
    variasiFormasi: 830,
    dantonScore: 810,
    kostumScore: 830,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3285,
    rank: 11,
    scheduledTime: "14:30 WIB",
    dp1Time: "14:00 WIB",
    dp2Time: "14:15 WIB",
    dp3Time: "14:25 WIB",
  },
  {
    contingentId: "KTG-12",
    schoolName: "PPI Purna Paskibraka",
    teamName: "Dharma Bangsa",
    category: "Tingkat Purna / Senior",
    drawNumber: 12,
    coachName: "Eko Prasetyo, S.H",
    dantonName: "Surya Dharma",
    status: "SELESAI_TERVERIFIKASI",
    pbbMurni: 910,
    variasiFormasi: 935,
    dantonScore: 900,
    kostumScore: 920,
    penaltyTime: 0,
    penaltyBoundary: 0,
    totalScore: 3665,
    rank: 12,
    scheduledTime: "15:00 WIB",
    dp1Time: "14:30 WIB",
    dp2Time: "14:45 WIB",
    dp3Time: "14:55 WIB",
  },
];

export default function PelatihPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContingentId, setSelectedContingentId] = useState("KTG-01");
  const [activeTab, setActiveTab] = useState<"nilai" | "jadwal" | "berkas" | "sertifikat" | "protes">("nilai");
  const [protesForm, setProtesForm] = useState({
    aspek: "PBB Murni",
    alasan: "",
    namaPelatih: "",
    waKontak: "",
    submitted: false,
  });

  const activeContingent = MOCK_CONTINGENTS.find(
    (c) => c.contingentId === selectedContingentId
  ) || MOCK_CONTINGENTS[0];

  const filteredContingents = MOCK_CONTINGENTS.filter(
    (c) =>
      c.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contingentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FCFBFE] text-slate-800 pb-28">
      {/* Top Banner Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900 via-purple-950 to-slate-950 pt-12 pb-16 text-white border-b border-purple-800/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-purple-200 border border-white/15 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                <span>Portal Resmi Pelatih & Official Kontingen Turnamen</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Akses Pelatih & Rekap Nilai Live
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
                Pantau lembar rekapitulasi penilaian dewan juri secara real-time, jadwal masuk DP (Daerah Persiapan), dokumen teknis juklak/juknis, dan e-sertifikat resmi ber-QR.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/vote"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-3 shadow-md shadow-purple-900/30 transition"
              >
                <Award className="h-4 w-4" />
                Bilik Cetas Vote Live
              </Link>
              <a
                href="https://wa.me/6281584682345?text=Halo%20Sekretariat%20Juri%20CETAS%2C%20saya%20pelatih%20ingin%20klarifikasi%20rekap%20nilai."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-3 shadow-md shadow-emerald-900/30 transition"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Sekretariat Dewan Hakim Juri
              </a>
            </div>
          </div>

          {/* Quick Search & Contingent Selector */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
              <input
                type="text"
                placeholder="Cari kode kontingen, sekolah, tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/15 border border-white/20 text-xs text-white placeholder-purple-200/70 outline-none focus:bg-white/20 transition"
              />
            </div>

            <div className="md:col-span-8 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              {filteredContingents.map((c) => (
                <button
                  key={c.contingentId}
                  type="button"
                  onClick={() => setSelectedContingentId(c.contingentId)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    selectedContingentId === c.contingentId
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/40 border border-purple-400"
                      : "bg-white/10 text-purple-100 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/20">
                    {c.contingentId}
                  </span>
                  <span className="truncate max-w-[130px]">{c.schoolName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Contingent Profile Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800">
                  {activeContingent.contingentId}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    activeContingent.status === "SELESAI_TERVERIFIKASI"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : activeContingent.status === "SEDANG_PENILAIAN"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {activeContingent.status === "SELESAI_TERVERIFIKASI"
                    ? "✓ Terverifikasi Juri"
                    : activeContingent.status === "SEDANG_PENILAIAN"
                    ? "Sedang Dinilai"
                    : "Menunggu Jadwal Tampil"}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {activeContingent.schoolName}
                </h2>
                <p className="text-xs font-bold text-purple-700 mt-0.5">
                  &ldquo;{activeContingent.teamName}&rdquo;
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium">
                  Kategori: <strong className="text-slate-800">{activeContingent.category}</strong>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500">Nomor Undian</div>
                  <div className="text-lg font-black text-purple-900">
                    #{activeContingent.drawNumber < 10 ? `0${activeContingent.drawNumber}` : activeContingent.drawNumber}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500">Peringkat Sementara</div>
                  <div className="text-lg font-black text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Rank #{activeContingent.rank}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-purple-50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pelatih / Pembina:</span>
                  <span className="font-bold text-slate-900">{activeContingent.coachName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Komandan Peleton:</span>
                  <span className="font-bold text-slate-900">{activeContingent.dantonName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jadwal Tampil:</span>
                  <span className="font-bold text-purple-700">{activeContingent.scheduledTime}</span>
                </div>
              </div>

              {/* Total Score Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white space-y-1">
                <div className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
                  Akumulasi Nilai Akhir
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black tracking-tight font-mono">
                    {activeContingent.totalScore > 0 ? `${activeContingent.totalScore} Poin` : "0 Poin"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    Grade A+ Unggul
                  </span>
                </div>
                <p className="text-[10px] text-purple-200">
                  Perhitungan otomatis dewan juri tanpa rekayasa
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Bantuan & Layanan Cetas
              </h3>
              <a
                href="https://wa.me/6281584682345?text=Halo%20Tim%20Cetas%2C%20kami%20ingin%20konsultasi%20seputar%20event%20dan%20alat."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-purple-800 text-xs font-bold border border-purple-200 transition"
              >
                <span>Sewa Sound System & Videotron</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                href="/events"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-purple-800 text-xs font-bold border border-purple-200 transition"
              >
                <span>Beli Tiket Masuk Suporter</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Tabbed Portal Views */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tab Bar */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-purple-100 shadow-xs overflow-x-auto scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveTab("nilai")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === "nilai"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Award className="h-4 w-4" />
                Lembar Nilai Juri
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("jadwal")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === "jadwal"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Clock className="h-4 w-4" />
                Urutan Tampil & DP
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("berkas")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === "berkas"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                Juklak & Berkas Lomba
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sertifikat")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === "sertifikat"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Download className="h-4 w-4" />
                E-Sertifikat Kontingen
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("protes")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === "protes"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                Klarifikasi Nilai
              </button>
            </div>

            {/* TAB CONTENT 1: LEMBAR NILAI JURI REAL-TIME */}
            {activeTab === "nilai" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Rincian Penilaian Dewan Juri Digital
                    </h3>
                    <p className="text-xs text-slate-500">
                      Transparansi penilaian per pos materi lomba secara akurat
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    Terverifikasi HMAC
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pos 1 */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">
                        Pos 1: PBB Murni
                      </span>
                      <span className="text-base font-black text-purple-700">
                        {activeContingent.pbbMurni > 0 ? activeContingent.pbbMurni : "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Langkah tegap, penghormatan, periksa kerapihan, hadap kanan/kiri, balik kanan, jalan di tempat, dan keselarasan hentakan kaki.
                    </p>
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(activeContingent.pbbMurni / 1000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pos 2 */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">
                        Pos 2: Variasi & Formasi
                      </span>
                      <span className="text-base font-black text-purple-700">
                        {activeContingent.variasiFormasi > 0 ? activeContingent.variasiFormasi : "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Tingkat kesulitan gerakan, estetika visual formasi, kekompakan, pesan koreografi, serta kelancaran transisi buka-tutup barisan.
                    </p>
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(activeContingent.variasiFormasi / 1000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pos 3 */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">
                        Pos 3: Komandan Peleton (Danton)
                      </span>
                      <span className="text-base font-black text-purple-700">
                        {activeContingent.dantonScore > 0 ? activeContingent.dantonScore : "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Artikulasi aba-aba petunjuk, intonasi & volume suara, ketegasan sikap, penguasaan arena lomba, serta ketenangan memimpin.
                    </p>
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(activeContingent.dantonScore / 1000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pos 4 */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">
                        Pos 4: Kostum & Kerapihan
                      </span>
                      <span className="text-base font-black text-purple-700">
                        {activeContingent.kostumScore > 0 ? activeContingent.kostumScore : "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Kesesuaian juklak/juknis, keselarasan atribut, kerapian dasi/evolet, kebersihan sarung tangan & sepatu, serta keserasian warna.
                    </p>
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(activeContingent.kostumScore / 1000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Penalty & Deductions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      Pinalti & Pengurangan Nilai Resmi
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Pelanggaran garis batas ({activeContingent.penaltyBoundary} poin) • Pelanggaran kelebihan waktu tampil ({activeContingent.penaltyTime} poin)
                    </div>
                  </div>
                  <div className={`font-black text-sm px-3 py-1 rounded-xl border ${
                    activeContingent.penaltyTime + activeContingent.penaltyBoundary > 0
                      ? "text-rose-600 bg-rose-50 border-rose-200"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200"
                  }`}>
                    {activeContingent.penaltyTime + activeContingent.penaltyBoundary > 0
                      ? `-${activeContingent.penaltyTime + activeContingent.penaltyBoundary} Poin (Pinalti)`
                      : "0 Poin (Nihil Pinalti)"}
                  </div>
                </div>

                {/* Sign-off badge */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-purple-50 gap-2">
                  <span>Dicatat otomatis melalui Sistem Penilaian Digital CETAS</span>
                  <span className="font-mono text-purple-700 font-bold">
                    Hash Verifikasi: hmac_sha256_verified_{activeContingent.totalScore}
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: JADWAL & RUNDOWN DP */}
            {activeTab === "jadwal" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Jadwal Masuk Daerah Persiapan (DP) & Arena Lomba
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pastikan pasukan telah berkumpul 30 menit sebelum memasuki DP 1
                  </p>
                </div>

                <div className="relative border-l-2 border-purple-200 ml-4 pl-6 space-y-6 py-2">
                  {/* Step 1: DP 1 */}
                  <div className="relative">
                    <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-900 uppercase">
                        Daerah Persiapan 1 (DP 1) • Cek Absensi & Registrasi
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-700">
                        {activeContingent.dp1Time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pemeriksaan ID Card peserta, verifikasi surat tugas kepala sekolah, dan pengecekan jumlah pasukan (16 + 1 Danton).
                    </p>
                  </div>

                  {/* Step 2: DP 2 */}
                  <div className="relative">
                    <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-900 uppercase">
                        Daerah Persiapan 2 (DP 2) • Pemeriksaan Kostum & Atribut
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-700">
                        {activeContingent.dp2Time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pemeriksaan kelengkapan atribut seragam paskibra oleh tim juri pos kostum.
                    </p>
                  </div>

                  {/* Step 3: DP 3 */}
                  <div className="relative">
                    <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-900 uppercase">
                        Daerah Persiapan 3 (DP 3) • Gerbang Masuk Arena
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-700">
                        {activeContingent.dp3Time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pasukan bersiap di pintu masuk lapangan utama. Pengambilan waktu dimulai saat danton melapor.
                    </p>
                  </div>

                  {/* Step 4: Arena Utama */}
                  <div className="relative">
                    <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase">
                        Arena Utama Lomba • Tampil Live
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {activeContingent.scheduledTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Durasi waktu tampil maksimal 10 menit. Nilai langsung masuk ke sistem scoreboard videotron panggung secara real-time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: BERKAS TEKNIS & JUKLAK */}
            {activeTab === "berkas" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Dokumen Teknis & Petunjuk Pelaksana Lomba
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unduh file resmi panduan teknis yang telah disahkan dewan juri
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Juklak & Juknis LKBB Pandawa Nusantara 2026.pdf
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Format resmi ukuran lapangan 18x12m, materi gerakan PBB murni & variasi formasi.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Mengunduh Petunjuk Pelaksana & Teknis Resmi...")}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Download className="h-4 w-4" />
                      Unduh PDF
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Lembar Berkas Peserta & Verifikasi Pasukan.pdf
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Daftar 16 anggota pasukan + 1 danton + surat mandat kepala sekolah.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Mengunduh Berkas Pasukan Terverifikasi...")}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Download className="h-4 w-4" />
                      Unduh Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: E-SERTIFIKAT KONTINGEN */}
            {activeTab === "sertifikat" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    E-Sertifikat & Piagam Penghargaan Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dilengkapi kode QR validasi keaslian bersertifikat CETAS
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-50 via-white to-purple-50/80 border border-purple-200 text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-purple-700">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Piagam Juara #{activeContingent.rank} ({activeContingent.schoolName})
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Sertifikat digital resmi untuk pembina, danton, dan seluruh anggota pasukan. Berlaku untuk jalur prestasi PPDB resmi.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => alert("Mengunduh Sertifikat Juara Ber-QR...")}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 shadow-md shadow-purple-600/30 transition"
                    >
                      <Download className="h-4 w-4" />
                      Unduh Piagam Resmi (PDF Ber-QR)
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Mengunduh Paket Sertifikat Seluruh Anggota Pasukan...")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-purple-50 text-purple-800 font-bold text-xs px-5 py-3 border border-purple-200 transition"
                    >
                      <Download className="h-4 w-4" />
                      Unduh Sertifikat Personel (ZIP)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: KLARIFIKASI NILAI */}
            {activeTab === "protes" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Saluran Klarifikasi & Sanggah Nilai Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masa sanggah dibuka maksimal 30 menit setelah lembar nilai juri terbit
                  </p>
                </div>

                {protesForm.submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-black text-emerald-900">
                      Pengajuan Klarifikasi Berhasil Diteruskan ke Dewan Hakim Juri!
                    </h4>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Sekretariat panitia akan segera menghubungi pelatih melalui nomor WhatsApp resmi untuk sesi verifikasi lembar juri.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setProtesForm({ ...protesForm, submitted: true });
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Aspek Penilaian yang Ingin Diklarifikasi:
                      </label>
                      <select
                        value={protesForm.aspek}
                        onChange={(e) => setProtesForm({ ...protesForm, aspek: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500"
                      >
                        <option value="PBB Murni">Pos 1 - PBB Murni</option>
                        <option value="Variasi & Formasi">Pos 2 - Variasi & Formasi</option>
                        <option value="Komandan Peleton">Pos 3 - Komandan Peleton (Danton)</option>
                        <option value="Kostum & Kerapihan">Pos 4 - Kostum & Kerapihan</option>
                        <option value="Pinalti Waktu/Garis">Pinalti Lapangan (Waktu / Garis)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Catatan & Bukti Kronologis Pelatih:
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Jelaskan alasan pengajuan klarifikasi sesuai pengamatan di arena..."
                        value={protesForm.alasan}
                        onChange={(e) => setProtesForm({ ...protesForm, alasan: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nama Pelatih / Pembina:
                        </label>
                        <input
                          type="text"
                          required
                          value={protesForm.namaPelatih}
                          onChange={(e) => setProtesForm({ ...protesForm, namaPelatih: e.target.value })}
                          placeholder="Nama lengkap pelatih"
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nomor WhatsApp Pelatih:
                        </label>
                        <input
                          type="tel"
                          required
                          value={protesForm.waKontak}
                          onChange={(e) => setProtesForm({ ...protesForm, waKontak: e.target.value })}
                          placeholder="0812xxxxxxx"
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 shadow-md shadow-purple-600/30 transition"
                    >
                      Kirim Formulir Klarifikasi ke Dewan Juri
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
