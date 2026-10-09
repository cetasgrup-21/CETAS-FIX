import Image from "next/image";
import Link from "next/link";

export default function CetasScorePortalPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] p-5 md:p-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
        <section className="bg-[#071a3d] px-6 py-10 md:px-12 md:py-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_340px]">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href="/admin"
                  className="text-xs font-bold text-blue-300/80 hover:text-white transition flex items-center gap-1"
                >
                  ← Lingkup Kerja Admin CETAS
                </Link>
              </div>
              <p className="text-xs font-black tracking-[.28em] text-blue-300">CETAS SCORE</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Competition Scoring System
              </h1>
              <p className="mt-4 max-w-xl text-white/65">
                Sistem penilaian kompetisi yang terpusat, terstruktur per event, penugasan juri dinamis, dan kalkulasi otomatis.
              </p>
            </div>
            <div className="order-1 mx-auto flex h-56 w-full max-w-[320px] items-center justify-center rounded-3xl bg-white p-5 shadow-2xl md:order-2">
              <Image
                src="/cetas-score-logo.png"
                alt="CETAS SCORE"
                width={280}
                height={280}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 p-6 sm:grid-cols-2 md:grid-cols-5 md:p-8">
          <Link
            href="/admin/dashboard"
            className="card p-6 transition hover:-translate-y-1 hover:border-blue-400 group"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              A
            </div>
            <b className="text-xl text-[#071a3d]">Admin Scoring</b>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih event, kelola tingkatan, kategori, materi, penugasan juri, dan peserta.
            </p>
          </Link>

          <Link
            href="/judge"
            className="card p-6 transition hover:-translate-y-1 hover:border-blue-400 group"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              J
            </div>
            <b className="text-xl text-[#071a3d]">Bilik Juri</b>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masuk ke halaman penilaian 10 interval sesuai kategori yang ditugaskan.
            </p>
          </Link>

          <Link
            href="/rekap"
            className="card p-6 transition hover:-translate-y-1 hover:border-blue-400 group"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 font-black text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              R
            </div>
            <b className="text-xl text-[#071a3d]">Rekap Nilai</b>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lihat rekapitulasi nilai per tingkatan, progres penilaian juri, dan ranking.
            </p>
          </Link>

          <Link
            href="/penentuan-juara"
            className="card p-6 transition hover:-translate-y-1 hover:border-blue-400 group"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 font-black text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              🏆
            </div>
            <b className="text-xl text-[#071a3d]">Juara & Cetak</b>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Penentuan juara utama/kategori, tie breaker, dan cetak rekap F4 landscape.
            </p>
          </Link>

          <Link
            href="/display"
            className="card p-6 transition hover:-translate-y-1 hover:border-blue-400 group"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              D
            </div>
            <b className="text-xl text-[#071a3d]">Display Layar</b>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tampilan leaderboard publik & panggung secara realtime tanpa perlu login.
            </p>
          </Link>
        </section>

        {/* Quick Utilities Footer */}
        <section className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/admin/judges" className="hover:text-blue-600 transition">
              👥 Penugasan Juri
            </Link>
            <span>•</span>
            <Link href="/admin/participants" className="hover:text-blue-600 transition">
              🏃 Data Peserta
            </Link>
            <span>•</span>
            <Link href="/admin/review" className="hover:text-blue-600 transition">
              📋 Review Lembar Nilai
            </Link>
            <span>•</span>
            <Link href="/timer" className="hover:text-blue-600 transition">
              ⏱️ Timer Penampilan
            </Link>
          </div>
          <div>
            Centralized Electronic Tournament & Award System (CETAS)
          </div>
        </section>
      </div>
    </main>
  );
}
