"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Award, ShoppingBag, Send, ShieldCheck, Calendar } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Beranda", icon: Calendar },
    { href: "/events", label: "Cetas Ticketing", icon: Ticket },
    { href: "/vote", label: "Cetas Vote", icon: Award },
    { href: "/production", label: "Cetas Production", icon: ShoppingBag },
    { href: "/ajukan-event", label: "Ajukan Event", icon: Send },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xl shadow-md shadow-orange-500/20">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              CETAS<span className="text-orange-500">.</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Ecosystem & Production
            </span>
          </div>
        </Link>

        {/* Navigation Links Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/scanner"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <Ticket className="h-3.5 w-3.5 text-orange-500" />
            Scanner Gate
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ShieldCheck className="h-4 w-4 text-orange-400" />
            Lingkup Kerja Cetas
          </Link>
        </div>
      </div>
    </header>
  );
}
