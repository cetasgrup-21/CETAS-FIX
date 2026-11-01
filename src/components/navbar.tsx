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
    { href: "/pelatih", label: "Portal Pelatih", badge: "KONTINGEN" },
    { href: "/layanan", label: "Layanan" },
    { href: "/tentang", label: "Tentang" },
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
    <header className="sticky top-0 z-40 w-full border-b border-blue-500/20 bg-[#06132E]/90 backdrop-blur-xl text-white transition-all shadow-xl">
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
              className="object-contain drop-shadow-[0_0_15px_rgba(0,217,255,0.45)]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white leading-none">
                CETAS
              </span>
              <span className="rounded bg-gradient-to-r from-[#00D9FF] to-[#006BFF] px-1.5 py-0.2 text-[8.5px] font-black uppercase text-slate-950 font-mono">
                HUB
              </span>
            </div>
            <span className="text-[9px] font-bold text-cyan-200 uppercase tracking-wider mt-0.5 hidden sm:inline">
              Make it a story!
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
                    ? "bg-blue-900/60 text-[#00D9FF] shadow-sm border border-blue-400/40"
                    : "text-slate-100 hover:text-white hover:bg-blue-950/60"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40 px-1.5 py-0.2 text-[8px] font-mono font-black animate-pulse">
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
                className="w-40 sm:w-56 rounded-full border border-[#00D9FF]/50 bg-[#0B1C3D] pl-3 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:border-[#00D9FF] focus:outline-none focus:ring-1 focus:ring-[#00D9FF]/40"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 text-slate-300 hover:text-white text-xs font-mono"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari Event"
              className="rounded-xl p-2 text-slate-200 hover:text-[#00D9FF] hover:bg-blue-950/60 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Tombol Masuk */}
          <button
            type="button"
            onClick={handleOpenLogin}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/30 bg-[#0B1C3D] hover:border-[#00D9FF] hover:bg-blue-900/40 px-3.5 py-2 text-xs font-bold text-white transition-all active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5 text-[#00D9FF]" />
            <span className="hidden sm:inline">Masuk</span>
          </button>

          {/* Tombol Daftar */}
          <Link
            href="/ajukan-event"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#006BFF] hover:from-[#00C2E5] hover:to-[#0055CC] text-slate-950 px-4 py-2 text-xs font-black shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Daftar</span>
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-200 hover:bg-blue-950/60 md:hidden"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-500/20 bg-[#06132E]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-100 hover:bg-blue-900/50 hover:text-[#00D9FF]"
            >
              <span>{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#00D9FF]" />
            </Link>
          ))}

          <div className="pt-2 border-t border-blue-500/20 flex gap-2">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="flex-1 rounded-xl border border-blue-400/30 bg-[#0B1C3D] py-2.5 text-center text-xs font-bold text-white hover:bg-blue-900/50"
            >
              Masuk
            </button>
            <Link
              href="/ajukan-event"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#006BFF] py-2.5 text-center text-xs font-black text-slate-950 shadow-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
