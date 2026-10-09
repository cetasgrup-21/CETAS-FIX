import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function floor(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

function sortNumber(value: unknown, fallback = 999999) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function text(value: unknown, fallback = "") {
  return String(value ?? fallback);
}

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const levelId = String(
      searchParams.get("eventLevelId") || ""
    ).trim();

    /*
     * Ambil event + seluruh level + seluruh kategori aktif.
     * Jangan memfilter kategori di query berdasarkan levelId,
     * karena data lama bisa mempunyai eventLevelId kosong.
     */
    const event = await db.event.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        logo: true,
        totalPoints: true,

        levels: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },

        categories: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            name: true,
            percentage: true,
            sortOrder: true,
            eventLevelId: true,

            eventLevel: {
              select: {
                id: true,
                code: true,
                name: true,
                sortOrder: true,
              },
            },

            judgeLinks: {
              where: {
                judge: {
                  status: "ACTIVE",
                },
              },
              select: {
                judgeId: true,
                judge: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },

            criteria: {
              where: {
                subCategoryId: null,
              },
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                id: true,
                name: true,
                sortOrder: true,
                subCategoryId: true,
              },
            },

            subCategories: {
              where: {
                status: "ACTIVE",
              },
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                id: true,
                name: true,
                sortOrder: true,
                criteria: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                  select: {
                    id: true,
                    name: true,
                    sortOrder: true,
                    subCategoryId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event aktif belum tersedia.",
        },
        { status: 404 }
      );
    }

    const selectedLevel = levelId
      ? event.levels.find(
          (level) => level.id === levelId
        )
      : null;

    if (levelId && !selectedLevel) {
      return NextResponse.json(
        {
          success: false,
          error: "Tingkatan tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    /*
     * Filter peserta dengan dua jalur:
     * 1. data baru: eventLevelId
     * 2. data lama: field level berisi nama/code tingkatan
     */
    const participantWhere: {
      eventId: string;
      status: "ACTIVE";
      eventLevelId?: string;
      OR?: Array<{
        eventLevelId?: string | null;
        level?: string;
      }>;
    } = {
      eventId: event.id,
      status: "ACTIVE",
    };

    if (selectedLevel) {
      participantWhere.OR = [
        {
          eventLevelId: selectedLevel.id,
        },
        {
          eventLevelId: null,
          level: selectedLevel.name,
        },
        {
          eventLevelId: null,
          level: selectedLevel.code,
        },
      ];
    }

    const participants = await db.participant.findMany({
      where: participantWhere,
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          number: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        number: true,
        displayOrder: true,
        name: true,
        school: true,
        level: true,
        eventLevelId: true,
      },
    });

    const participantIds = participants.map(
      (participant) => participant.id
    );

    /*
     * Ambil score hanya untuk peserta yang sedang ditampilkan.
     */
    const scores =
      participantIds.length
        ? await db.score.findMany({
            where: {
              participantId: {
                in: participantIds,
              },
            },
            select: {
              participantId: true,
              criterionId: true,
              categoryId: true,
              judgeId: true,
              score: true,
              label: true,
              status: true,
              submittedAt: true,
              lockedAt: true,
              judge: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : [];

    const penalties =
      participantIds.length
        ? await db.penalty.findMany({
            where: {
              participantId: {
                in: participantIds,
              },
            },
            select: {
              participantId: true,
              type: true,
              amount: true,
              note: true,
            },
          })
        : [];

    const bonuses =
      participantIds.length
        ? await db.bonus.findMany({
            where: {
              participantId: {
                in: participantIds,
              },
            },
            select: {
              participantId: true,
              type: true,
              amount: true,
              note: true,
            },
          })
        : [];

    /*
     * Timer diambil langsung dari TimerRecord.
     * Kalau RUNNING, hitung durasi sementara dari startedAt
     * sampai sekarang. Kalau STOPPED, gunakan durationSec.
     */
    const timerRecords =
      participantIds.length
        ? await db.timerRecord.findMany({
            where: {
              eventId: event.id,
              participantId: {
                in: participantIds,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              participantId: true,
              timerGroupId: true,
              mode: true,
              startedAt: true,
              stoppedAt: true,
              durationSec: true,
              status: true,
              createdAt: true,
            },
          })
        : [];

    const now = Date.now();

    const timerByParticipant = new Map<
      string,
      {
        seconds: number;
        records: typeof timerRecords;
      }
    >();

    // Waktu tampil memakai TIMER TERAKHIR untuk peserta,
    // bukan menjumlahkan seluruh riwayat timer.
    // Riwayat lama tidak boleh membuat waktu tampil menjadi 01:43:40, dst.
    /*
     * Ambil timer TERAKHIR yang benar-benar memiliki durasi.
     * Record kosong/0 detik yang dibuat saat reset tidak boleh
     * menimpa waktu tampil terakhir yang valid.
     */
    const latestTimerByParticipant = new Map<
      string,
      (typeof timerRecords)[number]
    >();

    for (const record of timerRecords) {
      const hasDuration =
        record.status === "RUNNING" ||
        floor(record.durationSec) > 0 ||
        Boolean(record.startedAt && record.stoppedAt);

      if (
        !hasDuration ||
        latestTimerByParticipant.has(record.participantId)
      ) {
        continue;
      }

      latestTimerByParticipant.set(
        record.participantId,
        record
      );
    }

    for (const record of latestTimerByParticipant.values()) {
      let duration = 0;

      if (
        record.status === "RUNNING" &&
        record.startedAt
      ) {
        duration = Math.max(
          0,
          Math.floor(
            (now - record.startedAt.getTime()) / 1000
          )
        );
      } else if (
        record.startedAt &&
        record.stoppedAt
      ) {
        const rangeDuration = Math.max(
          0,
          Math.floor(
            (record.stoppedAt.getTime() -
              record.startedAt.getTime()) /
              1000
          )
        );

        duration = Math.max(
          rangeDuration,
          floor(record.durationSec)
        );
      } else if (record.durationSec != null) {
        duration = Math.max(
          0,
          floor(record.durationSec)
        );
      }

      timerByParticipant.set(
        record.participantId,
        {
          seconds: duration,
          records: [record],
        }
      );
    }

    const scoreByParticipant = new Map<
      string,
      typeof scores
    >();

    for (const score of scores) {
      const current =
        scoreByParticipant.get(
          score.participantId
        );

      if (current) {
        current.push(score);
      } else {
        scoreByParticipant.set(
          score.participantId,
          [score]
        );
      }
    }

    const penaltyByParticipant = new Map<
      string,
      typeof penalties
    >();

    for (const item of penalties) {
      const current =
        penaltyByParticipant.get(
          item.participantId
        );

      if (current) {
        current.push(item);
      } else {
        penaltyByParticipant.set(
          item.participantId,
          [item]
        );
      }
    }

    const bonusByParticipant = new Map<
      string,
      typeof bonuses
    >();

    for (const item of bonuses) {
      const current =
        bonusByParticipant.get(
          item.participantId
        );

      if (current) {
        current.push(item);
      } else {
        bonusByParticipant.set(
          item.participantId,
          [item]
        );
      }
    }

    const rows = participants.map(
      (participant) => {
        const participantScores =
          scoreByParticipant.get(
            participant.id
          ) || [];

        const participantPenalties =
          penaltyByParticipant.get(
            participant.id
          ) || [];

        const participantBonuses =
          bonusByParticipant.get(
            participant.id
          ) || [];

        const participantLevel =
          event.levels.find(
            (level) =>
              level.id ===
              participant.eventLevelId
          ) ||
          event.levels.find(
            (level) =>
              level.name ===
                participant.level ||
              level.code ===
                participant.level
          ) ||
          null;

        /*
         * Kategori mengikuti tingkatan peserta.
         * Kategori tanpa eventLevelId dianggap berlaku umum.
         */
        const categoryRows =
          event.categories
            .filter((category) => {
              if (
                !category.eventLevelId
              ) {
                return true;
              }

              if (
                participant.eventLevelId
              ) {
                return (
                  category.eventLevelId ===
                  participant.eventLevelId
                );
              }

              return (
                Boolean(
                  participantLevel
                ) &&
                category.eventLevelId ===
                  participantLevel?.id
              );
            })
            .map((category) => {
              const directCriteria =
                category.criteria || [];

              const subCategories =
                category.subCategories || [];

              const allCriteria = [
                ...directCriteria.map(
                  (criterion) => ({
                    ...criterion,
                    subCategoryId:
                      null,
                    subCategoryName:
                      null,
                    subCategorySortOrder: 0,
                  })
                ),

                ...subCategories.flatMap(
                  (subCategory) =>
                    (
                      subCategory.criteria ||
                      []
                    ).map(
                      (criterion) => ({
                        ...criterion,
                        subCategoryId:
                          subCategory.id,
                        subCategoryName:
                          subCategory.name,
                        subCategorySortOrder:
                          subCategory.sortOrder,
                      })
                    )
                ),
              ];

              const sortedCriteria =
                allCriteria.sort(
                  (a, b) => {
                    const subOrder =
                      sortNumber(
                        a.subCategorySortOrder
                      ) -
                      sortNumber(
                        b.subCategorySortOrder
                      );

                    if (subOrder !== 0) {
                      return subOrder;
                    }

                    return (
                      sortNumber(
                        a.sortOrder
                      ) -
                      sortNumber(
                        b.sortOrder
                      )
                    );
                  }
                );

              const judgeLinks =
                category.judgeLinks || [];

              const categoryScores =
                participantScores.filter(
                  (score) =>
                    score.categoryId ===
                    category.id
                );

              const criteriaRows =
                sortedCriteria.map(
                  (criterion) => {
                    const criterionScores =
                      categoryScores.filter(
                        (score) =>
                          score.criterionId ===
                          criterion.id
                      );

                    const judgeValues =
                      judgeLinks.map(
                        (link) => {
                          const score =
                            criterionScores.find(
                              (item) =>
                                item.judgeId ===
                                link.judgeId
                            );

                          return {
                            judgeId:
                              link.judgeId,
                            judgeName:
                              link.judge.name,
                            value: floor(
                              score?.score
                            ),
                            scoreId:
                              score
                                ? `${score.participantId}-${score.criterionId}-${score.judgeId}`
                                : null,
                          };
                        }
                      );

                    const total =
                      judgeValues.reduce(
                        (sum, item) =>
                          sum +
                          floor(
                            item.value
                          ),
                        0
                      );

                    return {
                      id: criterion.id,
                      name: text(
                        criterion.name,
                        "Materi"
                      ),
                      sortOrder:
                        criterion.sortOrder,
                      subCategoryId:
                        criterion.subCategoryId,
                      subCategoryName:
                        criterion.subCategoryName,
                      judges:
                        judgeValues,
                      total,
                      scored:
                        criterionScores.length,
                      expected:
                        judgeLinks.length,
                    };
                  }
                );

              const total =
                categoryScores.reduce(
                  (sum, score) =>
                    sum + floor(score.score),
                  0
                );

              const byJudge =
                judgeLinks.map(
                  (link) => {
                    const judgeScores =
                      categoryScores.filter(
                        (score) =>
                          score.judgeId ===
                          link.judgeId
                      );

                    return {
                      judgeId:
                        link.judgeId,
                      judgeName:
                        link.judge.name,
                      total:
                        judgeScores.reduce(
                          (sum, score) =>
                            sum +
                            floor(
                              score.score
                            ),
                          0
                        ),
                      scored:
                        judgeScores.length,
                      expected:
                        sortedCriteria.length,
                    };
                  }
                );

              const expected =
                sortedCriteria.length *
                judgeLinks.length;

              const complete =
                expected > 0 &&
                categoryScores.length >=
                  expected;

              const max = floor(
                event.totalPoints *
                  (Number(
                    category.percentage
                  ) /
                    100)
              );

              return {
                categoryId:
                  category.id,
                categoryName:
                  category.name,
                percentage:
                  category.percentage,
                maximum: max,
                score: total,
                complete,
                scored:
                  categoryScores.length,
                expected,
                judgeCount:
                  judgeLinks.length,
                judges: byJudge,
                criteria:
                  criteriaRows,
              };
            });

        const rawScore =
          categoryRows.reduce(
            (sum, category) =>
              sum +
              category.score,
            0
          );

        const bonus =
          participantBonuses.reduce(
            (sum, item) =>
              sum + floor(item.amount),
            0
          );

        const penalty =
          participantPenalties.reduce(
            (sum, item) =>
              sum + floor(item.amount),
            0
          );

        const finalScore =
          rawScore +
          bonus -
          penalty;

        const timer =
          timerByParticipant.get(
            participant.id
          );

        return {
          participant,
          categories:
            categoryRows,
          rawScore,
          bonus,
          penalty,
          finalScore,
          complete:
            categoryRows.length > 0 &&
            categoryRows.every(
              (category) =>
                category.complete
            ),
          timerSeconds:
            timer?.seconds || 0,
          timerText:
            formatDuration(
              timer?.seconds || 0
            ),
          timerRecords:
            timer?.records.map(
              (record) => ({
                id: record.id,
                timerGroupId:
                  record.timerGroupId,
                mode: record.mode,
                status: record.status,
                startedAt:
                  record.startedAt,
                stoppedAt:
                  record.stoppedAt,
                durationSec:
                  record.durationSec,
              })
            ) || [],
        };
      }
    );

    rows.sort((a, b) => {
      if (
        b.finalScore !==
        a.finalScore
      ) {
        return (
          b.finalScore -
          a.finalScore
        );
      }

      const aOrder =
        Number(
          a.participant.displayOrder
        );
      const bOrder =
        Number(
          b.participant.displayOrder
        );

      if (
        Number.isFinite(aOrder) &&
        Number.isFinite(bOrder) &&
        aOrder !== bOrder
      ) {
        return aOrder - bOrder;
      }

      return (
        Number(
          a.participant.number
        ) -
        Number(
          b.participant.number
        )
      );
    });

    const rankedRows = rows.map(
      (row, index) => ({
        ...row,
        rank: row.complete
          ? index + 1
          : null,
      })
    );

    /*
     * Sinkronkan Result dengan perhitungan
     * yang berasal dari Score + Bonus - Penalty.
     */
    if (rankedRows.length) {
      await db.$transaction(
        rankedRows.map((row) =>
          db.result.upsert({
            where: {
              participantId:
                row.participant.id,
            },
            create: {
              participantId:
                row.participant.id,
              rawScore:
                row.rawScore,
              bonus:
                row.bonus,
              penalty:
                row.penalty,
              finalScore:
                row.finalScore,
              rank:
                row.rank,
              status: "ACTIVE",
            },
            update: {
              rawScore:
                row.rawScore,
              bonus:
                row.bonus,
              penalty:
                row.penalty,
              finalScore:
                row.finalScore,
              rank:
                row.rank,
              status: "ACTIVE",
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        logo: event.logo,
        totalPoints:
          event.totalPoints,
      },
      levels: event.levels,
      rows: rankedRows,
    });
  } catch (error) {
    console.error(
      "GET REKAP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data rekap.",
      },
      {
        status: 500,
      }
    );
  }
}