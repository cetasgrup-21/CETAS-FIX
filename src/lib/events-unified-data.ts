import { EventThemePreset } from "./event-theme";

export interface UnifiedTicketTier {
  id: string;
  name: string;
  price: number;
  quotaRemaining: number;
  quotaTotal: number;
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
}

// Data awal bersih (Fresh Clean State untuk pengembangan)
export const INITIAL_UNIFIED_EVENTS: UnifiedEvent[] = [];
