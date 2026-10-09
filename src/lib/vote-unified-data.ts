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

// Data awal bilik voting bersih (Fresh Clean State untuk pengembangan)
export const INITIAL_EVENT_VOTINGS: EventVotingConfig[] = [];
