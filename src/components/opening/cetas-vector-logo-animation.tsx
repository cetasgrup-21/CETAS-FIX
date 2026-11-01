"use client";

import React from "react";

interface CetasVectorLogoProps {
  size?: number;
  className?: string;
}

export function CetasVectorLogoAnimation({ size = 180, className = "" }: CetasVectorLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer pulsing energy halo */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible transition-all duration-700"
      >
        <defs>
          {/* Gradient for Emblem */}
          <linearGradient id="cetas-c-grad" x1="15%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Glowing Shadow */}
          <filter id="cetas-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Orbit Path with Dash Animation */}
        <circle
          cx="100"
          cy="100"
          r="84"
          stroke="url(#cetas-c-grad)"
          strokeWidth="3"
          strokeDasharray="120 40"
          strokeLinecap="round"
          opacity="0.4"
          className="animate-spin"
          style={{ animationDuration: "10s" }}
        />

        {/* Iconic Bold Athletic "C" Emblem Vector */}
        {/* Crafted with sharp sport-tech angles & aerodynamic curvature */}
        <path
          d="M 148 56
             C 134 42, 116 34, 96 34
             C 58 34, 32 64, 32 100
             C 32 136, 58 166, 96 166
             C 118 166, 136 156, 148 142
             L 128 126
             C 120 134, 110 140, 96 140
             C 74 140, 58 122, 58 100
             C 58 78, 74 60, 96 60
             C 110 60, 120 66, 128 74
             Z"
          fill="url(#cetas-c-grad)"
          filter="url(#cetas-neon-glow)"
          className="transition-transform duration-500 hover:scale-105"
        />

        {/* Inner Dynamic Energy Blade in the Gap of "C" */}
        <path
          d="M 124 94 L 164 74 L 144 114 Z"
          fill="#F59E0B"
          className="animate-pulse"
          style={{ animationDuration: "2s" }}
        />
      </svg>
    </div>
  );
}
