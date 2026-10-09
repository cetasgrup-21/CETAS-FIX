import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function text(value: unknown) {
  return String(value ?? "").trim();
}

function int(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function scoreNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function getActiveEvent() {
  return db.event.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      logo: true,
      totalPoints: true,
      levels: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        select: { id: true, code: true, name: true, sortOrder: true },
      },
      categories: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          eventLevelId: true,
          percentage: true,
          sortOrder: true,
        },
      },
    },
  });
}

async function getParticipants(eventId: string, levelId: string) {
  const level = await db.eventLevel.findUnique({
    where: { id: levelId },
    select: { id: true, name: true, code: true },
  });

  if (!level) return { level: null, participants: [] };

  const participants = await db.participant.findMany({
    where: {
      eventId,
      status: "ACTIVE",
      OR: [
        { eventLevelId: level.id },
        { eventLevelId: null, level: level.name },
        { eventLevelId: null, level: level.code },
      ],
    },
    orderBy: [
      { displayOrder: "asc" },
      { number: "asc" },
      { name: "asc" },
    ],
    select: {
      id: true,
      number: true,
      displayOrder: true,
      name: true,
      school: true,
      level: true,
      eventLevelId: true,
      results: {
        select: {
          finalScore: true,
          rawScore: true,
          bonus: true,
          penalty: true,
          rank: true,
          status: true,
        },
      },
    },
  });

  return { level, participants };
}

function parseDurationSeconds(value: unknown): number | null {
  const raw = text(value);
  if (!raw) return null;

  // Numeric seconds are accepted for internal compatibility.
  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  const parts = raw.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (minutes < 0 || seconds < 0 || seconds >= 60) return null;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

function parseTimerTieBreaker(key: string) {
  const raw = text(key);
  if (!raw.startsWith("TIMER_")) return null;

  const [modeRaw, targetRaw = ""] = raw.split("|", 2);
  const mode = modeRaw === "TIMER_FASTEST" ? "FASTEST" :
    modeRaw === "TIMER_CLOSEST" ? "CLOSEST" : null;

  if (!mode) return null;

  const target = targetRaw ? parseDurationSeconds(targetRaw) : null;
  return { mode, target };
}

function timerDurationSeconds(record: {
  status: string;
  startedAt: Date | null;
  stoppedAt: Date | null;
  durationSec: number | null;
}, now = Date.now()) {
  if (record.status === "RUNNING" && record.startedAt) {
    return Math.max(0, Math.floor((now - record.startedAt.getTime()) / 1000));
  }

  if (record.startedAt && record.stoppedAt) {
    const rangeDuration = Math.max(
      0,
      Math.floor((record.stoppedAt.getTime() - record.startedAt.getTime()) / 1000)
    );
    return Math.max(rangeDuration, int(record.durationSec, 0));
  }

  if (record.durationSec != null) {
    return Math.max(0, int(record.durationSec, 0));
  }

  return null;
}

function timerKeyIsValid(key: string) {
  const parsed = parseTimerTieBreaker(key);
  return Boolean(parsed && (parsed.mode === "FASTEST" || parsed.target != null));
}

function rankParticipants(
  participants: Array<{
    id: string;
    number: number;
    displayOrder: number | null;
    name: string;
    school: string | null;
    level: string | null;
    eventLevelId: string | null;
    results: {
      finalScore: number;
      rawScore: number;
      bonus: number;
      penalty: number;
      rank: number | null;
      status: string;
    } | null;
  }>,
  tieBreakers: string[] = [],
  categoryScoresByParticipant: Map<
    string,
    Map<string, number>
  > = new Map(),
  timerSecondsByParticipant: Map<string, number> = new Map()
) {
  const rows = participants
    .map((p) => ({
      participantId: p.id,
      number: p.number,
      name: p.name,
      school: p.school,
      finalScore: scoreNumber(p.results?.finalScore),
      rawScore: scoreNumber(p.results?.rawScore),
      bonus: scoreNumber(p.results?.bonus),
      penalty: scoreNumber(p.results?.penalty),
      complete: p.results?.rank != null,
    }))
    .sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }

      for (const key of tieBreakers) {
        const timer = parseTimerTieBreaker(key);

        if (timer) {
          const aSeconds = timerSecondsByParticipant.get(a.participantId);
          const bSeconds = timerSecondsByParticipant.get(b.participantId);

          if (aSeconds == null && bSeconds == null) continue;
          if (aSeconds == null) return 1;
          if (bSeconds == null) return -1;

          if (timer.mode === "FASTEST") {
            if (aSeconds !== bSeconds) return aSeconds - bSeconds;
            continue;
          }

          if (timer.target == null) continue;

          const aDistance = Math.abs(aSeconds - timer.target);
          const bDistance = Math.abs(bSeconds - timer.target);

          if (aDistance !== bDistance) {
            return aDistance - bDistance;
          }

          // Jika jarak ke target sama, waktu yang lebih cepat menang.
          if (aSeconds !== bSeconds) return aSeconds - bSeconds;
          continue;
        }

        const getValue = (row: typeof a) => {
          if (key === "RAW_SCORE") return row.rawScore;
          if (key === "BONUS") return row.bonus;
          if (key === "PENALTY") return row.penalty;
          if (key === "NUMBER") return -row.number;

          return (
            categoryScoresByParticipant
              .get(row.participantId)
              ?.get(key) || 0
          );
        };

        const difference =
          getValue(b) - getValue(a);

        if (difference !== 0) {
          return difference;
        }
      }

      return a.number - b.number;
    });

  let rank = 0;
  return rows.map((row, index) => {
    if (row.complete) rank = index + 1;
    return { ...row, rank: row.complete ? rank : null };
  });
}

async function categoryScores(
  eventId: string,
  participantIds: string[],
  categoryId: string
) {
  if (!participantIds.length || !categoryId) return new Map<string, number>();

  const scores = await db.score.findMany({
    where: {
      participantId: { in: participantIds },
      categoryId,
    },
    select: {
      participantId: true,
      score: true,
    },
  });

  const map = new Map<string, number>();
  for (const item of scores) {
    map.set(
      item.participantId,
      (map.get(item.participantId) || 0) + scoreNumber(item.score)
    );
  }
  return map;
}

async function autoWinner(
  award: {
    method: string;
    rankPosition: number | null;
    sourceCategoryId: string | null;
  },
  ranked: ReturnType<typeof rankParticipants>,
  categoryMap: Map<string, number>
) {
  if (award.method === "RANKING") {
    const target = ranked.find(
      (row) => row.complete && row.rank === int(award.rankPosition, 0)
    );
    return target ? [target] : [];
  }

  if (award.method === "CATEGORY_SCORE") {
    return [...ranked]
      .filter((row) => row.complete)
      .sort(
        (a, b) =>
          (categoryMap.get(b.participantId) || 0) -
          (categoryMap.get(a.participantId) || 0)
      )
      .slice(0, 1)
      .map((row) => ({
        ...row,
        categoryScore: categoryMap.get(row.participantId) || 0,
      }));
  }

  return [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const levelId = text(searchParams.get("eventLevelId"));

    const event = await getActiveEvent();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event aktif belum tersedia." },
        { status: 404 }
      );
    }

    const awards = await db.awardCategory.findMany({
      where: {
        eventId: event.id,
        ...(levelId ? { eventLevelId: levelId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        sourceCategory: {
          select: { id: true, name: true },
        },
        categorySources: {
          orderBy: { sortOrder: "asc" },
          include: {
            category: {
              select: { id: true, name: true, percentage: true },
            },
          },
        },
        winners: {
          orderBy: { winnerOrder: "asc" },
          include: {
            participant: {
              select: {
                id: true,
                number: true,
                name: true,
                school: true,
              },
            },
          },
        },
      },
    });

    let ranking: ReturnType<typeof rankParticipants> = [];
    let categoryScoreMap = new Map<string, number>();
    let categoryScoresByParticipant = new Map<
      string,
      Map<string, number>
    >();

    if (levelId) {
      const { participants } = await getParticipants(
        event.id,
        levelId
      );

      const participantIds = participants.map(
        (p) => p.id
      );

      const activeLevelCategoryIds = event.categories
        .filter(
          (category) =>
            !category.eventLevelId ||
            category.eventLevelId === levelId
        )
        .map((category) => category.id);

      if (
        activeLevelCategoryIds.length &&
        participantIds.length
      ) {
        const allScores = await db.score.findMany({
          where: {
            participantId: {
              in: participantIds,
            },
            categoryId: {
              in: activeLevelCategoryIds,
            },
          },
          select: {
            participantId: true,
            categoryId: true,
            score: true,
          },
        });

        categoryScoresByParticipant = new Map();

        for (const score of allScores) {
          if (
            !categoryScoresByParticipant.has(
              score.participantId
            )
          ) {
            categoryScoresByParticipant.set(
              score.participantId,
              new Map()
            );
          }

          const map =
            categoryScoresByParticipant.get(
              score.participantId
            )!;

          map.set(
            score.categoryId,
            (map.get(score.categoryId) || 0) +
              scoreNumber(score.score)
          );
        }
      }

      ranking = rankParticipants(
        participants
      ).map((row) => ({
        ...row,
        categoryScores: Object.fromEntries(
          categoryScoresByParticipant.get(
            row.participantId
          ) || new Map()
        ),
      }));

      const sourceCategoryIds = awards
        .map((award) => award.sourceCategoryId)
        .filter((id): id is string => Boolean(id));

      const first = sourceCategoryIds[0];

      if (first) {
        for (const [participantId, scores] of categoryScoresByParticipant) {
          if (scores.has(first)) {
            categoryScoreMap.set(
              participantId,
              scores.get(first) || 0
            );
          }
        }
      }
    }

    const awardsForResponse = awards.map((award) => ({
      ...award,
      tieBreakers: (() => {
        try {
          const parsed = JSON.parse(award.tieBreakers || "[]");
          return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        logo: event.logo,
        totalPoints: event.totalPoints,
      },
      levels: event.levels,
      categories: event.categories,
      awards: awardsForResponse,
      ranking,
      sourceCategoryPreview: Object.fromEntries(categoryScoreMap),
    });
  } catch (error) {
    console.error("GET AWARDS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil dashboard juara.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = await getActiveEvent();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event aktif belum tersedia." },
        { status: 404 }
      );
    }

    const name = text(body.name);
    const method = text(body.method) || "RANKING";
    const eventLevelId = text(body.eventLevelId) || null;
    const sourceCategoryId = text(body.sourceCategoryId) || null;
    const rankPosition = body.rankPosition == null
      ? null
      : int(body.rankPosition, 1);
    const requestedTieBreakers: string[] = Array.isArray(body.tieBreakers)
      ? body.tieBreakers.filter(
          (item: unknown): item is string =>
            typeof item === "string" && item.trim().length > 0
        )
      : [];

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori juara wajib diisi." },
        { status: 400 }
      );
    }

    if (!["RANKING", "CATEGORY_SCORE", "MANUAL"].includes(method)) {
      return NextResponse.json(
        { success: false, error: "Metode penentuan juara tidak valid." },
        { status: 400 }
      );
    }

    const award = await db.awardCategory.create({
      data: {
        eventId: event.id,
        eventLevelId,
        sourceCategoryId:
          method === "CATEGORY_SCORE" ? sourceCategoryId : null,
        name,
        method,
        rankPosition:
          method === "RANKING" ? rankPosition : null,
        sortOrder: await db.awardCategory.count({
          where: { eventId: event.id, eventLevelId },
        }),
        status: "DRAFT",
        tieBreakers: JSON.stringify([...new Set(requestedTieBreakers)]),
      },
      include: {
        sourceCategory: {
          select: { id: true, name: true },
        },
        categorySources: {
          orderBy: { sortOrder: "asc" },
          include: {
            category: {
              select: { id: true, name: true, percentage: true },
            },
          },
        },
        winners: {
          include: {
            participant: {
              select: {
                id: true,
                number: true,
                name: true,
                school: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, award },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE AWARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat kategori juara.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = text(body.id);
    const action = text(body.action);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kategori juara wajib diisi." },
        { status: 400 }
      );
    }

    const award = await db.awardCategory.findUnique({
      where: { id },
      include: {
        winners: true,
        categorySources: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!award) {
      return NextResponse.json(
        { success: false, error: "Kategori juara tidak ditemukan." },
        { status: 404 }
      );
    }

    if (award.lockedAt && action !== "unlock") {
      return NextResponse.json(
        { success: false, error: "Hasil sudah dikunci." },
        { status: 409 }
      );
    }

    if (action === "lock") {
      const updated = await db.awardCategory.update({
        where: { id },
        data: {
          status: "FINAL",
          lockedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, award: updated });
    }

    if (action === "unlock") {
      const updated = await db.awardCategory.update({
        where: { id },
        data: {
          status: "DRAFT",
          lockedAt: null,
        },
      });
      return NextResponse.json({ success: true, award: updated });
    }

    if (action === "delete") {
      await db.awardCategory.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === "save") {
      const name = text(body.name);
      const method = text(body.method) || award.method;
      const eventLevelId = text(body.eventLevelId) || null;
      const sourceCategoryId = text(body.sourceCategoryId) || null;
      const rankPosition =
        body.rankPosition == null
          ? null
          : int(body.rankPosition, 1);

      if (!name) {
        return NextResponse.json(
          { success: false, error: "Nama kategori juara wajib diisi." },
          { status: 400 }
        );
      }

      const saveTieBreakers = Array.isArray(body.tieBreakers)
        ? body.tieBreakers.filter(
            (item: unknown): item is string =>
              typeof item === "string" && item.trim().length > 0
          )
        : null;

      await db.awardCategory.update({
        where: { id },
        data: {
          name,
          method,
          eventLevelId,
          sourceCategoryId:
            method === "CATEGORY_SCORE" ? sourceCategoryId : null,
          rankPosition:
            method === "RANKING" ? rankPosition : null,
          ...(saveTieBreakers !== null
            ? { tieBreakers: JSON.stringify([...new Set(saveTieBreakers)]) }
            : {}),
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "saveTieBreakers") {
      const requested: string[] = Array.isArray(body.tieBreakers)
  ? body.tieBreakers.filter(
      (item: unknown): item is string =>
        typeof item === "string" && item.trim().length > 0
    )
  : [];

const unique: string[] = Array.from(
  new Set<string>(requested)
);

      // Validasi: hanya kategori yang memang tersedia pada event/tingkatan
      // award ini yang boleh dijadikan tie breaker. Field teknis tetap boleh.
      const event = await getActiveEvent();
      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event aktif belum tersedia." },
          { status: 404 }
        );
      }

      const allowedTechnical = new Set([
        "RAW_SCORE",
        "BONUS",
        "PENALTY",
        "NUMBER",
      ]);

      const allowedCategories: Set<string> = new Set<string>(
  event.categories
    .filter(
      (category) =>
        !category.eventLevelId ||
        !award.eventLevelId ||
        category.eventLevelId === award.eventLevelId
    )
    .map((category) => category.id)
);

      const invalid = unique.find(
        (key) =>
          !allowedTechnical.has(key) &&
          !allowedCategories.has(key) &&
          !timerKeyIsValid(key)
      );

      if (invalid) {
        return NextResponse.json(
          { success: false, error: `Tie breaker tidak valid: ${invalid}` },
          { status: 400 }
        );
      }

      await db.awardCategory.update({
        where: { id: award.id },
        data: { tieBreakers: JSON.stringify(unique) },
      });

      await db.awardCategorySource.deleteMany({
        where: { awardCategoryId: award.id },
      });

      // AwardCategorySource hanya menyimpan categoryId, sehingga field teknis
      // disimpan di note-free UI state dan dikirim kembali saat autoWinner.
      // Untuk kategori nilai, simpan ke tabel relasi dengan sortOrder.
      const categoryOnly = unique.filter((key) => allowedCategories.has(key));

      if (categoryOnly.length) {
        await db.awardCategorySource.createMany({
          data: categoryOnly.map((categoryId, index) => ({
            awardCategoryId: award.id,
            categoryId,
            sortOrder: index,
          })),
        });
      }

      return NextResponse.json({
        success: true,
        tieBreakers: unique,
      });
    }

    if (action === "setWinner") {
      const participantId = text(body.participantId);

      if (!participantId) {
        return NextResponse.json(
          { success: false, error: "Peserta juara wajib dipilih." },
          { status: 400 }
        );
      }

      await db.awardWinner.deleteMany({
        where: { awardCategoryId: award.id },
      });

      const winner = await db.awardWinner.create({
        data: {
          awardCategoryId: award.id,
          participantId,
          winnerOrder: 1,
          source: "MANUAL",
        },
        include: {
          participant: {
            select: {
              id: true,
              number: true,
              name: true,
              school: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, winner });
    }

    if (action === "autoWinner") {
      const event = await getActiveEvent();

      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event aktif belum tersedia." },
          { status: 404 }
        );
      }

      if (!award.eventLevelId) {
        return NextResponse.json(
          { success: false, error: "Pilih tingkatan untuk penentuan otomatis." },
          { status: 400 }
        );
      }

      const { participants } = await getParticipants(
        event.id,
        award.eventLevelId
      );

      const participantIds = participants.map(
        (p) => p.id
      );

      const activeLevelCategoryIds = event.categories
        .filter(
          (category) =>
            !category.eventLevelId ||
            category.eventLevelId === award.eventLevelId
        )
        .map((category) => category.id);

      const allScores =
        participantIds.length &&
        activeLevelCategoryIds.length
          ? await db.score.findMany({
              where: {
                participantId: {
                  in: participantIds,
                },
                categoryId: {
                  in: activeLevelCategoryIds,
                },
              },
              select: {
                participantId: true,
                categoryId: true,
                score: true,
              },
            })
          : [];

      const categoryScoresByParticipant = new Map<
        string,
        Map<string, number>
      >();

      for (const score of allScores) {
        if (
          !categoryScoresByParticipant.has(
            score.participantId
          )
        ) {
          categoryScoresByParticipant.set(
            score.participantId,
            new Map()
          );
        }

        const map =
          categoryScoresByParticipant.get(
            score.participantId
          )!;

        map.set(
          score.categoryId,
          (map.get(score.categoryId) || 0) +
            scoreNumber(score.score)
        );
      }

      const requestedTieBreakers = Array.isArray(body.tieBreakers)
        ? body.tieBreakers.filter(
            (item: unknown): item is string =>
              typeof item === "string" && item.trim().length > 0
          )
        : [];

      let savedTieBreakers: string[] = [];
      try {
        const parsed = JSON.parse(award.tieBreakers || "[]");
        if (Array.isArray(parsed)) {
          savedTieBreakers = parsed.filter(
            (item): item is string => typeof item === "string" && item.trim().length > 0
          );
        }
      } catch {
        savedTieBreakers = [];
      }

      if (!savedTieBreakers.length) {
        savedTieBreakers = award.categorySources
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((source) => source.categoryId);
      }

      const activeTieBreakers =
        requestedTieBreakers.length > 0
          ? requestedTieBreakers
          : savedTieBreakers;

      const timerTieBreakerActive = activeTieBreakers.some(
  (key: string) => Boolean(parseTimerTieBreaker(key))
);
      const timerSecondsByParticipant = new Map<string, number>();

      if (timerTieBreakerActive && participantIds.length) {
        const timerRecords = await db.timerRecord.findMany({
          where: {
            eventId: event.id,
            participantId: { in: participantIds },
          },
          orderBy: { createdAt: "desc" },
          select: {
            participantId: true,
            status: true,
            startedAt: true,
            stoppedAt: true,
            durationSec: true,
            createdAt: true,
          },
        });

        const now = Date.now();
        const seen = new Set<string>();
        for (const record of timerRecords) {
          if (seen.has(record.participantId)) continue;
          const duration = timerDurationSeconds(record, now);
          if (duration == null) continue;
          seen.add(record.participantId);
          timerSecondsByParticipant.set(record.participantId, duration);
        }
      }

      const ranked = rankParticipants(
        participants,
        activeTieBreakers,
        categoryScoresByParticipant,
        timerSecondsByParticipant
      );

      let categoryMap = new Map<string, number>();

      if (award.method === "CATEGORY_SCORE") {
        if (!award.sourceCategoryId) {
          return NextResponse.json(
            { success: false, error: "Pilih kategori sumber nilai." },
            { status: 400 }
          );
        }

        categoryMap =
          await categoryScores(
            event.id,
            participantIds,
            award.sourceCategoryId
          );
      }

      const winners = await autoWinner(
        award,
        ranked,
        categoryMap
      );

      if (!winners.length) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Belum ada peserta lengkap yang memenuhi syarat penentuan juara.",
          },
          { status: 400 }
        );
      }

      await db.awardWinner.deleteMany({
        where: { awardCategoryId: award.id },
      });

      await db.awardWinner.create({
        data: {
          awardCategoryId: award.id,
          participantId: winners[0].participantId,
          winnerOrder: 1,
          source: award.method,
          score:
            award.method === "CATEGORY_SCORE"
              ? scoreNumber(categoryMap.get(winners[0].participantId))
              : scoreNumber(winners[0].finalScore),
        },
      });

      return NextResponse.json({
        success: true,
        winner: winners[0],
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("UPDATE AWARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui kategori juara.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = text(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kategori juara wajib diisi." },
        { status: 400 }
      );
    }

    await db.awardCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE AWARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus kategori juara.",
      },
      { status: 500 }
    );
  }
}