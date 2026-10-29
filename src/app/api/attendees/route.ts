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
  coachName: z.string().optional(),
  coachPhone: z.string().optional(),
  dantonName: z.string().optional(),
  teamMembersCount: z.number().optional(),
  status: z.enum(["CONFIRMED", "WAITLIST", "CANCELLED"]).optional(),
  paymentScheme: z.enum(["LUNAS", "DP", "FREE"]).optional(),
  paymentStatus: z.enum(["PAID", "DP", "UNPAID"]).optional(),
  registrationFeeTotal: z.number().optional(),
  registrationFeePaid: z.number().optional(),
  registrationFeeRemaining: z.number().optional(),
  paymentProofUrl: z.string().optional(),
  tmLotteryNumber: z.string().optional(),
  candidateNumber: z.string().optional(),
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

  // Cari satu peserta secara spesifik berdasarkan badgeCode / email / phone untuk Portal Pelatih
  const badgeQuery = (searchParams.get("badgeCode") || searchParams.get("code") || searchParams.get("query") || "").trim().toLowerCase();
  if (badgeQuery) {
    const matched = allAttendees.find(
      (a) =>
        a.badgeCode.toLowerCase() === badgeQuery ||
        a.email.toLowerCase() === badgeQuery ||
        a.phone.replace(/\D/g, "") === badgeQuery.replace(/\D/g, "") ||
        a.id.toLowerCase() === badgeQuery
    );

    if (!matched) {
      return NextResponse.json(
        { success: false, message: "Akun pasukan / Kode E-Badge tidak ditemukan di database CETAS" },
        { status: 404 }
      );
    }

    const matchedEvent = events.find((e) => e.id === matched.eventId) || events[0];
    const isScorePublished = Boolean(matchedEvent?.isScorePublishedToCoaches);
    const matchedTeam = (matchedEvent?.lkbbTeams || []).find(
      (t) =>
        (t.teamName && matched.fullName && t.teamName.toLowerCase().trim() === matched.fullName.toLowerCase().trim()) ||
        (t.school && matched.institution && t.school.toLowerCase().trim() === matched.institution.toLowerCase().trim()) ||
        (t.number && matched.candidateNumber && t.number === matched.candidateNumber)
    ) || null;

    // JIKA NILAI FINAL BELUM DIRILIS ADMIN CETAS: Rahasiakan angka nilai dari pelatih
    const safeTeamScore = matchedTeam
      ? isScorePublished
        ? matchedTeam
        : {
            ...matchedTeam,
            pbbMurni: 0,
            variasiFormasi: 0,
            danton: 0,
            kostum: 0,
            penalty: 0,
            totalScore: 0,
            status: "SEDANG_DINILAI" as const,
          }
      : null;

    return NextResponse.json(
      {
        success: true,
        attendee: matched,
        event: matchedEvent,
        lkbbTeam: safeTeamScore,
        isScorePublished,
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

    // Hitung Skema Biaya Pendaftaran (Gratis / Lunas / Down Payment)
    const eventPrice = Number(event?.price) || 0;
    const totalFee = validated.registrationFeeTotal !== undefined ? validated.registrationFeeTotal : eventPrice;
    const requestedScheme = validated.paymentScheme || (totalFee > 0 ? "LUNAS" : "FREE");
    let paidAmount = validated.registrationFeePaid !== undefined ? validated.registrationFeePaid : (requestedScheme === "LUNAS" ? totalFee : (Number(event?.minDownPaymentAmount) || Math.round(totalFee / 2)));
    if (requestedScheme === "FREE" || totalFee === 0) {
      paidAmount = 0;
    }
    const remainingAmount = Math.max(0, totalFee - paidAmount);
    let resolvedPaymentStatus: "PAID" | "DP" | "UNPAID" = "UNPAID";
    if (totalFee === 0 || remainingAmount === 0) {
      resolvedPaymentStatus = "PAID";
    } else if (paidAmount > 0) {
      resolvedPaymentStatus = "DP";
    }

    // CATATAN KHUSUS NOMOR UNDIAN:
    // Nomor undian tampil TIDAK diberikan saat pendaftaran, melainkan diundi saat Technical Meeting (TM).
    const candidateNumber = validated.candidateNumber || validated.tmLotteryNumber || "";

    // 1. Buat Data E-Badge Attendee (Status Awal = WAITLIST / Menunggu Verifikasi Admin CETAS)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const badgeCode = `CETAS-ATD-2026-${randomDigits}`;
    const initialStatus = validated.status || "WAITLIST";
    const qrPayload = `${badgeCode}|${resolvedEventTitle}|${validated.fullName}|${categoryTitle}|${initialStatus}`;

    const newAttendee: RegisteredAttendee = {
      id: `atd-${Date.now()}`,
      badgeCode,
      candidateNumber,
      tmLotteryNumber: candidateNumber,
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
      status: initialStatus,
      coachName: validated.coachName || "",
      coachPhone: validated.coachPhone || validated.phone,
      dantonName: validated.dantonName || "",
      teamMembersCount: validated.teamMembersCount || 16,
      paymentScheme: requestedScheme,
      paymentStatus: resolvedPaymentStatus,
      registrationFeeTotal: totalFee,
      registrationFeePaid: paidAmount,
      registrationFeeRemaining: remainingAmount,
      paymentProofUrl: validated.paymentProofUrl || "",
    };

    const nextAttendees = [newAttendee, ...attendees];

    // JIKA STATUS BUKAN "CONFIRMED" (Misal WAITLIST):
    // TIDAK BOLEH masuk ke list peserta resmi, Cetas Vote, maupun juri scoring!
    if (initialStatus !== "CONFIRMED") {
      if (events[targetEventIdx]) {
        events[targetEventIdx] = {
          ...events[targetEventIdx],
          registrationCategories: regCats,
          categoryOptions: regCats.map((c) => c.name),
          quotaTotal: newTotalQuota,
          quotaRemaining: newRemainingQuota,
        };
      }

      await Promise.all([
        saveAttendeesStore(nextAttendees),
        saveEventsStore(events),
      ]);

      return NextResponse.json({
        success: true,
        message:
          "Pendaftaran pasukan berhasil diterima! Menunggu verifikasi pembayaran & berkas oleh Admin CETAS sebelum dimasukkan ke daftar lomba resmi.",
        attendee: newAttendee,
        event: events[targetEventIdx],
        assignedNumber: "",
      });
    }

    // JIKA STATUS LANGSUNG "CONFIRMED" (Misal didaftarkan langsung oleh Admin):
    // 2. AUTO-SYNC KE CETAS.SCORE (lkbbTeams di UnifiedEvent + Prisma Participant)
    const existingLkbbTeams = Array.isArray(event?.lkbbTeams) ? [...event.lkbbTeams] : [];
    const alreadyInScore = existingLkbbTeams.some(
      (t) =>
        t.teamName.trim().toLowerCase() === validated.fullName.trim().toLowerCase() &&
        normalizeCategoryLevelCode(t.level || t.categoryName || "") === levelCode
    );

    if (!alreadyInScore) {
      const newTeamScore: LKBBTeamScore = {
        id: `team-reg-${Date.now()}`,
        number: candidateNumber || "-",
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
        const voteCandNumber = candidateNumber || String(existingCandidates.length + 1).padStart(2, "0");
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
        assignedNumber: parseInt(candidateNumber, 10) || 1,
        photoUrl: isUploadedImage ? defaultCandidatePhoto : null,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Pendaftaran terkonfirmasi! Pasukan resmi masuk ke daftar peserta, Cetas Vote & Cetas.Score.",
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

// PATCH: Update status verifikasi, kehadiran (Check-in), atau hapus peserta
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, attendeeId, id, badgeCode, eventId, isOpenOnline, status, verifiedBy, coachName, coachPhone, dantonName } = body;
    const targetLookup = attendeeId || id || badgeCode;

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

    // Aksi 1: Verifikasi / Ubah Status Akun Pasukan (CONFIRMED / WAITLIST / CANCELLED)
    if (action === "UPDATE_STATUS" || action === "VERIFY_ATTENDEE" || action === "CONFIRM_ATTENDEE") {
      const [attendees, events, votings] = await Promise.all([
        getAttendeesStore(),
        getEventsStore(),
        getVotingsStore(),
      ]);

      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );

      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      const nextStatus = (status || "CONFIRMED") as "CONFIRMED" | "WAITLIST" | "CANCELLED";
      attendees[idx].status = nextStatus;

      const evIdx = events.findIndex((e) => e.id === attendees[idx].eventId);

      if (nextStatus === "CONFIRMED") {
        attendees[idx].verifiedAt = new Date().toISOString();
        attendees[idx].verifiedBy = verifiedBy || "Admin CETAS";

        // 1. Masukkan ke lkbbTeams pada event terkait
        if (evIdx !== -1) {
          const lkbbList = events[evIdx].lkbbTeams ? [...events[evIdx].lkbbTeams] : [];
          const alreadyExists = lkbbList.some(
            (t) =>
              t.teamName.trim().toLowerCase() === attendees[idx].fullName.trim().toLowerCase() &&
              t.school.trim().toLowerCase() === attendees[idx].institution.trim().toLowerCase()
          );

          if (!alreadyExists) {
            lkbbList.push({
              id: `team-verif-${Date.now()}`,
              number: attendees[idx].tmLotteryNumber || attendees[idx].candidateNumber || "-",
              school: attendees[idx].institution,
              teamName: attendees[idx].fullName,
              level: attendees[idx].levelCode || "SMP",
              categoryName: attendees[idx].category,
              pbbMurni: 0,
              variasiFormasi: 0,
              danton: 0,
              kostum: 0,
              penalty: 0,
              totalScore: 0,
              status: "BELUM_TAMPIL",
            });
            events[evIdx].lkbbTeams = lkbbList;
            await saveEventsStore(events);
          }
        }

        // 2. Masukkan ke Cetas Vote jika belum terdaftar
        const vIdx = votings.findIndex((v) => v.eventId === attendees[idx].eventId);
        if (vIdx !== -1) {
          const targetVoteCat = votings[vIdx].categories.find(
            (vc) =>
              vc.title.trim().toLowerCase() === attendees[idx].category.trim().toLowerCase() ||
              normalizeCategoryLevelCode(vc.title) === attendees[idx].levelCode
          );
          if (targetVoteCat) {
            const alreadyInVote = (targetVoteCat.candidates || []).some(
              (c) =>
                c.name.trim().toLowerCase() === attendees[idx].fullName.trim().toLowerCase() &&
                c.institution.trim().toLowerCase() === attendees[idx].institution.trim().toLowerCase()
            );
            if (!alreadyInVote) {
              const nextVoteNum = attendees[idx].tmLotteryNumber || String((targetVoteCat.candidates || []).length + 1).padStart(2, "0");
              targetVoteCat.candidates.push({
                id: `cand-verif-${Date.now()}`,
                eventId: attendees[idx].eventId,
                categoryId: targetVoteCat.id,
                candidateNumber: nextVoteNum,
                name: attendees[idx].fullName,
                institution: attendees[idx].institution,
                photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
                tagline: `Kontingen Resmi ${attendees[idx].category} — ${attendees[idx].institution}`,
                totalVotes: 0,
              });
              await saveVotingsStore(votings);
            }
          }
        }

        // 3. Sync ke Prisma PostgreSQL untuk dewan juri
        await syncParticipantToPrismaScore({
          eventTitle: attendees[idx].eventName || "LKBB CETAS",
          eventDate: evIdx !== -1 ? events[evIdx].date : undefined,
          eventLocation: evIdx !== -1 ? events[evIdx].location : undefined,
          levelCode: attendees[idx].levelCode || "SMP",
          categoryTitle: attendees[idx].category,
          participantName: attendees[idx].fullName,
          schoolName: attendees[idx].institution,
          assignedNumber: parseInt(attendees[idx].tmLotteryNumber || attendees[idx].candidateNumber || "1", 10) || 1,
        });
      } else {
        // JIKA STATUS DIUBAH KE WAITLIST ATAU CANCELLED: Keluarkan dari list lkbbTeams dan Vote
        if (evIdx !== -1) {
          events[evIdx].lkbbTeams = (events[evIdx].lkbbTeams || []).filter(
            (t) =>
              !(
                t.teamName.trim().toLowerCase() === attendees[idx].fullName.trim().toLowerCase() &&
                t.school.trim().toLowerCase() === attendees[idx].institution.trim().toLowerCase()
              )
          );
          await saveEventsStore(events);
        }
        const vIdx = votings.findIndex((v) => v.eventId === attendees[idx].eventId);
        if (vIdx !== -1) {
          votings[vIdx].categories = votings[vIdx].categories.map((vc) => ({
            ...vc,
            candidates: vc.candidates.filter(
              (c) =>
                !(
                  c.name.trim().toLowerCase() === attendees[idx].fullName.trim().toLowerCase() &&
                  c.institution.trim().toLowerCase() === attendees[idx].institution.trim().toLowerCase()
                )
            ),
          }));
          await saveVotingsStore(votings);
        }
      }

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message:
          nextStatus === "CONFIRMED"
            ? `Akun pasukan "${attendees[idx].fullName}" berhasil DIVERIFIKASI! Resmi masuk ke list peserta, Cetas Vote & Cetas.Score.`
            : `Status akun pasukan "${attendees[idx].fullName}" diubah menjadi: ${nextStatus}. Dikeluarkan dari list aktif.`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1B: Tetapkan / Ubah Nomor Undian Hasil Technical Meeting (TM)
    if (action === "UPDATE_TM_NUMBER" || action === "ASSIGN_TM_NUMBER") {
      const [attendees, events] = await Promise.all([
        getAttendeesStore(),
        getEventsStore(),
      ]);
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      const rawNumber = String(body.tmNumber ?? body.candidateNumber ?? "").trim();
      const formattedNumber = rawNumber ? (rawNumber.length === 1 ? `0${rawNumber}` : rawNumber) : "";

      attendees[idx].tmLotteryNumber = formattedNumber;
      attendees[idx].candidateNumber = formattedNumber;

      // Update di lkbbTeams jika sudah terdaftar
      const evIdx = events.findIndex((e) => e.id === attendees[idx].eventId);
      if (evIdx !== -1 && events[evIdx].lkbbTeams) {
        events[evIdx].lkbbTeams = events[evIdx].lkbbTeams.map((t) => {
          if (
            t.teamName.trim().toLowerCase() === attendees[idx].fullName.trim().toLowerCase() &&
            t.school.trim().toLowerCase() === attendees[idx].institution.trim().toLowerCase()
          ) {
            return { ...t, number: formattedNumber || "-" };
          }
          return t;
        });
        await saveEventsStore(events);
      }

      // Update di Prisma jika ada
      if (formattedNumber) {
        try {
          const numInt = parseInt(formattedNumber, 10);
          if (!isNaN(numInt)) {
            await db.participant.updateMany({
              where: {
                name: attendees[idx].fullName,
                school: attendees[idx].institution,
              },
              data: { number: numInt },
            }).catch(() => {});
          }
        } catch {}
      }

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Nomor undian Technical Meeting (TM) untuk ${attendees[idx].fullName} berhasil disimpan: #${formattedNumber || "Belum Diundi"}`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1C: Update Pembayaran Registrasi (Lunas / DP / Sisa Tagihan)
    if (action === "UPDATE_PAYMENT") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      if (body.paymentScheme) attendees[idx].paymentScheme = body.paymentScheme;
      if (body.registrationFeeTotal !== undefined) attendees[idx].registrationFeeTotal = Number(body.registrationFeeTotal);
      if (body.registrationFeePaid !== undefined) attendees[idx].registrationFeePaid = Number(body.registrationFeePaid);

      const total = attendees[idx].registrationFeeTotal || 0;
      const paid = attendees[idx].registrationFeePaid || 0;
      const remaining = Math.max(0, total - paid);
      attendees[idx].registrationFeeRemaining = remaining;

      if (body.paymentStatus) {
        attendees[idx].paymentStatus = body.paymentStatus;
      } else {
        if (total === 0 || remaining === 0) {
          attendees[idx].paymentStatus = "PAID";
        } else if (paid > 0) {
          attendees[idx].paymentStatus = "DP";
        } else {
          attendees[idx].paymentStatus = "UNPAID";
        }
      }

      if (body.paymentProofUrl) attendees[idx].paymentProofUrl = body.paymentProofUrl;

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Status pembayaran ${attendees[idx].fullName} berhasil diperbarui: ${attendees[idx].paymentStatus} (Terbayar: Rp ${paid.toLocaleString("id-ID")})`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1D: Check-in Hari-H di DP 1
    if (action === "CHECK_IN_DP1") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      const nextVal = body.checkedIn !== undefined ? Boolean(body.checkedIn) : !attendees[idx].checkedInDP1;
      attendees[idx].checkedInDP1 = nextVal;
      attendees[idx].checkedInDP1At = nextVal ? new Date().toISOString() : undefined;

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Status absensi DP 1 ${attendees[idx].fullName} berhasil diubah: ${nextVal ? "HADIR DI DP 1" : "BELUM ABSEN DP 1"}`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1E: Rilis / Tutup Nilai Final Resmi ke Pelatih
    if (action === "TOGGLE_SCORE_RELEASE" || action === "PUBLISH_SCORES") {
      const events = await getEventsStore();
      const evIdx = events.findIndex((e) => e.id === eventId);
      if (evIdx === -1) {
        return NextResponse.json(
          { success: false, message: "Event tidak ditemukan" },
          { status: 404 }
        );
      }

      const nextState =
        body.isScorePublished !== undefined
          ? Boolean(body.isScorePublished)
          : !events[evIdx].isScorePublishedToCoaches;

      events[evIdx].isScorePublishedToCoaches = nextState;
      events[evIdx].scorePublishedAt = nextState ? new Date().toISOString() : undefined;
      events[evIdx].scorePublishedBy = verifiedBy || "Admin CETAS";

      await saveEventsStore(events);

      return NextResponse.json({
        success: true,
        message: nextState
          ? "✓ Nilai final resmi berhasil DIRILIS ke seluruh pelatih! Pelatih kini dapat melihat lembar nilai pasukannya."
          : "🔒 Nilai ke pelatih berhasil DITUTUP/DIRAHASIAKAN. Pelatih tidak dapat melihat nilai sebelum dirilis kembali.",
        isScorePublishedToCoaches: nextState,
        event: events[evIdx],
      });
    }

    // Aksi 1F: Update 16 Personel Pasukan & Cadangan (Lembar 2 Sertifikat)
    if (action === "UPDATE_SQUAD_MEMBERS") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      attendees[idx].squadMembers = Array.isArray(body.squadMembers) ? body.squadMembers : [];
      if (body.dantonName) attendees[idx].dantonName = body.dantonName;

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Daftar susunan 16 personel dan cadangan untuk "${attendees[idx].fullName}" berhasil diperbarui!`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1G: Upload / Kelola Piagam Prestasi Juara Kontingen
    if (action === "UPLOAD_CHAMPION_CERTIFICATE" || action === "UPDATE_CHAMPION_CERTIFICATE") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      attendees[idx].championCertificateUrl = body.certificateUrl || body.championCertificateUrl || "";
      attendees[idx].championCertificateTitle = body.certificateTitle || body.championCertificateTitle || "Piagam Prestasi Juara Kontingen";
      attendees[idx].championCertificateUploadedAt = new Date().toISOString();
      attendees[idx].championCertificateUploadedBy = verifiedBy || "Admin CETAS";

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Piagam kejuaraan untuk "${attendees[idx].fullName}" berhasil disimpan!`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1H: Hapus Piagam Prestasi Juara
    if (action === "DELETE_CHAMPION_CERTIFICATE") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );
      if (idx === -1) {
        return NextResponse.json(
          { success: false, message: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      attendees[idx].championCertificateUrl = undefined;
      attendees[idx].championCertificateTitle = undefined;
      attendees[idx].championCertificateUploadedAt = undefined;
      attendees[idx].championCertificateUploadedBy = undefined;

      await saveAttendeesStore(attendees);

      return NextResponse.json({
        success: true,
        message: `Piagam kejuaraan untuk "${attendees[idx].fullName}" berhasil dihapus.`,
        attendee: attendees[idx],
      });
    }

    // Aksi 1I: Update Konfigurasi Tanda Tangan & Sertifikat Event
    if (action === "UPDATE_CERTIFICATE_CONFIG") {
      const events = await getEventsStore();
      const evIdx = events.findIndex((e) => e.id === eventId);
      if (evIdx === -1) {
        return NextResponse.json(
          { success: false, message: "Event tidak ditemukan" },
          { status: 404 }
        );
      }

      events[evIdx].certificateConfig = {
        ...(events[evIdx].certificateConfig || {}),
        ...(body.certificateConfig || {}),
      };

      await saveEventsStore(events);

      return NextResponse.json({
        success: true,
        message: `Konfigurasi nama, TTD, dan stempel sertifikat untuk event "${events[evIdx].title}" berhasil disimpan!`,
        event: events[evIdx],
        certificateConfig: events[evIdx].certificateConfig,
      });
    }

    // Aksi 2: Check-in Kehadiran di Gate (Tandai Hadir / Batal Hadir)
    if (action === "CHECK_IN" || action === "MARK_ATTENDANCE") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );

      if (idx !== -1) {
        if (body.isPresent !== undefined) {
          attendees[idx].isPresent = Boolean(body.isPresent);
        } else {
          attendees[idx].isPresent = !attendees[idx].isPresent;
        }

        await saveAttendeesStore(attendees);
        return NextResponse.json({
          success: true,
          message: `Status kehadiran ${attendees[idx].fullName} diubah menjadi: ${
            attendees[idx].isPresent ? "HADIR (Check-in Gate)" : "BELUM HADIR"
          }`,
          attendee: attendees[idx],
        });
      }
    }

    // Aksi 3: Perbarui Data Pelatih / Pasukan
    if (action === "UPDATE_COACH_INFO") {
      const attendees = await getAttendeesStore();
      const idx = attendees.findIndex(
        (a) => a.id === targetLookup || a.badgeCode === targetLookup
      );

      if (idx !== -1) {
        if (coachName) attendees[idx].coachName = coachName;
        if (coachPhone) attendees[idx].coachPhone = coachPhone;
        if (dantonName) attendees[idx].dantonName = dantonName;
        await saveAttendeesStore(attendees);
        return NextResponse.json({
          success: true,
          message: "Data pelatih berhasil diperbarui",
          attendee: attendees[idx],
        });
      }
    }

    // Aksi 4: Hapus Peserta & Kembalikan Kuota
    if (action === "DELETE_ATTENDEE" && targetLookup) {
      const [attendees, events, votings] = await Promise.all([
        getAttendeesStore(),
        getEventsStore(),
        getVotingsStore(),
      ]);
      const target = attendees.find((a) => a.id === targetLookup || a.badgeCode === targetLookup);
      const next = attendees.filter((a) => a.id !== targetLookup && a.badgeCode !== targetLookup);
      await saveAttendeesStore(next);

      if (target) {
        // Hapus juga dari database Prisma jika ada
        try {
          await db.participant.deleteMany({
            where: {
              name: target.fullName,
            },
          });
        } catch (dbErr) {
          console.warn("Participant deleteMany warning:", dbErr);
        }

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
                t.teamName.trim().toLowerCase() === target.fullName.trim().toLowerCase() ||
                (target.candidateNumber && t.number === target.candidateNumber) ||
                (target.tmLotteryNumber && t.number === target.tmLotteryNumber)
              )
          );
          events[evIdx] = {
            ...events[evIdx],
            registrationCategories: regCats,
            quotaTotal: regCats.reduce((s, c) => s + c.quotaTotal, 0),
            quotaRemaining: regCats.reduce((s, c) => s + c.quotaRemaining, 0),
            lkbbTeams: nextTeams,
            updatedAt: Date.now(),
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
        attendees: next,
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

// PUT: Terhubung ke handler PATCH agar kompatibel dengan pemanggilan PUT maupun PATCH
export async function PUT(req: NextRequest) {
  return PATCH(req);
}
