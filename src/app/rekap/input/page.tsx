"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPE
========================================================= */

type EventItem = {
  id: string;
  name: string;
  inputMode?: "DIGITAL" | "PAPER";
};

type Level = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type Judge = {
  id: string;
  name: string;
  username?: string;
};

type Category = {
  id: string;
  name: string;
  percentage?: number;
  sortOrder?: number;
};

type Participant = {
  id: string;
  number: number;
  displayOrder?: number | null;
  name: string;
  school?: string | null;
  level?: string | null;
};

type ScoreOption = {
  id: string;
  label: string;
  score: number;
  sortOrder: number;
};

type Criterion = {
  id: string;
  name: string;
  section?: string | null;
  interval?: number | null;
  sortOrder: number;
  options: ScoreOption[];
};

type ExistingScore = {
  id: string;
  participantId: string;
  criterionId: string;
  categoryId: string;
  judgeId: string;
  score: number;
  label?: string | null;
  status: string;
};

/* =========================================================
   API RESPONSE
========================================================= */

type ApiResponse = {
  success: boolean;
  error?: string;

  events?: EventItem[];
  event?: {
    id: string;
    name: string;
    inputMode?: "DIGITAL" | "PAPER";
  };

  levels?: Level[];
  level?: Level;

  judges?: Judge[];

  categories?: Category[];

  participants?: Participant[];

  category?: Category;

  participant?: Participant;

  criteria?: Criterion[];

  scores?: ExistingScore[];
};

/* =========================================================
   HEADER GROUP
========================================================= */

function getDisplayGroups(
  count: number
) {
  const formats: Record<
    number,
    {
      label: string;
      count: number;
    }[]
  > = {
    1: [
      {
        label: "B",
        count: 1,
      },
    ],

    2: [
      {
        label: "C",
        count: 1,
      },
      {
        label: "B",
        count: 1,
      },
    ],

    3: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 1,
      },
      {
        label: "B",
        count: 1,
      },
    ],

    4: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 1,
      },
      {
        label: "B",
        count: 1,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    5: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 2,
      },
      {
        label: "B",
        count: 1,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    6: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 2,
      },
      {
        label: "B",
        count: 2,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    7: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 3,
      },
      {
        label: "B",
        count: 2,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    8: [
      {
        label: "K",
        count: 1,
      },
      {
        label: "C",
        count: 3,
      },
      {
        label: "B",
        count: 3,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    9: [
      {
        label: "K",
        count: 2,
      },
      {
        label: "C",
        count: 3,
      },
      {
        label: "B",
        count: 3,
      },
      {
        label: "SB",
        count: 1,
      },
    ],

    10: [
      {
        label: "K",
        count: 3,
      },
      {
        label: "C",
        count: 3,
      },
      {
        label: "B",
        count: 3,
      },
      {
        label: "SB",
        count: 1,
      },
    ],
  };

  return (
    formats[count] ||
    formats[10]
  );
}

/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatScore(
  value: number
) {
  if (
    Number.isInteger(value)
  ) {
    return String(value);
  }

  return String(value);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RekapInputPage() {
  /* =======================================================
     SELECTION
  ======================================================= */

  const [eventId, setEventId] =
    useState("");

  const [eventInputMode, setEventInputMode] =
    useState<"DIGITAL" | "PAPER">("DIGITAL");

  const [
    eventLevelId,
    setEventLevelId,
  ] = useState("");

  const [judgeId, setJudgeId] =
    useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    participantId,
    setParticipantId,
  ] = useState("");

  /* =======================================================
     DATA
  ======================================================= */

  const [events, setEvents] =
    useState<EventItem[]>([]);

  const [levels, setLevels] =
    useState<Level[]>([]);

  const [judges, setJudges] =
    useState<Judge[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    participants,
    setParticipants,
  ] = useState<Participant[]>(
    []
  );

  const [
    criteria,
    setCriteria,
  ] = useState<Criterion[]>(
    []
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<Category | null>(
      null
    );

  const [
    selectedParticipant,
    setSelectedParticipant,
  ] =
    useState<Participant | null>(
      null
    );

  /* =======================================================
     NILAI LOKAL
  ======================================================= */

  const [
    selectedScores,
    setSelectedScores,
  ] = useState<
    Record<string, number>
  >({});

  const [
    selectedLabels,
    setSelectedLabels,
  ] = useState<
    Record<string, string>
  >({});

  /* =======================================================
     STATUS
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =======================================================
     LOAD INITIAL EVENTS
  ======================================================= */

  useEffect(() => {
    void loadInitial();
  }, []);

  async function loadInitial() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/rekap/input",
          {
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Gagal mengambil event."
        );
      }

      const loadedEvents =
        data.events || [];

      setEvents(
        loadedEvents
      );

      /* =========================================
         Kalau hanya ada satu event,
         langsung pilih.
      ========================================= */

      if (
        loadedEvents.length === 1
      ) {
        setEventId(
          loadedEvents[0].id
        );
        setEventInputMode(
          loadedEvents[0].inputMode === "PAPER"
            ? "PAPER"
            : "DIGITAL"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil event."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     LOAD LEVEL
  ======================================================= */

  useEffect(() => {
    if (!eventId) {
      setLevels([]);
      setEventLevelId("");
      return;
    }

    void loadLevels();
  }, [eventId]);

  async function loadLevels() {
    try {
      setLoading(true);
      setError("");

      setEventLevelId("");
      setJudgeId("");
      setCategoryId("");
      setParticipantId("");

      setJudges([]);
      setCategories([]);
      setParticipants([]);
      setCriteria([]);

      const response =
        await fetch(
          `/api/rekap/input?eventId=${encodeURIComponent(
            eventId
          )}`,
          {
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Gagal mengambil tingkatan."
        );
      }

      setLevels(
        data.levels || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil tingkatan."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     LOAD JURI / KATEGORI / PESERTA
  ======================================================= */

  useEffect(() => {
    if (!eventId || !eventLevelId) {
      setJudges([]);
      setCategories([]);
      setParticipants([]);
      return;
    }

    void loadLevelData();
  }, [
    eventId,
    eventLevelId,
  ]);

  async function loadLevelData() {
    try {
      setLoading(true);
      setError("");

      setJudgeId("");
      setCategoryId("");
      setParticipantId("");

      setCriteria([]);

      const response =
        await fetch(
          `/api/rekap/input?eventId=${encodeURIComponent(
            eventId
          )}&eventLevelId=${encodeURIComponent(
            eventLevelId
          )}`,
          {
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Gagal mengambil data tingkatan."
        );
      }

      setJudges(
        data.judges || []
      );

      setCategories(
        data.categories || []
      );

      setParticipants(
        data.participants || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     FILTER KATEGORI SESUAI JURI
     
     API sudah mengembalikan kategori yang relevan,
     tetapi kita tetap gunakan state dari API.
  ======================================================= */

  /* =======================================================
     LOAD PESERTA / KRITERIA
  ======================================================= */

  useEffect(() => {
    if (
      !eventId ||
      !eventLevelId ||
      !judgeId ||
      !categoryId ||
      !participantId
    ) {
      setCriteria([]);
      setSelectedCategory(null);
      setSelectedParticipant(null);
      setSelectedScores({});
      setSelectedLabels({});
      return;
    }

    void loadParticipantData();
  }, [
    eventId,
    eventLevelId,
    judgeId,
    categoryId,
    participantId,
  ]);

  async function loadParticipantData() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const query =
        `eventId=${encodeURIComponent(
          eventId
        )}` +
        `&eventLevelId=${encodeURIComponent(
          eventLevelId
        )}` +
        `&judgeId=${encodeURIComponent(
          judgeId
        )}` +
        `&categoryId=${encodeURIComponent(
          categoryId
        )}` +
        `&participantId=${encodeURIComponent(
          participantId
        )}`;

      const response =
        await fetch(
          `/api/rekap/input?${query}`,
          {
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Gagal mengambil lembar penilaian."
        );
      }

      setCriteria(
        data.criteria || []
      );

      setSelectedCategory(
        data.category || null
      );

      setSelectedParticipant(
        data.participant || null
      );

      /* =========================================
         MASUKKAN NILAI YANG SUDAH ADA
      ========================================= */

      const scoreMap: Record<
        string,
        number
      > = {};

      const labelMap: Record<
        string,
        string
      > = {};

      for (const score of
        data.scores || []) {
        scoreMap[
          score.criterionId
        ] = Number(
          score.score
        );

        if (score.label) {
          labelMap[
            score.criterionId
          ] = score.label;
        }
      }

      setSelectedScores(
        scoreMap
      );

      setSelectedLabels(
        labelMap
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil lembar penilaian."
      );

      setCriteria([]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     OPTIONS
  ======================================================= */

  const maxOptions = useMemo(
    () =>
      Math.max(
        0,
        ...criteria.map(
          (criterion) =>
            criterion.options
              .length
        )
      ),
    [criteria]
  );

  const headerGroups =
    useMemo(
      () =>
        getDisplayGroups(
          Math.min(
            10,
            Math.max(
              1,
              maxOptions
            )
          )
        ),
      [maxOptions]
    );

  /* =======================================================
     TOTAL
  ======================================================= */

  const selectedCount =
    criteria.filter(
      (criterion) =>
        selectedScores[
          criterion.id
        ] !== undefined
    ).length;

  const allSelected =
    criteria.length > 0 &&
    selectedCount ===
      criteria.length;

  /* =======================================================
     KLIK NILAI
  ======================================================= */

  function selectScore(
    criterion: Criterion,
    option: ScoreOption
  ) {
    setSelectedScores(
      (current) => ({
        ...current,
        [criterion.id]:
          option.score,
      })
    );

    setSelectedLabels(
      (current) => ({
        ...current,
        [criterion.id]:
          option.label,
      })
    );

    setSuccessMessage("");
    setError("");
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submitParticipant() {
    if (
      !eventId ||
      !eventLevelId ||
      !judgeId ||
      !categoryId ||
      !participantId
    ) {
      return;
    }

    if (!allSelected) {
      setError(
        `Masih ada ${
          criteria.length -
          selectedCount
        } materi yang belum dipilih.`
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const values =
        criteria.map(
          (criterion) => ({
            criterionId:
              criterion.id,

            score:
              selectedScores[
                criterion.id
              ],

            label:
              selectedLabels[
                criterion.id
              ] ||
              String(
                selectedScores[
                  criterion.id
                ]
              ),
          })
        );

      const response =
        await fetch(
          "/api/rekap/input",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              eventId,
              eventLevelId,
              judgeId,
              categoryId,
              participantId,
              values,
            }),
          }
        );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Gagal submit nilai."
        );
      }

      setSuccessMessage(
        "✓ Nilai peserta berhasil disubmit."
      );

      /*
       * Setelah submit, peserta tetap berada di
       * peserta tersebut.
       *
       * Tim rekap dapat memilih peserta berikutnya
       * melalui dropdown PESERTA.
       */
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal submit nilai."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     RESET DARI JURI
  ======================================================= */

  async function handleJudgeChange(
  value: string
) {
  setJudgeId(value);
  setCategoryId("");
  setParticipantId("");
  setCriteria([]);
  setSelectedScores({});
  setSelectedLabels({});
  setSelectedCategory(null);
  setSelectedParticipant(null);
  setSuccessMessage("");
  setError("");

  if (!value || !eventId || !eventLevelId) {
    setCategories([]);
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `/api/rekap/input?eventId=${encodeURIComponent(
        eventId
      )}&eventLevelId=${encodeURIComponent(
        eventLevelId
      )}&judgeId=${encodeURIComponent(
        value
      )}`,
      {
        cache: "no-store",
      }
    );

    const data =
      (await response.json()) as ApiResponse;

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          "Gagal mengambil kategori juri."
      );
    }

    setCategories(
      data.categories || []
    );
  } catch (err) {
    setCategories([]);

    setError(
      err instanceof Error
        ? err.message
        : "Gagal mengambil kategori juri."
    );
  } finally {
    setLoading(false);
  }
}

  /* =======================================================
     RESET DARI KATEGORI
  ======================================================= */

  function handleCategoryChange(
    value: string
  ) {
    setCategoryId(value);
    setParticipantId("");
    setCriteria([]);
    setSelectedScores({});
    setSelectedLabels({});
    setSuccessMessage("");
  }

  /* =======================================================
     RESET DARI PESERTA
  ======================================================= */

  function handleParticipantChange(
    value: string
  ) {
    setParticipantId(value);
    setCriteria([]);
    setSelectedScores({});
    setSelectedLabels({});
    setSuccessMessage("");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-3 py-4 text-[#071a3d] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1800px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#6f87a8]">
            CETAS.SCORE
          </p>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                REKAP PENILAIAN
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-500">
                  {eventInputMode === "PAPER"
                    ? "Input nilai berdasarkan lembar penilaian juri."
                    : "Mode Digital / Manual — input nilai utama dilakukan melalui sistem penilaian digital."}
                </p>
                {eventId ? (
                  <span
                    className={
                      eventInputMode === "PAPER"
                        ? "rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800"
                        : "rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-800"
                    }
                  >
                    {eventInputMode === "PAPER"
                      ? "MODE KERTAS"
                      : "MODE DIGITAL / MANUAL"}
                  </span>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                Memuat data...
              </div>
            ) : null}
          </div>
        </div>

        {/* =================================================
            EVENT + TINGKATAN
        ================================================= */}

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">

            <SelectBox
              label="EVENT"
              value={eventId}
              onChange={(value) => {
                setEventId(value);
                const selectedEvent = events.find(
                  (item) => item.id === value
                );
                setEventInputMode(
                  selectedEvent?.inputMode === "PAPER"
                    ? "PAPER"
                    : "DIGITAL"
                );
              }}
              placeholder="Pilih event..."
              options={events.map(
                (event) => ({
                  value: event.id,
                  label: event.name,
                })
              )}
            />

            <SelectBox
              label="TINGKATAN"
              value={eventLevelId}
              onChange={(value) =>
                setEventLevelId(
                  value
                )
              }
              placeholder={
                eventId
                  ? "Pilih tingkatan..."
                  : "Pilih event terlebih dahulu"
              }
              disabled={!eventId}
              options={levels.map(
                (level) => ({
                  value: level.id,
                  label: level.name,
                })
              )}
            />

          </div>
        </section>

        {/* =================================================
            DROPDOWN UTAMA
        ================================================= */}

        {eventLevelId ? (
          <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            {eventInputMode !== "PAPER" ? (
              <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                Event ini menggunakan <b>Digital / Manual</b>. Halaman ini khusus untuk rekap nilai dari <b>lembar kertas</b>. Silakan gunakan menu penilaian digital untuk input nilai utama.
              </div>
            ) : null}

            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#6f87a8]">
                PILIH DATA REKAP
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Pilih juri, kategori, kemudian
                peserta yang nilainya akan
                disalin dari lembar kertas.
              </p>
            </div>

            <div className="grid gap-3 xl:grid-cols-3">

              <SelectBox
                label="JURI"
                value={judgeId}
                onChange={
                  handleJudgeChange
                }
                placeholder="Pilih juri..."
                options={judges.map(
                  (judge) => ({
                    value:
                      judge.id,
                    label:
                      judge.name,
                  })
                )}
              />

              <SelectBox
                label="KATEGORI"
                value={categoryId}
                onChange={
                  handleCategoryChange
                }
                placeholder={
                  judgeId
                    ? "Pilih kategori..."
                    : "Pilih juri terlebih dahulu"
                }
                disabled={!judgeId}
                options={categories.map(
                  (category) => ({
                    value:
                      category.id,
                    label:
                      category.name,
                  })
                )}
              />

              <SelectBox
                label="PESERTA"
                value={
                  participantId
                }
                onChange={
                  handleParticipantChange
                }
                placeholder={
                  categoryId
                    ? "Pilih peserta..."
                    : "Pilih kategori terlebih dahulu"
                }
                disabled={
                  !categoryId
                }
                options={participants.map(
                  (
                    participant
                  ) => ({
                    value:
                      participant.id,
                    label: `${participant.number} — ${participant.name}`,
                  })
                )}
              />

            </div>
          </section>
        ) : null}

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {/* =================================================
            PESERTA HEADER
        ================================================= */}

        {selectedParticipant &&
        selectedCategory ? (
          <section className="mb-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                  LEMBAR REKAP
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {selectedParticipant.name}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  No.{" "}
                  {
                    selectedParticipant.number
                  }{" "}
                  •{" "}
                  {
                    selectedParticipant.school ||
                    "-"
                  }
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  KATEGORI
                </p>

                <p className="text-sm font-black">
                  {
                    selectedCategory.name
                  }
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {selectedCount} /{" "}
                  {criteria.length}{" "}
                  materi terisi
                </p>
              </div>

            </div>
          </section>
        ) : null}

        {/* =================================================
            SCORE TABLE
        ================================================= */}

        {criteria.length > 0 ? (
          <section className="overflow-hidden rounded-xl border border-[#6f87a8] bg-white shadow-sm">

            <div className="border-b border-[#6f87a8] bg-[#071a3d] px-4 py-3">
              <p className="text-sm font-black uppercase tracking-wide text-white">
                {selectedCategory?.name ||
                  "PENILAIAN"}
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px] border-collapse">

                {/* =========================================
                    HEADER
                ========================================= */}

                <thead>

                  <tr className="bg-[#eaf2ff]">

                    <th
                      rowSpan={2}
                      className="w-[55px] border border-[#6f87a8] px-2 py-2 text-center text-xs font-black"
                    >
                      NO.
                    </th>

                    <th
                      rowSpan={2}
                      className="min-w-[340px] border border-[#6f87a8] px-3 py-2 text-center text-xs font-black uppercase"
                    >
                      MATERI PENILAIAN
                    </th>

                    <th
                      colSpan={
                        maxOptions
                      }
                      className="border border-[#6f87a8] px-2 py-2 text-center text-xs font-black uppercase"
                    >
                      NILAI
                    </th>

                  </tr>

                  <tr className="bg-[#f7f9fc]">

                    {headerGroups.map(
                      (
                        group,
                        groupIndex
                      ) => (
                        <th
                          key={`${group.label}-${groupIndex}`}
                          colSpan={
                            group.count
                          }
                          className="border border-[#6f87a8] px-2 py-1.5 text-center text-[11px] font-black"
                        >
                          {group.label}
                        </th>
                      )
                    )}

                  </tr>

                </thead>

                {/* =========================================
                    BODY
                ========================================= */}

                <tbody>

                  {criteria.map(
                    (
                      criterion,
                      index
                    ) => {

                      const selected =
                        selectedScores[
                          criterion.id
                        ];

                      const options =
                        criterion.options.slice(
                          0,
                          10
                        );

                      return (
                        <tr
                          key={
                            criterion.id
                          }
                          className="bg-white"
                        >

                          {/* NO */}

                          <td className="border border-[#6f87a8] px-2 py-2 text-center text-xs font-bold">
                            {index + 1}
                          </td>

                          {/* MATERI */}

                          <td className="border border-[#6f87a8] px-3 py-2 text-sm font-black">
                            {criterion.name}
                          </td>

                          {/* OPTIONS */}

                          {Array.from(
                            {
                              length:
                                maxOptions,
                            }
                          ).map(
                            (
                              _,
                              optionIndex
                            ) => {

                              const option =
                                options[
                                  optionIndex
                                ];

                              if (
                                !option
                              ) {
                                return (
                                  <td
                                    key={
                                      optionIndex
                                    }
                                    className="border border-[#6f87a8] bg-slate-50"
                                  />
                                );
                              }

                              const active =
                                selected !==
                                  undefined &&
                                Number(
                                  selected
                                ) ===
                                  Number(
                                    option.score
                                  );

                              return (
                                <td
                                  key={
                                    option.id
                                  }
                                  className={`border border-[#6f87a8] p-0 ${
                                    active
                                      ? "bg-blue-100"
                                      : "bg-white"
                                  }`}
                                >

                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectScore(
                                        criterion,
                                        option
                                      )
                                    }
                                    disabled={
                                      saving
                                    }
                                    className={`flex min-h-[46px] w-full items-center justify-center px-2 text-sm font-black transition ${
                                      active
                                        ? "bg-[#1769e0] text-white shadow-inner"
                                        : "text-[#071a3d] hover:bg-blue-50 active:bg-blue-100"
                                    }`}
                                  >
                                    {formatScore(
                                      option.score
                                    )}
                                  </button>

                                </td>
                              );
                            }
                          )}

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* =============================================
                FOOTER
            ============================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-black text-[#071a3d]">
                  {allSelected
                    ? "Semua materi sudah dipilih."
                    : `Pilih ${
                        criteria.length -
                        selectedCount
                      } materi lagi.`}
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Cocokkan setiap pilihan
                  dengan lembar penilaian
                  juri sebelum Submit.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  submitParticipant
                }
                disabled={
                  saving ||
                  !allSelected
                }
                className="min-h-12 rounded-xl bg-[#071a3d] px-7 py-3 text-sm font-black text-white transition hover:bg-[#102d61] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? "MENYIMPAN..."
                  : "SUBMIT NILAI"}
              </button>

            </div>

          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">

            <div className="mx-auto max-w-lg">

              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">
                TIM REKAP
              </p>

              <h2 className="mt-2 text-xl font-black text-[#071a3d]">
                Pilih Juri, Kategori,
                dan Peserta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Setelah peserta dipilih,
                lembar penilaian akan
                tampil dengan format
                yang sama seperti review.
                Tim rekap cukup menekan
                angka sesuai kertas.
              </p>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

/* =========================================================
   SELECT BOX
========================================================= */

function SelectBox({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
  options: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-[#6f87a8]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-[#071a3d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </select>

    </label>
  );
}