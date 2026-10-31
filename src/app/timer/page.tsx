"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type Level = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type Participant = {
  id: string;
  number: number;
  displayOrder: number | null;
  name: string;
  school: string | null;
  level: string | null;
  photo: string | null;
  logo: string | null;
  eventLevel: Level | null;
};

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  eventLevelId: string | null;
  eventLevel: Level | null;
};

type Group = {
  id: string;
  name: string;
  sortOrder: number;

  categories: {
    categoryId: string;
    sortOrder: number;
    category: Category;
  }[];
};

type RecordItem = {
  id: string;
  participantId: string;
  timerGroupId: string | null;
  mode: string;
  runKey: string;
  startedAt: string | null;
  stoppedAt: string | null;
  durationSec: number | null;
  status: string;
};

function fmt(total: number) {
  const s = Math.max(
    0,
    Math.floor(total)
  );

  const h = Math.floor(
    s / 3600
  );

  const m = Math.floor(
    (s % 3600) / 60
  );

  const sec = s % 60;

  return [h, m, sec]
    .map((x) =>
      String(x).padStart(2, "0")
    )
    .join(":");
}

export default function TimerPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [event, setEvent] =
    useState<{
      id: string;
      name: string;
    } | null>(null);

  const [events, setEvents] =
    useState<{
      id: string;
      name: string;
      status: string;
    }[]>([]);

  const [role, setRole] =
    useState("");

  const [levels, setLevels] =
    useState<Level[]>([]);

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [records, setRecords] =
    useState<RecordItem[]>([]);

  const [levelId, setLevelId] =
    useState("");

  const [participantId, setParticipantId] =
    useState("");

  /* Nama/keterangan timer diisi manual. Timer tidak lagi bergantung pada kategori. */
  const [manualTimerName, setManualTimerName] = useState("");

  /*
   * KATEGORI YANG DICENTANG
   *
   * Contoh:
   *
   * ["PBB"]
   *
   * atau:
   *
   * ["PBB", "KOMANDAN"]
   *
   * Beberapa kategori akan dianggap
   * sebagai satu timer.
   */
  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState<string[]>([]);

  /*
   * Nama gabungan baru.
   *
   * Hanya dipakai ketika operator
   * membuat gabungan secara manual.
   */
  const [
    newGroupName,
    setNewGroupName,
  ] = useState("");

  /*
   * Checkbox konfigurasi gabungan.
   */
  const [
    groupCategoryIds,
    setGroupCategoryIds,
  ] = useState<string[]>([]);

  const [now, setNow] =
    useState(Date.now());

  const intervalRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  // =====================================================
  // LOAD
  // =====================================================

  async function load(targetEventId?: string) {
    setLoading(true);
    setError("");

    try {
      const url = targetEventId
        ? `/api/timer?eventId=${encodeURIComponent(targetEventId)}`
        : "/api/timer";

      const response =
        await fetch(
          url,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (
        response.status === 401
      ) {
        router.replace(
          "/login?next=/timer"
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Gagal memuat Timer."
        );
      }

      setRole(
        result.role || ""
      );

      setEvent(
        result.event || null
      );

      setEvents(
        result.events || []
      );

      setLevels(
        result.levels || []
      );

      setParticipants(
        result.participants || []
      );

      setCategories(
        result.categories || []
      );

      setGroups(
        result.groups || []
      );

      setRecords(
        result.records || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal memuat Timer."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // =====================================================
  // CLOCK
  // =====================================================

  useEffect(() => {
    intervalRef.current =
      setInterval(() => {
        setNow(Date.now());
      }, 250);

    return () => {
      if (
        intervalRef.current
      ) {
        clearInterval(
          intervalRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // SELECTED LEVEL
  // =====================================================

  const selectedLevel =
    useMemo(
      () =>
        levels.find(
          (level) =>
            level.id === levelId
        ) || null,
      [levels, levelId]
    );

  // =====================================================
  // PARTICIPANT FILTER
  // =====================================================

  const filteredParticipants =
    useMemo(() => {
      if (!levelId) {
        return [];
      }

      return participants
        .filter(
          (participant) => {
            /*
             * Prioritas:
             * eventLevel.id
             */
            if (
              participant.eventLevel?.id
            ) {
              return (
                participant
                  .eventLevel.id ===
                levelId
              );
            }

            /*
             * Fallback data lama.
             */
            return (
              participant.level ===
              selectedLevel?.name
            );
          }
        )
        .sort(
          (a, b) => {
            const orderA =
              a.displayOrder ??
              a.number ??
              999999;

            const orderB =
              b.displayOrder ??
              b.number ??
              999999;

            if (
              orderA !==
              orderB
            ) {
              return (
                orderA - orderB
              );
            }

            return (
              a.name.localeCompare(
                b.name
              )
            );
          }
        );
    }, [
      participants,
      levelId,
      selectedLevel,
    ]);

  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  const filteredCategories =
    useMemo(() => {
      if (!levelId) {
        return [];
      }

      return categories
        .filter(
          (category) =>
            category.eventLevelId ===
            levelId
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        );
    }, [
      categories,
      levelId,
    ]);

  // =====================================================
  // GROUP FILTER
  // =====================================================

  const filteredGroups =
    useMemo(() => {
      if (!levelId) {
        return [];
      }

      return groups
        .filter(
          (group) => {
            if (
              group.categories.length ===
              0
            ) {
              return false;
            }

            return group.categories.every(
              (item) =>
                item.category
                  .eventLevelId ===
                levelId
            );
          }
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        );
    }, [
      groups,
      levelId,
    ]);

  // =====================================================
  // SELECTED PARTICIPANT
  // =====================================================

  const selectedParticipant =
    useMemo(
      () =>
        filteredParticipants.find(
          (participant) =>
            participant.id ===
            participantId
        ) || null,
      [
        filteredParticipants,
        participantId,
      ]
    );

  // =====================================================
  // SELECTED CATEGORIES
  // =====================================================

  const selectedCategories =
    useMemo(() => {
      return filteredCategories
        .filter(
          (category) =>
            selectedCategoryIds.includes(
              category.id
            )
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        );
    }, [
      filteredCategories,
      selectedCategoryIds,
    ]);

  // =====================================================
  // SELECTED CATEGORY LABEL
  // =====================================================

  const selectedCategoryLabel =
    useMemo(() => {
      if (
        selectedCategories.length ===
        0
      ) {
        return "Belum ada kategori";
      }

      return selectedCategories
        .map(
          (category) =>
            category.name
        )
        .join(" + ");
    }, [
      selectedCategories,
    ]);

  // =====================================================
  // FIND EXISTING GROUP
  // =====================================================

  /*
   * Cari gabungan yang isinya
   * persis sama dengan checkbox
   * yang dipilih.
   */
  const existingGroup =
    useMemo(() => {
      if (
        selectedCategoryIds.length <
        2
      ) {
        return null;
      }

      const selected =
        [...selectedCategoryIds]
          .sort();

      return (
        filteredGroups.find(
          (group) => {
            const ids =
              group.categories
                .map(
                  (item) =>
                    item.categoryId
                )
                .sort();

            if (
              ids.length !==
              selected.length
            ) {
              return false;
            }

            return ids.every(
              (
                id,
                index
              ) =>
                id ===
                selected[index]
            );
          }
        ) || null
      );
    }, [
      selectedCategoryIds,
      filteredGroups,
    ]);

  // =====================================================
  // ACTIVE RUN KEY
  // =====================================================

  /*
   * Timer sekarang berdiri sendiri per peserta.
   * Kategori penilaian tidak digunakan untuk timer.
   * Nama/keterangan timer diisi manual hanya sebagai label tampilan.
   */
  const activeRunKey =
    participantId
      ? `PARTICIPANT:${participantId}`
      : "";

  // =====================================================
  // ACTIVE RECORD
  // =====================================================

  const record =
    activeRunKey
      ? records.find(
          (item) =>
            item.runKey ===
            activeRunKey
        ) || null
      : null;

  // =====================================================
  // ELAPSED
  // =====================================================

  const elapsed =
    record?.startedAt
      ? record.status ===
          "STOPPED" &&
        record.durationSec !==
          null
        ? record.durationSec
        : Math.max(
            0,
            Math.floor(
              (now -
                new Date(
                  record.startedAt
                ).getTime()) /
                1000
            )
          )
      : record?.durationSec || 0;

  // =====================================================
  // CHANGE LEVEL
  // =====================================================

  function changeLevel(
    nextLevelId: string
  ) {
    setLevelId(
      nextLevelId
    );

    setParticipantId("");

    setManualTimerName("");

    setSelectedCategoryIds([]);

    setGroupCategoryIds([]);

    setError("");
  }

  // =====================================================
  // CHANGE PARTICIPANT
  // =====================================================

  function changeParticipant(
    nextParticipantId: string
  ) {
    setParticipantId(
      nextParticipantId
    );

    setManualTimerName("");

    setError("");
  }

  // =====================================================
  // TOGGLE CATEGORY
  // =====================================================

  function toggleCategory(
    categoryId: string
  ) {
    setError("");

    setSelectedCategoryIds(
      (current) => {
        if (
          current.includes(
            categoryId
          )
        ) {
          return current.filter(
            (id) =>
              id !==
              categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  // =====================================================
  // SELECT ALL CATEGORY
  // =====================================================

  function selectAllCategories() {
    setSelectedCategoryIds(
      filteredCategories.map(
        (category) =>
          category.id
      )
    );

    setError("");
  }

  // =====================================================
  // CLEAR CATEGORY
  // =====================================================

  function clearCategories() {
    setSelectedCategoryIds([]);

    setError("");
  }

  // =====================================================
  // CREATE GROUP
  // =====================================================

  async function createGroup() {
    if (!levelId) {
      setError(
        "Pilih tingkatan terlebih dahulu."
      );

      return null;
    }

    if (
      !newGroupName.trim()
    ) {
      setError(
        "Nama gabungan wajib diisi."
      );

      return null;
    }

    if (
      groupCategoryIds.length ===
      0
    ) {
      setError(
        "Pilih minimal satu kategori."
      );

      return null;
    }

    setError("");

    try {
      const response =
        await fetch(
          "/api/timer",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action:
                "CREATE_GROUP",

              name:
                newGroupName.trim(),

              categoryIds:
                groupCategoryIds,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Gagal membuat gabungan."
        );
      }

      if (result.group) {
        setGroups(
          (current) =>
            [
              ...current,
              result.group,
            ].sort(
              (a, b) =>
                a.sortOrder -
                b.sortOrder
            )
        );
      }

      setNewGroupName("");

      setGroupCategoryIds([]);

      return result.group;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat gabungan."
      );

      return null;
    }
  }

  // =====================================================
  // DELETE GROUP
  // =====================================================

  async function deleteGroup(
    group: Group
  ) {
    if (
      !confirm(
        `Hapus gabungan "${group.name}"?`
      )
    ) {
      return;
    }

    setError("");

    try {
      const response =
        await fetch(
          "/api/timer",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "DELETE_GROUP",

              timerGroupId:
                group.id,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Gagal menghapus gabungan."
        );
      }

      setGroups(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              group.id
          )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus gabungan."
      );
    }
  }

  // =====================================================
  // ENSURE GROUP
  // =====================================================

  /*
   * Kalau user centang:
   *
   * PBB + KOMANDAN
   *
   * dan gabungannya belum ada,
   * sistem otomatis membuat group.
   */
  async function ensureGroup() {
    if (
      selectedCategoryIds.length <
      2
    ) {
      return null;
    }

    if (existingGroup) {
      return existingGroup;
    }

    const categoryNames =
      filteredCategories
        .filter(
          (category) =>
            selectedCategoryIds.includes(
              category.id
            )
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        )
        .map(
          (category) =>
            category.name
        );

    const autoName =
      categoryNames.join(
        " + "
      );

    try {
      const response =
        await fetch(
          "/api/timer",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action:
                "CREATE_GROUP",

              name:
                autoName,

              categoryIds:
                selectedCategoryIds,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Gagal membuat gabungan kategori."
        );
      }

      if (result.group) {
        setGroups(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  item.id ===
                  result.group.id
              );

            if (exists) {
              return current;
            }

            return [
              ...current,
              result.group,
            ].sort(
              (a, b) =>
                a.sortOrder -
                b.sortOrder
            );
          }
        );

        return result.group;
      }

      return null;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat gabungan kategori."
      );

      return null;
    }
  }

  // =====================================================
  // TIMER ACTION
  // =====================================================

  async function action(
    actionName:
      | "START"
      | "STOP"
      | "RESET"
  ) {
    if (!levelId) {
      setError(
        "Pilih tingkatan terlebih dahulu."
      );

      return;
    }

    if (!participantId) {
      setError(
        "Pilih peserta terlebih dahulu."
      );

      return;
    }

    setError("");

    try {
      const response =
        await fetch(
          "/api/timer",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: actionName,
              eventId: event?.id,
              participantId,
              timerGroupId: null,
              categoryId: null,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Gagal menyimpan Timer."
        );
      }

      if (result.record) {
        setRecords(
          (current) => {
            const next =
              current.filter(
                (item) =>
                  item.runKey !==
                  result.record.runKey
              );

            return [
              ...next,
              result.record,
            ];
          }
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan Timer."
      );
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    await fetch(
      "/api/auth/logout",
      {
        method: "POST",
      }
    ).catch(() => {});

    router.replace(
      "/login?next=/timer"
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-10 text-center font-black text-[#071a3d] shadow-sm">
            Memuat Timer...
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-5 rounded-3xl bg-[#071a3d] p-6 text-white shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.28em] text-blue-300">
                CETAS SCORE • TIMER
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Timer Penampilan
              </h1>

              {events.length > 1 ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-white/65">Event:</span>
                  <select
                    value={event?.id || ""}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setLevelId("");
                      setParticipantId("");
                      void load(newId);
                    }}
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                        {ev.name} {ev.status === "ACTIVE" ? "(Aktif)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-2 text-white/65">
                  {event?.name ||
                    "Event aktif"}
                </p>
              )}
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-white/20 px-4 py-2 font-bold transition hover:bg-white/10"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            MAIN CONFIG
        ================================================= */}

        <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div>
              <p className="text-xs font-black tracking-[.22em] text-blue-600">
                TIMER UTAMA
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#071a3d]">
                Timer Peserta
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pilih satu atau beberapa kategori
                untuk menggunakan satu timer.
              </p>
            </div>

            {/* =============================================
                TINGKATAN
            ============================================= */}

            <label className="mt-6 block text-sm font-black text-slate-600">
              Tingkatan
            </label>

            <select
              value={levelId}
              onChange={(e) =>
                changeLevel(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-bold outline-none focus:border-blue-500"
            >
              <option value="">
                Pilih tingkatan...
              </option>

              {levels.map(
                (level) => (
                  <option
                    key={level.id}
                    value={
                      level.id
                    }
                  >
                    {level.name}
                  </option>
                )
              )}
            </select>

            {/* =============================================
                PESERTA
            ============================================= */}

            <label className="mt-5 block text-sm font-black text-slate-600">
              Peserta
            </label>

            <select
              value={
                participantId
              }
              onChange={(e) =>
                changeParticipant(
                  e.target.value
                )
              }
              disabled={!levelId}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-bold outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {!levelId
                  ? "Pilih tingkatan terlebih dahulu..."
                  : "Pilih peserta..."}
              </option>

              {filteredParticipants.map(
                (participant) => (
                  <option
                    key={
                      participant.id
                    }
                    value={
                      participant.id
                    }
                  >
                    #
                    {
                      participant.number
                    }{" "}
                    —{" "}
                    {
                      participant.name
                    }
                    {participant.school
                      ? ` — ${participant.school}`
                      : ""}
                  </option>
                )
              )}
            </select>

            {/* =============================================
                MANUAL TIMER LABEL
            ============================================= */}

            <div className="mt-5">
              <label className="block text-sm font-black text-slate-600">
                Nama / Keterangan Timer
              </label>

              <input
                value={manualTimerName}
                onChange={(e) =>
                  setManualTimerName(e.target.value)
                }
                disabled={!participantId}
                placeholder="Contoh: Waktu Penampilan"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-bold outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Isi manual sesuai kebutuhan. Timer tidak terhubung ke kategori penilaian.
              </p>
            </div>

            {/* =============================================
                SELECTED TIMER SUMMARY
            ============================================= */}

            <div className="mt-4 rounded-2xl bg-[#071a3d] p-4 text-white">
              <p className="text-[10px] font-black tracking-[.2em] text-blue-300">
                TIMER AKAN MENGUKUR
              </p>

              <p className="mt-2 text-lg font-black">
                {manualTimerName.trim() || "Timer Peserta"}
              </p>

              <p className="mt-1 text-xs text-white/60">
                Timer berdiri sendiri per peserta dan tidak mengikuti kategori penilaian.
              </p>
            </div>

            {/* =============================================
                INFO
            ============================================= */}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">

              <b className="text-[#071a3d]">
                Penyimpanan otomatis.
              </b>

              <br />

              Waktu mulai dan berhenti
              dicatat oleh server.

              <br />

              Durasi mentah disimpan ke
              database untuk dipakai
              pada Rekap.
            </div>
          </div>

          {/* =================================================
              TIMER DISPLAY
          ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-[#071a3d] p-7 text-white shadow-xl">

            <p className="text-xs font-black tracking-[.25em] text-blue-300">
              TIMER PESERTA
            </p>

            <h2 className="mt-3 text-2xl font-black">
              {selectedParticipant
                ? `#${selectedParticipant.number} — ${selectedParticipant.name}`
                : "Pilih peserta"}
            </h2>

            {selectedParticipant?.school && (
              <p className="mt-1 text-sm text-white/50">
                {
                  selectedParticipant.school
                }
              </p>
            )}

            {selectedLevel && (
              <p className="mt-1 text-sm text-white/50">
                {selectedLevel.name}
              </p>
            )}

            <div className="mt-5 rounded-2xl bg-white/10 p-4">

              <p className="text-[10px] font-black tracking-[.2em] text-blue-300">
                KETERANGAN TIMER
              </p>

              <p className="mt-2 text-lg font-black">
                {manualTimerName.trim() || "Timer Peserta"}
              </p>

            </div>

            <div className="my-10 text-center text-6xl font-black tabular-nums tracking-tight md:text-7xl">
              {fmt(elapsed)}
            </div>

            {/* =============================================
                ACTION BUTTON
            ============================================= */}

            <div className="grid grid-cols-2 gap-3">

              <button
                disabled={
                  !participantId ||
                  record?.status ===
                    "RUNNING"
                }
                onClick={() =>
                  action(
                    "START"
                  )
                }
                className="rounded-2xl bg-blue-600 px-5 py-4 font-black transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                MULAI
              </button>

              <button
                disabled={
                  !record ||
                  record.status !==
                    "RUNNING"
                }
                onClick={() =>
                  action(
                    "STOP"
                  )
                }
                className="rounded-2xl bg-white px-5 py-4 font-black text-[#071a3d] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                STOP & SIMPAN
              </button>

            </div>

            <button
              disabled={
                !record ||
                record.status ===
                  "RUNNING"
              }
              onClick={() =>
                action(
                  "RESET"
                )
              }
              className="mt-3 w-full rounded-2xl border border-white/20 px-5 py-3 font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Reset Timer
            </button>

            {/* =============================================
                SAVED
            ============================================= */}

            {record?.status ===
              "STOPPED" && (
              <div className="mt-5 rounded-2xl bg-emerald-500/15 p-4 text-center">

                <p className="text-xs font-black tracking-widest text-emerald-300">
                  TERSIMPAN
                </p>

                <p className="mt-1 text-xl font-black">
                  {fmt(
                    record.durationSec ||
                      0
                  )}
                </p>

              </div>
            )}

          </div>
        </section>

        {/* =================================================
            HISTORY
        ================================================= */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-black text-[#071a3d]">
                Riwayat Timer
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Durasi mentah hasil timer yang
                sudah tersimpan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load(event?.id)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          <div className="mt-4 overflow-auto">

            <table className="w-full min-w-[900px] text-sm">

              <thead>
                <tr className="border-b text-left text-slate-500">

                  <th className="p-3">
                    Tingkatan
                  </th>

                  <th className="p-3">
                    Peserta
                  </th>

                  <th className="p-3">
                    Keterangan
                  </th>

                  <th className="p-3">
                    Durasi
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {records
                  .filter(
                    (item) =>
                      item.status ===
                      "STOPPED"
                  )
                  .sort(
                    (a, b) => {
                      const aTime =
                        a.stoppedAt
                          ? new Date(
                              a.stoppedAt
                            ).getTime()
                          : 0;

                      const bTime =
                        b.stoppedAt
                          ? new Date(
                              b.stoppedAt
                            ).getTime()
                          : 0;

                      return (
                        bTime -
                        aTime
                      );
                    }
                  )
                  .map(
                    (item) => {
                      const participant =
                        participants.find(
                          (
                            p
                          ) =>
                            p.id ===
                            item.participantId
                        );

                      const group =
                        groups.find(
                          (g) =>
                            g.id ===
                            item.timerGroupId
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b last:border-b-0"
                        >

                          <td className="p-3 font-bold">
                            {
                              participant
                                ?.eventLevel
                                ?.name
                            }
                          </td>

                          <td className="p-3 font-bold">
                            #
                            {
                              participant?.number
                            }{" "}
                            —{" "}
                            {
                              participant?.name
                            }
                          </td>

                          <td className="p-3 font-bold">
                            Timer Peserta
                          </td>

                          <td className="p-3 font-black">
                            {fmt(
                              item.durationSec ||
                                0
                            )}
                          </td>

                          <td className="p-3 font-bold text-emerald-600">
                            TERSIMPAN
                          </td>

                        </tr>
                      );
                    }
                  )}

                {records.filter(
                  (item) =>
                    item.status ===
                    "STOPPED"
                ).length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-sm font-bold text-slate-400"
                    >
                      Belum ada timer yang
                      tersimpan.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </section>

      </div>
    </main>
  );
}