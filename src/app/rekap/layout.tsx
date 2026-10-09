import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import RekapGate from "./rekapgate";

export default async function RekapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("cetas_session")?.value;

  // =====================================================
  // BELUM LOGIN
  // =====================================================

  if (!token) {
    redirect("/login?next=/rekap");
  }

  // =====================================================
  // VERIFIKASI SESSION
  // =====================================================

  let session;

  try {
    session =
      await verifySessionToken(token);
  } catch {
    redirect("/login?next=/rekap");
  }

  // =====================================================
  // ROLE USER
  // =====================================================

  const role = String(
    session.role ?? ""
  );

  // =====================================================
  // ADMIN CETAS
  //
  // OPERATOR = akun admin yang sekarang kamu gunakan
  // SUPER_ADMIN = super admin
  // ORGANIZER = admin/organizer
  //
  // JUDGE tidak boleh masuk Rekap.
  // =====================================================

  const isAdmin =
    role === "OPERATOR" ||
    role === "SUPER_ADMIN" ||
    role === "ORGANIZER";

  // =====================================================
  // BUKAN ADMIN
  // =====================================================

  if (!isAdmin) {
    redirect("/admin/dashboard");
  }

  // =====================================================
  // REKAP
  // =====================================================

  return (
    <RekapGate>
      {children}
    </RekapGate>
  );
}