import { EventThemePreset } from "./event-theme";

export interface VoteCandidate {
  id: string;
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
    eventId: "ev-lkbb-cetas-2026",
    eventTitle: "LKBB CETAS Championship Series 2026",
    eventDate: "15 November 2026",
    bannerUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
    themePreset: "SAPPHIRE",
    categories: [
      {
        id: "cat-lkbb-sma",
        eventId: "ev-lkbb-cetas-2026",
        title: "Juara Favorit Tingkat SMA/SMK/MA",
        description: "Pemilihan pleton terfavorit tingkat SMA/SMK/MA pilihan publik.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-lkbb-01",
            categoryId: "cat-lkbb-sma",
            candidateNumber: "01",
            name: "Pasukan Garuda Muda",
            institution: "Kontingen Peserta Nomor Urut 01",
            photoUrl:
              "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80",
            tagline: "Disiplin, Tangguh, dan Berprestasi di Arena LKBB CETAS.",
            totalVotes: 0,
          },
          {
            id: "cand-lkbb-02",
            categoryId: "cat-lkbb-sma",
            candidateNumber: "02",
            name: "Pasukan Rajawali Sakti",
            institution: "Kontingen Peserta Nomor Urut 02",
            photoUrl:
              "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
            tagline: "Satu Komando, Satu Derap Langkah Menuju Juara Umum.",
            totalVotes: 0,
          },
        ],
      },
      {
        id: "cat-lkbb-smp",
        eventId: "ev-lkbb-cetas-2026",
        title: "Juara Favorit Tingkat SMP/MTs",
        description: "Pemilihan pleton terfavorit tingkat SMP/MTs pilihan publik.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-lkbb-03",
            categoryId: "cat-lkbb-smp",
            candidateNumber: "03",
            name: "Pasukan Nusantara Jaya",
            institution: "Kontingen Peserta Nomor Urut 03",
            photoUrl:
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
            tagline: "Semangat Tunas Muda Paskibra Indonesia.",
            totalVotes: 0,
          },
        ],
      },
      {
        id: "cat-lkbb-purna",
        eventId: "ev-lkbb-cetas-2026",
        title: "Kategori Purna / Umum",
        description: "Pemilihan pleton terfavorit kategori Purna & Umum.",
        pricePerVote: 2000,
        candidates: [],
      },
    ],
  },
  {
    eventId: "ev-patriot-cup-2026",
    eventTitle: "Festival LKBB Patriot Cup Nasional 2026",
    eventDate: "06 Desember 2026",
    bannerUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85",
    themePreset: "FLAME",
    categories: [
      {
        id: "cat-patriot-sma",
        eventId: "ev-patriot-cup-2026",
        title: "Tingkat SMA/SMK/MA",
        description: "Voting pleton favorit Patriot Cup tingkat SMA/SMK/MA.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-patriot-01",
            categoryId: "cat-patriot-sma",
            candidateNumber: "01",
            name: "Pleton Ksatria",
            institution: "Kontingen Patriot 01",
            photoUrl:
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
            tagline: "Ksatria Muda Berjiwa Juara.",
            totalVotes: 0,
          },
        ],
      },
      {
        id: "cat-patriot-smp",
        eventId: "ev-patriot-cup-2026",
        title: "Tingkat SMP/MTs",
        description: "Voting pleton favorit Patriot Cup tingkat SMP/MTs.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-patriot-02",
            categoryId: "cat-patriot-smp",
            candidateNumber: "02",
            name: "Pleton Srikandi",
            institution: "Kontingen Patriot 02",
            photoUrl:
              "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
            tagline: "Derap Langkah Anggun & Tegas.",
            totalVotes: 0,
          },
        ],
      },
    ],
  },
];

const VOTE_STORAGE_KEY = "cetas_event_votings_v3";

export function getStoredEventVotings(): EventVotingConfig[] {
  if (typeof window === "undefined") return INITIAL_EVENT_VOTINGS;
  try {
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
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votings));
  } catch {}
}
