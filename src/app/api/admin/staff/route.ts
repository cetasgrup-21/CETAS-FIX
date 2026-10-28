import { NextRequest, NextResponse } from "next/server";
import { getStaffStore, saveStaffStore } from "@/lib/cetas-store";
import { StaffAccountRecord, ROLE_DEFINITIONS, AdminRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Ambil seluruh daftar staf resmi dari PostgreSQL database
export async function GET() {
  try {
    const staffList = await getStaffStore();
    return NextResponse.json({ success: true, staff: staffList });
  } catch (err: any) {
    console.error("[GET /api/admin/staff] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Tambah akun staf baru ke database PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, assignedEventId, assignedEventTitle } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Nama, email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const staffList = await getStaffStore();

    if (staffList.some((s) => s.email.toLowerCase().trim() === cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Email akun ini sudah terdaftar di sistem." },
        { status: 409 }
      );
    }

    const targetRole = role as AdminRole;
    const roleDef = ROLE_DEFINITIONS[targetRole] || ROLE_DEFINITIONS.SCANNER_STAFF;

    const newStaff: StaffAccountRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      password: String(password).trim(),
      role: targetRole,
      roleTitle: roleDef.title,
      avatarColor: "bg-slate-700 text-white",
      lastLogin: "Belum pernah login",
      assignedEventId: assignedEventId || undefined,
      assignedEventTitle: assignedEventTitle || undefined,
      ...roleDef,
    };

    const updated = [...staffList, newStaff];
    await saveStaffStore(updated);

    // Optional: Upsert to User table for CETAS.SCORE judges compatibility
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" ("id", "name", "username", "pinHash", "role", "status", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', CURRENT_TIMESTAMP)
         ON CONFLICT ("username")
         DO UPDATE SET "name" = EXCLUDED."name", "pinHash" = EXCLUDED."pinHash", "role" = EXCLUDED."role", "updatedAt" = CURRENT_TIMESTAMP`,
        newStaff.id,
        newStaff.name,
        cleanEmail,
        newStaff.password,
        targetRole
      );
    } catch {}

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (err: any) {
    console.error("[POST /api/admin/staff] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Perbarui data akun staf di database
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, password, role, assignedEventId, assignedEventTitle } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID wajib disertakan." }, { status: 400 });
    }

    const staffList = await getStaffStore();
    const target = staffList.find((s) => s.id === id);

    if (!target) {
      return NextResponse.json({ success: false, error: "Akun staf tidak ditemukan." }, { status: 404 });
    }

    const targetRole = (role || target.role) as AdminRole;
    const roleDef = ROLE_DEFINITIONS[targetRole] || ROLE_DEFINITIONS[target.role];

    const updatedStaff: StaffAccountRecord = {
      ...target,
      name: name !== undefined ? name.trim() : target.name,
      email: email !== undefined ? email.toLowerCase().trim() : target.email,
      password: password !== undefined ? String(password).trim() : target.password,
      role: targetRole,
      roleTitle: roleDef.title,
      assignedEventId: assignedEventId !== undefined ? assignedEventId : target.assignedEventId,
      assignedEventTitle: assignedEventTitle !== undefined ? assignedEventTitle : target.assignedEventTitle,
      ...roleDef,
    };

    const updatedList = staffList.map((s) => (s.id === id ? updatedStaff : s));
    await saveStaffStore(updatedList);

    return NextResponse.json({ success: true, staff: updatedStaff });
  } catch (err: any) {
    console.error("[PUT /api/admin/staff] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus akun staf SECARA PERMANEN dari database PostgreSQL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID wajib disertakan." }, { status: 400 });
    }

    if (id === "usr-super-01") {
      return NextResponse.json(
        { success: false, error: "Akun Root Super Admin utama tidak boleh dihapus demi keamanan sistem." },
        { status: 403 }
      );
    }

    const staffList = await getStaffStore();
    const target = staffList.find((s) => s.id === id);

    if (!target) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan di database." }, { status: 404 });
    }

    // 1. Hapus permanen dari PostgreSQL CetasStore
    const filteredList = staffList.filter((s) => s.id !== id);
    await saveStaffStore(filteredList);

    // 2. Hapus juga dari PostgreSQL User table jika ada
    try {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "User" WHERE "id" = $1 OR "username" = $2`,
        id,
        target.email.toLowerCase().trim()
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Akun '${target.name}' (${target.email}) telah dihapus permanen dari database. Akun tidak dapat digunakan untuk login lagi.`,
      deletedId: id,
    });
  } catch (err: any) {
    console.error("[DELETE /api/admin/staff] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
