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
    id: "ev-lkbb-cetas-2026",
    slug: "lkbb-cetas-championship-2026",
    title: "LKBB CETAS Championship Series 2026",
    organizer: "CETAS Official Tournament Organizer",
    category: "TURNAMEN LKBB PASKIBRA",
    themePreset: "SAPPHIRE",
    date: "2026-11-15",
    time: "07:00 - 18:00 WIB",
    location: "GOR Indoor Arena Jakarta Barat",
    locationType: "OFFLINE",
    bannerUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
    description:
      "Kejuaraan Lomba Keterampilan Baris-Berbaris (LKBB) tingkat SMP/MTs, SMA/SMK/MA, dan Purna/Umum dengan sistem rekapitulasi nilai juri real-time 0 detik Cetas.Score, E-Voting Juara Favorit, dan E-Ticketing terintegrasi.",
    status: "PUBLISHED",
    isOpenTicketing: true,
    tiers: [
      {
        id: "tier-lkbb-reg",
        name: "Tiket Masuk Suporter (Tribun Reguler)",
        price: 25000,
        quotaRemaining: 500,
        quotaTotal: 500,
      },
      {
        id: "tier-lkbb-vip",
        name: "VIP Arena Pass (Front Row)",
        price: 50000,
        quotaRemaining: 100,
        quotaTotal: 100,
      },
    ],
    isOpenOnlineRegistration: true,
    price: 450000,
    priceLabel: "Rp 450.000 / Pasukan",
    quotaTotal: 60,
    quotaRemaining: 60,
    categoryOptions: ["Tingkat SMP/MTs", "Tingkat SMA/SMK/MA", "Kategori Purna / Umum"],
    facilities: [
      "Rekap Nilai Real-Time Cetas.Score",
      "E-Sertifikat Ber-QR Resmi",
      "Piala Bergilir & Uang Pembinaan",
      "ID Card Kontingen & Pelatih",
    ],
    lkbbTeams: [
      {
        id: "team-01",
        number: "01",
        school: "Kontingen Peserta 01 (Menunggu Tampil)",
        teamName: "Pasukan Garuda Muda",
        level: "SMA",
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      },
      {
        id: "team-02",
        number: "02",
        school: "Kontingen Peserta 02 (Menunggu Tampil)",
        teamName: "Pasukan Rajawali Sakti",
        level: "SMA",
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      },
      {
        id: "team-03",
        number: "03",
        school: "Kontingen Peserta 03 (Menunggu Tampil)",
        teamName: "Pasukan Nusantara Jaya",
        level: "SMP",
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      },
    ],
  },
  {
    id: "ev-patriot-cup-2026",
    slug: "festival-paskibra-patriot-cup-2026",
    title: "Festival LKBB Patriot Cup Nasional 2026",
    organizer: "Divisi Event & Kompetisi CETAS",
    category: "KOMPETISI NASIONAL",
    themePreset: "FLAME",
    date: "2026-12-06",
    time: "07:30 - 17:30 WIB",
    location: "Hall Basket & Indoor Stadium Jakarta",
    locationType: "HYBRID",
    bannerUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85",
    description:
      "Turnamen baris-berbaris dan kreasi formasi tingkat pelajar se-Jabodetabek & Nasional. Terbuka untuk pembelian tiket penonton (Cetas Ticketing), dukungan pleton terfavorit (Cetas Vote), dan pantauan skor langsung.",
    status: "PUBLISHED",
    isOpenTicketing: true,
    tiers: [
      {
        id: "tier-patriot-reg",
        name: "Daily Pass Penonton",
        price: 30000,
        quotaRemaining: 400,
        quotaTotal: 400,
      },
    ],
    isOpenOnlineRegistration: true,
    price: 500000,
    priceLabel: "Rp 500.000 / Pasukan",
    quotaTotal: 50,
    quotaRemaining: 50,
    categoryOptions: ["Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"],
    facilities: [
      "Lembar Nilai Digital Transparan",
      "E-Sertifikat Seluruh Anggota",
      "Akses Portal Pelatih",
    ],
    lkbbTeams: [
      {
        id: "team-p1",
        number: "01",
        school: "Kontingen Patriot 01 (Menunggu Tampil)",
        teamName: "Pleton Ksatria",
        level: "SMA",
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      },
      {
        id: "team-p2",
        number: "02",
        school: "Kontingen Patriot 02 (Menunggu Tampil)",
        teamName: "Pleton Srikandi",
        level: "SMP",
        pbbMurni: 0,
        variasiFormasi: 0,
        danton: 0,
        kostum: 0,
        penalty: 0,
        totalScore: 0,
        status: "BELUM_TAMPIL",
      },
    ],
  },
];

const EVENTS_STORAGE_KEY = "cetas_unified_events_v3";

export function getStoredEvents(): UnifiedEvent[] {
  if (typeof window === "undefined") return INITIAL_UNIFIED_EVENTS;
  try {
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
  } catch {}
}
