import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

async function ensureDefaultUsers() {
  try {
    // 1. Super Admin
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

    // 2. Staff Rekap
    const staffRekap = await db.user.findUnique({
      where: { username: "reza@cetas.co.id" },
    });
    if (!staffRekap) {
      await db.user.create({
        data: {
          name: "Reza",
          username: "reza@cetas.co.id",
          pinHash: pinHash("RezaCetas2026!"),
          role: "STAFF_REKAP",
          status: "ACTIVE",
        },
      });
    }

    // 3. Admin / Operator Cetas.Score
    const adminUser = await db.user.findUnique({
      where: { username: "admin" },
    });
    if (!adminUser) {
      await db.user.create({
        data: {
          name: "Administrator",
          username: "admin",
          pinHash: pinHash("123456"),
          role: "OPERATOR",
          status: "ACTIVE",
        },
      });
    }

    // 4. Juri Utama
    const juriUser = await db.user.findUnique({
      where: { username: "juri" },
    });
    if (!juriUser) {
      await db.user.create({
        data: {
          name: "Juri Utama",
          username: "juri",
          pinHash: pinHash("123456"),
          role: "JUDGE",
          status: "ACTIVE",
        },
      });
    }

    // 5. Timer Petugas
    const timerUser = await db.user.findUnique({
      where: { username: "timer" },
    });
    if (!timerUser) {
      await db.user.create({
        data: {
          name: "Petugas Timer",
          username: "timer",
          pinHash: pinHash("123456"),
          role: "TIMER",
          status: "ACTIVE",
        },
      });
    }
  } catch (err) {
    console.warn("Failed ensuring default users:", err);
  }
}

export async function POST(req: Request) {
  await ensureDefaultUsers();

  const body = await req.json();
  const rawUsername = String(body.username || "").trim().toLowerCase();
  const pin = String(body.pin || "").trim();

  if (!rawUsername || !pin) {
    return NextResponse.json(
      { error: "Username/Email dan PIN/Password wajib diisi." },
      { status: 400 }
    );
  }

  // Alias umum
  let normalizedUsername = rawUsername;
  if (
    rawUsername === "superadmin" ||
    rawUsername === "super_admin" ||
    rawUsername === "reza aditya arifin"
  ) {
    normalizedUsername = "cetasgrup@gmail.com";
  } else if (
    rawUsername === "rekap" ||
    rawUsername === "staffrekap" ||
    rawUsername === "staff_rekap" ||
    rawUsername === "staff rekap" ||
    rawUsername === "rekap@cetas.id" ||
    rawUsername === "rekap@cetas.co.id" ||
    rawUsername === "rekap@gmail.com"
  ) {
    normalizedUsername = "reza@cetas.co.id";
  }

  let user = await db.user.findUnique({ where: { username: normalizedUsername } });

  // Fallback pencarian fleksibel
  if (!user && (rawUsername.includes("rekap") || rawUsername.includes("staff"))) {
    user = await db.user.findUnique({ where: { username: "reza@cetas.co.id" } });
  }

  // Jika login berasal dari akun staf lokal /admin
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
    pin === "123456";

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
