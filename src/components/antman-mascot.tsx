"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface AntmanMascotProps {
  pose?: "waving" | "thumbsup";
  interactive?: boolean;
  enableWaving?: boolean;
  size?: number;
  className?: string;
  speechText?: string;
}

export function AntmanMascot({
  pose = "waving",
  interactive = true,
  enableWaving = true,
  size = 180,
  className = "",
  speechText,
}: AntmanMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking effect periodically
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Eye & Head cursor tracking
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Estimate eye level position in container (approx top 28% and center)
      const eyeCenterX = rect.left + rect.width * 0.5;
      const eyeCenterY = rect.top + rect.height * 0.28;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const distance = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      // Max eye pupil shift (6px max)
      const maxOffset = 5.5;
      const moveDist = Math.min(distance / 50, maxOffset);
      const pupilX = Math.cos(angle) * moveDist;
      const pupilY = Math.sin(angle) * moveDist;

      setEyeOffset({ x: pupilX, y: pupilY });

      // Subtle 3D head tilt toward mouse
      const maxTilt = 10; // degrees
      const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (deltaX / window.innerWidth) * 20));
      const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -(deltaY / window.innerHeight) * 20));

      setHeadTilt({ rotateX: tiltX, rotateY: tiltY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  const imgSrc =
    pose === "thumbsup"
      ? "/mascot/antman_thumbsup.png"
      : "/mascot/antman_waving.png";

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 3D Perspective Wrapper */}
      <div
        className="relative w-full h-full transition-transform duration-150 ease-out"
        style={{
          perspective: 800,
          transform: `perspective(800px) rotateX(${headTilt.rotateX}deg) rotateY(${headTilt.rotateY}deg)`,
        }}
      >
        {/* Ant-Man Mascot Image */}
        <div
          className={`relative w-full h-full flex items-center justify-center ${
            enableWaving && pose === "waving" ? "animate-ant-wave" : ""
          }`}
        >
          <Image
            src={imgSrc}
            alt="Anty - Maskot Manusia Semut Cetas"
            width={size}
            height={size}
            priority
            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(37,99,235,0.18)]"
          />

          {/* Interactive Gaze Pupils (Visor Overlay) */}
          {pose === "waving" && !isBlinking && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: "24.5%",
                left: "41.5%",
                width: "17%",
                height: "8%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left Eye Pupil */}
              <div
                className="relative rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center transition-transform duration-75 ease-out"
                style={{
                  width: "36%",
                  height: "75%",
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-inner" />
              </div>

              {/* Right Eye Pupil */}
              <div
                className="relative rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center transition-transform duration-75 ease-out"
                style={{
                  width: "36%",
                  height: "75%",
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-inner" />
              </div>
            </div>
          )}

          {/* Antenna Glow Indicator */}
          <div
            className="absolute top-[3%] left-1/2 -translate-x-1/2 flex justify-between pointer-events-none opacity-80"
            style={{ width: "35%" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
          </div>
        </div>
      </div>

      {/* Optional Speech Bubble */}
      {speechText && (
        <div className="mt-2 text-center">
          <div className="inline-block rounded-2xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-md border border-blue-100">
            {speechText}
          </div>
        </div>
      )}
    </div>
  );
}
