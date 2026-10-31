import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";
import { getStaffStore } from "@/lib/cetas-store";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json();
  const rawUsername = String(body.username || "").trim().toLowerCase();
  const pin = String(body.pin || "").trim();

  if (!rawUsername || !pin) {
    return NextResponse.json(
      { error: "Username/Email dan PIN/Password wajib diisi." },
      { status: 400 }
    );
  }

  // Master passwords yang diizinkan untuk kemudahan operasional
  const isMasterPassword =
    pin === "RezaCetas2026!" ||
    pin === "211226" ||
    pin === "123456";

  // 1. Cek User di database User (Juri & Akun Terdaftar)
  let user = await db.user.findUnique({ where: { username: rawUsername } });

  // 2. Jika belum ketemu, cek daftar staf resmi dari Admin Dashboard (getStaffStore)
  let matchedStaff: any = null;
  try {
    const staffList = await getStaffStore();
    matchedStaff = staffList.find(
      (s) =>
        s.email.toLowerCase().trim() === rawUsername ||
        s.name.toLowerCase().trim() === rawUsername
    );
  } catch (err) {
    console.warn("Error reading staff store:", err);
  }

  // Jika akun berasal dari Admin Dashboard
  if (matchedStaff) {
    const isStaffPassValid =
      matchedStaff.password === pin ||
      isMasterPassword ||
      (user && user.pinHash === pinHash(pin));

    if (!isStaffPassValid) {
      return NextResponse.json(
        { error: "PIN atau Password salah." },
        { status: 401 }
      );
    }

    // Pastikan akun staf disinkronkan ke User table untuk session CETAS.SCORE
    if (!user) {
      try {
        user = await db.user.create({
          data: {
            name: matchedStaff.name,
            username: matchedStaff.email.toLowerCase().trim(),
            pinHash: pinHash(pin),
            role: matchedStaff.role || "OPERATOR",
            status: "ACTIVE",
          },
        });
      } catch {
        user = await db.user.findUnique({ where: { username: matchedStaff.email.toLowerCase().trim() } });
      }
    } else {
      // Perbarui role & nama jika ada perubahan di admin dashboard
      if (user.role !== matchedStaff.role) {
        try {
          user = await db.user.update({
            where: { id: user.id },
            data: { role: matchedStaff.role, name: matchedStaff.name },
          });
        } catch {}
      }
    }
  }

  // 3. Jika user belum ada tapi memiliki data sinkronisasi staf dari body
  if (!user && body.syncStaffAccount && body.role && body.name) {
    try {
      user = await db.user.create({
        data: {
          name: String(body.name).trim(),
          username: rawUsername,
          pinHash: pinHash(pin),
          role: String(body.role).trim().toUpperCase(),
          status: "ACTIVE",
        },
      });
    } catch {
      user = await db.user.findUnique({ where: { username: rawUsername } });
    }
  }

  // 4. Default Fallback untuk Akun Bawaan (Super Admin, Operator, Juri, Timer, Staff Rekap)
  if (!user) {
    if (rawUsername === "cetasgrup@gmail.com" || rawUsername === "superadmin") {
      user = await db.user.upsert({
        where: { username: "cetasgrup@gmail.com" },
        create: {
          name: "REZA ADITYA ARIFIN",
          username: "cetasgrup@gmail.com",
          pinHash: pinHash("211226"),
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
        update: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
    } else if (rawUsername === "admin") {
      user = await db.user.upsert({
        where: { username: "admin" },
        create: {
          name: "Administrator",
          username: "admin",
          pinHash: pinHash("123456"),
          role: "OPERATOR",
          status: "ACTIVE",
        },
        update: { role: "OPERATOR", status: "ACTIVE" },
      });
    } else if (rawUsername === "juri") {
      user = await db.user.upsert({
        where: { username: "juri" },
        create: {
          name: "Juri Utama",
          username: "juri",
          pinHash: pinHash("123456"),
          role: "JUDGE",
          status: "ACTIVE",
        },
        update: { role: "JUDGE", status: "ACTIVE" },
      });
    } else if (rawUsername === "timer") {
      user = await db.user.upsert({
        where: { username: "timer" },
        create: {
          name: "Petugas Timer",
          username: "timer",
          pinHash: pinHash("123456"),
          role: "TIMER",
          status: "ACTIVE",
        },
        update: { role: "TIMER", status: "ACTIVE" },
      });
    } else if (rawUsername === "reza@cetas.co.id") {
      user = await db.user.upsert({
        where: { username: "reza@cetas.co.id" },
        create: {
          name: "Reza",
          username: "reza@cetas.co.id",
          pinHash: pinHash("RezaCetas2026!"),
          role: "STAFF_REKAP",
          status: "ACTIVE",
        },
        update: { role: "STAFF_REKAP", status: "ACTIVE" },
      });
    }
  }

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Username/Email tidak terdaftar atau akun dinonaktifkan." },
      { status: 401 }
    );
  }

  // Verifikasi PIN / Password
  const isPinValid = user.pinHash === pinHash(pin) || isMasterPassword;

  if (!isPinValid) {
    return NextResponse.json(
      { error: "PIN atau Password salah." },
      { status: 401 }
    );
  }

  // Buat JWT Session Token
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
