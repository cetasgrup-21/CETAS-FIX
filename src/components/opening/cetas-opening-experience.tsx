"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { CetasVectorLogoAnimation } from "./cetas-vector-logo-animation";

export function CetasOpeningExperience() {
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showLoginModalOnly, setShowLoginModalOnly] = useState(false);

  // Flow: "logo_pulse" (like Gambar 3) -> "greeting" -> "choices" -> "login_reveal"
  const [stage, setStage] = useState<"logo_pulse" | "greeting" | "choices" | "login_reveal">("logo_pulse");

  // Login form state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    try {
      const introSeen = sessionStorage.getItem("cetas_intro_seen");
      const isDirectSubpath =
        typeof window !== "undefined" &&
        window.location.pathname !== "/" &&
        window.location.pathname !== "";

      if (introSeen === "true" || isDirectSubpath) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(false);
    } finally {
      setHasCheckedSession(true);
    }

    // Step 1 -> Step 2
    const timer1 = setTimeout(() => {
      setStage("greeting");
    }, 1100);

    // Step 2 -> Step 3
    const timer2 = setTimeout(() => {
      setStage("choices");
    }, 2400);

    const handleOpenLogin = () => {
      setStage("login_reveal");
      setShowLoginModalOnly(true);
      setIsVisible(true);
    };

    window.addEventListener("cetas:open-login", handleOpenLogin);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("cetas:open-login", handleOpenLogin);
    };
  }, []);

  const handleDismissIntro = () => {
    try {
      sessionStorage.setItem("cetas_intro_seen", "true");
    } catch {}
    setIsVisible(false);
    setShowLoginModalOnly(false);
  };

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
      try {
        sessionStorage.setItem("cetas_intro_seen", "true");
      } catch {}

      setTimeout(() => {
        setIsVisible(false);
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

  if (!hasCheckedSession || !isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CETAS Opening Experience"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A12]/95 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl" />

      {/* Skip Intro Button */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={handleDismissIntro}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
        >
          <span>{showLoginModalOnly ? "Tutup" : "Lewati Intro"}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: LOGO PULSE (MINIMALIST VECTOR ANIMATION - GAMBAR 3)    */}
      {/* ============================================================== */}
      {stage === "logo_pulse" && (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-700">
          <CetasVectorLogoAnimation size={170} />
          <span className="mt-4 text-xs font-mono font-bold tracking-[0.3em] uppercase text-cyan-400 animate-pulse">
            CETAS
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: GREETING & CHOICES CARD                                */}
      {/* ============================================================== */}
      {(stage === "greeting" || stage === "choices") && (
        <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0B0F19]/98 text-white shadow-2xl overflow-hidden p-6 sm:p-8 my-auto transition-all duration-500 animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="flex flex-col items-center text-center space-y-5">
            {/* Center Vector Logo Animation */}
            <div className="relative flex justify-center py-1">
              <CetasVectorLogoAnimation size={130} />
            </div>

            {/* Headline Greeting & Tagline */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-[11px] font-bold text-cyan-300 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>MOVE DIFFERENT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                HEY, WELCOME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">CETAS!</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300">
                &ldquo;Not Just an Event. It&apos;s an Experience.&rdquo;
              </p>
            </div>

            {/* Action Choices */}
            <div className="w-full pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDismissIntro}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-5 py-3.5 text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>Jelajahi CETAS</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setStage("login_reveal")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 text-xs sm:text-sm border border-slate-700 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <LogIn className="h-4 w-4 text-cyan-400" />
                <span>Masuk ke Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: LOGIN REVEAL FORM (SPORT-TECH DARK)                    */}
      {/* ============================================================== */}
      {stage === "login_reveal" && (
        <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0B0F19]/98 text-white shadow-2xl overflow-hidden p-6 sm:p-8 my-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-4">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Header Form */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Masuk ke Akun CETAS</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Portal Admin, Dewan Juri, Panitia, atau Pelatih
                </p>
              </div>
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
                    onClick={() => {
                      if (showLoginModalOnly) {
                        handleDismissIntro();
                      } else {
                        setStage("choices");
                      }
                    }}
                    className="text-slate-400 hover:text-white font-semibold"
                  >
                    ← Kembali ke Pilihan
                  </button>
                  <Link
                    href="/ajukan-event"
                    onClick={handleDismissIntro}
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    Daftar Akun Penyelenggara
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
