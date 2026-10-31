"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Level = { id: string; code: string; name: string; sortOrder: number };
type Category = { id: string; name: string; eventLevelId: string | null; percentage: number; sortOrder: number };
type Winner = {
  id: string;
  participantId: string | null;
  manualName?: string | null;
  manualSchool?: string | null;
  participant: { id: string; number: number; name: string; school: string | null } | null;
  winnerOrder: number;
  source: string;
  score: number | null;
};
type AwardSource = { id: string; categoryId: string; sortOrder: number; category: { id: string; name: string; percentage: number } };
type Award = {
  id: string;
  name: string;
  method: "CATEGORY_SCORE" | "MANUAL" | string;
  eventLevelId: string | null;
  status: string;
  lockedAt: string | null;
  tieBreakers: string | null;
  categorySources: AwardSource[];
  winners: Winner[];
};
type Api = {
  success: boolean;
  error?: string;
  event?: { id: string; name: string; logo: string | null; totalPoints: number };
  levels?: Level[];
  categories?: Category[];
  awards?: Award[];
};
type ManualEntry = { name: string; school: string; score: string; participantId?: string };

const money = (value: unknown) => Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 });

const TIMER_TIE_PREFIX = "TIMER_CLOSEST|";

function parseTieBreakers(raw: string | null | undefined) {
  if (!raw) return [] as string[];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [] as string[];
  }
}

function parseClockToSeconds(value: string) {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;

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

function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function timerTieLabel(value: string) {
  if (!value.startsWith(TIMER_TIE_PREFIX)) return null;
  const rawTarget = value.slice(TIMER_TIE_PREFIX.length);
  const seconds = parseClockToSeconds(rawTarget);
  return seconds == null ? `Timer → ${rawTarget}` : `Timer → terdekat ${formatClock(seconds)}`;
}

function methodLabel(method: string) {
  return method === "MANUAL" ? "Manual" : "Gabungan Kategori";
}

export default function PenentuanJuaraPage() {
  const [data, setData] = useState<Api | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [levelId, setLevelId] = useState("");
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"CATEGORY_SCORE" | "MANUAL">("CATEGORY_SCORE");
  const [sourceCategoryIds, setSourceCategoryIds] = useState<string[]>([]);
  const [tieBreakers, setTieBreakers] = useState<string[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerTarget, setTimerTarget] = useState("08:00");
  const [manualDrafts, setManualDrafts] = useState<Record<string, ManualEntry[]>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/award${levelId ? `?eventLevelId=${encodeURIComponent(levelId)}` : ""}`, { cache: "no-store" });
      const json = (await response.json()) as Api;
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal mengambil data.");
      setData(json);

      const drafts: Record<string, ManualEntry[]> = {};
      for (const award of json.awards || []) {
        if (award.method === "MANUAL") {
          drafts[award.id] = award.winners.map((winner) => ({
            name: winner.manualName || winner.participant?.name || "",
            school: winner.manualSchool || winner.participant?.school || "",
            score: winner.score == null ? "" : String(winner.score),
            participantId: winner.participantId || undefined,
          }));
        }
      }
      setManualDrafts(drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [levelId]);

  const levels = data?.levels || [];
  const categories = data?.categories || [];
  const awards = data?.awards || [];
  const levelCategories = useMemo(
    () => categories.filter((category) => !category.eventLevelId || category.eventLevelId === levelId).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, levelId],
  );

  const toggleCategory = (id: string) => setSourceCategoryIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const toggleTieBreaker = (id: string) => setTieBreakers((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  const toggleTimerTieBreaker = () => {
    setTimerEnabled((enabled) => {
      const next = !enabled;

      setTieBreakers((current) => {
        const withoutTimer = current.filter((item) => !item.startsWith(TIMER_TIE_PREFIX));
        if (!next) return withoutTimer;

        return [...withoutTimer, `${TIMER_TIE_PREFIX}${timerTarget.trim() || "08:00"}`];
      });

      return next;
    });
  };

  const updateTimerTarget = (value: string) => {
    setTimerTarget(value);

    setTieBreakers((current) => {
      const withoutTimer = current.filter((item) => !item.startsWith(TIMER_TIE_PREFIX));
      if (!timerEnabled) return withoutTimer;
      return [...withoutTimer, `${TIMER_TIE_PREFIX}${value}`];
    });
  };

  const resetForm = () => {
    setName("");
    setSourceCategoryIds([]);
    setTieBreakers([]);
    setTimerEnabled(false);
    setTimerTarget("08:00");
    setMethod("CATEGORY_SCORE");
  };

  async function createAward() {
    if (!levelId) return setError("Pilih tingkatan terlebih dahulu.");
    if (!name.trim()) return setError("Nama kategori juara wajib diisi.");
    if (method === "CATEGORY_SCORE" && !sourceCategoryIds.length) return setError("Pilih minimal satu kategori penilaian.");

    if (timerEnabled) {
      const targetSeconds = parseClockToSeconds(timerTarget);
      if (targetSeconds == null || targetSeconds <= 0) {
        return setError("Target waktu Timer tidak valid. Gunakan MM:SS atau HH:MM:SS, misalnya 08:00.");
      }
    }

    const finalTieBreakers = timerEnabled
      ? [
          ...tieBreakers.filter((item) => !item.startsWith(TIMER_TIE_PREFIX)),
          `${TIMER_TIE_PREFIX}${timerTarget.trim()}`,
        ]
      : tieBreakers.filter((item) => !item.startsWith(TIMER_TIE_PREFIX));

    try {
      setSaving("create");
      setError("");
      const response = await fetch("/api/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          method,
          eventLevelId: levelId,
          sourceCategoryIds,
          tieBreakers: finalTieBreakers,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal membuat kategori juara.");
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kategori juara.");
    } finally { setSaving(""); }
  }

  async function action(awardId: string, actionName: string, extra: Record<string, unknown> = {}) {
    try {
      setSaving(`${actionName}:${awardId}`);
      setError("");
      const response = await fetch("/api/award", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: awardId, action: actionName, ...extra }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Aksi gagal.");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aksi gagal.");
    } finally { setSaving(""); }
  }

  async function removeAward(id: string) {
    if (window.confirm("Hapus kategori juara ini?")) await action(id, "delete");
  }

  function addManualRow(id: string) {
    setManualDrafts((current) => ({ ...current, [id]: [...(current[id] || []), { name: "", school: "", score: "" }] }));
  }

  function updateManual(id: string, index: number, key: keyof ManualEntry, value: string) {
    setManualDrafts((current) => ({
      ...current,
      [id]: (current[id] || []).map((entry, i) => i === index ? { ...entry, [key]: value } : entry),
    }));
  }

  function removeManualRow(id: string, index: number) {
    setManualDrafts((current) => ({ ...current, [id]: (current[id] || []).filter((_, i) => i !== index) }));
  }

  async function saveManualResults(id: string) {
    const entries = (manualDrafts[id] || []).filter((entry) => entry.name.trim());
    if (!entries.length) return setError("Isi minimal satu peserta manual.");
    await action(id, "setManualResults", { entries });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] text-slate-400">CETAS.ID</p>
              <h1 className="text-2xl font-black text-slate-950">Penentuan Juara</h1>
              <p className="mt-1 text-sm text-slate-500">Gabungkan beberapa kategori, atur tie breaker, lalu ranking seluruh peserta.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/rekap" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900">← Pilih Jenis Rekap</Link>
              <button onClick={() => window.open("/penentuan-juara/rekap-keseluruhan", "_blank", "noopener,noreferrer")} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900">Rekap Keseluruhan</button>
              <button onClick={fetchData} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Refresh</button>
            </div>
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-[11px] font-bold tracking-wider text-slate-500">TINGKATAN</label>
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setSourceCategoryIds([]);
                setTieBreakers([]);
                setTimerEnabled(false);
                setTimerTarget("08:00");
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
            >
              <option value="">Pilih Tingkatan</option>
              {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[11px] font-bold tracking-wider text-slate-500">EVENT</p><p className="mt-2 text-lg font-black text-slate-950">{data?.event?.name || "—"}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[11px] font-bold tracking-wider text-slate-500">STATUS</p><p className="mt-2 text-lg font-black text-slate-950">{awards.filter((a) => a.status === "FINAL").length}/{awards.length} Terkunci</p></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5"><p className="text-[11px] font-bold tracking-wider text-slate-400">KATEGORI JUARA</p><h2 className="text-xl font-black text-slate-950">Tambahkan Kategori Juara</h2></div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: JUARA UTAMA / BEST DANTON" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900" />
              <select value={method} onChange={(e) => setMethod(e.target.value as "CATEGORY_SCORE" | "MANUAL")} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">
                <option value="CATEGORY_SCORE">Berdasarkan Gabungan Kategori</option>
                <option value="MANUAL">Manual</option>
              </select>

              {method === "CATEGORY_SCORE" && <>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Kategori Penilaian</p><p className="mt-1 text-xs text-slate-400">Semua kategori yang dicentang dijumlahkan menjadi nilai kategori juara.</p></div>
                    <div className="flex gap-2">
                      <button type="button" disabled={!levelId} onClick={() => setSourceCategoryIds(levelCategories.map((c) => c.id))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40">Pilih Semua</button>
                      <button type="button" onClick={() => setSourceCategoryIds([])} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Bersihkan</button>
                    </div>
                  </div>
                  {!levelId ? <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-400">Pilih tingkatan terlebih dahulu.</div> : !levelCategories.length ? <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-400">Belum ada kategori penilaian.</div> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {levelCategories.map((category) => {
                      const checked = sourceCategoryIds.includes(category.id);
                      return <label key={category.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"}`}><input type="checkbox" checked={checked} onChange={() => toggleCategory(category.id)} className="h-4 w-4" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{category.name}</span><span className={`block text-[11px] ${checked ? "text-slate-300" : "text-slate-400"}`}>Bobot {category.percentage}%</span></span></label>;
                    })}
                  </div>}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Tie Breaker</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Urutan checklist = prioritas pembanding saat nilai utama sama. Bisa memakai beberapa kategori sekaligus.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ...levelCategories.map((category) => ({ id: category.id, label: category.name })),
                      { id: "RAW_SCORE", label: "Nilai Mentah" },
                      { id: "BONUS", label: "Bonus" },
                      { id: "PENALTY", label: "Penalty" },
                      { id: "NUMBER", label: "Nomor Peserta" },
                    ].map((item) => {
                      const selected = tieBreakers.includes(item.id);
                      const position = tieBreakers.indexOf(item.id);

                      return (
                        <label
                          key={item.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                            selected ? "border-blue-600 bg-blue-50" : "border-slate-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleTieBreaker(item.id)}
                            className="h-4 w-4"
                          />
                          <span className="flex-1 text-sm font-bold">{item.label}</span>
                          {selected && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                              {position + 1}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className={`mt-4 rounded-2xl border p-4 ${
                    timerEnabled ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"
                  }`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={timerEnabled}
                          onChange={toggleTimerTieBreaker}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-900">Timer sebagai Tie Breaker</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Jika nilai utama dan tie breaker sebelumnya masih sama, peserta dengan waktu yang paling mendekati target akan menang.
                          </span>
                        </span>
                      </label>

                      <div className="w-full md:w-56">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Target Waktu</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={timerTarget}
                          onChange={(e) => updateTimerTarget(e.target.value)}
                          placeholder="08:00"
                          disabled={!timerEnabled}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="mt-1 text-[10px] text-slate-400">Format MM:SS atau HH:MM:SS</p>
                      </div>
                    </div>

                    {timerEnabled && (
                      <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                        Contoh: target <strong>{timerTarget || "08:00"}</strong> → waktu yang paling dekat dengan target menjadi lebih tinggi.
                        Jika selisih sama, waktu yang lebih cepat menjadi pembanding berikutnya.
                      </div>
                    )}
                  </div>
                </div>
              </>}

              {method === "MANUAL" && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">Setelah dibuat, masukkan seluruh peserta dan poin. CETAS otomatis mengurutkan poin terbesar menjadi peringkat 1.</div>}
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-slate-950 p-5 text-white">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400">PREVIEW</p>
                <p className="mt-3 text-2xl font-black">{name.trim() || "Kategori Juara"}</p>
                <p className="mt-2 text-sm text-slate-300">{levelId ? levels.find((l) => l.id === levelId)?.name : "Belum memilih tingkatan"}</p>
                <p className="mt-4 text-sm font-bold text-slate-200">{method === "CATEGORY_SCORE" ? `${sourceCategoryIds.length} kategori digabung` : "Input peserta & poin manual"}</p>
                <p className="mt-2 text-xs text-slate-400">{tieBreakers.length ? `Tie breaker: ${tieBreakers.length} prioritas` : "Tie breaker belum dipilih"}</p>
                {timerEnabled && <p className="mt-2 text-xs font-bold text-blue-200">Timer: terdekat dengan {timerTarget}</p>}
              </div>
              <button onClick={createAward} disabled={saving === "create"} className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{saving === "create" ? "Menyimpan..." : "+ Tambah & Tentukan"}</button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-wider text-slate-400">HASIL YANG AKAN DITETAPKAN</p><h2 className="text-xl font-black text-slate-950">Daftar Kategori Juara</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{awards.length} kategori</span></div>
          {loading ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center font-bold text-slate-400">Memuat...</div> : !awards.length ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Belum ada kategori juara.</div> : <div className="space-y-3">
            {awards.map((award, index) => {
              const winner = award.winners[0];
              const sources = award.categorySources || [];
              const manualRows = manualDrafts[award.id] || [];
              const tie = parseTieBreakers(award.tieBreakers);
              const winnerCount = award.winners.length;
              return <article key={award.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">{index + 1}</span><div><h3 className="font-black text-slate-950">{award.name}</h3><p className="text-xs text-slate-500">{methodLabel(award.method)} • {levels.find((l) => l.id === award.eventLevelId)?.name || "Tingkatan"} • {winnerCount} peserta diranking</p></div></div>
                  <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${award.status === "FINAL" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{award.status === "FINAL" ? "TERKUNCI" : "DRAFT"}</span>{!award.lockedAt && <button onClick={() => removeAward(award.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">Hapus</button>}</div>
                </div>

                {sources.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{sources.map((source) => <span key={source.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">✓ {source.category.name}</span>)}</div>}
                {tie.length > 0 && (
                  <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">
                    Tie breaker: {tie.map((id) =>
                      timerTieLabel(id) ||
                      levelCategories.find((c) => c.id === id)?.name ||
                      ({
                        FINAL_SCORE: "Nilai Akhir",
                        RAW_SCORE: "Nilai Mentah",
                        BONUS: "Bonus",
                        PENALTY: "Penalty",
                        NUMBER: "Nomor Peserta",
                      } as Record<string, string>)[id] ||
                      id
                    ).join(" → ")}
                  </div>
                )}

                {award.method === "MANUAL" ? <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-wider text-slate-400">INPUT HASIL MANUAL</p><p className="text-xs text-slate-500">Isi seluruh peserta. Urutan otomatis dari poin terbesar.</p></div><button disabled={Boolean(award.lockedAt)} onClick={() => addManualRow(award.id)} className="rounded-lg bg-white px-3 py-2 text-xs font-black ring-1 ring-slate-200 disabled:opacity-40">+ Peserta</button></div>
                  <div className="space-y-2">{manualRows.map((entry, rowIndex) => <div key={`${award.id}-${rowIndex}`} className="grid gap-2 md:grid-cols-[1fr_1fr_150px_auto]"><input disabled={Boolean(award.lockedAt)} value={entry.name} onChange={(e) => updateManual(award.id, rowIndex, "name", e.target.value)} placeholder="Nama peserta / pasukan" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" /><input disabled={Boolean(award.lockedAt)} value={entry.school} onChange={(e) => updateManual(award.id, rowIndex, "school", e.target.value)} placeholder="Sekolah" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" /><input disabled={Boolean(award.lockedAt)} type="number" step="0.01" value={entry.score} onChange={(e) => updateManual(award.id, rowIndex, "score", e.target.value)} placeholder="Poin" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold" /><button disabled={Boolean(award.lockedAt)} onClick={() => removeManualRow(award.id, rowIndex)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-40">Hapus</button></div>)}</div>
                  <div className="mt-4 flex justify-end"><button disabled={Boolean(award.lockedAt)} onClick={() => saveManualResults(award.id)} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:opacity-40">Simpan & Susun Peringkat</button></div>
                </div> : <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-wider text-slate-400">HASIL TERATAS</p><p className="text-lg font-black text-slate-950">{winner ? `${winner.winnerOrder}. ${winner.participant?.number ?? "—"} — ${winner.participant?.name || winner.manualName || "—"}` : "Belum dihitung"}</p><p className="text-sm text-slate-500">{winner ? `${winner.participant?.school || "—"} • ${money(winner.score)} poin` : "Klik Tentukan Ulang untuk menghitung."}</p></div>{!award.lockedAt && <button onClick={() => action(award.id, "autoWinner")} disabled={saving === `autoWinner:${award.id}`} className="rounded-xl bg-white px-4 py-3 text-xs font-bold shadow-sm ring-1 ring-slate-200 disabled:opacity-40">{saving === `autoWinner:${award.id}` ? "Menghitung..." : "Tentukan Ulang"}</button>}</div></div>}

                <div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={() => window.open(`/penentuan-juara/hasil?awardId=${encodeURIComponent(award.id)}`, "_blank", "noopener,noreferrer")} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold">Review Pemenang · {winnerCount}</button>{award.lockedAt ? <button onClick={() => action(award.id, "unlock")} className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold text-amber-700">Buka Kunci</button> : <button disabled={!winnerCount} onClick={() => action(award.id, "lock")} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-30">Kunci Hasil</button>}</div>
              </article>;
            })}
          </div>}
        </section>
      </div>
    </main>
  );
}