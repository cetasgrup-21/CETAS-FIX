"use client";

import React, { useId } from "react";
import { TournamentCategoryScore } from "./tournament-hub-types";

interface RadarSpiderChartProps {
  categories: TournamentCategoryScore[];
  size?: number;
  showLabels?: boolean;
  accentColor?: string;
}

export function RadarSpiderChart({
  categories,
  size = 320,
  showLabels = true,
  accentColor = "#06B6D4", // Electric Cyan default
}: RadarSpiderChartProps) {
  const chartId = useId();

  // If there are fewer than 3 categories, create synthetic balanced axes or display gracefully
  const validCategories = categories.length >= 3 ? categories : [
    ...categories,
    { categoryId: "s1", categoryName: "Eksekusi", percentage: 20, maximum: 100, score: 85, complete: true, scored: 1, expected: 1, judgeCount: 1 },
    { categoryId: "s2", categoryName: "Kerapian", percentage: 20, maximum: 100, score: 88, complete: true, scored: 1, expected: 1, judgeCount: 1 },
    { categoryId: "s3", categoryName: "Kekompakan", percentage: 20, maximum: 100, score: 90, complete: true, scored: 1, expected: 1, judgeCount: 1 },
  ].slice(0, Math.max(3, categories.length));

  const totalAxes = validCategories.length;
  const center = size / 2;
  const radius = center * 0.72; // Leave room for outer labels

  const rings = [0.25, 0.5, 0.75, 1.0];

  // Calculate coordinates for an axis at a given index and value ratio (0..1)
  const getPoint = (index: number, ratio: number) => {
    // Start at top (-90 deg) and rotate clockwise
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y, angle };
  };

  // Team polygon points based on category score / maximum
  const teamPoints = validCategories.map((cat, idx) => {
    const ratio = cat.maximum > 0 ? Math.min(1, Math.max(0.15, cat.score / cat.maximum)) : 0.5;
    return getPoint(idx, ratio);
  });

  const teamPolygonSvgPoints = teamPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Average benchmark polygon (70% standard)
  const benchmarkPolygonPoints = validCategories
    .map((_, idx) => {
      const p = getPoint(idx, 0.7);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      >
        <defs>
          {/* Gradient for team filled radar */}
          <linearGradient id={`radar-grad-${chartId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`radar-glow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Grid Rings */}
        {rings.map((ringRatio) => {
          const ringPoints = validCategories
            .map((_, idx) => {
              const p = getPoint(idx, ringRatio);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <polygon
              key={`ring-${ringRatio}`}
              points={ringPoints}
              fill="none"
              stroke="#334155"
              strokeWidth={ringRatio === 1 ? "1.5" : "0.75"}
              strokeDasharray={ringRatio === 1 ? undefined : "3 3"}
              opacity={ringRatio === 1 ? 0.7 : 0.4}
            />
          );
        })}

        {/* Axis Spokes from center to outer vertex */}
        {validCategories.map((_, idx) => {
          const outer = getPoint(idx, 1.0);
          return (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#334155"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* Standard Benchmark Polygon (Dashed Grey) */}
        <polygon
          points={benchmarkPolygonPoints}
          fill="none"
          stroke="#64748B"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Team Score Area (Filled Polygon with Glow) */}
        <polygon
          points={teamPolygonSvgPoints}
          fill={`url(#radar-grad-${chartId})`}
          stroke={accentColor}
          strokeWidth="2.5"
          filter={`url(#radar-glow-${chartId})`}
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex Dots & Score Badges */}
        {teamPoints.map((p, idx) => (
          <g key={`dot-${idx}`} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill={accentColor}
              stroke="#0B0F19"
              strokeWidth="2"
              className="transition-transform duration-200 hover:scale-150"
            />
          </g>
        ))}

        {/* Category Labels */}
        {showLabels &&
          validCategories.map((cat, idx) => {
            const labelPoint = getPoint(idx, 1.2);
            const rawScore = Math.round(cat.score);
            const percentage = cat.maximum > 0 ? Math.round((cat.score / cat.maximum) * 100) : 0;

            // Align text anchor based on X position relative to center
            const textAnchor =
              Math.abs(labelPoint.x - center) < 15
                ? "middle"
                : labelPoint.x > center
                ? "start"
                : "end";

            return (
              <g key={`label-${idx}`} className="select-none">
                <text
                  x={labelPoint.x}
                  y={labelPoint.y - 4}
                  textAnchor={textAnchor}
                  fill="#E2E8F0"
                  fontSize="10"
                  fontWeight="600"
                  className="font-mono tracking-tight"
                >
                  {cat.categoryName.toUpperCase()}
                </text>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 9}
                  textAnchor={textAnchor}
                  fill="#06B6D4"
                  fontSize="9.5"
                  fontWeight="700"
                  className="font-mono"
                >
                  {rawScore} pts ({percentage}%)
                </text>
              </g>
            );
          })}
      </svg>

      {/* Legend below chart */}
      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span>Performa Tim</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 border-t border-dashed border-slate-400" />
          <span>Benchmark Standar (70%)</span>
        </div>
      </div>
    </div>
  );
}
