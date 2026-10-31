"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CategoryData = {
  id: string;
  name: string;
  percentage: number;
  eventLevelId?: string | null;
  eventLevel?: {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  } | null;
  subCategories?: {
    id?: string;
    name?: string;
    percentage?: number;
    criteria?: unknown[];
  }[];
  criteria?: unknown[];
};

type EventData = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  totalPoints: number;
  status?: string;
  categories?: CategoryData[];
};

type EventSummary = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  totalPoints: number;
  status: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingEvent, setSwitchingEvent] = useState(false);
  const [levels, setLevels] = useState<
    {
      id: string;
      code: string;
      name: string;
      sortOrder: number;
      status?: string;
    }[]
  >([]);

  async function loadDashboard() {
    try {
      // Parallelize fetches for maximum speed
      const [activeRes, allRes] = await Promise.all([
        fetch("/api/event", { cache: "no-store" }),
        fetch("/api/event?all=true", { cache: "no-store" }),
      ]);

      const [activeData, allData] = await Promise.all([
        activeRes.json(),
        allRes.json(),
      ]);

      if (activeRes.ok && activeData?.id) {
        setEvent(activeData);

        // Fetch levels quickly
        fetch(`/api/event-levels?eventId=${encodeURIComponent(activeData.id)}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((lData) => {
            if (Array.isArray(lData?.levels)) {
              setLevels(lData.levels);
            }
          })
          .catch(() => setLevels([]));
      } else {
        setEvent(null);
        setLevels([]);
      }

      if (allRes.ok && Array.isArray(allData)) {
        setEvents(allData);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("DASHBOARD EVENT ERROR:", error);
      setEvent(null);
      setEvents([]);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function activateEvent(id: string) {
    if (!id || id === event?.id) return;

    // Optimistic UI feedback
    setSwitchingEvent(true);
    const targetSummary = events.find((item) => item.id === id);
    if (targetSummary) {
      setEvent((prev) => (prev ? { ...prev, id: targetSummary.id, name: targetSummary.name } : null));
    }

    try {
      const res = await fetch("/api/event", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          action: "activate",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gagal mengganti event aktif.");
      }

      await loadDashboard();
    } catch (error) {
      console.error("SWITCH EVENT ERROR:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Gagal mengganti event aktif."
      );
    } finally {
      setSwitchingEvent(false);
    }
  }

  async function logout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Gagal keluar dari sistem.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("ADMIN LOGOUT ERROR:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Gagal keluar dari sistem."
      );
    }
  }

  const categories =
    event?.categories || [];

  const subCategoryCount =
    categories.reduce(
      (total, category) =>
        total +
        (category.subCategories?.length || 0),
      0
    );

  const materialCount =
    categories.reduce(
      (total, category) =>
        total +
        (category.criteria?.length || 0) +
        (category.subCategories || []).reduce(
          (sum, subCategory) =>
            sum +
            (subCategory.criteria?.length || 0),
          0
        ),
      0
    );

  const activeLevels = levels
    .filter((level) => level.status !== "INACTIVE")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const levelGroups =
    activeLevels.length > 0
      ? activeLevels.map((level) => {
          const levelCategories = categories
            .filter(
              (category) =>
                (category.eventLevelId || null) === level.id ||
                category.eventLevel?.id === level.id
            )
            .sort((a, b) => {
              const aa = Number((a as any).sortOrder || 0);
              const bb = Number((b as any).sortOrder || 0);
              return aa - bb;
            });

          const weight = levelCategories.reduce(
            (sum, category) =>
              sum + Number(category.percentage || 0),
            0
          );

          return {
            id: level.id,
            name: level.name,
            categories: levelCategories,
            weight,
          };
        })
      : [];

  return (
    <main className="min-h-screen bg-[#f3f7fc] px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-xs font-black tracking-[0.22em] text-blue-600">
                  CETAS.SCORE • ADMIN
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a3d] md:text-4xl">
                  Dashboard Admin
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Pusat kendali event, konfigurasi penilaian,
                  juri, peserta, dan dokumen penilaian.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    router.push("/admin")
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#071a3d] transition hover:bg-slate-50"
                >
                  ← Portal Master Event
                </button>

                <button
                  onClick={() =>
                    router.push("/admin/score")
                  }
                  className="rounded-xl bg-[#071a3d] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Konfigurasi Event
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/score-changes")
                  }
                  className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-2.5 text-sm font-bold text-[#c2410c] transition hover:bg-[#ffedd5]"
                >
                  Permintaan Perubahan Nilai
                </button>

                <button
                  onClick={() =>
                    router.push("/admin/review")
                  }
                  className="rounded-xl bg-[#1769e0] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Review & Cetak
                </button>

                <button
                  onClick={() => void logout()}
                  className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {event ? (
            <div className="flex flex-col gap-3 bg-[#071a3d] px-6 py-4 text-white md:flex-row md:items-center md:justify-between md:px-8">
              <div className="flex items-center gap-3">
                {event.logo ? (
                  <img
                    src={event.logo}
                    alt={`Logo ${event.name}`}
                    className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1 shadow-sm border border-white/20"
                  />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[9px] font-black text-blue-200 border border-white/20">
                    LOGO
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                    Event Aktif
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {event.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-bold">
                <select
                  value={event.id}
                  onChange={(e) => void activateEvent(e.target.value)}
                  disabled={switchingEvent}
                  className="max-w-[280px] rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-white outline-none disabled:opacity-50"
                >
                  {events.length === 0 ? (
                    <option value={event.id} className="text-[#071a3d]">
                      {event.name}
                    </option>
                  ) : (
                    events.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="text-[#071a3d]"
                      >
                        {item.name}
                        {item.status === "ACTIVE" ? " • AKTIF" : ""}
                      </option>
                    ))
                  )}
                </select>

                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {formatDate(event.date)}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {event.location || "Lokasi belum diatur"}
                </span>

                <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-200">
                  {switchingEvent ? "MEMUAT..." : "AKTIF"}
                </span>
              </div>
            </div>
          ) : null}
        </header>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1769e0]" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Memuat dashboard...
            </p>
          </div>
        ) : !event ? (

          /* ===================================================
             EMPTY EVENT
          =================================================== */

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-2xl">
              +
            </div>

            <h2 className="mt-5 text-2xl font-black text-[#071a3d]">
              Belum ada event aktif
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Buat atau aktifkan event terlebih dahulu
              sebelum mengatur kategori, materi, juri,
              peserta, dan penilaian.
            </p>

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="mt-6 rounded-xl bg-[#1769e0] px-6 py-3 text-sm font-black text-white transition hover:opacity-90"
            >
              Buka Portal Master Event
            </button>
          </div>

        ) : (

          <>
            {/* =================================================
                EVENT SWITCHER
            ================================================= */}
            <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Manajemen Event
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                    Pilih Event
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Event lama tetap tersimpan. Ganti event aktif kapan saja.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={event.id}
                    onChange={(e) => void activateEvent(e.target.value)}
                    disabled={switchingEvent}
                    className="min-w-[260px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#071a3d] outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {events.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.status === "ACTIVE" ? " • AKTIF" : ""}
                      </option>
                    ))}
                  </select>


                </div>
              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                label="Kategori"
                value={categories.length}
                description="Kategori penilaian"
                icon="K"
              />

              <StatCard
                label="Subkategori"
                value={subCategoryCount}
                description="Struktur penilaian"
                icon="S"
              />

              <StatCard
                label="Materi"
                value={materialCount}
                description="Materi penilaian"
                icon="M"
              />

              <StatCard
                label="Total Nilai"
                value={event.totalPoints}
                description="Alokasi nilai event"
                icon="N"
                number
              />
            </section>

            {/* =================================================
                QUICK ACCESS
            ================================================= */}

            <section className="mt-5">
              <div className="mb-3">
                <h2 className="text-lg font-black text-[#071a3d]">
                  Menu Utama
                </h2>

                <p className="text-sm text-slate-500">
                  Kelola setiap bagian event dari satu tempat.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                <MenuCard
                  title="Event"
                  description="Informasi & pengaturan event"
                  icon="E"
                  onClick={() =>
                    router.push("/admin/score")
                  }
                  primary
                />

                <MenuCard
                  title="Kategori & Materi"
                  description="Atur kategori, subkategori & materi"
                  icon="K"
                  onClick={() =>
                    router.push("/admin/score")
                  }
                />

                <MenuCard
                  title="Juri"
                  description="Kelola akun & penugasan juri"
                  icon="J"
                  onClick={() =>
                    router.push("/admin/judges")
                  }
                />

                <MenuCard
                  title="Peserta"
                  description="Kelola data peserta lomba"
                  icon="P"
                  onClick={() =>
                    router.push("/admin/participants")
                  }
                />

                <MenuCard
                  title="Review & Cetak"
                  description="Review lembar penilaian"
                  icon="R"
                  onClick={() =>
                    router.push("/admin/review")
                  }
                  primary
                />

              </div>
            </section>

            {/* =================================================
                LIVE COMPETITION OPERATIONS
            ================================================= */}
            <section className="mt-5">
              <div className="mb-3">
                <h2 className="text-lg font-black text-[#071a3d]">
                  Operasional Hari Lomba (Live)
                </h2>
                <p className="text-sm text-slate-500">
                  Akses cepat rekapitulasi, penentuan juara, timer penampilan, dan layar publik.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MenuCard
                  title="Rekap Nilai"
                  description="Rekapitulasi live per tingkatan & juri"
                  icon="📊"
                  onClick={() => router.push("/rekap")}
                />

                <MenuCard
                  title="Penentuan Juara"
                  description="Podium juara utama/kategori & cetak F4"
                  icon="🏆"
                  onClick={() => router.push("/penentuan-juara")}
                  primary
                />

                <MenuCard
                  title="Timer Penampilan"
                  description="Stopwatch pencatat waktu peserta lomba"
                  icon="⏱️"
                  onClick={() => router.push("/timer")}
                />

                <MenuCard
                  title="Display Layar"
                  description="Tampilan panggung & leaderboard publik"
                  icon="🖥️"
                  onClick={() => router.push("/display")}
                />
              </div>
            </section>

            {/* =================================================
                EVENT INFO
            ================================================= */}

            <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Event Aktif
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#071a3d]">
                    {event.name}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    router.push("/admin/score")
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#071a3d] transition hover:bg-slate-50"
                >
                  Edit Event
                </button>

              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-3">

                <Info
                  label="Tanggal"
                  value={formatDate(event.date)}
                />

                <Info
                  label="Lokasi"
                  value={
                    event.location ||
                    "-"
                  }
                />

                <Info
                  label="Total Alokasi Nilai"
                  value={`${event.totalPoints.toLocaleString(
                    "id-ID"
                  )} poin`}
                />

              </div>
            </section>

            {/* =================================================
                STRUCTURE
            ================================================= */}

            <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Struktur Penilaian
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#071a3d]">
                    Kategori Event
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {categories.length} kategori •{" "}
                    {subCategoryCount} subkategori •{" "}
                    {materialCount} materi
                  </p>
                </div>

                <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                  {activeLevels.length} tingkatan aktif
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="font-bold text-slate-500">
                    Belum ada kategori.
                  </p>

                  <button
                    onClick={() => router.push("/admin/score")}
                    className="mt-3 text-sm font-black text-blue-600 hover:underline"
                  >
                    Atur kategori →
                  </button>
                </div>
              ) : activeLevels.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
                  <p className="font-bold text-amber-700">
                    Belum ada tingkatan aktif.
                  </p>

                  <button
                    onClick={() => router.push("/admin/score")}
                    className="mt-3 text-sm font-black text-blue-600 hover:underline"
                  >
                    Atur tingkatan →
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {levelGroups.map((group) => (
                    <div
                      key={group.id}
                      className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50"
                    >
                      <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                            Tingkatan
                          </p>

                          <h3 className="text-lg font-black text-[#071a3d]">
                            {group.name}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${
                            Math.abs(group.weight - 100) < 0.0001
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          Bobot {group.weight}% / 100%
                        </span>
                      </div>

                      {group.categories.length === 0 ? (
                        <div className="bg-white px-4 py-5 text-sm text-slate-400">
                          Belum ada kategori untuk tingkatan ini.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 bg-white">
                          {group.categories.map((category, index) => {
                            const categoryMaterialCount =
                              (category.criteria?.length || 0) +
                              (category.subCategories || []).reduce(
                                (sum, subCategory) =>
                                  sum +
                                  (subCategory.criteria?.length || 0),
                                0
                              );

                            return (
                              <div
                                key={category.id}
                                className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="flex min-w-0 items-center gap-4">
                                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#071a3d] text-sm font-black text-white">
                                    {index + 1}
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="truncate text-base font-black text-[#071a3d]">
                                      {category.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                      {category.subCategories?.length || 0}{" "}
                                      subkategori • {categoryMaterialCount}{" "}
                                      materi
                                    </p>
                                  </div>
                                </div>

                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                  {category.percentage}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =================================================
    REVIEW CTA
================================================= */}

            <section className="mt-5 overflow-hidden rounded-3xl bg-[#071a3d] p-6 text-white shadow-sm md:p-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                    Siap untuk tahap berikutnya?
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Review & Cetak Lembar Penilaian
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    Pastikan struktur penilaian sudah
                    sesuai sebelum lembar juri dicetak.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push("/admin/review")
                  }
                  className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#071a3d] transition hover:bg-slate-100"
                >
                  Buka Review →
                </button>

              </div>

            </section>

          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  number = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  number?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-black text-[#071a3d]">
            {number
              ? Number(value).toLocaleString(
                  "id-ID"
                )
              : value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MENU CARD
========================================================= */

function MenuCard({
  title,
  description,
  icon,
  onClick,
  primary = false,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        primary
          ? "border-[#071a3d] bg-[#071a3d] text-white"
          : "border-slate-200 bg-white text-[#071a3d]"
      }`}
    >
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-black ${
          primary
            ? "bg-white/10 text-white"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mt-4 text-sm font-black ${
          primary
            ? "text-white"
            : "text-[#071a3d]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-xs leading-5 ${
          primary
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>

      <div
        className={`mt-4 text-xs font-black ${
          primary
            ? "text-blue-300"
            : "text-blue-600"
        }`}
      >
        Buka →
      </div>
    </button>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-black text-[#071a3d]">
        {value}
      </p>

    </div>
  );
}