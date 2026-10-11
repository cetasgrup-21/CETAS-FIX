import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

function pinHash(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

async function ensureFirstRunUsers() {
  const count = await db.user.count();
  if (count > 0) return;

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

export async function POST(req: Request) {
  await ensureFirstRunUsers();

  const body = await req.json();
  const rawUsername = String(body.username || "").trim().toLowerCase();
  const pin = String(body.pin || "").trim();

  if (!rawUsername || !pin) {
    return NextResponse.json(
      { error: "Username dan PIN wajib diisi." },
      { status: 400 }
    );
  }

  const normalizedUsername =
    rawUsername === "reza" || rawUsername === "reza aditya arifin"
      ? "cetasgrup@gmail.com"
      : rawUsername;

  const user = await db.user.findUnique({ where: { username: normalizedUsername } });

  const isSuperAdminMasterPass =
    normalizedUsername === "cetasgrup@gmail.com" &&
    (pin === "211226" || pin === "RezaCetas2026!");

  if (
    !user ||
    user.status !== "ACTIVE" ||
    (user.pinHash !== pinHash(pin) && !isSuperAdminMasterPass)
  ) {
    return NextResponse.json(
      { error: "Username atau PIN/Password salah." },
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
