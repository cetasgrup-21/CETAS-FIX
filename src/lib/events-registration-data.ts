export interface EventRegistrationItem {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  category: "WORKSHOP" | "HACKATHON" | "VOLUNTEER" | "SEMINAR" | "CONCERT";
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
  bannerUrl: string;
  description: string;
  facilities: string[];
  requirements: string[];
}

export interface RegisteredAttendee {
  id: string;
  badgeCode: string; // e.g. CETAS-ATD-2026-98124
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  notes?: string;
  portfolioUrl?: string;
  qrPayload: string;
  registeredAt: string;
  isPresent: boolean;
  status: "CONFIRMED" | "WAITLIST" | "CANCELLED";
}

// Data awal registrasi bersih (Fresh Clean State untuk pengembangan)
export const INITIAL_REGISTRATION_EVENTS: EventRegistrationItem[] = [];

// Data awal peserta bersih (Fresh Clean State untuk pengembangan)
export const INITIAL_ATTENDEES: RegisteredAttendee[] = [];
