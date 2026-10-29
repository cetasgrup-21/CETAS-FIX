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
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            setIsUploading(false);
            onChange(data.url, file.name);
            return;
          }
        }
      } catch (err) {
        console.warn("Direct upload to /api/upload failed, falling back to local reader:", err);
      } finally {
        setIsUploading(false);
      }
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
        <div className="border-2 border-dashed border-purple-400 bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mb-2" />
          <span className="text-xs font-black text-purple-900 dark:text-purple-200">
            Mengunggah berkas ke server...
          </span>
          <span className="text-[10px] text-purple-600/80 mt-0.5">
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
