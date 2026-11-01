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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/events", label: "Event" },
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all shadow-xs">
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
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-black text-xl tracking-tight text-[#071A3D] leading-none">
                CETAS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0066FF]" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 hidden sm:inline">
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
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-50 text-[#0066FF]"
                    : "text-slate-600 hover:text-[#0066FF] hover:bg-slate-50"
                }`}
              >
                {link.label}
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
                className="w-40 sm:w-56 rounded-full border border-blue-200 bg-blue-50/50 pl-3 pr-8 py-1.5 text-xs text-[#071A3D] placeholder-slate-400 focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari Event"
              className="rounded-xl p-2 text-slate-500 hover:text-[#0066FF] hover:bg-blue-50 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Tombol Masuk (Reveals Animated Login Screen) */}
          <button
            type="button"
            onClick={handleOpenLogin}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:border-[#0066FF] hover:bg-blue-50/50 px-3.5 py-2 text-xs font-bold text-[#071A3D] transition-all active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5 text-[#0066FF]" />
            <span className="hidden sm:inline">Masuk</span>
          </button>

          {/* Tombol Daftar */}
          <Link
            href="/ajukan-event"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white px-4 py-2 text-xs font-extrabold shadow-sm shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Daftar</span>
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF]"
            >
              <span>{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-[#071A3D] hover:bg-slate-50"
            >
              Masuk
            </button>
            <Link
              href="/ajukan-event"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-[#0066FF] py-2.5 text-center text-xs font-bold text-white shadow-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
