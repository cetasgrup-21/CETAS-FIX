import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi (Privacy Policy)",
  description:
    "Kebijakan Privasi CETAS sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
};

export default function KebijakanPrivasiPage() {
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00D9FF]/15 text-[#00D9FF] px-3.5 py-1 text-xs font-mono font-bold">
            <Lock className="h-3.5 w-3.5" />
            <span>UU NO. 27 TAHUN 2022 (UU PDP)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display">
            Kebijakan Privasi Data CETAS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Terakhir Diperbarui: 1 November 2026 • Berlaku Efektif untuk Seluruh Layanan Platform CETAS.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">1. Komitmen Perlindungan Data</h2>
            <p>
              CETAS (Centralized Electronic Tournament &amp; Award System) berkomitmen untuk melindungi dan menghormati hak privasi setiap pengguna, pengunjung, peserta kompetisi, dan dewan juri sesuai dengan ketentuan <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">2. Data yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data Pembelian Tiket:</strong> Nama lengkap, alamat email, dan nomor WhatsApp untuk pengiriman e-ticket HMAC QR Code.</li>
              <li><strong>Data Pendaftaran Kontingen:</strong> Nama sekolah/instansi, kategori lomba, nama pelatih/official, dan daftar anggota tim LKBB.</li>
              <li><strong>Data Pembayaran:</strong> Catatan status transaksi resmi melalui payment gateway (QRIS, VA, E-Wallet) tanpa menyimpan nomor kartu kredit sensitif pada server kami.</li>
              <li><strong>Data Penilaian Juri:</strong> Rekap nilai resmi yang ditandatangani secara elektronik oleh dewan juri bersertifikat.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">3. Tujuan Penggunaan Data</h2>
            <p>
              Data yang dikumpulkan hanya digunakan untuk keperluan verifikasi tiket di pintu gerbang (*Gate Scanner*), pencetakan lembar rekapitulasi nilai resmi juri, komunikasi status transaksi tiket melalui WhatsApp/Email resmi, dan penyusunan berita acara lomba.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">4. Larangan Penjualan Data Pihak Ketiga</h2>
            <p>
              CETAS <strong>tidak akan pernah</strong> memperjualbelikan, menyewakan, atau mendistribusikan data pribadi pengguna kepada pihak luar untuk keperluan iklan, spam, atau telemarketing tanpa persetujuan eksplisit dari pemilik data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">5. Keamanan &amp; Enkripsi</h2>
            <p>
              Seluruh transmisi data dienkripsi menggunakan protokol aman HTTPS/TLS. Tiket digital dan token penilaian dewan juri menggunakan enkripsi kriptografis HMAC SHA-256 untuk mencegah manipulasi nilai maupun duplikasi tiket.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">6. Hak Subjek Data</h2>
            <p>
              Sesuai UU PDP, Anda berhak mengakses, memperbaiki, meminta pembaruan, atau meminta penghapusan data pribadi Anda dari sistem kami dengan menghubungi kontak kepatuhan kami di <a href="mailto:legal@cetas.co.id" className="text-cyan-300 underline">legal@cetas.co.id</a>.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/syarat-ketentuan"
            className="text-xs font-bold text-cyan-300 hover:underline"
          >
            Baca Syarat &amp; Ketentuan Layanan →
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
