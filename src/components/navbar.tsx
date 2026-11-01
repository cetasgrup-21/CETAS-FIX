"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  LogIn,
  Sparkles,
  Ticket,
  Award,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Trophy,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/tournament-hub", label: "Tournament Hub", badge: "LIVE" },
    { href: "/events", label: "Event & Tiket" },
    { href: "/#layanan", label: "Layanan" },
    { href: "/#tentang", label: "Tentang" },
  ];

  const handleOpenLogin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cetas:open-login"));
    }
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/events?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070A12]/85 backdrop-blur-xl text-white transition-all shadow-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================= BRAND LOGO ================= */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo/cetas_logo_transparent.png"
              alt="CETAS Official Logo"
              width={40}
              height={40}
              priority
              className="object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white leading-none">
                CETAS
              </span>
              <span className="rounded bg-gradient-to-r from-cyan-400 to-emerald-400 px-1.5 py-0.2 text-[8.5px] font-black uppercase text-slate-950 font-mono">
                HUB
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 hidden sm:inline">
              Move Different
            </span>
          </div>
        </Link>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                ? false
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-800/90 text-cyan-400 shadow-sm border border-slate-700/80"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 text-[8px] font-mono font-bold animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT CONTROLS ================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Cari event, tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 sm:w-56 rounded-full border border-cyan-500/40 bg-slate-900/90 pl-3 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 text-slate-400 hover:text-white text-xs font-mono"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari Event"
              className="rounded-xl p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Tombol Masuk (Reveals Animated Login Screen) */}
          <button
            type="button"
            onClick={handleOpenLogin}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:border-cyan-500/60 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Masuk</span>
          </button>

          {/* Tombol Daftar */}
          <Link
            href="/ajukan-event"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 px-4 py-2 text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Daftar</span>
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 md:hidden"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
            >
              <span>{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800"
            >
              Masuk
            </button>
            <Link
              href="/ajukan-event"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-center text-xs font-black text-slate-950 shadow-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
