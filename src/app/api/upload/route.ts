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

    // Sanitize filename
    const originalName = file.name || "dokumen";
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

    // Calculate readable size
    const sizeInKB = Math.round(buffer.length / 1024);
    const sizeLabel = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    // Determine type
    let fileType = "OTHER";
    const lowerExt = ext.toLowerCase();
    if (lowerExt === ".pdf") fileType = "PDF";
    else if ([".docx", ".doc"].includes(lowerExt)) fileType = "DOCX";
    else if ([".xlsx", ".xls", ".csv"].includes(lowerExt)) fileType = "XLSX";
    else if ([".jpg", ".jpeg", ".png", ".webp"].includes(lowerExt)) fileType = "IMAGE";

    // Accessible directly via /api/files/ and static /uploads/
    const fileUrl = `/api/files/${uniqueName}`;

    return NextResponse.json({
      success: true,
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
