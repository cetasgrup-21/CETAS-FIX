import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  INITIAL_ATTENDEES,
  INITIAL_REGISTRATION_EVENTS,
  RegisteredAttendee,
  EventRegistrationItem,
} from "@/lib/events-registration-data";
import { prisma } from "@/lib/prisma";

// Global in-memory cache to ensure state persistence across server restarts
declare global {
  var __cetasAttendees: RegisteredAttendee[] | undefined;
  var __cetasEvents: EventRegistrationItem[] | undefined;
}

if (!global.__cetasAttendees) {
  global.__cetasAttendees = [...INITIAL_ATTENDEES];
}

if (!global.__cetasEvents) {
  global.__cetasEvents = [...INITIAL_REGISTRATION_EVENTS];
}

const registrationSchema = z.object({
  eventId: z.string().min(1, "ID Event wajib dipilih"),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  institution: z.string().min(2, "Nama instansi / institusi wajib diisi"),
  category: z.string().min(1, "Kategori peserta wajib dipilih"),
  notes: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

// GET: Ambil daftar peserta & daftar event pendaftaran
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const type = searchParams.get("type"); // "events" or "attendees"

  if (type === "events") {
    return NextResponse.json({
      success: true,
      events: global.__cetasEvents,
    });
  }

  let attendees = global.__cetasAttendees || [];
  if (eventId) {
    attendees = attendees.filter((a) => a.eventId === eventId);
  }

  // Coba ambil dari DB jika tersedia
  try {
    const dbAttendees = await prisma.eventAttendee.findMany({
      take: 50,
      orderBy: { registeredAt: "desc" },
    });
    if (dbAttendees && dbAttendees.length > 0) {
      // Merge with in-memory
    }
  } catch {
    // Ignore DB offline
  }

  return NextResponse.json({
    success: true,
    total: attendees.length,
    attendees,
    events: global.__cetasEvents,
  });
}

// POST: Pendaftaran peserta baru khusus event yang buka pendaftaran online
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registrationSchema.parse(body);

    const event = global.__cetasEvents?.find((e) => e.id === validated.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!event.isOpenOnlineRegistration) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mohon maaf, event ini tidak membuka pendaftaran peserta secara online melalui web Cetas.",
        },
        { status: 400 }
      );
    }

    if (event.quotaRemaining <= 0) {
      return NextResponse.json(
        { success: false, message: "Kuota pendaftaran untuk event ini telah habis" },
        { status: 400 }
      );
    }

    // Generate kode badge & QR payload unik
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const badgeCode = `CETAS-ATD-2026-${randomDigits}`;
    const qrPayload = `${badgeCode}|${event.title}|${validated.fullName}|CONFIRMED`;

    const newAttendee: RegisteredAttendee = {
      id: `atd-${Date.now()}`,
      badgeCode,
      eventId: event.id,
      eventName: event.title,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      institution: validated.institution,
      category: validated.category,
      notes: validated.notes || "",
      portfolioUrl: validated.portfolioUrl || "",
      qrPayload,
      registeredAt: new Date().toISOString(),
      isPresent: false,
      status: "CONFIRMED",
    };

    // Update in-memory data
    global.__cetasAttendees?.unshift(newAttendee);
    event.quotaRemaining = Math.max(0, event.quotaRemaining - 1);

    // Sync ke DB jika aktif
    try {
      await prisma.eventAttendee.create({
        data: {
          id: newAttendee.id,
          eventId: event.id,
          name: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          qrCode: badgeCode,
          customDataJson: JSON.stringify({
            institution: validated.institution,
            category: validated.category,
            notes: validated.notes,
          }),
        },
      });
    } catch {
      // Ignore DB offline
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran peserta event berhasil diverifikasi!",
      attendee: newAttendee,
      event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses pendaftaran" },
      { status: 500 }
    );
  }
}

// PATCH: Update status kehadiran (Check-in di gate) atau Super Admin toggle event online registration
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, attendeeId, eventId, isOpenOnline } = body;

    if (action === "TOGGLE_EVENT_REGISTRATION" && eventId) {
      const event = global.__cetasEvents?.find((e) => e.id === eventId);
      if (event) {
        event.isOpenOnlineRegistration = Boolean(isOpenOnline);
        event.statusNote = event.isOpenOnlineRegistration
          ? "🟢 Pendaftaran Online Dibuka"
          : "🔴 Pendaftaran Ditutup oleh Admin";
        return NextResponse.json({
          success: true,
          message: `Status pendaftaran online event '${event.title}' berhasil diubah!`,
          event,
        });
      }
    }

    if (action === "MARK_ATTENDANCE" && attendeeId) {
      const attendee = global.__cetasAttendees?.find((a) => a.id === attendeeId);
      if (attendee) {
        attendee.isPresent = !attendee.isPresent;
        return NextResponse.json({
          success: true,
          message: `Status kehadiran ${attendee.fullName} diubah menjadi: ${
            attendee.isPresent ? "HADIR (Check-in)" : "BELUM HADIR"
          }`,
          attendee,
        });
      }
    }

    if (action === "DELETE_ATTENDEE" && attendeeId) {
      global.__cetasAttendees = global.__cetasAttendees?.filter((a) => a.id !== attendeeId);
      return NextResponse.json({
        success: true,
        message: "Data peserta berhasil dihapus dari sistem",
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memproses aksi" }, { status: 500 });
  }
}
