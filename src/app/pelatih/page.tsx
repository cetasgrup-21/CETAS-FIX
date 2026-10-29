"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Calendar,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  FileCheck,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  Lock,
  Share2,
  Mail,
  Printer,
  X,
  Eye,
  User,
  Users,
  Building,
  Phone,
  QrCode,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { RegisteredAttendee } from "@/lib/events-registration-data";
import { LKBBTeamScore, UnifiedEvent } from "@/lib/events-unified-data";
import { generateQRCodeDataUrl } from "@/lib/ticket-security";

function PelatihPortalContent() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") || searchParams.get("badge") || "";

  // Auth / Session State
  const [coachCode, setCoachCode] = useState<string>("");
  const [authAttendee, setAuthAttendee] = useState<RegisteredAttendee | null>(null);
  const [authEvent, setAuthEvent] = useState<UnifiedEvent | null>(null);
  const [authTeamScore, setAuthTeamScore] = useState<LKBBTeamScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Login Gate State
  const [activeGateTab, setActiveGateTab] = useState<"login" | "register">("login");
  const [loginInput, setLoginInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // Quick Registration Form State
  const [eventsList, setEventsList] = useState<UnifiedEvent[]>([]);
  const [regForm, setRegForm] = useState({
    eventId: "",
    fullName: "",
    institution: "",
    category: "Tingkat SMP/MTs",
    coachName: "",
    coachPhone: "",
    email: "",
    dantonName: "",
    notes: "",
    paymentScheme: "LUNAS" as "LUNAS" | "DP",
  });
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Verified Dashboard State
  const [activeTab, setActiveTab] = useState<"nilai" | "jadwal" | "berkas" | "sertifikat" | "protes">("nilai");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [emailSentToast, setEmailSentToast] = useState<string | null>(null);

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [certType, setCertType] = useState<"PELATIH" | "DANTON" | "PASUKAN" | "JUARA">("PELATIH");
  const [certQrUrl, setCertQrUrl] = useState<string>("");

  // Protest Form State
  const [protesForm, setProtesForm] = useState({
    aspek: "PBB Murni",
    alasan: "",
    submitted: false,
  });

  // Load available events for registration tab
  useEffect(() => {
    fetch("/api/attendees?type=events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEventsList(data.events);
          if (data.events.length > 0 && !regForm.eventId) {
            setRegForm((prev) => ({ ...prev, eventId: data.events[0].id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Initialize coach session from URL or localStorage
  useEffect(() => {
    const savedCode = urlCode || (typeof window !== "undefined" ? localStorage.getItem("cetas_coach_code") || "" : "");
    if (savedCode) {
      setCoachCode(savedCode);
      fetchAttendeeData(savedCode);
    } else {
      setIsLoading(false);
    }
  }, [urlCode]);

  // Fetch single attendee + matching score
  const fetchAttendeeData = async (code: string) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await fetch(`/api/attendees?badgeCode=${encodeURIComponent(code.trim())}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && data.attendee) {
        setAuthAttendee(data.attendee);
        if (data.event) setAuthEvent(data.event);
        if (data.lkbbTeam) setAuthTeamScore(data.lkbbTeam);

        // Save session
        if (typeof window !== "undefined") {
          localStorage.setItem("cetas_coach_code", data.attendee.badgeCode);
        }

        // Generate QR Code for certificate & badge
        const qr = await generateQRCodeDataUrl(
          `CETAS-VERIFIED|${data.attendee.badgeCode}|${data.attendee.fullName}|${data.attendee.institution}|${data.attendee.status}`
        );
        setCertQrUrl(qr);
      } else {
        setLoginError(data.message || "Data pasukan tidak ditemukan. Pastikan kode badge atau kontak benar.");
        setAuthAttendee(null);
      }
    } catch {
      setLoginError("Gagal menghubungi server CETAS. Periksa koneksi internet Anda.");
      setAuthAttendee(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle Coach Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError("Masukkan Kode E-Badge atau Email/WhatsApp pelatih yang terdaftar.");
      return;
    }
    setIsSubmittingLogin(true);
    setCoachCode(loginInput.trim());
    await fetchAttendeeData(loginInput.trim());
    setIsSubmittingLogin(false);
  };

  // Handle Troop Registration (Bikin Akun Pasukan)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.fullName.trim() || !regForm.institution.trim() || !regForm.email.trim() || !regForm.coachPhone.trim()) {
      setRegError("Mohon lengkapi nama pasukan, sekolah, email, dan no WhatsApp pelatih.");
      return;
    }

    setIsSubmittingReg(true);
    try {
      const targetEventId = regForm.eventId || (eventsList[0] ? eventsList[0].id : "ev-cemara-2026");
      const matchedEv = eventsList.find((e) => e.id === targetEventId);
      const feeTotal = Number(matchedEv?.price) || 0;
      const minDp = Number(matchedEv?.minDownPaymentAmount) || Math.round(feeTotal / 2);
      const paidAmt = feeTotal === 0 ? 0 : (regForm.paymentScheme === "LUNAS" ? feeTotal : minDp);
      const remainingAmt = Math.max(0, feeTotal - paidAmt);

      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: targetEventId,
          fullName: regForm.fullName.trim(),
          institution: regForm.institution.trim(),
          category: regForm.category,
          email: regForm.email.trim(),
          phone: regForm.coachPhone.trim(),
          coachName: regForm.coachName.trim() || regForm.fullName.trim(),
          coachPhone: regForm.coachPhone.trim(),
          dantonName: regForm.dantonName.trim(),
          notes: regForm.notes.trim(),
          status: "WAITLIST", // Status awal: Menunggu Verifikasi Admin CETAS
          paymentScheme: regForm.paymentScheme,
          registrationFeeTotal: feeTotal,
          registrationFeePaid: paidAmt,
          registrationFeeRemaining: remainingAmt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat akun pasukan.");
      }

      // Berhasil dibuat -> Langsung login dan simpan session
      const createdAtd: RegisteredAttendee = data.attendee;
      setAuthAttendee(createdAtd);
      if (data.event) setAuthEvent(data.event);
      setCoachCode(createdAtd.badgeCode);

      if (typeof window !== "undefined") {
        localStorage.setItem("cetas_coach_code", createdAtd.badgeCode);
      }

      // Generate QR
      const qr = await generateQRCodeDataUrl(
        `CETAS-VERIFIED|${createdAtd.badgeCode}|${createdAtd.fullName}|${createdAtd.institution}|WAITLIST`
      );
      setCertQrUrl(qr);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftarkan akun pasukan.");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Logout / Switch Troop Account
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cetas_coach_code");
    }
    setCoachCode("");
    setAuthAttendee(null);
    setAuthEvent(null);
    setAuthTeamScore(null);
    setLoginInput("");
    setActiveGateTab("login");
  };

  // Copy Badge Code
  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Refresh status check
  const handleRefreshStatus = () => {
    if (authAttendee?.badgeCode) {
      setIsRefreshing(true);
      fetchAttendeeData(authAttendee.badgeCode);
    }
  };

  // Trigger Send Certificate to Coach Email
  const handleSendEmailCertificate = () => {
    const email = authAttendee?.email || "pelatih";
    setEmailSentToast(`E-Sertifikat resmi ber-QR berhasil dikirimkan ke email ${email}! Silakan periksa kotak masuk atau spam.`);
    setTimeout(() => setEmailSentToast(null), 5000);
  };

  // Open Certificate Preview Modal
  const handleOpenCertModal = (type: "PELATIH" | "DANTON" | "PASUKAN" | "JUARA") => {
    setCertType(type);
    setIsCertModalOpen(true);
  };

  // Nomor Undian Hasil Technical Meeting (TM) - Bukan dari Pendaftaran
  const tmRawNumber = (authAttendee?.tmLotteryNumber || authAttendee?.candidateNumber || "").trim();
  const hasTmNumber = Boolean(tmRawNumber && tmRawNumber !== "-" && !isNaN(parseInt(tmRawNumber, 10)));
  const candidateNumInt = hasTmNumber ? parseInt(tmRawNumber, 10) : 1;
  const tmDisplayNumber = hasTmNumber ? `#${tmRawNumber.padStart(2, "0")}` : "Belum Diundi (Menunggu TM)";

  const baseHour = 8; // 08:00 WIB
  const minutesOffset = (candidateNumInt - 1) * 12; // 12 mins per troop
  const calcTime = (extraMins: number) => {
    const totalMins = baseHour * 60 + minutesOffset + extraMins;
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} WIB`;
  };

  const scheduleRundown = {
    dp1: calcTime(-30),
    dp2: calcTime(-20),
    dp3: calcTime(-10),
    arena: calcTime(0),
  };

  // Status Publikasi Nilai Final dari Admin CETAS (Bukan Realtime)
  const isScoreReleased = Boolean(authEvent?.isScorePublishedToCoaches);

  // Score Calculations (Hanya ditampilkan jika nilai final resmi sudah dirilis oleh Admin)
  const scoreData = {
    pbbMurni: isScoreReleased ? (authTeamScore?.pbbMurni || 0) : 0,
    variasiFormasi: isScoreReleased ? (authTeamScore?.variasiFormasi || 0) : 0,
    dantonScore: isScoreReleased ? (authTeamScore?.danton || 0) : 0,
    kostumScore: isScoreReleased ? (authTeamScore?.kostum || 0) : 0,
    penalty: isScoreReleased ? (authTeamScore?.penalty || 0) : 0,
    totalScore: isScoreReleased ? (authTeamScore?.totalScore || 0) : 0,
    status: isScoreReleased ? (authTeamScore?.status || "TERVERIFIKASI") : "MENUNGGU_RILIS",
  };

  // ---------------------------------------------------------------------------------
  // VIEW 1: LOADING STATE
  // ---------------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFBFE] flex flex-col items-center justify-center p-4">
        <div className="h-14 w-14 rounded-2xl bg-purple-600/10 border border-purple-200 flex items-center justify-center text-purple-600 animate-spin">
          <RefreshCw className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xs font-bold text-slate-600 tracking-wide">
          Memverifikasi Akses Akun Pasukan ke Server CETAS...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------------
  // VIEW 2: COACH IDENTIFICATION & ENTRY GATE (BELUM LOGIN)
  // ---------------------------------------------------------------------------------
  if (!authAttendee) {
    return (
      <div className="min-h-screen bg-[#FCFBFE] text-slate-800 pb-28">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-purple-900 via-purple-950 to-slate-950 pt-16 pb-20 text-white border-b border-purple-800/40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-purple-200 border border-white/15 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              <span>Portal Resmi Pelatih & Official Pasukan CETAS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Akses Pasukan & Rekap Nilai Privat
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl mx-auto leading-relaxed">
              Setiap pasukan memiliki bilik privat tersendiri. Masuk menggunakan <strong>Kode E-Badge</strong> atau <strong>Email/WhatsApp</strong> resmi pasukan Anda untuk melihat lembar nilai live, jadwal DP, dan e-sertifikat lomba resmi.
            </p>
          </div>
        </section>

        {/* Gate Card: Login vs Register */}
        <div className="mx-auto max-w-xl px-4 -mt-10 relative z-20">
          <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveGateTab("login");
                  setLoginError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  activeGateTab === "login"
                    ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Masuk Portal Pasukan
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGateTab("register");
                  setRegError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  activeGateTab === "register"
                    ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Bikin Akun Pasukan Baru
              </button>
            </div>

            {/* ERROR BANNER */}
            {(loginError || regError) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{loginError || regError}</div>
              </div>
            )}

            {/* TAB 1: FORM LOGIN / MASUK */}
            {activeGateTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kode Akses Pasukan / E-Badge / Email / No. WA
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: CETAS-ATD-2026-98124 atau email pelatih"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold outline-none focus:border-purple-600 focus:bg-white transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Kode E-Badge didapatkan saat mendaftar kontingen secara online atau dari panitia turnamen.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black text-xs shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2"
                >
                  {isSubmittingLogin ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Memverifikasi Pasukan...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Masuk ke Portal Pasukan
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-500">
                  Belum punya kode akses?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveGateTab("register")}
                    className="font-bold text-purple-700 hover:underline"
                  >
                    Bikin Akun Pasukan Sekarang
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: FORM REGISTRASI / BIKIN AKUN PASUKAN BARU */}
            {activeGateTab === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Event Perlombaan</label>
                  <select
                    value={regForm.eventId}
                    onChange={(e) => setRegForm({ ...regForm, eventId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-purple-600"
                  >
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pasukan / Pleton *</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Pleton Garuda Sakti"
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Asal Sekolah / Instansi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: SMP Negeri 1 Cibinong"
                      value={regForm.institution}
                      onChange={(e) => setRegForm({ ...regForm, institution: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori / Tingkat *</label>
                  <select
                    value={regForm.category}
                    onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-purple-600"
                  >
                    <option value="Tingkat SD/MI">Tingkat SD/MI</option>
                    <option value="Tingkat SMP/MTs">Tingkat SMP/MTs</option>
                    <option value="Tingkat SMA/SMK/MA">Tingkat SMA/SMK/MA</option>
                    <option value="PURNA/CLUB/UMUM">PURNA/CLUB/UMUM</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pelatih / Pembina *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap pelatih"
                      value={regForm.coachName}
                      onChange={(e) => setRegForm({ ...regForm, coachName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Pelatih *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxxx"
                      value={regForm.coachPhone}
                      onChange={(e) => setRegForm({ ...regForm, coachPhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Pelatih *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@sekolah.sch.id"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Komandan Peleton (Danton)</label>
                    <input
                      type="text"
                      placeholder="Nama danton (bisa diisi nanti)"
                      value={regForm.dantonName}
                      onChange={(e) => setRegForm({ ...regForm, dantonName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Skema Pembayaran Registrasi (Jika event berbayar) */}
                {(() => {
                  const ev = eventsList.find((e) => e.id === regForm.eventId) || eventsList[0];
                  const price = Number(ev?.price) || 0;
                  const minDp = Number(ev?.minDownPaymentAmount) || Math.round(price / 2);
                  if (price <= 0) return null;
                  return (
                    <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Skema Biaya Pendaftaran:</span>
                        <span className="font-black text-purple-900">Rp {price.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          regForm.paymentScheme === "LUNAS"
                            ? "bg-white border-purple-600 text-purple-900 shadow-xs font-black"
                            : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="regPaymentScheme"
                            checked={regForm.paymentScheme === "LUNAS"}
                            onChange={() => setRegForm({ ...regForm, paymentScheme: "LUNAS" })}
                            className="text-purple-600"
                          />
                          <div>
                            <div className="text-[11px]">Lunas (Full)</div>
                            <div className="text-[10px] text-slate-500 font-normal">Rp {price.toLocaleString("id-ID")}</div>
                          </div>
                        </label>

                        <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          regForm.paymentScheme === "DP"
                            ? "bg-white border-purple-600 text-purple-900 shadow-xs font-black"
                            : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="regPaymentScheme"
                            checked={regForm.paymentScheme === "DP"}
                            onChange={() => setRegForm({ ...regForm, paymentScheme: "DP" })}
                            className="text-purple-600"
                          />
                          <div>
                            <div className="text-[11px]">Down Payment (DP)</div>
                            <div className="text-[10px] text-slate-500 font-normal">Rp {minDp.toLocaleString("id-ID")}</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black text-xs shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2"
                >
                  {isSubmittingReg ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Mendaftarkan Akun Pasukan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Daftarkan Pasukan & Bikin Akun CETAS
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------------
  // VIEW 3: MENUNGGU VERIFIKASI ADMIN CETAS (STATUS !== "CONFIRMED")
  // ---------------------------------------------------------------------------------
  if (authAttendee.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen bg-[#FCFBFE] text-slate-800 pb-28">
        {/* Top Header */}
        <section className="bg-gradient-to-b from-purple-900 to-slate-950 pt-12 pb-16 text-white border-b border-purple-800/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-black text-amber-300 border border-amber-500/30 backdrop-blur-md animate-pulse">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>STATUS: MENUNGGU VERIFIKASI ADMIN CETAS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Akun Pasukan Sedang Ditinjau Panitia
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto leading-relaxed">
              Pendaftaran akun pasukan Anda telah tercatat di sistem CETAS. Panitia sedang meninjau berkas administrasi dan kuota perlombaan. Akses nilai dan sertifikat akan terbuka setelah disetujui.
            </p>
          </div>
        </section>

        {/* Verification Card */}
        <div className="mx-auto max-w-2xl px-4 -mt-8 relative z-20 space-y-4">
          <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kode Akses Pasukan (E-Badge)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base font-black text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                    {authAttendee.badgeCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(authAttendee.badgeCode)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition"
                    title="Salin Kode"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  MENUNGGU VERIFIKASI
                </span>
              </div>
            </div>

            {/* Troop Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Nama Pasukan / Pleton</div>
                <div className="text-sm font-black text-slate-900">{authAttendee.fullName}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Asal Sekolah / Instansi</div>
                <div className="text-sm font-black text-slate-900">{authAttendee.institution}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Kategori Lomba</div>
                <div className="text-xs font-bold text-purple-700">{authAttendee.category}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Pelatih / Official</div>
                <div className="text-xs font-bold text-slate-800">
                  {authAttendee.coachName || authAttendee.fullName} ({authAttendee.phone})
                </div>
              </div>
            </div>

            {/* Status Biaya & Skema Pembayaran Registrasi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-700">Status Pembayaran Registrasi</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    authAttendee.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : authAttendee.paymentStatus === "DP"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {authAttendee.paymentStatus === "PAID"
                    ? "✓ LUNAS"
                    : authAttendee.paymentStatus === "DP"
                    ? "DOWN PAYMENT (DP)"
                    : "BELUM BAYAR"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Biaya:</span>
                  <span className="font-black text-slate-900">
                    {authAttendee.registrationFeeTotal
                      ? `Rp ${authAttendee.registrationFeeTotal.toLocaleString("id-ID")}`
                      : "Gratis"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sudah Dibayar:</span>
                  <span className="font-black text-emerald-700">
                    {authAttendee.registrationFeePaid
                      ? `Rp ${authAttendee.registrationFeePaid.toLocaleString("id-ID")}`
                      : "Rp 0"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sisa Tagihan:</span>
                  <span className="font-black text-rose-600">
                    {authAttendee.registrationFeeRemaining
                      ? `Rp ${authAttendee.registrationFeeRemaining.toLocaleString("id-ID")}`
                      : "Nihil"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notice Box */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Apa yang terjadi setelah akun disetujui & diverifikasi admin?
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Pasukan resmi masuk ke daftar peserta kompetisi dan Cetas Vote.</li>
                <li>Nomor undian tampil resmi akan diundi pada sesi Technical Meeting (TM).</li>
                <li>Rundown jadwal persiapan (DP 1, DP 2, DP 3) akan aktif sesuai hasil undian TM.</li>
                <li>Hasil penilaian final resmi dewan juri & E-Sertifikat ber-QR Code dapat diakses setelah dirilis panitia.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Memeriksa Status..." : "Periksa Status Verifikasi"}
              </button>

              <a
                href={`https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20pelatih%20dari%20${encodeURIComponent(authAttendee.institution)}%20(${encodeURIComponent(authAttendee.fullName)})%20dengan%20Kode%20E-Badge%20${encodeURIComponent(authAttendee.badgeCode)}.%20Mohon%20bantuan%20verifikasi%20akun%20pasukan%20kami.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Hubungi Admin CETAS
              </a>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Ganti Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------------
  // VIEW 4: VERIFIED COACH DASHBOARD (TERVERIFIKASI & AKSES DIBUKA PENUH)
  // ---------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FCFBFE] text-slate-800 pb-28">
      {/* Toast Notification */}
      {emailSentToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{emailSentToast}</span>
          <button onClick={() => setEmailSentToast(null)} className="ml-2 hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900 via-purple-950 to-slate-950 pt-10 pb-16 text-white border-b border-purple-800/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>AKUN PASUKAN RESMI TERVERIFIKASI CETAS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {authAttendee.institution}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
                Pasukan: <strong>&ldquo;{authAttendee.fullName}&rdquo;</strong> • Kategori: <strong>{authAttendee.category}</strong> • Nomor Undian: <strong>{tmDisplayNumber}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRefreshStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 border border-white/15 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Perbarui Nilai
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white font-bold text-xs px-3.5 py-2.5 border border-white/15 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Contingent Profile & Quick Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800">
                  {authAttendee.badgeCode}
                </span>
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                    isScoreReleased
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                  }`}
                >
                  {isScoreReleased
                    ? "✓ Nilai Final Resmi Dirilis"
                    : "🔒 Rekap Dewan Juri (Tertutup)"}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {authAttendee.institution}
                </h2>
                <p className="text-xs font-bold text-purple-700 mt-0.5">
                  &ldquo;{authAttendee.fullName}&rdquo;
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium">
                  Kategori: <strong className="text-slate-800">{authAttendee.category}</strong>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">No. Undian TM</div>
                  <div className="text-base font-black text-purple-900 truncate">
                    {tmDisplayNumber}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Status Pasukan</div>
                  <div className="text-xs font-black text-emerald-700 flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-4 w-4" />
                    Terverifikasi
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-purple-50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pelatih / Pembina:</span>
                  <span className="font-bold text-slate-900">{authAttendee.coachName || authAttendee.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Komandan Peleton:</span>
                  <span className="font-bold text-slate-900">{authAttendee.dantonName || "Sesuai Berkas"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jadwal Masuk Arena:</span>
                  <span className="font-bold text-purple-700">
                    {hasTmNumber ? scheduleRundown.arena : "Menunggu TM"}
                  </span>
                </div>
              </div>

              {/* Total Score Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white space-y-1">
                <div className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
                  Akumulasi Nilai Pasukan
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black tracking-tight font-mono">
                    {isScoreReleased
                      ? (scoreData.totalScore > 0 ? `${scoreData.totalScore} Poin` : "Belum Dinilai")
                      : "Menunggu Rilis Final"}
                  </span>
                  {isScoreReleased && scoreData.totalScore > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                      Grade A
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-purple-200">
                  {isScoreReleased
                    ? "Hasil dewan juri telah disahkan resmi"
                    : "Nilai final resmi akan dibuka oleh Admin CETAS setelah rekap dewan juri disahkan"}
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs space-y-2.5 text-xs">
              <h3 className="font-black uppercase tracking-wider text-slate-900">
                Layanan Cetas Untuk Pasukan
              </h3>
              <button
                type="button"
                onClick={() => handleOpenCertModal("PELATIH")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-purple-800 font-bold border border-purple-200 transition"
              >
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Pratinjau E-Sertifikat Ber-QR
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <a
                href={`https://wa.me/6281584682345?text=Halo%20Sekretariat%20Juri%20CETAS%2C%20saya%20pelatih%20dari%20${encodeURIComponent(authAttendee.institution)}%20ingin%20konsultasi%20jadwal.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 font-bold border border-emerald-200 transition"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  Hubungi Sekretariat Juri
                </span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Scoped Tabbed Views */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tab Bar */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-purple-100 shadow-xs overflow-x-auto scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveTab("nilai")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "nilai"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Award className="h-4 w-4" />
                Lembar Nilai Pasukan
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("jadwal")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "jadwal"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Clock className="h-4 w-4" />
                Jadwal DP & Tampil
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sertifikat")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "sertifikat"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <Download className="h-4 w-4" />
                E-Sertifikat Lomba
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("berkas")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "berkas"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                Juklak & Berkas
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("protes")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  activeTab === "protes"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 hover:bg-purple-50"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                Klarifikasi Nilai
              </button>
            </div>

            {/* TAB CONTENT 1: LEMBAR NILAI PASUKANNYA SAJA */}
            {activeTab === "nilai" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Rincian Penilaian Juri: {authAttendee.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Khusus rekapitulasi penilaian dewan juri untuk pasukan {authAttendee.institution}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold ${
                      isScoreReleased ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isScoreReleased ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Nilai Final Resmi
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Tertutup Sementara
                      </>
                    )}
                  </div>
                </div>

                {!isScoreReleased ? (
                  <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-50/80 to-slate-50 border border-purple-200 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mx-auto">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5 max-w-lg mx-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800">
                        <Clock className="h-3.5 w-3.5" /> REKAPITULASI DEWAN JURI SEDANG BERLANGSUNG
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-2">
                        Hasil Penilaian Final Belum Dirilis Admin CETAS
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Sesuai standar perlombaan resmi, proses penilaian dewan juri di pos PBB Murni, Variasi Formasi, Danton, dan Kostum bersifat tertutup selama turnamen berlangsung. Hasil penilaian final resmi akan dirilis langsung oleh Admin CETAS setelah seluruh sesi penampilan selesai dan disahkan oleh Ketua Dewan Hakim Juri.
                      </p>
                    </div>
                  </div>
                ) : scoreData.totalScore === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <Clock className="h-10 w-10 text-purple-500 mx-auto animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800">
                        Pasukan Belum Tampil / Lembar Nilai Kosong
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Pasukan Anda berada di nomor undian <strong>{tmDisplayNumber}</strong>. Dewan juri akan mengesahkan nilai setelah sesi penampilan selesai.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pos 1: PBB Murni */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900">
                          Pos 1: PBB Murni
                        </span>
                        <span className="text-base font-black text-purple-700">
                          {scoreData.pbbMurni} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Langkah tegap, penghormatan, kerapihan barisan, hadap kanan/kiri, balik kanan, jalan di tempat, dan keselarasan hentakan kaki.
                      </p>
                      <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (scoreData.pbbMurni / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pos 2: Variasi & Formasi */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900">
                          Pos 2: Variasi & Formasi
                        </span>
                        <span className="text-base font-black text-purple-700">
                          {scoreData.variasiFormasi} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Tingkat kesulitan gerakan, estetika formasi, kekompakan pasukan, pesan koreografi, dan transisi buka-tutup barisan.
                      </p>
                      <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (scoreData.variasiFormasi / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pos 3: Danton */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900">
                          Pos 3: Komandan Peleton (Danton)
                        </span>
                        <span className="text-base font-black text-purple-700">
                          {scoreData.dantonScore} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Artikulasi aba-aba, intonasi & volume suara, ketegasan sikap, ketenangan memimpin, dan penguasaan arena lapangan.
                      </p>
                      <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (scoreData.dantonScore / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pos 4: Kostum */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900">
                          Pos 4: Kostum & Kerapihan
                        </span>
                        <span className="text-base font-black text-purple-700">
                          {scoreData.kostumScore} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Kesesuaian juklak, kelengkapan atribut seragam, kebersihan sarung tangan & sepatu, serta keserasian warna kostum.
                      </p>
                      <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (scoreData.kostumScore / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Deductions & Penalties */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      Pinalti & Pengurangan Nilai Resmi
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Pelanggaran garis batas lapangan atau kelebihan durasi waktu tampil
                    </div>
                  </div>
                  <div className={`font-black text-xs px-3 py-1.5 rounded-xl border ${
                    scoreData.penalty > 0
                      ? "text-rose-600 bg-rose-50 border-rose-200"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200"
                  }`}>
                    {scoreData.penalty > 0 ? `-${scoreData.penalty} Poin Pinalti` : "0 Poin (Nihil Pinalti)"}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-purple-50 gap-2">
                  <span>Dicatat otomatis melalui Sistem Penilaian Digital CETAS</span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={!isScoreReleased}
                    className={`inline-flex items-center gap-1.5 font-bold ${
                      isScoreReleased
                        ? "text-purple-700 hover:text-purple-800"
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Lembar Nilai Pasukan
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: JADWAL DAERAH PERSIAPAN (DP) */}
            {activeTab === "jadwal" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Rundown Daerah Persiapan (DP) & Arena Lomba
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jadwal khusus pasukan <strong>{authAttendee.fullName}</strong> (No. Undian: {tmDisplayNumber})
                  </p>
                </div>

                {!hasTmNumber ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <Calendar className="h-10 w-10 text-purple-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800">
                        Nomor Undian Tampil Belum Diundi
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Nomor undian urutan tampil akan ditetapkan melalui sesi pengundian resmi pada <strong>Technical Meeting (TM)</strong>. Rundown waktu persiapan (DP 1, DP 2, DP 3) dan jam masuk arena akan otomatis aktif setelah panitia menginput nomor undian pasukan Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-purple-200 ml-4 pl-6 space-y-6 py-2">
                    {/* Step 1: DP 1 */}
                    <div className="relative">
                      <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900 uppercase">
                          Daerah Persiapan 1 (DP 1) • Cek Absensi & Registrasi Pasukan
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {scheduleRundown.dp1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pemeriksaan ID Card peserta, verifikasi surat tugas mandat sekolah, dan penghitungan jumlah anggota (16 pasukan + 1 danton).
                      </p>
                    </div>

                    {/* Step 2: DP 2 */}
                    <div className="relative">
                      <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900 uppercase">
                          Daerah Persiapan 2 (DP 2) • Pemeriksaan Kostum & Atribut
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {scheduleRundown.dp2}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pemeriksaan kelengkapan atribut seragam paskibra oleh tim juri pos kostum.
                      </p>
                    </div>

                    {/* Step 3: DP 3 */}
                    <div className="relative">
                      <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900 uppercase">
                          Daerah Persiapan 3 (DP 3) • Gerbang Pintu Masuk Lapangan
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {scheduleRundown.dp3}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pasukan bersiap di pintu masuk arena utama. Waktu penampilan dimulai ketika danton melapor kepada juri utama.
                      </p>
                    </div>

                    {/* Step 4: Arena Utama */}
                    <div className="relative">
                      <span className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 uppercase">
                          Arena Utama Lomba • Tampil Live
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {scheduleRundown.arena}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Durasi waktu tampil maksimal 10 menit. Nilai langsung masuk ke sistem dewan juri CETAS secara digital.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: E-SERTIFIKAT LOMBA & PENGIRIMAN */}
            {activeTab === "sertifikat" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    E-Sertifikat & Piagam Penghargaan Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dilengkapi kode QR validasi keaslian bersertifikat CETAS yang dapat diverifikasi keasliannya
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sertifikat Pelatih */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-50 via-white to-purple-50/60 border border-purple-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          E-Sertifikat Pelatih / Pembina
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Atas nama: {authAttendee.coachName || authAttendee.fullName}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCertModal("PELATIH")}
                        className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pratinjau & Unduh
                      </button>
                    </div>
                  </div>

                  {/* Sertifikat Danton */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-50 via-white to-indigo-50/60 border border-indigo-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          E-Sertifikat Komandan Peleton
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Atas nama: {authAttendee.dantonName || "Komandan Peleton"}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCertModal("DANTON")}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pratinjau & Unduh
                      </button>
                    </div>
                  </div>

                  {/* Sertifikat Personel Pasukan */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-50 via-white to-slate-50/60 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          E-Sertifikat Anggota Pasukan (16 Personel)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Paket sertifikat seluruh anggota kontingen
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCertModal("PASUKAN")}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pratinjau & Unduh
                      </button>
                    </div>
                  </div>

                  {/* Piagam Penghargaan Juara */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-50 via-white to-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Piagam Prestasi Juara Kontingen
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Piagam resmi jalur prestasi kedinasan/PPDB
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCertModal("JUARA")}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pratinjau & Unduh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Delivery Feature Box */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-300">
                    <Mail className="h-4 w-4" />
                    Pengiriman E-Sertifikat Digital Langsung
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kirim salinan seluruh berkas sertifikat resmi pasukan ber-QR Code langsung ke email pelatih atau bagikan tautan akses ke grup WhatsApp pasukan Anda.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSendEmailCertificate}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Kirim ke Email: {authAttendee.email}
                    </button>
                    <a
                      href={`https://wa.me/?text=Halo%20semua%2C%20berikut%20adalah%20akses%20E-Sertifikat%20resmi%20turnamen%20untuk%20pasukan%20${encodeURIComponent(authAttendee.institution)}%20(${encodeURIComponent(authAttendee.fullName)})%3A%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5 fill-white" />
                      Bagikan ke WhatsApp Pasukan
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: JUKLAK & BERKAS */}
            {activeTab === "berkas" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Dokumen Teknis & Juklak Resmi Turnamen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unduh file petunjuk teknis pelaksanaan materi lomba dan lembar keabsahan
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Juklak & Juknis Resmi LKBB 2026.pdf
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ketentuan ukuran arena lapangan 18x12m, materi gerakan PBB murni & variasi formasi.
                        </div>
                      </div>
                    </div>
                    <a
                      href="#unduh-juklak"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Mengunduh Petunjuk Pelaksana & Teknis Resmi turnamen...");
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Download className="h-4 w-4" />
                      Unduh PDF
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Surat Keabsahan Mandat Pasukan: {authAttendee.institution}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Kode E-Badge: {authAttendee.badgeCode} • Terdaftar resmi di sistem CETAS
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak Berkas
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: KLARIFIKASI NILAI */}
            {activeTab === "protes" && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Saluran Klarifikasi & Sanggah Nilai Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulir resmi dewan hakim juri khusus untuk pasukan <strong>{authAttendee.fullName}</strong>
                  </p>
                </div>

                {protesForm.submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-black text-emerald-900">
                      Pengajuan Klarifikasi Pasukan Berhasil Diteruskan!
                    </h4>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Sekretariat panitia telah menerima data sanggahan dan akan segera menghubungi pelatih melalui nomor WhatsApp {authAttendee.phone}.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setProtesForm({ ...protesForm, submitted: true });
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Aspek Penilaian yang Ingin Diklarifikasi:
                      </label>
                      <select
                        value={protesForm.aspek}
                        onChange={(e) => setProtesForm({ ...protesForm, aspek: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500 font-semibold"
                      >
                        <option value="Pos 1 - PBB Murni">Pos 1 - PBB Murni</option>
                        <option value="Pos 2 - Variasi & Formasi">Pos 2 - Variasi & Formasi</option>
                        <option value="Pos 3 - Komandan Peleton (Danton)">Pos 3 - Komandan Peleton (Danton)</option>
                        <option value="Pos 4 - Kostum & Kerapihan">Pos 4 - Kostum & Kerapihan</option>
                        <option value="Pinalti Lapangan">Pinalti Lapangan (Waktu / Garis)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Catatan & Alasan Klarifikasi Pelatih:
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Jelaskan secara spesifik alasan klarifikasi sesuai pengamatan saat pasukan tampil..."
                        value={protesForm.alasan}
                        onChange={(e) => setProtesForm({ ...protesForm, alasan: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-500 text-[11px]">
                      <div>
                        Pelatih: <strong className="text-slate-800">{authAttendee.coachName || authAttendee.fullName}</strong>
                      </div>
                      <div>
                        No. WhatsApp: <strong className="text-slate-800">{authAttendee.phone}</strong>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 shadow-md shadow-purple-600/30 transition"
                      >
                        Kirimkan Klarifikasi ke Dewan Juri
                      </button>

                      <a
                        href={`https://wa.me/6281584682345?text=Halo%20Sekretariat%20Juri%20CETAS%2C%20saya%20pelatih%20dari%20${encodeURIComponent(authAttendee.institution)}%20(${encodeURIComponent(authAttendee.fullName)})%20ingin%20klarifikasi%20aspek%20${encodeURIComponent(protesForm.aspek)}.%20Catatan%3A%20${encodeURIComponent(protesForm.alasan || "Mohon verifikasi lembar nilai juri.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-5 py-3 shadow-md transition"
                      >
                        <MessageCircle className="h-4 w-4 fill-white" />
                        Klarifikasi Langsung via WhatsApp
                      </a>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------------- */}
      {/* MODAL: PRATINJAU E-SERTIFIKAT RESMI BER-QR */}
      {/* --------------------------------------------------------------------------------- */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300/60 overflow-hidden my-8 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Pratinjau E-Sertifikat Resmi CETAS (Ber-QR Code)</span>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Certificate Canvas / Container */}
            <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 relative">
              {/* Ornate Gold Border Inner */}
              <div className="absolute inset-4 border-2 border-dashed border-amber-400/50 rounded-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-widest">
                  ★ SERTIFIKAT DIGITAL RESMI TURNAMEN ★
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {certType === "PELATIH" && "SERTIFIKAT PEMBINA / PELATIH TERBAIK"}
                    {certType === "DANTON" && "SERTIFIKAT KOMANDAN PELETON (DANTON)"}
                    {certType === "PASUKAN" && "SERTIFIKAT KONTINGEN & ANGGOTA PASUKAN"}
                    {certType === "JUARA" && "PIAGAM PENGHARGAAN JUARA KONTINGEN"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Diberikan atas partisipasi dan dedikasi luar biasa dalam ajang turnamen resmi
                  </p>
                </div>

                <div className="py-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dianugerahkan Kepada:</span>
                  <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-1 font-serif">
                    {certType === "PELATIH" && (authAttendee.coachName || authAttendee.fullName)}
                    {certType === "DANTON" && (authAttendee.dantonName || "Komandan Peleton")}
                    {certType === "PASUKAN" && authAttendee.fullName}
                    {certType === "JUARA" && authAttendee.institution}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {authAttendee.institution} ({authAttendee.category})
                  </div>
                </div>

                {/* Event Name */}
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed italic">
                  &ldquo;Telah menunjukkan integritas baris-berbaris, kedisiplinan, kekompakan formasi, serta kepemimpinan unggul dalam kejuaraan {authEvent?.title || "LKBB CETAS NASIONAL 2026"}.&rdquo;
                </p>

                {/* QR Code Validation Badge */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-200/80">
                  <div className="flex items-center gap-3 text-left">
                    {certQrUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={certQrUrl} alt="Certificate QR" className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-1" />
                    ) : (
                      <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                        QR Valid
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500">
                      <div className="font-mono font-bold text-slate-800">{authAttendee.badgeCode}</div>
                      <div>Tanda Tangan Digital SHA-256</div>
                      <div className="text-emerald-600 font-bold">✓ Terverifikasi Asli CETAS</div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-600 space-y-1">
                    <div className="font-bold">Ketua Dewan Juri CETAS</div>
                    <div className="font-serif italic text-slate-800 text-xs">M. Rian Arifin, S.Pd., M.Han</div>
                    <div className="text-slate-400">NIP. 19880412 201101 1 003</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSendEmailCertificate}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                <Mail className="h-4 w-4" />
                Kirim Salinan ke Email
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PelatihPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFBFE] flex items-center justify-center p-4">
          <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PelatihPortalContent />
    </Suspense>
  );
}
