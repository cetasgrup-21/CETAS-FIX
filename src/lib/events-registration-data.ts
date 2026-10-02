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

// Initial Events List showcasing open vs closed online registration
export const INITIAL_REGISTRATION_EVENTS: EventRegistrationItem[] = [
  {
    id: "ev-workshop-ai",
    slug: "workshop-desain-uiux-genai",
    title: "Workshop Nasional: Desain UI/UX & Generative AI 2026",
    organizer: "Cetas Tech x Google Developer Community",
    category: "WORKSHOP",
    isOpenOnlineRegistration: true,
    statusNote: "🟢 Pendaftaran Online Dibuka",
    date: "15 November 2026",
    time: "09:00 - 16:30 WIB",
    location: "Jakarta Creative Hub (Lt. 4) & Live Stream",
    locationType: "HYBRID",
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
    bannerUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    description:
      "Pelajari workflow desain modern memadukan Figma dengan Generative AI prompts untuk pembuatan prototype kilat, design system otomatis, dan user testing cerdas.",
    facilities: [
      "E-Certificate Resmi Terverifikasi Cetas",
      "Akses Rekaman Video & File Figma Modul",
      "Snack, Coffee Break & Lunch Box (Peserta Onsite)",
      "Digital Attendee E-Badge QR Gate Access",
    ],
    requirements: [
      "Membawa laptop pribadi dengan browser modern & akun Figma aktif",
      "Hadir tepat waktu sebelum pintu gerbang registrasi ditutup (08:45 WIB)",
      "Menunjukkan QR Code E-Badge saat verifikasi gatekeeper",
    ],
  },
  {
    id: "ev-hackathon-2026",
    slug: "cetas-national-hackathon-2026",
    title: "Cetas National Tech Hackathon 2026",
    organizer: "Cetas Ecosystem & BEM Fasilkom",
    category: "HACKATHON",
    isOpenOnlineRegistration: true,
    statusNote: "🟢 Pendaftaran Online Dibuka (Sisa 8 Tim)",
    date: "28 - 29 November 2026",
    time: "48 Jam Non-stop (Mulai 08:00 WIB)",
    location: "Indonesia Convention Exhibition (ICE) BSD City",
    locationType: "OFFLINE",
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
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    description:
      "Kompetisi rekayasa perangkat lunak 48 jam bertema 'Inovasi Digital untuk Masa Depan Indonesia'. Hadiah total Rp 50.000.000 + pendanaan inkubator Cetas Ventures.",
    facilities: [
      "Total Hadiah Rp 50.000.000 + Piala Cetas Innovation",
      "Akomodasi, Ruang Istirahat & Konsumsi 48 Jam Penuh",
      "Cloud Hosting Credit senilai $500/tim",
      "Exclusive Hackathon Hoodie & Attendee Pass",
    ],
    requirements: [
      "Maksimal 5 orang per tim (atau daftar solo untuk matchmaking)",
      "Semua kode program dibuat selama rentang waktu hackathon (open source)",
      "Wajib submit pitching deck dan demo aplikasi yang fungsional",
    ],
  },
  {
    id: "ev-volunteer-fest",
    slug: "volunteer-cetas-peduli-budaya",
    title: "Volunteer Festival Seni Cetas Peduli 2026",
    organizer: "Komunitas Budaya Nusantara & Cetas Kita",
    category: "VOLUNTEER",
    isOpenOnlineRegistration: true,
    statusNote: "🟢 Pendaftaran Relawan Dibuka",
    date: "5 - 6 Desember 2026",
    time: "07:00 - 22:00 WIB",
    location: "Area Terbuka Lapangan Banteng, Jakarta Pusat",
    locationType: "OFFLINE",
    price: 0,
    priceLabel: "Gratis (Terbuka untuk Relawan)",
    quotaTotal: 100,
    quotaRemaining: 25,
    categoryOptions: [
      "Divisi Stage & Show Management",
      "Divisi Ticketing & Gate Scanner",
      "Divisi Dokumentasi, Medsos & Live Stream",
      "Divisi Logistik, Sound & Lighting Crew",
      "Divisi Hospitality & Artist Liaison",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    description:
      "Gabung sebagai relawan resmi festival seni dan musik tradisional-kontemporer terbesar tahun ini. Dapatkan relasi luas dan pengalaman produksi panggung profesional.",
    facilities: [
      "Kaos Official Crew & Lanyard ID Card",
      "Uang Transport / Saku Harian & Konsumsi Lengkap",
      "Sertifikat Pengabdian Nasional dari Kemendikbud-Ristek",
      "Akses Backstage All-Access Festival",
    ],
    requirements: [
      "Berusia minimal 17 tahun dan sehat jasmani/rohani",
      "Bersedia mengikuti briefing teknis 1 hari sebelum acara",
      "Memiliki komitmen waktu penuh selama 2 hari penyelenggaraan festival",
    ],
  },
  {
    id: "ev-indie-concert",
    slug: "cetas-night-indie-fest",
    title: "Konser Musik Indie Fest Cetas Night 2026",
    organizer: "Nada Kita Entertainment",
    category: "CONCERT",
    isOpenOnlineRegistration: false, // TIDAK BUKA PENDAFTARAN ONLINE (KHUSUS TIKETING BERBAYAR)
    statusNote: "🔴 Khusus Tiket Masuk Berbayar (Tidak Buka Pendaftaran Online)",
    date: "20 Desember 2026",
    time: "15:00 - 23:00 WIB",
    location: "Senayan Park (SPARK), Jakarta",
    locationType: "OFFLINE",
    price: 150000,
    priceLabel: "Mulai Rp 150.000 (Via Cetas Ticketing)",
    quotaTotal: 2000,
    quotaRemaining: 0,
    categoryOptions: [],
    bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    description:
      "Pertunjukan panggung megah musisi indie papan atas Indonesia dengan tata suara dan lighting Cetas Production 50.000 Watt. Pendaftaran peserta online TIDAK TERSEDIA; pengunjung wajib memiliki tiket resmi dari Cetas Ticketing.",
    facilities: [
      "Akses Area Festival Stage",
      "Wristband Masuk Resmi",
    ],
    requirements: [
      "Wajib membeli tiket melalui menu Cetas Ticketing",
      "Bukan pendaftaran peserta gratis atau open submission",
    ],
  },
  {
    id: "ev-duta-pariwisata",
    slug: "pemilihan-duta-pariwisata-2026",
    title: "Audisi Terbuka Duta Pariwisata & Budaya 2026",
    organizer: "Dinas Pemuda & Olahraga Bersama Cetas Vote",
    category: "SEMINAR",
    isOpenOnlineRegistration: false, // SEGERA DIBUKA / TAHAP REVIEW
    statusNote: "🟡 Pendaftaran Dibuka Mulai 15 Oktober 2026",
    date: "15 - 18 Oktober 2026",
    time: "08:30 - 17:00 WIB",
    location: "Balai Kartini Convention Hall",
    locationType: "OFFLINE",
    price: 0,
    priceLabel: "Gratis (Seleksi Berkas)",
    quotaTotal: 150,
    quotaRemaining: 150,
    categoryOptions: [
      "Kategori Putra (18-25 Tahun)",
      "Kategori Putri (18-25 Tahun)",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    description:
      "Ajang pemilihan putra-putri terbaik daerah untuk menjadi duta promosi wisata nasional. Menggunakan sistem voting terpadu Cetas Vote.",
    facilities: [
      "Pelatihan Public Speaking & Catwalk",
      "Sertifikat Finalis Provinsi",
      "Liputan Media Nasional",
    ],
    requirements: [
      "Menunggu pembukaan pendaftaran resmi tanggal 15 Oktober 2026",
      "KTP asli dan surat rekomendasi sekolah/kampus",
    ],
  },
];

// Initial attendees list for demonstration in both user E-Badge and Admin backoffice
export const INITIAL_ATTENDEES: RegisteredAttendee[] = [
  {
    id: "atd-01",
    badgeCode: "CETAS-ATD-2026-10021",
    eventId: "ev-workshop-ai",
    eventName: "Workshop Nasional: Desain UI/UX & Generative AI 2026",
    fullName: "Ahmad Rizky Pratama",
    email: "rizky.pratama@gmail.com",
    phone: "081288992233",
    institution: "Universitas Indonesia",
    category: "Mahasiswa / Pelajar Aktif",
    notes: "Ingin mendalami integrasi Figma AI plugin",
    qrPayload: "CETAS-ATD-2026-10021|Workshop Nasional: Desain UI/UX|Ahmad Rizky Pratama|CONFIRMED",
    registeredAt: "2026-10-02T09:20:00.000Z",
    isPresent: true,
    status: "CONFIRMED",
  },
  {
    id: "atd-02",
    badgeCode: "CETAS-ATD-2026-10022",
    eventId: "ev-workshop-ai",
    eventName: "Workshop Nasional: Desain UI/UX & Generative AI 2026",
    fullName: "Sarah Wulandari",
    email: "sarah.wulan@techcorp.co.id",
    phone: "081377889900",
    institution: "PT Digital Kreasi Indonesia",
    category: "Praktisi / UI/UX Designer Profesional",
    notes: "Mencari insight otomasi design system",
    qrPayload: "CETAS-ATD-2026-10022|Workshop Nasional: Desain UI/UX|Sarah Wulandari|CONFIRMED",
    registeredAt: "2026-10-02T10:15:00.000Z",
    isPresent: false,
    status: "CONFIRMED",
  },
  {
    id: "atd-03",
    badgeCode: "CETAS-ATD-2026-20045",
    eventId: "ev-hackathon-2026",
    eventName: "Cetas National Tech Hackathon 2026",
    fullName: "Bagus Setiawan (Ketua Tim CodeCraft)",
    email: "bagus.codecraft@itb.ac.id",
    phone: "085712345678",
    institution: "Institut Teknologi Bandung",
    category: "Tim Pengembang Mahasiswa (3 - 5 Orang)",
    notes: "Proyek AI untuk pemilahan sampah pintar di pemukiman",
    qrPayload: "CETAS-ATD-2026-20045|Cetas National Hackathon|Bagus Setiawan|CONFIRMED",
    registeredAt: "2026-10-01T14:40:00.000Z",
    isPresent: true,
    status: "CONFIRMED",
  },
  {
    id: "atd-04",
    badgeCode: "CETAS-ATD-2026-30089",
    eventId: "ev-volunteer-fest",
    eventName: "Volunteer Festival Seni Cetas Peduli 2026",
    fullName: "Nadia Anggraeni",
    email: "nadia.anggra@gmail.com",
    phone: "081922334455",
    institution: "Komunitas Seni Rupa Muda",
    category: "Divisi Stage & Show Management",
    notes: "Pengalaman 2 tahun sebagai stage manager konser kampus",
    qrPayload: "CETAS-ATD-2026-30089|Volunteer Festival Cetas|Nadia Anggraeni|CONFIRMED",
    registeredAt: "2026-10-02T08:10:00.000Z",
    isPresent: false,
    status: "CONFIRMED",
  },
];
