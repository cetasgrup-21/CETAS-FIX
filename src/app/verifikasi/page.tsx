"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  Search,
  Lock,
  ExternalLink,
  Award,
  Users,
  Calendar,
  Building2,
  FileCheck2,
} from "lucide-react";
import { RegisteredAttendee, SquadMemberItem } from "@/lib/events-registration-data";
import { UnifiedEvent } from "@/lib/events-unified-data";

function VerifikasiPortalContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get("code") || searchParams.get("badge") || searchParams.get("id") || "";

  const [inputCode, setInputCode] = useState<string>(rawCode);
  const [attendee, setAttendee] = useState<RegisteredAttendee | null>(null);
  const [eventData, setEventData] = useState<UnifiedEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"VALIDASI" | "PERSONEL">("VALIDASI");

  const verifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) {
      setIsLoading(false);
      setAttendee(null);
      setErrorMsg("Silakan masukkan Kode E-Badge / Registrasi sertifikat untuk memverifikasi.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/attendees?badgeCode=${encodeURIComponent(codeToVerify.trim())}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && data.attendee) {
        setAttendee(data.attendee);
        if (data.event) {
          setEventData(data.event);
        }
      } else {
        setAttendee(null);
        setErrorMsg(
          data.message ||
            "Dokumen sertifikat tidak ditemukan. Pastikan kode registrasi sesuai dengan yang tertera di bawah QR code sertifikat."
        );
      }
    } catch {
      setAttendee(null);
      setErrorMsg("Gagal menghubungi server verifikasi CETAS. Pastikan perangkat Anda terhubung ke internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rawCode) {
      setInputCode(rawCode);
      verifyCode(rawCode);
    } else {
      setIsLoading(false);
    }
  }, [rawCode]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const certConfig = eventData?.certificateConfig || {};
  const rawFormat = (certConfig.certificateNumberFormat || "[NO]/CETAS-LKBB/X/2026").trim();
  const contingentNum = attendee?.tmLotteryNumber || attendee?.candidateNumber || "";
  const paddedNum = contingentNum ? String(contingentNum).padStart(3, "0") : "001";
  let certNumber = "";
  if (rawFormat.includes("[NO]") || rawFormat.includes("[NOMOR]")) {
    certNumber = rawFormat.replace(/\[NO\]|\[NOMOR\]/g, paddedNum);
  } else if (rawFormat.includes("###")) {
    certNumber = rawFormat.replace(/###/g, paddedNum);
  } else {
    certNumber = rawFormat;
  }

  const signer1 = certConfig.signer1 || {
    role: "Ketua Panitia Penyelenggara",
    name: "Ardi Purwanto, S.Pd.",
    nipOrId: "NIP. 19910523 201502 1 002",
  };
  const signer2 = certConfig.signer2 || {
    role: "Ketua Dewan Juri CETAS",
    name: "M. Rian Arifin, S.Pd., M.Han",
    nipOrId: "NIP. 19880412 201101 1 003",
  };
  const issueCity = certConfig.issueCity || "Jakarta";
  const issueDate = certConfig.issueDate || (eventData?.date ? new Date(eventData.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "30 Oktober 2026");
  const institutionName = certConfig.institutionName || "Centralized Electronic Tournament & Award System";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/cetas_logo.png"
              alt="CETAS"
              className="h-8 w-auto object-contain"
            />
            <div>
              <div className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <span>CETAS VERIFICATION</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  PUBLIC SEAL
                </span>
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-1">
                Portal Resmi Validasi Keaslian E-Sertifikat &amp; Dokumen Kejuaraan
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-purple-600 transition flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              <span className="hidden sm:inline">Login Pelatih</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Search Bar for manual verification check */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyCode(inputCode);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Ketik Kode E-Badge / Registrasi (misal: CETAS-ATD-2026-XXXXX)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition shrink-0"
            >
              {isLoading ? "Memeriksa..." : "Cek Keaslian"}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center animate-spin">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Memverifikasi Keabsahan Dokumen...
              </h3>
              <p className="text-xs text-slate-500">
                Menghubungkan ke basis data SHA-256 resmi CETAS untuk mencocokkan integritas data sertifikat.
              </p>
            </div>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-3xl p-8 sm:p-10 text-center border-2 border-rose-300 dark:border-rose-900 shadow-md space-y-4 animate-in fade-in">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="text-base font-black text-rose-900 dark:text-rose-200">
                Dokumen Tidak Terverifikasi / Tidak Ditemukan
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Verified Certificate Result */}
        {!isLoading && attendee && (
          <div className="space-y-6 animate-in zoom-in-95">
            {/* Big Green Verified Seal Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md text-emerald-200 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <ShieldCheck className="h-10 w-10 text-emerald-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 text-[10px] font-black tracking-widest uppercase border border-emerald-300/30">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Dokumen Resmi Terverifikasi Asli</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {attendee.institution}
                    </h2>
                    <p className="text-xs text-emerald-100/90">
                      Pasukan: <strong>&ldquo;{attendee.fullName}&rdquo;</strong> • Kategori: <strong>{attendee.category}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak Lembar Validasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Tersalin ✓" : "Salin Link"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation for Verifiers */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("VALIDASI")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeTab === "VALIDASI"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>1. Rincian Dokumen &amp; Pengesahan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PERSONEL")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeTab === "PERSONEL"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>2. Lampiran 16 Personel Pasukan ({attendee.squadMembers?.filter((m) => m.name.trim()).length || 0})</span>
              </button>
            </div>

            {/* TAB 1: VALIDATION DETAILS */}
            {activeTab === "VALIDASI" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Validation Card */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                      Identitas E-Sertifikat Resmi
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ID: {attendee.badgeCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Nomor Sertifikat Resmi:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm block">
                        {certNumber}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Kejuaraan / Event:</span>
                      <strong className="text-slate-900 dark:text-white block">
                        {eventData?.title || "LKBB CETAS NASIONAL 2026"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Pangkalan / Sekolah:</span>
                      <strong className="text-slate-900 dark:text-white block">
                        {attendee.institution}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Nama Pasukan / Kontingen:</span>
                      <strong className="text-slate-900 dark:text-white block">
                        &ldquo;{attendee.fullName}&rdquo;
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Pembina / Pelatih Kontingen:</span>
                      <strong className="text-slate-900 dark:text-white block">
                        {attendee.coachName || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Komandan Peleton (Danton):</span>
                      <strong className="text-slate-900 dark:text-white block">
                        {attendee.dantonName || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Nomor Undian Technical Meeting (TM):</span>
                      <strong className="text-purple-700 dark:text-purple-300 font-mono text-sm block">
                        #{attendee.tmLotteryNumber || attendee.candidateNumber || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Status Pengesahan:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>DISAHKAN PANITIA RESMI ✓</span>
                      </span>
                    </div>
                  </div>

                  {/* Signers Info */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-[11px] font-black uppercase text-slate-500 block">
                      Pejabat Penandatangan Sertifikat:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{signer1.role}</span>
                        <strong className="text-slate-800 dark:text-slate-200 block">{signer1.name}</strong>
                        <span className="text-[10px] font-mono text-slate-500 block">{signer1.nipOrId || "-"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{signer2.role}</span>
                        <strong className="text-slate-800 dark:text-slate-200 block">{signer2.name}</strong>
                        <span className="text-[10px] font-mono text-slate-500 block">{signer2.nipOrId || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Security Validation Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-900 dark:text-white">
                      <Lock className="h-4 w-4 text-purple-600" />
                      <span>Integritas Digital</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">
                        Keabsahan Dokumen Asli
                      </span>
                      <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        Data ini disinkronkan secara langsung dengan database panitia penyelenggara dan dewan juri CETAS.
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 block">Badan Penyelenggara:</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {institutionName}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 block">Tanggal Penerbitan:</span>
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 block">
                        {issueCity}, {issueDate}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 block">Algoritma Segel Digital:</span>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 block break-all">
                        SHA-256 (Hash Keaslian Terverifikasi)
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                    Validasi Publik Resmi • CETAS-VERIFY
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 16 CORE MEMBERS ROSTER (LEMBAR 2) */}
            {activeTab === "PERSONEL" && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                      Lampiran Susunan 16 Personel Pasukan &amp; Cadangan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Daftar siswa yang resmi terdaftar di e-sertifikat lampiran kejuaraan ini.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                    {attendee.squadMembers?.filter((m) => m.name.trim()).length || 0} Terdaftar
                  </span>
                </div>

                {attendee.squadMembers && attendee.squadMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attendee.squadMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                          member.isReserve
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                            : idx === 0
                            ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                            member.isReserve
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                              : idx === 0
                              ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200 font-black"
                              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                          }`}>
                            {idx === 0 ? "DANTON" : member.isReserve ? `CADANGAN ${idx - 16}` : `#${String(idx).padStart(2, "0")}`}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {member.name || "[Belum diinput panitia]"}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {member.nisnOrId ? `NISN: ${member.nisnOrId}` : "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                    Susunan nama 16 personel belum diunggah panitia untuk sertifikat ini.
                  </div>
                )}
              </div>
            )}

            {/* Privacy & Security Notice */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-3">
              <Lock className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Privasi &amp; Keamanan Akun Pelatih Terlindungi:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Halaman ini adalah <strong>portal publik khusus verifikasi keabsahan dokumen</strong> bagi pihak verifikator PPDB, sekolah, dan dewan juri. Akses ke portal pelatih, rekap nilai internal, dan formulir pengajuan tetap dilindungi dengan kredensial terpisah.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Centralized Electronic Tournament &amp; Award System (CETAS). All rights reserved.</p>
        <p className="text-[10px] text-slate-400 mt-1">Sistem Otomasi Turnamen, E-Sertifikat Digital &amp; Dewan Juri Terintegrasi</p>
      </footer>
    </div>
  );
}

export default function VerifikasiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifikasiPortalContent />
    </Suspense>
  );
}
