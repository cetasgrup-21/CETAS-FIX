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

export interface SquadMemberItem {
  id?: string;
  name: string;
  role?: string; // e.g. "Danton", "Pasukan Saf 1", "Cadangan 1"
  nisnOrId?: string;
  isReserve?: boolean;
}

export interface SubmittedAttendeeDocument {
  ruleId: string; // ID prasyarat (e.g. "req-surat-sekolah")
  title: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  uploadedAt: string;
  status: "PENDING" | "VERIFIED" | "REVISION";
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
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

  // Skema Pembayaran Registrasi (Lunas / DP / Belum Bayar)
  paymentScheme?: "LUNAS" | "DP" | "FREE";
  paymentStatus?: "PAID" | "DP" | "UNPAID";
  registrationFeeTotal?: number;
  registrationFeePaid?: number;
  registrationFeeRemaining?: number;
  paymentProofUrl?: string;

  // Nomor Undian Hasil Technical Meeting (TM)
  tmLotteryNumber?: string;

  // Status Check-in Hari-H di DP 1
  checkedInDP1?: boolean;
  checkedInDP1At?: string;

  // 16 Anggota Pasukan + Cadangan (Lembar 2 E-Sertifikat)
  squadMembers?: SquadMemberItem[];

  // Piagam Prestasi Juara (diunggah manual oleh Admin CETAS jika meraih kejuaraan)
  championCertificateUrl?: string;
  championCertificateTitle?: string;
  championCertificateUploadedAt?: string;
  championCertificateUploadedBy?: string;

  // Berkas Prasyarat yang Diunggah oleh Kontingen / Pelatih
  submittedDocuments?: SubmittedAttendeeDocument[];
}

// Data awal registrasi bersih
export const INITIAL_REGISTRATION_EVENTS: EventRegistrationItem[] = [];

// Data awal peserta bersih
export const INITIAL_ATTENDEES: RegisteredAttendee[] = [];
