import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

async function ensureFirstRunUsers() {
  const superAdmin = await db.user.findUnique({
    where: { username: "cetasgrup@gmail.com" },
  });

  if (!superAdmin) {
    await db.user.create({
      data: {
        name: "REZA ADITYA ARIFIN",
        username: "cetasgrup@gmail.com",
        pinHash: pinHash("211226"),
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });
  }

  const defaultStaffRekap = await db.user.findUnique({
    where: { username: "staffrekap" },
  });

  if (!defaultStaffRekap) {
    await db.user.create({
      data: {
        name: "TIM REKAP CETAS.SCORE",
        username: "staffrekap",
        pinHash: pinHash("123456"),
        role: "STAFF_REKAP",
        status: "ACTIVE",
      },
    });
  }

  const emailStaffRekap = await db.user.findUnique({
    where: { username: "rekap@cetas.id" },
  });

  if (!emailStaffRekap) {
    await db.user.create({
      data: {
        name: "TIM REKAP CETAS.SCORE",
        username: "rekap@cetas.id",
        pinHash: pinHash("123456"),
        role: "STAFF_REKAP",
        status: "ACTIVE",
      },
    });
  }
}

export async function POST(req: Request) {
  await ensureFirstRunUsers();

  const body = await req.json();
  const rawUsername = String(body.username || "").trim().toLowerCase();
  const pin = String(body.pin || "").trim();

  if (!rawUsername || !pin) {
    return NextResponse.json(
      { error: "Username/Email dan PIN/Password wajib diisi." },
      { status: 400 }
    );
  }

  // Cek apakah username cocok dengan salah satu alias yang umum
  let normalizedUsername = rawUsername;
  if (
    rawUsername === "reza" ||
    rawUsername === "reza aditya arifin" ||
    rawUsername === "admin" ||
    rawUsername === "superadmin" ||
    rawUsername === "super_admin"
  ) {
    normalizedUsername = "cetasgrup@gmail.com";
  } else if (
    rawUsername === "rekap" ||
    rawUsername === "staff_rekap" ||
    rawUsername === "staff rekap" ||
    rawUsername === "rekap@cetas.co.id" ||
    rawUsername === "rekap@gmail.com"
  ) {
    normalizedUsername = "rekap@cetas.id";
  }

  let user = await db.user.findUnique({ where: { username: normalizedUsername } });

  // Fallback pencarian fleksibel jika belum ketemu
  if (!user && (rawUsername.includes("rekap") || normalizedUsername.includes("rekap"))) {
    user =
      (await db.user.findUnique({ where: { username: "rekap@cetas.id" } })) ||
      (await db.user.findUnique({ where: { username: "staffrekap" } }));
  }

  // Jika login berasal dari akun staf yang baru dibuat di dashboard /admin, sinkronkan ke db.user
  if (!user && body.syncStaffAccount && body.role && body.name) {
    user = await db.user.create({
      data: {
        name: String(body.name).trim(),
        username: normalizedUsername,
        pinHash: pinHash(pin),
        role: String(body.role).trim().toUpperCase(),
        status: "ACTIVE",
      },
    });
  }

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Username/Email tidak terdaftar atau akun non-aktif." },
      { status: 401 }
    );
  }

  // Master passwords yang diizinkan untuk kemudahan operasional
  const isMasterPassword =
    pin === "RezaCetas2026!" ||
    pin === "211226" ||
    (pin === "123456" && (user.role === "STAFF_REKAP" || user.role === "OPERATOR"));

  const isPinValid = user.pinHash === pinHash(pin) || isMasterPassword;

  if (!isPinValid) {
    return NextResponse.json(
      { error: "PIN atau Password salah." },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    id: user.id,
    role: user.role,
    name: user.name,
  });

  const response = NextResponse.json({
    success: true,
    role: user.role,
    name: user.name,
    username: user.username,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const requestProtocol = forwardedProto
    ? forwardedProto.split(",")[0].trim()
    : new URL(req.url).protocol.replace(":", "");

  const isHttps = requestProtocol === "https";

  response.cookies.set("cetas_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
