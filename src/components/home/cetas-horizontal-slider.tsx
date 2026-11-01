"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Trophy,
  Vote,
  Ticket,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { UnifiedEvent } from "@/lib/events-unified-data";
import { formatRupiah } from "@/lib/utils";

interface CetasHorizontalSliderProps {
  events: UnifiedEvent[];
  mode?: "score" | "vote";
}

export function CetasHorizontalSlider({
  events,
  mode = "score",
}: CetasHorizontalSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);

    // Calculate active dot
    const itemWidth = 320; // approximate card width + gap
    const idx = Math.round(el.scrollLeft / itemWidth);
    setActiveIndex(Math.min(idx, events.length));
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [events]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = 360;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full select-none">
      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll Kiri"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 text-cyan-400" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll Kanan"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="h-6 w-6 text-cyan-400" />
        </button>
      )}

      {/* Horizontal Carousel Viewport */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-2 px-4 sm:px-6 scrollbar-none snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Render Event Cards */}
        {events.map((ev, idx) => {
          const lowestPrice =
            ev.tiers && ev.tiers.length > 0
              ? Math.min(...ev.tiers.map((t) => t.price))
              : 0;

          return (
            <div
              key={ev.id}
              className="relative shrink-0 w-[290px] sm:w-[330px] h-[460px] rounded-3xl border border-slate-800/90 hover:border-cyan-500/60 bg-[#0B0F19] overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-2 group snap-start flex flex-col justify-between"
            >
              {/* Card Poster Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ev.bannerUrl || "/logo/cetas_score_logo.png"}
                alt={ev.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Dark Overlay with High Contrast Bottom Pad */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06132E] via-[#06132E]/75 to-black/30 pointer-events-none" />

              {/* Top Badges */}
              <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-slate-950 shadow-lg shadow-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
                  LIVE / BERJALAN
                </span>
                <span className="rounded-full bg-[#06132E]/90 backdrop-blur-md border border-[#00D9FF]/50 px-3 py-1 text-[10px] font-black uppercase text-white shadow-md font-mono">
                  {ev.category || "KOMPETISI"}
                </span>
              </div>

              {/* Middle / Bottom Content */}
              <div className="relative z-10 p-5 space-y-4">
                {/* Price Tag Overlay */}
                <div className="inline-block rounded-xl bg-[#06132E]/95 backdrop-blur-md border border-[#00D9FF]/70 px-3 py-1 shadow-xl">
                  <span className="text-xs font-black font-mono text-[#00D9FF] drop-shadow-[0_0_8px_rgba(0,217,255,0.4)]">
                    {lowestPrice > 0 ? `${formatRupiah(lowestPrice)}/TIM` : "TERBUKA / GRATIS"}
                  </span>
                </div>

                {/* Event Title */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:text-[#00D9FF] transition-colors">
                    {ev.title}
                  </h3>
                </div>

                {/* Date & Location - Ultra High Contrast */}
                <div className="space-y-1.5 text-xs text-white font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00D9FF] shrink-0 drop-shadow-[0_0_8px_#00D9FF]" />
                    <span className="text-slate-100">{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00D9FF] shrink-0 drop-shadow-[0_0_8px_#00D9FF]" />
                    <span className="text-slate-100 truncate">{ev.location}</span>
                  </div>
                </div>

                {/* Main Action CTA Button (Katharekap Style) */}
                <div className="pt-2">
                  {mode === "score" ? (
                    <Link
                      href={`/tournament-hub`}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#126BDE] hover:bg-[#0055CC] text-white font-black py-3 text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>BUKA LIVE SCORING</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/vote?eventId=${ev.id}`}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>BUKA BILIK VOTE</span>
                      <Vote className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ============================================================== */}
        {/* SPECIAL CARD: "LIHAT SEMUA EVENT" (PERSIS KAYA KATHAREKAP)     */}
        {/* ============================================================== */}
        <div className="relative shrink-0 w-[290px] sm:w-[330px] h-[460px] rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 p-6 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 hover:-translate-y-2 group snap-start">
          <div className="pointer-events-none absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent opacity-60" />

          {/* Circle Arrow Icon */}
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md mb-6 shadow-xl transition-transform group-hover:scale-110">
            <ArrowRight className="h-9 w-9 text-cyan-300 transition-transform group-hover:translate-x-1" />
          </div>

          {/* Headline */}
          <div className="relative z-10 space-y-2 mb-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              LIHAT SEMUA EVENT
            </h3>
            <p className="text-xs text-slate-100 font-semibold max-w-[220px] mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Jelajahi seluruh arsip kompetisi, jadwal mendatang & live score turnamen.
            </p>
          </div>

          {/* Action Button */}
          <Link
            href="/events"
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-cyan-50 text-[#06132E] font-black px-6 py-3 text-xs tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <span>BUKA DIREKTORI</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: Math.min(6, events.length + 1) }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const el = scrollContainerRef.current;
              if (el) el.scrollTo({ left: idx * 340, behavior: "smooth" });
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? "w-7 bg-cyan-400 shadow-[0_0_8px_#06B6D4]"
                : "w-2 bg-slate-700 hover:bg-slate-500"
            }`}
            aria-label={`Ke slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
