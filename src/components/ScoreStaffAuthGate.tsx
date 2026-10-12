"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { canAccessScoreRekapAndJuara } from "@/lib/admin-auth";

type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: string;
};

interface ScoreStaffAuthGateProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

function formatRoleBadge(role: string): string {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "SUPER_ADMIN") return "SUPER ADMIN";
  if (normalized === "STAFF_REKAP" || normalized === "STAFF REKAP") return "STAFF REKAP";
  if (normalized === "EVENT_ADMIN") return "ADMIN EVENT";
  if (normalized === "OPERATOR") return "STAFF REKAP / OPERATOR";
  if (normalized === "ADMIN") return "ADMIN SCORING";
  return normalized || "STAFF REKAP";
}

export default function ScoreStaffAuthGate({
  children,
  pageTitle = "Juara & Cetak (Penentuan Juara)",
  pageDescription = "Halaman ini dilindungi. Silakan login sebagai Admin atau Role \"STAFF REKAP\" untuk mengakses pengelolaan juara dan cetak dokumen resmi.",
}: ScoreStaffAuthGateProps) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unauthorizedRole, setUnauthorizedRole] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const checkSession = useCallback(async () => {
    try {
      setCheckingAuth(true);
      setUnauthorizedRole(null);

      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      if (data?.authenticated && data?.user) {
        if (canAccessScoreRekapAndJuara(data.user.role)) {
          setUser(data.user);
        } else {
          setUser(null);
          setUnauthorizedRole(data.user.role);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const cleanUsername = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUsername || !cleanPin) {
      setError("Username/Email dan PIN/Password wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Cek apakah akun dibuat di /admin lokal agar otomatis disinkronkan ke database
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
              u.email.toLowerCase() === cleanUsername.toLowerCase() &&
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
          username: cleanUsername,
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setError(data?.error || "Username/Email atau PIN/Password tidak valid.");
        setSubmitting(false);
        return;
      }

      const loggedRole = String(data.role || data.user?.role || "").toUpperCase();
      if (!canAccessScoreRekapAndJuara(loggedRole)) {
        setError(
          `Akses ditolak: Akun "${data.name || cleanUsername}" memiliki role "${loggedRole}". Halaman ini wajib menggunakan akun ADMIN atau Role "STAFF REKAP".`
        );
        setSubmitting(false);
        return;
      }

      setUser({
        id: data.user?.id || "auth-user",
        name: data.name || data.user?.name || cleanUsername,
        username: data.username || data.user?.username || cleanUsername,
        role: loggedRole,
      });
      setUnauthorizedRole(null);
      setPin("");
    } catch {
      setError("Gagal menghubungi server autentikasi CETAS.SCORE.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
    setUsername("");
    setPin("");
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1769e0]" />
          <p className="text-base font-black text-[#071a3d]">
            Memeriksa Otorisasi Akses...
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Memvalidasi sesi Admin / Role Staff Rekap pada CETAS.SCORE
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 flex items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* HEADER LOGIN */}
          <div className="bg-[#071a3d] px-7 pb-7 pt-8 text-center">
            <div className="mx-auto flex h-24 w-52 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
              <Image
                src="/cetas-score-logo.png"
                alt="CETAS SCORE"
                width={190}
                height={190}
                className="h-full w-auto object-contain"
                priority
              />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
              🔒 Wajib Login: Admin / Role &quot;STAFF REKAP&quot;
            </div>

            <h1 className="mt-3 text-xl font-black text-white">
              {pageTitle}
            </h1>

            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              {pageDescription}
            </p>
          </div>

          {/* FORM LOGIN */}
          <form onSubmit={handleLogin} className="space-y-4 p-7">
            {unauthorizedRole && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
                Sesi Anda saat ini menggunakan role <strong>{unauthorizedRole}</strong>. Silakan masuk menggunakan akun <strong>Admin</strong> atau <strong>Role &quot;STAFF REKAP&quot;</strong>.
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600">
                Username / Email Admin atau Staff Rekap
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: staffrekap atau cetasgrup@gmail.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1769e0]"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={submitting}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600">
                PIN / Password Otorisasi
              </span>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 32))}
                type="password"
                placeholder="Masukkan PIN atau Password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold tracking-[.15em] text-slate-900 outline-none transition focus:border-[#1769e0]"
                autoComplete="current-password"
                disabled={submitting}
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !username.trim() || !pin.trim()}
              className="w-full rounded-xl bg-[#1769e0] px-4 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#125bc4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Memverifikasi Akun..."
                : "Masuk sebagai Admin / Staff Rekap →"}
            </button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-600">
              <p className="font-black text-slate-800">
                Informasi Akses Role &quot;STAFF REKAP&quot;:
              </p>
              <p className="mt-1">
                • Akun <strong>STAFF REKAP</strong> dapat dibuat atau dikelola oleh Super Admin melalui menu{" "}
                <Link href="/admin/judges" className="font-bold text-[#1769e0] underline">
                  Manajemen Juri &amp; Staff Rekap
                </Link>{" "}
                atau{" "}
                <Link href="/admin" className="font-bold text-[#1769e0] underline">
                  Portal Admin CETAS
                </Link>.
              </p>
              <p className="mt-0.5">
                • Akun bawaan Tim Rekap: username <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono font-bold text-slate-900">staffrekap</code> / PIN <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono font-bold text-slate-900">123456</code>.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href="/score"
                className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:border-[#1769e0] hover:bg-blue-50 hover:text-[#1769e0]"
              >
                ← Kembali ke CETAS.SCORE
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
              >
                Beranda
              </Link>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* TOP BAR OTORISASI AKTIF (DISEMBUNYIKAN SAAT CETAK / PRINT) */}
      <div className="print:hidden border-b border-slate-200 bg-[#071a3d] px-4 py-2.5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-black text-emerald-300">
              ● Sesi Terautentikasi
            </span>
            <span className="text-xs font-black text-white">
              {user.name}
            </span>
            <span className="rounded-full bg-indigo-500/30 border border-indigo-300/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-200">
              ROLE: {formatRoleBadge(user.role)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/judges"
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              Kelola Akun Staff Rekap
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-rose-700"
            >
              Keluar / Kunci Halaman
            </button>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
