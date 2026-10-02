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
  size = 200,
  className = "",
  speechText,
  enable3DArm = true,
}: AntmanMascotProps) {
  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Mascot Viewport Container (Rock-Solid Grounded, Only Arm Waves) */}
      <div className="relative w-full h-full">
        {pose === "thumbsup" ? (
          /* THUMBS UP POSE (DOUBLE THUMBS UP CELEBRATION) */
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/mascot/anty_purple_thumbsup.png"
              alt="Anty si Manusia Semut - Kasih Jempol"
              width={size}
              height={size}
              priority
              className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(124,58,237,0.22)]"
            />
          </div>
        ) : (
          /* WAVING POSE: ONLY THE HAND/ARM MOVES IN 3D ("Tangan aja yang gerak jadi 3D") */
          <div className="relative w-full h-full">
            {/* 1. Anchored Body Layer (Steady, Grounded, Full Shoulder Pad) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/mascot/anty_purple_body.png"
                alt="Anty si Manusia Semut Cetas"
                width={size}
                height={size}
                priority
                className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(124,58,237,0.18)]"
              />
            </div>

            {/* 2. Isolated Arm Layer Moving in True 3D (Shoulder Pivot) */}
            {enable3DArm ? (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none animate-arm-wave-3d"
                style={{
                  transformOrigin: "33.2% 48.3%", // exact anatomical shoulder joint
                  willChange: "transform",
                }}
              >
                <Image
                  src="/mascot/anty_purple_arm.png"
                  alt="Anty Waving Arm 3D"
                  width={size}
                  height={size}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Image
                  src="/mascot/anty_purple_arm.png"
                  alt="Anty Waving Arm"
                  width={size}
                  height={size}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Speech Bubble */}
      {speechText && (
        <div className="mt-2 text-center">
          <div className="inline-block rounded-2xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-md border border-purple-200">
            {speechText}
          </div>
        </div>
      )}
    </div>
  );
}
