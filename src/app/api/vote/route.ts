import { NextRequest, NextResponse } from "next/server";
import {
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
} from "@/lib/vote-unified-data";
import {
  getVotingsStore,
  saveVotingsStore,
  getEventsStore,
} from "@/lib/cetas-store";

export const dynamic = "force-dynamic";

function normTitle(str?: string): string {
  return (str || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function safeBanner(url?: string): string {
  if (!url) return "/lkbb-cemara-2026.jpg";
  if (url.length > 250000) return "/lkbb-cemara-2026.jpg";
  return url;
}

async function getSyncedVotings(): Promise<EventVotingConfig[]> {
  const [votings, events] = await Promise.all([
    getVotingsStore(),
    getEventsStore(),
  ]);

  let updated = false;
  const seen = new Set<string>();
  const cleanVotings: EventVotingConfig[] = [];

  for (const v of votings) {
    if (!v.eventId || seen.has(v.eventId)) {
      updated = true;
      continue;
    }
    seen.add(v.eventId);

    // Sinkronkan judul & banner jika event ada di daftar events
    const matchedEv =
      events.find((e) => e.id === v.eventId) ||
      events.find((e) => normTitle(e.title) === normTitle(v.eventTitle));

    if (matchedEv) {
      const targetBanner = safeBanner(matchedEv.bannerUrl);
      if (
        v.eventTitle !== matchedEv.title ||
        v.bannerUrl !== targetBanner ||
        v.mascotUrl !== matchedEv.mascotUrl
      ) {
        v.eventTitle = matchedEv.title;
        v.bannerUrl = targetBanner;
        v.mascotUrl = matchedEv.mascotUrl || v.mascotUrl || "/mascot/ceti_transparent.png";
        v.eventDate = matchedEv.date;
        v.themePreset = matchedEv.themePreset || v.themePreset;
        updated = true;
      }
    } else if (v.bannerUrl && v.bannerUrl.length > 250000) {
      v.bannerUrl = "/lkbb-cemara-2026.jpg";
      updated = true;
    }
    cleanVotings.push(v);
  }

  // Pastikan setiap event di katalog memiliki minimal 1 bilik voting siap pakai
  for (const ev of events) {
    const alreadyExists =
      seen.has(ev.id) ||
      cleanVotings.some((v) => normTitle(v.eventTitle) === normTitle(ev.title));
    if (!alreadyExists) {
      seen.add(ev.id);
      cleanVotings.push({
        eventId: ev.id,
        eventTitle: ev.title,
        eventDate: ev.date,
        bannerUrl: safeBanner(ev.bannerUrl),
        mascotUrl: ev.mascotUrl || "/mascot/ceti_transparent.png",
        themePreset: ev.themePreset || "EMERALD",
        categories: [
          {
            id: `cat-${ev.id}-smp`,
            eventId: ev.id,
            title: "Tingkat SMP/MTs",
            description: "Pemilihan pleton terfavorit tingkat SMP/MTs",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${ev.id}-sma`,
            eventId: ev.id,
            title: "Tingkat SMA/SMK/MA",
            description: "Pemilihan pleton terfavorit tingkat SMA/SMK/MA",
            pricePerVote: 2000,
            candidates: [],
          },
        ],
      });
      updated = true;
    }
  }

  if (updated) {
    await saveVotingsStore(cleanVotings);
  }

  return cleanVotings;
}

// GET: Ambil struktur voting (Event -> Kategori -> Peserta) dari PostgreSQL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  const result = await getSyncedVotings();

  if (eventId) {
    const single = result.find((ev) => ev.eventId === eventId) || result[0];
    return NextResponse.json(
      { success: true, eventVoting: single },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      totalEvents: result.length,
      eventVotings: result,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

// POST: Tambah Kategori Baru, Tambah Peserta Baru, atau Catat Vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const votings = await getSyncedVotings();
    const events = await getEventsStore();

    // Helper untuk memastikan targetEvent selalu ditemukan (Self-Healing, Anti-404)
    const ensureTargetEvent = (
      eventId?: string,
      fallbackTitle?: string,
      fallbackBanner?: string
    ): EventVotingConfig => {
      let target =
        (eventId ? votings.find((ev) => ev.eventId === eventId) : undefined) ||
        (fallbackTitle
          ? votings.find((ev) => normTitle(ev.eventTitle) === normTitle(fallbackTitle))
          : undefined) ||
        (votings.length === 1 ? votings[0] : undefined);

      if (!target) {
        const matchedEv =
          (eventId ? events.find((e) => e.id === eventId) : undefined) ||
          (fallbackTitle
            ? events.find((e) => normTitle(e.title) === normTitle(fallbackTitle))
            : undefined);
        target = {
          eventId: matchedEv?.id || eventId || `ev-${Date.now().toString().slice(-6)}`,
          eventTitle:
            matchedEv?.title || fallbackTitle || "LKBB CEMARA 2026",
          eventDate: matchedEv?.date || new Date().toISOString().split("T")[0],
          bannerUrl: safeBanner(matchedEv?.bannerUrl || fallbackBanner),
          themePreset: matchedEv?.themePreset || "EMERALD",
          categories: [],
        };
        votings.unshift(target);
      }
      return target;
    };

    // 0. SINKRONISASI MASSAL
    if (action === "SYNC_VOTINGS" && Array.isArray(body.eventVotings)) {
      const sanitized = body.eventVotings.map((v: EventVotingConfig) => ({
        ...v,
        bannerUrl: safeBanner(v.bannerUrl),
      }));
      await saveVotingsStore(sanitized);
      return NextResponse.json({
        success: true,
        message: "Data voting berhasil disinkronkan!",
        eventVotings: sanitized,
      });
    }

    // 1. TAMBAH KATEGORI BARU (Misal: Tingkat SMP, Tingkat SMA, Kategori Purna)
    if (action === "ADD_CATEGORY") {
      const { eventId, eventTitle, title, description, pricePerVote } = body;
      const targetEvent = ensureTargetEvent(eventId, eventTitle);

      const newCategory: VoteCategory = {
        id: body.id || `cat-${Date.now().toString().slice(-6)}`,
        eventId: targetEvent.eventId,
        title: (title || "Kategori Baru").trim(),
        description: description || "Kategori pemilihan favorit",
        pricePerVote: Number(pricePerVote) || 2000,
        candidates: [],
      };

      // Cegah duplikasi ID kategori jika dikirim berulang
      const existingIdx = targetEvent.categories.findIndex((c) => c.id === newCategory.id);
      if (existingIdx !== -1) {
        targetEvent.categories[existingIdx] = newCategory;
      } else {
        targetEvent.categories.push(newCategory);
      }

      await saveVotingsStore(votings);

      return NextResponse.json({
        success: true,
        message: `Kategori '${newCategory.title}' berhasil ditambahkan dan disinkronkan!`,
        category: newCategory,
        eventVoting: targetEvent,
        eventVotings: votings,
      });
    }

    // 2. TAMBAH PESERTA / KANDIDAT BARU KE KATEGORI
    if (action === "ADD_CANDIDATE") {
      const {
        eventId,
        eventTitle,
        categoryId,
        categoryTitle,
        pricePerVote,
        candidateNumber,
        name,
        institution,
        photoUrl,
        tagline,
      } = body;

      const targetEvent = ensureTargetEvent(eventId, eventTitle);

      let targetCategory =
        (categoryId
          ? targetEvent.categories.find((c) => c.id === categoryId)
          : undefined) ||
        (categoryTitle
          ? targetEvent.categories.find(
              (c) => normTitle(c.title) === normTitle(categoryTitle)
            )
          : undefined) ||
        targetEvent.categories[0];

      if (!targetCategory) {
        // Self-healing: buat kategori otomatis jika belum ada kategori sama sekali
        targetCategory = {
          id: categoryId || `cat-${Date.now().toString().slice(-6)}`,
          eventId: targetEvent.eventId,
          title: (categoryTitle || "Kategori Favorit").trim(),
          description: "Kategori voting peserta",
          pricePerVote: Number(pricePerVote) || 2000,
          candidates: [],
        };
        targetEvent.categories.push(targetCategory);
      }

      const newCandidate: VoteCandidate = {
        id: body.id || `cand-${Date.now().toString().slice(-6)}`,
        eventId: targetEvent.eventId,
        categoryId: targetCategory.id,
        candidateNumber:
          candidateNumber ||
          String(targetCategory.candidates.length + 1).padStart(2, "0"),
        name: (name || "Peserta Baru").trim(),
        institution: (institution || "Instansi / Sekolah Peserta").trim(),
        photoUrl:
          photoUrl && photoUrl.length <= 400000
            ? photoUrl
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        tagline: tagline || "Visi misi peserta voting.",
        totalVotes: 0,
      };

      const existingCandIdx = targetCategory.candidates.findIndex(
        (c) => c.id === newCandidate.id
      );
      if (existingCandIdx !== -1) {
        targetCategory.candidates[existingCandIdx] = newCandidate;
      } else {
        targetCategory.candidates.push(newCandidate);
      }

      await saveVotingsStore(votings);

      return NextResponse.json({
        success: true,
        message: `Peserta '${newCandidate.name}' berhasil didaftarkan dan disinkronkan ke publik!`,
        candidate: newCandidate,
        categoryId: targetCategory.id,
        category: targetCategory,
        eventVoting: targetEvent,
        eventVotings: votings,
      });
    }

    // 3. PENCATATAN SUARA VOTING RESMI
    if (action === "RECORD_VOTE") {
      const {
        eventId,
        categoryId,
        candidateId,
        addedVotes,
        orderNumber,
        voterName,
      } = body;

      const targetEvent =
        votings.find((ev) => ev.eventId === eventId) ||
        votings.find((ev) =>
          ev.categories.some((c) =>
            c.candidates.some((cand) => cand.id === candidateId)
          )
        ) ||
        votings[0];

      if (!targetEvent) {
        return NextResponse.json(
          { success: false, message: "Event tidak ditemukan" },
          { status: 404 }
        );
      }

      const targetCategory =
        targetEvent.categories.find((c) => c.id === categoryId) ||
        targetEvent.categories.find((c) =>
          c.candidates.some((cand) => cand.id === candidateId)
        );
      if (!targetCategory) {
        return NextResponse.json(
          { success: false, message: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      const cand = targetCategory.candidates.find((c) => c.id === candidateId);
      if (!cand) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      const votesIncrement = Math.max(1, Number(addedVotes) || 1);
      cand.totalVotes += votesIncrement;
      await saveVotingsStore(votings);

      return NextResponse.json({
        success: true,
        message: `Berhasil mencatat ${votesIncrement} suara sah untuk ${cand.name} dari voter ${
          voterName || "Pendukung"
        } (Order: ${orderNumber || "-"})!`,
        candidate: cand,
        totalVotes: cand.totalVotes,
        eventVotings: votings,
      });
    }

    // 4. TAMBAH EVENT VOTING BARU (DARI EVENT YANG ADA)
    if (action === "ADD_EVENT_VOTING") {
      const { eventId, eventTitle, bannerUrl, themePreset, eventDate } = body;

      const existing =
        votings.find((ev) => ev.eventId === eventId) ||
        (eventTitle
          ? votings.find((ev) => normTitle(ev.eventTitle) === normTitle(eventTitle))
          : undefined);

      if (existing) {
        return NextResponse.json({
          success: true,
          message: `Bilik voting untuk event '${existing.eventTitle}' sudah aktif!`,
          eventVoting: existing,
          eventVotings: votings,
          isAlreadyExists: true,
        });
      }

      const newEventVoting: EventVotingConfig = {
        eventId: eventId || `ev-${Date.now()}`,
        eventTitle: eventTitle || "Event Baru Cetas Vote",
        eventDate: eventDate || new Date().toISOString().split("T")[0],
        bannerUrl: safeBanner(bannerUrl),
        mascotUrl: body.mascotUrl || "/mascot/ceti_transparent.png",
        themePreset: themePreset || "EMERALD",
        categories: [
          {
            id: `cat-${eventId || Date.now()}-smp`,
            eventId: eventId,
            title: "Tingkat SMP/MTs",
            description: "Pemilihan pleton terfavorit tingkat SMP/MTs",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${eventId || Date.now()}-sma`,
            eventId: eventId,
            title: "Tingkat SMA/SMK/MA",
            description: "Pemilihan pleton terfavorit tingkat SMA/SMK/MA",
            pricePerVote: 2000,
            candidates: [],
          },
        ],
      };

      votings.unshift(newEventVoting);
      await saveVotingsStore(votings);

      return NextResponse.json({
        success: true,
        message: `Event voting '${newEventVoting.eventTitle}' berhasil dibuat!`,
        eventVoting: newEventVoting,
        eventVotings: votings,
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/vote error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses penambahan vote" },
      { status: 500 }
    );
  }
}

// PUT: Edit Kategori atau Edit Peserta (Self-Healing Upsert)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, eventId, eventTitle, categoryId, candidateId, updates } = body;

    const votings = await getSyncedVotings();
    const targetEvent =
      votings.find((ev) => ev.eventId === eventId) ||
      (eventTitle
        ? votings.find((ev) => normTitle(ev.eventTitle) === normTitle(eventTitle))
        : undefined) ||
      votings[0];

    if (!targetEvent) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    if (action === "EDIT_CATEGORY") {
      let targetCategory = targetEvent.categories.find((c) => c.id === categoryId);
      if (!targetCategory) {
        targetCategory = {
          id: categoryId || `cat-${Date.now().toString().slice(-6)}`,
          eventId: targetEvent.eventId,
          title: updates?.title || "Kategori Vote",
          description: updates?.description || "",
          pricePerVote: Number(updates?.pricePerVote) || 2000,
          candidates: [],
        };
        targetEvent.categories.push(targetCategory);
      } else {
        if (updates?.title !== undefined) targetCategory.title = updates.title;
        if (updates?.description !== undefined)
          targetCategory.description = updates.description;
        if (updates?.pricePerVote !== undefined)
          targetCategory.pricePerVote = Number(updates.pricePerVote);
      }

      await saveVotingsStore(votings);
      return NextResponse.json({
        success: true,
        message: "Kategori berhasil diperbarui!",
        category: targetCategory,
        eventVotings: votings,
      });
    }

    if (action === "EDIT_CANDIDATE") {
      const targetCategory =
        targetEvent.categories.find((c) => c.id === categoryId) ||
        targetEvent.categories.find((c) =>
          c.candidates.some((cand) => cand.id === candidateId)
        ) ||
        targetEvent.categories[0];

      if (!targetCategory) {
        return NextResponse.json(
          { success: false, message: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      const cand = targetCategory.candidates.find((c) => c.id === candidateId);
      if (!cand) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      if (updates?.candidateNumber !== undefined)
        cand.candidateNumber = updates.candidateNumber;
      if (updates?.name !== undefined) cand.name = updates.name;
      if (updates?.institution !== undefined)
        cand.institution = updates.institution;
      if (updates?.photoUrl !== undefined && updates.photoUrl.length <= 400000)
        cand.photoUrl = updates.photoUrl;
      if (updates?.tagline !== undefined) cand.tagline = updates.tagline;

      await saveVotingsStore(votings);
      return NextResponse.json({
        success: true,
        message: "Data profil peserta berhasil diperbarui!",
        candidate: cand,
        eventVotings: votings,
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PUT /api/vote error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengedit data vote" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Bilik Voting Event, Kategori, atau Peserta
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const categoryId = searchParams.get("categoryId");
    const candidateId = searchParams.get("candidateId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Parameter eventId wajib disertakan" },
        { status: 400 }
      );
    }

    const votings = await getSyncedVotings();

    // 1. HAPUS SELURUH BILIK VOTING EVENT
    if (eventId && !categoryId && !candidateId) {
      const remaining = votings.filter((ev) => ev.eventId !== eventId);
      await saveVotingsStore(remaining);
      return NextResponse.json({
        success: true,
        message: "Bilik voting event berhasil dihapus dari sistem!",
        eventVotings: remaining,
      });
    }

    const targetEvent =
      votings.find((ev) => ev.eventId === eventId) || votings[0];
    if (!targetEvent) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    if (candidateId) {
      for (const cat of targetEvent.categories) {
        if (!categoryId || cat.id === categoryId) {
          cat.candidates = cat.candidates.filter((c) => c.id !== candidateId);
        }
      }
      await saveVotingsStore(votings);
      return NextResponse.json({
        success: true,
        message: "Peserta berhasil dihapus dari kategori!",
        eventVotings: votings,
      });
    } else if (categoryId) {
      targetEvent.categories = targetEvent.categories.filter(
        (c) => c.id !== categoryId
      );
      await saveVotingsStore(votings);
      return NextResponse.json({
        success: true,
        message: "Kategori berhasil dihapus dari event!",
        eventVotings: votings,
      });
    }

    return NextResponse.json(
      { success: false, message: "Parameter tidak lengkap" },
      { status: 400 }
    );
  } catch (error) {
    console.error("DELETE /api/vote error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data vote" },
      { status: 500 }
    );
  }
}
