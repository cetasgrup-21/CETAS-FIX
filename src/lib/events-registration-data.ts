import { RegistrationCategoryQuota } from "./events-unified-data";

export interface EventRegistrationItem {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  category: string;
  isOpenOnlineRegistration: boolean; // Khusus event yang membuka fitur pendaftaran online di Cetas
  statusNote: string;
  date: string;
  time: string;
  location: string;
  locationType: "HYBRID" | "OFFLINE" | "ONLINE";
  price: number; // 0 = Gratis
  priceLabel: string;
  quotaTotal: number;
  quotaRemaining: number;
  categoryOptions: string[];
  registrationCategories?: RegistrationCategoryQuota[];
  bannerUrl: string;
  description: string;
  facilities: string[];
  requirements: string[];
  requiresPortfolio?: boolean;
}

export interface RegisteredAttendee {
  id: string;
  badgeCode: string; // e.g. CETAS-ATD-2026-98124
  candidateNumber?: string; // Nomor urut peserta otomatis di kategori tersebut (e.g. "01")
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  levelCode?: string; // "SD" | "SMP" | "SMA" | "PURNA"
  notes?: string;
  portfolioUrl?: string;
  qrPayload: string;
  registeredAt: string;
  isPresent: boolean;
  status: "CONFIRMED" | "WAITLIST" | "CANCELLED";
  coachName?: string;
  coachPhone?: string;
  dantonName?: string;
  teamMembersCount?: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

// Data awal registrasi bersih
export const INITIAL_REGISTRATION_EVENTS: EventRegistrationItem[] = [];

// Data awal peserta bersih
export const INITIAL_ATTENDEES: RegisteredAttendee[] = [];
