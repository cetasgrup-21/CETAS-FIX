"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Ticket,
  Award,
  ShoppingBag,
  Send,
  ShieldCheck,
  Calendar,
  Menu,
  X,
  MessageCircle,
  UserCheck,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda", icon: Calendar },
    { href: "/events", label: "Cetas Ticketing", icon: Ticket },
    { href: "/vote", label: "Cetas Vote", icon: Award },
    { href: "/production", label: "Cetas Production", icon: ShoppingBag },
    { href: "/ajukan-event", label: "Ajukan Event", icon: Send },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900/30 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Ceti accent */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-black text-xl shadow-lg shadow-blue-500/30 ring-1 ring-cyan-300/40 group-hover:scale-105 transition-transform duration-200">
            C
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white leading-none flex items-center">
              CETAS<span className="text-cyan-400">.</span>
            </span>
            <span className="text-[10px] font-semibold text-blue-300/70 tracking-wider uppercase mt-0.5">
              Ecosystem & Production
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2.5">
          {/* WhatsApp Direct Help Link */}
          <a
            href="https://wa.me/6281299887766?text=Halo%20Admin%20Cetas%2C%20saya%20butuh%20bantuan%20seputar%20web%20Cetas."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-2 rounded-xl transition"
            title="Chat Admin WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-emerald-400" />
            <span>WA Support</span>
          </a>

          {/* Admin Backoffice Portal */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/25 transition active:scale-95 border border-blue-400/30"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Lingkup Kerja Cetas</span>
            <span className="sm:hidden">Admin</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-blue-900/30 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600/20 text-cyan-300 border border-blue-500/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <Link
              href="/register-event"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
            >
              <UserCheck className="h-4 w-4 text-cyan-400" />
              Pendaftaran Peserta Lomba / Event
            </Link>
            <a
              href="https://wa.me/6281299887766"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 transition"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp CS Official
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
