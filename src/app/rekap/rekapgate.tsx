"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RekapGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * =========================================================
   * STATUS MENU
   * =========================================================
   *
   * Modal menu hanya muncul ketika berada tepat di /rekap.
   * Saat "Rekap Pasukan" dipilih, modal ditutup sehingga
   * halaman Rekap Pasukan di belakang modal bisa digunakan.
   */
  const [showRekapMenu, setShowRekapMenu] =
    useState(true);

  const showMenu =
    pathname === "/rekap" &&
    showRekapMenu;

  /**
   * =========================================================
   * MENU 01 — INPUT PENILAIAN
   * =========================================================
   */
  function openInputPenilaian() {
    router.push("/rekap/input");
  }

  /**
   * =========================================================
   * MENU 02 — REKAP PASUKAN
   * =========================================================
   *
   * Halaman Rekap Pasukan memang sudah berada di belakang
   * modal karena kita sedang berada di /rekap.
   *
   * Jadi tidak perlu router.push("/rekap").
   * Cukup tutup modal.
   */
  function openRekapPasukan() {
    setShowRekapMenu(false);
  }

  /**
   * =========================================================
   * MENU 03 — REKAP KESELURUHAN
   * =========================================================
   */
  function openRekapKeseluruhan() {
    router.push("/penentuan-juara");
  }

  return (
    <>
      {children}

      {showMenu && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a3d]/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="bg-[#071a3d] px-7 py-8 text-white md:px-10">
              <p className="text-xs font-black tracking-[0.28em] text-blue-300">
                CETAS SCORE • REKAP
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Pilih Menu
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Pilih menu yang ingin kamu buka.
              </p>
            </div>

            {/* =================================================
                MENU
            ================================================= */}
            <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">

              {/* =============================================
                  01 — INPUT PENILAIAN
              ============================================= */}
              <button
                type="button"
                onClick={openInputPenilaian}
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
                  01
                </div>

                <h2 className="text-xl font-black text-slate-950">
                  Input Penilaian
                </h2>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  Masukkan atau perbarui nilai penilaian peserta berdasarkan
                  materi dan kriteria yang tersedia.
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#071a3d] px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-600">
                  Buka Input Penilaian →
                </div>
              </button>

              {/* =============================================
                  02 — REKAP PASUKAN
              ============================================= */}
              <button
                type="button"
                onClick={openRekapPasukan}
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
                  02
                </div>

                <h2 className="text-xl font-black text-slate-950">
                  Rekap Pasukan
                </h2>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  Lihat rekap nilai setiap pasukan, peserta, juri, kategori,
                  materi, dan hasil penilaian.
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#071a3d] px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-600">
                  Buka Rekap Pasukan →
                </div>
              </button>

              {/* =============================================
                  03 — REKAP KESELURUHAN
              ============================================= */}
              <button
                type="button"
                onClick={openRekapKeseluruhan}
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
                  03
                </div>

                <h2 className="text-xl font-black text-slate-950">
                  Rekap Keseluruhan
                </h2>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  Masuk ke penentuan juara untuk melihat ranking, kategori
                  juara, dan hasil keseluruhan kompetisi.
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#071a3d] px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-600">
                  Buka Rekap Keseluruhan →
                </div>
              </button>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 md:px-8">
              Akses rekap hanya tersedia untuk akun Admin CETAS.
            </div>

          </div>
        </div>
      )}
    </>
  );
}