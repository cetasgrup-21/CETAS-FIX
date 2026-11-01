import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan Layanan (Terms of Service)",
  description:
    "Syarat dan ketentuan resmi penggunaan platform CETAS, mencakup ticketing, e-voting, sistem scoring, dan registrasi turnamen.",
};

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-[#06132E] text-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="space-y-3 border-b border-blue-500/20 pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#126BDE]/20 text-[#00D9FF] px-3.5 py-1 text-xs font-mono font-bold">
            <Scale className="h-3.5 w-3.5" />
            <span>KETENTUAN HUKUM OPERASIONAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display">
            Syarat &amp; Ketentuan Layanan CETAS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Terakhir Diperbarui: 1 November 2026 • Mengatur Hak &amp; Kewajiban Penyelenggara, Peserta, dan Pengunjung.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">1. Definisi &amp; Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses situs web <strong>cetas.co.id</strong>, membeli tiket, memberikan vote, atau menggunakan sistem penilaian juri, Anda menyatakan setuju dan terikat secara hukum dengan seluruh syarat dan ketentuan ini.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">2. Penggunaan Sistem Tiket (CETAS.TIKET)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Setiap e-ticket diterbitkan secara digital dengan QR Code unik yang diverifikasi oleh petugas scanner resmi di lokasi event.</li>
              <li>Satu QR Code hanya dapat dipindai satu kali untuk akses masuk (anti-duplikasi).</li>
              <li>Pemegang tiket bertanggung jawab penuh menjaga kerahasiaan QR Code masing-masing agar tidak disalahgunakan pihak lain.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">3. Aturan E-Voting Publik (CETAS.ID)</h2>
            <p>
              Sistem e-voting menerapkan pembatasan bot dan proteksi integritas suara. Suara yang telah disalurkan dan terkonfirmasi lunas melalui QRIS bersifat final, real-time, dan tidak dapat dibatalkan atau dialihkan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">4. Integritas Penilaian Juri (CETAS.SCORE)</h2>
            <p>
              Sistem kalkulasi nilai juknis dan berita acara pada CETAS.SCORE bersifat mutlak dan independen. Dewan hakim dan juri yang ditugaskan bertanggung jawab penuh atas nilai yang diinput melalui token otorisasi masing-masing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">5. Pembatalan &amp; Pengembalian Dana</h2>
            <p>
              Ketentuan mengenai pembatalan acara atau refund diatur secara spesifik dalam dokumen <Link href="/kebijakan-layanan" className="text-cyan-300 underline">Kebijakan Pembayaran &amp; Refund CETAS</Link>.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/kebijakan-layanan"
            className="text-xs font-bold text-cyan-300 hover:underline"
          >
            Baca Kebijakan Pembayaran &amp; Refund →
          </Link>
          <Link
            href="/legalitas"
            className="text-xs font-bold text-white hover:text-cyan-300"
          >
            Lihat Legalitas Perusahaan →
          </Link>
        </div>
      </div>
    </div>
  );
}
