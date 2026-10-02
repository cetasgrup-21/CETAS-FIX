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
    <header className="sticky top-0 z-40 w-full border-b border-purple-100 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Official Cetas Mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo/cetas_logo_transparent.png"
              alt="CETAS Official Logo"
              width={44}
              height={44}
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1">
              CETAS<span className="text-purple-600">.</span>
            </span>
            <span className="text-[9px] font-semibold text-purple-700 tracking-wider uppercase mt-0.5 line-clamp-1">
              Centralized Electronic Tournament & Award System
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
                    ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-xs"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2.5">
          {/* WhatsApp Direct Help Link */}
          <a
            href="https://wa.me/6281584682345?text=Halo%20Admin%20Cetas%2C%20saya%20butuh%20bantuan%20seputar%20web%20Cetas."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
            title="Chat WhatsApp CS"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-emerald-600 text-white" />
            <span>WA Support</span>
          </a>

          {/* Admin Backoffice Portal */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Lingkup Kerja Cetas</span>
            <span className="sm:hidden">Admin</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-purple-50 border border-slate-200 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-purple-100 bg-white/98 backdrop-blur-2xl px-4 pt-2 pb-5 space-y-2">
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
                    ? "bg-purple-50 text-purple-700 border border-purple-200 font-bold"
                    : "text-slate-700 hover:bg-purple-50/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-purple-100 flex flex-col gap-2">
            <Link
              href="/register-event"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50"
            >
              <UserCheck className="h-4 w-4 text-purple-600" />
              Pendaftaran Peserta Lomba / Event
            </Link>
            <a
              href="https://wa.me/6281584682345"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 transition shadow-xs"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              Chat WhatsApp CS (0815-8468-2345)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
