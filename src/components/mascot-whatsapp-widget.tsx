"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Ticket,
  Award,
  ShoppingBag,
  Send as SendIcon,
  ChevronRight,
  Bot,
  Zap,
} from "lucide-react";
import { AntmanMascot } from "@/components/antman-mascot";

const WHATSAPP_NUMBER = "6281299887766"; // Official Cetas Support

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  message: string;
}

export function MascotWhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  // Context-aware speech based on route
  const getContextualGreeting = () => {
    if (pathname.startsWith("/vote")) {
      return {
        tag: "Bantuan Cetas Vote",
        speech: "Hai! Mau dukung jagoanmu di Cetas Vote? Anty siap pandu cara voting dan verifikasi QRIS via WA!",
        defaultPrompt: "Halo Anty & Tim Cetas, saya ingin bertanya tentang cara vote dan verifikasi pembayaran QRIS di Cetas Vote.",
      };
    }
    if (pathname.startsWith("/events")) {
      return {
        tag: "Bantuan Tiket Event",
        speech: "Cari tiket konser atau kendala e-tiket QR? Chat Anty untuk konfirmasi pesanan atau bantuan gate masuk!",
        defaultPrompt: "Halo Anty & Tim Tiket Cetas, saya butuh konfirmasi / bantuan seputar tiket event.",
      };
    }
    if (pathname.startsWith("/production")) {
      return {
        tag: "Konsultasi Alat & Merch",
        speech: "Butuh sound system line-array, lighting panggung, atau videotron LED? Konsultasi vendor langsung ke WA tim produksi!",
        defaultPrompt: "Halo Tim Cetas Production, saya ingin konsultasi sewa peralatan event (sound/lighting/LED) dan merchandise.",
      };
    }
    if (pathname.startsWith("/ajukan-event")) {
      return {
        tag: "Pengajuan Event",
        speech: "Mau ajukan proposal acara atau pasang 'Iklan Cetas Kita'? Diskusikan langsung dengan tim kurator Cetas!",
        defaultPrompt: "Halo Tim Kurasi Cetas, kami ingin mendiskusikan proposal acara / slot Iklan Cetas Kita.",
      };
    }
    if (pathname.startsWith("/register-event")) {
      return {
        tag: "Pendaftaran Peserta",
        speech: "Ada kendala upload berkas lomba atau pendaftaran tim? Anty bantu hubungkan ke panitia ya!",
        defaultPrompt: "Halo Anty, saya butuh bantuan terkait pendaftaran peserta lomba / event di web Cetas.",
      };
    }
    if (pathname.startsWith("/admin")) {
      return {
        tag: "Helpdesk Admin",
        speech: "Halo Rekan Cetas! Perlu bantuan teknis sistem atau sinkronisasi Midtrans?",
        defaultPrompt: "Halo Lead Developer Cetas, saya membutuhkan asistensi teknis backoffice admin.",
      };
    }
    return {
      tag: "Asisten Manusia Semut Cetas",
      speech: "Halo! Aku Anty, si Manusia Semut asisten resmi Cetas! Butuh info Tiket, Vote, atau Sewa Alat?",
      defaultPrompt: "Halo Anty & Tim Cetas, saya ingin berkonsultasi seputar layanan Centralized Electronic Tournament & Award System.",
    };
  };

  const contextInfo = getContextualGreeting();

  const quickActions: QuickAction[] = [
    {
      id: "ticket",
      label: "Beli / Bantuan Tiket Event",
      icon: Ticket,
      message: "Halo Anty, saya ingin menanyakan ketersediaan tiket dan bantuan verifikasi pembayaran e-tiket.",
    },
    {
      id: "vote",
      label: "Bantuan Bilik Voting & QRIS",
      icon: Award,
      message: "Halo Anty, saya ingin meminta panduan e-voting Cetas Vote dan konfirmasi pembayaran suara via QRIS.",
    },
    {
      id: "production",
      label: "Sewa Sound, Lighting & LED",
      icon: ShoppingBag,
      message: "Halo Tim Cetas Production, saya butuh penawaran paket sewa sound system, lighting, videotron & panggung.",
    },
    {
      id: "ajukan",
      label: "Kerjasama & Pengajuan Event",
      icon: SendIcon,
      message: "Halo Tim Cetas, kami dari panitia event ingin mengajukan proposal kerjasama ticketing & publikasi.",
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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end select-none">
        {/* SPEECH BUBBLE TEASER (Contextual Preview) */}
        {!isOpen && showBubble && (
          <div className="relative mb-2 max-w-[270px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="relative rounded-2xl bg-white p-3.5 shadow-xl border border-purple-200">
              {/* Close mini bubble */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs shadow-xs transition"
                aria-label="Tutup pesan"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                  {contextInfo.tag}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">• Online</span>
              </div>

              <p
                onClick={() => setIsOpen(true)}
                className="cursor-pointer text-xs font-semibold text-slate-700 leading-snug hover:text-purple-700 transition"
              >
                &ldquo;{contextInfo.speech}&rdquo;
              </p>

              <div
                onClick={() => setIsOpen(true)}
                className="mt-2.5 flex items-center justify-between cursor-pointer pt-2 border-t border-purple-50 text-[11px] font-bold text-purple-700 hover:underline"
              >
                <span>Chat via WhatsApp</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Bubble pointer triangle */}
            <div className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 bg-white border-r border-b border-purple-200" />
          </div>
        )}

        {/* MASCOT AVATAR TRIGGER (Clean Purple Ant-Man with 3D Waving Arm) */}
        <div className="relative group">
          {/* Soft Purple Glow Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 opacity-60 blur-md group-hover:opacity-100 transition duration-300" />

          {/* Trigger Button containing AntmanMascot */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setShowBubble(false);
            }}
            className="relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white p-1 shadow-2xl border-2 border-purple-400/80 hover:border-purple-600 transition-transform active:scale-95 duration-200"
            title="Chat dengan Anty si Manusia Semut"
            aria-label="Buka Chat WhatsApp Anty"
          >
            {/* Mascot Avatar with 3D Waving Arm */}
            <div className="relative h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-50 via-slate-50 to-white">
              <AntmanMascot
                pose="waving"
                enable3DArm={true}
                size={74}
              />
            </div>

            {/* WhatsApp Brand Icon Badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md border-2 border-white">
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
            </div>

            {/* Active Live Pulse */}
            <span className="absolute top-0 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
            </span>
          </button>
        </div>
      </div>

      {/* WHATSAPP CONCIERGE MODAL DIALOG (BERRY PURPLE THEME) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Berry Purple Gradient (Referencing Aroma Ice Berry Tea) */}
            <div className="relative bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 p-5 text-white overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 rounded-2xl bg-white/10 border border-white/20 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                    <AntmanMascot
                      pose="waving"
                      enable3DArm={false}
                      size={52}
                    />
                    <span className="absolute bottom-0 right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                        ANTY • Manusia Semut Cetas
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                        WhatsApp Hub
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Online 24 Jam • Respons Cepat WhatsApp
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition"
                  aria-label="Tutup Dialog Anty"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-700 text-sm">
              {/* Dialogue Greeting Box */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200">
                <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Sapaan Anty
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {contextInfo.speech}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2.5 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
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
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {qa.label}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 shrink-0 transition" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Message Input Form */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label
                  htmlFor="wa-custom-msg"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  Atau Ketik Pertanyaan Khusus Anda:
                </label>
                <textarea
                  id="wa-custom-msg"
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Tulis pertanyaan Anda di sini... (cth: "Halo Anty, mau tanya sewa sound 5000 watt...")`}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition resize-none"
                />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500">Tiket Ber-QR</div>
                  <div className="text-xs font-bold text-purple-700">Anti-Duplikasi</div>
                </div>
                <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500">Payment Gateway</div>
                  <div className="text-xs font-bold text-purple-700">Midtrans QRIS</div>
                </div>
                <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500">Vendor Terpercaya</div>
                  <div className="text-xs font-bold text-emerald-600">Cetas Production</div>
                </div>
              </div>
            </div>

            {/* Footer / WhatsApp Submit CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Nomor CS: <span className="font-mono font-bold text-slate-700">+62 812-9988-7766</span>
              </div>

              <button
                type="button"
                onClick={() => handleSendToWhatsApp()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-6 py-3 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
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
