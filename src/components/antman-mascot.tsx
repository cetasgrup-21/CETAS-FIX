"use client";

import React from "react";
import Image from "next/image";

interface AntmanMascotProps {
  pose?: "waving" | "thumbsup";
  size?: number;
  className?: string;
  speechText?: string;
  enable3DArm?: boolean;
  interactive?: boolean;
  enableWaving?: boolean;
}

export function AntmanMascot({
  pose = "waving",
  size = 480,
  className = "",
  speechText,
}: AntmanMascotProps) {
  const imgSrc =
    pose === "thumbsup"
      ? "/mascot/cetas_ant_thumbsup.png"
      : "/mascot/cetas_ant_waving.png";

  const imgAlt =
    pose === "thumbsup"
      ? "Anty Maskot Resmi CETAS - Kasih Jempol"
      : "Anty Maskot Resmi CETAS - Manusia Semut Cyber";

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{
        maxWidth: size,
        width: "100%",
      }}
    >
      {/* 3D Mascot Stage Viewport */}
      <div className="relative w-full flex items-center justify-center">
        <div className="relative group w-full flex justify-center">
          {/* Cyber Neon Floor Light Rings (Podium Arena) */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-gradient-to-r from-blue-600/30 via-cyan-400/50 to-blue-600/30 rounded-full blur-md pointer-events-none" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/5 h-4 bg-cyan-400/60 rounded-full blur-xs pointer-events-none" />

          {/* High-Tech Mascot Image (Unboxed, Full-Body, Razor Sharp) */}
          <Image
            src={imgSrc}
            alt={imgAlt}
            width={580}
            height={1023}
            priority
            className="w-auto h-[440px] sm:h-[500px] md:h-[550px] object-contain drop-shadow-[0_22px_45px_rgba(0,102,255,0.35)] transition-all duration-500 group-hover:scale-[1.03] group-hover:drop-shadow-[0_28px_55px_rgba(0,210,255,0.45)]"
          />
        </div>
      </div>

      {/* Optional Speech Bubble */}
      {speechText && (
        <div className="mt-3 text-center">
          <div className="inline-block rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2 text-xs font-bold text-slate-800 shadow-xl border border-blue-200">
            {speechText}
          </div>
        </div>
      )}
    </div>
  );
}
