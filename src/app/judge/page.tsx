"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SubCategory = {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
};

type EventLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  status?: string;
};

type Category = {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  eventId: string;

  /*
   * Tingkatan tempat kategori berada.
   *
   * Contoh:
   * SMP/MTS
   * SMA/SMK/MA
   */
  eventLevelId?: string | null;

  eventLevel?: EventLevel | null;

  materialCount: number;
  subCategories: SubCategory[];
};

type EventData = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  banner?: string | null;
  totalPoints: number;
};

type UserData = {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
};

type JudgeData = {
  user: UserData;
  event: EventData | null;
  categories: Category[];
};

type LevelGroup = {
  level: EventLevel | null;
  categories: Category[];
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

function formatPercentage(value: number) {
  const number = Number(value || 0);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(2).replace(/\.00$/, "");
}

export default function JudgePage() {
  const router = useRouter();

  const [data, setData] = useState<JudgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  useEffect(() => {
    loadJudge();
  }, []);

  async function loadJudge() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/judge/me", {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || "Gagal mengambil data juri."
        );
      }

      setData(result);
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

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  /*
   * =========================================================
   * GROUP KATEGORI BERDASARKAN TINGKATAN
   *
   * Hasil:
   *
   * SMP/MTS
   *   - PBB
   *   - KOMANDAN
   *
   * SMA/SMK/MA
   *   - PBB
   *   - KOMANDAN
   *
   * Tanpa Tingkatan
   *   - kategori lama yang belum mempunyai eventLevelId
   * =========================================================
   */

  const levelGroups = useMemo<LevelGroup[]>(() => {
    if (!data?.categories) {
      return [];
    }

    const groups = new Map<
      string,
      {
        level: EventLevel | null;
        categories: Category[];
      }
    >();

    for (const category of data.categories) {
      const level = category.eventLevel || null;

      const key =
        category.eventLevelId ||
        level?.id ||
        "__NO_LEVEL__";

      if (!groups.has(key)) {
        groups.set(key, {
          level,
          categories: [],
        });
      }

      groups.get(key)!.categories.push(category);
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        categories: [...group.categories].sort(
          (a, b) => a.sortOrder - b.sortOrder
        ),
      }))
      .sort((a, b) => {
        if (!a.level && !b.level) {
          return 0;
        }

        if (!a.level) {
          return 1;
        }

        if (!b.level) {
          return -1;
        }

        return a.level.sortOrder - b.level.sortOrder;
      });
  }, [data]);

  /*
   * =========================================================
   * TOTAL KATEGORI
   * =========================================================
   */

  const totalAssignedCategories =
    data?.categories?.length || 0;

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 md:p-8">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1769e0]" />

            <p className="font-black text-[#071a3d]">
              Memuat halaman juri...
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Memeriksa penugasan kategori.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 md:p-8">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-2xl font-black text-red-500">
              !
            </div>

            <h1 className="mt-4 text-xl font-black text-[#071a3d]">
              Gagal Memuat Data
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Data juri tidak tersedia."}
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={loadJudge}
                className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Coba Lagi
              </button>

              <button
                onClick={logout}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * TIDAK ADA EVENT AKTIF
   * =========================================================
   */

  if (!data.event) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[.22em] text-blue-600">
                  CETAS.SCORE • JURI
                </p>

                <h1 className="mt-2 text-2xl font-black text-[#071a3d]">
                  Halo, {data.user.name}
                </h1>
              </div>

              <button
                onClick={logout}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-2xl font-black text-amber-600">
              !
            </div>

            <h2 className="mt-4 text-xl font-black text-[#071a3d]">
              Belum Ada Event Aktif
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Belum ada event yang sedang aktif.
              Silakan tunggu Admin mengaktifkan event.
            </p>
          </section>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * HALAMAN UTAMA
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-[#071a3d] p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>
                <p className="text-xs font-black tracking-[.22em] text-blue-300">
                  CETAS.SCORE • JURI
                </p>

                <h1 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Halo, {data.user.name}
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  @{data.user.username}
                </p>
              </div>

              <button
                onClick={logout}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="p-6">

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Event
                </p>

                <p className="mt-1 text-lg font-black text-[#071a3d]">
                  {data.event.name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Lokasi
                </p>

                <p className="mt-1 font-bold text-[#071a3d]">
                  {data.event.location || "-"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Tanggal
                </p>

                <p className="mt-1 font-bold text-[#071a3d]">
                  {formatDate(data.event.date)}
                </p>
              </div>

            </div>

          </div>
        </header>

        {/* =====================================================
            PENUGASAN
        ====================================================== */}

        <section className="mt-6">

          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">
              Penugasan Anda
            </p>

            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">

              <div>
                <h2 className="text-2xl font-black text-[#071a3d]">
                  Pilih Tingkatan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Pilih tingkatan terlebih dahulu untuk melihat
                  kategori yang Anda nilai.
                </p>
              </div>

              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
                {totalAssignedCategories} kategori ditugaskan
              </div>

            </div>
          </div>

          {/* ===================================================
              BELUM ADA PENUGASAN
          ==================================================== */}

          {!data.categories.length ? (

            <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-xl font-black text-amber-600">
                !
              </div>

              <h3 className="mt-4 font-black text-[#071a3d]">
                Belum Ada Penugasan
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Anda belum ditugaskan ke kategori apa pun
                pada event ini. Silakan hubungi Admin.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {/* =================================================
                  LEVEL CARD
              ================================================= */}

              {levelGroups.map((group, groupIndex) => {

                const level = group.level;

                const levelName =
                  level?.name ||
                  "Tanpa Tingkatan";

                const levelCode =
                  level?.code ||
                  "LAINNYA";

                return (
                  <section
                    key={
                      level?.id ||
                      `no-level-${groupIndex}`
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* =========================================
                        LEVEL HEADER
                    ========================================== */}

                    <div className="bg-[#071a3d] p-5 md:p-6">

                      <div className="flex flex-wrap items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black text-white ring-1 ring-white/10">
                            {levelCode
                              .slice(0, 3)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-300">
                              Tingkatan
                            </p>

                            <h3 className="mt-1 text-xl font-black text-white md:text-2xl">
                              {levelName}
                            </h3>

                          </div>

                        </div>

                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/80 ring-1 ring-white/10">
                          {group.categories.length}{" "}
                          {group.categories.length === 1
                            ? "Kategori"
                            : "Kategori"}
                        </div>

                      </div>

                    </div>

                    {/* =========================================
                        CATEGORY LIST
                    ========================================== */}

                    <div className="p-4 md:p-5">

                      <div className="grid gap-4 md:grid-cols-2">

                        {group.categories.map(
                          (category, categoryIndex) => (

                            <article
                              key={category.id}
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >

                              {/* CATEGORY HEADER */}

                              <div className="border-b border-slate-100 p-5">

                                <div className="flex items-start justify-between gap-4">

                                  <div className="flex items-start gap-3">

                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                                      {categoryIndex + 1}
                                    </div>

                                    <div>

                                      <h4 className="text-lg font-black text-[#071a3d]">
                                        {category.name}
                                      </h4>

                                      <p className="mt-1 text-xs font-bold text-slate-400">
                                        Bobot{" "}
                                        {formatPercentage(
                                          category.percentage
                                        )}
                                        %
                                      </p>

                                    </div>

                                  </div>

                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                                    DITUGASKAN
                                  </span>

                                </div>

                              </div>

                              {/* CATEGORY BODY */}

                              <div className="p-5">

                                <div className="grid grid-cols-2 gap-3">

                                  <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      Materi
                                    </p>

                                    <p className="mt-1 text-lg font-black text-[#071a3d]">
                                      {category.materialCount}
                                    </p>

                                  </div>

                                  <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      Subkategori
                                    </p>

                                    <p className="mt-1 text-lg font-black text-[#071a3d]">
                                      {category.subCategories.length}
                                    </p>

                                  </div>

                                </div>

                                {/* SUBCATEGORY */}

                                {category.subCategories.length >
                                  0 && (

                                  <div className="mt-4">

                                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      Struktur Penilaian
                                    </p>

                                    <div className="flex flex-wrap gap-2">

                                      {[
                                        ...category.subCategories,
                                      ]
                                        .sort(
                                          (a, b) =>
                                            a.sortOrder -
                                            b.sortOrder
                                        )
                                        .map(
                                          (
                                            subCategory
                                          ) => (
                                            <span
                                              key={
                                                subCategory.id
                                              }
                                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
                                            >
                                              {
                                                subCategory.name
                                              }
                                            </span>
                                          )
                                        )}

                                    </div>

                                  </div>

                                )}

                                {/* INFO */}

                                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                                    Sistem Penilaian
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Kategori ini berada pada
                                    tingkatan{" "}
                                    <b>
                                      {levelName}
                                    </b>
                                    .
                                  </p>

                                </div>

                                {/* BUTTON */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    router.push(
                                      `/judge/category/${category.id}`
                                    );
                                  }}
                                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#1769e0] px-4 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[.99]"
                                >
                                  Mulai Penilaian
                                  <span className="ml-2">
                                    →
                                  </span>
                                </button>

                              </div>

                            </article>

                          )
                        )}

                      </div>

                    </div>

                  </section>
                );
              })}

            </div>
          )}

        </section>

        {/* =====================================================
            INFO KEAMANAN
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-3">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-black text-blue-600">
              i
            </div>

            <div>

              <p className="text-sm font-black text-[#071a3d]">
                Akses penilaian terbatas
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Daftar kategori di atas berasal dari
                penugasan Admin. Kategori lain pada event
                ini tidak diberikan kepada akun Anda.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}