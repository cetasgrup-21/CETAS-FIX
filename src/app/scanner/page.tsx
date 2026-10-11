"use client";

import { useState, useEffect, useRef } from "react";
import {
  Ticket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ShieldCheck,
  Camera,
  CameraOff,
  Volume2,
  RefreshCw,
  UploadCloud,
  ChevronDown,
  Lock,
  LogOut,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { createTicketQRString } from "@/lib/ticket-security";
import { Html5Qrcode } from "html5-qrcode";

export default function GateScannerPage() {
  // Staff Gatekeeper Authentication
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [staffPin, setStaffPin] = useState("");
  const [staffName, setStaffName] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Scanner state
  const [ticketInput, setTicketInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Daftar kamera yang terdeteksi
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const [result, setResult] = useState<{
    status: "SUCCESS" | "DUPLICATE" | "INVALID";
    message: string;
    details?: {
      code: string;
      holder: string;
      tier: string;
      event: string;
      time?: string;
    };
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cek sesi login panitia
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("cetas_staff_auth");
    if (savedAuth === "true") {
      setIsStaffAuthenticated(true);
      setStaffName(sessionStorage.getItem("cetas_staff_name") || "Panitia Gate 1");
    }
  }, []);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPin === "211226" || staffPin === "RezaCetas2026!") {
      const name = staffName.trim() || "REZA ADITYA ARIFIN";
      sessionStorage.setItem("cetas_staff_auth", "true");
      sessionStorage.setItem("cetas_staff_name", name);
      setIsStaffAuthenticated(true);
      setPinError(null);
    } else {
      setPinError("Kode PIN Keamanan salah! Akses ditolak.");
    }
  };

  const handleStaffLogout = () => {
    stopCameraScanner();
    sessionStorage.removeItem("cetas_staff_auth");
    setIsStaffAuthenticated(false);
    setStaffPin("");
    setResult(null);
  };

  // Audio synthesizer beep untuk feedback gate
  const playBeep = (type: "success" | "error") => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        osc.frequency.setValueAtTime(320, audioCtx.currentTime); // Low pitch error
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Muat daftar kamera saat pertama kali dibuka
  useEffect(() => {
    if (!isStaffAuthenticated) return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const camList = devices.map((d) => ({
            id: d.id,
            label: d.label || `Kamera ${d.id.slice(0, 5)}`,
          }));
          setCameras(camList);
          const backCam = camList.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("rear") ||
              c.label.toLowerCase().includes("belakang")
          );
          setSelectedCameraId(backCam ? backCam.id : camList[0].id);
        }
      })
      .catch((err) => {
        console.warn("Camera enumeration info:", err);
      });

    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isStaffAuthenticated, isScanning]);

  const handleVerifyPayload = async (qrPayload: string) => {
    if (!qrPayload.trim() || isVerifying) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await fetch("/api/scanner/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrString: qrPayload.trim(),
          staffId: staffName || "staff-gate-01",
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        playBeep("success");
        setResult({
          status: "SUCCESS",
          message: "Check-in Valid! Silakan masuk ke arena acara.",
          details: {
            code: data.ticket?.code || "CETAS-OK",
            holder: data.ticket?.holderName || "Pemegang Tiket",
            tier: data.ticket?.tierName || "VIP / Regular",
            event: data.ticket?.eventName || "Cetas SoundFest 2026",
            time: new Date().toLocaleTimeString("id-ID"),
          },
        });
      } else if (res.status === 409) {
        playBeep("error");
        setResult({
          status: "DUPLICATE",
          message: data.message || "Tiket ini sudah pernah digunakan!",
          details: {
            code: data.ticketCode || "CETAS-DUP",
            holder: data.holderName || "Tamu",
            tier: data.tierName || "Tiket",
            event: data.eventName || "Acara",
          },
        });
      } else {
        playBeep("error");
        setResult({
          status: "INVALID",
          message: data.message || "Tiket tidak sah atau tanda tangan digital palsu!",
        });
      }
    } catch (err: unknown) {
      playBeep("error");
      const msg = err instanceof Error ? err.message : "Gagal memverifikasi tiket";
      setResult({
        status: "INVALID",
        message: `Kendala verifikasi: ${msg}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Mulai Kamera dengan Fallback Bertingkat
  const startCameraScanner = async () => {
    setScannerError(null);

    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
      }

      const qrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = qrCode;

      let cameraConfig: string | { facingMode: string } = { facingMode: "user" };

      if (selectedCameraId) {
        cameraConfig = selectedCameraId;
      } else {
        const availableDevices = await Html5Qrcode.getCameras().catch(() => []);
        if (availableDevices && availableDevices.length > 0) {
          cameraConfig = availableDevices[0].id;
          setSelectedCameraId(availableDevices[0].id);
        }
      }

      await qrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setTicketInput(decodedText);
          handleVerifyPayload(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn("First camera attempt failed, trying fallback:", err);

      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              setTicketInput(decodedText);
              handleVerifyPayload(decodedText);
            },
            () => {}
          );
          setIsScanning(true);
          return;
        }
      } catch (fallbackErr: unknown) {
        const msg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : err instanceof Error
            ? err.message
            : "Kamera tidak dapat diakses";
        setScannerError(
          `Gagal membuka kamera: ${msg}. Pastikan Anda telah mengklik "Izinkan / Allow" pada izin kamera browser.`
        );
        setIsScanning(false);
      }
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const qrCode = new Html5Qrcode("file-reader-dummy");
      const decodedText = await qrCode.scanFile(file, true);
      setTicketInput(decodedText);
      handleVerifyPayload(decodedText);
    } catch {
      alert("Tidak ditemukan kode QR yang terbaca pada gambar tersebut.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [lastTestQR, setLastTestQR] = useState<string>("");

  const handleTestNewTicket = () => {
    const samplePayload = {
      ticketCode: `CETAS-TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: "ev-01",
      tierId: "tier-01",
      issuedAt: Date.now(),
    };
    const qrStr = createTicketQRString(samplePayload);
    setLastTestQR(qrStr);
    setTicketInput(qrStr);
    handleVerifyPayload(qrStr);
  };

  const handleTestDuplicateTicket = () => {
    if (!lastTestQR) {
      handleTestNewTicket();
      return;
    }
    setTicketInput(lastTestQR);
    handleVerifyPayload(lastTestQR);
  };

  // JIKA BELUM LOGIN SEBAGAI PANITIA: TAMPILKAN LAYAR PENGUNCI KEAMANAN
  if (!isStaffAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
            <Lock className="h-8 w-8" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
              Akses Terbatas • Khusus Panitia
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Portal Scanner Pintu Masuk
            </h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Halaman ini hanya dapat dioperasikan oleh panitia resmi / petugas gatekeeper Cetas. Pengunjung biasa tidak diperkenankan melakukan scan mandiri.
            </p>
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {pinError}
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama / Identitas Petugas
              </label>
              <input
                type="text"
                placeholder="Contoh: Panitia Gate 1 (Budi)"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIN Keamanan Panitia *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN Keamanan Resmi"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Masukkan PIN Otorisasi Resmi dari Super Admin CETAS.
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold py-3 text-xs shadow-md transition active:scale-95"
            >
              <UserCheck className="h-4 w-4" />
              Buka Scanner Sebagai Panitia
            </button>
          </form>
        </div>
      </div>
    );
  }

  // JIKA SUDAH TERVERIFIKASI SEBAGAI PANITIA: TAMPILKAN APLIKASI SCANNER LENGKAP
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      {/* Hidden dummy container untuk file scanner */}
      <div id="file-reader-dummy" className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Staff Session Status Bar */}
      <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Petugas Aktif: <span className="text-orange-600 dark:text-orange-400">{staffName || "Panitia Gate"}</span>
          </span>
        </div>
        <button
          onClick={handleStaffLogout}
          className="flex items-center gap-1 font-bold text-slate-500 hover:text-rose-600 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Kunci Scanner
        </button>
      </div>

      {/* Scanner Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/60 px-3.5 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 border border-orange-200 dark:border-orange-800/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cetas Gatekeeper • Validator Pintu Masuk
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Scanner Validasi Tiket
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan kamera smartphone/webcam atau upload screenshot e-tiket untuk verifikasi instan.
          </p>
        </div>

        {/* Camera Selector Dropdown jika ada lebih dari 1 kamera */}
        {cameras.length > 1 && (
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Pilih Perangkat Kamera
            </label>
            <div className="relative">
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (isScanning) {
                    stopCameraScanner().then(() => startCameraScanner());
                  }
                }}
                className="w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-8"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Live Camera Viewport */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-orange-500" />
              Viewport Kamera
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1.5 text-xs transition"
                title="Scan QR dari file gambar/screenshot"
              >
                <UploadCloud className="h-3.5 w-3.5 text-blue-500" />
                Upload Foto QR
              </button>

              {!isScanning ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 text-xs shadow-md transition"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Nyalakan Kamera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 text-xs transition"
                >
                  <CameraOff className="h-3.5 w-3.5" />
                  Matikan Kamera
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden min-h-[280px] bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
            {/* Wadah khusus Html5Qrcode */}
            <div id="reader" className="w-full h-full min-h-[280px]" />

            {/* Overlay placeholder saat kamera mati */}
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl pointer-events-none">
                <Camera className="h-8 w-8 text-slate-400 stroke-[1.5]" />
                <p>Klik &ldquo;Nyalakan Kamera&rdquo; atau &ldquo;Upload Foto QR&rdquo; untuk memindai tiket</p>
              </div>
            )}
          </div>

          {scannerError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                Izin Akses Kamera Diperlukan
              </div>
              <p className="text-[11px] leading-relaxed">
                {scannerError}
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Tip: Jika menggunakan laptop tanpa webcam atau izin ditolak, Anda bisa menggunakan tombol <strong>&ldquo;Upload Foto QR&rdquo;</strong> atau <strong>&ldquo;1. Tiket Baru&rdquo;</strong> di bawah.
              </p>
            </div>
          )}
        </div>

        {/* Status Hasil Verifikasi */}
        {result && (
          <div
            className={`mb-6 p-5 rounded-2xl border flex items-start gap-3.5 animate-in fade-in zoom-in-95 duration-200 ${
              result.status === "SUCCESS"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                : result.status === "DUPLICATE"
                ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                : "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
            }`}
          >
            {result.status === "SUCCESS" && (
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            {result.status === "DUPLICATE" && (
              <XCircle className="h-7 w-7 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            {result.status === "INVALID" && (
              <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black">{result.message}</h3>
                <Volume2 className="h-4 w-4 opacity-60" />
              </div>
              {result.details && (
                <div className="mt-2 text-xs space-y-1 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-black/10 dark:border-white/10">
                  <div>
                    Nama: <span className="font-bold">{result.details.holder}</span>
                  </div>
                  <div>
                    Kategori: <span className="font-bold text-orange-600 dark:text-orange-400">{result.details.tier}</span>
                  </div>
                  <div>
                    Acara: <span className="font-semibold">{result.details.event}</span>
                  </div>
                  <div className="pt-1 text-[11px] font-mono text-slate-500">
                    Kode Tiket: {result.details.code} • Waktu: {result.details.time}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Manual / Fallback Barcode Scanner */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyPayload(ticketInput);
          }}
          className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Input Manual Kode Tiket / Barcode Scanner Fisik
            </label>
            <input
              type="text"
              placeholder="Contoh: CETAS-TCK-928371 atau paste payload QR..."
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              className="w-full font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold py-2.5 text-xs shadow-md transition"
            >
              <Search className="h-3.5 w-3.5" />
              {isVerifying ? "Memvalidasi..." : "Verifikasi Tiket"}
            </button>
            <button
              type="button"
              onClick={handleTestNewTicket}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold transition"
              title="Generate dan check-in tiket baru"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              1. Tiket Baru
            </button>
            <button
              type="button"
              onClick={handleTestDuplicateTicket}
              disabled={!lastTestQR}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-dashed border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40 text-xs font-bold transition"
              title="Scan ulang tiket yang sama untuk menguji penolakan duplikat"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              2. Scan Ulang (Uji Duplikat)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
