"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

// ============================================================
// TYPE
// ============================================================

type Category = {
  id: string;
  eventId: string;
  eventLevelId: string | null;
  name: string;
  percentage: number;
  sortOrder: number;
  status: string;
};

type EventLevel = {
  id: string;
  eventId: string;
  code: string;
  name: string;
  sortOrder: number;
  status: string;

  // PENTING:
  // Setiap tingkatan mempunyai kategori sendiri.
  categories: Category[];
};

type EventData = {
  id: string;
  name: string;
  status: string;
  levels: EventLevel[];
};

type AssignedCategory = {
  id: string;
  name: string;
  eventId: string;
  eventLevelId: string | null;
};

type Judge = {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;

  categoryLinks: {
    category: AssignedCategory;
  }[];
};

// ============================================================
// PAGE
// ============================================================

export default function AdminJudgePage() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [events, setEvents] = useState<EventData[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);

  const [eventId, setEventId] = useState("");

  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // FORM JURI
  // ==========================================================

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Judge | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("JUDGE");

  // ==========================================================
  // PENUGASAN
  // ==========================================================

  const [assigning, setAssigning] = useState<Judge | null>(null);

  /**
   * Semua kategori yang dipilih pada event.
   *
   * Jangan di-reset ketika berpindah tingkatan.
   */
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  /**
   * Tingkatan yang sedang dibuka.
   *
   * null = tampilkan daftar tingkatan.
   */
  const [selectedLevelId, setSelectedLevelId] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/judges", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Gagal mengambil data juri."
        );
      }

      setEvents(data.events || []);
      setJudges(data.judges || []);

      // ======================================================
      // AUTO SELECT EVENT
      // ======================================================

      if (!eventId && data.events?.length) {
        const activeEvent =
          data.events.find(
            (event: EventData) =>
              event.status === "ACTIVE"
          ) || data.events[0];

        setEventId(activeEvent.id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data juri."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // ==========================================================
  // EVENT TERPILIH
  // ==========================================================

  const selectedEvent = useMemo(() => {
    return (
      events.find(
        (event) => event.id === eventId
      ) || null
    );
  }, [events, eventId]);

  // ==========================================================
  // TINGKATAN TERPILIH
  // ==========================================================

  const selectedLevel = useMemo(() => {
    if (!selectedEvent || !selectedLevelId) {
      return null;
    }

    return (
      selectedEvent.levels.find(
        (level) =>
          level.id === selectedLevelId
      ) || null
    );
  }, [
    selectedEvent,
    selectedLevelId,
  ]);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  function resetForm() {
    setName("");
    setUsername("");
    setPin("");
    setRole("JUDGE");
    setEditing(null);
    setShowForm(false);
  }

  // ==========================================================
  // TAMBAH JURI
  // ==========================================================

  function openCreate() {
    setError("");
    setSuccess("");

    setEditing(null);
    setName("");
    setUsername("");
    setPin("");
    setRole("JUDGE");

    setShowForm(true);
  }

  // ==========================================================
  // EDIT JURI
  // ==========================================================

  function openEdit(judge: Judge) {
    setError("");
    setSuccess("");

    setEditing(judge);

    setName(judge.name);
    setUsername(judge.username);
    setPin("");
    setRole(judge.role || "JUDGE");

    setShowForm(true);
  }

  // ==========================================================
  // SIMPAN JURI
  // ==========================================================

  async function saveJudge(
    e: FormEvent
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "/api/judges",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: editing
              ? "update"
              : "create",

            id: editing?.id,

            name,
            username,
            pin,
            role,

            status:
              editing?.status ||
              "ACTIVE",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Gagal menyimpan juri."
        );
      }

      setSuccess(
        editing
          ? "Data juri berhasil diperbarui."
          : "Juri berhasil ditambahkan."
      );

      resetForm();

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan juri."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // TOGGLE STATUS
  // ==========================================================

  async function toggleStatus(
    judge: Judge
  ) {
    const action =
      judge.status === "ACTIVE"
        ? "menonaktifkan"
        : "mengaktifkan";

    if (
      !window.confirm(
        `Yakin ingin ${action} juri "${judge.name}"?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "/api/judges",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action:
              "toggle-status",

            id: judge.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Gagal mengubah status juri."
        );
      }

      setSuccess(
        judge.status === "ACTIVE"
          ? "Juri dinonaktifkan."
          : "Juri diaktifkan."
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status juri."
      );
    }
  }

  // ==========================================================
  // HAPUS JURI
  // ==========================================================

  async function deleteJudge(
    judge: Judge
  ) {
    if (
      !window.confirm(
        `Juri "${judge.name}" akan dinonaktifkan dari sistem.\n\nData penilaian lama tetap aman.\n\nLanjutkan?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "/api/judges",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "delete",
            id: judge.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Gagal menghapus juri."
        );
      }

      setSuccess(
        data.message ||
          "Juri berhasil dinonaktifkan."
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus juri."
      );
    }
  }

  // ==========================================================
  // BUKA MODAL PENUGASAN
  // ==========================================================

  function openAssign(judge: Judge) {
    setError("");
    setSuccess("");

    // ========================================================
    // AMBIL ASSIGNMENT YANG SUDAH ADA
    // KHUSUS EVENT TERPILIH
    // ========================================================

    const existingCategoryIds =
      judge.categoryLinks
        .filter(
          (link) =>
            link.category.eventId ===
            eventId
        )
        .map(
          (link) =>
            link.category.id
        );

    setAssigning(judge);

    setSelectedCategories(
      existingCategoryIds
    );

    // ========================================================
    // PENTING:
    // MULAI DARI PILIH TINGKATAN
    // ========================================================

    setSelectedLevelId(null);
  }

  // ==========================================================
  // TUTUP MODAL
  // ==========================================================

  function closeAssign() {
    if (saving) {
      return;
    }

    setAssigning(null);
    setSelectedLevelId(null);
  }

  // ==========================================================
  // PILIH / BATAL PILIH KATEGORI
  // ==========================================================

  function toggleCategory(
    categoryId: string
  ) {
    setSelectedCategories(
      (current) => {
        if (
          current.includes(
            categoryId
          )
        ) {
          return current.filter(
            (id) =>
              id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  // ==========================================================
  // JUMLAH KATEGORI TERPILIH PADA TINGKATAN
  // ==========================================================

  function getLevelSelectedCount(
    level: EventLevel
  ) {
    return level.categories.filter(
      (category) =>
        selectedCategories.includes(
          category.id
        )
    ).length;
  }

  // ==========================================================
  // SIMPAN PENUGASAN
  // ==========================================================

  async function saveAssignment() {
    if (!assigning || !eventId) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "/api/judges",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "assign",

            judgeId:
              assigning.id,

            eventId,

            categoryIds:
              selectedCategories,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Gagal menyimpan penugasan."
        );
      }

      setSuccess(
        `Penugasan ${assigning.name} berhasil disimpan.`
      );

      setAssigning(null);
      setSelectedLevelId(null);

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan penugasan."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // ASSIGNMENT PADA EVENT
  // ==========================================================

  function getAssignments(
    judge: Judge
  ) {
    return judge.categoryLinks
      .filter(
        (link) =>
          link.category.eventId ===
          eventId
      )
      .map(
        (link) =>
          link.category.name
      );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f3f7fc] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="text-xs font-black tracking-[.22em] text-blue-600">
                CETAS.SCORE • ADMIN
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#071a3d]">
                Manajemen Juri
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola akun juri dan tentukan
                kategori yang menjadi tanggung
                jawab masing-masing juri.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                ← Dashboard
              </Link>

              <button
                type="button"
                onClick={openCreate}
                className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                + Tambah Juri
              </button>
            </div>

          </div>
        </header>

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {(error || success) && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${
              error
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || success}
          </div>
        )}

        {/* ==================================================
            EVENT
        ================================================== */}

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Event
              </p>

              <h2 className="mt-1 text-lg font-black text-[#071a3d]">
                Pilih Event Penugasan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Penugasan juri dipisahkan
                berdasarkan event.
              </p>
            </div>

            <select
              value={eventId}
              onChange={(e) => {
                setEventId(
                  e.target.value
                );

                setAssigning(null);
                setSelectedLevelId(null);
              }}
              className="min-w-[300px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#071a3d] outline-none focus:border-blue-500"
            >
              {events.map(
                (event) => (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.name}
                    {event.status ===
                    "ACTIVE"
                      ? " • AKTIF"
                      : ""}
                  </option>
                )
              )}
            </select>

          </div>

          {/* =================================================
              TINGKATAN EVENT
          ================================================= */}

          {selectedEvent && (
            <div className="mt-5">

              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Tingkatan Event
              </p>

              <div className="flex flex-wrap gap-2">

                {selectedEvent.levels?.map(
                  (level) => (
                    <span
                      key={level.id}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700"
                    >
                      {level.name}

                      {level.categories.length >
                        0 && (
                        <>
                          {" • "}
                          {
                            level
                              .categories
                              .length
                          }{" "}
                          kategori
                        </>
                      )}
                    </span>
                  )
                )}

                {!selectedEvent
                  .levels?.length && (
                  <span className="text-sm text-slate-400">
                    Belum ada tingkatan.
                  </span>
                )}

              </div>

            </div>
          )}
        </section>

        {/* ==================================================
            FORM TAMBAH / EDIT JURI
        ================================================== */}

        {showForm && (
          <section className="mb-5 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  {editing
                    ? "Edit Juri"
                    : "Juri Baru"}
                </p>

                <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                  {editing
                    ? `Edit ${editing.name}`
                    : "Tambah Juri"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
              >
                Batal
              </button>

            </div>

            <form
              onSubmit={saveJudge}
              className="grid gap-4 md:grid-cols-4"
            >

              {/* NAMA */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Nama Lengkap
                </span>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Ahmad Fauzi"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              {/* USERNAME */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Username Login
                </span>

                <input
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(
                          /\s/g,
                          ""
                        )
                    )
                  }
                  placeholder="contoh: juri1"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              {/* ROLE */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Role Akun
                </span>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-[#071a3d] outline-none focus:border-blue-500"
                >
                  <option value="JUDGE">JUDGE (Dewan Juri)</option>
                  <option value="OPERATOR">OPERATOR (Admin / Tim Rekap)</option>
                  <option value="TIMER">TIMER (Petugas Timer)</option>
                </select>
              </label>

              {/* PIN */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  {editing
                    ? "PIN Baru (opsional)"
                    : "PIN"}
                </span>

                <input
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          12
                        )
                    )
                  }
                  type="password"
                  inputMode="numeric"
                  placeholder={
                    editing
                      ? "Kosongkan jika tidak diganti"
                      : "Minimal 4 angka"
                  }
                  required={!editing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 tracking-[.25em] outline-none focus:border-blue-500"
                />
              </label>

              <div className="flex justify-end md:col-span-4">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#071a3d] px-6 py-3 text-sm font-black text-white disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editing
                    ? "Simpan Perubahan"
                    : "Tambah Akun"}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* ==================================================
            DAFTAR JURI
        ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <p className="text-xs font-black uppercase tracking-wider text-blue-600">
              Daftar Juri
            </p>

            <h2 className="mt-1 text-xl font-black text-[#071a3d]">
              {judges.length} Juri Terdaftar
            </h2>

          </div>

          {loading ? (
            <div className="rounded-xl bg-slate-50 p-10 text-center text-sm font-bold text-slate-400">
              Memuat data juri...
            </div>
          ) : !judges.length ? (
            <div className="rounded-xl bg-slate-50 p-10 text-center">

              <p className="font-black text-[#071a3d]">
                Belum ada juri tambahan.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Juri bisa ditambahkan
                menggunakan tombol di atas.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {judges.map(
                (judge, index) => {
                  const assignments =
                    getAssignments(
                      judge
                    );

                  return (
                    <div
                      key={judge.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="flex flex-wrap items-start justify-between gap-4">

                        <div className="flex items-start gap-4">

                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#071a3d] text-sm font-black text-white">
                            {index + 1}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-black text-[#071a3d]">
                                {judge.name}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                  judge.status ===
                                  "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {judge.status ===
                                "ACTIVE"
                                  ? "AKTIF"
                                  : "NONAKTIF"}
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                              @{judge.username}
                            </p>

                            <div className="mt-3">

                              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                Kategori pada event ini
                              </p>

                              <div className="flex flex-wrap gap-2">

                                {assignments.map(
                                  (
                                    category,
                                    categoryIndex
                                  ) => (
                                    <span
                                      key={`${category}-${categoryIndex}`}
                                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                                    >
                                      {category}
                                    </span>
                                  )
                                )}

                                {!assignments.length && (
                                  <span className="text-xs font-semibold text-slate-400">
                                    Belum ditugaskan
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openAssign(
                                judge
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                          >
                            Penugasan
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                judge
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(
                                judge
                              )
                            }
                            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700"
                          >
                            {judge.status ===
                            "ACTIVE"
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteJudge(
                                judge
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600"
                          >
                            Hapus
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ==================================================
            MODAL PENUGASAN
        ================================================== */}

        {assigning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a3d]/50 p-5">

            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="shrink-0 border-b border-slate-100 p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                      Penugasan Juri
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                      {assigning.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Event:{" "}
                      <b>
                        {selectedEvent?.name ||
                          "-"}
                      </b>
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={closeAssign}
                    disabled={saving}
                    className="text-2xl leading-none text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* =================================================
                  MODAL CONTENT
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto p-6">

                {/* =================================================
                    STEP 1
                    PILIH TINGKATAN
                ================================================= */}

                {!selectedLevel ? (
                  <div>

                    <div className="mb-4">

                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Penugasan Tingkatan
                      </p>

                      <h3 className="mt-1 text-base font-black text-[#071a3d]">
                        Pilih tingkatan terlebih dahulu
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Pilih tingkatan untuk
                        melihat kategori yang
                        tersedia pada tingkatan
                        tersebut.
                      </p>

                    </div>

                    <div className="space-y-2">

                      {selectedEvent?.levels?.length ? (
                        selectedEvent.levels.map(
                          (level) => {
                            const selectedCount =
                              getLevelSelectedCount(
                                level
                              );

                            return (
                              <button
                                type="button"
                                key={level.id}
                                onClick={() =>
                                  setSelectedLevelId(
                                    level.id
                                  )
                                }
                                className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                              >

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <p className="font-black text-[#071a3d]">
                                      {level.name}
                                    </p>

                                    {level.code !==
                                      "NO_LEVEL" && (
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                        {level.code}
                                      </span>
                                    )}

                                  </div>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {
                                      level
                                        .categories
                                        .length
                                    }{" "}
                                    kategori
                                  </p>

                                </div>

                                <div className="flex shrink-0 items-center gap-3">

                                  {selectedCount >
                                    0 && (
                                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black text-white">
                                      {
                                        selectedCount
                                      }{" "}
                                      dipilih
                                    </span>
                                  )}

                                  <span className="text-lg font-black text-slate-300 transition group-hover:text-blue-600">
                                    ›
                                  </span>

                                </div>

                              </button>
                            );
                          }
                        )
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                          <p className="font-black text-[#071a3d]">
                            Belum ada tingkatan
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Buat tingkatan pada
                            event terlebih dahulu.
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                ) : (
                  /* =================================================
                     STEP 2
                     PILIH KATEGORI
                  ================================================= */

                  <div>

                    {/* KEMBALI */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLevelId(
                          null
                        )
                      }
                      className="mb-5 flex items-center gap-2 text-xs font-black text-blue-600"
                    >
                      <span className="text-base">
                        ←
                      </span>

                      Kembali ke Tingkatan
                    </button>

                    {/* LEVEL HEADER */}

                    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                        Tingkatan Terpilih
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-3">

                        <h3 className="font-black text-[#071a3d]">
                          {selectedLevel.name}
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-blue-700">
                          {
                            getLevelSelectedCount(
                              selectedLevel
                            )
                          }{" "}
                          /{" "}
                          {
                            selectedLevel
                              .categories
                              .length
                          }{" "}
                          dipilih
                        </span>

                      </div>

                    </div>

                    {/* CATEGORY TITLE */}

                    <div className="mb-3 flex items-center justify-between">

                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Kategori pada tingkatan
                      </p>

                      <span className="text-[11px] font-bold text-blue-600">
                        {
                          selectedLevel
                            .categories
                            .length
                        }{" "}
                        kategori
                      </span>

                    </div>

                    {/* CATEGORY LIST */}

                    <div className="space-y-2">

                      {selectedLevel.categories
                        .length ? (
                        selectedLevel.categories.map(
                          (category) => {
                            const checked =
                              selectedCategories.includes(
                                category.id
                              );

                            return (
                              <button
                                type="button"
                                key={category.id}
                                onClick={() =>
                                  toggleCategory(
                                    category.id
                                  )
                                }
                                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                                  checked
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >

                                <div className="min-w-0">

                                  <p className="font-black text-[#071a3d]">
                                    {
                                      category.name
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Bobot{" "}
                                    {
                                      category.percentage
                                    }
                                    %
                                  </p>

                                </div>

                                <span
                                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-black ${
                                    checked
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>

                              </button>
                            );
                          }
                        )
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                          <p className="font-black text-[#071a3d]">
                            Belum ada kategori
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Belum ada kategori yang
                            terhubung dengan tingkatan
                            ini.
                          </p>

                        </div>
                      )}

                    </div>

                    {/* INFO */}

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Total penugasan
                          </p>

                          <p className="mt-1 text-sm font-black text-[#071a3d]">
                            {
                              selectedCategories.length
                            }{" "}
                            kategori
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(
                              []
                            )
                          }
                          disabled={
                            selectedCategories.length ===
                            0
                          }
                          className="text-xs font-black text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Hapus semua pilihan
                        </button>

                      </div>

                      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                        Pilihan dari tingkatan lain
                        tetap tersimpan. Kamu bisa
                        kembali ke daftar tingkatan
                        tanpa kehilangan pilihan.
                      </p>

                    </div>

                  </div>
                )}

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="shrink-0 border-t border-slate-100 bg-white p-4">

                <div className="flex items-center justify-between gap-3">

                  <div className="text-xs font-bold text-slate-400">

                    {selectedCategories.length >
                    0 ? (
                      <>
                        <span className="font-black text-blue-600">
                          {
                            selectedCategories.length
                          }
                        </span>{" "}
                        kategori dipilih
                      </>
                    ) : (
                      "Belum ada kategori dipilih"
                    )}

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={closeAssign}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      disabled={
                        saving ||
                        !selectedEvent
                      }
                      onClick={
                        saveAssignment
                      }
                      className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                    >
                      {saving
                        ? "Menyimpan..."
                        : "Simpan Penugasan"}
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}