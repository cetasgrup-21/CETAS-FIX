import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Lock,
  Building2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Award,
  CheckCircle2,
  Trophy,
  Users,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

export const metadata = {
  title: "Tentang Platform — CETAS (Centralized Electronic Tournament & Award System)",
  description:
    "Standar baru platform pengelolaan turnamen, rekapitulasi penilaian juri zero-touch, ticketing QR anti-duplikasi, dan e-voting transparan di Indonesia.",
};

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E]">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-24 border-b border-blue-500/20 bg-gradient-to-b from-[#0A1E44] to-[#06132E]">
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 px-4 py-1.5 text-xs font-bold text-[#00D9FF] font-mono shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" />
            <span>Centralized Electronic Tournament &amp; Award System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display">
            Tentang Platform CETAS
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Menghadirkan standar baru pengelolaan kompetisi dan turnamen di Indonesia dengan teknologi rekapitulasi nilai juri zero-touch, tiket anti-duplikasi, dan transparansi mutlak.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#00D9FF] font-mono">
                Misi &amp; Visi Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
                Mengapa CETAS Lahir?
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Penyelenggaraan kompetisi dan turnamen seringkali menghadapi tantangan lama: rekapitulasi skor juri manual yang memakan waktu berjam-jam, potensi human-error perhitungan bobot, sengketa antar-kontingen yang minim bukti audit, hingga peredaran tiket palsu di pintu masuk.
              </p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                CETAS hadir sebagai solusi menyeluruh yang menggabungkan seluruh tahapan event dalam satu ekosistem: mulai dari pendaftaran peserta, verifikasi e-tiket QR terenkripsi HMAC SHA-256, bilik suara e-voting transparan, hingga mesin penjurian kriptografis yang mengunci skor secara sah dalam hitungan detik.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/legalitas"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black px-5 py-3 text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Kepatuhan Hukum &amp; Legalitas</span>
                </Link>
                <Link
                  href="/tournament-hub"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-[#0A2450] hover:bg-blue-900/60 text-cyan-300 font-bold px-5 py-3 text-xs transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Jelajahi 3D Tournament Hub</span>
                </Link>
              </div>
            </div>

            {/* Mascot Showcase Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative rounded-3xl border border-blue-500/30 bg-[#0B1C3D] p-6 shadow-2xl text-center space-y-4 max-w-sm w-full">
                <div className="w-full flex justify-center py-2 animate-mascot-gentle-breathe">
                  <AntmanMascot pose="waving" size={260} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                    <span>ANTY • Maskot Resmi CETAS</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-2 font-display">
                    Simbol Kerja Keras &amp; Solidaritas
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Karakter semut robot futuristik mencerminkan etos kerja kolaboratif, ketelitian matematis, dan komitmen pantang menyerah setiap kontingen kompetisi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#00D9FF] font-mono">
                Nilai Inti Sistem
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
                Tiga Fondasi Integritas CETAS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-7 rounded-3xl border border-blue-500/30 bg-[#0B1C3D] space-y-4 shadow-xl hover:border-cyan-400/60 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#126BDE]/20 text-cyan-300 border border-blue-500/40">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">Transparansi Dewan Juri</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Algoritma kalkulasi juknis mengunci nilai secara kriptografis pasca tanda tangan digital dewan hakim, meniadakan risiko kompromi atau manipulasi skor.
                </p>
              </div>

              <div className="p-7 rounded-3xl border border-blue-500/30 bg-[#0B1C3D] space-y-4 shadow-xl hover:border-cyan-400/60 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">Tiket QR Anti-Fraud</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Setiap tiket elektronik terenkripsi dengan kunci HMAC SHA-256 yang divalidasi instan oleh gatekeeper resmi untuk mencegah tiket duplikat atau palsu.
                </p>
              </div>

              <div className="p-7 rounded-3xl border border-blue-500/30 bg-[#0B1C3D] space-y-4 shadow-xl hover:border-amber-400/60 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">Produksi &amp; Alat Satu Atap</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Dukungan penyediaan panggung rigging konser, sound system line-array, dan videotron LED indoor/outdoor berstandar internasional tanpa perantara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
