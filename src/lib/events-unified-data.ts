import { EventThemePreset } from "./event-theme";

export interface UnifiedTicketTier {
  id: string;
  name: string;
  price: number;
  quotaRemaining: number;
  quotaTotal: number;
  benefits?: string[];
}

export interface RegistrationCategoryQuota {
  id: string;
  name: string; // e.g. "Tingkat SD/MI", "Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"
  code: string; // "SD" | "SMP" | "SMA" | "PURNA" | custom code
  quotaTotal: number;
  quotaRemaining: number;
}

export interface LKBBTeamScore {
  id: string;
  number: string;
  school: string;
  teamName: string;
  level: string; // "SD" | "SMP" | "SMA" | "PURNA" | custom code
  categoryName?: string;
  pbbMurni: number;
  variasiFormasi: number;
  danton: number;
  kostum: number;
  penalty: number;
  totalScore: number;
  status: "BELUM_TAMPIL" | "SEDANG_DINILAI" | "TERVERIFIKASI";
}

export interface UnifiedEvent {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  category: string;
  themePreset?: EventThemePreset;
  date: string;
  time: string;
  location: string;
  locationType: "HYBRID" | "OFFLINE" | "ONLINE";
  bannerUrl: string;
  description: string;
  status: "PUBLISHED" | "DRAFT" | "FINISHED";

  // Fitur Cetas Ticketing
  isOpenTicketing: boolean;
  tiers: UnifiedTicketTier[];

  // Fitur Pendaftaran Peserta Online Web Cetas (Per Kategori & Kuota Custom)
  isOpenOnlineRegistration: boolean;
  price: number; // 0 = Gratis
  priceLabel: string;
  quotaTotal: number;
  quotaRemaining: number;
  categoryOptions: string[];
  registrationCategories?: RegistrationCategoryQuota[];
  facilities: string[];

  // Data Peserta & Peringkat LKBB (Cetas.Score)
  lkbbTeams?: LKBBTeamScore[];
}

export function normalizeCategoryLevelCode(rawName: string): string {
  const s = String(rawName || "").toUpperCase().trim();
  if (/\b(SD|MI)\b/.test(s) || s.includes("SD/") || s.includes("SD ")) return "SD";
  if (/\b(SMP|MTS)\b/.test(s) || s.includes("SMP/") || s.includes("SMP ")) return "SMP";
  if (/\b(SMA|SMK|MA)\b/.test(s) || s.includes("SMA/") || s.includes("SMA ")) return "SMA";
  if (/\b(PURNA|UMUM|CLUB|MAHASISWA|INSTANSI)\b/.test(s)) return "PURNA";
  const cleaned = s.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "UMUM";
}

export function getEffectiveRegistrationCategories(
  event: Partial<UnifiedEvent>
): RegistrationCategoryQuota[] {
  if (
    Array.isArray(event.registrationCategories) &&
    event.registrationCategories.length > 0
  ) {
    return event.registrationCategories.map((cat, idx) => ({
      id: cat.id || `reg-cat-${idx + 1}`,
      name: cat.name || `Kategori ${idx + 1}`,
      code: cat.code || normalizeCategoryLevelCode(cat.name || ""),
      quotaTotal: Math.max(1, Number(cat.quotaTotal) || 35),
      quotaRemaining:
        cat.quotaRemaining !== undefined
          ? Math.max(0, Number(cat.quotaRemaining))
          : Math.max(1, Number(cat.quotaTotal) || 35),
    }));
  }

  const options =
    Array.isArray(event.categoryOptions) && event.categoryOptions.length > 0
      ? event.categoryOptions
      : ["Tingkat SD/MI", "Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"];

  const totalQuota = Number(event.quotaTotal) || 100;
  const remQuota =
    event.quotaRemaining !== undefined ? Number(event.quotaRemaining) : totalQuota;
  const perCatTotal = Math.max(10, Math.floor(totalQuota / options.length));
  const perCatRem = Math.max(0, Math.floor(remQuota / options.length));

  return options.map((name, idx) => {
    const isLast = idx === options.length - 1;
    const catTotal = isLast
      ? Math.max(1, totalQuota - perCatTotal * (options.length - 1))
      : perCatTotal;
    const catRem = isLast
      ? Math.max(0, remQuota - perCatRem * (options.length - 1))
      : perCatRem;
    return {
      id: `reg-cat-${event.id || "ev"}-${idx + 1}`,
      name,
      code: normalizeCategoryLevelCode(name),
      quotaTotal: catTotal,
      quotaRemaining: Math.min(catTotal, catRem),
    };
  });
}

export const INITIAL_UNIFIED_EVENTS: UnifiedEvent[] = [
  {
    id: "ev-268156",
    slug: "lkbb-cemara-2026",
    title: "LKBB CEMARA 2026",
    organizer: "Cetas Official",
    category: "Kompetisi & LKBB",
    themePreset: "EMERALD",
    date: "2026-11-28",
    time: "09:00 - 17:00 WIB",
    location: "SMK BUDI MURNI 2 JAKARTA",
    locationType: "OFFLINE",
    bannerUrl: "/lkbb-cemara-2026.jpg",
    description:
      "Kejuaraan Lomba Keterampilan Baris-Berbaris (LKBB) CEMARA 2026 di SMK Budi Murni 2 Jakarta. Terintegrasi dengan sistem penilaian digital real-time Cetas.Score, E-Voting Juara Favorit (Cetas Vote), dan E-Ticketing resmi.",
    status: "PUBLISHED",
    isOpenTicketing: true,
    tiers: [
      {
        id: "tier-1791759127996-1",
        name: "MANDATORY TICKET",
        price: 10000,
        quotaRemaining: 400,
        quotaTotal: 400,
        benefits: ["E-Ticket QR Code Resmi", "Akses Masuk Venue LKBB CEMARA 2026"],
      },
    ],
    isOpenOnlineRegistration: true,
    price: 0,
    priceLabel: "Gratis",
    quotaTotal: 100,
    quotaRemaining: 100,
    categoryOptions: [
      "Tingkat SD/MI",
      "Tingkat SMP/MTs",
      "Tingkat SMA/SMK/MA",
    ],
    registrationCategories: [
      {
        id: "reg-cat-ev-268156-sd",
        name: "Tingkat SD/MI",
        code: "SD",
        quotaTotal: 30,
        quotaRemaining: 30,
      },
      {
        id: "reg-cat-ev-268156-smp",
        name: "Tingkat SMP/MTs",
        code: "SMP",
        quotaTotal: 35,
        quotaRemaining: 35,
      },
      {
        id: "reg-cat-ev-268156-sma",
        name: "Tingkat SMA/SMK/MA",
        code: "SMA",
        quotaTotal: 35,
        quotaRemaining: 35,
      },
    ],
    facilities: [
      "Sertifikat Digital Resmi",
      "E-Badge Pass QR",
      "Snack",
    ],
    lkbbTeams: [],
  },
];

const EVENTS_STORAGE_KEY = "cetas_unified_events_v5";

export function getStoredEvents(): UnifiedEvent[] {
  if (typeof window === "undefined") return INITIAL_UNIFIED_EVENTS;
  try {
    localStorage.removeItem("cetas_unified_events_v1");
    localStorage.removeItem("cetas_unified_events_v2");
    localStorage.removeItem("cetas_unified_events_v3");
    localStorage.removeItem("cetas_unified_events_v4");
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return INITIAL_UNIFIED_EVENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_UNIFIED_EVENTS;
  } catch {
    return INITIAL_UNIFIED_EVENTS;
  }
}

export function saveStoredEvents(events: UnifiedEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch {
    try {
      const compact = events.map((e) => ({
        ...e,
        bannerUrl:
          e.bannerUrl && e.bannerUrl.length > 250000
            ? "/lkbb-cemara-2026.jpg"
            : e.bannerUrl,
      }));
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(compact));
    } catch {}
  }
}
