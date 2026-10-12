import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cetas_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false, error: "Belum login." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const session = await verifySessionToken(sessionCookie.value);
    if (!session?.userId) {
      return NextResponse.json(
        { authenticated: false, error: "Sesi tidak valid." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { authenticated: false, error: "Akun tidak aktif atau tidak ditemukan." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Sesi berakhir atau belum login." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
}
