"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Ticket,
  Award,
  MessageCircle,
  Trophy,
} from "lucide-react";

export function MobileBottomDock() {
  const pathname = usePathname();

  const dockItems = [
    {
      href: "/",
      label: "Beranda",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/tournament-hub",
      label: "Hub 3D",
      icon: Trophy,
      isActive: pathname.startsWith("/tournament-hub"),
      badge: "LIVE",
    },
    {
      href: "/events",
      label: "Tiket",
      icon: Ticket,
      isActive: pathname.startsWith("/events"),
    },
    {
      href: "/vote",
      label: "E-Vote",
      icon: Award,
      isActive: pathname.startsWith("/vote"),
    },
    {
      href: "https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20ingin%20konsultasi%20turnamen.",
      label: "CS WA",
      icon: MessageCircle,
      isExternal: true,
      badge: "24/7",
    },
  ];

  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none select-none dock-container no-print">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-slate-800/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.6)] px-2 py-1.5 flex items-center justify-around"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isExternal) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("cetas:open-mascot-modal"));
                  }
                }}
                className="group relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                title="Buka Asisten CS WhatsApp CETAS"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Icon className="h-4 w-4" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-[8px] font-black text-slate-950 leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  active
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105"
                    : "bg-transparent hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.badge && !active && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-cyan-500 text-[8px] font-black text-slate-950 leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] mt-0.5 tracking-tight leading-tight ${
                  active ? "font-black text-cyan-300" : "font-semibold text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
