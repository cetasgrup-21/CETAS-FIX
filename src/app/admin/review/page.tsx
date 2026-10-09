"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ScoreOption = {
  id: string;
  label: string;
  score: number;
  sortOrder: number;
};

type Criterion = {
  id: string;
  name: string;
  sortOrder: number;
  options?: ScoreOption[];
  difficulty?: string | null;
  interval?: number | null;
};

type SubCategory = {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  criteria: Criterion[];
};

type CategoryJudgeLink = {
  judgeId: string;
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
  eventLevelId?: string | null;
  eventLevel?: EventLevel | null;
  sortOrder: number;
  subCategories: SubCategory[];
  criteria: Criterion[];
  judgeLinks?: CategoryJudgeLink[];
};

type EventData = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  totalPoints: number;
  categories: Category[];
};

type SheetConfig = {
  id: string;
  levelId?: string | null;
  categoryIds: string[];
};

const STORAGE_KEY = "cetas.score.review.sheets.v2";

/* =========================================================
   HELPER
========================================================= */

function normalize(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ");
}

/*
 * Nilai pada lembar cetak HARUS selalu bulat.
 */
function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(value));
}

/* =========================================================
   DEFAULT PEMBAGIAN LEMBAR
   PBB + DANTON otomatis digabung.
========================================================= */

function defaultSheets(categories: Category[]): SheetConfig[] {
  const groups = new Map<string, Category[]>();

  for (const category of categories) {
    const levelKey = category.eventLevelId || "__NONE__";
    const group = groups.get(levelKey) || [];
    group.push(category);
    groups.set(levelKey, group);
  }

  const sheets: SheetConfig[] = [];
  let sheetIndex = 1;

  const orderedGroups = Array.from(groups.entries()).sort((a, b) => {
    const aOrder = a[1][0]?.eventLevel?.sortOrder ?? 999;
    const bOrder = b[1][0]?.eventLevel?.sortOrder ?? 999;
    return aOrder - bOrder;
  });

  for (const [, levelCategories] of orderedGroups) {
    const sorted = levelCategories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const pbb = sorted.find((c) => normalize(c.name) === "PBB");
    const danton = sorted.find((c) => normalize(c.name) === "DANTON");
    const used = new Set<string>();
    const levelId = sorted[0]?.eventLevelId || null;

    if (pbb && danton) {
      sheets.push({
        id: `sheet-${sheetIndex++}`,
        levelId,
        categoryIds: [pbb.id, danton.id],
      });
      used.add(pbb.id);
      used.add(danton.id);
    }

    for (const category of sorted) {
      if (used.has(category.id)) continue;

      sheets.push({
        id: `sheet-${sheetIndex++}`,
        levelId: category.eventLevelId || null,
        categoryIds: [category.id],
      });
    }
  }

  return sheets.length
    ? sheets
    : [
        {
          id: "sheet-1",
          levelId: categories[0]?.eventLevelId || null,
          categoryIds: categories.map((c) => c.id),
        },
      ];
}

/* =========================================================
   VALIDASI SHEET
========================================================= */

function normalizeSheets(
  raw: SheetConfig[],
  categories: Category[]
): SheetConfig[] {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category])
  );

  const validIds = new Set(categories.map((c) => c.id));
  const seen = new Set<string>();
  const cleaned: SheetConfig[] = [];

  for (const sheet of raw) {
    const categoryIds = sheet.categoryIds.filter(
      (id) => validIds.has(id) && !seen.has(id)
    );

    categoryIds.forEach((id) => seen.add(id));

    if (categoryIds.length) {
      const firstCategory = categoryMap.get(categoryIds[0]);
      const levelId =
        sheet.levelId ?? firstCategory?.eventLevelId ?? null;

      // Satu sheet tidak boleh memuat kategori lintas tingkatan.
      const sameLevelIds = categoryIds.filter((id) => {
        const category = categoryMap.get(id);
        return (category?.eventLevelId || null) === levelId;
      });

      if (sameLevelIds.length) {
        cleaned.push({
          id: sheet.id || `sheet-${cleaned.length + 1}`,
          levelId,
          categoryIds: sameLevelIds,
        });
      }
    }
  }

  for (const category of categories) {
    if (!seen.has(category.id)) {
      cleaned.push({
        id: `sheet-${cleaned.length + 1}`,
        levelId: category.eventLevelId || null,
        categoryIds: [category.id],
      });
      seen.add(category.id);
    }
  }

  return cleaned;
}

/* =========================================================
   NILAI REVIEW — SUMBER KEBENARAN = ScoreOption DATABASE
========================================================= */

function getReviewOptions(criterion: Criterion): ScoreOption[] {
  return (criterion.options || [])
    .map((option) => ({
      ...option,
      score: Math.floor(Number(option.score || 0)),
    }))
    // KHUSUS TAMPILAN REVIEW:
    // nilai 0 tidak ditampilkan. Logic/perhitungan nilai tidak diubah.
    .filter((option) => option.score > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* =========================================================
   SCORE TABLE
========================================================= */

function ScoreTable({
  event,
  category,
  subCategory,
  criteria,
}: {
  event: EventData;
  category: Category;
  subCategory: SubCategory | null;
  criteria: Criterion[];
}) {
  const reviewOptions = criteria.map((criterion) => ({
    criterion,
    options: getReviewOptions(criterion),
  }));

  const maxOptions = Math.max(
    0,
    ...reviewOptions.map((item) => item.options.length)
  );

  /*
   * FORMAT HEADER NILAI — KHUSUS TAMPILAN REVIEW
   *
   * CETAS menggunakan tepat 8 kotak nilai pada setiap materi:
   * P = Perlu Perbaikan  → 1 kotak
   * C = Cukup            → 2 kotak
   * B = Baik             → 2 kotak
   * I = Istimewa         → 3 kotak
   *
   * Urutan kotak:
   * P, C, C, B, B, I, I, I
   *
   * Nilai 0 hanya dikeluarkan dari tampilan melalui getReviewOptions().
   * Logic/perhitungan nilai tidak disentuh.
   */
  const headerOptions = reviewOptions[0]?.options || [];

  function getDisplayGroups(count: number) {
    // Sistem CETAS selalu 8 pilihan.
    // Jika data lama belum ter-regenerate dan jumlah bukan 8,
    // tampilkan grouping yang aman tanpa mengubah nilai database.
    if (count === 8) {
      return [
        { label: "P", count: 1 },
        { label: "C", count: 2 },
        { label: "B", count: 2 },
        { label: "I", count: 3 },
      ];
    }

    return Array.from(
      { length: count },
      (_, index) => ({
        label: index === 0
          ? "P"
          : index < 3
            ? "C"
            : index < 5
              ? "B"
              : "I",
        count: 1,
      })
    );
  }

  const visibleGroups = getDisplayGroups(headerOptions.length);

  if (!criteria.length || maxOptions === 0) {
    return (
      <div className="empty-box">
        Belum ada nilai yang dapat ditampilkan.
      </div>
    );
  }

  return (
    <table className="score-table">
      <colgroup>
        <col className="col-no" />
        <col className="col-material" />
        {Array.from(
          { length: maxOptions },
          (_, index) => (
            <col
              className="col-score"
              key={`score-col-${index}`}
            />
          )
        )}
      </colgroup>

      <thead>
        <tr>
          <th
            className="no-col"
            rowSpan={2}
          >
            NO.
          </th>

          <th
            className="material-header"
            rowSpan={2}
          >
            MATERI PENILAIAN
          </th>

          <th colSpan={maxOptions}>
            NILAI
          </th>
        </tr>

        <tr className="classification-row">
          {visibleGroups.map((group) => (
            <th
              key={group.label}
              colSpan={group.count}
            >
              {group.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {reviewOptions.map(
          ({ criterion, options }, index) => (
            <tr key={criterion.id}>
              <td className="center">
                {index + 1}
              </td>

              <td className="material-name">
                {criterion.name}
              </td>

              {options.map((option) => (
                <td
                  className="score-option"
                  key={
                    option.id ||
                    `${criterion.id}-${option.sortOrder}`
                  }
                >
                  {formatNumber(option.score)}
                </td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

/* =========================================================
   CATEGORY PRINT BLOCK
========================================================= */

function CategoryPrintBlock({
  event,
  category,
}: {
  event: EventData;
  category: Category;
}) {
  const subCategories =
    category.subCategories || [];

  const directCriteria =
    category.criteria || [];

  return (
    <div className="category-block">
      <div className="category-heading">
        {category.name}
      </div>

      {subCategories.length > 0 ? (
        subCategories.map(
          (subCategory) => (
            <div
              className="sub-block"
              key={subCategory.id}
            >
              <div className="sub-heading">
                {subCategory.name}
              </div>

              <ScoreTable
                event={event}
                category={category}
                subCategory={
                  subCategory
                }
                criteria={
                  subCategory.criteria ||
                  []
                }
              />
            </div>
          )
        )
      ) : directCriteria.length > 0 ? (
        <ScoreTable
          event={event}
          category={category}
          subCategory={null}
          criteria={directCriteria}
        />
      ) : (
        <div className="empty-box">
          Belum ada materi pada
          kategori ini.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NAMA TINGKATAN
========================================================= */

function getLevelName(category?: Category | null) {
  if (!category) return "";
  if (category.eventLevel?.name) return category.eventLevel.name;

  const code = String(category.eventLevel?.code || "").toUpperCase();
  if (code === "SD_MI") return "SD/MI";
  if (code === "SMP_MTS") return "SMP/MTS";
  if (code === "SMA_SMK_MA") return "SMA/SMK/MA";
  if (code === "PURNA_CLUB_UMUM") return "PURNA/CLUB/UMUM";

  return "";
}

/* =========================================================
   PRINT SHEET
========================================================= */

function PrintSheet({
  event,
  categories,
}: {
  event: EventData;
  categories: Category[];
  sheetNumber: number;
  sheetCount: number;
}) {
  const judgeCount = Math.max(
    1,
    ...categories.map((category) =>
      category.judgeLinks?.length || 0
    )
  );

  const categoryTitle = categories
    .map((category) => category.name)
    .join(" + ");

  return (
    <section className="review-sheet">

      {/* WATERMARK CETAS — KHUSUS TAMPILAN, TIDAK MENYENTUH LOGIC NILAI */}
      <div
        className="sheet-watermark"
        aria-hidden="true"
      >
        <img
          src="/cetas-score-logo.png"
          alt=""
        />
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sheet-top">
        <div className="logo-left">
          <img
            src="/cetas-score-logo.png"
            alt="CETAS.Score"
          />
        </div>

        <div className="event-name">
          <div className="event-kicker">
            FORMAT NILAI {categoryTitle}
          </div>

          <h1>{event.name}</h1>

          {categories[0] ? (
            <div className="event-level">
              TINGKATAN: {getLevelName(categories[0]) || "-"}
            </div>
          ) : null}

          {event.location ? (
            <div className="event-location">
              {event.location}
            </div>
          ) : null}
        </div>

        <div className="logo-right">
          {event.logo ? (
            <img
              src={event.logo}
              alt="Logo event"
            />
          ) : (
            <div className="logo-placeholder">
              LOGO EVENT
            </div>
          )}
        </div>

        <div className="identity-grid">
          <div className="label">Nama Sekolah</div>
          <div className="blank identity-wide" />

          <div className="label">No. Urut</div>
          <div className="blank identity-wide" />

          <div className="label">Juri</div>
          <div className="judge-numbers identity-wide">
            {Array.from(
              { length: judgeCount },
              (_, index) => (
                <span
                  key={`judge-${index}`}
                  className="judge-number"
                >
                  {index > 0 ? " / " : ""}
                  {index + 1}
                </span>
              )
            )}
          </div>

          <div className="label">Waktu Tampil</div>
          <div className="blank identity-wide" />
        </div>
      </header>
      
      {/* =================================================
          KATEGORI
      ================================================= */}

      <div className="category-list">
        {categories.map(
          (category) => (
            <CategoryPrintBlock
              key={category.id}
              event={event}
              category={category}
            />
          )
        )}
      </div>

      {/* =================================================
          CATATAN + TTD
          TANPA KOTAK
      ================================================= */}

      <div className="bottom-area">

        {/* CATATAN JURI */}
        <div className="notes">
          <b>CATATAN JURI</b>

          <div className="notes-space">
            <div className="note-line" />
            <div className="note-line" />
          </div>
        </div>

        {/* TTD JURI */}
        <div className="signature">
          <b>TTD JURI</b>

          <div className="signature-space" />

          <div className="signature-line" />
        </div>

      </div>


    </section>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminReviewPage() {
  const router = useRouter();

  const [event, setEvent] =
    useState<EventData | null>(null);

  const [sheets, setSheets] =
    useState<SheetConfig[]>([]);

  const [
    showSheetSettings,
    setShowSheetSettings,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD EVENT + REFRESH SCORE OPTIONS

     Review harus selalu membaca konfigurasi terbaru dari database.
     Sebelum mengambil /api/event, kita minta server menghitung ulang
     ScoreOption untuk seluruh kategori event aktif. Jadi perubahan dari
     halaman Admin (total poin, bobot kategori, materi, interval, atau
     jumlah juri) langsung tercermin di Review.

     Refresh juga dijalankan ketika tab kembali aktif/focus, sehingga
     Review yang masih terbuka ikut memperbarui data tanpa F5.
  ===================================================== */

  useEffect(() => {
    let active = true;
    let refreshing = false;

    async function load(initial = false) {
      if (refreshing) return;
      refreshing = true;

      if (initial) {
        setLoading(true);
      }

      try {
        const refreshResponse = await fetch(
          "/api/admin/review/refresh",
          {
            method: "POST",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        const refreshResult =
          await refreshResponse.json().catch(() => null);

        if (!refreshResponse.ok) {
          throw new Error(
            refreshResult?.error ||
              "Gagal memperbarui konfigurasi nilai."
          );
        }

        const res = await fetch(
          `/api/event?_=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data?.id) {
          throw new Error(
            data?.error ||
              "Event belum tersedia."
          );
        }

        if (!active) return;

        // Ambil nama tingkatan agar ID internal tidak pernah tampil di UI.
        let levels: EventLevel[] = [];
        try {
          const levelResponse = await fetch(
            `/api/event-levels?eventId=${encodeURIComponent(data.id)}&_=${Date.now()}`,
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          const levelJson = await levelResponse.json().catch(() => null);
          const rawLevels = Array.isArray(levelJson)
            ? levelJson
            : levelJson?.levels ||
              levelJson?.eventLevels ||
              levelJson?.data ||
              [];

          if (Array.isArray(rawLevels)) {
            levels = rawLevels.map((level: any) => ({
              id: String(level.id),
              code: String(level.code || ""),
              name: String(level.name || ""),
              sortOrder: Number(level.sortOrder || 0),
              status: level.status,
            }));
          }
        } catch {
          levels = [];
        }

        const levelMap = new Map(
          levels.map((level) => [level.id, level])
        );

        const normalizedCategories = (data.categories || []).map(
          (category: any): Category => {
            const eventLevelId =
              category.eventLevelId ??
              category.eventLevel?.id ??
              null;

            return {
              ...category,
              eventLevelId,
              eventLevel:
                category.eventLevel ||
                (eventLevelId
                  ? levelMap.get(eventLevelId) || null
                  : null),
            };
          }
        );

        const normalizedEvent = {
          ...data,
          categories: normalizedCategories,
        };

        setEvent(normalizedEvent);

        let saved: SheetConfig[] | null = null;

        try {
          const raw = window.localStorage.getItem(
            STORAGE_KEY
          );

          if (raw) {
            saved = JSON.parse(raw);
          }
        } catch {
          saved = null;
        }

        setSheets(
          saved?.length
            ? normalizeSheets(
                saved,
                normalizedCategories
              )
            : defaultSheets(
                normalizedCategories
              )
        );

        setError("");
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Gagal memuat review."
          );
        }
      } finally {
        refreshing = false;

        if (active && initial) {
          setLoading(false);
        }
      }
    }

    // Pertama kali halaman dibuka.
    void load(true);

    // Jika Admin mengubah konfigurasi di tab lain lalu kembali ke Review,
    // browser akan memicu focus/visibilitychange dan data disegarkan lagi.
    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        void load(false);
      }
    };

    window.addEventListener("focus", handleRefresh);
    document.addEventListener(
      "visibilitychange",
      handleRefresh
    );

    return () => {
      active = false;
      window.removeEventListener(
        "focus",
        handleRefresh
      );
      document.removeEventListener(
        "visibilitychange",
        handleRefresh
      );
    };
  }, []);

  /* =====================================================
     SAVE SHEET CONFIG
  ===================================================== */

  useEffect(() => {
    if (
      !event ||
      !sheets.length
    ) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sheets)
    );
  }, [event, sheets]);

  /* =====================================================
     AFTER PRINT -> DASHBOARD
  ===================================================== */

  useEffect(() => {
    const handleAfterPrint =
      () => {
        router.replace(
          "/admin/dashboard"
        );
      };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () =>
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
  }, [router]);

  /* =====================================================
     CATEGORY MAP
  ===================================================== */

  const categoryMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          Category
        >();

      (
        event?.categories || []
      ).forEach((category) => {
        map.set(
          category.id,
          category
        );
      });

      return map;
    }, [event]);

  /* =====================================================
     PINDAH CATEGORY KE LEMBAR
  ===================================================== */

  function updateAssignment(
    categoryId: string,
    targetSheetIndex: number
  ) {
    const category = categoryMap.get(categoryId);
    const categoryLevelId = category?.eventLevelId || null;

    setSheets((current) => {
      const target = current[targetSheetIndex];
      if (!target) return current;

      const targetLevelId = target.levelId || null;
      if (targetLevelId && targetLevelId !== categoryLevelId) {
        return current;
      }

      const next = current.map((sheet) => ({
        ...sheet,
        categoryIds: sheet.categoryIds.filter(
          (id) => id !== categoryId
        ),
      }));

      const cleaned = next.filter(
        (sheet) => sheet.categoryIds.length || sheet.levelId
      );

      const targetAfterRemoval = cleaned.findIndex(
        (sheet) => sheet.id === target.id
      );

      if (targetAfterRemoval < 0) return current;

      cleaned[targetAfterRemoval].levelId = categoryLevelId;
      cleaned[targetAfterRemoval].categoryIds.push(categoryId);

      return cleaned.map((sheet, index) => ({
        ...sheet,
        id: `sheet-${index + 1}`,
      }));
    });
  }

  /* =====================================================
     TAMBAH LEMBAR
  ===================================================== */

  function addSheet() {
    setSheets(
      (current) => [
        ...current,
        {
          id: `sheet-${
            current.length + 1
          }`,
          categoryIds: [],
        },
      ]
    );
  }

  /* =====================================================
     HAPUS LEMBAR
  ===================================================== */

  function removeSheet(
    index: number
  ) {
    if (sheets.length <= 1) {
      return;
    }

    setSheets(
      (current) => {
        const target =
          current[index];

        const fallbackIndex =
          index === 0 ? 1 : 0;

        const next =
          current.filter(
            (_, i) =>
              i !== index
          );

        if (
          target?.categoryIds
            .length
        ) {
          next[
            fallbackIndex
          ].categoryIds.push(
            ...target.categoryIds
          );
        }

        return next.map(
          (
            sheet,
            i
          ) => ({
            ...sheet,
            id: `sheet-${
              i + 1
            }`,
          })
        );
      }
    );
  }

  /* =====================================================
     SHEET CATEGORY
  ===================================================== */

  const sheetCategories =
    sheets.map(
      (sheet) =>
        sheet.categoryIds
          .map((id) =>
            categoryMap.get(id)
          )
          .filter(
            Boolean
          ) as Category[]
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 text-center">
          Memuat review
          CETAS.Score...
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR / EVENT BELUM ADA
  ===================================================== */

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center">

          <h1 className="text-xl font-black">
            Review belum tersedia
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Event belum dibuat."}
          </p>

          <button
            onClick={() =>
              router.replace(
                "/admin/dashboard"
              )
            }
            className="mt-5 rounded-xl bg-[#1769e0] px-5 py-3 font-bold text-white"
          >
            Kembali ke Dashboard
          </button>

        </div>
      </main>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="review-page">

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="review-toolbar">

        <div>
          <p className="eyebrow">
            CETAS.SCORE • REVIEW
          </p>

          <h1>
            Preview Form Penilaian
          </h1>

          <p>
            Periksa struktur
            materi sebelum
            mencetak lembar
            juri.
          </p>
        </div>

        <div className="toolbar-actions">

          <button
            onClick={() =>
              router.replace(
                "/admin/dashboard"
              )
            }
            className="secondary-button"
          >
            ← Dashboard Admin
          </button>

          <button
            onClick={() =>
              setShowSheetSettings(
                (value) => !value
              )
            }
            className="secondary-button"
          >
            ⚙ Atur Lembar
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="primary-button"
          >
            🖨 Cetak Semua
          </button>

        </div>
      </div>

      {/* =================================================
          PENGATURAN LEMBAR
      ================================================= */}

      <div
        className={`sheet-settings ${
          showSheetSettings
            ? "open"
            : ""
        }`}
      >

        <div className="settings-head">

          <div>
            <b>
              Susunan Lembar
              Penilaian
            </b>

            <p>
              Default: PBB +
              Danton digabung.
              Pembagian dapat
              diubah sesuai
              kebutuhan admin.
            </p>
          </div>

          <button
            onClick={addSheet}
            className="add-sheet"
          >
            + Lembar
          </button>

        </div>

        <div className="assignment-list">

          {(() => {
            const grouped = new Map<string, Category[]>();

            for (const category of event.categories || []) {
              const levelKey = category.eventLevelId || "__NONE__";
              const group = grouped.get(levelKey) || [];
              group.push(category);
              grouped.set(levelKey, group);
            }

            const groups = Array.from(grouped.entries()).sort((a, b) => {
              const aOrder = a[1][0]?.eventLevel?.sortOrder ?? 999;
              const bOrder = b[1][0]?.eventLevel?.sortOrder ?? 999;
              return aOrder - bOrder;
            });

            return groups.map(([levelId, categories]) => (
              <div className="level-group" key={levelId}>
                <div className="level-group-heading">
                  TINGKATAN: {getLevelName(categories[0]) || "-"}
                </div>

                {categories
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((category) => {
                    const currentSheet = sheets.findIndex(
                      (sheet) =>
                        sheet.categoryIds.includes(category.id)
                    );

                    const allowedSheets = sheets
                      .map((sheet, index) => ({ sheet, index }))
                      .filter(({ sheet }) => {
                        const categoryLevelId = category.eventLevelId || null;
                        return (
                          !sheet.levelId ||
                          sheet.levelId === categoryLevelId
                        );
                      });

                    return (
                      <div
                        className="assignment-row"
                        key={category.id}
                      >
                        <div>
                          <b>{category.name}</b>
                        </div>

                        <select
                          value={currentSheet < 0 ? "" : String(currentSheet)}
                          onChange={(e) => {
                            const target = Number(e.target.value);
                            if (Number.isFinite(target)) {
                              updateAssignment(category.id, target);
                            }
                          }}
                        >
                          {currentSheet < 0 ? (
                            <option value="">Pilih lembar</option>
                          ) : null}

                          {allowedSheets.map(({ sheet, index }) => (
                            <option key={sheet.id} value={index}>
                              Lembar {index + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
              </div>
            ));
          })()}

        </div>

        <div className="settings-footer">

          {sheets.map(
            (
              sheet,
              index
            ) => (
              <div
                className="sheet-pill"
                key={sheet.id}
              >

                <b>
                  Lembar{" "}
                  {index + 1}
                </b>

                <span>
                  {sheet.categoryIds
                    .map(
                      (id) =>
                        categoryMap.get(
                          id
                        )?.name
                    )
                    .filter(Boolean)
                    .join(
                      " + "
                    ) ||
                    "Kosong"}
                </span>

                {sheets.length >
                  1 && (
                  <button
                    onClick={() =>
                      removeSheet(
                        index
                      )
                    }
                  >
                    ×
                  </button>
                )}

              </div>
            )
          )}

        </div>
      </div>

      {/* =================================================
          PRINT DOCUMENT
      ================================================= */}

      <div className="print-document">

        {sheetCategories.map(
          (
            categories,
            index
          ) =>
            categories.length ? (
              <PrintSheet
                key={
                  sheets[index]
                    ?.id || index
                }
                event={event}
                categories={
                  categories
                }
                sheetNumber={
                  index + 1
                }
                sheetCount={
                  sheetCategories.length
                }
              />
            ) : null
        )}

      </div>

      {/* =================================================
          COMPLETE BAR
      ================================================= */}

      <div className="complete-bar">

        <div>
          <b>
            ✓ Konfigurasi
            lengkap dan siap
            dicetak.
          </b>

          <span>
            8 pilihan nilai
            setiap materi
            dihitung otomatis
            dari bobot,
            subkategori,
            tingkat kesulitan,
            interval, dan
            jumlah materi.
          </span>
        </div>

        <button
          onClick={() =>
            router.replace(
              "/admin/dashboard"
            )
          }
        >
          Kembali ke Dashboard
        </button>

      </div>

      {/* =================================================
          STYLE
      ================================================= */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        /* =================================================
           PAGE
        ================================================= */

        .review-page {
          min-height: 100vh;
          background: #f3f7fc;
          padding: 22px 20px 50px;
          color: #071a3d;
        }

        /* =================================================
           TOOLBAR
        ================================================= */

        .review-toolbar,
        .sheet-settings,
        .complete-bar {
          width: min(
            1180px,
            100%
          );
          margin: 0 auto 14px;
          background: #fff;
          border: 1px solid #d8e3f1;
          border-radius: 18px;
          box-shadow:
            0 8px 24px
            rgba(
              7,
              26,
              61,
              0.06
            );
        }

        .review-toolbar {
          padding: 17px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .eyebrow {
          margin: 0 0 3px;
          color: #1769e0;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .2em;
        }

        .review-toolbar h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 950;
        }

        .review-toolbar p:not(.eyebrow) {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .toolbar-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .primary-button,
        .secondary-button,
        .complete-bar button,
        .add-sheet {
          border-radius: 11px;
          padding: 10px 14px;
          font-weight: 850;
          cursor: pointer;
        }

        .primary-button {
          border: 0;
          background: #1769e0;
          color: #fff;
        }

        .secondary-button {
          border: 1px solid #b8c8dc;
          background: #fff;
          color: #071a3d;
        }

        /* =================================================
           SHEET SETTINGS
        ================================================= */

        .sheet-settings {
          display: none;
          padding: 16px 20px;
        }

        .sheet-settings.open {
          display: block;
        }

        .settings-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
        }

        .settings-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .add-sheet {
          border: 0;
          background: #071a3d;
          color: #fff;
        }

        .assignment-list {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 8px;
          margin-top: 12px;
        }\n\n        .level-group {\n          display: grid;\n          grid-column: 1 / -1;\n          grid-template-columns: repeat(2, minmax(0, 1fr));\n          gap: 8px;\n        }\n\n        .level-group-heading {\n          grid-column: 1 / -1;\n          padding: 8px 10px;\n          border: 1px solid #bcd4f4;\n          border-radius: 10px;\n          background: #eef4ff;\n          color: #1769e0;\n          font-size: 10px;\n          font-weight: 950;\n          letter-spacing: .08em;\n        }

        .assignment-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 11px;
          border: 1px solid #dbe5f0;
          border-radius: 10px;
          background: #f8fafc;
          font-size: 12px;
        }

        .assignment-row select {
          border: 1px solid #b8c8dc;
          border-radius: 8px;
          padding: 6px 8px;
          background: #fff;
        }\n\n        .assignment-row > div {\n          display: flex;\n          flex-direction: column;\n          min-width: 0;\n          gap: 2px;\n        }\n\n        .assignment-row small {\n          color: #64748b;\n          font-size: 9px;\n          font-weight: 800;\n          text-transform: uppercase;\n        }

        .settings-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .sheet-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          background: #edf4ff;
          color: #071a3d;
          padding: 7px 10px;
          font-size: 11px;
        }

        .sheet-pill button {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
        }

        /* =================================================
           DOCUMENT
        ================================================= */

        .print-document {
          width: min(
            1180px,
            100%
          );
          margin: 0 auto;
        }

        .review-sheet {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 250mm;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          padding: 18px 22px 15px;
          margin-bottom: 20px;
          break-after: page;
          page-break-after: always;
          color: #071a3d;
          overflow: hidden;
        }

        .sheet-watermark {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .sheet-watermark img {
          width: min(430px, 58%);
          max-height: 430px;
          object-fit: contain;
          opacity: 0.10;
          filter: grayscale(100%);
        }

        .sheet-top,
        .category-list,
        .bottom-area {
          position: relative;
          z-index: 1;
        }

        .review-sheet:last-child {
          break-after: auto;
          page-break-after: auto;
        }

        /* =================================================
           HEADER
        ================================================= */

        .sheet-top {
          display: grid;
          grid-template-columns:
            165px
            minmax(0, 1fr)
            140px
            315px;
          align-items: center;
          gap: 10px;
          min-height: 120px;
          border-bottom: 2px solid #071a3d;
          padding-bottom: 10px;
        }

        .logo-left,
        .logo-right {
          display: flex;
          align-items: center;
        }

        .logo-left img {
          width: 165px;
          max-width: 165px;
          max-height: 88px;
          object-fit: contain;
          object-position: left center;
        }

        .logo-right {
          justify-content: flex-end;
        }

        .logo-right img {
          width: 140px;
          max-width: 140px;
          max-height: 88px;
          object-fit: contain;
        }

        .logo-placeholder {
          width: 82px;
          height: 58px;
          border: 1px dashed #94a3b8;
          border-radius: 8px;
          display: grid;
          place-items: center;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 800;
        }

        .event-name {
          text-align: center;
          padding: 0 15px;
        }

        .event-kicker {
          color: #1769e0;
          font-size: 20px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .event-name h1 {
          margin: 5px 0 0;
          font-size: 24px;
          line-height: 1.08;
          font-weight: 950;
          text-transform: uppercase;
        }\n\n        .event-level {\n          margin-top: 5px;\n          color: #071a3d;\n          font-size: 11px;\n          line-height: 1.1;\n          font-weight: 950;\n          letter-spacing: .06em;\n          text-transform: uppercase;\n        }

        .event-location {
          margin-top: 5px;
          font-size: 10px;
          font-weight: 850;
          text-transform: uppercase;
        }

        /* =================================================
           IDENTITAS
        ================================================= */

        .identity-grid {
          display: grid;
          grid-template-columns: 100px minmax(0, 1fr);
          border: 1px solid #071a3d;
          margin-top: 0;
          font-size: 10px;
          align-self: center;
          min-width: 0;
        }

        .identity-grid > div {
          min-height: 25px;
          padding: 5px 7px;
          border-right: 1px solid #071a3d;
          border-bottom: 1px solid #071a3d;
        }

        .identity-grid > div:nth-child(2n) {
          border-right: 0;
        }

        .identity-grid > div:nth-last-child(-n + 2) {
          border-bottom: 0;
        }

        .identity-wide {
          min-width: 0;
        }

        .identity-grid .label {
          background: #f5f8fc;
          font-weight: 850;
        }

        .identity-grid .blank {
          background: #fff;
        }

        .judge-numbers {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 5px 7px !important;
          min-height: 25px;
          width: auto;
          min-width: 0;
          white-space: nowrap;
          font-weight: 850;
        }

        .judge-numbers .judge-number {
          display: inline;
          width: auto;
          min-width: 0;
          height: auto;
          padding: 0;
          border: 0 !important;
          font-weight: 850;
          box-sizing: border-box;
        }

        /* =================================================
           CATEGORY
        ================================================= */

        .category-block {
          margin-top: 11px;
        }

        .category-heading {
          background: #071a3d;
          color: #fff;
          padding: 7px 9px;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .sub-block {
          margin-top: 6px;
        }

        .sub-heading {
          background: #e9f2ff;
          color: #071a3d;
          border: 1px solid #bcd4f4;
          border-bottom: 0;
          padding: 6px 8px;
          font-size: 9px;
          font-weight: 950;
          text-transform: uppercase;
        }

        /* =================================================
           SCORE TABLE
        ================================================= */

        .score-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 9px;
        }

        /*
         * NILAI = 54% dari lebar tabel.
         * Jumlah kolom mengikuti jumlah nilai yang benar-benar
         * tampil setelah nilai 0 dihapus.
         */
        .col-no {
          width: 3%;
        }

        .col-material {
          width: 43%;
        }

        .col-score {
          width: auto;
        }

        .score-table th,
        .score-table td {
          border: 1px solid #66788f;
          padding: 4px 5px;
          vertical-align: middle;
        }

        .score-table th {
          background: #eef3f9;
          color: #071a3d;
          font-size: 9px;
          font-weight: 950;
          text-align: center;
          line-height: 1.05;
        }

        .classification-row th {
          background: #f8fafc;
          font-size: 9px;
          padding: 3px 1px;
          border-top: 2px solid #52667f;
          border-bottom: 2px solid #52667f;
        }

        .material-header {
          font-size: 9px !important;
        }

        .center {
          text-align: center;
        }

        .material-name {
          font-weight: 800;
          font-size: 9px;
          text-align: left;
          line-height: 1.15;
        }

        .score-option {
          height: 19px;
          padding: 2px 1px !important;
          background: #fff;
          color: #071a3d;
          text-align: center;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
        }

        .empty-box {
          padding: 10px;
          border: 1px dashed #94a3b8;
          color: #64748b;
          text-align: center;
          font-size: 9px;
        }

        /* =================================================
           BOTTOM AREA
           CATATAN + TTD TANPA KOTAK
        ================================================= */

        .bottom-area {
          display: grid;
          grid-template-columns:
            1.65fr
            .7fr;
          gap: 25px;
          margin-top: 14px;
          align-items: start;
        }

        .notes,
        .signature {
          min-height: 70px;
          border: 0;
          padding: 0;
          font-size: 8.5px;
        }

        .notes b,
        .signature b {
          display: block;
          font-size: 8.5px;
          font-weight: 950;
        }

        /*
         * Hanya 2 ruang catatan.
         * Tidak menggunakan kotak.
         */
        .notes-space {
          margin-top: 12px;
          width: 100%;
        }

        .note-line {
          height: 18px;
          border-bottom: 1px dashed #8fa0b5;
        }

        /* =================================================
           TTD JURI
        ================================================= */

        .signature {
          text-align: center;
        }

        .signature-space {
          height: 38px;
        }

        .signature-line {
          width: 105px;
          margin: 0 auto;
          border-bottom: 1px solid #071a3d;
        }

        /* =================================================
           FOOTER
        ================================================= */

        .sheet-footer {
          margin-top: 8px;
          text-align: center;
          color: #94a3b8;
          font-size: 6.5px;
          letter-spacing: .18em;
          font-weight: 800;
        }

        /* =================================================
           COMPLETE BAR
        ================================================= */

        .complete-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
        }

        .complete-bar b,
        .complete-bar span {
          display: block;
        }

        .complete-bar b {
          font-size: 12px;
        }

        .complete-bar span {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .complete-bar button {
          border: 1px solid #1769e0;
          background: #fff;
          color: #1769e0;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 800px) {

          .review-toolbar,
          .complete-bar {
            align-items: stretch;
            flex-direction: column;
          }

          .assignment-list,
          .level-group {
            grid-template-columns: 1fr;
          }

          .sheet-top {
            grid-template-columns:
              100px
              minmax(0, 1fr)
              85px
              220px;
            gap: 6px;
          }

          .logo-left img {
            width: 100px;
            max-width: 100px;
            max-height: 64px;
          }

          .logo-right img {
            width: 85px;
            max-width: 85px;
            max-height: 64px;
          }

          .event-kicker {
            font-size: 14px;
          }

          .event-name h1 {
            font-size: 17px;
          }

          .identity-grid {
            grid-template-columns:
              72px
              minmax(0, 1fr);
            font-size: 8px;
          }

          .identity-grid > div {
            min-height: 21px;
            padding: 4px 5px;
          }

          .judge-numbers {
            font-size: 8px;
          }

          .material-name {
            font-size: 8px;
          }

          .score-option {
            font-size: 8px;
          }
        }

        /* =================================================
           PRINT F4
        ================================================= */

        @media print {

          @page {
            size: 215mm 330mm;
            margin: 5mm;
          }

          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .review-page {
            padding: 0;
            background: #fff;
          }

          .review-toolbar,
          .sheet-settings,
          .complete-bar {
            display: none !important;
          }

          .print-document {
            width: 100%;
            margin: 0;
          }

          .review-sheet {
            width: 100%;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0;
            border: 0 !important;
            border-radius: 0;
            padding: 5mm;
            box-sizing: border-box;
            overflow: visible !important;
            break-after: auto;
            page-break-after: auto;
            break-before: auto;
            page-break-before: auto;
          }

          /*
           * Sheet berikutnya selalu dimulai di halaman baru.
           * Tidak memakai break-after pada sheet sebelumnya agar
           * tidak pernah menghasilkan halaman kosong tambahan.
           */
          .review-sheet + .review-sheet {
            break-before: page;
            page-break-before: always;
          }

          /*
           * SATU SUBKATEGORI = SATU BLOK UTUH.
           * Kalau ruang halaman tersisa tidak cukup, seluruh
           * subkategori dipindahkan ke halaman berikutnya.
           * Heading + tabel tidak boleh terpisah.
           */
          .sub-block {
            display: table;
            width: 100%;
            margin-top: 6px;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .category-block {
            break-inside: auto;
            page-break-inside: auto;
          }

          .category-heading {
            break-after: avoid;
            page-break-after: avoid;
          }

          .review-sheet:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }

          /*
           * Hindari tabel/subkategori terpotong
           * di tengah blok/baris.
           */
          .sub-block,
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .category-heading,
          .sub-heading {
            break-after: avoid;
            page-break-after: avoid;
          }

          .score-table {
            width: 100%;
          }

          .score-table th,
          .score-table td {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .category-heading {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .sub-heading {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .notes,
          .signature {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

      `}</style>
    </main>
  );
}