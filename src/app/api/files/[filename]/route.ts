import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const sanitizedFilename = path.basename(filename);
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

    // 1. Cek public/uploads
    const publicPath = path.join(process.cwd(), "public", "uploads", sanitizedFilename);
    if (fs.existsSync(publicPath)) {
      const fileBuffer = fs.readFileSync(publicPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${sanitizedFilename}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Cek .cetas_data/uploads
    const backupPath = path.join(process.cwd(), ".cetas_data", "uploads", sanitizedFilename);
    if (fs.existsSync(backupPath)) {
      const fileBuffer = fs.readFileSync(backupPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${sanitizedFilename}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 3. Cek os.tmpdir()/cetas_uploads
    const tmpPath = path.join(os.tmpdir(), "cetas_uploads", sanitizedFilename);
    if (fs.existsSync(tmpPath)) {
      const fileBuffer = fs.readFileSync(tmpPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${sanitizedFilename}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 4. Cek Database PostgreSQL (CetasStore) jika file disimpan di database
    try {
      const rows = await db.$queryRawUnsafe<Array<{ value: any }>>(
        `SELECT "value" FROM "CetasStore" WHERE "key" = $1 LIMIT 1`,
        `uploaded_file:${sanitizedFilename}`
      );

      if (rows && rows.length > 0 && rows[0].value) {
        const rawVal = rows[0].value;
        const record = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;

        if (record && record.dataBase64) {
          const fileBuffer = Buffer.from(record.dataBase64, "base64");

          // Tulis ke tmp untuk cache cepat berikutnya
          try {
            const tmpDir = path.join(os.tmpdir(), "cetas_uploads");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
            fs.writeFileSync(tmpPath, fileBuffer);
          } catch {}

          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": record.contentType || contentType,
              "Content-Disposition": `inline; filename="${sanitizedFilename}"`,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB file fetch warning:", dbErr);
    }

    return new NextResponse("File tidak ditemukan", { status: 404 });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Gagal memuat file", { status: 500 });
  }
}
