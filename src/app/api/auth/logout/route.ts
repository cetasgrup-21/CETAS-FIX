import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // =========================================================
    // HAPUS SESSION COOKIE
    // =========================================================
    // Logout tidak boleh bergantung pada session masih valid
    // atau tidak. Kalau session sudah hilang dari database,
    // cookie tetap harus dihapus.
    cookieStore.delete("cetas_session");

    return NextResponse.json(
      {
        success: true,
        message: "Logout berhasil.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    // Tetap kirim response yang menghapus cookie melalui header
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout selesai.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set("cetas_session", "", {
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }
}