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

export function CetasOpeningExperience() {
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showLoginModalOnly, setShowLoginModalOnly] = useState(false);

  // Intro steps: "splash" -> "greeting" -> "choices" -> "login_reveal"
  const [stage, setStage] = useState<"splash" | "greeting" | "choices" | "login_reveal">("splash");

  // Login form state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    // Check if user is already logged in or has seen the intro in this session
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

    // Progression of the intro
    const timer1 = setTimeout(() => {
      setStage("greeting");
    }, 1200);

    const timer2 = setTimeout(() => {
      setStage("choices");
    }, 2800);

    // Listen for custom event from navbar or any button to open login modal anytime
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
        // Redirect based on role or refresh
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
      aria-label="CETAS Experience & Login"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-cyan-400/25 to-blue-500/10 rounded-full blur-3xl" />

      {/* Skip Intro Button (Top-Right) */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={handleDismissIntro}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95"
        >
          <span>{showLoginModalOnly ? "Tutup" : "Lewati Intro"}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Container Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 text-[#071A3D] shadow-2xl overflow-hidden p-6 sm:p-8 my-auto transition-all duration-500">
        {/* ========================================================= */}
        {/* VIEW 1: INTRO SEQUENCE (SPLASH -> GREETING -> CHOICES)     */}
        {/* ========================================================= */}
        {stage !== "login_reveal" && (
          <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in duration-500">
            {/* Top Logo */}
            <div className="relative h-14 w-14 shrink-0 transition-transform duration-500 hover:scale-105">
              <Image
                src="/logo/cetas_logo_transparent.png"
                alt="CETAS Official Logo"
                width={56}
                height={56}
                priority
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* Mascot Showcase with floating animation */}
            <div className="relative h-44 sm:h-52 w-full flex items-center justify-center">
              <div className="absolute bottom-0 w-36 h-6 bg-blue-500/20 rounded-full blur-md" />
              <Image
                src="/mascot/cetas_ant_waving_v3.png"
                alt="Anty Maskot Resmi CETAS"
                width={260}
                height={350}
                priority
                className="w-auto h-44 sm:h-52 object-contain animate-mascot-float drop-shadow-lg"
              />
            </div>

            {/* Headline Greeting & Tagline */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-[#0066FF]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>MOVE DIFFERENT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#071A3D] tracking-tight">
                HEY, WELCOME TO CETAS!
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                &ldquo;Not Just an Event. It&apos;s an Experience.&rdquo;
              </p>
            </div>

            {/* Action Choices */}
            <div className="w-full pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDismissIntro}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold px-5 py-3.5 text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>Jelajahi CETAS</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setStage("login_reveal")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071A3D] font-extrabold px-5 py-3.5 text-xs sm:text-sm border border-slate-300 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <LogIn className="h-4 w-4 text-[#0066FF]" />
                <span>Masuk ke Akun</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: LOGIN REVEAL TRANSITION                           */}
        {/* ========================================================= */}
        {stage === "login_reveal" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-4">
            {/* Header Form */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066FF] border border-blue-200">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Masuk ke Akun CETAS</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Akses portal Admin, Juri, Panitia, atau Pelatih
                  </p>
                </div>
              </div>
            </div>

            {loginSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-black text-[#071A3D]">Autentikasi Berhasil!</h4>
                <p className="text-xs text-slate-500">Menghubungkan ke sesi Anda...</p>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-700 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email / Username */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email atau Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan email atau username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Password atau PIN</label>
                    <a
                      href="https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20butuh%20bantuan%20reset%20akun%20atau%20password."
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-[#0066FF] hover:underline"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPin ? "text" : "password"}
                      required
                      placeholder="Masukkan password atau PIN akun"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                      className="h-4 w-4 rounded border-slate-300 text-[#0066FF] focus:ring-blue-500"
                    />
                    <span className="text-slate-600 font-medium">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold py-3 shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
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
                      className="text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      ← Kembali ke Pilihan
                    </button>
                    <Link
                      href="/ajukan-event"
                      onClick={handleDismissIntro}
                      className="text-[#0066FF] font-bold hover:underline"
                    >
                      Daftar Akun / Penyelenggara
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
