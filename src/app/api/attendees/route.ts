import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RegisteredAttendee } from "@/lib/events-registration-data";
import {
  getAttendeesStore,
  saveAttendeesStore,
  getEventsStore,
  saveEventsStore,
} from "@/lib/cetas-store";

export const dynamic = "force-dynamic";

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

// GET: Ambil daftar peserta & daftar event pendaftaran dari PostgreSQL CetasStore
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const type = searchParams.get("type");

  const [allAttendees, rawEvents] = await Promise.all([
    getAttendeesStore(),
    getEventsStore(),
  ]);

  const events = rawEvents.map((e) => ({
    ...e,
    categoryOptions: Array.isArray((e as unknown as { categoryOptions?: string[] }).categoryOptions)
      ? (e as unknown as { categoryOptions: string[] }).categoryOptions
      : ["Tingkat SMP / MTs", "Tingkat SMA / SMK", "Kategori Umum / Peserta"],
    facilities: Array.isArray(e.facilities) && e.facilities.length > 0
      ? e.facilities
      : ["E-Badge Pass QR Resmi", "Sertifikat Digital"],
    quotaTotal: e.quotaTotal || 200,
    quotaRemaining: e.quotaRemaining !== undefined ? e.quotaRemaining : 200,
    isOpenOnlineRegistration: e.isOpenOnlineRegistration !== false,
  }));

  if (type === "events") {
    return NextResponse.json(
      {
        success: true,
        events,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const attendees = eventId
    ? allAttendees.filter((a) => a.eventId === eventId)
    : allAttendees;

  return NextResponse.json(
    {
      success: true,
      total: attendees.length,
      attendees,
      events,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// POST: Pendaftaran peserta baru khusus event yang buka pendaftaran online atau pembelian tiket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registrationSchema.parse(body);

    const [events, attendees] = await Promise.all([
      getEventsStore(),
      getAttendeesStore(),
    ]);

    const eventIdx = events.findIndex((e) => e.id === validated.eventId);
    const event = eventIdx !== -1 ? events[eventIdx] : events[0];
    const resolvedEventId = event?.id || validated.eventId;
    const resolvedEventTitle = event?.title || body.eventName || "Event Resmi Cetas";

    if (event && event.quotaRemaining !== undefined && event.quotaRemaining <= 0) {
      return NextResponse.json(
        { success: false, message: "Kuota pendaftaran untuk event ini telah habis" },
        { status: 400 }
      );
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const badgeCode = `CETAS-ATD-2026-${randomDigits}`;
    const qrPayload = `${badgeCode}|${resolvedEventTitle}|${validated.fullName}|CONFIRMED`;

    const newAttendee: RegisteredAttendee = {
      id: `atd-${Date.now()}`,
      badgeCode,
      eventId: resolvedEventId,
      eventName: resolvedEventTitle,
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

    const nextAttendees = [newAttendee, ...attendees];
    await saveAttendeesStore(nextAttendees);

    if (eventIdx !== -1 && event) {
      events[eventIdx] = {
        ...event,
        quotaRemaining: Math.max(0, (event.quotaRemaining || 1) - 1),
      };
      await saveEventsStore(events);
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran peserta event berhasil diverifikasi!",
      attendee: newAttendee,
      event: eventIdx !== -1 ? events[eventIdx] : event,
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
      const events = await getEventsStore();
      const idx = events.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        events[idx].isOpenOnlineRegistration = Boolean(isOpenOnline);
        await saveEventsStore(events);
        return NextResponse.json({
          success: true,
          message: `Status pendaftaran online event '${events[idx].title}' berhasil diubah!`,
          event: events[idx],
        });
      }
    }

    if (action === "MARK_ATTENDANCE" && attendeeId) {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex((a) => a.id === attendeeId);
      if (idx !== -1) {
        attendees[idx].isPresent = !attendees[idx].isPresent;
        await saveAttendeesStore(attendees);
        return NextResponse.json({
          success: true,
          message: `Status kehadiran ${attendees[idx].fullName} diubah menjadi: ${
            attendees[idx].isPresent ? "HADIR (Check-in)" : "BELUM HADIR"
          }`,
          attendee: attendees[idx],
        });
      }
    }

    if (action === "DELETE_ATTENDEE" && attendeeId) {
      const attendees = await getAttendeesStore();
      const next = attendees.filter((a) => a.id !== attendeeId);
      await saveAttendeesStore(next);
      return NextResponse.json({
        success: true,
        message: "Data peserta berhasil dihapus dari sistem",
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memproses aksi" },
      { status: 500 }
    );
  }
}
