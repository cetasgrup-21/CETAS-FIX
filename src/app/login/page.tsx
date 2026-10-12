"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const search = useSearchParams();

  /*
   * =====================================================
   * TUJUAN SETELAH LOGIN
   * =====================================================
   *
   * Admin:
   *   /login
   *   -> /admin/dashboard
   *
   * /login?next=/admin
   *   -> /admin/dashboard
   *
   * Juri:
   *   /login?next=/judge
   *   -> /judge
   */

  const requestedNext = search.get("next");

  let next = requestedNext || "/admin/dashboard";

  /*
   * Kalau middleware mengirim /admin,
   * arahkan ke dashboard admin.
   */
  if (next === "/admin") {
    next = "/admin/dashboard";
  }

  /*
   * =====================================================
   * VALIDASI REDIRECT
   * =====================================================
   *
   * Jangan izinkan redirect ke website luar.
   */
  if (
    !next.startsWith("/") ||
    next.startsWith("//")
  ) {
    next = "/admin/dashboard";
  }

  /*
   * =====================================================
   * DETEKSI LOGIN JURI / STAFF REKAP
   * =====================================================
   */

  const isJudge =
    next === "/judge" ||
    next.startsWith("/judge/");

  const isRekapOrJuara =
    next === "/penentuan-juara" ||
    next.startsWith("/penentuan-juara/") ||
    next === "/rekap" ||
    next.startsWith("/rekap/");

  /*
   * =====================================================
   * STATE
   * =====================================================
   */

  const [username, setUsername] = useState("");

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * =====================================================
   * SUBMIT LOGIN
   * =====================================================
   */

  async function submit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const cleanUser = username.trim();
      const cleanPin = pin.trim();

      // Cek apakah akun terdaftar di daftar staf /admin lokal untuk disinkronkan
      let matchedStaff: { name?: string; role?: string } | null = null;
      try {
        const rawList = localStorage.getItem("cetas_admin_staff_accounts_v2");
        if (rawList) {
          const parsed = JSON.parse(rawList) as Array<{
            name: string;
            email: string;
            password: string;
            role: string;
          }>;
          const found = parsed.find(
            (u) =>
              u.email.toLowerCase() === cleanUser.toLowerCase() &&
              u.password === cleanPin
          );
          if (found) {
            matchedStaff = { name: found.name, role: found.role };
          }
        }
      } catch {}

      /*
       * =================================================
       * KIRIM LOGIN KE API
       * =================================================
       */

      const res = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: cleanUser,
            pin: cleanPin,
            ...(matchedStaff
              ? {
                  syncStaffAccount: true,
                  name: matchedStaff.name,
                  role: matchedStaff.role,
                }
              : {}),
          }),
        }
      );

      /*
       * =================================================
       * BACA RESPONSE
       * =================================================
       */

      let data: {
        error?: string;
        success?: boolean;
        role?: string;
        name?: string;
      } = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      /*
       * =================================================
       * LOGIN GAGAL
       * =================================================
       */

      if (!res.ok) {
        setLoading(false);

        setError(
          data.error ||
            "Username/Email atau PIN/Password salah."
        );

        return;
      }

      // Validasi Role untuk halaman Juara & Cetak / Rekap
      const userRole = String(data.role || "").toUpperCase();
      if (isRekapOrJuara) {
        const allowedForRekap = [
          "SUPER_ADMIN",
          "ADMIN",
          "EVENT_ADMIN",
          "STAFF_REKAP",
          "STAFF REKAP",
          "OPERATOR",
        ];
        if (!allowedForRekap.includes(userRole)) {
          setLoading(false);
          setError(
            `Akses ditolak: Akun dengan role "${userRole}" tidak memiliki izin mengakses halaman Juara & Cetak. Silakan login menggunakan akun Admin atau Role "STAFF REKAP".`
          );
          return;
        }
      }

      /*
       * =================================================
       * LOGIN BERHASIL
       * =================================================
       */

      window.location.assign(next);

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setLoading(false);

      setError(
        "Terjadi kesalahan saat menghubungi server."
      );
    }
  }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-5">

      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-md items-center justify-center">

        <div className="card w-full overflow-hidden">

          {/* =================================================
              HEADER LOGIN
          ================================================= */}

          <div className="bg-[#071a3d] px-7 pb-7 pt-8 text-center">

            <div className="mx-auto flex h-28 w-56 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">

              <Image
                src="/cetas-score-logo.png"
                alt="CETAS SCORE"
                width={210}
                height={210}
                className="h-full w-auto object-contain"
                priority
              />

            </div>

            <h1 className="mt-5 text-xl font-black text-white">
              {isJudge
                ? "Login Dewan Juri"
                : isRekapOrJuara
                ? "Login Admin / Staff Rekap"
                : "Login Admin & Staff Rekap"}
            </h1>

            <p className="mt-1 text-sm text-white/60">
              {isRekapOrJuara
                ? "Wajib login sebagai Admin atau Role Staff Rekap untuk mengakses Juara & Cetak"
                : "Masuk untuk melanjutkan ke Cetas.Score"}
            </p>

          </div>

          {/* =================================================
              FORM LOGIN
          ================================================= */}

          <form
            onSubmit={submit}
            className="space-y-4 p-7"
          >

            {/* =================================================
                USERNAME
            ================================================= */}

            <label className="block">

              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Username / Email Resmi
              </span>

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="Contoh: staffrekap / cetasgrup@gmail.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={loading}
              />

            </label>

            {/* =================================================
                PIN / PASSWORD
            ================================================= */}

            <label className="block">

              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                PIN / Password
              </span>

              <input
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value.slice(0, 32)
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 tracking-[.15em] outline-none transition focus:border-blue-500"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                disabled={loading}
              />

            </label>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={
                loading ||
                !username.trim() ||
                !pin.trim()
              }
              className="w-full rounded-xl bg-[#1769e0] px-4 py-3 font-bold text-white transition hover:bg-[#125bc4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Memeriksa Otorisasi..."
                : "Masuk"}
            </button>

            {/* =================================================
                KEMBALI KE CETAS.SCORE
            ================================================= */}

            <Link
              href="/score"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#1769e0] hover:bg-blue-50 hover:text-[#1769e0]"
            >
              ← Kembali ke CETAS.SCORE
            </Link>

          </form>

        </div>

      </div>

    </main>
  );
}

/*
 * =========================================================
 * LOGIN PAGE
 * =========================================================
 */

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f7fb] p-5">

          <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-md items-center justify-center">

            <div className="card w-full p-10 text-center">

              <div className="text-sm font-bold text-slate-500">
                Memuat halaman login...
              </div>

            </div>

          </div>

        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}