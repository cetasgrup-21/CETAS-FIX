import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET =
  process.env.AUTH_SECRET || "dev-only-change-this-secret";

const secret = new TextEncoder().encode(AUTH_SECRET);

const PROTECTED_ADMIN_PAGES = [
  "/admin/dashboard",
  "/admin/judges",
  "/admin/participants",
  "/admin/review",
  "/admin/score",
  "/admin/score-changes",
  "/rekap",
  "/penentuan-juara",
];

// Peran staf admin yang diizinkan mengakses seluruh CETAS.SCORE
const ALLOWED_ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATOR",
  "EVENT_ADMIN",
  "PROD_ADMIN",
  "FINANCE_ADMIN",
  "STAFF_REKAP",
  "PANITIA",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminSubPage = PROTECTED_ADMIN_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isJudgePage =
    pathname === "/judge" || pathname.startsWith("/judge/");
  const isTimerPage =
    pathname === "/timer" || pathname.startsWith("/timer/");

  const isProtectedAdminApi =
    (pathname.startsWith("/api/admin/") &&
      !pathname.startsWith("/api/admin/finances") &&
      !pathname.startsWith("/api/admin/staff") &&
      !pathname.startsWith("/api/admin/tickets")) ||
    pathname === "/api/judges";
  const isProtectedJudgeApi = pathname.startsWith("/api/judge/");
  const isProtectedRekapApi = pathname.startsWith("/api/rekap/");
  const isProtectedTimerApi = pathname.startsWith("/api/timer/");

  const isProtectedPage = isAdminSubPage || isJudgePage || isTimerPage;
  const isProtectedApi =
    isProtectedAdminApi ||
    isProtectedJudgeApi ||
    isProtectedRekapApi ||
    isProtectedTimerApi;

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get("cetas_session")?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role || "").toUpperCase();

    // 1. ATURAN JURI: HANYA PENILAIAN
    // Jika role JUDGE mencoba membuka halaman admin / rekap / penentuan juara:
    if (role === "JUDGE") {
      if (isAdminSubPage || isProtectedAdminApi || isProtectedRekapApi) {
        if (isProtectedApi) {
          return NextResponse.json(
            { success: false, error: "Akses ditolak: Akun Dewan Juri hanya memiliki izin untuk penilaian." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/judge", request.url));
      }
      return NextResponse.next();
    }

    // 2. ATURAN SUPER ADMIN & ADMIN BIASA:
    // Bisa akses semua di CETAS.SCORE
    if (ALLOWED_ADMIN_ROLES.includes(role)) {
      return NextResponse.next();
    }

    // 3. ATURAN TIMER:
    if (role === "TIMER") {
      if (isTimerPage || isProtectedTimerApi) {
        return NextResponse.next();
      }
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, error: "Akses ditolak: Khusus akun Timer." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/timer", request.url));
    }

    // Role lain tidak diizinkan masuk
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak untuk role ini." },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  } catch {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/judges/:path*",
    "/admin/participants/:path*",
    "/admin/review/:path*",
    "/admin/score/:path*",
    "/admin/score-changes/:path*",
    "/rekap/:path*",
    "/penentuan-juara/:path*",
    "/judge/:path*",
    "/timer/:path*",
    "/api/admin/:path*",
    "/api/judges",
    "/api/judge/:path*",
    "/api/rekap/:path*",
    "/api/timer/:path*",
  ],
};
