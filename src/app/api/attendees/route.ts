import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RegisteredAttendee } from "@/lib/events-registration-data";
import {
  INITIAL_UNIFIED_EVENTS,
  getEffectiveRegistrationCategories,
  normalizeCategoryLevelCode,
  LKBBTeamScore,
} from "@/lib/events-unified-data";
import { INITIAL_EVENT_VOTINGS } from "@/lib/vote-unified-data";
import {
  getAttendeesStore,
  saveAttendeesStore,
  getEventsStore,
  saveEventsStore,
  getVotingsStore,
  saveVotingsStore,
} from "@/lib/cetas-store";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const registrationSchema = z.object({
  eventId: z.string().min(1, "ID Event wajib dipilih"),
  fullName: z.string().min(2, "Nama lengkap / nama tim minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  institution: z.string().min(2, "Nama sekolah / instansi wajib diisi"),
  category: z.string().min(1, "Kategori peserta wajib dipilih"),
  notes: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

function mapLevelCodeToPrismaLevel(levelCode: string, fallbackName: string) {
  switch (levelCode) {
    case "SD":
      return { code: "SD_MI", name: "SD/MI", sortOrder: 1 };
    case "SMP":
      return { code: "SMP_MTS", name: "SMP/MTS", sortOrder: 2 };
    case "SMA":
      return { code: "SMA_SMK_MA", name: "SMA/SMK/MA", sortOrder: 3 };
    case "PURNA":
      return { code: "PURNA_CLUB_UMUM", name: "PURNA/CLUB/UMUM", sortOrder: 4 };
    default:
      return {
        code: levelCode || "UMUM",
        name: fallbackName || levelCode || "UMUM",
        sortOrder: 5,
      };
  }
}

async function syncParticipantToPrismaScore(params: {
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  levelCode: string;
  categoryTitle: string;
  participantName: string;
  schoolName: string;
  assignedNumber: number;
  photoUrl?: string | null;
}) {
  try {
    let prismaEvent = await db.event.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!prismaEvent) {
      prismaEvent = await db.event.create({
        data: {
          name: params.eventTitle || "LKBB CEMARA 2026",
          date: params.eventDate ? new Date(params.eventDate) : new Date("2026-11-28"),
          location: params.eventLocation || "SMK BUDI MURNI 2 JAKARTA",
          totalPoints: 5000,
          status: "ACTIVE",
          inputMode: "DIGITAL",
        },
      });
    }

    const defaultLevels = [
      { code: "SD_MI", name: "SD/MI", sortOrder: 1 },
      { code: "SMP_MTS", name: "SMP/MTS", sortOrder: 2 },
      { code: "SMA_SMK_MA", name: "SMA/SMK/MA", sortOrder: 3 },
      { code: "PURNA_CLUB_UMUM", name: "PURNA/CLUB/UMUM", sortOrder: 4 },
    ];
    for (const lvl of defaultLevels) {
      await db.eventLevel.upsert({
        where: {
          eventId_code: {
            eventId: prismaEvent.id,
            code: lvl.code,
          },
        },
        update: {},
        create: {
          eventId: prismaEvent.id,
          code: lvl.code,
          name: lvl.name,
          sortOrder: lvl.sortOrder,
          status: "ACTIVE",
        },
      });
    }

    const mappedLvl = mapLevelCodeToPrismaLevel(params.levelCode, params.categoryTitle);
    const eventLevel = await db.eventLevel.upsert({
      where: {
        eventId_code: {
          eventId: prismaEvent.id,
          code: mappedLvl.code,
        },
      },
      update: { status: "ACTIVE" },
      create: {
        eventId: prismaEvent.id,
        code: mappedLvl.code,
        name: mappedLvl.name,
        sortOrder: mappedLvl.sortOrder,
        status: "ACTIVE",
      },
    });

    const existing = await db.participant.findFirst({
      where: {
        eventId: prismaEvent.id,
        eventLevelId: eventLevel.id,
        name: params.participantName,
      },
    });

    if (!existing) {
      const lastInLevel = await db.participant.findFirst({
        where: {
          eventId: prismaEvent.id,
          eventLevelId: eventLevel.id,
        },
        orderBy: { number: "desc" },
      });
      const safeNumber = Math.max(params.assignedNumber, (lastInLevel?.number || 0) + 1);

      await db.participant.create({
        data: {
          eventId: prismaEvent.id,
          categoryId: null,
          eventLevelId: eventLevel.id,
          number: safeNumber,
          displayOrder: safeNumber,
          name: params.participantName,
          school: params.schoolName || null,
          level: eventLevel.name,
          photo: params.photoUrl || null,
          status: "ACTIVE",
        },
      });
    }
  } catch (err) {
    console.error("Prisma Cetas.Score sync warning:", err);
  }
}

// GET: Ambil daftar peserta & daftar event pendaftaran dari PostgreSQL CetasStore
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const type = searchParams.get("type");

  const [allAttendees, rawEvents] = await Promise.all([
    getAttendeesStore(),
    getEventsStore(),
  ]);

  const baseEvents =
    Array.isArray(rawEvents) && rawEvents.length > 0 ? rawEvents : INITIAL_UNIFIED_EVENTS;

  const events = baseEvents.map((e) => {
    const regCats = getEffectiveRegistrationCategories(e);
    const totalQuota = regCats.reduce((sum, c) => sum + c.quotaTotal, 0);
    const remQuota = regCats.reduce((sum, c) => sum + c.quotaRemaining, 0);

    return {
      ...e,
      registrationCategories: regCats,
      categoryOptions: regCats.map((c) => c.name),
      facilities:
        Array.isArray(e.facilities) && e.facilities.length > 0
          ? e.facilities
          : ["Sertifikat Digital Resmi", "E-Badge Pass QR", "Snack"],
      quotaTotal: totalQuota,
      quotaRemaining: remQuota,
      isOpenOnlineRegistration: e.isOpenOnlineRegistration !== false,
    };
  });

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

// POST: Pendaftaran peserta baru + Sinkronisasi Otomatis ke Cetas Vote & Cetas.Score (Mengikuti Kategorinya)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registrationSchema.parse(body);

    const [rawEvents, attendees, rawVotings] = await Promise.all([
      getEventsStore(),
      getAttendeesStore(),
      getVotingsStore(),
    ]);

    const events =
      Array.isArray(rawEvents) && rawEvents.length > 0 ? [...rawEvents] : [...INITIAL_UNIFIED_EVENTS];
    const votings =
      Array.isArray(rawVotings) && rawVotings.length > 0 ? [...rawVotings] : [...INITIAL_EVENT_VOTINGS];

    const eventIdx = events.findIndex((e) => e.id === validated.eventId);
    const event = eventIdx !== -1 ? events[eventIdx] : events[0];
    const targetEventIdx = eventIdx !== -1 ? eventIdx : 0;
    const resolvedEventId = event?.id || validated.eventId;
    const resolvedEventTitle = event?.title || body.eventName || "LKBB CEMARA 2026";

    const isSpectatorTicket =
      validated.institution.startsWith("Pemegang Tiket") ||
      (validated.notes || "").startsWith("Kode Tiket:");

    if (isSpectatorTicket) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const badgeCode = `CETAS-TKT-2026-${randomDigits}`;
      const qrPayload = `${badgeCode}|${resolvedEventTitle}|${validated.fullName}|${validated.category}|CONFIRMED`;
      const ticketAttendee: RegisteredAttendee = {
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
      await saveAttendeesStore([ticketAttendee, ...attendees]);
      return NextResponse.json({
        success: true,
        message: "Pemegang tiket berhasil dicatat.",
        attendee: ticketAttendee,
      });
    }

    // Ambil & validasi kuota per kategori pendaftaran
    const regCats = getEffectiveRegistrationCategories(event);
    const requestedCatCode = normalizeCategoryLevelCode(validated.category);
    let matchedCatIdx = regCats.findIndex(
      (c) =>
        c.name.trim().toLowerCase() === validated.category.trim().toLowerCase() ||
        c.code === requestedCatCode
    );

    if (matchedCatIdx === -1 && regCats.length > 0) {
      // Jika kategori belum terdaftar di list, tambahkan otomatis
      regCats.push({
        id: `reg-cat-${resolvedEventId}-${Date.now()}`,
        name: validated.category,
        code: requestedCatCode,
        quotaTotal: 35,
        quotaRemaining: 35,
      });
      matchedCatIdx = regCats.length - 1;
    }

    const matchedCat = regCats[matchedCatIdx];
    if (matchedCat && matchedCat.quotaRemaining <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Mohon maaf, kuota pendaftaran untuk kategori "${matchedCat.name}" telah penuh (0 kursi tersisa).`,
        },
        { status: 400 }
      );
    }

    const categoryTitle = matchedCat ? matchedCat.name : validated.category;
    const levelCode = matchedCat ? matchedCat.code : requestedCatCode;

    // Kurangi kuota pada kategori yang dipilih
    if (matchedCatIdx !== -1) {
      regCats[matchedCatIdx] = {
        ...regCats[matchedCatIdx],
        quotaRemaining: Math.max(0, regCats[matchedCatIdx].quotaRemaining - 1),
      };
    }

    const newTotalQuota = regCats.reduce((sum, c) => sum + c.quotaTotal, 0);
    const newRemainingQuota = regCats.reduce((sum, c) => sum + c.quotaRemaining, 0);

    // Hitung Nomor Urut Peserta di Kategori Ini (Terpisah antar kategori: SD mulai 01, SMP mulai 01, SMA mulai 01)
    const existingLkbbTeams = Array.isArray(event?.lkbbTeams) ? [...event.lkbbTeams] : [];
    const sameCategoryTeams = existingLkbbTeams.filter(
      (t) =>
        normalizeCategoryLevelCode(t.level || t.categoryName || "") === levelCode
    );
    const nextNumberInt = sameCategoryTeams.length + 1;
    const candidateNumber = String(nextNumberInt).padStart(2, "0");

    // 1. Buat Data E-Badge Attendee
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const badgeCode = `CETAS-ATD-2026-${randomDigits}`;
    const qrPayload = `${badgeCode}|${resolvedEventTitle}|${validated.fullName}|${categoryTitle}|CONFIRMED`;

    const newAttendee: RegisteredAttendee = {
      id: `atd-${Date.now()}`,
      badgeCode,
      candidateNumber,
      eventId: resolvedEventId,
      eventName: resolvedEventTitle,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      institution: validated.institution,
      category: categoryTitle,
      levelCode,
      notes: validated.notes || "",
      portfolioUrl: validated.portfolioUrl || "",
      qrPayload,
      registeredAt: new Date().toISOString(),
      isPresent: false,
      status: "CONFIRMED",
    };

    const nextAttendees = [newAttendee, ...attendees];

    // 2. AUTO-SYNC KE CETAS.SCORE (lkbbTeams di UnifiedEvent + Prisma Participant)
    const alreadyInScore = existingLkbbTeams.some(
      (t) =>
        t.teamName.trim().toLowerCase() === validated.fullName.trim().toLowerCase() &&
        normalizeCategoryLevelCode(t.level || t.categoryName || "") === levelCode
    );

    if (!alreadyInScore) {
      const newTeamScore: LKBBTeamScore = {
        id: `team-reg-${Date.now()}`,
        number: candidateNumber,
        school: validated.institution,
        teamName: validated.fullName,
        level: levelCode,
        categoryName: categoryTitle,
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      };
      existingLkbbTeams.push(newTeamScore);
    }

    if (events[targetEventIdx]) {
      events[targetEventIdx] = {
        ...events[targetEventIdx],
        registrationCategories: regCats,
        categoryOptions: regCats.map((c) => c.name),
        quotaTotal: newTotalQuota,
        quotaRemaining: newRemainingQuota,
        lkbbTeams: existingLkbbTeams,
      };
    }

    // 3. AUTO-SYNC KE CETAS VOTE (Masuk sebagai Peserta di Kategori yang Sesuai)
    let voteEvIdx = votings.findIndex(
      (v) =>
        v.eventId === resolvedEventId ||
        v.eventTitle.trim().toLowerCase() === resolvedEventTitle.trim().toLowerCase()
    );

    if (voteEvIdx === -1) {
      votings.push({
        eventId: resolvedEventId,
        eventTitle: resolvedEventTitle,
        eventDate: event?.date || "2026-11-28",
        bannerUrl:
          event?.bannerUrl && event.bannerUrl.length <= 250000
            ? event.bannerUrl
            : "/lkbb-cemara-2026.jpg",
        themePreset: event?.themePreset || "EMERALD",
        categories: regCats.map((rc) => ({
          id: `cat-${resolvedEventId}-${rc.code.toLowerCase()}`,
          eventId: resolvedEventId,
          title: rc.name,
          description: `Pemilihan peserta/pleton terfavorit ${rc.name} (Juara Favorit Terpisah)`,
          pricePerVote: 2000,
          candidates: [],
        })),
      });
      voteEvIdx = votings.length - 1;
    }

    const voteEv = votings[voteEvIdx];
    const voteCategories = Array.isArray(voteEv.categories) ? [...voteEv.categories] : [];

    // Pastikan seluruh kategori registrasi sudah ada di kategori voting
    for (const rc of regCats) {
      const existsInVote = voteCategories.some(
        (vc) =>
          vc.title.trim().toLowerCase() === rc.name.trim().toLowerCase() ||
          normalizeCategoryLevelCode(vc.title) === rc.code
      );
      if (!existsInVote) {
        voteCategories.push({
          id: `cat-${resolvedEventId}-${rc.code.toLowerCase()}-${Date.now()}`,
          eventId: resolvedEventId,
          title: rc.name,
          description: `Pemilihan peserta/pleton terfavorit ${rc.name} (Juara Favorit Terpisah)`,
          pricePerVote: 2000,
          candidates: [],
        });
      }
    }

    const targetVoteCatIdx = voteCategories.findIndex(
      (vc) =>
        vc.title.trim().toLowerCase() === categoryTitle.trim().toLowerCase() ||
        normalizeCategoryLevelCode(vc.title) === levelCode
    );

    const isUploadedImage =
      validated.portfolioUrl &&
      (validated.portfolioUrl.startsWith("data:image") ||
        /\.(jpg|jpeg|png|webp)$/i.test(validated.portfolioUrl));

    const defaultCandidatePhoto =
      isUploadedImage && validated.portfolioUrl!.length <= 250000
        ? validated.portfolioUrl!
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

    if (targetVoteCatIdx !== -1) {
      const targetCat = voteCategories[targetVoteCatIdx];
      const existingCandidates = Array.isArray(targetCat.candidates)
        ? [...targetCat.candidates]
        : [];
      const alreadyInVote = existingCandidates.some(
        (c) =>
          c.name.trim().toLowerCase() === validated.fullName.trim().toLowerCase() &&
          c.institution.trim().toLowerCase() === validated.institution.trim().toLowerCase()
      );

      if (!alreadyInVote) {
        const voteCandNumber = String(existingCandidates.length + 1).padStart(2, "0");
        existingCandidates.push({
          id: `cand-reg-${Date.now()}`,
          eventId: resolvedEventId,
          categoryId: targetCat.id,
          candidateNumber: voteCandNumber,
          name: validated.fullName,
          institution: validated.institution,
          photoUrl: defaultCandidatePhoto,
          tagline:
            validated.notes ||
            `Kontingen Resmi ${categoryTitle} — ${validated.institution}`,
          totalVotes: 0,
        });
        voteCategories[targetVoteCatIdx] = {
          ...targetCat,
          candidates: existingCandidates,
        };
      }
    }

    votings[voteEvIdx] = {
      ...voteEv,
      categories: voteCategories,
    };

    // Simpan ke semua store + Prisma secara paralel
    await Promise.all([
      saveAttendeesStore(nextAttendees),
      saveEventsStore(events),
      saveVotingsStore(votings),
      syncParticipantToPrismaScore({
        eventTitle: resolvedEventTitle,
        eventDate: event?.date,
        eventLocation: event?.location,
        levelCode,
        categoryTitle,
        participantName: validated.fullName,
        schoolName: validated.institution,
        assignedNumber: nextNumberInt,
        photoUrl: isUploadedImage ? defaultCandidatePhoto : null,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Pendaftaran berhasil! Peserta otomatis tersinkronisasi ke Cetas Vote & Cetas.Score sesuai kategorinya.",
      attendee: newAttendee,
      event: events[targetEventIdx],
      eventVotings: votings,
      syncedToVote: true,
      syncedToScore: true,
      assignedNumber: candidateNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues, message: error.issues[0]?.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses pendaftaran" },
      { status: 500 }
    );
  }
}

// PATCH: Update status kehadiran (Check-in di gate) atau hapus peserta
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
      const [attendees, events, votings] = await Promise.all([
        getAttendeesStore(),
        getEventsStore(),
        getVotingsStore(),
      ]);
      const target = attendees.find((a) => a.id === attendeeId);
      const next = attendees.filter((a) => a.id !== attendeeId);
      await saveAttendeesStore(next);

      if (target) {
        const evIdx = events.findIndex((e) => e.id === target.eventId);
        if (evIdx !== -1) {
          const regCats = getEffectiveRegistrationCategories(events[evIdx]);
          const targetCode =
            target.levelCode || normalizeCategoryLevelCode(target.category);
          const catIdx = regCats.findIndex(
            (c) =>
              c.name.trim().toLowerCase() === target.category.trim().toLowerCase() ||
              c.code === targetCode
          );
          if (catIdx !== -1) {
            regCats[catIdx] = {
              ...regCats[catIdx],
              quotaRemaining: Math.min(
                regCats[catIdx].quotaTotal,
                regCats[catIdx].quotaRemaining + 1
              ),
            };
          }
          const nextTeams = (events[evIdx].lkbbTeams || []).filter(
            (t) =>
              !(
                t.teamName.trim().toLowerCase() === target.fullName.trim().toLowerCase() &&
                normalizeCategoryLevelCode(t.level || t.categoryName || "") === targetCode
              )
          );
          events[evIdx] = {
            ...events[evIdx],
            registrationCategories: regCats,
            quotaTotal: regCats.reduce((s, c) => s + c.quotaTotal, 0),
            quotaRemaining: regCats.reduce((s, c) => s + c.quotaRemaining, 0),
            lkbbTeams: nextTeams,
          };
          await saveEventsStore(events);
        }

        const vIdx = votings.findIndex((v) => v.eventId === target.eventId);
        if (vIdx !== -1) {
          votings[vIdx].categories = votings[vIdx].categories.map((vc) => ({
            ...vc,
            candidates: vc.candidates.filter(
              (c) =>
                !(
                  c.name.trim().toLowerCase() === target.fullName.trim().toLowerCase() &&
                  c.institution.trim().toLowerCase() ===
                    target.institution.trim().toLowerCase()
                )
            ),
          }));
          await saveVotingsStore(votings);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Data peserta berhasil dihapus dan kuota kategori dikembalikan",
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
