import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

function sanitizePrefix(prefix: string): string {
  return (
    prefix
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 24) || "asset"
  );
}

/**
 * Extracts large inline base64 `data:` URIs into `CetasStore` under `uploaded_file:<name>`
 * and returns a cacheable `/api/files/<name>` URL so JSON state stays lightweight (< 20 KB)
 * and static media gets cached permanently at the CDN / browser edge.
 */
export async function externalizeDataUrl(
  value: string | undefined | null,
  prefix = "asset"
): Promise<string> {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();

  // Keep short strings and non-data URLs untouched
  if (!trimmed.startsWith("data:") || trimmed.length < 4096) {
    return trimmed;
  }

  const match = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) return trimmed;

  const contentType = match[1].toLowerCase().trim();
  const base64Data = match[2].replace(/\s+/g, "");
  const ext = MIME_TO_EXT[contentType] || ".bin";

  const hash = crypto
    .createHash("sha256")
    .update(contentType)
    .update(":")
    .update(base64Data)
    .digest("hex")
    .slice(0, 16);

  const uniqueName = `media_${sanitizePrefix(prefix)}_${hash}${ext}`;
  const storeKey = `uploaded_file:${uniqueName}`;

  try {
    const existing = await prisma.$queryRawUnsafe<Array<{ key: string }>>(
      `SELECT "key" FROM "CetasStore" WHERE "key" = $1 LIMIT 1`,
      storeKey
    );

    if (!existing || existing.length === 0) {
      const approxBytes = Math.floor((base64Data.length * 3) / 4);
      const sizeKB = Math.round(approxBytes / 1024);
      const fileRecord = {
        uniqueName,
        originalName: uniqueName,
        contentType,
        fileType: contentType === "application/pdf" ? "PDF" : "IMAGE",
        sizeLabel: sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`,
        dataBase64: base64Data,
        createdAt: new Date().toISOString(),
      };

      await prisma.$executeRawUnsafe(
        `INSERT INTO "CetasStore" ("key", "value", "updatedAt")
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT ("key") DO NOTHING`,
        storeKey,
        JSON.stringify(fileRecord)
      );
    }

    return `/api/files/${uniqueName}`;
  } catch (err) {
    console.warn(`externalizeDataUrl(${uniqueName}) warning:`, err);
    return trimmed;
  }
}

export async function sanitizeEventMedia<T extends Record<string, any>>(ev: T): Promise<T> {
  if (!ev || typeof ev !== "object") return ev;

  const idPrefix = sanitizePrefix(String(ev.id || "ev"));
  const next: Record<string, any> = { ...ev };

  if (typeof next.bannerUrl === "string" && next.bannerUrl.startsWith("data:")) {
    next.bannerUrl = await externalizeDataUrl(next.bannerUrl, `${idPrefix}_banner`);
  }
  if (typeof next.mascotUrl === "string" && next.mascotUrl.startsWith("data:")) {
    next.mascotUrl = await externalizeDataUrl(next.mascotUrl, `${idPrefix}_mascot`);
  }
  if (typeof next.logoUrl === "string" && next.logoUrl.startsWith("data:")) {
    next.logoUrl = await externalizeDataUrl(next.logoUrl, `${idPrefix}_logo`);
  }

  if (next.certificateConfig && typeof next.certificateConfig === "object") {
    const cert = { ...next.certificateConfig };
    if (typeof cert.stampUrl === "string" && cert.stampUrl.startsWith("data:")) {
      cert.stampUrl = await externalizeDataUrl(cert.stampUrl, `${idPrefix}_stamp`);
    }
    if (
      cert.signer1 &&
      typeof cert.signer1.signatureUrl === "string" &&
      cert.signer1.signatureUrl.startsWith("data:")
    ) {
      cert.signer1 = {
        ...cert.signer1,
        signatureUrl: await externalizeDataUrl(cert.signer1.signatureUrl, `${idPrefix}_sig1`),
      };
    }
    if (
      cert.signer2 &&
      typeof cert.signer2.signatureUrl === "string" &&
      cert.signer2.signatureUrl.startsWith("data:")
    ) {
      cert.signer2 = {
        ...cert.signer2,
        signatureUrl: await externalizeDataUrl(cert.signer2.signatureUrl, `${idPrefix}_sig2`),
      };
    }
    next.certificateConfig = cert;
  }

  return next as T;
}

export async function sanitizeVotingMedia<T extends Record<string, any>>(voting: T): Promise<T> {
  if (!voting || typeof voting !== "object") return voting;

  const idPrefix = sanitizePrefix(String(voting.eventId || "vote"));
  const next: Record<string, any> = { ...voting };

  if (typeof next.bannerUrl === "string" && next.bannerUrl.startsWith("data:")) {
    next.bannerUrl = await externalizeDataUrl(next.bannerUrl, `${idPrefix}_banner`);
  }
  if (typeof next.mascotUrl === "string" && next.mascotUrl.startsWith("data:")) {
    next.mascotUrl = await externalizeDataUrl(next.mascotUrl, `${idPrefix}_mascot`);
  }

  if (Array.isArray(next.categories)) {
    next.categories = await Promise.all(
      next.categories.map(async (cat: any) => {
        if (!cat || !Array.isArray(cat.candidates)) return cat;
        const candidates = await Promise.all(
          cat.candidates.map(async (cand: any) => {
            if (cand && typeof cand.photoUrl === "string" && cand.photoUrl.startsWith("data:")) {
              const photoUrl = await externalizeDataUrl(cand.photoUrl, "cand");
              return { ...cand, photoUrl };
            }
            return cand;
          })
        );
        return { ...cat, candidates };
      })
    );
  }

  return next as T;
}

export async function sanitizeAttendeeMedia<T extends Record<string, any>>(attendee: T): Promise<T> {
  if (!attendee || typeof attendee !== "object") return attendee;

  const next: Record<string, any> = { ...attendee };
  if (typeof next.portfolioUrl === "string" && next.portfolioUrl.startsWith("data:")) {
    next.portfolioUrl = await externalizeDataUrl(next.portfolioUrl, "att_photo");
  }
  if (
    typeof next.championCertificateUrl === "string" &&
    next.championCertificateUrl.startsWith("data:")
  ) {
    next.championCertificateUrl = await externalizeDataUrl(next.championCertificateUrl, "att_cert");
  }
  if (Array.isArray(next.submittedDocuments)) {
    next.submittedDocuments = await Promise.all(
      next.submittedDocuments.map(async (doc: any) => {
        if (doc && typeof doc.fileUrl === "string" && doc.fileUrl.startsWith("data:")) {
          const fileUrl = await externalizeDataUrl(doc.fileUrl, "att_doc");
          return { ...doc, fileUrl };
        }
        return doc;
      })
    );
  }

  return next as T;
}
