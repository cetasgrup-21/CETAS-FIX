import { EventThemePreset } from "./event-theme";

export interface VoteCandidate {
  id: string;
  eventId?: string;
  categoryId: string;
  candidateNumber: string; // e.g. "01", "02"
  name: string;
  institution: string; // e.g. SDN 1 Jakarta, SMPN 1 Jakarta, SMAN 3 Bandung
  photoUrl: string;
  tagline: string;
  totalVotes: number;
}

export interface VoteCategory {
  id: string;
  eventId: string;
  title: string; // e.g. "Tingkat SD/MI", "Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"
  description?: string;
  pricePerVote: number;
  candidates: VoteCandidate[];
}

export interface EventVotingConfig {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  bannerUrl: string;
  mascotUrl?: string;
  themePreset?: EventThemePreset;
  categories: VoteCategory[];
}

export const INITIAL_EVENT_VOTINGS: EventVotingConfig[] = [];

const VOTE_STORAGE_KEY = "cetas_event_votings_v7";

export function getStoredEventVotings(): EventVotingConfig[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("cetas_event_votings_v1");
    localStorage.removeItem("cetas_event_votings_v2");
    localStorage.removeItem("cetas_event_votings_v3");
    localStorage.removeItem("cetas_event_votings_v4");
    localStorage.removeItem("cetas_event_votings_v5");
    localStorage.removeItem("cetas_event_votings_v6");
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveStoredEventVotings(votings: EventVotingConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votings));
  } catch {}
}
