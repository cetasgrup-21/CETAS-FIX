import { EventThemePreset } from "./event-theme";

export interface UnifiedTicketTier {
  id: string;
  name: string;
  price: number;
  quotaRemaining: number;
  quotaTotal: number;
  benefits?: string[];
}

export interface LKBBTeamScore {
  id: string;
  number: string;
  school: string;
  teamName: string;
  level: "SMP" | "SMA" | "PURNA";
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

  // Fitur Pendaftaran Peserta Online Web Cetas
  isOpenOnlineRegistration: boolean;
  price: number; // 0 = Gratis
  priceLabel: string;
  quotaTotal: number;
  quotaRemaining: number;
  categoryOptions: string[];
  facilities: string[];

  // Data Peserta & Peringkat LKBB (Cetas.Score)
  lkbbTeams?: LKBBTeamScore[];
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
    categoryOptions: ["Tingkat SMP/MTs", "Tingkat SMA/SMK/MA", "Kategori Purna / Umum"],
    facilities: [
      "Sertifikat Digital Resmi",
      "E-Badge Pass QR",
      "Snack",
    ],
    lkbbTeams: [],
  },
];

const EVENTS_STORAGE_KEY = "cetas_unified_events_v4";

export function getStoredEvents(): UnifiedEvent[] {
  if (typeof window === "undefined") return INITIAL_UNIFIED_EVENTS;
  try {
    // Purge legacy keys that may contain uncompressed multi-MB base64 strings
    localStorage.removeItem("cetas_unified_events_v1");
    localStorage.removeItem("cetas_unified_events_v2");
    localStorage.removeItem("cetas_unified_events_v3");
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
    // If localStorage quota is exceeded due to large base64 banners, store with compact banner fallback
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
