"use client";

import { useState, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";

function LoginForm() {
  const search = useSearchParams();
  const requestedNext = search.get("next");

  let next = requestedNext || "/admin/dashboard";

  // Jika middleware mengirim /admin, arahkan ke scoring dashboard
  if (next === "/admin") {
    next = "/admin/dashboard";
  }

  // Sanitasi redirect luar
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/admin/dashboard";
  }

  const isJudgePath = next === "/judge" || next.startsWith("/judge/");
  const isTimerPath = next === "/timer" || next.startsWith("/timer/");
  const isRekapPath =
    next === "/penentuan-juara" ||
    next.startsWith("/penentuan-juara/") ||
    next === "/rekap" ||
    next.startsWith("/rekap/");

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

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

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      });

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

      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Username/Email atau PIN/Password tidak cocok.");
        return;
      }

      const role = String(data.role || "").toUpperCase();

      // Redirect otomatis sesuai role jika pengguna tidak memiliki tujuan spesifik
      let targetUrl = next;
      if (!requestedNext) {
        if (role === "JUDGE") {
          targetUrl = "/judge";
        } else if (role === "TIMER") {
          targetUrl = "/timer";
        } else if (role === "STAFF_REKAP" || role === "STAFF REKAP") {
          targetUrl = "/penentuan-juara";
        } else {
          targetUrl = "/admin/dashboard";
        }
      }

      window.location.assign(targetUrl);
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setLoading(false);
      setError("Terjadi kesalahan saat menghubungi server. Silakan coba lagi.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header Card Mengikuti Halaman Admin */}
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 shadow-md">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Sistem Autentikasi Terproteksi
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {isJudgePath
                  ? "Login Dewan Juri"
                  : isTimerPath
                  ? "Login Petugas Timer"
                  : isRekapPath
                  ? "Login Rekap & Penentuan Juara"
                  : "Sistem Penilaian Resmi Cetas Score"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Masukkan kredensial resmi terdaftar (Admin, Dewan Juri, Petugas Timer, atau Staf Rekap). Sistem dilindungi autentikasi terenkripsi.
              </p>
            </div>
          </div>

          {error && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Form Login Sesuai Format Halaman Admin */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username / Email Akun Resmi
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                placeholder="Masukkan username atau email resmi..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIN / Password Keamanan
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !pin.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold py-3 text-xs shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="h-4 w-4" />
              {loading ? "Memverifikasi Otorisasi..." : "Masuk Ke Cetas Score"}
            </button>
          </form>

          {/* Quick Credential Information */}
          <div className="max-w-md mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-xs space-y-2">
            <div className="font-black text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-orange-500" />
              <span>Panduan Kredensial Resmi Cetas Score:</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div>
                • <strong>Operator / Admin</strong>: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">admin</code> (PIN: <code className="font-bold text-slate-900 dark:text-white">123456</code>)
              </div>
              <div>
                • <strong>Dewan Juri</strong>: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400">juri</code> (PIN: <code className="font-bold text-slate-900 dark:text-white">123456</code> atau PIN Juri)
              </div>
              <div>
                • <strong>Petugas Timer</strong>: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-blue-700 dark:text-blue-400">timer</code> (PIN: <code className="font-bold text-slate-900 dark:text-white">123456</code>)
              </div>
              <div>
                • <strong>Staff Rekap</strong>: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-400">reza@cetas.co.id</code> (Password: <code className="font-bold text-slate-900 dark:text-white">RezaCetas2026!</code>)
              </div>
              <div>
                • <strong>Super Admin</strong>: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-amber-700 dark:text-amber-400">cetasgrup@gmail.com</code> (PIN: <code className="font-bold text-slate-900 dark:text-white">211226</code>)
              </div>
            </div>
          </div>

          {/* Navigasi Balik ke Portal Utama */}
          <div className="max-w-md mx-auto pt-2 flex items-center justify-between text-xs">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Portal Master Event</span>
            </Link>

            <Link
              href="/score"
              className="font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition"
            >
              Beranda Score →
            </Link>
          </div>

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Proteksi Keamanan Aktif • Autentikasi Dewan Juri, Timer, Rekap &amp; Admin.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center">
            <div className="text-xs font-bold text-slate-500">Memuat halaman login...</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
