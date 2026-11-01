import React from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Kebijakan Pembayaran & Pengembalian Dana (Refund Policy)",
  description:
    "Kebijakan resmi transaksi, payment gateway, klaim pengembalian dana, tiket, dan voting turnamen pada platform CETAS.",
};

export default function KebijakanLayananPage() {
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 px-3.5 py-1 text-xs font-mono font-bold">
            <CreditCard className="h-3.5 w-3.5" />
            <span>TRANSAKSI, TIKET &amp; REFUND POLICY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display">
            Kebijakan Pembayaran &amp; Pengembalian Dana
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Terakhir Diperbarui: 1 November 2026 • Transparansi Finansial &amp; Perlindungan Hak Konsumen CETAS.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">1. Kanal Pembayaran Resmi</h2>
            <p>
              Seluruh transaksi pembelian tiket event, kuota registrasi lomba, e-voting, dan rental peralatan diproses secara otomatis melalui payment gateway berizin Bank Indonesia (QRIS Nasional, Virtual Account Bank BCA/BNI/BRI/Mandiri, ShopeePay, OVO, dan DANA).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">2. Kebijakan Refund Tiket Event</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Pembatalan Resmi oleh Penyelenggara:</strong> Apabila suatu event dibatalkan secara sepihak oleh pihak penyelenggara resmi (force majeure atau alasan operasional panitia), pembeli tiket berhak atas pengembalian dana 100% dari harga tiket pokok.</li>
              <li><strong>Perubahan Tanggal (Reschedule):</strong> Tiket otomatis tetap berlaku pada tanggal baru yang ditetapkan oleh pihak penyelenggara. Jika pembeli berhalangan, pengajuan refund dapat dilakukan dalam waktu maksimal 7 hari kerja sejak pengumuman resmi.</li>
              <li><strong>Ketidakhadiran Pembeli:</strong> Tiket yang tidak digunakan oleh pembeli pada hari pelaksanaan event tidak dapat di-refund atau ditukarkan kembali.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">3. Kebijakan E-Voting Berbayar (CETAS.ID)</h2>
            <p>
              Dana voting yang telah disalurkan kepada peserta/kontingen favorit diproses secara langsung ke papan perolehan suara (live leaderboard) dan tidak dapat dibatalkan, dialihkan, atau ditarik kembali (*non-refundable*).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">4. Alur Pengajuan Pengembalian Dana</h2>
            <p>
              Untuk mengajukan proses pengembalian dana tiket akibat pembatalan event, silakan hubungi tim finance CETAS dengan menyertakan Nomor Pesanan (*Order Number*) dan bukti transfer ke:
            </p>
            <div className="p-4 rounded-xl bg-[#0A2450] border border-blue-500/30 text-xs space-y-1">
              <div><strong>Email Finance:</strong> support@cetas.co.id</div>
              <div><strong>WhatsApp Billing:</strong> 0815-8468-2345 (Hari Kerja 08:00 - 17:00 WIB)</div>
              <div><strong>Waktu Proses:</strong> Maksimal 3–7 hari kerja via transfer bank atau metode pembayaran asal.</div>
            </div>
          </section>
        </div>

        <div className="pt-8 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/legalitas"
            className="text-xs font-bold text-cyan-300 hover:underline"
          >
            ← Kembali ke Legalitas Perusahaan
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-white hover:text-cyan-300"
          >
            Kembali ke Beranda CETAS →
          </Link>
        </div>
      </div>
    </div>
  );
}
