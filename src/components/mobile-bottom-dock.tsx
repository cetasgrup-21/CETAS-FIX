"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShieldCheck,
  Ticket,
  Award,
  UserCheck,
  Speaker,
  MessageCircle,
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
      href: "/score",
      label: "Score",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/score"),
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
      href: "/pelatih",
      label: "Pelatih",
      icon: UserCheck,
      isActive: pathname.startsWith("/pelatih"),
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
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none select-none">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/92 backdrop-blur-2xl border border-purple-200/90 shadow-[0_10px_35px_-5px_rgba(109,40,217,0.22)] px-2 py-1.5 flex items-center justify-around"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="h-4 w-4" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-[8px] font-black text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? "text-purple-700" : "text-slate-500 hover:text-purple-600"
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105"
                    : "bg-transparent hover:bg-purple-50"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-[9px] mt-0.5 tracking-tight leading-tight ${
                  active ? "font-black text-purple-800" : "font-semibold"
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
