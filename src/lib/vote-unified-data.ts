import { EventThemePreset } from "./event-theme";

export interface VoteCandidate {
  id: string;
  eventId?: string;
  categoryId: string;
  candidateNumber: string; // e.g. "01", "02"
  name: string;
  institution: string; // e.g. SMPN 1 Jakarta, SMAN 3 Bandung, Purna 2024
  photoUrl: string;
  tagline: string;
  totalVotes: number;
}

export interface VoteCategory {
  id: string;
  eventId: string;
  title: string; // e.g. "Tingkat SMP", "Tingkat SMA", "Kategori Purna"
  description?: string;
  pricePerVote: number;
  candidates: VoteCandidate[];
}

export interface EventVotingConfig {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  bannerUrl: string;
  themePreset?: EventThemePreset;
  categories: VoteCategory[];
}

export const INITIAL_EVENT_VOTINGS: EventVotingConfig[] = [
  {
    eventId: "ev-268156",
    eventTitle: "LKBB CEMARA 2026",
    eventDate: "2026-11-28",
    bannerUrl: "/lkbb-cemara-2026.jpg",
    themePreset: "EMERALD",
    categories: [
      {
        id: "cat-ev-268156-smp",
        eventId: "ev-268156",
        title: "Tingkat SMP/MTs",
        description: "Pemilihan pleton terfavorit tingkat SMP/MTs",
        pricePerVote: 2000,
        candidates: [],
      },
      {
        id: "cat-ev-268156-sma",
        eventId: "ev-268156",
        title: "Tingkat SMA/SMK/MA",
        description: "Pemilihan pleton terfavorit tingkat SMA/SMK/MA",
        pricePerVote: 2000,
        candidates: [],
      },
    ],
  },
];

const VOTE_STORAGE_KEY = "cetas_event_votings_v4";

export function getStoredEventVotings(): EventVotingConfig[] {
  if (typeof window === "undefined") return INITIAL_EVENT_VOTINGS;
  try {
    // Purge legacy keys that may contain multi-MB base64 strings
    localStorage.removeItem("cetas_event_votings_v1");
    localStorage.removeItem("cetas_event_votings_v2");
    localStorage.removeItem("cetas_event_votings_v3");
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    if (!raw) return INITIAL_EVENT_VOTINGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_EVENT_VOTINGS;
  } catch {
    return INITIAL_EVENT_VOTINGS;
  }
}

export function saveStoredEventVotings(votings: EventVotingConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    // Avoid duplicating huge event banner base64 inside vote storage
    const compact = votings.map((v) => ({
      ...v,
      bannerUrl:
        v.bannerUrl && v.bannerUrl.length > 250000
          ? "/lkbb-cemara-2026.jpg"
          : v.bannerUrl,
    }));
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(compact));
  } catch {}
}
