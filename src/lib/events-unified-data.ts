import { EventThemePreset } from "./event-theme";

export interface UnifiedTicketTier {
  id: string;
  name: string;
  price: number;
  quotaRemaining: number;
  quotaTotal: number;
  benefits?: string[];
}

export interface RegistrationCategoryQuota {
  id: string;
  name: string; // e.g. "Tingkat SD/MI", "Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"
  code: string; // "SD" | "SMP" | "SMA" | "PURNA" | custom code
  quotaTotal: number;
  quotaRemaining: number;
}

export interface LKBBTeamScore {
  id: string;
  number: string;
  school: string;
  teamName: string;
  level: string; // "SD" | "SMP" | "SMA" | "PURNA" | custom code
  categoryName?: string;
  pbbMurni: number;
  variasiFormasi: number;
  danton: number;
  kostum: number;
  penalty: number;
  totalScore: number;
  status: "BELUM_TAMPIL" | "SEDANG_DINILAI" | "TERVERIFIKASI";
}

export interface CertificateSignerConfig {
  role: string; // e.g. "Ketua Dewan Juri"
  name: string; // e.g. "M. Rian Arifin, S.Pd., M.Han"
  nipOrId?: string; // e.g. "NIP. 19880412 201101 1 003"
  signatureUrl?: string; // scan/image TTD, atau kosong untuk kaligrafi resmi
}

export interface EventOfficialDocument {
  id: string; // e.g. "doc-juknis", "doc-undangan", "doc-form-peserta", "doc-form-foto"
  title: string; // e.g. "Petunjuk Teknis (Juknis) Pelaksanaan LKBB"
  description?: string;
  fileUrl: string; // Data URL base64 atau path berkas
  fileName?: string;
  fileType?: "PDF" | "DOCX" | "XLSX" | "IMAGE" | "OTHER";
  fileSize?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EventPrerequisiteRule {
  id: string; // e.g. "req-surat-sekolah", "req-bukti-bayar"
  title: string;
  description?: string;
  isRequired: boolean;
  allowedFormats?: string; // e.g. "PDF, PNG, JPG"
}

export interface EventCertificateConfig {
  eventHeading?: string; // e.g. "LKBB BARAVOS 2026" atau custom header teks pita emas
  certificateNumberFormat?: string; // e.g. "042/CETAS-LKBB/{YEAR}"
  issueCity?: string; // e.g. "Jakarta"
  issueDate?: string; // e.g. "30 Oktober 2026"
  institutionName?: string; // e.g. "Centralized Electronic Tournament & Award System"
  signer1?: CertificateSignerConfig; // Penyelenggara / Ketua Panitia
  signer2?: CertificateSignerConfig; // Ketua Dewan Juri
  stampUrl?: string; // Stempel panitia / stempel bulat cetas
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

  // Fitur Pendaftaran Peserta Online Web Cetas (Per Kategori & Kuota Custom)
  isOpenOnlineRegistration: boolean;
  price: number; // 0 = Gratis
  priceLabel: string;
  allowDownPayment?: boolean; // Mengizinkan pembayaran bertahap (Down Payment)
  minDownPaymentAmount?: number; // Minimal transfer DP (e.g. 200000)
  quotaTotal: number;
  quotaRemaining: number;
  categoryOptions: string[];
  registrationCategories?: RegistrationCategoryQuota[];
  facilities: string[];

  // Publikasi Nilai Final ke Pelatih (Bukan Real-time)
  isScorePublishedToCoaches?: boolean;
  scorePublishedAt?: string;
  scorePublishedBy?: string;

  // Konfigurasi Nama & TTD E-Sertifikat
  certificateConfig?: EventCertificateConfig;

  // Manajemen Berkas Resmi Event (Juknis, Undangan, Form List Peserta, Form Foto)
  officialDocuments?: EventOfficialDocument[];

  // Aturan Prasyarat Berkas yang Wajib Diunggah Peserta
  prerequisiteRules?: EventPrerequisiteRule[];

  // Data Peserta & Peringkat LKBB (Cetas.Score)
  lkbbTeams?: LKBBTeamScore[];
  updatedAt?: number;

  // Maskot Resmi Event
  mascotUrl?: string;
}

export interface MascotOption {
  id: string;
  name: string;
  url: string;
  tagline: string;
}

export const CETAS_MASCOT_PRESETS: MascotOption[] = [
  {
    id: "ceti-transparent",
    name: "Ceti (Maskot Resmi Transparan)",
    url: "/mascot/ceti_transparent.png",
    tagline: "Robot semut cerdas ikonik CETAS dengan latar transparan resmi",
  },
  {
    id: "ceti-classic",
    name: "Ceti Original",
    url: "/mascot/ceti.png",
    tagline: "Pose standar Ceti CETAS Official",
  },
  {
    id: "cetas-ant-thumbsup",
    name: "Cetas Ant (Jempol Juara)",
    url: "/mascot/cetas_ant_thumbsup.png",
    tagline: "Semut juara memberi acungan jempol",
  },
];

export const DEFAULT_MASCOT_URL = "/mascot/ceti_transparent.png";

export function normalizeCategoryLevelCode(rawName: string): string {
  const s = String(rawName || "").toUpperCase().trim();
  if (/\b(SD|MI)\b/.test(s) || s.includes("SD/") || s.includes("SD ")) return "SD";
  if (/\b(SMP|MTS)\b/.test(s) || s.includes("SMP/") || s.includes("SMP ")) return "SMP";
  if (/\b(SMA|SMK|MA)\b/.test(s) || s.includes("SMA/") || s.includes("SMA ")) return "SMA";
  if (/\b(PURNA|UMUM|CLUB|MAHASISWA|INSTANSI)\b/.test(s)) return "PURNA";
  const cleaned = s.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "UMUM";
}

export function getEffectiveRegistrationCategories(
  event: Partial<UnifiedEvent>
): RegistrationCategoryQuota[] {
  if (
    Array.isArray(event.registrationCategories) &&
    event.registrationCategories.length > 0
  ) {
    return event.registrationCategories.map((cat, idx) => ({
      id: cat.id || `reg-cat-${idx + 1}`,
      name: cat.name || `Kategori ${idx + 1}`,
      code: cat.code || normalizeCategoryLevelCode(cat.name || ""),
      quotaTotal: Math.max(1, Number(cat.quotaTotal) || 35),
      quotaRemaining:
        cat.quotaRemaining !== undefined
          ? Math.max(0, Number(cat.quotaRemaining))
          : Math.max(1, Number(cat.quotaTotal) || 35),
    }));
  }

  const options =
    Array.isArray(event.categoryOptions) && event.categoryOptions.length > 0
      ? event.categoryOptions
      : ["Tingkat SD/MI", "Tingkat SMP/MTs", "Tingkat SMA/SMK/MA"];

  const totalQuota = Number(event.quotaTotal) || 100;
  const remQuota =
    event.quotaRemaining !== undefined ? Number(event.quotaRemaining) : totalQuota;
  const perCatTotal = Math.max(10, Math.floor(totalQuota / options.length));
  const perCatRem = Math.max(0, Math.floor(remQuota / options.length));

  return options.map((name, idx) => {
    const isLast = idx === options.length - 1;
    const catTotal = isLast
      ? Math.max(1, totalQuota - perCatTotal * (options.length - 1))
      : perCatTotal;
    const catRem = isLast
      ? Math.max(0, remQuota - perCatRem * (options.length - 1))
      : perCatRem;
    return {
      id: `reg-cat-${event.id || "ev"}-${idx + 1}`,
      name,
      code: normalizeCategoryLevelCode(name),
      quotaTotal: catTotal,
      quotaRemaining: Math.min(catTotal, catRem),
    };
  });
}

export const INITIAL_UNIFIED_EVENTS: UnifiedEvent[] = [];

const EVENTS_STORAGE_KEY = "cetas_unified_events_v7";

export function getStoredEvents(): UnifiedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("cetas_unified_events_v1");
    localStorage.removeItem("cetas_unified_events_v2");
    localStorage.removeItem("cetas_unified_events_v3");
    localStorage.removeItem("cetas_unified_events_v4");
    localStorage.removeItem("cetas_unified_events_v5");
    localStorage.removeItem("cetas_unified_events_v6");
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveStoredEvents(events: UnifiedEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn("[saveStoredEvents] localStorage quota warning:", err);
  }
}

export function mergeEventsWithLocal(
  serverEvents: UnifiedEvent[],
  localEvents: UnifiedEvent[]
): UnifiedEvent[] {
  if (!Array.isArray(localEvents) || localEvents.length === 0) {
    return serverEvents;
  }
  const localMap = new Map(localEvents.map((e) => [e.id, e]));
  const merged = serverEvents.map((srv) => {
    const loc = localMap.get(srv.id);
    if (!loc) return srv;
    const locTime = Number(loc.updatedAt) || 0;
    const srvTime = Number(srv.updatedAt) || 0;
    const effectiveBanner =
      loc.bannerUrl && loc.bannerUrl !== "/lkbb-cemara-2026.jpg"
        ? loc.bannerUrl
        : srv.bannerUrl || loc.bannerUrl || "";

    if (locTime >= srvTime) {
      return {
        ...srv,
        ...loc,
        bannerUrl: effectiveBanner,
        // Sisa kuota dan kategori tiket harus selalu merujuk pada data resmi dari server database
        tiers:
          Array.isArray(srv.tiers) && srv.tiers.length > 0
            ? srv.tiers
            : (Array.isArray(loc.tiers) && loc.tiers.length > 0 ? loc.tiers : srv.tiers),
        registrationCategories:
          Array.isArray(loc.registrationCategories) &&
          loc.registrationCategories.length > 0
            ? loc.registrationCategories
            : srv.registrationCategories,
        lkbbTeams:
          Array.isArray(srv.lkbbTeams)
            ? srv.lkbbTeams
            : (Array.isArray(loc.lkbbTeams) ? loc.lkbbTeams : []),
        mascotUrl: loc.mascotUrl || srv.mascotUrl || DEFAULT_MASCOT_URL,
        officialDocuments:
          Array.isArray(loc.officialDocuments) && loc.officialDocuments.length > 0
            ? loc.officialDocuments
            : srv.officialDocuments,
        prerequisiteRules:
          Array.isArray(loc.prerequisiteRules) && loc.prerequisiteRules.length > 0
            ? loc.prerequisiteRules
            : srv.prerequisiteRules,
      };
    }
    return {
      ...srv,
      bannerUrl: effectiveBanner,
      tiers:
        Array.isArray(srv.tiers) && srv.tiers.length > 0
          ? srv.tiers
          : (Array.isArray(loc.tiers) && loc.tiers.length > 0 ? loc.tiers : srv.tiers),
      registrationCategories:
        Array.isArray(srv.registrationCategories) && srv.registrationCategories.length > 0
          ? srv.registrationCategories
          : loc.registrationCategories,
      mascotUrl: srv.mascotUrl || loc?.mascotUrl || DEFAULT_MASCOT_URL,
      officialDocuments:
        Array.isArray(srv.officialDocuments) && srv.officialDocuments.length > 0
          ? srv.officialDocuments
          : loc?.officialDocuments,
      prerequisiteRules:
        Array.isArray(srv.prerequisiteRules) && srv.prerequisiteRules.length > 0
          ? srv.prerequisiteRules
          : loc?.prerequisiteRules,
    };
  });

  return merged;
}

export function getDefaultOfficialDocuments(): EventOfficialDocument[] {
  return [
    {
      id: "doc-juknis",
      title: "Petunjuk Teknis (Juknis) Resmi LKBB",
      description: "Materi teknis gerakan PBB murni, variasi formasi, ketentuan danton, ukuran arena 18x12m, dan tata tertib lomba.",
      fileUrl: "/docs/juknis-lkbb-2026.pdf",
      fileName: "Juknis-Resmi-LKBB-2026.pdf",
      fileType: "PDF",
      fileSize: "2.4 MB",
      updatedAt: "30 Oktober 2026",
    },
    {
      id: "doc-undangan",
      title: "Surat Undangan Sekolah & Izin Dispensasi",
      description: "Surat permohonan delegasi sekolah resmi dari panitia pelaksana untuk diajukan ke Kepala Sekolah & Dinas Pendidikan.",
      fileUrl: "/docs/surat-undangan-sekolah.pdf",
      fileName: "Surat-Undangan-Resmi-Sekolah-Dispensasi.pdf",
      fileType: "PDF",
      fileSize: "1.1 MB",
      updatedAt: "30 Oktober 2026",
    },
    {
      id: "doc-form-peserta",
      title: "Formulir List Susunan 16 Personel Pasukan",
      description: "Template daftar susunan 1 Danton, 15 Pasukan inti, dan 2 Personel Cadangan berserta NISN dan identitas.",
      fileUrl: "/docs/form-susunan-16-personel.xlsx",
      fileName: "Form-List-Susunan-16-Personel.xlsx",
      fileType: "XLSX",
      fileSize: "145 KB",
      updatedAt: "30 Oktober 2026",
    },
    {
      id: "doc-form-foto",
      title: "Formulir Pas Foto Personel & Danton",
      description: "Lembar format pas foto seragam 3x4 berwarna resmi kontingen untuk verifikasi fisik hari-H lomba.",
      fileUrl: "/docs/form-pas-foto-kontingen.docx",
      fileName: "Form-Pas-Foto-Kontingen-3x4.docx",
      fileType: "DOCX",
      fileSize: "220 KB",
      updatedAt: "30 Oktober 2026",
    },
  ];
}

export function getDefaultPrerequisiteRules(): EventPrerequisiteRule[] {
  return [
    {
      id: "req-surat-sekolah",
      title: "Surat Rekomendasi / Tugas Kepala Sekolah",
      description: "Surat izin resmi bertanda tangan basah Kepala Sekolah dan cap stempel basah institusi sekolah.",
      isRequired: true,
      allowedFormats: "PDF, PNG, JPG",
    },
    {
      id: "req-bukti-bayar",
      title: "Bukti Transfer / Pelunasan Biaya Registrasi",
      description: "Struk transfer ATM atau tangkapan layar m-banking pembayaran pendaftaran resmi kontingen.",
      isRequired: true,
      allowedFormats: "PDF, PNG, JPG",
    },
    {
      id: "req-form-peserta",
      title: "Formulir Susunan 16 Personel Terisi & Disahkan",
      description: "Upload form list susunan 16 personel dan cadangan yang sudah diisi lengkap dan dicap sekolah.",
      isRequired: true,
      allowedFormats: "PDF, DOCX, XLSX",
    },
    {
      id: "req-pas-foto",
      title: "Berkas Pas Foto Pasukan & Danton (3x4)",
      description: "Pas foto 3x4 berseragam resmi kontingen atau scan kartu pelajar seluruh anggota pasukan.",
      isRequired: true,
      allowedFormats: "PDF, PNG, JPG, ZIP",
    },
  ];
}

export function getEffectiveOfficialDocuments(event?: Partial<UnifiedEvent> | null): EventOfficialDocument[] {
  if (event?.officialDocuments && Array.isArray(event.officialDocuments) && event.officialDocuments.length > 0) {
    return event.officialDocuments;
  }
  return getDefaultOfficialDocuments();
}

export function getEffectivePrerequisiteRules(event?: Partial<UnifiedEvent> | null): EventPrerequisiteRule[] {
  if (event?.prerequisiteRules && Array.isArray(event.prerequisiteRules) && event.prerequisiteRules.length > 0) {
    return event.prerequisiteRules;
  }
  return getDefaultPrerequisiteRules();
}

