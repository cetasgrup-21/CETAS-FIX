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

export const INITIAL_UNIFIED_EVENTS: UnifiedEvent[] = [
  {
    id: "ev-01",
    slug: "cetas-soundfest-2026",
    title: "Cetas SoundFest 2026: Live Music & Creative Carnival",
    organizer: "Nada Kita Entertainment x Cetas Production",
    category: "CONCERT",
    themePreset: "CYBER",
    date: "2026-11-20",
    time: "15:00 - 23:00 WIB",
    location: "Stadion Madya GBK, Senayan, Jakarta",
    locationType: "OFFLINE",
    bannerUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    description:
      "Konser musik spektakuler yang menampilkan 12 musisi papan atas Indonesia dengan tata panggung 50.000W dan lighting show dari Cetas Production.",
    status: "PUBLISHED",
    isOpenTicketing: true,
    tiers: [
      { id: "tier-01", name: "Festival Early Bird", price: 150000, quotaRemaining: 18, quotaTotal: 200 },
      { id: "tier-02", name: "Festival Regular", price: 250000, quotaRemaining: 340, quotaTotal: 500 },
      { id: "tier-03", name: "VIP Lounge (Front Row + Merch)", price: 650000, quotaRemaining: 42, quotaTotal: 100 },
    ],
    isOpenOnlineRegistration: false,
    price: 150000,
    priceLabel: "Mulai Rp 150.000 (Tiket Masuk)",
    quotaTotal: 2000,
    quotaRemaining: 0,
    categoryOptions: [],
    facilities: ["Akses Stage Utama", "Wristband Gate Resmi"],
  },
  {
    id: "ev-02",
    slug: "workshop-desain-uiux-genai",
    title: "Workshop Nasional: Desain UI/UX & Generative AI 2026",
    organizer: "Cetas Tech x Google Developer Community",
    category: "WORKSHOP",
    themePreset: "SAPPHIRE",
    date: "2026-11-15",
    time: "09:00 - 16:30 WIB",
    location: "Jakarta Creative Hub (Lt. 4) & Live Stream",
    locationType: "HYBRID",
    bannerUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    description:
      "Pelajari workflow desain modern memadukan Figma dengan Generative AI prompts untuk pembuatan prototype kilat, design system otomatis, dan user testing cerdas.",
    status: "PUBLISHED",
    isOpenTicketing: true,
    tiers: [
      { id: "tier-04", name: "Online Streaming Pass", price: 50000, quotaRemaining: 210, quotaTotal: 500 },
      { id: "tier-05", name: "Offline All Access + Goodie Bag", price: 120000, quotaRemaining: 65, quotaTotal: 150 },
    ],
    isOpenOnlineRegistration: true,
    price: 0,
    priceLabel: "Gratis (Didanai Cetas Kita)",
    quotaTotal: 200,
    quotaRemaining: 48,
    categoryOptions: [
      "Mahasiswa / Pelajar Aktif",
      "Praktisi / UI/UX Designer Profesional",
      "Delegasi Kampus / Komunitas",
      "Masyarakat Umum",
    ],
    facilities: [
      "E-Certificate Resmi Terverifikasi Cetas",
      "Akses Rekaman Video & File Figma Modul",
      "Snack & Coffee Break",
      "Digital Attendee E-Badge QR Gate",
    ],
  },
  {
    id: "ev-03",
    slug: "cetas-national-hackathon-2026",
    title: "Cetas National Tech Hackathon 2026",
    organizer: "Cetas Ecosystem & BEM Fasilkom",
    category: "HACKATHON",
    themePreset: "EMERALD",
    date: "2026-11-28",
    time: "48 Jam Non-stop (Mulai 08:00 WIB)",
    location: "Indonesia Convention Exhibition (ICE) BSD City",
    locationType: "OFFLINE",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    description:
      "Kompetisi rekayasa perangkat lunak 48 jam bertema 'Inovasi Digital untuk Masa Depan'. Hadiah total Rp 50.000.000 + pendanaan inkubasi Cetas Ventures.",
    status: "PUBLISHED",
    isOpenTicketing: false,
    tiers: [],
    isOpenOnlineRegistration: true,
    price: 0,
    priceLabel: "Gratis (Seleksi Proposal Tim)",
    quotaTotal: 50,
    quotaRemaining: 8,
    categoryOptions: [
      "Tim Pengembang Mahasiswa (3 - 5 Orang)",
      "Tim Startup / Umum (3 - 5 Orang)",
      "Solo Developer / AI Engineer",
      "UI/UX & Product Specialist",
    ],
    facilities: [
      "Total Hadiah Rp 50.000.000",
      "Akomodasi & Konsumsi 48 Jam",
      "Cloud Hosting Credit $500/tim",
      "Exclusive Hackathon Hoodie & Pass",
    ],
  },
  {
    id: "ev-04",
    slug: "volunteer-cetas-peduli-budaya",
    title: "Volunteer Festival Seni Cetas Peduli 2026",
    organizer: "Komunitas Budaya Nusantara & Cetas Kita",
    category: "VOLUNTEER",
    date: "2026-12-05",
    time: "07:00 - 22:00 WIB",
    location: "Area Terbuka Lapangan Banteng, Jakarta Pusat",
    locationType: "OFFLINE",
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    description:
      "Gabung sebagai relawan resmi festival seni dan musik tradisional-kontemporer terbesar tahun ini. Dapatkan relasi luas dan pengalaman produksi panggung profesional.",
    status: "PUBLISHED",
    isOpenTicketing: false,
    tiers: [],
    isOpenOnlineRegistration: true,
    price: 0,
    priceLabel: "Gratis (Terbuka untuk Relawan)",
    quotaTotal: 100,
    quotaRemaining: 25,
    categoryOptions: [
      "Divisi Stage & Show Management",
      "Divisi Ticketing & Gate Scanner",
      "Divisi Dokumentasi & Live Stream",
      "Divisi Logistik, Sound & Crew",
    ],
    facilities: [
      "Kaos Official Crew & Lanyard ID",
      "Uang Transport & Konsumsi",
      "Sertifikat Pengabdian Nasional",
      "Akses All-Area Festival",
    ],
  },
];
