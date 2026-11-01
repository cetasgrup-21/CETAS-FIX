"use client";

import React from "react";
import { Trophy, Activity, Vote, UserCheck, Layers, Radio } from "lucide-react";
import { HubTab } from "./tournament-hub-types";

interface MobileBottomNavProps {
  activeTab: HubTab;
  onTabChange: (tab: HubTab) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems: { tab: HubTab; label: string; icon: React.ElementType }[] = [
    { tab: "leaderboard", label: "Skor Live", icon: Layers },
    { tab: "podium", label: "Podium 3D", icon: Trophy },
    { tab: "stage", label: "Panggung", icon: Radio },
    { tab: "vote", label: "Cetas Vote", icon: Vote },
    { tab: "dispute", label: "Sanggahan", icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 block md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? "text-cyan-400 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-lg ${
                  isActive ? "bg-cyan-500/15" : "bg-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isActive ? "text-cyan-300 font-bold" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
