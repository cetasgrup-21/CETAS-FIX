import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  Building2,
  Scale,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "Legalitas & Kepatuhan Perusahaan",
  description:
    "Informasi transparansi legalitas badan hukum, perizinan berusaha OSS (NIB), pendaftaran AHU Kemenkumham RI, kepatuhan PSE, dan perlindungan data pribadi CETAS.",
};

export default function LegalitasPage() {
  return (
    <div className="min-h-screen bg-[#06132E] text-white selection:bg-[#00D9FF] selection:text-[#06132E]">
      {/* ============================================================== */}
      {/* HERO SECTION — LEGALITAS & KEPATUHAN                           */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-blue-500/20 bg-gradient-to-b from-[#06132E] via-[#0A2450] to-[#06132E]">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00D9FF]/15 blur-3xl rounded-full" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 px-4 py-1 text-xs font-bold text-[#00D9FF] font-mono">
            <Scale className="h-4 w-4" />
            <span>LEGALITAS RESMI &amp; KEPATUHAN REGULASI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            Transparansi Legalitas &amp; Badan Hukum CETAS
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            <strong>CETAS (Centralized Electronic Tournament &amp; Award System)</strong> dikelola oleh entitas badan usaha resmi yang tunduk pada seluruh peraturan perundang-undangan Republik Indonesia.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-cyan-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Badan Hukum Terdaftar Kemenkumham</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>NIB Terbit Efektif OSS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Patuh UU Pelindungan Data Pribadi (UU PDP)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 1. PROFIL BADAN USAHA                                          */}
      {/* ============================================================== */}
      <section className="py-16 bg-white text-[#06132E] border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#126BDE] font-mono">
              Entitas Hukum Resmi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#06132E] font-display">
              Profil Badan Usaha Pengelola
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              CETAS beroperasi sebagai platform teknologi digital terpadu untuk ekosistem event, turnamen baris-berbaris (LKBB), ticketing, voting, dan persewaan perlengkapan acara.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#126BDE]/10 text-[#126BDE]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#06132E]">Identitas Badan Hukum</h3>
                  <p className="text-xs text-slate-500 font-mono">Status Hukum Resmi</p>
                </div>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <dt className="text-slate-500">Nama Platform:</dt>
                  <dd className="font-bold text-[#06132E]">CETAS</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <dt className="text-slate-500">Kepanjangan Resmi:</dt>
                  <dd className="font-bold text-[#06132E] text-right">Centralized Electronic Tournament &amp; Award System</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <dt className="text-slate-500">Bentuk Usaha:</dt>
                  <dd className="font-bold text-[#06132E]">Perseroan Perorangan (PT Perorangan)</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <dt className="text-slate-500">Tagline Resmi:</dt>
                  <dd className="font-bold text-[#126BDE]">Your Event, Elevated.</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#06132E]">Ruang Lingkup Usaha</h3>
                  <p className="text-xs text-slate-500 font-mono">Penyelenggara Jasa Teknologi</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>CETAS.TIKET:</strong> Sistem reservasi dan penerbitan tiket elektronik terenkripsi HMAC SHA-256.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>CETAS.ID:</strong> Bilik voting digital publik anti-bot untuk penentuan kontingen favorit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>CETAS.SCORE:</strong> Mesin rekapitulasi penilaian juri real-time zero-touch dan berita acara digital.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>CETAS.PRODUCTION:</strong> Penyediaan panggung rigging, sound system konser, dan videotron LED.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. DOKUMEN LEGALITAS RESMI                                     */}
      {/* ============================================================== */}
      <section className="py-16 bg-[#F4F6F9] text-[#06132E] border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#126BDE] font-mono">
              Kepatuhan Administrasi Negara
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#06132E] font-display">
              Status Perizinan &amp; Legalitas Resmi
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Seluruh kegiatan operasional telah didaftarkan dan diverifikasi sesuai ketentuan instansi kementerian terkait di Republik Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card AHU */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono">KEMENTERIAN HUKUM RI</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">Terdaftar Resmi</span>
              </div>
              <h3 className="text-lg font-black text-[#06132E]">A. Sertifikat Pendaftaran AHU</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pendaftaran Pendirian Perseroan Perorangan secara sah diterbitkan oleh Direktorat Jenderal Administrasi Hukum Umum (Ditjen AHU), Kementerian Hukum Republik Indonesia.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Status: <span className="text-emerald-600 font-bold">Sah Berbadan Hukum</span>
              </div>
            </div>

            {/* Card NIB OSS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono">SISTEM OSS INDONESIA</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">Berlaku Efektif</span>
              </div>
              <h3 className="text-lg font-black text-[#06132E]">B. Nomor Induk Berusaha (NIB)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Perizinan Berusaha Berbasis Risiko terdaftar pada sistem Online Single Submission (OSS) Kementerian Investasi/BKPM dengan Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) relevan.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                KBLI: <span className="text-[#06132E] font-mono font-bold">62019, 62029, 82302, 77399</span>
              </div>
            </div>

            {/* Card PSE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono">KOMINFO RI</span>
                <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">Terdaftar / Dalam Proses</span>
              </div>
              <h3 className="text-lg font-black text-[#06132E]">C. Pendaftaran PSE Lingkup Privat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penyelenggara Sistem Elektronik (PSE) Lingkup Privat yang mematuhi standar keamanan transmisi data dan integritas transaksi digital masyarakat.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Sektor: <span className="text-[#126BDE] font-bold">Teknologi Informasi &amp; Event</span>
              </div>
            </div>

            {/* Card Perpajakan NPWP */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono">DITJEN PAJAK RI</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">Terdaftar</span>
              </div>
              <h3 className="text-lg font-black text-[#06132E]">D. Identitas Perpajakan (NPWP)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kepatuhan perpajakan perusahaan terdaftar secara resmi di Kantor Pelayanan Pajak (KPP) sesuai hukum keuangan Republik Indonesia.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Kepatuhan: <span className="text-emerald-600 font-bold">Wajib Pajak Badan Terdaftar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. KEPATUHAN PERLINDUNGAN DATA (UU PDP)                         */}
      {/* ============================================================== */}
      <section className="py-16 bg-[#0A2450] text-white border-b border-blue-500/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D9FF] font-mono">
              Keamanan Data &amp; Privasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Kepatuhan UU No. 27 Tahun 2022 (UU PDP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              Kami memperlakukan privasi data peserta lomba, dewan juri, panitia, dan pengunjung sebagai prioritas tertinggi dengan enkripsi standar industri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-blue-400/30 bg-[#06132E] p-4 space-y-2">
              <Lock className="h-5 w-5 text-[#00D9FF]" />
              <h4 className="text-sm font-bold text-white">Enkripsi SHA-256</h4>
              <p className="text-xs text-slate-200">
                Seluruh tiket QR dan rekapitulasi skor juri ditandatangani secara digital dengan kunci rahasia HMAC anti-duplikasi.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/30 bg-[#06132E] p-4 space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Anti-Penyalahgunaan</h4>
              <p className="text-xs text-slate-200">
                Data pribadi nomor WhatsApp, email, dan identitas kontingen tidak pernah diperjualbelikan kepada pihak ketiga manapun.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/30 bg-[#06132E] p-4 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-[#00D9FF]" />
              <h4 className="text-sm font-bold text-white">Hak Subjek Data</h4>
              <p className="text-xs text-slate-200">
                Pengguna berhak meminta perbaikan atau penghapusan data akun melalui saluran pengaduan resmi CETAS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. KONTAK PENGADUAN & BANTUAN RESMI                            */}
      {/* ============================================================== */}
      <section id="faq" className="py-16 bg-[#06132E] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Layanan Bantuan &amp; Pengaduan Kepatuhan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Apabila Anda memiliki pertanyaan terkait legalitas, perlindungan data, atau kerja sama instansi resmi, silakan hubungi kami.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a
              href="mailto:legal@cetas.co.id"
              className="flex items-center gap-3 p-4 rounded-2xl border border-blue-500/30 bg-[#0A2450] hover:border-[#00D9FF] transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D9FF]/20 text-[#00D9FF]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] text-cyan-300 font-mono uppercase">Email Legalitas</span>
                <span className="text-xs font-bold text-white group-hover:text-[#00D9FF]">legal@cetas.co.id</span>
              </div>
            </a>

            <a
              href="https://wa.me/6281584682345?text=Halo%20Tim%20Legal%20CETAS%2C%20saya%20ingin%20berkonsultasi%20terkait%20legalitas%20dan%20kemitraan."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-[#0A2450] hover:border-emerald-400 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] text-emerald-300 font-mono uppercase">WhatsApp Pengaduan</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">0815-8468-2345 (24/7)</span>
              </div>
            </a>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black px-6 py-3 text-xs shadow-lg transition-transform active:scale-95"
            >
              <span>Kembali ke Beranda CETAS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
