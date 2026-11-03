"use client";

import React, { useEffect, useRef, useState } from "react";

export function CetasPreloader() {
  const [isRemoved, setIsRemoved] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const SEKALI_PER_SESI = false;
    const DURASI_MINIMAL = 1500; // ms

    try {
      if (SEKALI_PER_SESI && sessionStorage.getItem("cetas-preloader-done")) {
        setIsRemoved(true);
        return;
      }
    } catch {}

    const el = containerRef.current;
    const fill = fillRef.current;
    const label = labelRef.current;
    const bar = barRef.current;

    if (!el || !fill || !label || !bar) return;

    const root = document.documentElement;
    root.classList.add("cp-lock");

    let animId: number;
    let timeoutSelesai1: NodeJS.Timeout;
    let timeoutSelesai2: NodeJS.Timeout;

    const start = performance.now();
    let loaded = typeof document !== "undefined" && document.readyState === "complete";
    let pct = 0;
    let shown = -1;

    const handleWindowLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", handleWindowLoad);

    function render(p: number) {
      if (!fill || !label || !bar) return;
      fill.style.width = p + "%";
      const n = Math.round(p);
      if (n !== shown) {
        shown = n;
        label.textContent = String(n);
        bar.setAttribute("aria-valuenow", String(n));
      }
    }

    function selesai() {
      render(100);
      timeoutSelesai1 = setTimeout(() => {
        if (el) el.classList.add("cp-hide");
        root.classList.remove("cp-lock");
        try {
          sessionStorage.setItem("cetas-preloader-done", "1");
        } catch {}
        timeoutSelesai2 = setTimeout(() => {
          setIsRemoved(true);
        }, 900);
      }, 400);
    }

    function tick(now: number) {
      const t = now - start;
      const target =
        loaded && t >= DURASI_MINIMAL ? 100 : Math.min(90, (t / DURASI_MINIMAL) * 90);

      pct += Math.max((target - pct) * 0.08, 0.12);
      if (pct > target) pct = target;
      render(pct);

      if (pct >= 99.5) {
        selesai();
        return;
      }
      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutSelesai1);
      clearTimeout(timeoutSelesai2);
      root.classList.remove("cp-lock");
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);

  if (isRemoved) return null;

  return (
    <div id="cetas-preloader" ref={containerRef} aria-hidden={isRemoved}>
      {/* Gelombang cahaya di pojok kiri-atas */}
      <svg
        className="cp-wave cp-wave-tl"
        viewBox="0 0 700 420"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cp-g1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0a4bff" stopOpacity="0" />
            <stop offset=".5" stopColor="#1e90ff" />
            <stop offset="1" stopColor="#9fe6ff" />
          </linearGradient>
          <filter id="cp-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          d="M-20 260 C 120 180, 220 40, 470 -10 L 330 -10 C 200 40, 90 150, -20 330 Z"
          fill="url(#cp-g1)"
          opacity=".35"
          filter="url(#cp-blur)"
        />
        <path
          d="M-20 250 C 130 170, 230 60, 440 -10"
          stroke="url(#cp-g1)"
          strokeWidth="2.5"
        />
        <path
          d="M-20 290 C 110 200, 200 100, 360 40 C 430 14, 480 6, 560 -10"
          stroke="url(#cp-g1)"
          strokeWidth="1.5"
          opacity=".8"
        />
        <path
          d="M-20 330 C 90 230, 170 150, 300 90"
          stroke="url(#cp-g1)"
          strokeWidth="1"
          opacity=".6"
        />
      </svg>

      {/* Gelombang cahaya di pojok kanan-bawah */}
      <svg
        className="cp-wave cp-wave-br"
        viewBox="0 0 700 420"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-20 260 C 120 180, 220 40, 470 -10 L 330 -10 C 200 40, 90 150, -20 330 Z"
          fill="url(#cp-g1)"
          opacity=".35"
          filter="url(#cp-blur)"
        />
        <path
          d="M-20 250 C 130 170, 230 60, 440 -10"
          stroke="url(#cp-g1)"
          strokeWidth="2.5"
        />
        <path
          d="M-20 290 C 110 200, 200 100, 360 40 C 430 14, 480 6, 560 -10"
          stroke="url(#cp-g1)"
          strokeWidth="1.5"
          opacity=".8"
        />
        <path
          d="M-20 330 C 90 230, 170 150, 300 90"
          stroke="url(#cp-g1)"
          strokeWidth="1"
          opacity=".6"
        />
      </svg>

      {/* Konten Tengah */}
      <div className="cp-center">
        <div className="cp-logo-wrap">
          <div className="cp-glow" aria-hidden="true"></div>
          {logoError ? (
            <span className="cp-logo-text">CETAS</span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="cp-logo"
              src="/logo/cetas_preloader_logo.png"
              alt="CETAS Logo"
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        <div className="cp-tagline">
          CENTRALIZED ELECTRONIC TOURNAMENT &amp; AWARD SYSTEM
        </div>

        <div className="cp-bar-wrap">
          <div
            className="cp-bar"
            ref={barRef}
            role="progressbar"
            aria-label="Memuat sistem"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div className="cp-fill" ref={fillRef}></div>
          </div>
          <div className="cp-status">
            Memuat sistem... <span className="cp-pct" ref={labelRef}>0</span>%
          </div>
        </div>
      </div>
    </div>
  );
}
