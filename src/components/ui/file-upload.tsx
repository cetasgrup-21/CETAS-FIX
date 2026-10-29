"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, FileText, CheckCircle2, X, RefreshCw, Link as LinkIcon } from "lucide-react";

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  value?: string;
  onChange: (dataUrl: string, fileName?: string) => void;
  aspectRatio?: "banner" | "square" | "document";
  required?: boolean;
}

export function FileUpload({
  label,
  description,
  accept = "image/*",
  value = "",
  onChange,
  aspectRatio = "banner",
  required = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = accept.includes("image") || value.startsWith("data:image") || value.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  const processFile = async (file: File) => {
    setUploadedFileName(file.name);

    // If it's a document (PDF, Word, Excel, etc.) or aspectRatio is "document" or file > 300KB:
    // Upload directly to server via /api/upload to avoid giant base64 payloads that crash Nginx / server JSON limits
    const isDocType =
      aspectRatio === "document" ||
      !file.type.startsWith("image/") ||
      Boolean(file.name.match(/\.(pdf|docx?|xlsx?|csv|zip)$/i));

    if (isDocType) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

      // Batas upload dokumen hingga 50 MB
      if (file.size > 50 * 1024 * 1024) {
        alert(
          `Berkas "${file.name}" berukuran ${fileSizeMB} MB.\n\nBatas maksimal unggah berkas langsung adalah 50 MB.\n\nSilakan klik "Atau masukkan link URL" di kanan atas dan masukkan tautan Google Drive / Cloud Storage untuk berkas ini.`
        );
        setShowUrlFallback(true);
        return;
      }

      const CHUNK_SIZE = 768 * 1024; // 768 KB per bagian (jauh di bawah batas 1MB/2MB Nginx!)
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      let serverErrMsg = "";
      try {
        setIsUploading(true);
        setUploadProgress(5);

        if (totalChunks <= 1) {
          // File kecil <= 768 KB: upload biasa
          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileName", file.name);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              setUploadProgress(100);
              setIsUploading(false);
              onChange(data.url, file.name);
              return;
            }
          } else {
            const errJson = await res.json().catch(() => null);
            throw new Error(errJson?.message || `Server status ${res.status}`);
          }
        } else {
          // File besar (misal Juknis 5MB - 40MB): potong per bagian / chunk untuk memotong batasan Nginx
          let finalResultUrl = "";

          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunkBlob = file.slice(start, end);

            const formData = new FormData();
            formData.append("file", chunkBlob, file.name);
            formData.append("fileName", file.name);
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", String(chunkIndex));
            formData.append("totalChunks", String(totalChunks));

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error(`Gagal mengunggah bagian ke-${chunkIndex + 1} (${res.status})`);
            }

            const data = await res.json();
            const currentPercent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
            setUploadProgress(currentPercent);

            if (data.isComplete && data.url) {
              finalResultUrl = data.url;
            }
          }

          if (finalResultUrl) {
            setUploadProgress(100);
            setIsUploading(false);
            onChange(finalResultUrl, file.name);
            return;
          }
        }
      } catch (err: any) {
        console.warn("Direct/chunked upload to /api/upload failed:", err);
        serverErrMsg = err?.message || "";
      } finally {
        setIsUploading(false);
      }

      // Untuk dokumen (PDF/DOCX/XLSX), jangan fall back ke base64 raksasa agar tidak merusak JSON ke server
      alert(
        `Gagal mengunggah berkas "${file.name}" (${fileSizeMB} MB)${serverErrMsg ? `: ${serverErrMsg}` : ""}.\n\nSilakan coba lagi atau gunakan opsi "Atau masukkan link URL" di kanan atas.`
      );
      setShowUrlFallback(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Auto-compress images via HTML5 Canvas while preserving PNG alpha transparency
      if (file.type.startsWith("image/") && !file.type.includes("svg") && !file.type.includes("gif")) {
        const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
        const isWebp = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");

        const img = new window.Image();
        img.onload = () => {
          try {
            const isSquare = aspectRatio === "square";
            const maxDim = isSquare ? 512 : 1200;
            let width = img.width;
            let height = img.height;

            // Jika file square PNG sudah berukuran pas (< 1MB) dan kecil, langsung gunakan hasil asli
            if (isSquare && isPng && width <= maxDim && height <= maxDim && file.size < 1024 * 1024) {
              onChange(result, file.name);
              return;
            }

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);

              // Untuk Maskot / Logo (square): Selalu jaga transparansi penuh PNG 32-bit (anti background hitam)
              if (isSquare && (isPng || isWebp)) {
                const pngData = canvas.toDataURL("image/png");
                onChange(pngData, file.name);
                return;
              }

              // Untuk Banner Poster: Ekspor JPEG resolusi tinggi teroptimasi (~70-90 KB)
              // Ini mencegah banner ditolak atau ditimpa default karena ukuran base64 terlalu besar
              const compressed = canvas.toDataURL("image/jpeg", 0.82);
              onChange(compressed, file.name);
              return;
            }
          } catch {}
          onChange(result, file.name);
        };
        img.onerror = () => {
          onChange(result, file.name);
        };
        img.src = result;
      } else {
        onChange(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[10px] text-slate-400 hover:text-orange-500 flex items-center gap-1 transition"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlFallback ? "Gunakan Upload File" : "Atau masukkan link URL"}
        </button>
      </div>

      {description && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{description}</p>
      )}

      {isUploading ? (
        <div className="border-2 border-dashed border-purple-400 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mb-2" />
          <span className="text-xs font-black text-purple-900 dark:text-purple-200">
            Mengunggah berkas ke server... {uploadProgress > 0 && `${uploadProgress}%`}
          </span>
          <div className="w-full max-w-xs bg-purple-200 dark:bg-purple-900 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            />
          </div>
          <span className="text-[10px] text-purple-700/80 dark:text-purple-300/80 mt-1.5 truncate max-w-xs font-mono">
            {uploadedFileName}
          </span>
        </div>
      ) : showUrlFallback ? (
        <input
          type="text"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
        />
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {value ? (
            <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 overflow-hidden group">
              {isImage ? (
                <div
                  className={`relative w-full rounded-xl overflow-hidden flex items-center justify-center ${
                    aspectRatio === "banner"
                      ? "h-36 sm:h-44 bg-slate-950"
                      : aspectRatio === "square"
                      ? "h-28 w-28 mx-auto bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5"
                      : "h-24 bg-slate-100"
                  }`}
                >
                  <img
                    src={value}
                    alt="Preview"
                    className={`w-full h-full ${
                      aspectRatio === "square" ? "object-contain drop-shadow" : "object-cover"
                    }`}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold flex items-center gap-1 shadow hover:bg-white transition"
                    >
                      <RefreshCw className="h-3 w-3" /> Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/90 text-white text-xs font-bold flex items-center gap-1 shadow hover:bg-rose-600 transition"
                    >
                      <X className="h-3 w-3" /> Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {uploadedFileName || "Dokumen Terunggah"}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Siap diunggah
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("")}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 scale-[1.01]"
                  : "border-slate-300 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500/60 bg-slate-50/50 dark:bg-slate-900/40"
              }`}
            >
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2 shadow-inner">
                {isImage ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Klik untuk upload atau drag & drop file di sini
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {isImage ? "Format didukung: PNG, JPG, WEBP, JPEG" : "Format: PDF, DOC, DOCX, ZIP"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
