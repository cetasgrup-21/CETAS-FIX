import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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

    // JIKA UPLOAD DIBAGI MENJADI BEBERAPA CHUNK (POTONGAN KECIL < 1MB UNTUK ANTI LIMIT NGINX)
    if (uploadId && totalChunks > 1) {
      const tempChunksDir = path.join(process.cwd(), ".cetas_data", "temp_chunks", uploadId);
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

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const publicFilePath = path.join(uploadsDir, uniqueName);

      const backupDir = path.join(process.cwd(), ".cetas_data", "uploads");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupFilePath = path.join(backupDir, uniqueName);

      // Gabungkan seluruh chunk sesuai urutan
      const writeStream = fs.createWriteStream(publicFilePath);
      let totalBytes = 0;

      for (let i = 0; i < totalChunks; i++) {
        const cPath = path.join(tempChunksDir, `chunk_${i}`);
        const cBuffer = fs.readFileSync(cPath);
        totalBytes += cBuffer.length;
        writeStream.write(cBuffer);
      }
      writeStream.end();

      // Salin ke backup storage
      await new Promise<void>((resolve) => writeStream.on("finish", () => resolve()));
      fs.copyFileSync(publicFilePath, backupFilePath);

      // Bersihkan folder temp chunks
      try {
        fs.rmSync(tempChunksDir, { recursive: true, force: true });
      } catch (rmErr) {
        console.warn("Clean temp chunks error:", rmErr);
      }

      const sizeInKB = Math.round(totalBytes / 1024);
      const sizeLabel = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

      let fileType = "OTHER";
      const lowerExt = ext.toLowerCase();
      if (lowerExt === ".pdf") fileType = "PDF";
      else if ([".docx", ".doc"].includes(lowerExt)) fileType = "DOCX";
      else if ([".xlsx", ".xls", ".csv"].includes(lowerExt)) fileType = "XLSX";
      else if ([".jpg", ".jpeg", ".png", ".webp"].includes(lowerExt)) fileType = "IMAGE";

      const fileUrl = `/api/files/${uniqueName}`;

      return NextResponse.json({
        success: true,
        isComplete: true,
        url: fileUrl,
        fileName: customFileName,
        fileSize: sizeLabel,
        fileType: fileType,
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

    // Target 1: public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const publicFilePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(publicFilePath, buffer);

    // Target 2: .cetas_data/uploads (backup storage)
    const backupDir = path.join(process.cwd(), ".cetas_data", "uploads");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, uniqueName), buffer);

    const sizeInKB = Math.round(buffer.length / 1024);
    const sizeLabel = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    let fileType = "OTHER";
    const lowerExt = ext.toLowerCase();
    if (lowerExt === ".pdf") fileType = "PDF";
    else if ([".docx", ".doc"].includes(lowerExt)) fileType = "DOCX";
    else if ([".xlsx", ".xls", ".csv"].includes(lowerExt)) fileType = "XLSX";
    else if ([".jpg", ".jpeg", ".png", ".webp"].includes(lowerExt)) fileType = "IMAGE";

    const fileUrl = `/api/files/${uniqueName}`;

    return NextResponse.json({
      success: true,
      isComplete: true,
      url: fileUrl,
      fileName: originalName,
      fileSize: sizeLabel,
      fileType: fileType,
      message: "File berhasil diunggah!",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses file upload pada server" },
      { status: 500 }
    );
  }
}
