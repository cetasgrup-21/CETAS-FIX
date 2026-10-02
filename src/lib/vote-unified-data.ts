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
  categories: VoteCategory[];
}

export const INITIAL_EVENT_VOTINGS: EventVotingConfig[] = [
  {
    eventId: "ev-duta-2026",
    eventTitle: "Grand Final Pemilihan Duta Pelajar & Pemuda Cetas 2026",
    eventDate: "15 - 20 November 2026",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    categories: [
      {
        id: "cat-smp",
        eventId: "ev-duta-2026",
        title: "Tingkat SMP / MTs (Kategori Pelajar Muda)",
        description: "Pemilihan duta pelajar tingkat Sekolah Menengah Pertama se-Jabodetabek.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-smp-01",
            categoryId: "cat-smp",
            candidateNumber: "01",
            name: "Nadia Safira",
            institution: "SMP Negeri 1 Jakarta",
            photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            tagline: "Generasi muda berprestasi dan melek teknologi digital.",
            totalVotes: 1482,
          },
          {
            id: "cand-smp-02",
            categoryId: "cat-smp",
            candidateNumber: "02",
            name: "Rafi Alamsyah",
            institution: "MTs Negeri 3 Jakarta",
            photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
            tagline: "Menjunjung adab, etika, dan kepemimpinan pemuda masa depan.",
            totalVotes: 950,
          },
          {
            id: "cand-smp-03",
            categoryId: "cat-smp",
            candidateNumber: "03",
            name: "Alya Zahra",
            institution: "SMP Labschool Rawamangun",
            photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            tagline: "Kreatif, percaya diri, dan peduli lingkungan.",
            totalVotes: 620,
          },
        ],
      },
      {
        id: "cat-sma",
        eventId: "ev-duta-2026",
        title: "Tingkat SMA / SMK / MA (Kategori Remaja)",
        description: "Pemilihan duta pelajar tingkat Sekolah Menengah Atas dan Kejuruan berprestasi.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-sma-01",
            categoryId: "cat-sma",
            candidateNumber: "01",
            name: "Reza Pratama",
            institution: "SMA Negeri 3 Bandung",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            tagline: "Kolaborasi aktif generasi Z membangun Indonesia emas 2045.",
            totalVotes: 1120,
          },
          {
            id: "cand-sma-02",
            categoryId: "cat-sma",
            candidateNumber: "02",
            name: "Dinda Kirana",
            institution: "SMK Negeri 1 Surabaya",
            photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            tagline: "Vokasi unggul siap kerja dan berwirausaha digital.",
            totalVotes: 890,
          },
          {
            id: "cand-sma-03",
            categoryId: "cat-sma",
            candidateNumber: "03",
            name: "Kevin Sanjaya",
            institution: "SMA Negeri 8 Jakarta",
            photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            tagline: "Sains dan inovasi untuk kesejahteraan bersama.",
            totalVotes: 740,
          },
        ],
      },
      {
        id: "cat-purna",
        eventId: "ev-duta-2026",
        title: "Kategori Purna / Alumni / Mahasiswa",
        description: "Kategori purna duta dan alumni paskibra yang terus menginspirasi generasi muda.",
        pricePerVote: 2000,
        candidates: [
          {
            id: "cand-purna-01",
            categoryId: "cat-purna",
            candidateNumber: "01",
            name: "Citra Lestari (Purna Duta 2024)",
            institution: "Universitas Padjadjaran",
            photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
            tagline: "Kreativitas tanpa batas memajukan pariwisata nusantara.",
            totalVotes: 702,
          },
          {
            id: "cand-purna-02",
            categoryId: "cat-purna",
            candidateNumber: "02",
            name: "Bayu Anggara (Purna Paskibra 2023)",
            institution: "Institut Teknologi Bandung",
            photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
            tagline: "Disiplin militer dan kecerdasan intelektual mengabdi untuk negeri.",
            totalVotes: 650,
          },
          {
            id: "cand-purna-03",
            categoryId: "cat-purna",
            candidateNumber: "03",
            name: "Siti Rahma (Purna Duta Wisata 2022)",
            institution: "Universitas Gadjah Mada",
            photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            tagline: "Menjaga warisan budaya bangsa lewat aksi nyata.",
            totalVotes: 510,
          },
        ],
      },
    ],
  },
  {
    eventId: "ev-soundfest-2026",
    eventTitle: "Cetas SoundFest & Band Talent Competition 2026",
    eventDate: "20 - 25 Desember 2026",
    bannerUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    categories: [
      {
        id: "cat-band-smp",
        eventId: "ev-soundfest-2026",
        title: "Tingkat SMP (Junior Acoustic Band)",
        description: "Kompetisi grup musik pelajar tingkat SMP.",
        pricePerVote: 1500,
        candidates: [
          {
            id: "cand-band-01",
            categoryId: "cat-band-smp",
            candidateNumber: "01",
            name: "The Junior Sparks",
            institution: "SMP Tarakanita 1",
            photoUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
            tagline: "Harmoni melodi masa muda yang ceria.",
            totalVotes: 430,
          },
        ],
      },
      {
        id: "cat-band-sma",
        eventId: "ev-soundfest-2026",
        title: "Tingkat SMA (Rock & Pop Indie Band)",
        description: "Kompetisi festival musik SMA se-Jawa.",
        pricePerVote: 1500,
        candidates: [
          {
            id: "cand-band-02",
            categoryId: "cat-band-sma",
            candidateNumber: "01",
            name: "Nada Senja Project",
            institution: "SMA Kolese Gonzaga",
            photoUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
            tagline: "Lagu orisinal dan distorsi penuh semangat.",
            totalVotes: 1200,
          },
        ],
      },
      {
        id: "cat-band-purna",
        eventId: "ev-soundfest-2026",
        title: "Kategori Purna / Alumni All-Stars",
        description: "Band reuni alumni SMA dan komunitas pemuda Cetas.",
        pricePerVote: 1500,
        candidates: [
          {
            id: "cand-band-03",
            categoryId: "cat-band-purna",
            candidateNumber: "01",
            name: "Purna Nada Nusantara",
            institution: "Komunitas Purna Cetas",
            photoUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
            tagline: "Musik tak pernah padam oleh usia.",
            totalVotes: 810,
          },
        ],
      },
    ],
  },
];
