import { NextRequest, NextResponse } from "next/server";
import {
  UnifiedEvent,
  getEffectiveRegistrationCategories,
  normalizeCategoryLevelCode,
} from "@/lib/events-unified-data";
import {
  getEventsStore,
  saveEventsStore,
  getVotingsStore,
  saveVotingsStore,
} from "@/lib/cetas-store";

export const dynamic = "force-dynamic";

function normTitle(str?: string): string {
  return (str || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function safeBanner(url?: string): string {
  if (!url) return "/lkbb-cemara-2026.jpg";
  if (url.length > 350000) return "/lkbb-cemara-2026.jpg";
  return url;
}

function normalizeEventCategoriesAndQuota(ev: UnifiedEvent): UnifiedEvent {
  const regCats = getEffectiveRegistrationCategories(ev);
  const totalQ = regCats.reduce((sum, c) => sum + c.quotaTotal, 0);
  const remQ = regCats.reduce((sum, c) => sum + c.quotaRemaining, 0);
  return {
    ...ev,
    bannerUrl: safeBanner(ev.bannerUrl),
    registrationCategories: regCats,
    categoryOptions: regCats.map((c) => c.name),
    quotaTotal: totalQ,
    quotaRemaining: remQ,
  };
}

// GET: Ambil daftar seluruh event dari PostgreSQL CetasStore
export async function GET() {
  const rawEvents = await getEventsStore();
  const events = rawEvents.map(normalizeEventCategoriesAndQuota);
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
      const clean = body.events.map((e: UnifiedEvent) =>
        normalizeEventCategoriesAndQuota(e)
      );
      await saveEventsStore(clean);
      return NextResponse.json({
        success: true,
        message: "Daftar event berhasil disinkronkan!",
        events: clean,
      });
    }

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan tanggal event wajib diisi" },
        { status: 400 }
      );
    }

    const events = await getEventsStore();
    const existingByTitle = events.find(
      (e) => normTitle(e.title) === normTitle(body.title) && e.date === body.date
    );
    const eventId =
      body.id || existingByTitle?.id || `ev-${Date.now().toString().slice(-6)}`;
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const defaultRegCats =
      Array.isArray(body.registrationCategories) && body.registrationCategories.length > 0
        ? body.registrationCategories
        : [
            {
              id: `reg-cat-${eventId}-sd`,
              name: "Tingkat SD/MI",
              code: "SD",
              quotaTotal: 30,
              quotaRemaining: 30,
            },
            {
              id: `reg-cat-${eventId}-smp`,
              name: "Tingkat SMP/MTs",
              code: "SMP",
              quotaTotal: 35,
              quotaRemaining: 35,
            },
            {
              id: `reg-cat-${eventId}-sma`,
              name: "Tingkat SMA/SMK/MA",
              code: "SMA",
              quotaTotal: 35,
              quotaRemaining: 35,
            },
          ];

    const newEvent = normalizeEventCategoriesAndQuota({
      id: eventId,
      slug,
      title: body.title.trim().replace(/\s+/g, " "),
      organizer: body.organizer || "Cetas Event Organizer",
      category: body.category || "TURNAMEN LKBB PASKIBRA",
      themePreset: body.themePreset || "EMERALD",
      date: body.date,
      time: body.time || "08:00 - 17:00 WIB",
      location: body.location || "Jakarta",
      locationType: body.locationType || "OFFLINE",
      bannerUrl: safeBanner(body.bannerUrl),
      description: body.description || "Deskripsi resmi event Cetas.",
      status: body.status || "PUBLISHED",
      isOpenTicketing:
        body.isOpenTicketing !== undefined ? Boolean(body.isOpenTicketing) : true,
      tiers:
        Array.isArray(body.tiers) && body.tiers.length > 0
          ? body.tiers.map(
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
          : [
              {
                id: `tier-${Date.now()}-1`,
                name: body.ticketTierName || "Regular Pass",
                price: Number(body.defaultTicketPrice ?? body.ticketPrice ?? 50000),
                quotaTotal: Number(body.defaultQuota ?? body.ticketQuota ?? 200),
                quotaRemaining: Number(body.defaultQuota ?? body.ticketQuota ?? 200),
              },
            ],
      isOpenOnlineRegistration:
        body.isOpenOnlineRegistration !== undefined
          ? Boolean(body.isOpenOnlineRegistration)
          : true,
      price: body.price !== undefined ? Number(body.price) : 0,
      priceLabel: body.priceLabel || (body.price === 0 ? "Gratis" : `Rp ${body.price}`),
      quotaTotal: Number(body.quotaTotal) || 100,
      quotaRemaining: Number(body.quotaRemaining || body.quotaTotal) || 100,
      registrationCategories: defaultRegCats,
      categoryOptions: defaultRegCats.map((c: { name: string }) => c.name),
      facilities: body.facilities || [
        "Sertifikat Digital Resmi",
        "E-Badge Pass QR",
        "Snack",
      ],
      lkbbTeams: Array.isArray(body.lkbbTeams) ? body.lkbbTeams : [],
    });

    const updatedEvents = [
      newEvent,
      ...events.filter(
        (e) =>
          e.id !== newEvent.id &&
          !(normTitle(e.title) === normTitle(newEvent.title) && e.date === newEvent.date)
      ),
    ];
    await saveEventsStore(updatedEvents);

    // Otomatis buat bilik voting sesuai kategori pendaftaran (SD, SMP, SMA, dll.)
    const votings = await getVotingsStore();
    const regCats = getEffectiveRegistrationCategories(newEvent);
    if (!votings.some((v) => v.eventId === newEvent.id)) {
      votings.unshift({
        eventId: newEvent.id,
        eventTitle: newEvent.title,
        eventDate: newEvent.date,
        bannerUrl: newEvent.bannerUrl,
        themePreset: newEvent.themePreset || "EMERALD",
        categories: regCats.map((rc) => ({
          id: `cat-${newEvent.id}-${rc.code.toLowerCase()}`,
          eventId: newEvent.id,
          title: rc.name,
          description: `Kategori pemilihan favorit ${rc.name} (Juara Terpisah)`,
          pricePerVote: 2000,
          candidates: [],
        })),
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

// PUT: Edit Event / Edit Kategori & Kuota Pendaftaran / Edit Tier Tiket
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

    let eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex === -1 && updates.title) {
      eventIndex = events.findIndex(
        (e) => normTitle(e.title) === normTitle(updates.title)
      );
    }

    let updatedEvent: UnifiedEvent;

    if (eventIndex === -1) {
      updatedEvent = normalizeEventCategoriesAndQuota({
        id,
        slug: (updates.title || id).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: (updates.title || "Event Cetas").trim().replace(/\s+/g, " "),
        organizer: updates.organizer || "Cetas Official",
        category: updates.category || "TURNAMEN LKBB PASKIBRA",
        themePreset: updates.themePreset || "EMERALD",
        date: updates.date || new Date().toISOString().split("T")[0],
        time: updates.time || "08:00 - 17:00 WIB",
        location: updates.location || "Jakarta",
        locationType: updates.locationType || "OFFLINE",
        bannerUrl: safeBanner(updates.bannerUrl),
        description: updates.description || "Deskripsi resmi event Cetas.",
        status: updates.status || "PUBLISHED",
        isOpenTicketing:
          updates.isOpenTicketing !== undefined ? Boolean(updates.isOpenTicketing) : true,
        tiers: Array.isArray(updates.tiers) ? updates.tiers : [],
        isOpenOnlineRegistration: Boolean(updates.isOpenOnlineRegistration),
        price: Number(updates.price) || 0,
        priceLabel: updates.priceLabel || "Gratis",
        quotaTotal: Number(updates.quotaTotal) || 100,
        quotaRemaining: Number(updates.quotaRemaining) || 100,
        registrationCategories: updates.registrationCategories,
        categoryOptions: updates.categoryOptions || [
          "Tingkat SD/MI",
          "Tingkat SMP/MTs",
          "Tingkat SMA/SMK/MA",
        ],
        facilities: updates.facilities || ["E-Badge QR"],
        lkbbTeams: Array.isArray(updates.lkbbTeams) ? updates.lkbbTeams : [],
      });
      events.unshift(updatedEvent);
    } else {
      const existing = events[eventIndex];
      updatedEvent = normalizeEventCategoriesAndQuota({
        ...existing,
        ...updates,
        id: existing.id,
        bannerUrl:
          updates.bannerUrl !== undefined
            ? safeBanner(updates.bannerUrl)
            : existing.bannerUrl,
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
      });
      events[eventIndex] = updatedEvent;
    }

    await saveEventsStore(events);

    // Sinkronkan judul, banner, tanggal, tema & kategori pendaftaran ke bilik Cetas Vote
    const votings = await getVotingsStore();
    const regCats = getEffectiveRegistrationCategories(updatedEvent);
    const voteIdx = votings.findIndex(
      (v) =>
        v.eventId === updatedEvent.id ||
        normTitle(v.eventTitle) === normTitle(updatedEvent.title)
    );

    if (voteIdx !== -1) {
      const existingVoteCats = Array.isArray(votings[voteIdx].categories)
        ? [...votings[voteIdx].categories]
        : [];
      for (const rc of regCats) {
        const hasCat = existingVoteCats.some(
          (vc) =>
            normTitle(vc.title) === normTitle(rc.name) ||
            normalizeCategoryLevelCode(vc.title) === rc.code
        );
        if (!hasCat) {
          existingVoteCats.push({
            id: `cat-${updatedEvent.id}-${rc.code.toLowerCase()}-${Date.now()}`,
            eventId: updatedEvent.id,
            title: rc.name,
            description: `Pemilihan peserta/pleton terfavorit ${rc.name} (Juara Terpisah)`,
            pricePerVote: 2000,
            candidates: [],
          });
        }
      }
      votings[voteIdx] = {
        ...votings[voteIdx],
        eventId: updatedEvent.id,
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        bannerUrl: safeBanner(updatedEvent.bannerUrl),
        themePreset: updatedEvent.themePreset || votings[voteIdx].themePreset,
        categories: existingVoteCats,
      };
      await saveVotingsStore(votings);
    } else {
      votings.unshift({
        eventId: updatedEvent.id,
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        bannerUrl: safeBanner(updatedEvent.bannerUrl),
        themePreset: updatedEvent.themePreset || "EMERALD",
        categories: regCats.map((rc) => ({
          id: `cat-${updatedEvent.id}-${rc.code.toLowerCase()}`,
          eventId: updatedEvent.id,
          title: rc.name,
          description: `Pemilihan peserta/pleton terfavorit ${rc.name} (Juara Terpisah)`,
          pricePerVote: 2000,
          candidates: [],
        })),
      });
      await saveVotingsStore(votings);
    }

    return NextResponse.json({
      success: true,
      message: `Event '${updatedEvent.title}', kategori & kuota berhasil diperbarui dan disinkronkan!`,
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
