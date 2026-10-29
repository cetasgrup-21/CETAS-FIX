import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const sanitizedFilename = path.basename(filename);

    // Look in public/uploads first, then .cetas_data/uploads
    let filePath = path.join(process.cwd(), "public", "uploads", sanitizedFilename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), ".cetas_data", "uploads", sanitizedFilename);
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File tidak ditemukan", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(sanitizedFilename).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === ".doc") contentType = "application/msword";
    else if (ext === ".xlsx") contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else if (ext === ".xls") contentType = "application/vnd.ms-excel";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${sanitizedFilename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Gagal memuat file", { status: 500 });
  }
}
