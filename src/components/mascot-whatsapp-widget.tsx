"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Ticket,
  Award,
  ShoppingBag,
  Send as SendIcon,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Bot,
  Zap,
} from "lucide-react";

const WHATSAPP_NUMBER = "6281299887766"; // Nomor WhatsApp Official Cetas Support

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  message: string;
  badge?: string;
}

export function MascotWhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [isWaving, setIsWaving] = useState(false);

  // Trigger wave animation periodically
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 12000);
    return () => clearInterval(waveInterval);
  }, []);

  // Context-aware speech based on route
  const getContextualGreeting = () => {
    if (pathname.startsWith("/vote")) {
      return {
        tag: "Cetas Vote Help",
        headline: "Dukung Jagoan Favoritmu!",
        speech: "Hai Kak! Ada kendala saat voting atau verifikasi QRIS Midtrans? Ceti siap bantu pandu langsung via WhatsApp!",
        defaultPrompt: "Halo Ceti, saya ingin bertanya tentang cara vote dan kendala pembayaran QRIS di Cetas Vote.",
      };
    }
    if (pathname.startsWith("/events")) {
      return {
        tag: "Cetas Ticketing",
        headline: "Bantuan Tiket Event",
        speech: "Cari tiket konser atau kendala e-tiket QR? Hubungi Ceti untuk konfirmasi pesanan atau ganti jadwal!",
        defaultPrompt: "Halo Ceti & Tim Tiket Cetas, saya butuh konfirmasi / bantuan seputar tiket event.",
      };
    }
    if (pathname.startsWith("/production")) {
      return {
        tag: "Cetas Production",
        headline: "Konsultasi Alat & Merch",
        speech: "Butuh sound system, lighting panggung, videotron LED, atau cetak kaos? Konsultasi vendor langsung ke WA tim produksi!",
        defaultPrompt: "Halo Tim Cetas Production, saya ingin konsultasi sewa peralatan event (sound/lighting/LED) dan merchandise.",
      };
    }
    if (pathname.startsWith("/ajukan-event")) {
      return {
        tag: "Pengajuan Event",
        headline: "Kurasi & Sponsor Event",
        speech: "Mau ajukan proposal acara atau pasang 'Iklan Cetas Kita'? Diskusikan langsung dengan tim kurator Cetas!",
        defaultPrompt: "Halo Tim Kurasi Cetas, kami ingin mendiskusikan proposal acara / slot Iklan Cetas Kita.",
      };
    }
    if (pathname.startsWith("/register-event")) {
      return {
        tag: "Pendaftaran Peserta",
        headline: "Bantuan Registrasi Lomba",
        speech: "Bingung cara upload berkas pendaftaran peserta atau formulir tim? Ceti bantu hubungkan ke panitia lomba ya!",
        defaultPrompt: "Halo Ceti, saya butuh bantuan terkait pendaftaran peserta lomba / seminar di web Cetas.",
      };
    }
    if (pathname.startsWith("/admin")) {
      return {
        tag: "Lingkup Kerja Cetas",
        headline: "Admin & Helpdesk Internal",
        speech: "Halo Rekan Cetas! Perlu asistensi teknis, setup Midtrans sandbox/production, atau audit log?",
        defaultPrompt: "Halo Lead Developer Cetas, saya membutuhkan asistensi teknis backoffice admin.",
      };
    }
    return {
      tag: "Cetas Assistant",
      headline: "Halo! Aku Ceti 🤖",
      speech: "Selamat datang di Cetas Ecosystem! Butuh info Tiket, E-Voting, atau Sewa Alat Produksi? Chat Ceti di WhatsApp yuk!",
      defaultPrompt: "Halo Ceti & Tim Cetas, saya ingin berkonsultasi seputar layanan ekosistem Cetas.",
    };
  };

  const contextInfo = getContextualGreeting();

  const quickActions: QuickAction[] = [
    {
      id: "ticket",
      label: "Beli / Bantuan Tiket Event",
      icon: Ticket,
      message: "Halo Ceti, saya ingin menanyakan ketersediaan tiket dan bantuan verifikasi pembayaran e-tiket.",
      badge: "Tiket",
    },
    {
      id: "vote",
      label: "Bantuan Bilik Voting & QRIS",
      icon: Award,
      message: "Halo Ceti, saya ingin meminta panduan e-voting Cetas Vote dan konfirmasi pembayaran suara via QRIS.",
      badge: "Vote",
    },
    {
      id: "production",
      label: "Sewa Sound, Lighting & LED",
      icon: ShoppingBag,
      message: "Halo Tim Cetas Production, saya butuh penawaran paket sewa sound system, lighting, videotron & panggung.",
      badge: "Vendor",
    },
    {
      id: "ajukan",
      label: "Kerjasama & Pengajuan Event",
      icon: SendIcon,
      message: "Halo Tim Cetas, kami dari panitia event ingin mengajukan proposal kerjasama ticketing & publikasi.",
      badge: "Partner",
    },
  ];

  const handleSendToWhatsApp = (textToSend?: string) => {
    const message = textToSend || customMessage || contextInfo.defaultPrompt;
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* FLOATING MASCOT BUTTON CONTAINER (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none">
        {/* SPEECH BUBBLE TEASER (Contextual Preview) */}
        {!isOpen && showBubble && (
          <div className="relative mb-3 max-w-[280px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl border border-blue-200 dark:border-blue-900/60 backdrop-blur-md">
              {/* Close mini bubble */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs shadow-sm transition"
                aria-label="Tutup pesan Ceti"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {contextInfo.tag}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">• Online</span>
              </div>

              <p
                onClick={() => setIsOpen(true)}
                className="cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                &ldquo;{contextInfo.speech}&rdquo;
              </p>

              <div
                onClick={() => setIsOpen(true)}
                className="mt-2.5 flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Chat via WhatsApp</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Bubble pointer triangle */}
            <div className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 bg-white dark:bg-slate-900 border-r border-b border-blue-200 dark:border-blue-900/60" />
          </div>
        )}

        {/* MASCOT AVATAR TRIGGER */}
        <div className="relative group">
          {/* Cyan/Blue Neon Glow Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 opacity-75 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-500 animate-pulse" />

          {/* Interactive Avatar Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setShowBubble(false);
            }}
            className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-slate-950 p-1.5 shadow-2xl border-2 border-cyan-400/80 hover:border-cyan-300 transition-transform active:scale-95 duration-200"
            title="Chat dengan Ceti via WhatsApp"
            aria-label="Buka Chat WhatsApp Ceti"
          >
            {/* Mascot Image rendered cleanly */}
            <div
              className={`relative h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 ${
                isWaving ? "animate-bounce" : ""
              }`}
            >
              <Image
                src="/mascot/ceti_transparent.png"
                alt="Ceti - Maskot Cetas"
                width={80}
                height={80}
                priority
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-110 transition duration-300"
              />
            </div>

            {/* WhatsApp Brand Icon Badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md border-2 border-white dark:border-slate-950">
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
            </div>

            {/* Active Live Pulse */}
            <span className="absolute top-0 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-slate-900" />
            </span>
          </button>
        </div>
      </div>

      {/* WHATSAPP CONCIERGE MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-blue-500/40 text-white shadow-2xl shadow-blue-500/20 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with High-Tech Blue Gradient & Ceti */}
            <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 border-b border-blue-500/30 overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-13 w-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30">
                    <div className="h-full w-full rounded-[14px] bg-slate-950 overflow-hidden flex items-center justify-center">
                      <Image
                        src="/mascot/ceti_transparent.png"
                        alt="Ceti Avatar"
                        width={52}
                        height={52}
                        className="object-contain"
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                        CETI • Asisten Virtual
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/30 text-cyan-300 border border-blue-400/40">
                        WhatsApp Hub
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Online 24/7 • Respons Cepat WhatsApp
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Tutup Modal Ceti"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-200 text-sm">
              {/* Ceti Dialogue Greeting Box */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/30 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Pesan Otomatis Ceti
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {contextInfo.speech}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Pilih Kebutuhan Anda (1-Klik ke WhatsApp)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quickActions.map((qa) => {
                    const Icon = qa.icon;
                    return (
                      <button
                        key={qa.id}
                        type="button"
                        onClick={() => handleSendToWhatsApp(qa.message)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/60 text-left transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-white truncate">
                            {qa.label}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 shrink-0 transition" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Message Input Form */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label
                  htmlFor="wa-custom-msg"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  Atau Ketik Pertanyaan Khusus Anda:
                </label>
                <div className="relative">
                  <textarea
                    id="wa-custom-msg"
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Tulis pertanyaan Anda di sini... (cth: "Halo Ceti, saya mau tanya paket sound system 5000 watt...")`}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 p-3 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* System Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Verifikasi</div>
                  <div className="text-xs font-bold text-blue-400">QR Dinamis</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Payment</div>
                  <div className="text-xs font-bold text-cyan-400">Midtrans QRIS</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Layanan</div>
                  <div className="text-xs font-bold text-emerald-400">Cetas Official</div>
                </div>
              </div>
            </div>

            {/* Footer / Submit CTA to WhatsApp */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Nomor Resmi: <span className="font-mono text-slate-200">+62 812-9988-7766</span>
              </div>

              <button
                type="button"
                onClick={() => handleSendToWhatsApp()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-6 py-3 shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Buka WhatsApp Cetas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
