"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Clock, Send, ShieldAlert, CheckCircle2, FileText, Info } from "lucide-react";
import { TournamentTeam } from "./tournament-hub-types";

interface SanggahanModalProps {
  team: TournamentTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SanggahanModal({ team, isOpen, onClose }: SanggahanModalProps) {
  // 15 minutes countdown (900 seconds) standard dispute window
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [category, setCategory] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [videoTimestamp, setVideoTimestamp] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(15 * 60);
      setIsSuccess(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !team) return null;

  const isExpired = secondsLeft === 0;

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B0F19] p-5 sm:p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Portal Sanggahan Resmi</span>
              <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-mono font-semibold">
                SOP CETAS.SCORE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {team.school || team.name} • No. Urut {team.number}
            </p>
          </div>
        </div>

        {/* 15-Minute Countdown Banner */}
        <div
          className={`mb-4 flex items-center justify-between rounded-xl p-3 border ${
            isExpired
              ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
              : "bg-amber-950/30 border-amber-500/30 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className={`h-4 w-4 ${isExpired ? "text-rose-400" : "text-amber-400 animate-pulse"}`} />
            <div>
              <p className="text-xs font-semibold">
                {isExpired ? "Waktu Sanggahan Berakhir" : "Batas Waktu Pengajuan Sanggahan"}
              </p>
              <p className="text-[10px] text-slate-400">
                15 Menit pasca dewan juri mengunci nilai resmi
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-lg font-black font-mono tracking-wider ${
                isExpired ? "text-rose-400" : "text-amber-400"
              }`}
            >
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-white">Sanggahan Berhasil Terkirim!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sanggahan resmi kontingen Anda telah dicatat ke dalam Berita Acara Dewan Hakim. Nomor
              Tiket Sanggahan: <strong className="text-cyan-400 font-mono">SGH-{team.number}-{Date.now().toString().slice(-4)}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 text-xs font-semibold"
            >
              Tutup Modal
            </button>
          </div>
        ) : isExpired ? (
          <div className="py-6 text-center space-y-3">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-400" />
            <h4 className="text-sm font-bold text-rose-400">Periode Sanggahan Telah Ditutup</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Sesuai aturan Juknis Lomba CETAS, pengajuan sanggahan dibatasi 15 menit setelah rilis
              nilai. Hasil nilai tim telah bersifat final dan mengikat.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white px-4 py-2 text-xs font-semibold"
            >
              Kembali
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Kategori Materi yang Disanggah
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Pilih Kategori Penilaian...</option>
                {team.categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryName}>
                    {c.categoryName} (Nilai: {Math.round(c.score)}/{c.maximum})
                  </option>
                ))}
                <option value="Timer Panggung">Pengurangan Poin Waktu / Timer</option>
                <option value="Penalti / Diskualifikasi">Penalti & Pelanggaran Pasukan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Timestamp / Menit Rekaman Video Lomba (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: Menit 04:25 - Gerakan Hormat Kanan"
                value={videoTimestamp}
                onChange={(e) => setVideoTimestamp(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Deskripsi & Dasar Sanggahan Juknis
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan alasan sanggahan secara objektif mengacu pada juknis lomba..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Sanggahan diverifikasi langsung oleh Dewan Juri & Ketua Pelaksana. Dilarang
                melakukan spam atau komplain via jalur tidak resmi.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Mengirim..." : "Kirim Sanggahan Resmi"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
