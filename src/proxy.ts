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
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminSubPage = PROTECTED_ADMIN_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isJudgePage =
    pathname === "/judge" || pathname.startsWith("/judge/");
  const isRekapPage =
    pathname === "/rekap" || pathname.startsWith("/rekap/");
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

  const isProtectedPage =
    isAdminSubPage || isJudgePage || isRekapPage || isTimerPage;
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
    const role = String(payload.role || "");

    if (isAdminSubPage || isProtectedAdminApi) {
      if (
        role !== "SUPER_ADMIN" &&
        role !== "OPERATOR" &&
        role !== "ADMIN" &&
        role !== "STAFF_REKAP"
      ) {
        if (isProtectedApi) {
          return NextResponse.json(
            { success: false, error: "Akses ditolak: Khusus Super Admin / Operator / Staff Rekap." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (isJudgePage || isProtectedJudgeApi) {
      if (
        role !== "JUDGE" &&
        role !== "OPERATOR" &&
        role !== "SUPER_ADMIN" &&
        role !== "ADMIN" &&
        role !== "STAFF_REKAP"
      ) {
        if (isProtectedApi) {
          return NextResponse.json(
            { success: false, error: "Akses ditolak: Khusus Dewan Juri." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/login?next=/judge", request.url));
      }
    }

    return NextResponse.next();
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
    "/judge/:path*",
    "/rekap/:path*",
    "/timer/:path*",
    "/api/admin/:path*",
    "/api/judges",
    "/api/judge/:path*",
    "/api/rekap/:path*",
    "/api/timer/:path*",
  ],
};
