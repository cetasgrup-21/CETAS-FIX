import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TIMER_TIE_PREFIX = "TIMER_CLOSEST|";

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

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function parseTieBreakers(raw: unknown): string[] {
  if (Array.isArray(raw)) return uniqueStrings(raw);
  if (typeof raw !== "string" || !raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? uniqueStrings(parsed) : [];
  } catch {
    return [];
  }
}

function parseClockToSeconds(value: string) {
  const parts = value.trim().split(":").map(Number);

  if (parts.some((part) => !Number.isFinite(part) || part < 0)) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (seconds >= 60) return null;
    return Math.floor(minutes * 60 + seconds);
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (minutes >= 60 || seconds >= 60) return null;
    return Math.floor(hours * 3600 + minutes * 60 + seconds);
  }

  return null;
}

function timerTargetSeconds(key: string) {
  if (!key.startsWith(TIMER_TIE_PREFIX)) return null;
  return parseClockToSeconds(key.slice(TIMER_TIE_PREFIX.length));
}

type ParticipantRow = {
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
};

type RankedRow = {
  participantId: string;
  number: number;
  name: string;
  school: string | null;
  finalScore: number;
  rawScore: number;
  bonus: number;
  penalty: number;
  complete: boolean;
  rank: number;
  categoryScore?: number;
  timerDurationSec?: number | null;
};

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
        select: {
          id: true,
          code: true,
          name: true,
          sortOrder: true,
        },
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
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!level) {
    return {
      level: null,
      participants: [] as ParticipantRow[],
    };
  }

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

  return {
    level,
    participants,
  };
}

async function getTimerDurations(
  eventId: string,
  participantIds: string[]
) {
  const map = new Map<string, number>();

  if (!participantIds.length) return map;

  const records = await db.timerRecord.findMany({
    where: {
      eventId,
      participantId: { in: participantIds },
      durationSec: { not: null },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      participantId: true,
      durationSec: true,
    },
  });

  for (const record of records) {
    if (
      record.durationSec != null &&
      !map.has(record.participantId)
    ) {
      map.set(record.participantId, record.durationSec);
    }
  }

  return map;
}

function rankParticipants(
  participants: ParticipantRow[],
  tieBreakers: string[] = [],
  categoryScoresByParticipant: Map<string, Map<string, number>> = new Map(),
  timerDurations: Map<string, number> = new Map(),
  primaryScoresByParticipant?: Map<string, number>
): RankedRow[] {
  const rows = participants.map((participant) => {
    const result = participant.results ?? null;

    return {
      participantId: participant.id,
      number: participant.number,
      name: participant.name,
      school: participant.school,
      finalScore: scoreNumber(result?.finalScore),
      rawScore: scoreNumber(result?.rawScore),
      bonus: scoreNumber(result?.bonus),
      penalty: scoreNumber(result?.penalty),
      complete: true,
      rank: 0,
      categoryScore: primaryScoresByParticipant?.get(participant.id),
      timerDurationSec: timerDurations.get(participant.id) ?? null,
    };
  });

  rows.sort((a, b) => {
    const primaryA =
      primaryScoresByParticipant?.get(a.participantId) ??
      a.finalScore;

    const primaryB =
      primaryScoresByParticipant?.get(b.participantId) ??
      b.finalScore;

    if (primaryB !== primaryA) {
      return primaryB - primaryA;
    }

    for (const key of tieBreakers) {
      const timerTarget = timerTargetSeconds(key);

      if (timerTarget != null) {
        const durationA = timerDurations.get(a.participantId);
        const durationB = timerDurations.get(b.participantId);

        // Peserta yang belum mempunyai waktu diletakkan setelah
        // peserta yang mempunyai record timer.
        if (durationA == null && durationB != null) return 1;
        if (durationA != null && durationB == null) return -1;

        if (durationA != null && durationB != null) {
          const distanceA = Math.abs(durationA - timerTarget);
          const distanceB = Math.abs(durationB - timerTarget);

          if (distanceA !== distanceB) {
            return distanceA - distanceB;
          }

          // Jika jaraknya sama, waktu yang lebih cepat menang.
          if (durationA !== durationB) {
            return durationA - durationB;
          }
        }

        continue;
      }

      const getValue = (row: RankedRow) => {
        if (key === "FINAL_SCORE") return row.finalScore;
        if (key === "RAW_SCORE") return row.rawScore;
        if (key === "BONUS") return row.bonus;
        if (key === "PENALTY") return row.penalty;

        // Nomor peserta lebih kecil = prioritas lebih tinggi.
        if (key === "NUMBER") return -row.number;

        return (
          categoryScoresByParticipant
            .get(row.participantId)
            ?.get(key) ?? 0
        );
      };

      const difference = getValue(b) - getValue(a);

      if (difference !== 0) {
        return difference;
      }
    }

    // Penentu terakhir: nomor peserta terkecil.
    return a.number - b.number;
  });

  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

async function getCategoryScoreMaps(
  participantIds: string[],
  categoryIds: string[]
) {
  const allScores =
    participantIds.length && categoryIds.length
      ? await db.score.findMany({
          where: {
            participantId: { in: participantIds },
            categoryId: { in: categoryIds },
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

  for (const item of allScores) {
    if (!categoryScoresByParticipant.has(item.participantId)) {
      categoryScoresByParticipant.set(
        item.participantId,
        new Map()
      );
    }

    const map =
      categoryScoresByParticipant.get(item.participantId)!;

    map.set(
      item.categoryId,
      (map.get(item.categoryId) || 0) +
        scoreNumber(item.score)
    );
  }

  return categoryScoresByParticipant;
}

function combinedCategoryScores(
  participantIds: string[],
  categoryIds: string[],
  categoryScoresByParticipant: Map<string, Map<string, number>>
) {
  const map = new Map<string, number>();

  for (const participantId of participantIds) {
    const scores =
      categoryScoresByParticipant.get(participantId) ||
      new Map<string, number>();

    let total = 0;

    for (const categoryId of categoryIds) {
      total += scoreNumber(scores.get(categoryId));
    }

    map.set(participantId, total);
  }

  return map;
}

async function categoryScores(
  participantIds: string[],
  categoryId: string
) {
  const maps = await getCategoryScoreMaps(
    participantIds,
    [categoryId]
  );

  const result = new Map<string, number>();

  for (const participantId of participantIds) {
    result.set(
      participantId,
      maps.get(participantId)?.get(categoryId) || 0
    );
  }

  return result;
}

function winnerSelect() {
  return {
    id: true,
    participantId: true,
    winnerOrder: true,
    source: true,
    score: true,
    note: true,
    createdAt: true,
    participant: {
      select: {
        id: true,
        number: true,
        name: true,
        school: true,
      },
    },
  } as const;
}

async function loadAward(id: string) {
  return db.awardCategory.findUnique({
    where: { id },
    include: {
      sourceCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      categorySources: {
        orderBy: { sortOrder: "asc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              percentage: true,
              sortOrder: true,
              eventLevelId: true,
            },
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
}

async function saveAllRankedWinners(
  awardId: string,
  ranked: RankedRow[],
  source: string,
  scoreMap?: Map<string, number>
) {
  await db.awardWinner.deleteMany({
    where: { awardCategoryId: awardId },
  });

  if (!ranked.length) return [];

  await db.awardWinner.createMany({
    data: ranked.map((row) => ({
      awardCategoryId: awardId,
      participantId: row.participantId,
      winnerOrder: row.rank,
      source,
      score: scoreMap?.get(row.participantId) ?? row.finalScore,
    })),
  });

  return ranked;
}

function manualEntries(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const item = entry as Record<string, unknown>;

      return {
        participantId: text(item.participantId) || null,
        name: text(item.name),
        school: text(item.school),
        score: scoreNumber(item.score),
      };
    })
    .filter(
      (
        entry
      ): entry is {
        participantId: string | null;
        name: string;
        school: string;
        score: number;
      } => Boolean(entry?.name)
    );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const levelId = text(searchParams.get("eventLevelId"));

    const event = await getActiveEvent();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event aktif belum tersedia.",
        },
        { status: 404 }
      );
    }

    const awards = await db.awardCategory.findMany({
      where: {
        eventId: event.id,
        ...(levelId ? { eventLevelId: levelId } : {}),
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        sourceCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        categorySources: {
          orderBy: { sortOrder: "asc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                percentage: true,
                sortOrder: true,
                eventLevelId: true,
              },
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

    let ranking: RankedRow[] = [];
    let categoryScoreMap = new Map<string, number>();
    let categoryScoresByParticipant =
      new Map<string, Map<string, number>>();

    if (levelId) {
      const { participants } =
        await getParticipants(event.id, levelId);

      const participantIds = participants.map(
        (participant) => participant.id
      );

      const activeLevelCategoryIds =
        event.categories
          .filter(
            (category) =>
              !category.eventLevelId ||
              category.eventLevelId === levelId
          )
          .map((category) => category.id);

      categoryScoresByParticipant =
        await getCategoryScoreMaps(
          participantIds,
          activeLevelCategoryIds
        );

      ranking = rankParticipants(
        participants,
        [],
        categoryScoresByParticipant
      ).map((row) => ({
        ...row,
        categoryScores: Object.fromEntries(
          categoryScoresByParticipant.get(
            row.participantId
          ) || new Map()
        ),
      })) as RankedRow[];

      const firstSource =
        awards.find(
          (award) => award.sourceCategoryId
        )?.sourceCategoryId;

      if (firstSource) {
        for (const participantId of participantIds) {
          categoryScoreMap.set(
            participantId,
            categoryScoresByParticipant.get(
              participantId
            )?.get(firstSource) || 0
          );
        }
      }
    }

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
      awards,
      ranking,
      sourceCategoryPreview:
        Object.fromEntries(categoryScoreMap),
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
        {
          success: false,
          error: "Event aktif belum tersedia.",
        },
        { status: 404 }
      );
    }

    const name = text(body.name);
    const method =
      text(body.method) || "CATEGORY_SCORE";
    const eventLevelId =
      text(body.eventLevelId) || null;

    const sourceCategoryIds =
      uniqueStrings(
        body.sourceCategoryIds ??
          (body.sourceCategoryId
            ? [body.sourceCategoryId]
            : [])
      );

    const tieBreakers =
      parseTieBreakers(body.tieBreakers);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama kategori juara wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      ![
        "RANKING",
        "CATEGORY_SCORE",
        "MANUAL",
      ].includes(method)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Metode penentuan juara tidak valid.",
        },
        { status: 400 }
      );
    }

    if (
      method === "CATEGORY_SCORE" &&
      sourceCategoryIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pilih minimal satu kategori penilaian.",
        },
        { status: 400 }
      );
    }

    if (!eventLevelId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pilih tingkatan terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const validCategories =
      await db.category.findMany({
        where: {
          id: { in: sourceCategoryIds },
          eventId: event.id,
          status: "ACTIVE",
          OR: [
            { eventLevelId: null },
            { eventLevelId },
          ],
        },
        select: {
          id: true,
          eventLevelId: true,
        },
      });

    if (
      validCategories.length !==
      sourceCategoryIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ada kategori yang tidak valid untuk event/tingkatan ini.",
        },
        { status: 400 }
      );
    }

    const nextSort =
      await db.awardCategory.count({
        where: {
          eventId: event.id,
          eventLevelId,
        },
      });

    const award =
      await db.awardCategory.create({
        data: {
          eventId: event.id,
          eventLevelId,
          sourceCategoryId:
            method === "CATEGORY_SCORE"
              ? sourceCategoryIds[0] ?? null
              : null,
          name,
          method,
          rankPosition: null,
          sortOrder: nextSort,
          status: "DRAFT",
          tieBreakers:
            tieBreakers.length
              ? JSON.stringify(tieBreakers)
              : null,
          categorySources:
            method === "CATEGORY_SCORE"
              ? {
                  create:
                    sourceCategoryIds.map(
                      (categoryId, index) => ({
                        categoryId,
                        sortOrder: index,
                      })
                    ),
                }
              : undefined,
        },
        include: {
          sourceCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          categorySources: {
            orderBy: {
              sortOrder: "asc",
            },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  percentage: true,
                  sortOrder: true,
                  eventLevelId: true,
                },
              },
            },
          },
          winners: {
            orderBy: {
              winnerOrder: "asc",
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
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        award,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE AWARD ERROR:",
      error
    );

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
        {
          success: false,
          error:
            "ID kategori juara wajib diisi.",
        },
        { status: 400 }
      );
    }

    const award = await db.awardCategory.findUnique({
      where: { id },
      include: {
        winners: true,
        categorySources: {
          orderBy: { sortOrder: "asc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                percentage: true,
                sortOrder: true,
                eventLevelId: true,
              },
            },
          },
        },
      },
    });

    if (!award) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kategori juara tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (
      award.lockedAt &&
      action !== "unlock"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Hasil sudah dikunci.",
        },
        { status: 409 }
      );
    }

    if (action === "lock") {
      const updated =
        await db.awardCategory.update({
          where: { id },
          data: {
            status: "FINAL",
            lockedAt: new Date(),
          },
        });

      return NextResponse.json({
        success: true,
        award: updated,
      });
    }

    if (action === "unlock") {
      const updated =
        await db.awardCategory.update({
          where: { id },
          data: {
            status: "DRAFT",
            lockedAt: null,
          },
        });

      return NextResponse.json({
        success: true,
        award: updated,
      });
    }

    if (action === "delete") {
      await db.awardCategory.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "save") {
      const name = text(body.name);
      const method =
        text(body.method) || award.method;
      const eventLevelId =
        text(body.eventLevelId) || null;

      const sourceCategoryIds =
        uniqueStrings(
          body.sourceCategoryIds ??
            (body.sourceCategoryId
              ? [body.sourceCategoryId]
              : [])
        );

      const tieBreakers =
        parseTieBreakers(body.tieBreakers);

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Nama kategori juara wajib diisi.",
          },
          { status: 400 }
        );
      }

      if (
        method === "CATEGORY_SCORE" &&
        sourceCategoryIds.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Pilih minimal satu kategori penilaian.",
          },
          { status: 400 }
        );
      }

      if (
        method === "CATEGORY_SCORE"
      ) {
        const validCategories =
          await db.category.findMany({
            where: {
              id: { in: sourceCategoryIds },
              eventId: award.eventId,
              status: "ACTIVE",
              OR: [
                { eventLevelId: null },
                { eventLevelId },
              ],
            },
            select: {
              id: true,
            },
          });

        if (
          validCategories.length !==
          sourceCategoryIds.length
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Ada kategori sumber yang tidak valid.",
            },
            { status: 400 }
          );
        }
      }

      await db.awardCategory.update({
        where: { id },
        data: {
          name,
          method,
          eventLevelId,
          sourceCategoryId:
            method === "CATEGORY_SCORE"
              ? sourceCategoryIds[0] ?? null
              : null,
          tieBreakers:
            tieBreakers.length
              ? JSON.stringify(tieBreakers)
              : null,
          categorySources:
            method === "CATEGORY_SCORE"
              ? {
                  deleteMany: {},
                  create:
                    sourceCategoryIds.map(
                      (categoryId, index) => ({
                        categoryId,
                        sortOrder: index,
                      })
                    ),
                }
              : {
                  deleteMany: {},
                },
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "setWinner") {
      const participantId =
        text(body.participantId);

      if (!participantId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Peserta juara wajib dipilih.",
          },
          { status: 400 }
        );
      }

      const participant =
        await db.participant.findFirst({
          where: {
            id: participantId,
            eventId: award.eventId,
            status: "ACTIVE",
            ...(award.eventLevelId
              ? {
                  OR: [
                    {
                      eventLevelId:
                        award.eventLevelId,
                    },
                    {
                      eventLevelId: null,
                    },
                  ],
                }
              : {}),
          },
          select: {
            id: true,
          },
        });

      if (!participant) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Peserta tidak ditemukan pada event/tingkatan ini.",
          },
          { status: 400 }
        );
      }

      await db.awardWinner.deleteMany({
        where: {
          awardCategoryId: award.id,
        },
      });

      const winner =
        await db.awardWinner.create({
          data: {
            awardCategoryId: award.id,
            participantId,
            winnerOrder: 1,
            source: "MANUAL",
            score:
              body.score == null
                ? null
                : scoreNumber(body.score),
            note: text(body.note) || null,
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

      return NextResponse.json({
        success: true,
        winner,
      });
    }

    if (
      action === "setManualResults"
    ) {
      const entries =
        manualEntries(body.entries);

      if (!entries.length) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Isi minimal satu peserta manual.",
          },
          { status: 400 }
        );
      }

      const event =
        await getActiveEvent();

      if (!event) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Event aktif belum tersedia.",
          },
          { status: 404 }
        );
      }

      if (!award.eventLevelId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Tingkatan wajib dipilih.",
          },
          { status: 400 }
        );
      }

      const { participants } =
        await getParticipants(
          event.id,
          award.eventLevelId
        );

      const byId = new Map(
        participants.map(
          (participant) => [
            participant.id,
            participant,
          ]
        )
      );

      const byName = new Map<
        string,
        ParticipantRow
      >();

      for (const participant of participants) {
        const key =
          participant.name
            .trim()
            .toLowerCase();

        if (!byName.has(key)) {
          byName.set(key, participant);
        }
      }

      const normalized =
        entries.map((entry) => {
          const participant =
            entry.participantId
              ? byId.get(
                  entry.participantId
                )
              : byName.get(
                  entry.name
                    .trim()
                    .toLowerCase()
                );

          if (!participant) {
            throw new Error(
              `Peserta manual "${entry.name}" tidak ditemukan. Gunakan nama peserta yang sama dengan data peserta atau kirim participantId.`
            );
          }

          return {
            participant,
            score: entry.score,
            school:
              entry.school ||
              participant.school ||
              "",
          };
        });

      normalized.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return (
          a.participant.number -
          b.participant.number
        );
      });

      await db.awardWinner.deleteMany({
        where: {
          awardCategoryId: award.id,
        },
      });

      await db.awardWinner.createMany({
        data: normalized.map(
          (entry, index) => ({
            awardCategoryId:
              award.id,
            participantId:
              entry.participant.id,
            winnerOrder:
              index + 1,
            source: "MANUAL",
            score: entry.score,
          })
        ),
      });

      return NextResponse.json({
        success: true,
        count: normalized.length,
      });
    }

    if (
      action === "autoWinner"
    ) {
      const event =
        await getActiveEvent();

      if (!event) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Event aktif belum tersedia.",
          },
          { status: 404 }
        );
      }

      if (!award.eventLevelId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Pilih tingkatan untuk penentuan otomatis.",
          },
          { status: 400 }
        );
      }

      const {
        participants,
      } = await getParticipants(
        event.id,
        award.eventLevelId
      );

      const participantIds =
        participants.map(
          (participant) =>
            participant.id
        );

      const activeLevelCategoryIds =
        event.categories
          .filter(
            (category) =>
              !category.eventLevelId ||
              category.eventLevelId ===
                award.eventLevelId
          )
          .map(
            (category) =>
              category.id
          );

      const categoryScoresByParticipant =
        await getCategoryScoreMaps(
          participantIds,
          activeLevelCategoryIds
        );

      const selectedCategoryIds =
        award.categorySources
          .map(
            (source) =>
              source.categoryId
          );

      const legacyCategoryId =
        award.sourceCategoryId;

      const finalSelectedCategoryIds =
        selectedCategoryIds.length
          ? selectedCategoryIds
          : legacyCategoryId
            ? [legacyCategoryId]
            : [];

      if (
        award.method ===
          "CATEGORY_SCORE" &&
        !finalSelectedCategoryIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Belum ada kategori penilaian yang dipilih.",
          },
          { status: 400 }
        );
      }

      const primaryScoreMap =
        award.method ===
        "CATEGORY_SCORE"
          ? combinedCategoryScores(
              participantIds,
              finalSelectedCategoryIds,
              categoryScoresByParticipant
            )
          : undefined;

      const requestedTieBreakers =
        Array.isArray(
          body.tieBreakers
        )
          ? uniqueStrings(
              body.tieBreakers
            )
          : parseTieBreakers(
              award.tieBreakers
            );

      const timerDurations =
        requestedTieBreakers.some(
          (key) =>
            key.startsWith(
              TIMER_TIE_PREFIX
            )
        )
          ? await getTimerDurations(
              event.id,
              participantIds
            )
          : new Map<
              string,
              number
            >();

      const ranked =
        rankParticipants(
          participants,
          requestedTieBreakers,
          categoryScoresByParticipant,
          timerDurations,
          primaryScoreMap
        );

      if (!ranked.length) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Belum ada peserta pada tingkatan ini.",
          },
          { status: 400 }
        );
      }

      const winnerScoreMap =
        primaryScoreMap ??
        new Map(
          ranked.map(
            (row) => [
              row.participantId,
              row.finalScore,
            ]
          )
        );

      const saved =
        await saveAllRankedWinners(
          award.id,
          ranked,
          award.method,
          winnerScoreMap
        );

      const refreshed =
        await loadAward(award.id);

      return NextResponse.json({
        success: true,
        winners: saved,
        award: refreshed,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Aksi tidak dikenali.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "UPDATE AWARD ERROR:",
      error
    );

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

export async function DELETE(
  req: Request
) {
  try {
    const {
      searchParams,
    } = new URL(req.url);

    const id = text(
      searchParams.get("id")
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID kategori juara wajib diisi.",
        },
        { status: 400 }
      );
    }

    await db.awardCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE AWARD ERROR:",
      error
    );

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