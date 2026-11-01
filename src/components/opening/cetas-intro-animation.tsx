"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, X } from "lucide-react";

export function CetasIntroAnimation() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentScene, setCurrentScene] = useState<
    "scene1_entrance" | "scene2_motion" | "scene3_logo" | "scene4_exit"
  >("scene1_entrance");

  const timelineRef = useRef<NodeJS.Timeout[]>([]);

  const finishIntro = () => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem("cetas_intro_seen", "true");
    } catch {}

    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 700);
    timelineRef.current.push(removeTimer);
  };

  const startTimeline = () => {
    // Clear any previous timers
    timelineRef.current.forEach((t) => clearTimeout(t));
    timelineRef.current = [];

    setShowIntro(true);
    setIsFadingOut(false);
    setCurrentScene("scene1_entrance");

    // SCENE 1 -> SCENE 2: Mascot entrance to natural character breathing motion (at 1.2s)
    const t1 = setTimeout(() => {
      setCurrentScene("scene2_motion");
    }, 1200);

    // SCENE 2 -> SCENE 3: Logo Reveal with digital laser scanning (at 2.8s)
    const t2 = setTimeout(() => {
      setCurrentScene("scene3_logo");
    }, 2800);

    // SCENE 3 -> SCENE 4: Transition to homepage (at 4.0s)
    const t3 = setTimeout(() => {
      setCurrentScene("scene4_exit");
      finishIntro();
    }, 4200);

    timelineRef.current.push(t1, t2, t3);
  };

  useEffect(() => {
    setMounted(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceReplay = urlParams.get("intro") === "1";
      const introSeen = sessionStorage.getItem("cetas_intro_seen");
      const isDirectSubpath =
        window.location.pathname !== "/" && window.location.pathname !== "";

      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!isDirectSubpath && (forceReplay || !introSeen) && !prefersReducedMotion) {
        startTimeline();
      }
    } catch {
      setShowIntro(false);
    }

    // Allow replaying intro on command (e.g. from footer button or debug)
    const handleReplay = () => {
      startTimeline();
    };

    window.addEventListener("cetas:replay-intro", handleReplay);
    return () => {
      timelineRef.current.forEach((t) => clearTimeout(t));
      window.removeEventListener("cetas:replay-intro", handleReplay);
    };
  }, []);

  if (!mounted || !showIntro) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Animasi Pembuka CETAS"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#06132E] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* ============================================================== */}
      {/* BACKGROUND ATMOSPHERE: DEEP NAVY + ELECTRIC BLUE + CYAN GLOW   */}
      {/* ============================================================== */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#006BFF25_0%,_#06132E_70%)] pointer-events-none" />

      {/* Cyber Grid Lines in Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 217, 255, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 217, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Pulsing Electric Blue & Cyan Energy Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#00D9FF]/20 via-[#006BFF]/20 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#006BFF]/25 rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================== */}
      {/* TOP STATUS BAR & SKIP BUTTON                                    */}
      {/* ============================================================== */}
      <div className="absolute top-5 inset-x-5 sm:inset-x-8 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D9FF]" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#00D9FF] uppercase">
            CETAS // INITIALIZING EXPERIENCE
          </span>
        </div>

        {/* Skip Button */}
        <button
          type="button"
          onClick={finishIntro}
          className="group flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all active:scale-95"
        >
          <span>Lewati</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-[#00D9FF]" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* MAIN STAGE: MASCOT + LOGO + SCANNER BEAM                        */}
      {/* ============================================================== */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl px-4 w-full">
        {/* ============================================================ */}
        {/* SCENE 1 & 2: MASCOT ENTRANCE & NATURAL CHARACTER MOTION      */}
        {/* ============================================================ */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Cyber Floor Light Rings (Podium Pad) */}
          <div
            className={`absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
              currentScene === "scene1_entrance"
                ? "w-40 opacity-30"
                : "w-[340px] sm:w-[440px] opacity-100"
            }`}
          >
            {/* Outer halo */}
            <div className="w-full h-12 bg-gradient-to-r from-[#006BFF]/40 via-[#00D9FF]/70 to-[#006BFF]/40 rounded-full blur-md" />
            {/* Center bright core */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-[#00D9FF] rounded-full blur-xs" />
          </div>

          {/* Maskot Robot Semut Humanoid Resmi CETAS */}
          <div
            className={`relative transition-all duration-1000 ease-out transform ${
              currentScene === "scene1_entrance"
                ? "translate-y-24 scale-90 opacity-0"
                : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            <div className="relative animate-mascot-gentle-breathe">
              {/* Antenna Energy Sparkle Indicator */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-80" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
              </div>

              {/* Official Maskot PNG */}
              <Image
                src="/mascot/cetas_ant_waving_v3.png"
                alt="Maskot Resmi CETAS - Anty Robot Humanoid"
                width={420}
                height={740}
                priority
                className="w-auto h-[320px] sm:h-[400px] md:h-[460px] object-contain drop-shadow-[0_15px_40px_rgba(0,107,255,0.45)]"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 3: CETAS LOGO REVEAL & DIGITAL SCANNER BEAM             */}
        {/* ============================================================ */}
        <div
          className={`mt-4 sm:mt-6 flex flex-col items-center text-center transition-all duration-700 ease-out ${
            currentScene === "scene3_logo" || currentScene === "scene4_exit"
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-6 pointer-events-none"
          }`}
        >
          {/* Official Logo Container with Scanning Effect */}
          <div className="relative inline-flex items-center justify-center p-3">
            {/* Glowing Logo Backdrop */}
            <div className="absolute inset-0 bg-[#00D9FF]/20 rounded-2xl blur-xl animate-pulse" />

            {/* Official Transparent CETAS Logo */}
            <div className="relative z-10 flex items-center justify-center">
              <Image
                src="/logo/cetas_logo_transparent.png"
                alt="CETAS Official Logo"
                width={120}
                height={120}
                priority
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_0_25px_rgba(0,217,255,0.7)]"
              />

              {/* Laser Scanning Line (Sweeps across logo) */}
              <div
                className="absolute inset-y-0 -inset-x-4 pointer-events-none overflow-hidden"
              >
                <div
                  className="w-full h-1 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_15px_#00D9FF] animate-laser-scan"
                />
              </div>
            </div>
          </div>

          {/* System Name & Tagline */}
          <div className="mt-2 space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider uppercase font-mono drop-shadow-[0_0_20px_rgba(0,217,255,0.6)]">
              CETAS
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-[#00D9FF] uppercase tracking-[0.25em] font-mono">
              Centralized Electronic Tournament & Award System
            </p>
            <p className="text-sm sm:text-base font-bold text-white tracking-wide pt-1 font-display">
              Make it a story!
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM PROGRESS PULSE                                          */}
      {/* ============================================================== */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center z-30">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
          <span
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentScene === "scene1_entrance"
                ? "w-8 bg-[#00D9FF]"
                : "w-2 bg-white/30"
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentScene === "scene2_motion"
                ? "w-8 bg-[#006BFF]"
                : "w-2 bg-white/30"
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentScene === "scene3_logo" || currentScene === "scene4_exit"
                ? "w-8 bg-[#00D9FF]"
                : "w-2 bg-white/30"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
