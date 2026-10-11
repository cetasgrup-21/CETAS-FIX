import { NextRequest, NextResponse } from "next/server";
import { UnifiedEvent } from "@/lib/events-unified-data";
import {
  getEventsStore,
  saveEventsStore,
  getVotingsStore,
  saveVotingsStore,
} from "@/lib/cetas-store";

export const dynamic = "force-dynamic";

// GET: Ambil daftar seluruh event dari PostgreSQL CetasStore
export async function GET() {
  const events = await getEventsStore();
  return NextResponse.json(
    {
      success: true,
      total: events.length,
      events,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

// POST: Tambah Event Baru (Super Admin & Event Admin) + Auto-Sync ke Cetas Vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Sinkronisasi massal jika diperlukan
    if (body.action === "SYNC_EVENTS" && Array.isArray(body.events)) {
      await saveEventsStore(body.events);
      return NextResponse.json({
        success: true,
        message: "Daftar event berhasil disinkronkan!",
        events: body.events,
      });
    }

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan tanggal event wajib diisi" },
        { status: 400 }
      );
    }

    const events = await getEventsStore();
    const eventId = body.id || `ev-${Date.now().toString().slice(-6)}`;
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newEvent: UnifiedEvent = {
      id: eventId,
      slug,
      title: body.title,
      organizer: body.organizer || "Cetas Event Organizer",
      category: body.category || "TURNAMEN LKBB PASKIBRA",
      themePreset: body.themePreset || "FLAME",
      date: body.date,
      time: body.time || "08:00 - 17:00 WIB",
      location: body.location || "Jakarta",
      locationType: body.locationType || "OFFLINE",
      bannerUrl:
        body.bannerUrl ||
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
      description: body.description || "Deskripsi resmi event Cetas.",
      status: body.status || "PUBLISHED",
      isOpenTicketing: body.isOpenTicketing !== undefined ? Boolean(body.isOpenTicketing) : true,
      tiers:
        Array.isArray(body.tiers) && body.tiers.length > 0
          ? body.tiers.map((t: { id?: string; name?: string; price?: number; quotaTotal?: number; quotaRemaining?: number }, idx: number) => ({
              id: t.id || `tier-${Date.now()}-${idx + 1}`,
              name: t.name || "Tiket Reguler",
              price: Number(t.price) || 0,
              quotaTotal: Number(t.quotaTotal) || 100,
              quotaRemaining:
                t.quotaRemaining !== undefined
                  ? Number(t.quotaRemaining)
                  : Number(t.quotaTotal) || 100,
            }))
          : [
              {
                id: `tier-${Date.now()}-1`,
                name: body.ticketTierName || "Regular Pass",
                price: Number(body.defaultTicketPrice ?? body.ticketPrice ?? 50000),
                quotaTotal: Number(body.defaultQuota ?? body.ticketQuota ?? 200),
                quotaRemaining: Number(body.defaultQuota ?? body.ticketQuota ?? 200),
              },
            ],
      isOpenOnlineRegistration: Boolean(body.isOpenOnlineRegistration),
      price: body.price !== undefined ? Number(body.price) : 0,
      priceLabel: body.priceLabel || (body.price === 0 ? "Gratis" : `Rp ${body.price}`),
      quotaTotal: Number(body.quotaTotal) || 150,
      quotaRemaining: Number(body.quotaRemaining || body.quotaTotal) || 150,
      categoryOptions: body.categoryOptions || [
        "Tingkat SMP/MTs",
        "Tingkat SMA/SMK/MA",
        "Kategori Purna / Umum",
      ],
      facilities: body.facilities || [
        "Sertifikat Digital Cetas",
        "Akses Gate Pass QR Code",
      ],
      lkbbTeams: Array.isArray(body.lkbbTeams) ? body.lkbbTeams : [],
    };

    const updatedEvents = [newEvent, ...events.filter((e) => e.id !== newEvent.id)];
    await saveEventsStore(updatedEvents);

    // Otomatis buat bilik voting untuk event baru ini agar langsung sinkron dengan Cetas Vote
    const votings = await getVotingsStore();
    if (!votings.some((v) => v.eventId === newEvent.id)) {
      votings.unshift({
        eventId: newEvent.id,
        eventTitle: newEvent.title,
        eventDate: newEvent.date,
        bannerUrl: newEvent.bannerUrl,
        themePreset: newEvent.themePreset || "FLAME",
        categories: [
          {
            id: `cat-${Date.now()}-1`,
            eventId: newEvent.id,
            title: "Tingkat SMP/MTs",
            description: "Kategori voting tingkat SMP/MTs sederajat",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${Date.now()}-2`,
            eventId: newEvent.id,
            title: "Tingkat SMA/SMK/MA",
            description: "Kategori voting tingkat SMA/SMK/MA sederajat",
            pricePerVote: 2000,
            candidates: [],
          },
        ],
      });
      await saveVotingsStore(votings);
    }

    return NextResponse.json({
      success: true,
      message: "Event baru & bilik tiket/voting berhasil dibuat dan disinkronkan!",
      event: newEvent,
      events: updatedEvents,
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat event baru", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Edit Event / Edit Tier Tiket / Kurangi Kuota Tiket (Upsert Aman & Auto-Sync)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, ...updates } = body;

    const events = await getEventsStore();

    // Aksi khusus: pengurangan kuota tiket saat penonton membeli tiket
    if (action === "REDUCE_TICKET_QUOTA") {
      const { eventId, tierId, qty } = body;
      const evIdx = events.findIndex((e) => e.id === (eventId || id));
      if (evIdx !== -1) {
        const targetEv = events[evIdx];
        const deduct = Math.max(1, Number(qty) || 1);
        targetEv.tiers = (targetEv.tiers || []).map((t) =>
          t.id === tierId
            ? { ...t, quotaRemaining: Math.max(0, t.quotaRemaining - deduct) }
            : t
        );
        events[evIdx] = targetEv;
        await saveEventsStore(events);
        return NextResponse.json({
          success: true,
          event: targetEv,
        });
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID event wajib disertakan" },
        { status: 400 }
      );
    }

    const eventIndex = events.findIndex((e) => e.id === id);
    let updatedEvent: UnifiedEvent;

    if (eventIndex === -1) {
      // Self-healing upsert: jika ID belum ada di DB (misal dari local state lama), tambahkan langsung!
      updatedEvent = {
        id,
        slug: (updates.title || id).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: updates.title || "Event Cetas",
        organizer: updates.organizer || "Cetas Official",
        category: updates.category || "TURNAMEN LKBB PASKIBRA",
        themePreset: updates.themePreset || "FLAME",
        date: updates.date || new Date().toISOString().split("T")[0],
        time: updates.time || "08:00 - 17:00 WIB",
        location: updates.location || "Jakarta",
        locationType: updates.locationType || "OFFLINE",
        bannerUrl:
          updates.bannerUrl ||
          "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
        description: updates.description || "Deskripsi resmi event Cetas.",
        status: updates.status || "PUBLISHED",
        isOpenTicketing:
          updates.isOpenTicketing !== undefined ? Boolean(updates.isOpenTicketing) : true,
        tiers: Array.isArray(updates.tiers) ? updates.tiers : [],
        isOpenOnlineRegistration: Boolean(updates.isOpenOnlineRegistration),
        price: Number(updates.price) || 0,
        priceLabel: updates.priceLabel || "Gratis",
        quotaTotal: Number(updates.quotaTotal) || 150,
        quotaRemaining: Number(updates.quotaRemaining) || 150,
        categoryOptions: updates.categoryOptions || ["Umum"],
        facilities: updates.facilities || ["E-Badge QR"],
        lkbbTeams: Array.isArray(updates.lkbbTeams) ? updates.lkbbTeams : [],
      };
      events.unshift(updatedEvent);
    } else {
      const existing = events[eventIndex];
      updatedEvent = {
        ...existing,
        ...updates,
        id: existing.id,
        tiers:
          updates.tiers !== undefined
            ? updates.tiers.map(
                (
                  t: {
                    id?: string;
                    name?: string;
                    price?: number;
                    quotaTotal?: number;
                    quotaRemaining?: number;
                  },
                  idx: number
                ) => ({
                  id: t.id || `tier-${Date.now()}-${idx + 1}`,
                  name: t.name || "Tiket Reguler",
                  price: Number(t.price) || 0,
                  quotaTotal: Number(t.quotaTotal) || 100,
                  quotaRemaining:
                    t.quotaRemaining !== undefined
                      ? Number(t.quotaRemaining)
                      : Number(t.quotaTotal) || 100,
                })
              )
            : existing.tiers,
      };
      events[eventIndex] = updatedEvent;
    }

    await saveEventsStore(events);

    // Sinkronkan judul, banner, tanggal & tema event ke bilik Cetas Vote
    const votings = await getVotingsStore();
    const voteIdx = votings.findIndex((v) => v.eventId === updatedEvent.id);
    if (voteIdx !== -1) {
      votings[voteIdx] = {
        ...votings[voteIdx],
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        bannerUrl: updatedEvent.bannerUrl,
        themePreset: updatedEvent.themePreset || votings[voteIdx].themePreset,
      };
      await saveVotingsStore(votings);
    } else {
      votings.unshift({
        eventId: updatedEvent.id,
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        bannerUrl: updatedEvent.bannerUrl,
        themePreset: updatedEvent.themePreset || "FLAME",
        categories: [
          {
            id: `cat-${Date.now()}-1`,
            eventId: updatedEvent.id,
            title: "Tingkat SMP/MTs",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${Date.now()}-2`,
            eventId: updatedEvent.id,
            title: "Tingkat SMA/SMK/MA",
            pricePerVote: 2000,
            candidates: [],
          },
        ],
      });
      await saveVotingsStore(votings);
    }

    return NextResponse.json({
      success: true,
      message: `Event '${updatedEvent.title}' & tiket berhasil diperbarui dan disinkronkan ke publik!`,
      event: updatedEvent,
      events,
    });
  } catch (error) {
    console.error("PUT /api/events error:", error);
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

    const events = await getEventsStore();
    const nextEvents = events.filter((e) => e.id !== id);
    await saveEventsStore(nextEvents);

    const votings = await getVotingsStore();
    const nextVotings = votings.filter((v) => v.eventId !== id);
    await saveVotingsStore(nextVotings);

    return NextResponse.json({
      success: true,
      message: "Event berhasil dihapus dari sistem",
      events: nextEvents,
    });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
