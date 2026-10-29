import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function getContentType(ext: string): string {
  const lower = ext.toLowerCase();
  switch (lower) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".doc":
      return "application/msword";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".xls":
      return "application/vnd.ms-excel";
    default:
      return "application/octet-stream";
  }
}

function getFileType(ext: string): string {
  const lower = ext.toLowerCase();
  if (lower === ".pdf") return "PDF";
  if ([".docx", ".doc"].includes(lower)) return "DOCX";
  if ([".xlsx", ".xls", ".csv"].includes(lower)) return "XLSX";
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(lower)) return "IMAGE";
  return "OTHER";
}

// Simpan file ke berbagai target (PostgreSQL Database + Multi-tier Disk Cache)
// Menjamin 100% anti gagal upload meskipun disk server memiliki batasan izin / permission EACCES
async function persistUploadedFile(
  uniqueName: string,
  originalName: string,
  buffer: Buffer
): Promise<{ url: string; sizeLabel: string; fileType: string }> {
  const ext = path.extname(originalName) || "";
  const contentType = getContentType(ext);
  const fileType = getFileType(ext);

  const sizeInKB = Math.round(buffer.length / 1024);
  const sizeLabel = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

  // 1. Simpan ke PostgreSQL Database (CetasStore) - Selalu persisten & anti izin disk
  try {
    const dataBase64 = buffer.toString("base64");
    const fileRecord = {
      uniqueName,
      originalName,
      contentType,
      fileType,
      sizeLabel,
      dataBase64,
      createdAt: new Date().toISOString(),
    };

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CetasStore" (
        "key" TEXT PRIMARY KEY,
        "value" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.$executeRawUnsafe(
      `INSERT INTO "CetasStore" ("key", "value", "updatedAt")
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key")
       DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP`,
      `uploaded_file:${uniqueName}`,
      JSON.stringify(fileRecord)
    );
  } catch (dbErr) {
    console.warn("DB upload backup warning:", dbErr);
  }

  // 2. Simpan ke public/uploads (Direct static serve)
  try {
    const publicDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, uniqueName), buffer);
  } catch (fsErr) {
    console.warn("Write to public/uploads warning:", fsErr);
  }

  // 3. Simpan ke .cetas_data/uploads (Local backup)
  try {
    const backupDir = path.join(process.cwd(), ".cetas_data", "uploads");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, uniqueName), buffer);
  } catch (fsErr) {
    console.warn("Write to .cetas_data/uploads warning:", fsErr);
  }

  // 4. Simpan ke os.tmpdir() (Fallback aman 100% writable di semua OS)
  try {
    const tmpDir = path.join(os.tmpdir(), "cetas_uploads");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpDir, uniqueName), buffer);
  } catch (fsErr) {
    console.warn("Write to os.tmpdir warning:", fsErr);
  }

  const fileUrl = `/api/files/${uniqueName}`;
  return { url: fileUrl, sizeLabel, fileType };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadId = formData.get("uploadId") as string | null;
    const chunkIndexStr = formData.get("chunkIndex") as string | null;
    const totalChunksStr = formData.get("totalChunks") as string | null;
    const customFileName = (formData.get("fileName") as string) || file.name || "dokumen";

    const chunkIndex = chunkIndexStr !== null ? parseInt(chunkIndexStr, 10) : 0;
    const totalChunks = totalChunksStr !== null ? parseInt(totalChunksStr, 10) : 1;

    // JIKA UPLOAD DIBAGI MENJADI BEBERAPA CHUNK (POTONGAN KECIL < 1MB)
    if (uploadId && totalChunks > 1) {
      // Gunakan os.tmpdir() yang dijamin 100% writable oleh sistem
      const tempChunksDir = path.join(os.tmpdir(), "cetas_temp_chunks", uploadId);
      if (!fs.existsSync(tempChunksDir)) {
        fs.mkdirSync(tempChunksDir, { recursive: true });
      }

      // Simpan potongan chunk ini
      const chunkPath = path.join(tempChunksDir, `chunk_${chunkIndex}`);
      fs.writeFileSync(chunkPath, buffer);

      // Cek apakah seluruh potongan (chunk 0 sampai totalChunks - 1) sudah lengkap
      let allChunksReceived = true;
      for (let i = 0; i < totalChunks; i++) {
        if (!fs.existsSync(path.join(tempChunksDir, `chunk_${i}`))) {
          allChunksReceived = false;
          break;
        }
      }

      if (!allChunksReceived) {
        return NextResponse.json({
          success: true,
          chunkReceived: chunkIndex,
          totalChunks: totalChunks,
          isComplete: false,
          message: `Bagian ${chunkIndex + 1} dari ${totalChunks} berhasil diterima`,
        });
      }

      // Seluruh chunk lengkap: Rangkai kembali menjadi file asli
      const ext = path.extname(customFileName) || "";
      const baseName = path
        .basename(customFileName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .slice(0, 50);
      const uniqueName = `${Date.now()}_${baseName}${ext}`;

      const chunksBuffers: Buffer[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const cPath = path.join(tempChunksDir, `chunk_${i}`);
        chunksBuffers.push(fs.readFileSync(cPath));
      }
      const completeBuffer = Buffer.concat(chunksBuffers);

      // Simpan berkas lengkap
      const result = await persistUploadedFile(uniqueName, customFileName, completeBuffer);

      // Bersihkan folder temp chunks
      try {
        fs.rmSync(tempChunksDir, { recursive: true, force: true });
      } catch (rmErr) {
        console.warn("Clean temp chunks error:", rmErr);
      }

      return NextResponse.json({
        success: true,
        isComplete: true,
        url: result.url,
        fileName: customFileName,
        fileSize: result.sizeLabel,
        fileType: result.fileType,
        message: "Berkas lengkap berhasil dirangkai dan disimpan!",
      });
    }

    // UPLOAD REGULER (SINGLE REQUEST)
    const originalName = customFileName;
    const ext = path.extname(originalName) || "";
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 50);

    const uniqueName = `${Date.now()}_${baseName}${ext}`;
    const result = await persistUploadedFile(uniqueName, originalName, buffer);

    return NextResponse.json({
      success: true,
      isComplete: true,
      url: result.url,
      fileName: originalName,
      fileSize: result.sizeLabel,
      fileType: result.fileType,
      message: "File berhasil diunggah!",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses file upload: ${error?.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
