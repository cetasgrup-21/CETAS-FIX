"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EventData = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  totalPoints: number;
  levels?: EventLevel[];
};

type EventLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder?: number;
  status?: string;
};

type Participant = {
  id: string;
  eventId: string;
  categoryId: string | null;
  number: number;
  displayOrder?: number | null;
  name: string;
  school?: string | null;
  level?: string | null;
  photo?: string | null;
  logo?: string | null;
  status: string;
};

export default function ParticipantsPage() {
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [eventRes, participantRes] =
        await Promise.all([
          fetch("/api/event", {
            cache: "no-store",
          }),

          fetch("/api/participants", {
            cache: "no-store",
          }),
        ]);

      const eventData = await eventRes.json();
      const participantData =
        await participantRes.json();

      if (!eventRes.ok) {
        throw new Error(
          eventData?.error ||
            "Gagal mengambil event."
        );
      }

      if (!participantRes.ok) {
        throw new Error(
          participantData?.error ||
            "Gagal mengambil peserta."
        );
      }

      // /api/event tidak selalu mengembalikan relasi levels.
      // Ambil tingkatan dari endpoint khusus berdasarkan event aktif.
      let levels: EventLevel[] = [];

      if (eventData?.id) {
        const levelRes = await fetch(
          `/api/event-levels?eventId=${encodeURIComponent(eventData.id)}`,
          { cache: "no-store" }
        );

        const levelData = await levelRes.json();

        if (levelRes.ok && Array.isArray(levelData?.levels)) {
          levels = levelData.levels;
        }
      }

      setEvent({
        ...eventData,
        levels,
      });

      setParticipants(
        Array.isArray(
          participantData.participants
        )
          ? participantData.participants
          : []
      );

    } catch (e) {
      console.error(e);

      setError(
        e instanceof Error
          ? e.message
          : "Gagal memuat data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  function resetForm() {
    setEditingId(null);
    setNumber("");
    setName("");
    setSchool("");
    setLevel("");
    setPhoto(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(
    participant: Participant
  ) {
    setEditingId(participant.id);

    setNumber(
      String(participant.number || "")
    );

    setName(participant.name || "");
    setSchool(participant.school || "");
    setLevel(participant.level || "");
    setPhoto(participant.photo || null);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  /*
   * =========================================================
   * PHOTO
   * =========================================================
   */

  async function fileToDataUrl(
    file: File
  ): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error(
        "Foto peserta harus berupa gambar."
      );
    }

    if (file.size > 3 * 1024 * 1024) {
      throw new Error(
        "Ukuran foto maksimal 3 MB."
      );
    }

    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          const result =
            reader.result;

          if (
            typeof result !== "string"
          ) {
            reject(
              new Error(
                "Foto tidak dapat dibaca."
              )
            );

            return;
          }

          resolve(result);
        };

        reader.onerror = () =>
          reject(
            new Error(
              "Gagal membaca foto."
            )
          );

        reader.readAsDataURL(file);
      }
    );
  }

  async function handlePhoto(
    file?: File
  ) {
    if (!file) return;

    try {
      const data =
        await fileToDataUrl(file);

      setPhoto(data);
      setMessage(
        "Foto peserta siap disimpan."
      );
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gagal membaca foto."
      );
    }
  }

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  async function saveParticipant() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const participantNumber =
        Number(number);

      if (
        !Number.isInteger(
          participantNumber
        ) ||
        participantNumber <= 0
      ) {
        throw new Error(
          "Nomor peserta harus berupa angka lebih dari 0."
        );
      }

      if (!name.trim()) {
        throw new Error(
          "Nama peserta wajib diisi."
        );
      }

      const allowedLevels = (event?.levels || [])
        .filter((item) => item.status !== "INACTIVE")
        .map((item) => item.name || item.code)
        .filter(Boolean);

      if (!level || !allowedLevels.includes(level)) {
        throw new Error(
          "Tingkatan peserta wajib dipilih."
        );
      }

      const payload = {
        id: editingId,
        categoryId: null,
        number:
          participantNumber,
        name: name.trim(),
        school:
          school.trim(),
        level:
          level.trim(),
        photo,
      };

      const res = await fetch(
        "/api/participants",
        {
          method:
            editingId
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Gagal menyimpan peserta."
        );
      }

      setMessage(
        editingId
          ? `Peserta "${name}" berhasil diperbarui.`
          : `Peserta "${name}" berhasil ditambahkan.`
      );

      closeForm();

      await loadData();
    } catch (e) {
      console.error(e);

      setError(
        e instanceof Error
          ? e.message
          : "Gagal menyimpan peserta."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  async function deleteParticipant(
    participant: Participant
  ) {
    const confirmed =
      window.confirm(
        `Hapus peserta "${participant.name}"?\n\nSemua nilai, bonus, penalti, dan hasil yang terikat dengan peserta ini juga akan terhapus.`
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "/api/participants",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: participant.id,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Gagal menghapus peserta."
        );
      }

      setMessage(
        data?.message ||
          "Peserta berhasil dihapus."
      );

      await loadData();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gagal menghapus peserta."
      );
    }
  }

  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const filteredParticipants =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return participants.filter(
        (participant) =>
          !keyword ||
          participant.name
            .toLowerCase()
            .includes(keyword) ||
          String(participant.number)
            .includes(keyword) ||
          (participant.school || "")
            .toLowerCase()
            .includes(keyword) ||
          (participant.level || "")
            .toLowerCase()
            .includes(keyword)
      );
    }, [participants, search]);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-6">
        <div className="rounded-2xl border bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Memuat data peserta...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-5">

        {/* HEADER */}

        <header className="rounded-2xl bg-[#071a3d] p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">

            <div>
              <p className="text-xs font-black tracking-[.25em] text-blue-300">
                CETAS SCORE • ADMIN
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Peserta
              </h1>

              <p className="mt-2 text-sm text-white/60">
                Kelola peserta event. Setiap peserta otomatis
                dapat dinilai pada seluruh kategori yang ditugaskan.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/dashboard"
                )
              }
              className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
        </header>

        {/* EVENT */}

        <section className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex flex-wrap items-center gap-4">

            {event?.logo ? (
              <img
                src={event.logo}
                alt={`Logo ${event.name}`}
                className="h-16 w-16 rounded-xl border bg-white object-contain p-1"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-xl border bg-slate-50 text-[9px] font-black text-slate-400">
                NO LOGO
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-500">
                EVENT AKTIF
              </p>

              <h2 className="mt-1 truncate text-xl font-black text-[#071a3d]">
                {event?.name ||
                  "Belum ada event"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {event?.location ||
                  "Lokasi belum diatur"}
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-[#1769e0] px-5 py-3 font-black text-white shadow-sm hover:bg-blue-700"
            >
              + Tambah Peserta
            </button>

          </div>
        </section>

        {/* MESSAGE */}

        {message && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}

        {showForm && (
          <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[.2em] text-blue-500">
                  {editingId
                    ? "EDIT PESERTA"
                    : "PESERTA BARU"}
                </p>

                <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                  {editingId
                    ? "Edit Data Peserta"
                    : "Tambah Peserta"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-bold text-slate-500"
              >
                Batal
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {/* NOMOR */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Nomor Peserta
                </span>

                <input
                  value={number}
                  onChange={(e) =>
                    setNumber(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 01"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-blue-500"
                />
              </label>

              {/* NAMA */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Nama Peserta
                </span>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Nama peserta / nama pasukan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-blue-500"
                />
              </label>

              {/* SEKOLAH */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Sekolah / Instansi
                </span>

                <input
                  value={school}
                  onChange={(e) =>
                    setSchool(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: SMPN 1 Jakarta"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-blue-500"
                />
              </label>

              {/* LEVEL */}

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Tingkat
                </span>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-500"
                >
                  <option value="">
                    Pilih tingkatan
                  </option>
                  {(event?.levels || [])
                    .filter((item) => item.status !== "INACTIVE")
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((item) => (
                      <option key={item.id} value={item.name || item.code}>
                        {item.name || item.code}
                      </option>
                    ))}
                </select>
              </label>

              {/* FOTO */}

              <div>
                <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Foto Peserta (Opsional)
                </span>

                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100">
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      void handlePhoto(
                        e.target.files?.[0]
                      )
                    }
                  />
                </label>

                {photo && (
                  <div className="mt-3 flex items-center gap-3">

                    <img
                      src={photo}
                      alt="Preview peserta"
                      className="h-20 w-20 rounded-xl border bg-white object-cover p-1"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setPhoto(null)
                      }
                      className="text-xs font-bold text-red-500"
                    >
                      Hapus foto
                    </button>

                  </div>
                )}
              </div>

            </div>

            <div className="mt-5 flex justify-end gap-2">

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveParticipant()
                }
                className="rounded-xl bg-[#1769e0] px-6 py-3 font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Peserta"}
              </button>

            </div>

          </section>
        )}

        {/* PENCARIAN */}

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Cari nomor, nama, sekolah, atau tingkatan..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />
        </section>

        {/* DAFTAR PESERTA */}

        <section className="rounded-2xl border bg-white shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">

            <div>
              <p className="text-xs font-black tracking-[.2em] text-blue-500">
                DATA PESERTA
              </p>

              <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                {filteredParticipants.length}{" "}
                peserta
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          {filteredParticipants.length ===
          0 ? (
            <div className="p-12 text-center">

              <p className="text-lg font-black text-slate-400">
                Belum ada peserta
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Tambahkan peserta untuk
                mulai menggunakan sistem
                penilaian.
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-5 rounded-xl bg-[#1769e0] px-5 py-3 font-bold text-white"
              >
                + Tambah Peserta
              </button>

            </div>
          ) : (
            <div className="divide-y">

              {filteredParticipants.map(
                (participant) => (
                  <div
                    key={
                      participant.id
                    }
                    className="flex flex-wrap items-center gap-4 p-4 hover:bg-slate-50"
                  >

                    {/* FOTO */}

                    {participant.photo ? (
                      <img
                        src={
                          participant.photo
                        }
                        alt={
                          participant.name
                        }
                        className="h-16 w-16 shrink-0 rounded-xl border bg-white object-cover"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#071a3d] text-xl font-black text-white">
                        {participant.number}
                      </div>
                    )}

                    {/* DATA */}

                    <div className="min-w-[220px] flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-lg bg-[#071a3d] px-2.5 py-1 text-xs font-black text-white">
                          #
                          {
                            participant.number
                          }
                        </span>

                        <h3 className="text-base font-black text-[#071a3d]">
                          {
                            participant.name
                          }
                        </h3>

                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          participant.school ||
                          "Sekolah belum diisi"
                        }
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                          Semua kategori penilaian
                        </span>

                        {participant.level && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                            {
                              participant.level
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ACTION */}

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            participant
                          )
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteParticipant(
                            participant
                          )
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-500"
                      >
                        Hapus
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}