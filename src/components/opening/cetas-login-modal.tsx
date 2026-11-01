"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trophy,
  Users,
  Search,
  ExternalLink,
  Award,
} from "lucide-react";
import { saveAdminSession, ROLE_DEFINITIONS, AdminRole } from "@/lib/admin-auth";

export function CetasLoginModal() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [portalType, setPortalType] = useState<"admin" | "pelatih">("admin");

  // Admin form state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Pelatih form state
  const [coachCode, setCoachCode] = useState("");
  const [coachError, setCoachError] = useState("");

  useEffect(() => {
    // Listen for "Masuk" click from navbar
    const handleOpenLogin = (e?: any) => {
      if (e?.detail?.type === "pelatih") {
        setPortalType("pelatih");
      } else {
        setPortalType("admin");
      }
      setShowLoginModal(true);
    };

    window.addEventListener("cetas:open-login", handleOpenLogin);
    return () => {
      window.removeEventListener("cetas:open-login", handleOpenLogin);
    };
  }, []);

  const handleAdminLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setLoginError("");
    setIsLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();
      const cleanPin = pin.trim();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: cleanUser,
          pin: cleanPin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Username atau Password/PIN tidak sesuai.");
      }

      setLoginSuccess(true);

      const role = String(data.role || "").toUpperCase();

      const adminRoles = [
        "SUPER_ADMIN",
        "ADMIN",
        "OPERATOR",
        "EVENT_ADMIN",
        "FINANCE_ADMIN",
        "PROD_ADMIN",
        "SCANNER_STAFF",
        "STAFF_REKAP",
        "PANITIA",
        "ORGANIZER",
      ];

      if (adminRoles.includes(role)) {
        const fallbackDefs = ROLE_DEFINITIONS[role as AdminRole] || ROLE_DEFINITIONS.SUPER_ADMIN;
        saveAdminSession({
          id: `usr-${Date.now()}`,
          name: data.name || cleanUser,
          email: cleanUser.includes("@") ? cleanUser : `${cleanUser}@cetas.co.id`,
          role: (role === "ADMIN" ? "SUPER_ADMIN" : role) as AdminRole,
          roleTitle: fallbackDefs.title,
          avatarColor: "bg-blue-600 text-white",
          lastLogin: "Baru saja",
          ...fallbackDefs,
        });
      }

      setTimeout(() => {
        setShowLoginModal(false);
        if (role === "JUDGE") {
          window.location.href = "/judge";
        } else if (role === "TIMER") {
          window.location.href = "/timer";
        } else if (role === "ORGANIZER") {
          window.location.href = "/admin?tab=EVENTS";
        } else if (role === "USER") {
          window.location.href = "/events";
        } else {
          window.location.href = "/admin";
        }
      }, 900);
    } catch (err: any) {
      setLoginError(err.message || "Gagal masuk. Periksa kembali akun Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoachSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = coachCode.trim();
    if (!cleanCode) {
      // Direct to general pelatih portal
      setShowLoginModal(false);
      window.location.href = "/pelatih";
      return;
    }

    setShowLoginModal(false);
    window.location.href = `/pelatih?code=${encodeURIComponent(cleanCode)}`;
  };

  if (!showLoginModal) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Akses Masuk CETAS"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06132E]/90 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-blue-500/40 bg-[#0B1C3D] text-white shadow-2xl p-6 sm:p-7 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-300 hover:text-white hover:bg-blue-900/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Portal Switcher Header */}
        <div className="text-center pb-4 mb-4 border-b border-blue-500/25">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00D9FF] font-mono">
            Gerbang Autentikasi CETAS
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">Pilih Akses Masuk Anda</h3>
          <p className="text-xs text-slate-200 mt-1">
            Silakan pilih peran untuk diarahkan ke dashboard kerja yang sesuai.
          </p>

          {/* Dual Toggle Pill Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#06132E] border border-blue-500/35">
            <button
              type="button"
              onClick={() => {
                setPortalType("admin");
                setLoginError("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                portalType === "admin"
                  ? "bg-[#126BDE] text-white shadow-md shadow-blue-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin &amp; Panitia</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType("pelatih");
                setCoachError("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                portalType === "pelatih"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Pelatih &amp; Tim</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: ADMIN & PANITIA AUTH FORM                               */}
        {/* ============================================================== */}
        {portalType === "admin" && (
          <div>
            {loginSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-black text-white">Autentikasi Berhasil!</h4>
                <p className="text-xs text-slate-200">Menghubungkan ke sesi aman Anda...</p>
              </div>
            ) : (
              <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 text-xs">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-500/50 p-2.5 text-rose-200 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email / Username */}
                <div>
                  <label className="block text-white font-bold mb-1">
                    Email Resmi atau Username Staf
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00D9FF]" />
                    <input
                      type="text"
                      required
                      placeholder="superadmin, admin, judge, scanner, dll..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-blue-500/40 bg-[#06132E] pl-9 pr-3 py-2.5 text-white placeholder-slate-400 focus:border-[#00D9FF] focus:outline-none focus:ring-1 focus:ring-[#00D9FF]/40 text-xs"
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-white font-bold">Password Keamanan / PIN Juri</label>
                    <a
                      href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20butuh%20bantuan%20reset%20akun%20atau%20password."
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-[#00D9FF] hover:underline"
                    >
                      Bantuan login?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00D9FF]" />
                    <input
                      type={showPin ? "text" : "password"}
                      required
                      placeholder="Masukkan password atau PIN resmi"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full rounded-xl border border-blue-500/40 bg-[#06132E] pl-9 pr-10 py-2.5 text-white placeholder-slate-400 focus:border-[#00D9FF] focus:outline-none focus:ring-1 focus:ring-[#00D9FF]/40 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-blue-500/50 bg-[#06132E] text-[#00D9FF] focus:ring-[#00D9FF]/30"
                    />
                    <span className="text-slate-100 font-semibold text-xs">Ingat sesi di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D9FF] to-[#006BFF] hover:from-[#00C2E5] hover:to-[#0055CC] text-slate-950 font-black py-3 shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{isLoading ? "Memverifikasi..." : "Masuk ke Dashboard Admin"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="text-slate-300 hover:text-white font-semibold"
                    >
                      Tutup
                    </button>
                    <Link
                      href="/ajukan-event"
                      onClick={() => setShowLoginModal(false)}
                      className="text-[#00D9FF] font-bold hover:underline"
                    >
                      Daftar Event / Jadi Penyelenggara &rarr;
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PELATIH & KONTINGEN ENTRY PORTAL                         */}
        {/* ============================================================== */}
        {portalType === "pelatih" && (
          <form onSubmit={handleCoachSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1 text-slate-100">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Portal Resmi Pelatih &amp; Kontingen</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                Gunakan Kode Batch pendaftaran, Email resmi, atau No. WhatsApp pelatih yang terdaftar untuk memantau rekap skor live, unduh Berita Acara F4, dan sertifikat tim Anda.
              </p>
            </div>

            {/* Input Kode Batch / Email / WhatsApp */}
            <div>
              <label className="block text-white font-bold mb-1">
                Kode Batch / Email / No. WhatsApp Pelatih
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                <input
                  type="text"
                  placeholder="Contoh: BATCH-LKBB-24, email@gmail.com, atau 0812..."
                  value={coachCode}
                  onChange={(e) => setCoachCode(e.target.value)}
                  className="w-full rounded-xl border border-amber-400/40 bg-[#06132E] pl-9 pr-3 py-2.5 text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                *Gunakan Kode Batch, Email, atau No. WhatsApp terdaftar (bukan nomor urut peserta).
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span>{coachCode.trim() ? "Verifikasi & Buka Nilai Tim" : "Buka Halaman Portal Pelatih"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-300 hover:text-white font-semibold"
                >
                  Tutup
                </button>
                <Link
                  href="/pelatih"
                  onClick={() => setShowLoginModal(false)}
                  className="text-amber-300 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Lihat Seluruh Fitur Pelatih</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
