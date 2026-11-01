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
} from "lucide-react";
import { CetasVectorLogoAnimation } from "./cetas-vector-logo-animation";

export function CetasOpeningExperience() {
  const [showSplash, setShowSplash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Login form state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    // Only show on root path or when directly opening the hub
    const isSubpath =
      typeof window !== "undefined" &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "";

    if (!isSubpath) {
      setShowSplash(true);

      // Fast, slick preloader: 900ms active -> 400ms fade out -> unmount
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 950);

      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 1400);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  useEffect(() => {
    // Listen for "Masuk" click from navbar
    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };

    window.addEventListener("cetas:open-login", handleOpenLogin);
    return () => {
      window.removeEventListener("cetas:open-login", handleOpenLogin);
    };
  }, []);

  const handleLoginSubmit = async (e: FormEvent) => {
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

      setTimeout(() => {
        setShowLoginModal(false);
        if (data.role === "ADMIN" || data.role === "OPERATOR") {
          window.location.href = "/admin/dashboard";
        } else if (data.role === "JURY") {
          window.location.href = "/judge";
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || "Gagal masuk. Periksa kembali akun Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. CINEMATIC SPLASH ANIMATION (LANGSUNG MASUK KE BERANDA)      */}
      {/* ============================================================== */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A12] select-none transition-all duration-500 ease-out ${
            isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
          }`}
        >
          {/* Subtle Ambient Light Ring */}
          <div className="pointer-events-none absolute w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />

          {/* Centered Vector Logo Animation (Like Katha Rekap Gambar 3) */}
          <div className="relative z-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <CetasVectorLogoAnimation size={150} />
            <div className="mt-4 text-center space-y-1">
              <span className="block text-base font-black font-mono tracking-[0.4em] uppercase text-white drop-shadow-[0_0_16px_rgba(6,182,212,0.6)]">
                CETAS
              </span>
              <span className="block text-[10px] font-bold font-mono tracking-widest uppercase text-cyan-400">
                Move Different
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ON-DEMAND LOGIN MODAL (TRIGGERED ONLY BY "MASUK" BUTTON)    */}
      {/* ============================================================== */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Masuk ke Akun CETAS"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#0B0F19] text-white shadow-2xl p-6 sm:p-7 my-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Masuk ke Akun CETAS</h3>
                <p className="text-[11px] text-slate-400">
                  Akses portal Admin, Dewan Juri, atau Pelatih
                </p>
              </div>
            </div>

            {loginSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-black text-white">Autentikasi Berhasil!</h4>
                <p className="text-xs text-slate-400">Menghubungkan ke sesi aman Anda...</p>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/40 p-2.5 text-rose-300 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email / Username */}
                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Email atau Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan email atau username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-200 font-bold">Password atau PIN</label>
                    <a
                      href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20butuh%20bantuan%20reset%20akun%20atau%20password."
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-cyan-400 hover:underline"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type={showPin ? "text" : "password"}
                      required
                      placeholder="Masukkan password atau PIN akun"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <span className="text-slate-300 font-medium">Ingat sesi di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black py-3 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                  >
                    <span>{isLoading ? "Memverifikasi..." : "Masuk ke Akun"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="text-slate-400 hover:text-white font-semibold"
                    >
                      Batal
                    </button>
                    <Link
                      href="/ajukan-event"
                      onClick={() => setShowLoginModal(false)}
                      className="text-cyan-400 font-bold hover:underline"
                    >
                      Daftar Akun Penyelenggara
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
