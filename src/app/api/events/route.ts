import { NextRequest, NextResponse } from "next/server";
import { INITIAL_UNIFIED_EVENTS, UnifiedEvent } from "@/lib/events-unified-data";

// Global cache for unified events
declare global {
  var __cetasUnifiedEvents: UnifiedEvent[] | undefined;
}

if (!global.__cetasUnifiedEvents) {
  global.__cetasUnifiedEvents = [...INITIAL_UNIFIED_EVENTS];
}

// GET: Ambil daftar seluruh event
export async function GET() {
  return NextResponse.json({
    success: true,
    total: global.__cetasUnifiedEvents?.length || 0,
    events: global.__cetasUnifiedEvents,
  });
}

// POST: Tambah Event Baru (Super Admin & Event Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan tanggal event wajib diisi" },
        { status: 400 }
      );
    }

    const eventId = `ev-${Date.now().toString().slice(-6)}`;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newEvent: UnifiedEvent = {
      id: eventId,
      slug,
      title: body.title,
      organizer: body.organizer || "Cetas Event Organizer",
      category: body.category || "WORKSHOP",
      date: body.date,
      time: body.time || "09:00 - 17:00 WIB",
      location: body.location || "Jakarta",
      locationType: body.locationType || "OFFLINE",
      bannerUrl:
        body.bannerUrl ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      description: body.description || "Deskripsi event Cetas.",
      status: body.status || "PUBLISHED",
      isOpenTicketing: Boolean(body.isOpenTicketing),
      tiers: body.tiers || [
        {
          id: `tier-${Date.now()}-1`,
          name: "Regular Pass",
          price: body.defaultTicketPrice || 100000,
          quotaTotal: body.defaultQuota || 100,
          quotaRemaining: body.defaultQuota || 100,
        },
      ],
      isOpenOnlineRegistration: Boolean(body.isOpenOnlineRegistration),
      price: body.price !== undefined ? body.price : 0,
      priceLabel: body.priceLabel || (body.price === 0 ? "Gratis" : `Rp ${body.price}`),
      quotaTotal: body.quotaTotal || 150,
      quotaRemaining: body.quotaRemaining || body.quotaTotal || 150,
      categoryOptions: body.categoryOptions || [
        "Mahasiswa / Pelajar",
        "Praktisi / Umum",
      ],
      facilities: body.facilities || [
        "Sertifikat Digital Cetas",
        "Akses Gate Pass QR Code",
      ],
    };

    global.__cetasUnifiedEvents?.unshift(newEvent);

    return NextResponse.json({
      success: true,
      message: "Event baru berhasil dibuat!",
      event: newEvent,
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat event baru", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Edit Event yang Sudah Ada
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID event wajib disertakan" },
        { status: 400 }
      );
    }

    const eventIndex = global.__cetasUnifiedEvents?.findIndex((e) => e.id === id);
    if (eventIndex === undefined || eventIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update event
    const existing = global.__cetasUnifiedEvents![eventIndex];
    const updatedEvent: UnifiedEvent = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve id
    };

    global.__cetasUnifiedEvents![eventIndex] = updatedEvent;

    return NextResponse.json({
      success: true,
      message: `Event '${updatedEvent.title}' berhasil diperbarui!`,
      event: updatedEvent,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui event" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Event (Super Admin)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID event wajib disertakan" },
        { status: 400 }
      );
    }

    global.__cetasUnifiedEvents = global.__cetasUnifiedEvents?.filter((e) => e.id !== id);

    return NextResponse.json({
      success: true,
      message: "Event berhasil dihapus dari sistem",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
