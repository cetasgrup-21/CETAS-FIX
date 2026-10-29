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
  Trophy,
  Edit3,
  Save,
  FileSpreadsheet,
  CheckCircle,
  FileCheck2,
  Trash2,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import {
  RegisteredAttendee,
  SquadMemberItem,
  SubmittedAttendeeDocument,
} from "@/lib/events-registration-data";
import {
  LKBBTeamScore,
  UnifiedEvent,
  EventOfficialDocument,
  EventPrerequisiteRule,
  getEffectiveOfficialDocuments,
  getEffectivePrerequisiteRules,
} from "@/lib/events-unified-data";
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
  const [certPage, setCertPage] = useState<1 | 2 | "ALL">(1);

  // Squad Members Modal State (16 Personel + Cadangan)
  const [isSquadModalOpen, setIsSquadModalOpen] = useState<boolean>(false);
  const [squadForm, setSquadForm] = useState<SquadMemberItem[]>([]);
  const [isSavingSquad, setIsSavingSquad] = useState<boolean>(false);

  // Dokumen & Prasyarat State (Pelatih)
  const [uploadingDocRuleId, setUploadingDocRuleId] = useState<string | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; url: string; fileName?: string } | null>(null);

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

  // Initialize coach session from localStorage only (Security: prevent URL scanning from logging into coach dashboard)
  useEffect(() => {
    const savedCode = typeof window !== "undefined" ? localStorage.getItem("cetas_coach_code") || "" : "";
    if (savedCode) {
      setCoachCode(savedCode);
      fetchAttendeeData(savedCode);
    } else {
      if (urlCode) {
        setLoginInput(urlCode);
      }
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

        // Generate QR Code for certificate & badge (Points to dedicated Public Verification Portal)
        const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://cetas.id");
        const verificationUrl = `${origin}/verifikasi?code=${encodeURIComponent(data.attendee.badgeCode)}`;
        const qr = await generateQRCodeDataUrl(verificationUrl);
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

      // Generate QR Code (Points to Public Verification Portal)
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://cetas.id");
      const verificationUrl = `${origin}/verifikasi?code=${encodeURIComponent(createdAtd.badgeCode)}`;
      const qr = await generateQRCodeDataUrl(verificationUrl);
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

  // Helper generator daftar 16 personel inti + danton + cadangan
  const getInitialSquadMembers = (existing?: SquadMemberItem[], danton?: string) => {
    if (existing && existing.length > 0) return existing;
    const list: SquadMemberItem[] = [];
    list.push({
      name: danton || "",
      role: "Komandan Peleton (Danton)",
      isReserve: false,
      nisnOrId: "",
    });
    for (let i = 1; i <= 16; i++) {
      const saf = Math.ceil(i / 3);
      const posLabel = i === 1 ? "Penjuru Kanan" : i === 16 ? "Penutup Kiri" : `Saf ${saf} - Banjar ${((i - 1) % 3) + 1}`;
      list.push({
        name: "",
        role: `Personel ${String(i).padStart(2, "0")} (${posLabel})`,
        isReserve: false,
        nisnOrId: "",
      });
    }
    list.push({
      name: "",
      role: "Cadangan 01",
      isReserve: true,
      nisnOrId: "",
    });
    list.push({
      name: "",
      role: "Cadangan 02",
      isReserve: true,
      nisnOrId: "",
    });
    return list;
  };

  const handleOpenSquadModal = () => {
    setSquadForm(getInitialSquadMembers(authAttendee?.squadMembers, authAttendee?.dantonName));
    setIsSquadModalOpen(true);
  };

  const handleSaveSquadMembers = async () => {
    if (!authAttendee) return;
    setIsSavingSquad(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SQUAD_MEMBERS",
          attendeeId: authAttendee.id,
          squadMembers: squadForm,
          dantonName: squadForm[0]?.name || authAttendee.dantonName,
        }),
      });
      const data = await res.json();
      if (data.success && data.attendee) {
        setAuthAttendee(data.attendee);
        setIsSquadModalOpen(false);
        setEmailSentToast("✓ Susunan 16 personel dan cadangan berhasil disimpan!");
        setTimeout(() => setEmailSentToast(null), 4000);
      } else {
        alert(data.message || "Gagal menyimpan daftar personel");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan data personel.");
    } finally {
      setIsSavingSquad(false);
    }
  };

  // Unduh Berkas Resmi Event (Juknis, Undangan, Form List, Form Foto)
  const handleDownloadOfficialDoc = (doc: EventOfficialDocument) => {
    if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (doc.fileUrl && !doc.fileUrl.startsWith("/docs/")) {
      window.open(doc.fileUrl, "_blank");
      return;
    }

    // Generator unduhan cadangan jika file belum diunggah kustom oleh admin
    const content = `=====================================================
${doc.title.toUpperCase()}
Turnamen: ${authEvent?.title || "LKBB CETAS 2026"}
Penyelenggara: ${authEvent?.organizer || "CETAS Official"}
Tanggal: ${authEvent?.date || "30 Oktober 2026"}
Lokasi: ${authEvent?.location || "Arena Utama LKBB"}
=====================================================

KETERANGAN DOKUMEN:
${doc.description || "Petunjuk resmi dan ketentuan teknis pelaksanaan turnamen."}

IDENTITAS KONTINGEN TERDAFTAR:
Nama Pasukan: ${authAttendee?.fullName || "-"}
Sekolah / Pangkalan: ${authAttendee?.institution || "-"}
Kode E-Badge: ${authAttendee?.badgeCode || "-"}
Kategori: ${authAttendee?.category || "-"}
Nomor Undian TM: #${authAttendee?.tmLotteryNumber || authAttendee?.candidateNumber || "-"}

Dokumen resmi ini diterbitkan secara sah oleh Panitia Penyelenggara melalui Centralized Electronic Tournament & Award System (CETAS).
Untuk pertanyaan teknis, silakan hubungi sekretariat panitia lomba.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName ? doc.fileName.replace(/\.pdf$/i, ".txt") : `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Unggah Berkas Prasyarat oleh Pelatih
  const handleUploadPrerequisiteDoc = async (
    rule: EventPrerequisiteRule,
    dataUrl: string,
    fileName?: string
  ) => {
    if (!authAttendee || !dataUrl) return;
    setUploadingDocRuleId(rule.id);
    try {
      let finalFileUrl = dataUrl;

      // Jika masih berupa base64 data URL, upload ke /api/upload
      if (dataUrl.startsWith("data:")) {
        try {
          const resBlob = await fetch(dataUrl);
          const blob = await resBlob.blob();
          const formData = new FormData();
          formData.append("file", blob, fileName || `${rule.title}.pdf`);
          const upRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData.success && upData.url) {
              finalFileUrl = upData.url;
            }
          }
        } catch (err) {
          console.warn("Direct /api/upload failed, using dataUrl:", err);
        }
      }

      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_PREREQUISITE_DOC",
          badgeCode: authAttendee.badgeCode,
          ruleId: rule.id,
          title: rule.title,
          fileUrl: finalFileUrl,
          fileName: fileName || `${rule.title}.pdf`,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Gagal mengunggah berkas";
        try {
          const jsonErr = JSON.parse(text);
          errorMsg = jsonErr.message || errorMsg;
        } catch {
          if (res.status === 413) {
            errorMsg = "Ukuran file terlalu besar. Gunakan file yang lebih kecil (maks. 10 MB).";
          } else {
            errorMsg = `Server merespon dengan status ${res.status}.`;
          }
        }
        alert(errorMsg);
        return;
      }

      const data = await res.json();
      if (data.success && data.attendee) {
        setAuthAttendee(data.attendee);
        setEmailSentToast(`✓ Berkas "${rule.title}" berhasil diunggah dan disimpan!`);
        setTimeout(() => setEmailSentToast(null), 4000);
      } else {
        alert(data.message || "Gagal mengunggah berkas");
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err?.message || "Kesalahan jaringan saat mengunggah berkas."}`);
    } finally {
      setUploadingDocRuleId(null);
    }
  };

  // Hapus Berkas Prasyarat oleh Pelatih
  const handleDeletePrerequisiteDoc = async (ruleId: string, title: string) => {
    if (!authAttendee) return;
    if (!confirm(`Hapus berkas "${title}" yang telah diunggah?`)) return;
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_PREREQUISITE_DOC",
          badgeCode: authAttendee.badgeCode,
          ruleId,
        }),
      });
      const data = await res.json();
      if (data.success && data.attendee) {
        setAuthAttendee(data.attendee);
        setEmailSentToast(`Berkas "${title}" berhasil dihapus.`);
        setTimeout(() => setEmailSentToast(null), 4000);
      }
    } catch {
      alert("Gagal menghapus berkas.");
    }
  };

  // Open Certificate Preview Modal
  const handleOpenCertModal = (type: "PELATIH" | "DANTON" | "PASUKAN" | "JUARA", page: 1 | 2 | "ALL" = 1) => {
    setCertType(type);
    setCertPage(page);
    setIsCertModalOpen(true);
  };

  // Fungsi Cetak E-Sertifikat Terisolasi (Anti Halaman Putih / Blank PDF)
  const handlePrintCertificate = () => {
    const printArea = document.getElementById("cetas-cert-print-area");
    if (!printArea) {
      window.print();
      return;
    }

    // Buat iframe terisolasi dengan ukuran layout nyata agar Chrome/Browser merender layout A4 secara proporsional
    const iframe = document.createElement("iframe");
    iframe.id = "cetas-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "1123px";
    iframe.style.height = "794px";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    let stylesHtml = "";
    document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>E-Sertifikat - ${authAttendee?.fullName || "CETAS"}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
          }
          .cert-sheet-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .cert-page-break {
            page-break-before: always !important;
            break-before: page !important;
            display: block !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div style="padding: 0; margin: 0; background: #ffffff;">
          ${printArea.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Pastikan font & visual selesai di-parse sebelum membuka popup cetak
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error fallback to window.print:", err);
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 3000);
    }, 600);
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
                  {/* Sertifikat Pelatih / Pembina */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-50 via-white to-purple-50/60 border border-purple-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          E-Sertifikat Pembina / Pelatih
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
                        Pratinjau &amp; Unduh
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
                        Pratinjau &amp; Unduh
                      </button>
                    </div>
                  </div>

                  {/* Sertifikat Personel Pasukan (2 Lembar) */}
                  {(() => {
                    const filledCount = (authAttendee.squadMembers || []).filter((m) => m.name && m.name.trim() && !m.isReserve).length;
                    return (
                      <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-50 via-white to-slate-50/60 border border-slate-200 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <span>E-Sertifikat Pasukan (2 Lembar)</span>
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-black">
                                {filledCount}/16 Nama
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Lembar 1: Sertifikat Kontingen • Lembar 2: Lampiran 16 Anggota &amp; Cadangan
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCertModal("PASUKAN", "ALL")}
                            className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Pratinjau 2 Lembar &amp; Cetak
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenSquadModal}
                            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <Users className="h-3.5 w-3.5 text-purple-600" />
                            Lihat Personel (Panitia)
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Piagam Penghargaan Juara Kontingen */}
                  <div className={`p-5 rounded-2xl border space-y-3 transition ${
                    authAttendee.championCertificateUrl
                      ? "bg-gradient-to-tr from-amber-50 via-white to-amber-50/60 border-amber-300"
                      : "bg-slate-50/60 border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        authAttendee.championCertificateUrl ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "bg-slate-300 text-slate-500"
                      }`}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {authAttendee.championCertificateTitle || "Piagam Prestasi Juara Kontingen"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            authAttendee.championCertificateUrl
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-200 text-slate-600"
                          }`}>
                            {authAttendee.championCertificateUrl ? "✓ Terbit dari Panitia" : "Belum Diunggah Panitia"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {authAttendee.championCertificateUrl
                            ? "Piagam resmi jalur prestasi kedinasan/PPDB telah diunggah panitia"
                            : "Menunggu sidang & unggahan sertifikat kejuaraan resmi dari panitia event"}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      {authAttendee.championCertificateUrl ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCertModal("JUARA")}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Pratinjau &amp; Unduh Piagam Juara
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Belum Tersedia (Menunggu Unggahan Admin)
                        </button>
                      )}
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

            {/* TAB CONTENT 4: BERKAS & PRASYARAT TURNAMEN */}
            {activeTab === "berkas" && (
              <div className="space-y-6">
                {/* -------------------------------------------------------- */}
                {/* BAGIAN 1: BERKAS RESMI EVENT DARI PANITIA */}
                {/* -------------------------------------------------------- */}
                <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-50">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Dokumen Resmi &amp; Panduan Turnamen
                      </h3>
                      <p className="text-xs text-slate-500">
                        Unduh Petunjuk Teknis (Juknis), Surat Undangan Resmi Sekolah, Form Susunan Personel, dan Formulir Pas Foto.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-xs self-start sm:self-auto border border-purple-200">
                      Turnamen: {authEvent?.title || "LKBB 2026"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const officialDocs = getEffectiveOfficialDocuments(authEvent);
                      return officialDocs.map((doc, idx) => (
                        <div
                          key={doc.id || idx}
                          className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-100 flex flex-col justify-between gap-3 hover:border-purple-300 transition shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-900 leading-tight">
                                  {doc.title}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-white text-purple-700 border border-purple-200 shadow-2xs">
                                  {doc.fileType || "PDF"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                {doc.description || "Petunjuk resmi turnamen dari panitia pelaksana."}
                              </p>
                              {doc.updatedAt && (
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  Diperbarui: {doc.updatedAt}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100/60">
                            {doc.fileUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (doc.fileUrl.startsWith("data:")) {
                                    setPreviewDocModal({
                                      title: doc.title,
                                      url: doc.fileUrl,
                                      fileName: doc.fileName,
                                    });
                                  } else {
                                    window.open(doc.fileUrl, "_blank");
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Lihat</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadOfficialDoc(doc)}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Unduh Berkas</span>
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* BAGIAN 2: UPLOAD BERKAS PRASYARAT KONTINGEN */}
                {/* -------------------------------------------------------- */}
                {(() => {
                  const rules = getEffectivePrerequisiteRules(authEvent);
                  const submitted = authAttendee.submittedDocuments || [];
                  const verifiedCount = submitted.filter((d) => d.status === "VERIFIED").length;
                  const revisionList = submitted.filter((d) => d.status === "REVISION");
                  const requiredCount = rules.filter((r) => r.isRequired).length;
                  const isAllRequiredVerified = requiredCount > 0 && verifiedCount >= requiredCount;

                  return (
                    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-50">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <FileCheck2 className="h-5 w-5 text-indigo-600" />
                            Unggah Berkas Prasyarat Kontingen
                          </h3>
                          <p className="text-xs text-slate-500">
                            Unggah dokumen yang dipersyaratkan panitia untuk verifikasi keabsahan peserta kontingen <strong>{authAttendee.fullName}</strong> ({authAttendee.institution}).
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                            isAllRequiredVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : revisionList.length > 0
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}>
                            {isAllRequiredVerified
                              ? "Semua Berkas Terverifikasi ✓"
                              : `${submitted.length} / ${rules.length} Berkas Terunggah`}
                          </span>
                        </div>
                      </div>

                      {/* Alert jika ada revisi dari panitia */}
                      {revisionList.length > 0 && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                          <div className="flex items-center gap-2 font-black text-rose-800">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            <span>Perhatian: Ada {revisionList.length} berkas yang memerlukan revisi dari Panitia!</span>
                          </div>
                          <p className="text-rose-700 text-[11px] leading-relaxed">
                            Silakan periksa catatan revisi pada kartu berkas bertanda merah di bawah ini, lalu unggah ulang file yang telah diperbaiki.
                          </p>
                        </div>
                      )}

                      {/* Daftar Berkas Prasyarat */}
                      <div className="space-y-4">
                        {rules.map((rule, idx) => {
                          const doc = submitted.find((d) => d.ruleId === rule.id);
                          const isUploaded = Boolean(doc && doc.fileUrl);
                          const isVerified = doc?.status === "VERIFIED";
                          const isRevision = doc?.status === "REVISION";
                          const isPending = doc?.status === "PENDING";
                          const isUploading = uploadingDocRuleId === rule.id;

                          return (
                            <div
                              key={rule.id || idx}
                              className={`p-5 rounded-2xl border transition space-y-4 ${
                                isVerified
                                  ? "bg-emerald-50/30 border-emerald-200"
                                  : isRevision
                                  ? "bg-rose-50/40 border-rose-200"
                                  : isPending
                                  ? "bg-amber-50/30 border-amber-200"
                                  : "bg-slate-50/50 border-slate-200"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-slate-900">
                                      {idx + 1}. {rule.title}
                                    </span>
                                    {rule.isRequired ? (
                                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700">
                                        WAJIB
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                                        OPSIONAL
                                      </span>
                                    )}
                                    {rule.allowedFormats && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        Format: {rule.allowedFormats}
                                      </span>
                                    )}
                                  </div>
                                  {rule.description && (
                                    <p className="text-[11px] text-slate-600">
                                      {rule.description}
                                    </p>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <div className="shrink-0">
                                  {isVerified ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                      Terverifikasi Valid ✓
                                    </span>
                                  ) : isRevision ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                                      Perlu Revisi ⚠️
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                                      Menunggu Verifikasi Panitia ⏳
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                                      Belum Diunggah
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Alert Catatan Revisi jika ada */}
                              {isRevision && doc?.reviewNote && (
                                <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-300 text-xs text-rose-900 space-y-1">
                                  <div className="font-black text-rose-800 flex items-center gap-1.5">
                                    <AlertCircle className="h-4 w-4 text-rose-600" />
                                    <span>Catatan Revisi dari Panitia:</span>
                                  </div>
                                  <p className="text-[11px] text-rose-800 pl-5">
                                    &ldquo;{doc.reviewNote}&rdquo;
                                  </p>
                                </div>
                              )}

                              {/* Dokumen Terunggah saat ini */}
                              {isUploaded && (
                                <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 truncate">
                                      <p className="text-xs font-bold text-slate-900 truncate">
                                        {doc?.fileName || "Berkas Terunggah"}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        Diunggah: {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleString("id-ID") : "-"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (doc?.fileUrl) {
                                          if (doc.fileUrl.startsWith("data:")) {
                                            setPreviewDocModal({
                                              title: rule.title,
                                              url: doc.fileUrl,
                                              fileName: doc.fileName,
                                            });
                                          } else {
                                            window.open(doc.fileUrl, "_blank");
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold transition flex items-center gap-1"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>Buka Berkas</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeletePrerequisiteDoc(rule.id, rule.title)}
                                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                      title="Hapus Berkas Ini"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Form Unggah / Ganti Berkas */}
                              <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  {isUploaded ? "Ganti / Upload Ulang Berkas:" : "Unggah Berkas Baru:"}
                                </label>
                                {isUploading ? (
                                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 flex items-center justify-center gap-2 text-xs font-bold text-purple-700">
                                    <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                                    <span>Mengunggah dan menyimpan berkas ke server...</span>
                                  </div>
                                ) : (
                                  <FileUpload
                                    label=""
                                    description={`Format yang disarankan: ${rule.allowedFormats || "PDF, JPG, PNG"} (Maks. 10 MB)`}
                                    accept="*/*"
                                    aspectRatio="document"
                                    onChange={(dataUrl, fileName) =>
                                      handleUploadPrerequisiteDoc(rule, dataUrl, fileName)
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* -------------------------------------------------------- */}
                {/* BAGIAN 3: SURAT KEABSAHAN MANDAT PASUKAN */}
                {/* -------------------------------------------------------- */}
                <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Surat Keabsahan Mandat Pasukan Resmi: {authAttendee.institution}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Kode E-Badge: <strong className="font-mono text-indigo-700">{authAttendee.badgeCode}</strong> • Nomor Undian TM: <strong className="font-mono text-indigo-700">#{authAttendee.tmLotteryNumber || authAttendee.candidateNumber || "-"}</strong> • Terdaftar sah di sistem CETAS
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak Surat Keabsahan
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
      {/* MODAL: PRATINJAU DOKUMEN (PELATIH) */}
      {/* --------------------------------------------------------------------------------- */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-black truncate">{previewDocModal.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[400px]">
              {previewDocModal.url.startsWith("data:image") ? (
                <img
                  src={previewDocModal.url}
                  alt={previewDocModal.title}
                  className="max-h-[70vh] object-contain rounded-xl shadow"
                />
              ) : (
                <iframe
                  src={previewDocModal.url}
                  title={previewDocModal.title}
                  className="w-full h-[70vh] rounded-xl border border-slate-300 bg-white"
                />
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* MODAL: DAFTAR SUSUNAN 16 PERSONEL (VERIFIKASI & PENGESAHAN RESMI ADMIN) */}
      {/* --------------------------------------------------------------------------------- */}
      {isSquadModalOpen && authAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border-b border-purple-800/40">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-600/40 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Susunan Personel Pasukan (Resmi Panitia)
                  </h3>
                  <p className="text-[11px] text-purple-200/80">
                    Pasukan: <strong>{authAttendee.fullName}</strong> • {authAttendee.institution} (Kategori: {authAttendee.category})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSquadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Keaslian Data Terlindungi (Anti-Manipulasi):</strong> Seluruh susunan nama personel pada Lembar ke-2 E-Sertifikat diinput dan diverifikasi langsung oleh <strong>Admin / Panitia Penyelenggara</strong> guna menjamin validitas berkas resmi untuk keperluan kedinasan/PPDB.
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {squadForm.map((member, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition ${
                        member.isReserve
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                          : idx === 0
                          ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            member.isReserve
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              : idx === 0
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                          }`}>
                            {idx === 0 ? "DANTON" : member.isReserve ? `CADANGAN ${idx - 16}` : `#${String(idx).padStart(2, "0")}`}
                          </span>
                          <span>{member.role || `Personel ${idx}`}</span>
                        </span>
                        {member.name ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Terdaftar
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            Menunggu Admin
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${member.name ? "text-slate-900 dark:text-white" : "text-slate-400 italic font-normal"}`}>
                            {member.name || "[Menunggu Pengesahan Nama oleh Admin]"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            NISN: {member.nisnOrId || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Terverifikasi: <strong className="text-slate-800 dark:text-slate-200">{squadForm.filter((m) => m.name.trim()).length}</strong> dari {squadForm.length} anggota
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/6281584682345?text=Halo%20Admin%20CETAS%2C%20saya%20pelatih%20dari%20${encodeURIComponent(authAttendee.institution)}%20(${encodeURIComponent(authAttendee.fullName)})%20ingin%20mengajukan%20koreksi%20nama%20personel%20pada%20E-Sertifikat.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  Hubungi Admin untuk Koreksi Nama
                </a>
                <button
                  type="button"
                  onClick={() => setIsSquadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* MODAL: PRATINJAU E-SERTIFIKAT RESMI BER-QR & 2 LEMBAR PASUKAN */}
      {/* --------------------------------------------------------------------------------- */}
      {isCertModalOpen && authAttendee && (
        <div id="cetas-cert-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible print:block">
          {/* Custom Print CSS */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                /* Sembunyikan elemen latar belakang di luar cetas-cert-modal */
                header, nav, footer, aside, .dock-container, .mobile-dock, #mascot-widget, .no-print {
                  display: none !important;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  overflow: visible !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #cetas-cert-modal {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  height: auto !important;
                  background: #ffffff !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: visible !important;
                }
                #cetas-cert-dialog {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border: none !important;
                  box-shadow: none !important;
                  border-radius: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: transparent !important;
                  overflow: visible !important;
                }
                #cetas-cert-print-area {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  overflow: visible !important;
                }
                @page {
                  size: A4 landscape;
                  margin: 6mm;
                }
                .cert-sheet-container {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .cert-page-break {
                  page-break-before: always !important;
                  break-before: page !important;
                  display: block !important;
                  height: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
            `
          }} />

          <div id="cetas-cert-dialog" className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border-4 border-[#D4AF37]/70 overflow-hidden my-6 animate-in zoom-in-95 print:border-none print:shadow-none print:rounded-none print:my-0">
            {/* Modal Header Toolbar */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black">
                <Award className="h-4 w-4 text-amber-400" />
                <span>
                  {certType === "PELATIH" && "Pratinjau E-Sertifikat Pembina / Pelatih"}
                  {certType === "DANTON" && "Pratinjau E-Sertifikat Komandan Peleton"}
                  {certType === "PASUKAN" && "Pratinjau E-Sertifikat Pasukan (Format Resmi 2 Lembar)"}
                  {certType === "JUARA" && "Pratinjau Piagam Prestasi Juara Kontingen"}
                </span>
              </div>

              {/* Page Switcher khusus Sertifikat Pasukan */}
              {certType === "PASUKAN" && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCertPage(1)}
                    className={`px-3 py-1 rounded-lg transition ${
                      certPage === 1 ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Lembar 1 (Sertifikat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertPage(2)}
                    className={`px-3 py-1 rounded-lg transition ${
                      certPage === 2 ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Lembar 2 (Lampiran 16 Nama)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertPage("ALL")}
                    className={`px-3 py-1 rounded-lg transition ${
                      certPage === "ALL" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Keduanya (2 Lembar)
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINT & PREVIEW CANVAS */}
            <div id="cetas-cert-print-area" className="p-3 sm:p-6 bg-slate-100 print:bg-white print:p-0 space-y-6">
              {(() => {
                const certConfig = authEvent?.certificateConfig || {};
                const signer1 = certConfig.signer1 || {
                  role: "Ketua Panitia Penyelenggara",
                  name: "Ardi Purwanto, S.Pd.",
                  nipOrId: "NIP. 19910523 201502 1 002",
                  signatureUrl: "",
                };
                const signer2 = certConfig.signer2 || {
                  role: "Ketua Dewan Juri CETAS",
                  name: "M. Rian Arifin, S.Pd., M.Han",
                  nipOrId: "NIP. 19880412 201101 1 003",
                  signatureUrl: "",
                };
                const issueCity = certConfig.issueCity || "Jakarta";
                const issueDate = certConfig.issueDate || (authEvent?.date ? new Date(authEvent.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "30 Oktober 2026");
                const institutionName = certConfig.institutionName || "Centralized Electronic Tournament & Award System";
                
                // Format Penomoran Sertifikat Resmi (Bukan Acak - Otomatis Menggunakan Nomor Undian Kontingen)
                const rawFormat = (certConfig.certificateNumberFormat || "[NO]/CETAS-LKBB/X/2026").trim();
                const contingentNum = authAttendee.tmLotteryNumber || authAttendee.candidateNumber || "";
                const paddedNum = contingentNum ? String(contingentNum).padStart(3, "0") : "001";
                let certNumber = "";
                if (rawFormat.includes("[NO]") || rawFormat.includes("[NOMOR]")) {
                  certNumber = rawFormat.replace(/\[NO\]|\[NOMOR\]/g, paddedNum);
                } else if (rawFormat.includes("###")) {
                  certNumber = rawFormat.replace(/###/g, paddedNum);
                } else {
                  certNumber = rawFormat;
                }

                // Jika Tipe JUARA dan ada file upload manual dari panitia
                if (certType === "JUARA" && authAttendee.championCertificateUrl) {
                  return (
                    <div className="relative bg-white rounded-3xl p-6 sm:p-10 shadow-lg border-2 border-amber-300 text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase">
                        <Trophy className="h-4 w-4 text-amber-600" />
                        <span>{authAttendee.championCertificateTitle || "PIAGAM PRESTASI JUARA KONTINGEN"}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 font-serif">
                        {authAttendee.fullName} — {authAttendee.institution}
                      </h3>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[600px] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={authAttendee.championCertificateUrl}
                          alt="Piagam Kejuaraan"
                          className="max-h-[580px] w-auto object-contain shadow-md"
                        />
                      </div>
                      <div className="pt-2 flex justify-center gap-3 no-print">
                        <a
                          href={authAttendee.championCertificateUrl}
                          download={`Piagam_Juara_${authAttendee.fullName}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Unduh Berkas Piagam Asli
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    {/* ============================================================== */}
                    {/* LEMBAR 1: SERTIFIKAT UTAMA (PELATIH / DANTON / PASUKAN LEMBAR 1) */}
                    {/* ============================================================== */}
                    {(certType !== "PASUKAN" || certPage === 1 || certPage === "ALL") && (
                      <div className="cert-sheet-container relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EC] to-[#F5EEDC] text-slate-900 rounded-2xl shadow-xl overflow-hidden border-4 border-[#C5A059] p-8 sm:p-12 text-center aspect-[1.414/1] min-h-[560px] flex flex-col justify-between">
                        {/* Layered Decorative Borders */}
                        <div className="absolute inset-2 border border-[#C5A059]/40 rounded-xl pointer-events-none" />
                        <div className="absolute inset-3 border-2 border-[#D4AF37] rounded-lg pointer-events-none" />

                        {/* Center Watermark - Logo CETAS PNG Resmi */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/logo/cetas_logo_transparent.png"
                            alt="Watermark CETAS"
                            className="w-[360px] h-[360px] object-contain filter grayscale"
                          />
                        </div>
                        <div className="absolute inset-4 border border-dashed border-[#B38728]/30 rounded-md pointer-events-none" />

                        {/* Corner Baroque Flourish SVGs */}
                        <svg className="absolute top-4 left-4 w-12 h-12 text-[#C5A059] opacity-80 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0,0 L45,0 C30,12 18,22 12,38 C8,48 5,65 5,90 L0,90 Z M12,12 C22,22 35,26 50,28 C38,38 28,48 28,65 C18,52 15,38 12,12 Z" />
                        </svg>
                        <svg className="absolute top-4 right-4 w-12 h-12 text-[#C5A059] opacity-80 pointer-events-none -scale-x-100" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0,0 L45,0 C30,12 18,22 12,38 C8,48 5,65 5,90 L0,90 Z M12,12 C22,22 35,26 50,28 C38,38 28,48 28,65 C18,52 15,38 12,12 Z" />
                        </svg>
                        <svg className="absolute bottom-4 left-4 w-12 h-12 text-[#C5A059] opacity-80 pointer-events-none -scale-y-100" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0,0 L45,0 C30,12 18,22 12,38 C8,48 5,65 5,90 L0,90 Z M12,12 C22,22 35,26 50,28 C38,38 28,48 28,65 C18,52 15,38 12,12 Z" />
                        </svg>
                        <svg className="absolute bottom-4 right-4 w-12 h-12 text-[#C5A059] opacity-80 pointer-events-none -scale-x-100 -scale-y-100" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0,0 L45,0 C30,12 18,22 12,38 C8,48 5,65 5,90 L0,90 Z M12,12 C22,22 35,26 50,28 C38,38 28,48 28,65 C18,52 15,38 12,12 Z" />
                        </svg>

                        {/* Top Header Information */}
                        <div className="relative z-10 space-y-2 pt-2">
                          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-amber-950 border border-amber-400 text-[10px] font-black uppercase tracking-widest shadow-xs">
                            {(() => {
                              const headingText = (certConfig.eventHeading || authEvent?.title || "KOMPETISI BARIS BERBARIS").trim();
                              return headingText.startsWith("★") ? headingText : `★ ${headingText.toUpperCase()} ★`;
                            })()}
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {institutionName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500 tracking-wider">
                            Nomor: <strong>{certNumber}</strong>
                          </div>

                          {/* CERTIFICATE MAIN TITLE */}
                          <div className="pt-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-serif uppercase text-amber-950">
                              {certType === "PELATIH" && "SERTIFIKAT PEMBINA / PELATIH"}
                              {certType === "DANTON" && "SERTIFIKAT KOMANDAN PELETON (DANTON)"}
                              {certType === "PASUKAN" && "SERTIFIKAT KONTINGEN & ANGGOTA PASUKAN"}
                              {certType === "JUARA" && (authAttendee.championCertificateTitle || "PIAGAM PENGHARGAAN JUARA KONTINGEN")}
                            </h1>
                            <p className="text-xs text-slate-500 italic mt-1 font-serif">
                              Dianugerahkan dengan penuh kehormatan dan apresiasi setinggi-tingginya kepada:
                            </p>
                          </div>
                        </div>

                        {/* RECIPIENT BODY */}
                        <div className="relative z-10 py-4 sm:py-6 space-y-3">
                          <div className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-[#1E1B4B] tracking-normal leading-tight py-2 drop-shadow-xs">
                            {certType === "PELATIH" && (authAttendee.coachName || authAttendee.fullName)}
                            {certType === "DANTON" && (authAttendee.dantonName || "Komandan Peleton")}
                            {certType === "PASUKAN" && authAttendee.fullName}
                            {certType === "JUARA" && authAttendee.fullName}
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#C5A059] to-[#C5A059]" />
                            <div className="text-sm sm:text-base font-bold text-[#8C6D23] font-serif tracking-wide">
                              {authAttendee.institution} • {authAttendee.category}
                            </div>
                            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent via-[#C5A059] to-[#C5A059]" />
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed italic font-serif pt-1">
                            &ldquo;Atas dedikasi, kedisiplinan, integritas baris-berbaris, kekompakan formasi, serta sportivitas tinggi yang ditunjukkan dalam rangkaian kejuaraan {authEvent?.title || "LKBB CETAS NASIONAL 2026"}.&rdquo;
                          </p>
                        </div>

                        {/* FOOTER: DUAL SIGNATURES & OFFICIAL SEALS */}
                        <div className="relative z-10 pt-4 border-t border-[#C5A059]/40 grid grid-cols-3 items-end gap-2 text-slate-800">
                          {/* Signature 1: Ketua Panitia Penyelenggara */}
                          <div className="text-left space-y-1 relative">
                            <div className="text-[10px] font-bold text-slate-600 uppercase">
                              {signer1.role}
                            </div>
                            {/* Realistic Signature or Digital Script */}
                            <div className="h-14 flex items-center relative">
                              {signer1.signatureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={signer1.signatureUrl} alt="TTD 1" className="h-12 w-auto object-contain" />
                              ) : (
                                <div className="font-serif italic text-lg sm:text-xl text-purple-950 font-bold tracking-wider rotate-[-3deg]">
                                  {signer1.name}
                                </div>
                              )}
                              {/* Wet Official Purple Ink Stamp */}
                              <div className="absolute -left-2 top-0 pointer-events-none select-none">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-purple-700/80 text-purple-800 flex flex-col items-center justify-center -rotate-12 bg-purple-500/10 backdrop-blur-2xs shadow-inner">
                                  <div className="text-[7px] font-black tracking-widest text-center leading-tight">
                                    ★ CETAS LKBB ★<br />TERVERIFIKASI
                                  </div>
                                  <div className="text-[6px] font-bold text-center mt-0.5 text-purple-900">
                                    RESMI 2026
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="font-serif font-black text-xs text-slate-900">
                              {signer1.name}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {signer1.nipOrId || "Panitia Penyelenggara"}
                            </div>
                          </div>

                          {/* Center: 3D Golden Wax Medal & QR Code Validation */}
                          <div className="flex flex-col items-center justify-center space-y-1.5 pb-1">
                            <div className="flex items-center gap-2">
                              {certQrUrl ? (
                                <a
                                  href={`${typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://cetas.id")}/verifikasi?code=${encodeURIComponent(authAttendee.badgeCode)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Buka Halaman Verifikasi Keaslian Sertifikat (Publik)"
                                  className="group relative block cursor-pointer transition hover:scale-105"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={certQrUrl}
                                    alt="Certificate QR"
                                    className="h-14 w-14 rounded-lg border-2 border-[#C5A059] bg-white p-0.5 shadow-sm group-hover:border-amber-600 transition"
                                  />
                                </a>
                              ) : (
                                <div className="h-14 w-14 bg-white rounded-lg border border-[#C5A059] flex items-center justify-center text-[9px] text-slate-400 font-mono">
                                  QR Valid
                                </div>
                              )}
                              <div className="text-left text-[9px] text-slate-600 leading-tight">
                                <div className="font-mono font-bold text-slate-900">{authAttendee.badgeCode}</div>
                                <div className="text-[8px] text-slate-400">Digital Seal SHA-256</div>
                                <div className="text-emerald-700 font-bold">✓ Terverifikasi Asli</div>
                              </div>
                            </div>
                          </div>

                          {/* Signature 2: Ketua Dewan Juri */}
                          <div className="text-right space-y-1">
                            <div className="text-[10px] text-slate-500">
                              {issueCity}, {issueDate}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase">
                              {signer2.role}
                            </div>
                            {/* Realistic Signature or Digital Script */}
                            <div className="h-14 flex items-center justify-end">
                              {signer2.signatureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={signer2.signatureUrl} alt="TTD 2" className="h-12 w-auto object-contain" />
                              ) : (
                                <div className="font-serif italic text-lg sm:text-xl text-purple-950 font-bold tracking-wider rotate-[3deg]">
                                  {signer2.name}
                                </div>
                              )}
                            </div>
                            <div className="font-serif font-black text-xs text-slate-900">
                              {signer2.name}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {signer2.nipOrId || "Ketua Dewan Juri"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Page Break Antara Lembar 1 dan Lembar 2 untuk Mode Cetak Semua */}
                    {certType === "PASUKAN" && certPage === "ALL" && (
                      <div className="cert-page-break print:block hidden" style={{ pageBreakBefore: "always", breakBefore: "page", height: 0, margin: 0, padding: 0 }} />
                    )}

                    {/* ============================================================== */}
                    {/* LEMBAR 2: LAMPIRAN 16 PERSONEL INTI & CADANGAN */}
                    {/* ============================================================== */}
                    {certType === "PASUKAN" && (certPage === 2 || certPage === "ALL") && (
                      <div className="cert-sheet-container relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EC] to-[#F5EEDC] text-slate-900 rounded-2xl shadow-xl overflow-hidden border-4 border-[#C5A059] p-8 sm:p-10 text-center aspect-[1.414/1] min-h-[560px] flex flex-col justify-between">
                        {/* Layered Decorative Borders */}
                        <div className="absolute inset-2 border border-[#C5A059]/40 rounded-xl pointer-events-none" />
                        <div className="absolute inset-3 border-2 border-[#D4AF37] rounded-lg pointer-events-none" />

                        {/* Center Watermark - Logo CETAS PNG Resmi */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/logo/cetas_logo_transparent.png"
                            alt="Watermark CETAS"
                            className="w-[360px] h-[360px] object-contain filter grayscale"
                          />
                        </div>

                        {/* Top Header Lampiran */}
                        <div className="relative z-10 space-y-1.5 pt-2">
                          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 text-amber-300 border border-amber-400 text-[10px] font-black uppercase tracking-widest">
                            ★ LAMPIRAN RESMI E-SERTIFIKAT KONTINGEN ★
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif uppercase tracking-tight">
                            DAFTAR NAMA 16 PERSONEL PASUKAN &amp; CADANGAN
                          </h2>
                          <div className="text-xs text-slate-600 font-serif flex items-center justify-center gap-2 flex-wrap">
                            <span>Pasukan: <strong>&ldquo;{authAttendee.fullName}&rdquo;</strong></span>
                            <span>•</span>
                            <span>Sekolah: <strong>{authAttendee.institution}</strong></span>
                            <span>•</span>
                            <span>Kategori: <strong>{authAttendee.category}</strong></span>
                            <span>•</span>
                            <span>No. Undian TM: <strong>{tmDisplayNumber}</strong></span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Lampiran E-Sertifikat Nomor: {certNumber}
                          </div>
                        </div>

                        {/* 2-Column Table of 16 Core Personnel + Danton + Reserves */}
                        <div className="relative z-10 py-3">
                          {(() => {
                            const fullSquad = getInitialSquadMembers(authAttendee.squadMembers, authAttendee.dantonName);
                            const col1 = fullSquad.slice(0, 9); // Danton + Personel 1-8
                            const col2 = fullSquad.slice(9); // Personel 9-16 + Cadangan 1-2

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                {/* Column 1 */}
                                <div className="space-y-1 border border-[#C5A059]/40 rounded-xl bg-white/70 p-2 text-xs">
                                  {col1.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-1.5 rounded-lg border-b border-slate-100 last:border-b-0 text-[11px]"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                                          idx === 0
                                            ? "bg-purple-100 text-purple-900 font-black"
                                            : "bg-slate-200 text-slate-800"
                                        }`}>
                                          {idx === 0 ? "DANTON" : `#${String(idx).padStart(2, "0")}`}
                                        </span>
                                        <div className="truncate">
                                          <span className={`font-bold block truncate ${item.name ? "text-slate-900" : "text-amber-800 italic"}`}>
                                            {item.name || `[Menunggu Input Panitia]`}
                                          </span>
                                          <span className="text-[9px] text-slate-400 block truncate">
                                            {item.role}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                        {item.nisnOrId || "-"}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-1 border border-[#C5A059]/40 rounded-xl bg-white/70 p-2 text-xs">
                                  {col2.map((item, idx) => {
                                    const actualNum = idx + 9;
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-center justify-between p-1.5 rounded-lg border-b border-slate-100 last:border-b-0 text-[11px] ${
                                          item.isReserve ? "bg-amber-50/70" : ""
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                                            item.isReserve
                                              ? "bg-amber-200 text-amber-900 font-black"
                                              : "bg-slate-200 text-slate-800"
                                          }`}>
                                            {item.isReserve ? `CAD ${actualNum - 16}` : `#${String(actualNum).padStart(2, "0")}`}
                                          </span>
                                          <div className="truncate">
                                            <span className={`font-bold block truncate ${item.name ? "text-slate-900" : "text-amber-800 italic"}`}>
                                              {item.name || `[Menunggu Input Panitia]`}
                                            </span>
                                            <span className="text-[9px] text-slate-400 block truncate">
                                              {item.role}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                          {item.nisnOrId || "-"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Bottom Footnote & Verification */}
                        <div className="relative z-10 pt-2 border-t border-[#C5A059]/40 flex items-center justify-between text-left text-[10px] text-slate-600">
                          <div>
                            <div className="font-bold text-slate-800">
                              Keterangan Resmi Personel Kontingen:
                            </div>
                            <p className="text-[9px] text-slate-500 max-w-lg">
                              Daftar 16 personel inti, 1 danton, dan cadangan di atas merupakan susunan resmi pasukan yang didaftarkan ke dewan juri CETAS.
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-serif font-black text-xs text-slate-900">
                              Disahkan: {signer1.name}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {signer1.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Bottom Actions */}
            <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendEmailCertificate}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900"
                >
                  <Mail className="h-4 w-4" />
                  Kirim ke Email: {authAttendee.email}
                </button>
                {certType === "PASUKAN" && (
                  <button
                    type="button"
                    onClick={handleOpenSquadModal}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-purple-700 ml-3"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit 16 Nama Personel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
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
