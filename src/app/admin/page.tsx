"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Ticket,
  DollarSign,
  CheckCircle2,
  Award,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Megaphone,
  Users,
  Search,
  ArrowUpRight,
  Lock,
  Camera,
  LogOut,
  KeyRound,
  Sparkles,
  Edit3,
  UserCheck,
  PlusCircle,
  Trash2,
  Check,
  Crown,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Sliders,
  Package,
  School,
  GraduationCap,
  Medal,
  FolderPlus,
  UserPlus,
  Palette,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  Trophy,
  FileText,
  Settings,
  Save,
  FileCheck,
  FolderCheck,
  AlertCircle,
  Eye,
  FileUp,
  FileCheck2,
  Download,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { EVENT_THEME_PRESETS, getEventTheme, EventThemePreset } from "@/lib/event-theme";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import {
  AdminUser,
  AdminRole,
  StaffAccountRecord,
  ROLE_DEFINITIONS,
  INITIAL_STAFF_ACCOUNTS,
  getStoredStaffList,
  saveStoredStaffList,
  getStoredAdminSession,
  saveAdminSession,
  clearAdminSession,
} from "@/lib/admin-auth";
import {
  INITIAL_UNIFIED_EVENTS,
  UnifiedEvent,
  UnifiedTicketTier,
  RegistrationCategoryQuota,
  getEffectiveRegistrationCategories,
  normalizeCategoryLevelCode,
  getStoredEvents,
  saveStoredEvents,
  mergeEventsWithLocal,
  CETAS_MASCOT_PRESETS,
  DEFAULT_MASCOT_URL,
  EventCertificateConfig,
  EventOfficialDocument,
  EventPrerequisiteRule,
  getEffectiveOfficialDocuments,
  getEffectivePrerequisiteRules,
} from "@/lib/events-unified-data";
import {
  INITIAL_UNIFIED_PRODUCTS,
  UnifiedProduct,
  getStoredProducts,
  saveStoredProducts,
} from "@/lib/production-unified-data";
import {
  INITIAL_ATTENDEES,
  RegisteredAttendee,
  SquadMemberItem,
  SubmittedAttendeeDocument,
} from "@/lib/events-registration-data";
import {
  INITIAL_EVENT_VOTINGS,
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
  getStoredEventVotings,
  saveStoredEventVotings,
} from "@/lib/vote-unified-data";

interface Submission {
  id: string;
  eventName: string;
  organizer: string;
  phone: string;
  features: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

interface AdItem {
  id: string;
  title: string;
  placement: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

const EVENT_CATEGORY_OPTIONS = [
  { value: "Kompetisi & LKBB", label: "Perlombaan & Kompetisi (LKBB, Paskibra, Debat, Marching Band)" },
  { value: "Turnamen Olahraga & E-Sports", label: "Turnamen Olahraga & E-Sports (Futsal, MLBB, Basket)" },
  { value: "Konser Musik & Festival", label: "Konser Musik, Festival & Live Show" },
  { value: "Workshop & Pelatihan", label: "Workshop, Pelatihan & Masterclass" },
  { value: "Seminar & Konferensi", label: "Seminar, Konferensi & Talkshow" },
  { value: "Seni & Kebudayaan", label: "Seni, Tari, Teater & Pentas Budaya" },
  { value: "Pameran & Bazaar", label: "Pameran, Expo, Bazaar & Kuliner" },
  { value: "Hackathon & IT", label: "Hackathon & Kompetisi Teknologi" },
  { value: "Volunteer & Sosial", label: "Volunteer, Bakti Sosial & Komunitas" },
  { value: "Pendidikan & Tryout", label: "Pendidikan, Olimpiade & Tryout Akbar" },
  { value: "CUSTOM", label: "+ Ketik Kategori Lainnya (Bebas / Kustom Tanpa Batas)..." },
];

function MascotSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const currentMascot = CETAS_MASCOT_PRESETS.find((m) => m.url === value);

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎭</span>
            <span>Pilih Maskot Event (Maskot Resmi Cetas / Kustom)</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Maskot akan tampil mengambang resmi di bilik Cetas Vote, Cetas Ticketing, dan banner event.
          </p>
        </div>
        {value && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            <span className="text-[10px] text-slate-400">Maskot Terpilih:</span>
            <img
              src={value}
              alt="Maskot"
              className="h-6 w-6 object-contain drop-shadow"
            />
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {currentMascot?.name || "Kustom"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CETAS_MASCOT_PRESETS.map((m) => {
          const isSelected = value === m.url;
          return (
            <div
              key={m.id}
              onClick={() => onChange(m.url)}
              className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group relative ${
                isSelected
                  ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-md ring-2 ring-orange-500/20 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="h-20 w-full flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-2 border border-slate-100 dark:border-slate-700/60">
                <img
                  src={m.url}
                  alt={m.name}
                  className="h-16 w-16 object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                />
              </div>
              {isSelected && (
                <span className="text-[9px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded-full absolute top-2.5 right-2.5 shadow">
                  Dipilih ✓
                </span>
              )}
              <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                  {m.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {m.tagline}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 space-y-2">
        <FileUpload
          label="Atau Upload File Gambar Maskot Kustom Sendiri"
          description="Format PNG transparan asli (Maks. 5 MB) - Transparansi dipertahankan 100%"
          accept="image/png,image/webp,image/*"
          value={value}
          onChange={(dataUrl) => onChange(dataUrl)}
          aspectRatio="square"
        />

        {value && !currentMascot && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <span className="text-[11px] text-amber-900 dark:text-amber-300 font-medium">
              💡 Gambar maskot kustom memiliki latar belakang hitam / kotak gelap?
            </span>
            <button
              type="button"
              onClick={() => {
                if (!value) return;
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.naturalWidth || img.width;
                  canvas.height = img.naturalHeight || img.height;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const data = imgData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Jika pixel hitam atau hampir hitam, ubah alpha jadi 0 (100% transparan)
                    if (r <= 45 && g <= 45 && b <= 45) {
                      data[i + 3] = 0;
                    }
                  }
                  ctx.putImageData(imgData, 0, 0);
                  const transparentDataUrl = canvas.toDataURL("image/png");
                  onChange(transparentDataUrl);
                };
                img.src = value;
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <span>🪄</span>
              <span>Hapus Latar Hitam (Buat Transparan)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffAccountRecord[]>(INITIAL_STAFF_ACCOUNTS);

  // Financial KPIs
  const [finances, setFinances] = useState({
    totalOmzet: 0,
    ticketOmzet: 0,
    voteOmzet: 0,
    prodOmzet: 0,
    ticketsSold: 0,
    votesCount: 0,
  });
  const [isEditingFinances, setIsEditingFinances] = useState(false);
  const [tempFinances, setTempFinances] = useState(finances);

  // Unified Events State (CRUD & Workspace)
  const [eventsList, setEventsList] = useState<UnifiedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventSubTab, setEventSubTab] = useState<
    "DETAILS" | "TEAMS" | "SCORE" | "VOTE" | "TICKETS" | "ATTENDEES" | "FINANCES"
  >("DETAILS");

  // Pasukan & Pelatih State
  const [tmInputMap, setTmInputMap] = useState<Record<string, string>>({});
  const [savingTmId, setSavingTmId] = useState<string | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [teamCategoryFilter, setTeamCategoryFilter] = useState("ALL");
  const [teamStatusFilter, setTeamStatusFilter] = useState<"ALL" | "CONFIRMED" | "WAITLIST">("ALL");
  const [isTogglingScoreRelease, setIsTogglingScoreRelease] = useState(false);

  // Certificate Settings & Signatures State
  const [isCertConfigModalOpen, setIsCertConfigModalOpen] = useState(false);
  const [certConfigForm, setCertConfigForm] = useState<EventCertificateConfig>({
    eventHeading: "LKBB BARAVOS 2026",
    issueCity: "Jakarta",
    issueDate: "30 Oktober 2026",
    certificateNumberFormat: "[NO]/CETAS-LKBB/X/2026",
    institutionName: "Centralized Electronic Tournament & Award System",
    signer1: {
      role: "Ketua Panitia Penyelenggara",
      name: "Ardi Purwanto, S.Pd.",
      nipOrId: "NIP. 19910523 201502 1 002",
      signatureUrl: "",
    },
    signer2: {
      role: "Ketua Dewan Juri CETAS",
      name: "M. Rian Arifin, S.Pd., M.Han",
      nipOrId: "NIP. 19880412 201101 1 003",
      signatureUrl: "",
    },
    stampUrl: "",
  });
  const [isSavingCertConfig, setIsSavingCertConfig] = useState(false);

  // Champion Certificate Management State
  const [championModalAttendee, setChampionModalAttendee] = useState<RegisteredAttendee | null>(null);
  const [championCertTitle, setChampionCertTitle] = useState("");
  const [championCertUrl, setChampionCertUrl] = useState("");
  const [isSavingChampionCert, setIsSavingChampionCert] = useState(false);

  // Admin Squad Members (16 Personel) State
  const [adminSquadAttendee, setAdminSquadAttendee] = useState<RegisteredAttendee | null>(null);
  const [adminSquadForm, setAdminSquadForm] = useState<SquadMemberItem[]>([]);
  const [isSavingAdminSquad, setIsSavingAdminSquad] = useState(false);
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState("");

  // Manajemen Dokumen & Juknis Event (Admin)
  const [isOfficialDocsModalOpen, setIsOfficialDocsModalOpen] = useState(false);
  const [docsModalSubTab, setDocsModalSubTab] = useState<"DOCS" | "RULES">("DOCS");
  const [officialDocsForm, setOfficialDocsForm] = useState<EventOfficialDocument[]>([]);
  const [prerequisiteRulesForm, setPrerequisiteRulesForm] = useState<EventPrerequisiteRule[]>([]);
  const [isSavingOfficialDocs, setIsSavingOfficialDocs] = useState(false);

  // Verifikasi Dokumen Prasyarat Peserta (Admin)
  const [adminDocsAttendee, setAdminDocsAttendee] = useState<RegisteredAttendee | null>(null);
  const [reviewingDocRuleId, setReviewingDocRuleId] = useState<string | null>(null);
  const [revisionNoteInput, setRevisionNoteInput] = useState<string>("");
  const [isSavingDocReview, setIsSavingDocReview] = useState(false);

  // Real-time Tickets & Audience Attendance State
  const [eventTickets, setEventTickets] = useState<any[]>([]);
  const [eventTicketsSummary, setEventTicketsSummary] = useState({
    totalTickets: 0,
    attendedCount: 0,
    pendingCount: 0,
    attendanceRate: 0,
  });
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"ALL" | "USED" | "ACTIVE">("ALL");
  const [isLoadingEventTickets, setIsLoadingEventTickets] = useState(false);

  // Per-Event & Global Finances Breakdown State
  const [eventFinancesData, setEventFinancesData] = useState<any[]>([]);
  const [globalRecentOrders, setGlobalRecentOrders] = useState<any[]>([]);
  const [isLoadingEventFinances, setIsLoadingEventFinances] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("ALL");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState("");
  const [eventForm, setEventForm] = useState({
    title: "",
    organizer: "",
    category: "Kompetisi & LKBB",
    themePreset: "FLAME" as EventThemePreset,
    date: "",
    time: "09:00 - 17:00 WIB",
    location: "",
    locationType: "OFFLINE" as UnifiedEvent["locationType"],
    bannerUrl: "",
    mascotUrl: DEFAULT_MASCOT_URL,
    description: "",
    status: "PUBLISHED" as UnifiedEvent["status"],
    isOpenTicketing: true,
    ticketTierName: "Festival Regular",
    ticketPrice: 150000,
    ticketQuota: 200,
    isOpenOnlineRegistration: false,
    registrationPrice: 0,
    allowDownPayment: false,
    minDownPaymentAmount: 0,
    registrationQuota: 100,
    facilitiesText: "Sertifikat Digital, E-Badge Gate Pass, Snack",
  });
  const [eventTiers, setEventTiers] = useState<UnifiedTicketTier[]>([
    {
      id: "tier-default-1",
      name: "Tiket Reguler",
      price: 25000,
      quotaRemaining: 300,
      quotaTotal: 300,
    },
  ]);
  const [eventRegCategories, setEventRegCategories] = useState<RegistrationCategoryQuota[]>([
    { id: "regcat-default-sd", name: "Tingkat SD/MI", code: "SD", quotaTotal: 30, quotaRemaining: 30 },
    { id: "regcat-default-smp", name: "Tingkat SMP/MTs", code: "SMP", quotaTotal: 35, quotaRemaining: 35 },
    { id: "regcat-default-sma", name: "Tingkat SMA/SMK/MA", code: "SMA", quotaTotal: 35, quotaRemaining: 35 },
  ]);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const showSyncToast = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => {
      setSyncNotice((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Unified Products State (CRUD)
  const [productsList, setProductsList] = useState<UnifiedProduct[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [previewProductModal, setPreviewProductModal] = useState<UnifiedProduct | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "EQUIPMENT" as UnifiedProduct["category"],
    subCategory: "SOUND_SYSTEM",
    price: 3500000,
    unit: "hari",
    stock: 5,
    imageUrl: "",
    description: "",
    status: "TERSEDIA" as UnifiedProduct["status"],
  });

  // Hierarchical Cetas Vote State: Event -> Kategori (SMP, SMA, Purna) -> Peserta
  const [eventVotings, setEventVotings] = useState<EventVotingConfig[]>(INITIAL_EVENT_VOTINGS);
  const [selectedVoteEventId, setSelectedVoteEventId] = useState<string>(
    INITIAL_EVENT_VOTINGS[0]?.eventId || ""
  );
  const [selectedVoteCategoryId, setSelectedVoteCategoryId] = useState<string>(
    INITIAL_EVENT_VOTINGS[0]?.categories[0]?.id || ""
  );

  // Modal: Hubungkan Event ke Vote
  const [isAddEventVoteModalOpen, setIsAddEventVoteModalOpen] = useState(false);
  const [selectedEventToConnect, setSelectedEventToConnect] = useState<string>("");

  // Modal: Kategori Vote (SMP, SMA, Purna)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    description: "",
    pricePerVote: 2000,
  });

  // Modal: Peserta Vote
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateForm, setCandidateForm] = useState({
    candidateNumber: "01",
    name: "",
    institution: "",
    photoUrl: "",
    tagline: "",
    totalVotes: 0,
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Attendees State
  const [attendees, setAttendees] = useState<RegisteredAttendee[]>(INITIAL_ATTENDEES);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("ALL");
  const [attendeeSearch, setAttendeeSearch] = useState("");

  // Ads State
  const [ads, setAds] = useState<AdItem[]>([]);
  const [newAdModal, setNewAdModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdPlacement, setNewAdPlacement] = useState("Homepage Top Banner");

  // Staff Modal State
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EVENT_ADMIN" as AdminRole,
    assignedEventId: "",
    assignedEventTitle: "",
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "EVENTS" | "PRODUCTION" | "FINANCES" | "SUBMISSIONS" | "STAFF" | "AUDIT" | "ADS"
  >("EVENTS"); // Default to EVENTS so user lands directly on Pusat Event Workspace!

  const hydrateFormAndTiersFromEvent = (ev: UnifiedEvent) => {
    setEditingEventId(ev.id);
    const isStandard = EVENT_CATEGORY_OPTIONS.some((opt) => opt.value === ev.category);
    if (!isStandard) {
      setIsCustomCategory(true);
      setCustomCategoryText(ev.category);
    } else {
      setIsCustomCategory(false);
      setCustomCategoryText("");
    }
    const initialTiers: UnifiedTicketTier[] =
      Array.isArray(ev.tiers) && ev.tiers.length > 0
        ? ev.tiers
        : [
            {
              id: `tier-${ev.id}-1`,
              name: "Tiket Reguler",
              price: ev.price || 10000,
              quotaTotal: ev.quotaTotal || 400,
              quotaRemaining: ev.quotaRemaining || 400,
              benefits: ev.facilities || ["E-Ticket QR Code Resmi"],
            },
          ];
    setEventTiers(initialTiers);
    const initialRegCats = getEffectiveRegistrationCategories(ev);
    setEventRegCategories(initialRegCats);
    setEventForm({
      title: ev.title,
      organizer: ev.organizer,
      category: ev.category,
      themePreset: ev.themePreset || "EMERALD",
      date: ev.date,
      time: ev.time,
      location: ev.location,
      locationType: ev.locationType,
      bannerUrl: ev.bannerUrl,
      mascotUrl: ev.mascotUrl || DEFAULT_MASCOT_URL,
      description: ev.description,
      status: ev.status,
      isOpenTicketing: ev.isOpenTicketing,
      ticketTierName: initialTiers[0].name,
      ticketPrice: initialTiers[0].price,
      ticketQuota: initialTiers[0].quotaTotal,
      isOpenOnlineRegistration: ev.isOpenOnlineRegistration,
      registrationPrice: ev.price || 0,
      allowDownPayment: Boolean(ev.allowDownPayment),
      minDownPaymentAmount: ev.minDownPaymentAmount || (ev.price ? Math.round(ev.price / 2) : 0),
      registrationQuota: initialRegCats.reduce((s, c) => s + c.quotaTotal, 0) || ev.quotaTotal || 100,
      facilitiesText: (ev.facilities || []).join(", "),
    });
  };

  // Initial Data Fetching
  useEffect(() => {
    const session = getStoredAdminSession();
    if (session) setCurrentUser(session);

    const storedStaff = getStoredStaffList();
    if (storedStaff && storedStaff.length > 0) setStaffList(storedStaff);

    let savedEventId: string | null = null;
    let savedSubTab: "DETAILS" | "SCORE" | "VOTE" | "TICKETS" | "ATTENDEES" = "DETAILS";
    try {
      savedEventId = sessionStorage.getItem("cetas_admin_selected_event_id");
      const rawTab = sessionStorage.getItem("cetas_admin_event_subtab");
      if (
        rawTab === "DETAILS" ||
        rawTab === "SCORE" ||
        rawTab === "VOTE" ||
        rawTab === "TICKETS" ||
        rawTab === "ATTENDEES"
      ) {
        savedSubTab = rawTab;
      }
    } catch {}

    // Fetch Events & Sync LocalStorage + PostgreSQL
    const localEv = getStoredEvents();
    if (localEv && localEv.length > 0) {
      setEventsList(localEv);
      setSelectedEventToConnect(localEv[0].id);
      if (savedEventId) {
        const foundLocal = localEv.find((e) => e.id === savedEventId);
        if (foundLocal) {
          setSelectedEventId(foundLocal.id);
          setSelectedVoteEventId(foundLocal.id);
          setEventSubTab(savedSubTab);
          hydrateFormAndTiersFromEvent(foundLocal);
        }
      }
    }
    fetch("/api/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const latestLocal = getStoredEvents();
          const merged = mergeEventsWithLocal(data.events, latestLocal);
          setEventsList(merged);
          saveStoredEvents(merged);
          if (merged.length > 0) {
            setSelectedEventToConnect(merged[0].id);
          }

          const activeEvId =
            sessionStorage.getItem("cetas_admin_selected_event_id") || savedEventId;
          if (activeEvId) {
            const foundMerged = merged.find((e) => e.id === activeEvId);
            if (foundMerged) {
              setSelectedEventId(foundMerged.id);
              setSelectedVoteEventId(foundMerged.id);
              hydrateFormAndTiersFromEvent(foundMerged);
            }
          }

          // Push any newer local event changes to PostgreSQL in the background
          for (const m of merged) {
            const srv = data.events.find((s: UnifiedEvent) => s.id === m.id);
            if (
              !srv ||
              (Number(m.updatedAt) || 0) > (Number(srv.updatedAt) || 0) ||
              (Array.isArray(m.tiers) && m.tiers.length > (srv.tiers?.length || 0))
            ) {
              fetch("/api/events", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(m),
              }).catch(() => {});
            }
          }
        }
      })
      .catch(() => {});

    // Fetch Products & Sync LocalStorage
    const localProds = getStoredProducts();
    if (localProds && localProds.length > 0) {
      setProductsList(localProds);
    }
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProductsList(data.products);
          saveStoredProducts(data.products);
        }
      })
      .catch(() => {});

    // Fetch Hierarchical Vote Config & Sync LocalStorage + PostgreSQL
    const localVotes = getStoredEventVotings();
    if (localVotes && localVotes.length > 0) {
      setEventVotings(localVotes);
      setSelectedVoteEventId(localVotes[0].eventId);
      if (localVotes[0].categories.length > 0) {
        setSelectedVoteCategoryId(localVotes[0].categories[0].id);
      }
    }
    fetch("/api/vote", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.eventVotings) && data.eventVotings.length > 0) {
          setEventVotings(data.eventVotings);
          saveStoredEventVotings(data.eventVotings);
          setSelectedVoteEventId(data.eventVotings[0].eventId);
          if (data.eventVotings[0].categories.length > 0) {
            setSelectedVoteCategoryId(data.eventVotings[0].categories[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch Attendees
    fetch("/api/attendees", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.attendees) setAttendees(data.attendees);
      })
      .catch(() => {});

    // Fetch Live Finances from Database (Solusi Omzet 0 di Dashboard)
    fetch("/api/admin/finances", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.finances) {
          setFinances(data.finances);
          setTempFinances(data.finances);
          if (Array.isArray(data.eventBreakdowns)) {
            setEventFinancesData(data.eventBreakdowns);
          }
          if (Array.isArray(data.recentOrders)) {
            setGlobalRecentOrders(data.recentOrders);
          }
        }
      })
      .catch(() => {});

    // Fetch Database Staff Accounts & Sync Active Session
    fetch("/api/admin/staff", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.staff)) {
          setStaffList(data.staff);
          saveStoredStaffList(data.staff);
          // Sinkronkan data profil & wewenang terbaru akun staf yang sedang login
          setCurrentUser((prev) => {
            if (!prev) return null;
            const updated = data.staff.find(
              (s: any) => s.id === prev.id || s.email.toLowerCase() === prev.email.toLowerCase()
            );
            if (updated) {
              const fullSession: AdminUser = {
                ...prev,
                ...updated,
                roleTitle: ROLE_DEFINITIONS[updated.role as AdminRole]?.title || updated.roleTitle || "Petugas Cetas",
                ...(ROLE_DEFINITIONS[updated.role as AdminRole] || {}),
              };
              saveAdminSession(fullSession);
              return fullSession;
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Automatically persist eventsList and eventVotings changes to localStorage
  useEffect(() => {
    if (eventsList && eventsList.length > 0) {
      saveStoredEvents(eventsList);
    }
  }, [eventsList]);

  // RBAC Auto-Routing Protection: Kunci akses halaman sesuai role (Dipanggil sebelum conditional return)
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role;
    if (role === "PROD_ADMIN" && activeTab !== "PRODUCTION") {
      setActiveTab("PRODUCTION");
    } else if (role === "FINANCE_ADMIN" && activeTab !== "FINANCES") {
      setActiveTab("FINANCES");
    } else if (role === "SCANNER_STAFF" && (activeTab !== "EVENTS" || eventSubTab !== "ATTENDEES")) {
      setActiveTab("EVENTS");
      setEventSubTab("ATTENDEES");
    } else if ((role === "EVENT_ADMIN" || role === "PANITIA") && activeTab !== "EVENTS") {
      setActiveTab("EVENTS");
    }

    // Kunci langsung event workspace ke event yang ditugaskan (Singkronkan data Staff Admin & Panitia)
    if ((role === "EVENT_ADMIN" || role === "PANITIA") && currentUser.assignedEventId) {
      if (selectedEventId !== currentUser.assignedEventId) {
        setSelectedEventId(currentUser.assignedEventId);
        setSelectedVoteEventId(currentUser.assignedEventId);
      }
      const targetEv = eventsList.find((e) => e.id === currentUser.assignedEventId);
      if (targetEv) {
        hydrateFormAndTiersFromEvent(targetEv);
      }
    }
  }, [currentUser, activeTab, eventSubTab, selectedEventId, eventsList]);

  useEffect(() => {
    if (eventVotings && eventVotings.length > 0) {
      saveStoredEventVotings(eventVotings);
    }
  }, [eventVotings]);

  // Fetch real-time tickets for the selected event
  const fetchEventTickets = (eventId: string) => {
    if (!eventId) return;
    setIsLoadingEventTickets(true);
    fetch(`/api/admin/tickets?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tickets)) {
          setEventTickets(data.tickets);
          setEventTicketsSummary({
            totalTickets: data.totalTickets || data.tickets.length,
            attendedCount: data.attendedCount || 0,
            pendingCount: data.pendingCount || 0,
            attendanceRate: data.attendanceRate || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingEventTickets(false));
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchEventTickets(selectedEventId);
    }
  }, [selectedEventId]);

  const handleToggleTicketAttendance = async (ticketCode: string, currentStatus: string) => {
    const isAttended = currentStatus !== "USED";
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode, isAttended }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(data.message || "Status kehadiran tiket berhasil diperbarui.");
        if (selectedEventId) {
          fetchEventTickets(selectedEventId);
        }
        fetch("/api/admin/finances", { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => {
            if (d.success && d.finances) {
              setFinances(d.finances);
              if (Array.isArray(d.eventBreakdowns)) setEventFinancesData(d.eventBreakdowns);
            }
          })
          .catch(() => {});
      } else {
        alert(data.error || "Gagal mengubah status kehadiran.");
      }
    } catch (e: any) {
      alert("Gagal menghubungi server: " + e.message);
    }
  };

  // ---------------- AUTH HANDLERS ----------------
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const cleanInput = authEmail.toLowerCase().trim();
    const isMasterPassword =
      authPassword === "RezaCetas2026!" ||
      authPassword === "211226";

    // 1. Cari akun di staffList yang bersumber dari database PostgreSQL
    let found = staffList.find(
      (u) =>
        (u.email.toLowerCase() === cleanInput ||
          (cleanInput === "admin" && u.email === "cetasgrup@gmail.com") ||
          (cleanInput === "reza" && u.email === "cetasgrup@gmail.com")) &&
        (u.password === authPassword || (cleanInput === "cetasgrup@gmail.com" && isMasterPassword))
    );

    // 2. Root Super Admin fallback hanya jika staffList belum tersinkron
    if (
      !found &&
      (cleanInput === "cetasgrup@gmail.com" || cleanInput === "admin" || cleanInput === "reza") &&
      isMasterPassword
    ) {
      found = INITIAL_STAFF_ACCOUNTS[0];
    }

    if (found) {
      const userSession: AdminUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        roleTitle: ROLE_DEFINITIONS[found.role]?.title || "Petugas Cetas",
        avatarColor: found.avatarColor || "bg-slate-700 text-white",
        lastLogin: "Baru saja",
        assignedEventId: found.assignedEventId,
        assignedEventTitle: found.assignedEventTitle,
        ...(ROLE_DEFINITIONS[found.role] || {}),
      };
      setCurrentUser(userSession);
      saveAdminSession(userSession);
      setAuthError(null);

      // Auto-navigasi sesuai wewenang role:
      if (found.role === "PROD_ADMIN") {
        setActiveTab("PRODUCTION");
      } else if (found.role === "FINANCE_ADMIN") {
        setActiveTab("FINANCES");
      } else if (found.role === "SCANNER_STAFF") {
        setActiveTab("EVENTS");
        setEventSubTab("ATTENDEES");
      } else if (found.role === "EVENT_ADMIN" || found.role === "PANITIA") {
        setActiveTab("EVENTS");
        if (found.assignedEventId) {
          setSelectedEventId(found.assignedEventId);
          setSelectedVoteEventId(found.assignedEventId);
        }
      } else {
        setActiveTab("EVENTS");
      }

      // Sync HTTP-only JWT cookie for protected server routes
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: found.email.toLowerCase().trim(),
          pin: found.password,
          syncStaffAccount: true,
          name: found.name,
          role: found.role,
        }),
      }).catch(() => {});
    } else {
      setAuthError("Email atau password tidak cocok, atau akun telah dinonaktifkan permanen oleh Super Admin.");
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setCurrentUser(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  // ---------------- EVENT CRUD HANDLERS ----------------
  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setIsCustomCategory(false);
    setCustomCategoryText("");
    setEventForm({
      title: "",
      organizer: "Cetas Official",
      category: "Kompetisi & LKBB",
      themePreset: "FLAME" as EventThemePreset,
      date: new Date().toISOString().split("T")[0],
      time: "09:00 - 17:00 WIB",
      location: "Jakarta Convention Center",
      locationType: "OFFLINE",
      bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      mascotUrl: DEFAULT_MASCOT_URL,
      description: "Deskripsi acara spektakuler Cetas.",
      status: "PUBLISHED",
      isOpenTicketing: true,
      ticketTierName: "Tiket Reguler",
      ticketPrice: 25000,
      ticketQuota: 300,
      isOpenOnlineRegistration: true,
      registrationPrice: 0,
      allowDownPayment: false,
      minDownPaymentAmount: 0,
      registrationQuota: 100,
      facilitiesText: "Sertifikat Digital Resmi, E-Badge Pass QR, Snack",
    });
    setEventTiers([
      {
        id: `tier-${Date.now()}-1`,
        name: "Tiket Reguler",
        price: 25000,
        quotaRemaining: 300,
        quotaTotal: 300,
      },
    ]);
    setEventRegCategories([
      { id: `regcat-${Date.now()}-sd`, name: "Tingkat SD/MI", code: "SD", quotaTotal: 30, quotaRemaining: 30 },
      { id: `regcat-${Date.now()}-smp`, name: "Tingkat SMP/MTs", code: "SMP", quotaTotal: 35, quotaRemaining: 35 },
      { id: `regcat-${Date.now()}-sma`, name: "Tingkat SMA/SMK/MA", code: "SMA", quotaTotal: 35, quotaRemaining: 35 },
    ]);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: UnifiedEvent) => {
    setEditingEventId(ev.id);
    const isStandard = EVENT_CATEGORY_OPTIONS.some((opt) => opt.value === ev.category);
    if (!isStandard) {
      setIsCustomCategory(true);
      setCustomCategoryText(ev.category);
    } else {
      setIsCustomCategory(false);
      setCustomCategoryText("");
    }
    const initialTiers: UnifiedTicketTier[] =
      ev.tiers && ev.tiers.length > 0
        ? ev.tiers
        : [
            {
              id: `tier-${Date.now()}-1`,
              name: "Tiket Reguler",
              price: 25000,
              quotaRemaining: 300,
              quotaTotal: 300,
            },
          ];
    setEventTiers(initialTiers);
    const initialRegCats = getEffectiveRegistrationCategories(ev);
    setEventRegCategories(initialRegCats);
    setEventForm({
      title: ev.title,
      organizer: ev.organizer,
      category: ev.category,
      themePreset: ev.themePreset || "FLAME",
      date: ev.date,
      time: ev.time,
      location: ev.location,
      locationType: ev.locationType,
      bannerUrl: ev.bannerUrl,
      mascotUrl: ev.mascotUrl || DEFAULT_MASCOT_URL,
      description: ev.description,
      status: ev.status,
      isOpenTicketing: ev.isOpenTicketing,
      ticketTierName: initialTiers[0].name,
      ticketPrice: initialTiers[0].price,
      ticketQuota: initialTiers[0].quotaTotal,
      isOpenOnlineRegistration: ev.isOpenOnlineRegistration,
      registrationPrice: ev.price || 0,
      allowDownPayment: Boolean(ev.allowDownPayment),
      minDownPaymentAmount: ev.minDownPaymentAmount || (ev.price ? Math.round(ev.price / 2) : 0),
      registrationQuota: initialRegCats.reduce((s, c) => s + c.quotaTotal, 0) || ev.quotaTotal || 100,
      facilitiesText: (ev.facilities || []).join(", "),
    });
    setIsEventModalOpen(true);
  };

  const updateEventTiersLive = (
    updater: (prev: UnifiedTicketTier[]) => UnifiedTicketTier[],
    autoEnableTicketing = false
  ) => {
    if (currentUser?.role === "PANITIA") return;
    const targetId = selectedEventId || editingEventId;
    const now = Date.now();
    let computedTiers: UnifiedTicketTier[] = [];
    setEventTiers((prev) => {
      computedTiers = updater(prev);
      return computedTiers;
    });
    if (targetId) {
      setEventsList((prevEvents) => {
        const nextEvents = prevEvents.map((ev) =>
          ev.id === targetId
            ? {
                ...ev,
                tiers: computedTiers.length > 0 ? computedTiers : updater(ev.tiers || []),
                isOpenTicketing: autoEnableTicketing ? true : ev.isOpenTicketing,
                updatedAt: now,
              }
            : ev
        );
        saveStoredEvents(nextEvents);
        return nextEvents;
      });
    }
    if (autoEnableTicketing) {
      setEventForm((f) => ({ ...f, isOpenTicketing: true }));
    }
  };

  const handleSaveEvent = async (
    e?: React.FormEvent,
    forceOpenTicketing?: boolean
  ) => {
    if (e) e.preventDefault();
    if (currentUser?.role === "PANITIA") {
      alert("Akun Panitia hanya memiliki hak memantau (read-only) dan tidak diizinkan mengubah event.");
      return;
    }
    if (!eventForm.title.trim()) return;

    const facilitiesArray = eventForm.facilitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalCategory =
      isCustomCategory && customCategoryText.trim()
        ? customCategoryText.trim()
        : eventForm.category;

    const effectiveOpenTicketing = forceOpenTicketing
      ? true
      : eventForm.isOpenTicketing;
    if (forceOpenTicketing && !eventForm.isOpenTicketing) {
      setEventForm((f) => ({ ...f, isOpenTicketing: true }));
    }

    // Pertahankan seluruh tier tiket secara akurat tanpa menimpa tier #1 dengan state lama
    const normalizedTiers: UnifiedTicketTier[] =
      eventTiers && eventTiers.length > 0
        ? eventTiers.map((t, idx) => {
            const rawTotal = Number(t.quotaTotal);
            const total = rawTotal > 0 ? rawTotal : 100;
            const rawRem =
              t.quotaRemaining !== undefined && t.quotaRemaining !== null
                ? Number(t.quotaRemaining)
                : total;
            const rem = Math.min(total, Math.max(0, rawRem >= 0 ? rawRem : total));
            return {
              ...t,
              id: t.id || `tier-${Date.now()}-${idx + 1}`,
              name: t.name && t.name.trim() ? t.name.trim() : `Tiket Tier #${idx + 1}`,
              price: Math.max(0, Number(t.price) || 0),
              quotaTotal: total,
              quotaRemaining: rem,
              benefits:
                Array.isArray(t.benefits) && t.benefits.length > 0
                  ? t.benefits
                  : ["E-Ticket QR Code Resmi"],
            };
          })
        : [
            {
              id: `tier-${Date.now()}-1`,
              name: eventForm.ticketTierName || "Tiket Reguler",
              price: Number(eventForm.ticketPrice) || 0,
              quotaRemaining: Number(eventForm.ticketQuota) > 0 ? Number(eventForm.ticketQuota) : 100,
              quotaTotal: Number(eventForm.ticketQuota) > 0 ? Number(eventForm.ticketQuota) : 100,
              benefits: ["E-Ticket QR Code Resmi"],
            },
          ];

    // Normalisasi kategori pendaftaran per tingkatan (SD, SMP, SMA, Purna / Custom) & kuota masing-masing
    const normalizedRegCategories: RegistrationCategoryQuota[] =
      eventRegCategories && eventRegCategories.length > 0
        ? eventRegCategories
            .filter((c) => c.name && c.name.trim())
            .map((c, idx) => {
              const total = Math.max(1, Number(c.quotaTotal) || 30);
              const rem =
                c.quotaRemaining !== undefined && c.quotaRemaining !== null
                  ? Math.min(total, Math.max(0, Number(c.quotaRemaining)))
                  : total;
              return {
                id: c.id || `regcat-${Date.now()}-${idx + 1}`,
                name: c.name.trim(),
                code: normalizeCategoryLevelCode(c.name),
                quotaTotal: total,
                quotaRemaining: rem,
              };
            })
        : [
            { id: `regcat-${Date.now()}-sd`, name: "Tingkat SD/MI", code: "SD", quotaTotal: 30, quotaRemaining: 30 },
            { id: `regcat-${Date.now()}-smp`, name: "Tingkat SMP/MTs", code: "SMP", quotaTotal: 35, quotaRemaining: 35 },
            { id: `regcat-${Date.now()}-sma`, name: "Tingkat SMA/SMK/MA", code: "SMA", quotaTotal: 35, quotaRemaining: 35 },
          ];

    const totalRegQuota = normalizedRegCategories.reduce((sum, c) => sum + c.quotaTotal, 0);
    const remRegQuota = normalizedRegCategories.reduce((sum, c) => sum + c.quotaRemaining, 0);
    const saveTimestamp = Date.now();

    const payload = {
      title: eventForm.title,
      organizer: eventForm.organizer,
      category: finalCategory,
      themePreset: eventForm.themePreset,
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location,
      locationType: eventForm.locationType,
      bannerUrl: eventForm.bannerUrl,
      mascotUrl: eventForm.mascotUrl || DEFAULT_MASCOT_URL,
      description: eventForm.description,
      status: eventForm.status,
      isOpenTicketing: effectiveOpenTicketing,
      tiers: normalizedTiers,
      isOpenOnlineRegistration: eventForm.isOpenOnlineRegistration,
      registrationCategories: normalizedRegCategories,
      categoryOptions: normalizedRegCategories.map((c) => c.name),
      quotaTotal: totalRegQuota || Number(eventForm.registrationQuota) || 100,
      quotaRemaining: remRegQuota || Number(eventForm.registrationQuota) || 100,
      price: Number(eventForm.registrationPrice) || 0,
      priceLabel: Number(eventForm.registrationPrice) > 0 ? `Rp ${Number(eventForm.registrationPrice).toLocaleString("id-ID")}` : "Gratis",
      allowDownPayment: Boolean(eventForm.allowDownPayment),
      minDownPaymentAmount: Number(eventForm.minDownPaymentAmount) || 0,
      facilities: facilitiesArray,
      updatedAt: saveTimestamp,
    };

    const targetEventId = isEventModalOpen
      ? editingEventId
      : selectedEventId || editingEventId;

    if (targetEventId) {
      // 0ms Optimistic Update: Langsung simpan ke state & localStorage sebelum request jaringan selesai
      setEventTiers(normalizedTiers);
      setEventRegCategories(normalizedRegCategories);
      setEventsList((prev) => {
        const next = prev.map((ev) =>
          ev.id === targetEventId
            ? ({ ...ev, ...payload, id: targetEventId } as UnifiedEvent)
            : ev
        );
        saveStoredEvents(next);
        return next;
      });

      try {
        const res = await fetch("/api/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetEventId, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.event) {
          const syncedEvent: UnifiedEvent = {
            ...data.event,
            tiers:
              Array.isArray(data.event.tiers) && data.event.tiers.length > 0
                ? data.event.tiers
                : normalizedTiers,
            updatedAt: saveTimestamp,
          };
          setEventsList((prev) => {
            const next = prev.map((ev) => (ev.id === targetEventId ? syncedEvent : ev));
            saveStoredEvents(next);
            return next;
          });
          setEventTiers(syncedEvent.tiers);
          if (syncedEvent.registrationCategories) {
            setEventRegCategories(syncedEvent.registrationCategories);
          }
          fetch("/api/vote", { cache: "no-store" })
            .then((r) => r.json())
            .then((vData) => {
              if (vData.success && Array.isArray(vData.eventVotings)) {
                setEventVotings(vData.eventVotings);
                saveStoredEventVotings(vData.eventVotings);
              }
            })
            .catch(() => {});
          showSyncToast(`✓ Event, Kategori Kuota & ${syncedEvent.tiers.length} Tier Tiket '${syncedEvent.title}' berhasil disimpan & disinkronkan ke publik!`);
        } else {
          showSyncToast(`✓ Perubahan Event & ${normalizedTiers.length} Tier Tiket berhasil disimpan!`);
        }
      } catch {
        showSyncToast(`✓ Perubahan Event & ${normalizedTiers.length} Tier Tiket tersimpan!`);
      }
    } else {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.event) {
          setEventsList((prev) => {
            const next = [data.event, ...prev.filter((e) => e.id !== data.event.id)];
            saveStoredEvents(next);
            return next;
          });
          // Refresh votings agar bilik vote event baru langsung tampil
          fetch("/api/vote", { cache: "no-store" })
            .then((r) => r.json())
            .then((vData) => {
              if (vData.success && Array.isArray(vData.eventVotings)) {
                setEventVotings(vData.eventVotings);
                saveStoredEventVotings(vData.eventVotings);
              }
            })
            .catch(() => {});
          showSyncToast(`✓ Event baru '${data.event.title}' berhasil diterbitkan ke publik!`);
        }
      } catch {
        const fallbackEv: UnifiedEvent = {
          id: `ev-${Date.now().toString().slice(-6)}`,
          slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          ...payload,
        };
        setEventsList((prev) => {
          const next = [fallbackEv, ...prev];
          saveStoredEvents(next);
          return next;
        });
        showSyncToast(`✓ Event baru '${fallbackEv.title}' berhasil dibuat!`);
      }
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (currentUser?.role === "PANITIA") {
      alert("Akun Panitia tidak diizinkan menghapus event.");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus event ini beserta bilik votingnya?")) {
      setEventsList((prev) => {
        const next = prev.filter((ev) => ev.id !== id);
        saveStoredEvents(next);
        return next;
      });
      if (selectedEventId === id) {
        setSelectedEventId(null);
      }
      setEventVotings((prev) => {
        const remaining = prev.filter((ev) => ev.eventId !== id);
        saveStoredEventVotings(remaining);
        if (selectedVoteEventId === id && remaining.length > 0) {
          setSelectedVoteEventId(remaining[0].eventId);
          if (remaining[0].categories.length > 0) {
            setSelectedVoteCategoryId(remaining[0].categories[0].id);
          }
        }
        return remaining;
      });
      try {
        await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      } catch {}
      try {
        await fetch(`/api/vote?eventId=${id}`, { method: "DELETE" });
      } catch {}
      showSyncToast("✓ Event berhasil dihapus dari sistem.");
    }
  };

  const handleDeleteEventVoting = async (eventId: string, eventTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus & menutup bilik voting untuk '${eventTitle}'?`)) {
      setEventVotings((prev) => {
        const remaining = prev.filter((ev) => ev.eventId !== eventId);
        if (selectedVoteEventId === eventId && remaining.length > 0) {
          setSelectedVoteEventId(remaining[0].eventId);
          if (remaining[0].categories.length > 0) {
            setSelectedVoteCategoryId(remaining[0].categories[0].id);
          }
        }
        return remaining;
      });
      try {
        await fetch(`/api/vote?eventId=${eventId}`, { method: "DELETE" });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ---------------- PRODUCT CRUD HANDLERS ----------------
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      category: "EQUIPMENT",
      subCategory: "SOUND_SYSTEM",
      price: 2500000,
      unit: "hari",
      stock: 5,
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
      description: "Peralatan event profesional standar konser Cetas Production.",
      status: "TERSEDIA",
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: UnifiedProduct) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      category: prod.category,
      subCategory: prod.subCategory || "SOUND_SYSTEM",
      price: prod.price,
      unit: prod.unit,
      stock: prod.stock,
      imageUrl: prod.imageUrl,
      description: prod.description,
      status: prod.status,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const computedStock = Math.max(0, Number(productForm.stock) || 0);
    const computedStatus: UnifiedProduct["status"] =
      computedStock === 0
        ? "HABIS"
        : productForm.status === "HABIS" && computedStock > 0
        ? "TERSEDIA"
        : productForm.status;

    const payload = {
      name: productForm.name,
      category: productForm.category,
      subCategory: productForm.subCategory,
      price: Number(productForm.price),
      unit: productForm.unit || "hari",
      stock: computedStock,
      imageUrl: productForm.imageUrl,
      description: productForm.description,
      status: computedStatus,
    };

    if (editingProductId) {
      try {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProductId, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProductsList((prev) => {
            const next = prev.map((p) => (p.id === editingProductId ? data.product : p));
            saveStoredProducts(next);
            return next;
          });
        } else {
          setProductsList((prev) => {
            const next = prev.map((p) =>
              p.id === editingProductId ? { ...p, ...payload, id: editingProductId } : p
            );
            saveStoredProducts(next);
            return next;
          });
        }
      } catch {
        setProductsList((prev) => {
          const next = prev.map((p) =>
            p.id === editingProductId ? { ...p, ...payload, id: editingProductId } : p
          );
          saveStoredProducts(next);
          return next;
        });
      }
    } else {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProductsList((prev) => {
            const next = [data.product, ...prev];
            saveStoredProducts(next);
            return next;
          });
        }
      } catch {
        const fallbackProd: UnifiedProduct = {
          id: `prod-${Date.now().toString().slice(-6)}`,
          ...payload,
        };
        setProductsList((prev) => {
          const next = [fallbackProd, ...prev];
          saveStoredProducts(next);
          return next;
        });
      }
    }

    setIsProductModalOpen(false);
  };

  const handleQuickAdjustStock = async (prod: UnifiedProduct, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    const newStatus: UnifiedProduct["status"] =
      newStock === 0
        ? "HABIS"
        : prod.status === "HABIS" && newStock > 0
        ? "TERSEDIA"
        : prod.status;

    const updatedProd: UnifiedProduct = {
      ...prod,
      stock: newStock,
      status: newStatus,
    };

    setProductsList((prev) => {
      const next = prev.map((p) => (p.id === prod.id ? updatedProd : p));
      saveStoredProducts(next);
      return next;
    });

    if (previewProductModal && previewProductModal.id === prod.id) {
      setPreviewProductModal(updatedProd);
    }

    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prod.id,
          stock: newStock,
          status: newStatus,
        }),
      });
    } catch {}
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Hapus produk ini dari katalog Cetas Production?")) {
      setProductsList((prev) => {
        const next = prev.filter((p) => p.id !== id);
        saveStoredProducts(next);
        return next;
      });
      try {
        await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      } catch {}
    }
  };

  // ---------------- HIERARCHICAL VOTE & EVENT WORKSPACE HANDLERS ----------------
  const selectedEvent = eventsList.find((ev) => ev.id === selectedEventId) || null;

  const handleToggleAttendeePresence = async (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPresent: !a.isPresent } : a))
    );
    try {
      const target = attendees.find((a) => a.id === id);
      if (target) {
        await fetch("/api/attendees", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeCode: target.badgeCode,
            action: "CHECK_IN",
          }),
        });
      }
    } catch {}
  };

  const handleVerifyAttendee = async (
    id: string,
    newStatus: "CONFIRMED" | "WAITLIST" | "CANCELLED"
  ) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: id,
          action: "UPDATE_STATUS",
          status: newStatus,
          verifiedBy: "Admin CETAS",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(
          newStatus === "CONFIRMED"
            ? "✓ Akun pelatih berhasil diverifikasi & akses dibuka!"
            : "Akses akun pelatih ditangguhkan."
        );
      }
    } catch {
      showSyncToast("Gagal memperbarui status verifikasi");
    }
  };

  const handleDeleteAttendee = async (id: string, name: string) => {
    if (!confirm(`Hapus pendaftaran peserta "${name}"? Kuota pendaftaran akan dikembalikan otomatis.`)) return;
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    // Hapus juga dari eventsList dan sync ke localStorage agar peserta tidak pernah muncul kembali saat refresh
    setEventsList((prevEvents) => {
      const updated = prevEvents.map((ev) => ({
        ...ev,
        lkbbTeams: (ev.lkbbTeams || []).filter(
          (t) => t.teamName.trim().toLowerCase() !== name.trim().toLowerCase()
        ),
        updatedAt: Date.now(),
      }));
      saveStoredEvents(updated);
      return updated;
    });

    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: id,
          action: "DELETE_ATTENDEE",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.attendees) {
          setAttendees(data.attendees);
        }
        showSyncToast(`Peserta "${name}" berhasil dihapus secara permanen.`);
      }
    } catch {
      showSyncToast("Gagal menghapus peserta");
    }
  };

  const handleAssignTmNumber = async (id: string, customNumber?: string) => {
    const targetNumber = (customNumber !== undefined ? customNumber : (tmInputMap[id] || "")).trim();
    if (!targetNumber) {
      showSyncToast("Nomor undian tidak boleh kosong");
      return;
    }
    setSavingTmId(id);
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, tmLotteryNumber: targetNumber, candidateNumber: targetNumber } : a
      )
    );
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: id,
          action: "UPDATE_TM_NUMBER",
          tmNumber: targetNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(`✓ Nomor undian TM berhasil disimpan: #${targetNumber}`);
      }
    } catch {
      showSyncToast("Gagal menyimpan nomor undian TM");
    } finally {
      setSavingTmId(null);
    }
  };

  const handleUpdatePaymentStatus = async (
    id: string,
    nextPaymentStatus: "PAID" | "DP" | "UNPAID",
    totalFee: number
  ) => {
    const paidAmt = nextPaymentStatus === "PAID" ? totalFee : (nextPaymentStatus === "DP" ? Math.round(totalFee / 2) : 0);
    const remAmt = Math.max(0, totalFee - paidAmt);
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              paymentStatus: nextPaymentStatus,
              registrationFeePaid: paidAmt,
              registrationFeeRemaining: remAmt,
            }
          : a
      )
    );
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: id,
          action: "UPDATE_PAYMENT",
          paymentStatus: nextPaymentStatus,
          registrationFeeTotal: totalFee,
          registrationFeePaid: paidAmt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(`✓ Status pembayaran diperbarui: ${nextPaymentStatus}`);
      }
    } catch {
      showSyncToast("Gagal memperbarui status pembayaran");
    }
  };

  const handleToggleCheckInDP1 = async (id: string) => {
    const target = attendees.find((a) => a.id === id);
    if (!target) return;
    const nextVal = !target.checkedInDP1;
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checkedInDP1: nextVal } : a))
    );
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: id,
          action: "CHECK_IN_DP1",
          checkedIn: nextVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(nextVal ? "✓ Pasukan tercatat HADIR di DP 1" : "Status kehadiran DP 1 dibatalkan");
      }
    } catch {
      showSyncToast("Gagal mengubah status DP 1");
    }
  };

  const handleToggleScoreRelease = async () => {
    if (!selectedEvent) return;
    const nextState = !selectedEvent.isScorePublishedToCoaches;
    if (nextState) {
      if (!confirm("Rilis nilai final resmi ke seluruh pelatih? Nilai akan dapat dilihat secara lengkap di bilik pelatih masing-masing.")) return;
    } else {
      if (!confirm("Tutup/rahasiakan kembali nilai final dari pelatih?")) return;
    }
    setIsTogglingScoreRelease(true);
    setEventsList((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id ? { ...e, isScorePublishedToCoaches: nextState } : e
      )
    );
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action: "TOGGLE_SCORE_RELEASE",
          isScorePublished: nextState,
          verifiedBy: currentUser?.name || "Admin CETAS",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSyncToast(
          nextState
            ? "✓ Nilai final resmi BERHASIL DIRILIS ke pelatih!"
            : "🔒 Nilai berhasil ditutup/dirahasiakan dari pelatih."
        );
      }
    } catch {
      showSyncToast("Gagal memperbarui status publikasi nilai");
    } finally {
      setIsTogglingScoreRelease(false);
    }
  };

  // Open and configure certificate TTD & data
  const handleOpenCertConfigModal = () => {
    if (!selectedEvent) return;
    const existing = selectedEvent.certificateConfig;
    setCertConfigForm({
      eventHeading: existing?.eventHeading || selectedEvent.title || "LKBB BARAVOS 2026",
      issueCity: existing?.issueCity || "Jakarta",
      issueDate: existing?.issueDate || (selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "30 Oktober 2026"),
      certificateNumberFormat: existing?.certificateNumberFormat || "[NO]/CETAS-LKBB/X/2026",
      institutionName: existing?.institutionName || "Centralized Electronic Tournament & Award System",
      signer1: {
        role: existing?.signer1?.role || "Ketua Panitia Penyelenggara",
        name: existing?.signer1?.name || "Ardi Purwanto, S.Pd.",
        nipOrId: existing?.signer1?.nipOrId || "NIP. 19910523 201502 1 002",
        signatureUrl: existing?.signer1?.signatureUrl || "",
      },
      signer2: {
        role: existing?.signer2?.role || "Ketua Dewan Juri CETAS",
        name: existing?.signer2?.name || "M. Rian Arifin, S.Pd., M.Han",
        nipOrId: existing?.signer2?.nipOrId || "NIP. 19880412 201101 1 003",
        signatureUrl: existing?.signer2?.signatureUrl || "",
      },
      stampUrl: existing?.stampUrl || "",
    });
    setIsCertConfigModalOpen(true);
  };

  const handleSaveCertConfig = async () => {
    if (!selectedEvent) return;
    setIsSavingCertConfig(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CERTIFICATE_CONFIG",
          eventId: selectedEvent.id,
          certificateConfig: certConfigForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEventsList((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id ? { ...e, certificateConfig: certConfigForm } : e
          )
        );
        setIsCertConfigModalOpen(false);
        showSyncToast("✓ Konfigurasi TTD & Nama Sertifikat berhasil disimpan!");
      } else {
        alert(data.message || "Gagal menyimpan konfigurasi sertifikat");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan konfigurasi sertifikat.");
    } finally {
      setIsSavingCertConfig(false);
    }
  };

  // Champion certificate handlers
  const handleOpenChampionCertModal = (attendee: RegisteredAttendee) => {
    setChampionModalAttendee(attendee);
    setChampionCertTitle(attendee.championCertificateTitle || "Juara 1 Utama LKBB");
    setChampionCertUrl(attendee.championCertificateUrl || "");
  };

  const handleSaveChampionCert = async () => {
    if (!championModalAttendee) return;
    setIsSavingChampionCert(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPLOAD_CHAMPION_CERTIFICATE",
          attendeeId: championModalAttendee.id,
          certificateTitle: championCertTitle,
          certificateUrl: championCertUrl,
          verifiedBy: currentUser?.name || "Admin CETAS",
        }),
      });
      const data = await res.json();
      if (data.success && data.attendee) {
        setAttendees((prev: RegisteredAttendee[]) =>
          prev.map((a: RegisteredAttendee) => (a.id === championModalAttendee.id ? data.attendee : a))
        );
        setChampionModalAttendee(null);
        showSyncToast("✓ Piagam kejuaraan pasukan berhasil disimpan!");
      }
    } catch {
      alert("Gagal menyimpan piagam kejuaraan.");
    } finally {
      setIsSavingChampionCert(false);
    }
  };

  const handleDeleteChampionCert = async () => {
    if (!championModalAttendee) return;
    if (!confirm("Hapus piagam kejuaraan dari pasukan ini?")) return;
    setIsSavingChampionCert(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_CHAMPION_CERTIFICATE",
          attendeeId: championModalAttendee.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAttendees((prev: RegisteredAttendee[]) =>
          prev.map((a: RegisteredAttendee) =>
            a.id === championModalAttendee.id
              ? {
                  ...a,
                  championCertificateUrl: undefined,
                  championCertificateTitle: undefined,
                }
              : a
          )
        );
        setChampionModalAttendee(null);
        showSyncToast("Piagam kejuaraan berhasil dihapus.");
      }
    } catch {
      alert("Gagal menghapus piagam.");
    } finally {
      setIsSavingChampionCert(false);
    }
  };

  // Squad members handlers (Admin)
  const handleOpenAdminSquadModal = (attendee: RegisteredAttendee) => {
    setAdminSquadAttendee(attendee);
    setShowQuickPaste(false);
    setQuickPasteText("");
    const existing = attendee.squadMembers;
    if (existing && existing.length > 0) {
      setAdminSquadForm(existing);
    } else {
      const list: SquadMemberItem[] = [];
      list.push({
        name: attendee.dantonName || "",
        role: "Komandan Peleton (Danton)",
        isReserve: false,
        nisnOrId: "",
      });
      for (let i = 1; i <= 16; i++) {
        const saf = Math.ceil(i / 3);
        const posLabel = i === 1 ? "Penjuru Kanan" : i === 16 ? "Penutup Kiri" : `Saf ${saf} - Banjar ${((i - 1) % 3) + 1}`;
        list.push({
          name: "",
          role: `Personel ${String(i).padStart(2, "0")} (${posLabel})`,
          isReserve: false,
          nisnOrId: "",
        });
      }
      list.push({ name: "", role: "Cadangan 01", isReserve: true, nisnOrId: "" });
      list.push({ name: "", role: "Cadangan 02", isReserve: true, nisnOrId: "" });
      setAdminSquadForm(list);
    }
  };

  const handleApplyQuickPaste = () => {
    if (!quickPasteText.trim()) return;
    const lines = quickPasteText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const updated = [...adminSquadForm];
    lines.forEach((line, idx) => {
      if (idx >= updated.length) return;
      // Strip leading numbering, e.g. "1.", "1. ", "1 -", "1)", "#1"
      const cleaned = line.replace(/^#?\d+[\.\)\-\:\s]+\s*/, "").trim();
      
      let namePart = cleaned;
      let nisnPart = updated[idx].nisnOrId || "";

      if (cleaned.includes("\t")) {
        const parts = cleaned.split("\t");
        namePart = parts[0].trim();
        nisnPart = parts.slice(1).join(" ").trim();
      } else if (cleaned.includes(",")) {
        const parts = cleaned.split(",");
        namePart = parts[0].trim();
        nisnPart = parts.slice(1).join(" ").trim();
      }

      updated[idx] = {
        ...updated[idx],
        name: namePart,
        nisnOrId: nisnPart,
      };
    });

    setAdminSquadForm(updated);
    setShowQuickPaste(false);
    setQuickPasteText("");
    showSyncToast(`✓ Berhasil memuat ${Math.min(lines.length, updated.length)} nama peserta ke susunan formulir!`);
  };

  const handleSaveAdminSquad = async () => {
    if (!adminSquadAttendee) return;
    setIsSavingAdminSquad(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SQUAD_MEMBERS",
          attendeeId: adminSquadAttendee.id,
          squadMembers: adminSquadForm,
          dantonName: adminSquadForm[0]?.name || adminSquadAttendee.dantonName,
        }),
      });
      const data = await res.json();
      if (data.success && data.attendee) {
        setAttendees((prev: RegisteredAttendee[]) =>
          prev.map((a: RegisteredAttendee) => (a.id === adminSquadAttendee.id ? data.attendee : a))
        );
        setAdminSquadAttendee(null);
        showSyncToast("✓ Susunan 16 personel kontingen berhasil disimpan!");
      }
    } catch {
      alert("Gagal menyimpan susunan personel.");
    } finally {
      setIsSavingAdminSquad(false);
    }
  };

  // Open and configure official documents & prerequisite rules (Admin)
  const handleOpenOfficialDocsModal = () => {
    if (!selectedEvent) return;
    const effectiveDocs = getEffectiveOfficialDocuments(selectedEvent);
    const effectiveRules = getEffectivePrerequisiteRules(selectedEvent);
    setOfficialDocsForm(JSON.parse(JSON.stringify(effectiveDocs)));
    setPrerequisiteRulesForm(JSON.parse(JSON.stringify(effectiveRules)));
    setDocsModalSubTab("DOCS");
    setIsOfficialDocsModalOpen(true);
  };

  const handleSaveOfficialDocs = async () => {
    if (!selectedEvent) return;
    setIsSavingOfficialDocs(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_EVENT_DOCS",
          eventId: selectedEvent.id,
          officialDocuments: officialDocsForm,
          prerequisiteRules: prerequisiteRulesForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEventsList((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.id
              ? {
                  ...e,
                  officialDocuments: officialDocsForm,
                  prerequisiteRules: prerequisiteRulesForm,
                }
              : e
          )
        );
        setIsOfficialDocsModalOpen(false);
        showSyncToast("✓ Dokumen resmi & aturan prasyarat event berhasil disimpan!");
      } else {
        alert(data.message || "Gagal menyimpan dokumen event");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan dokumen event.");
    } finally {
      setIsSavingOfficialDocs(false);
    }
  };

  // Open participant prerequisite documents verification modal (Admin)
  const handleOpenAdminDocsModal = (attendee: RegisteredAttendee) => {
    setAdminDocsAttendee(attendee);
    setReviewingDocRuleId(null);
    setRevisionNoteInput("");
  };

  const handleReviewAttendeeDoc = async (
    ruleId: string,
    status: "VERIFIED" | "REVISION",
    note?: string
  ) => {
    if (!adminDocsAttendee) return;
    setIsSavingDocReview(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REVIEW_PREREQUISITE_DOC",
          attendeeId: adminDocsAttendee.id,
          ruleId,
          status,
          reviewNote: note || "",
          reviewedBy: currentUser?.name || "Admin CETAS",
        }),
      });
      const data = await res.json();
      if (data.success && data.attendee) {
        setAttendees((prev: RegisteredAttendee[]) =>
          prev.map((a: RegisteredAttendee) => (a.id === adminDocsAttendee.id ? data.attendee : a))
        );
        setAdminDocsAttendee(data.attendee);
        setReviewingDocRuleId(null);
        setRevisionNoteInput("");
        showSyncToast(
          status === "VERIFIED"
            ? "✓ Berkas prasyarat diverifikasi VALID!"
            : "⚠️ Catatan revisi berkas berhasil dikirim ke pelatih!"
        );
      } else {
        alert(data.message || "Gagal memverifikasi berkas");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat memverifikasi berkas.");
    } finally {
      setIsSavingDocReview(false);
    }
  };

  const syncVotingsToBackend = async (nextVotings: EventVotingConfig[]) => {
    saveStoredEventVotings(nextVotings);
    try {
      const compactPayload = nextVotings.map((v) => ({
        ...v,
        bannerUrl:
          v.bannerUrl && v.bannerUrl.length > 250000
            ? "/lkbb-cemara-2026.jpg"
            : v.bannerUrl || "/lkbb-cemara-2026.jpg",
      }));
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SYNC_VOTINGS",
          eventVotings: compactPayload,
        }),
      });
    } catch {}
  };

  const handleSwitchSubTab = (
    tab: "DETAILS" | "TEAMS" | "SCORE" | "VOTE" | "TICKETS" | "ATTENDEES" | "FINANCES"
  ) => {
    setEventSubTab(tab);
    try {
      sessionStorage.setItem("cetas_admin_event_subtab", tab);
    } catch {}
  };

  const handleSelectEventWorkspace = async (
    eventId: string,
    initialSubTab: "DETAILS" | "TEAMS" | "SCORE" | "VOTE" | "TICKETS" | "ATTENDEES" | "FINANCES" = "DETAILS"
  ) => {
    setSelectedEventId(eventId);
    setSelectedVoteEventId(eventId);
    setEventSubTab(initialSubTab);
    try {
      sessionStorage.setItem("cetas_admin_selected_event_id", eventId);
      sessionStorage.setItem("cetas_admin_event_subtab", initialSubTab);
    } catch {}

    const ev = eventsList.find((e) => e.id === eventId);
    if (ev) {
      hydrateFormAndTiersFromEvent(ev);
      const initialRegCats = getEffectiveRegistrationCategories(ev);

      // Synchronously ensure voting config exists for this event right away
      const existingVote = eventVotings.find((v) => v.eventId === eventId);
      if (!existingVote) {
        const defaultVote: EventVotingConfig = {
          eventId: ev.id,
          eventTitle: ev.title,
          bannerUrl:
            ev.bannerUrl && ev.bannerUrl.length > 250000
              ? "/lkbb-cemara-2026.jpg"
              : ev.bannerUrl || "/lkbb-cemara-2026.jpg",
          themePreset: ev.themePreset || "EMERALD",
          eventDate: ev.date,
          categories: initialRegCats.map((rc) => ({
            id: `cat-${ev.id}-${rc.code.toLowerCase()}`,
            eventId: ev.id,
            title: rc.name,
            description: `Pemilihan peserta / pleton terfavorit ${rc.name}`,
            pricePerVote: 2000,
            candidates: [],
          })),
        };
        const nextVotings = [
          defaultVote,
          ...eventVotings.filter((v) => v.eventId !== ev.id),
        ];
        setEventVotings(nextVotings);
        setSelectedVoteCategoryId(defaultVote.categories[0].id);
        await syncVotingsToBackend(nextVotings);
      } else if (existingVote.categories.length > 0) {
        setSelectedVoteCategoryId(existingVote.categories[0].id);
      }
    }
  };

  // Daftar Pasukan & Pelatih untuk Event yang Sedang Dibuka
  const currentEventAttendees: RegisteredAttendee[] = useMemo(() => {
    if (!selectedEventId) return [];
    return attendees.filter(
      (a: RegisteredAttendee) =>
        a.eventId === selectedEventId ||
        (selectedEvent && a.eventName?.toLowerCase().trim() === selectedEvent.title?.toLowerCase().trim())
    );
  }, [attendees, selectedEventId, selectedEvent]);

  // Prioritize selectedEventId FIRST so activeVoteEvent NEVER falls back to a different event when inside an Event Workspace
  const activeVoteEvent: EventVotingConfig | undefined =
    (selectedEventId
      ? eventVotings.find((ev) => ev.eventId === selectedEventId) ||
        (selectedEvent
          ? {
              eventId: selectedEvent.id,
              eventTitle: selectedEvent.title,
              bannerUrl: selectedEvent.bannerUrl,
              themePreset: selectedEvent.themePreset || "EMERALD",
              eventDate: selectedEvent.date,
              categories: [],
            }
          : undefined)
      : undefined) ||
    eventVotings.find((ev) => ev.eventId === selectedVoteEventId) ||
    eventVotings[0];

  const activeVoteCategory =
    activeVoteEvent?.categories.find((c) => c.id === selectedVoteCategoryId) ||
    activeVoteEvent?.categories[0];

  const activeCategoryCandidates = activeVoteCategory?.candidates || [];

  // Update selected category when activeVoteEvent changes
  useEffect(() => {
    if (activeVoteEvent && activeVoteEvent.categories.length > 0) {
      const exists = activeVoteEvent.categories.some((c) => c.id === selectedVoteCategoryId);
      if (!exists) {
        setSelectedVoteCategoryId(activeVoteEvent.categories[0].id);
      }
    }
  }, [selectedVoteEventId, activeVoteEvent, selectedVoteCategoryId]);

  // A. Buka modal & Hubungkan Event Baru ke Voting
  const handleOpenAddEventVoteModal = () => {
    const available = eventsList.filter((ev) => !eventVotings.some((v) => v.eventId === ev.id));
    if (available.length > 0) {
      setSelectedEventToConnect(available[0].id);
    } else if (eventsList.length > 0) {
      setSelectedEventToConnect(eventsList[0].id);
    } else {
      setSelectedEventToConnect("");
    }
    setIsAddEventVoteModalOpen(true);
  };

  const handleConnectEventToVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedEventToConnect || eventsList[0]?.id;
    if (!targetId) {
      alert("Belum ada event di Cetas. Silakan buat event terlebih dahulu di tab Manajemen Event.");
      return;
    }

    const eventObj = eventsList.find((e) => e.id === targetId);
    if (!eventObj) {
      alert("Event tidak ditemukan. Silakan pilih kembali.");
      return;
    }

    const existing = eventVotings.find((v) => v.eventId === eventObj.id);
    if (existing) {
      setSelectedVoteEventId(existing.eventId);
      if (existing.categories.length > 0) {
        setSelectedVoteCategoryId(existing.categories[0].id);
      }
      setIsAddEventVoteModalOpen(false);
      showSyncToast(`Bilik voting "${eventObj.title}" siap dikelola.`);
      return;
    }

    const newVoteCfg: EventVotingConfig = {
      eventId: eventObj.id,
      eventTitle: eventObj.title,
      bannerUrl:
        eventObj.bannerUrl && eventObj.bannerUrl.length > 250000
          ? "/lkbb-cemara-2026.jpg"
          : eventObj.bannerUrl || "/lkbb-cemara-2026.jpg",
      themePreset: eventObj.themePreset || "EMERALD",
      eventDate: eventObj.date,
      categories: [
        {
          id: `cat-${eventObj.id}-smp`,
          eventId: eventObj.id,
          title: "Tingkat SMP/MTs",
          description: "Pemilihan pleton terfavorit tingkat SMP/MTs",
          pricePerVote: 2000,
          candidates: [],
        },
        {
          id: `cat-${eventObj.id}-sma`,
          eventId: eventObj.id,
          title: "Tingkat SMA/SMK/MA",
          description: "Pemilihan pleton terfavorit tingkat SMA/SMK/MA",
          pricePerVote: 2000,
          candidates: [],
        },
      ],
    };

    const nextVotings = [
      newVoteCfg,
      ...eventVotings.filter((v) => v.eventId !== eventObj.id),
    ];
    setEventVotings(nextVotings);
    setSelectedVoteEventId(newVoteCfg.eventId);
    setSelectedVoteCategoryId(newVoteCfg.categories[0].id);
    setIsAddEventVoteModalOpen(false);
    showSyncToast(`Bilik voting "${eventObj.title}" berhasil diaktifkan & disinkronkan!`);
    await syncVotingsToBackend(nextVotings);
  };

  // B. Tambah / Edit Kategori (SMP, SMA, Purna)
  const handleOpenCreateCategory = () => {
    if (currentUser?.role === "PANITIA") return;
    setEditingCategoryId(null);
    setCategoryForm({
      title: "",
      description: "",
      pricePerVote: 2000,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: VoteCategory) => {
    if (currentUser?.role === "PANITIA") return;
    setEditingCategoryId(cat.id);
    setCategoryForm({
      title: cat.title,
      description: cat.description || "",
      pricePerVote: cat.pricePerVote,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === "PANITIA") {
      alert("Akun Panitia hanya memiliki hak memantau (read-only).");
      return;
    }
    const cleanTitle = categoryForm.title.trim();
    if (!cleanTitle) return;

    const targetEventId =
      selectedEventId || activeVoteEvent?.eventId || selectedVoteEventId || eventsList[0]?.id;
    if (!targetEventId) {
      alert("Silakan buat atau pilih Event terlebih dahulu sebelum menambah kategori vote.");
      return;
    }
    const targetEventObj = eventsList.find((ev) => ev.id === targetEventId);
    const cleanDesc = categoryForm.description.trim() || "Kategori pemilihan favorit";
    const cleanPrice = Number(categoryForm.pricePerVote) || 2000;

    if (editingCategoryId) {
      // EDIT KATEGORI (Optimistic 0ms + Backend Sync)
      const nextVotings = eventVotings.map((ev) => {
        if (ev.eventId !== targetEventId) return ev;
        return {
          ...ev,
          categories: ev.categories.map((c) =>
            c.id === editingCategoryId
              ? {
                  ...c,
                  title: cleanTitle,
                  description: cleanDesc,
                  pricePerVote: cleanPrice,
                }
              : c
          ),
        };
      });

      setEventVotings(nextVotings);
      setIsCategoryModalOpen(false);
      showSyncToast(`✓ Kategori "${cleanTitle}" berhasil diperbarui & disinkronkan!`);
      await syncVotingsToBackend(nextVotings);
    } else {
      // TAMBAH KATEGORI BARU (Optimistic 0ms + Backend Sync)
      const newCat: VoteCategory = {
        id: `cat-${Date.now().toString().slice(-6)}`,
        eventId: targetEventId,
        title: cleanTitle,
        description: cleanDesc,
        pricePerVote: cleanPrice,
        candidates: [],
      };

      const exists = eventVotings.some((ev) => ev.eventId === targetEventId);
      const nextVotings: EventVotingConfig[] = exists
        ? eventVotings.map((ev) => {
            if (ev.eventId !== targetEventId) return ev;
            return { ...ev, categories: [...ev.categories, newCat] };
          })
        : [
            {
              eventId: targetEventId,
              eventTitle:
                targetEventObj?.title || activeVoteEvent?.eventTitle || "LKBB CEMARA 2026",
              bannerUrl:
                targetEventObj?.bannerUrl && targetEventObj.bannerUrl.length <= 250000
                  ? targetEventObj.bannerUrl
                  : "/lkbb-cemara-2026.jpg",
              themePreset:
                targetEventObj?.themePreset || activeVoteEvent?.themePreset || "EMERALD",
              eventDate: targetEventObj?.date || activeVoteEvent?.eventDate || "2026-11-28",
              categories: [newCat],
            },
            ...eventVotings,
          ];

      setEventVotings(nextVotings);
      setSelectedVoteCategoryId(newCat.id);
      setIsCategoryModalOpen(false);
      showSyncToast(`✓ Kategori "${newCat.title}" berhasil ditambahkan & disinkronkan ke Cetas Vote!`);
      await syncVotingsToBackend(nextVotings);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (currentUser?.role === "PANITIA") return;
    const targetEventId =
      selectedEventId || activeVoteEvent?.eventId || selectedVoteEventId;
    if (!targetEventId) return;

    if (confirm("Hapus kategori ini beserta seluruh peserta di dalamnya?")) {
      const nextVotings = eventVotings.map((ev) => {
        if (ev.eventId !== targetEventId) return ev;
        const nextCats = ev.categories.filter((c) => c.id !== catId);
        return { ...ev, categories: nextCats };
      });
      setEventVotings(nextVotings);
      const updatedEv = nextVotings.find((ev) => ev.eventId === targetEventId);
      if (updatedEv && updatedEv.categories.length > 0) {
        setSelectedVoteCategoryId(updatedEv.categories[0].id);
      } else {
        setSelectedVoteCategoryId("");
      }
      showSyncToast("✓ Kategori berhasil dihapus.");
      await syncVotingsToBackend(nextVotings);
    }
  };

  // C. Tambah / Edit Peserta di Kategori Terpilih
  const handleOpenCreateCandidate = () => {
    if (currentUser?.role === "PANITIA") return;
    setEditingCandidateId(null);
    const nextNum = (activeCategoryCandidates.length + 1).toString().padStart(2, "0");
    const instansiPlaceholder = activeVoteCategory?.title.toLowerCase().includes("smp")
      ? "SMP Negeri 1 Jakarta"
      : activeVoteCategory?.title.toLowerCase().includes("sma")
      ? "SMA Negeri 3 Jakarta"
      : "Instansi / Sekolah Peserta";

    setCandidateForm({
      candidateNumber: nextNum,
      name: "",
      institution: instansiPlaceholder,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      tagline: "Visi misi peserta untuk kemajuan dan prestasi.",
      totalVotes: 0,
    });
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (cand: VoteCandidate) => {
    if (currentUser?.role === "PANITIA") return;
    setEditingCandidateId(cand.id);
    setCandidateForm({
      candidateNumber: cand.candidateNumber,
      name: cand.name,
      institution: cand.institution,
      photoUrl: cand.photoUrl,
      tagline: cand.tagline,
      totalVotes: cand.totalVotes,
    });
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === "PANITIA") {
      alert("Akun Panitia hanya memiliki hak memantau (read-only).");
      return;
    }
    const cleanName = candidateForm.name.trim();
    if (!cleanName) return;

    const targetEventId =
      selectedEventId || activeVoteEvent?.eventId || selectedVoteEventId || eventsList[0]?.id;
    if (!targetEventId) {
      alert("Silakan pilih atau buat Event terlebih dahulu.");
      return;
    }
    const targetEventObj = eventsList.find((ev) => ev.id === targetEventId);
    const targetCategoryId =
      activeVoteCategory?.id || selectedVoteCategoryId || `cat-${targetEventId}-smp`;
    const targetCategoryTitle = activeVoteCategory?.title || "Tingkat SMP/MTs";
    const safePhoto =
      candidateForm.photoUrl && candidateForm.photoUrl.trim()
        ? candidateForm.photoUrl
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    if (editingCandidateId) {
      // EDIT PESERTA (Optimistic 0ms + Backend Sync)
      const nextVotings = eventVotings.map((ev) => {
        if (ev.eventId !== targetEventId) return ev;
        return {
          ...ev,
          categories: ev.categories.map((c) => {
            if (c.id !== targetCategoryId) return c;
            return {
              ...c,
              candidates: c.candidates.map((cand) =>
                cand.id === editingCandidateId
                  ? {
                      ...cand,
                      candidateNumber: candidateForm.candidateNumber || cand.candidateNumber,
                      name: cleanName,
                      institution: candidateForm.institution.trim() || "Instansi Peserta",
                      photoUrl: safePhoto,
                      tagline: candidateForm.tagline,
                    }
                  : cand
              ),
            };
          }),
        };
      });

      setEventVotings(nextVotings);
      setIsCandidateModalOpen(false);
      showSyncToast(`✓ Profil peserta "${cleanName}" berhasil diperbarui & disinkronkan!`);
      await syncVotingsToBackend(nextVotings);
    } else {
      // TAMBAH PESERTA BARU (Suara otomatis 0, Optimistic 0ms + Backend Sync)
      const newCand: VoteCandidate = {
        id: `cand-${Date.now().toString().slice(-6)}`,
        eventId: targetEventId,
        categoryId: targetCategoryId,
        candidateNumber:
          candidateForm.candidateNumber ||
          String(activeCategoryCandidates.length + 1).padStart(2, "0"),
        name: cleanName,
        institution: candidateForm.institution.trim() || "Instansi / Sekolah Peserta",
        photoUrl: safePhoto,
        tagline: candidateForm.tagline || "Visi misi peserta untuk kemajuan dan prestasi.",
        totalVotes: 0,
      };

      const eventExists = eventVotings.some((ev) => ev.eventId === targetEventId);
      const nextVotings: EventVotingConfig[] = eventExists
        ? eventVotings.map((ev) => {
            if (ev.eventId !== targetEventId) return ev;
            const catExists = ev.categories.some((c) => c.id === targetCategoryId);
            if (catExists) {
              return {
                ...ev,
                categories: ev.categories.map((c) => {
                  if (c.id !== targetCategoryId) return c;
                  return { ...c, candidates: [...c.candidates, newCand] };
                }),
              };
            } else {
              return {
                ...ev,
                categories: [
                  ...ev.categories,
                  {
                    id: targetCategoryId,
                    eventId: targetEventId,
                    title: targetCategoryTitle,
                    description: "Kategori pemilihan favorit",
                    pricePerVote: 2000,
                    candidates: [newCand],
                  },
                ],
              };
            }
          })
        : [
            {
              eventId: targetEventId,
              eventTitle: targetEventObj?.title || "LKBB CEMARA 2026",
              bannerUrl:
                targetEventObj?.bannerUrl && targetEventObj.bannerUrl.length <= 250000
                  ? targetEventObj.bannerUrl
                  : "/lkbb-cemara-2026.jpg",
              themePreset: targetEventObj?.themePreset || "EMERALD",
              eventDate: targetEventObj?.date || "2026-11-28",
              categories: [
                {
                  id: targetCategoryId,
                  eventId: targetEventId,
                  title: targetCategoryTitle,
                  description: "Kategori pemilihan favorit",
                  pricePerVote: 2000,
                  candidates: [newCand],
                },
              ],
            },
            ...eventVotings,
          ];

      setEventVotings(nextVotings);
      setSelectedVoteCategoryId(targetCategoryId);
      setIsCandidateModalOpen(false);
      showSyncToast(`✓ Peserta "${newCand.name}" berhasil ditambahkan & disinkronkan ke Cetas Vote!`);
      await syncVotingsToBackend(nextVotings);
    }
  };

  const handleDeleteCandidate = async (candId: string) => {
    if (currentUser?.role === "PANITIA") return;
    const targetEventId =
      selectedEventId || activeVoteEvent?.eventId || selectedVoteEventId;
    const targetCategoryId = activeVoteCategory?.id || selectedVoteCategoryId;
    if (!targetEventId || !targetCategoryId) return;

    if (confirm("Hapus peserta ini dari voting?")) {
      const nextVotings = eventVotings.map((ev) => {
        if (ev.eventId !== targetEventId) return ev;
        return {
          ...ev,
          categories: ev.categories.map((c) => {
            if (c.id !== targetCategoryId) return c;
            return {
              ...c,
              candidates: c.candidates.filter((cand) => cand.id !== candId),
            };
          }),
        };
      });
      setEventVotings(nextVotings);
      showSyncToast("✓ Peserta berhasil dihapus dari voting.");
      await syncVotingsToBackend(nextVotings);
    }
  };

  // ---------------- STAFF MANAGEMENT HANDLERS ----------------
  const handleChangeStaffRole = (staffId: string, newRole: AdminRole) => {
    const targetStaff = staffList.find((s) => s.id === staffId);
    const updated = staffList.map((s) => {
      if (s.id === staffId) {
        return {
          ...s,
          role: newRole,
          roleTitle: ROLE_DEFINITIONS[newRole].title,
          ...ROLE_DEFINITIONS[newRole],
        };
      }
      return s;
    });
    setStaffList(updated);
    saveStoredStaffList(updated);

    if (targetStaff) {
      fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          upsertByUsername: true,
          name: targetStaff.name,
          username: targetStaff.email.toLowerCase().trim(),
          pin: targetStaff.password,
          role: newRole,
        }),
      }).catch(() => {});
    }

    if (currentUser?.id === staffId) {
      const updatedUser: AdminUser = {
        ...currentUser,
        role: newRole,
        roleTitle: ROLE_DEFINITIONS[newRole].title,
        ...ROLE_DEFINITIONS[newRole],
      };
      setCurrentUser(updatedUser);
      saveAdminSession(updatedUser);
    }
  };

  const handleAddNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) return;

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffForm),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Gagal membuat akun staf.");
        return;
      }
      const newStaff = data.staff;
      const updated = [...staffList.filter((s) => s.id !== newStaff.id), newStaff];
      setStaffList(updated);
      saveStoredStaffList(updated);

      showSyncToast(`✓ Akun '${newStaff.name}' (${newStaff.roleTitle}) berhasil disimpan permanen ke database!`);
      setNewStaffForm({
        name: "",
        email: "",
        password: "",
        role: "STAFF_REKAP" as AdminRole,
        assignedEventId: "",
        assignedEventTitle: "",
      });
      setNewStaffModal(false);
    } catch (err: any) {
      alert("Terjadi kesalahan saat menyimpan akun staf: " + err.message);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (staffId === "usr-super-01") {
      alert("Akun Super Admin utama tidak boleh dihapus.");
      return;
    }
    const target = staffList.find((s) => s.id === staffId);
    if (!confirm(`Hapus akun '${target?.name || staffId}' secara permanen dari database? Akun ini tidak akan dapat login lagi.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(staffId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Gagal menghapus akun staf.");
        return;
      }

      const updated = staffList.filter((s) => s.id !== staffId);
      setStaffList(updated);
      saveStoredStaffList(updated);
      showSyncToast(data.message || "✓ Akun berhasil dihapus permanen dari database.");

      // Jika yang dihapus adalah akun yang sedang aktif, logout
      if (currentUser?.id === staffId) {
        handleLogout();
      }
    } catch (err: any) {
      alert("Gagal menghapus akun: " + err.message);
    }
  };

  // ----------------------------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 shadow-md">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Sistem Autentikasi Terproteksi
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Lingkup Kerja Perusahaan Cetas
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Masukkan kredensial resmi yang terdaftar. Sistem dilindungi autentikasi terenkripsi dan otorisasi berbasis role (RBAC).
              </p>
            </div>
          </div>

          {authError && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Resmi Akun Cetas
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan email atau username (admin, scanner, prod, dll)..."
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Keamanan
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold py-3 text-xs shadow-md transition active:scale-95"
            >
              <ShieldCheck className="h-4 w-4" />
              Masuk Ke Lingkup Kerja Cetas
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Proteksi Keamanan Aktif • Pembuatan akun staf baru hanya dapat dilakukan oleh Super Admin di dalam sistem.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // ----------------------------------------------------------------------
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isScannerStaff = currentUser.role === "SCANNER_STAFF";
  const isProdAdmin = currentUser.role === "PROD_ADMIN";
  const isEventAdmin = currentUser.role === "EVENT_ADMIN";
  const isFinanceAdmin = currentUser.role === "FINANCE_ADMIN";
  const isPanitia = currentUser.role === "PANITIA";
  const isStaffRekap = currentUser.role === "STAFF_REKAP";

  const canManageEvents = (currentUser.canApproveEvents || isSuperAdmin) && !isPanitia;
  const canManageProd = (currentUser.canManageProduction || isSuperAdmin) && !isPanitia;
  const canManageVote = (currentUser.canApproveEvents || isSuperAdmin) && !isPanitia;

  // Filter event sesuai wewenang (Event Admin & Panitia hanya dapat melihat event yang ditugaskan)
  const accessibleEvents =
    (isEventAdmin || isPanitia) && currentUser.assignedEventId
      ? eventsList.filter((e) => e.id === currentUser.assignedEventId)
      : eventsList;

  // Keuangan event saat ini dari live breakdown & tier kuota
  const currentEventFinances = selectedEvent
    ? eventFinancesData.find((f: any) => f.eventId === selectedEvent.id) || null
    : null;

  const eventTierCalculatedRevenue = (selectedEvent?.tiers || []).reduce((sum, t) => {
    const tierStat = currentEventFinances?.tiers?.find(
      (x: any) => x.tierName?.toLowerCase().trim() === t.name?.toLowerCase().trim()
    );
    const sold = Number(tierStat?.sold) > 0 
      ? Number(tierStat?.sold) 
      : Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
    return sum + sold * (Number(t.price) || 0);
  }, 0);

  const eventCalculatedTicketsSold = (selectedEvent?.tiers || []).reduce((sum, t) => {
    const tierStat = currentEventFinances?.tiers?.find(
      (x: any) => x.tierName?.toLowerCase().trim() === t.name?.toLowerCase().trim()
    );
    const sold = Number(tierStat?.sold) > 0 
      ? Number(tierStat?.sold) 
      : Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
    return sum + sold;
  }, 0);

  const effectiveCurrentEventTicketRevenue = Math.max(
    Number(currentEventFinances?.ticketRevenue) || 0,
    eventTierCalculatedRevenue
  );

  const effectiveCurrentEventTicketsSold = Math.max(
    Number(currentEventFinances?.ticketsSold) || 0,
    eventCalculatedTicketsSold
  );

  const effectiveCurrentEventTotalRevenue = Math.max(
    Number(currentEventFinances?.totalRevenue) || 0,
    effectiveCurrentEventTicketRevenue + (Number(currentEventFinances?.voteRevenue) || 0)
  );

  const currentEventRecentOrders = (currentEventFinances?.recentOrders && currentEventFinances.recentOrders.length > 0)
    ? currentEventFinances.recentOrders
    : globalRecentOrders.filter((ord: any) => ord.eventId === selectedEvent?.id || ord.eventName?.toLowerCase().includes("baravos"));

  // Computed live / fallback finances across all events:
  const effectiveTicketOmzet = Math.max(
    Number(finances.ticketOmzet) || 0,
    eventFinancesData.reduce((sum, ev) => sum + (Number(ev.ticketRevenue) || 0), 0),
    eventsList.reduce((sum, ev) => {
      return sum + (ev.tiers || []).reduce((tsum, t) => {
        const sold = Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
        return tsum + sold * (Number(t.price) || 0);
      }, 0);
    }, 0)
  );

  const effectiveTicketsSold = Math.max(
    Number(finances.ticketsSold) || 0,
    eventFinancesData.reduce((sum, ev) => sum + (Number(ev.ticketsSold) || 0), 0),
    eventsList.reduce((sum, ev) => {
      return sum + (ev.tiers || []).reduce((tsum, t) => {
        return tsum + Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
      }, 0);
    }, 0)
  );

  const effectiveTotalOmzet = Math.max(
    Number(finances.totalOmzet) || 0,
    effectiveTicketOmzet + Number(finances.voteOmzet || 0) + Number(finances.prodOmzet || 0)
  );

  // =========================================================================
  // KHUSUS ROLE SCANNER_STAFF: WORKSPACE TERKUNCI & EKSKLUSIF
  // Hanya bisa akses: 1. Scan Barcode Masuk (/scanner) & 2. Daftar Hadir Penonton Gate
  // Tidak bisa membuka modul acara, keuangan, scoring, voting, dll.
  // =========================================================================
  if (isScannerStaff) {
    const activeEv = selectedEvent || (eventsList.length > 0 ? (eventsList.find(e => e.id === "ev-343802") || eventsList[0]) : null);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Gatekeeper */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              🚪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300">
                  {ROLE_DEFINITIONS.SCANNER_STAFF.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser.email} • Wewenang Khusus: Pintu Gate Masuk & Absensi Penonton
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition active:scale-95 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Keluar Sesi
          </button>
        </div>

        {/* Quick Launch Card Kamera Scanner */}
        <div className="rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Pemindai E-Tiket Gatekeeper (Kamera Scanner)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Buka kamera scanner untuk validasi QR e-tiket pengunjung di gerbang masuk. Status tiket penonton akan otomatis tersinkronisasi menjadi SUDAH HADIR di daftar bawah.
              </p>
            </div>
          </div>

          <Link
            href={`/scanner${activeEv ? `?eventId=${activeEv.id}` : ""}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 transition active:scale-95 shrink-0"
          >
            <Ticket className="h-5 w-5" />
            Buka Kamera Scanner Gate &rarr;
          </Link>
        </div>

        {/* Event Selector */}
        {eventsList.length > 1 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Acara / Event:</span>
            <select
              value={selectedEventId || (activeEv?.id || "")}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedEventId(id);
                fetchEventTickets(id);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white max-w-xs"
            >
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Attendance Board (Daftar Hadir Penonton) */}
        {activeEv && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-emerald-500" />
                  Daftar Hadir Penonton Gate: {activeEv.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Data e-tiket penonton dan status kehadiran hasil pemindaian pintu gerbang secara real-time.
                </p>
              </div>

              <button
                onClick={() => {
                  if (activeEv) fetchEventTickets(activeEv.id);
                  showSyncToast("✓ Data kehadiran penonton berhasil diperbarui.");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 transition shadow-sm"
              >
                🔄 Refresh Hadir Real-Time
              </button>
            </div>

            {/* Metric Cards Kehadiran Penonton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 font-semibold">Total Tiket Penonton</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {eventTicketsSummary.totalTickets}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Penonton terdaftar di sistem</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Sudah Hadir di Venue</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {eventTicketsSummary.attendedCount}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Berhasil di-scan di gate</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Belum Hadir di Pintu Gate</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {eventTicketsSummary.pendingCount}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Menunggu kedatangan penonton</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold">Persentase Kehadiran</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {eventTicketsSummary.attendanceRate}%
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Tingkat kehadiran penonton</div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setTicketStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    ticketStatusFilter === "ALL"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  Semua Tiket ({eventTickets.length})
                </button>
                <button
                  onClick={() => setTicketStatusFilter("USED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    ticketStatusFilter === "USED"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  <CheckCircle className="h-3 w-3" />
                  Sudah Hadir ({eventTicketsSummary.attendedCount})
                </button>
                <button
                  onClick={() => setTicketStatusFilter("ACTIVE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    ticketStatusFilter === "ACTIVE"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  Belum Hadir ({eventTicketsSummary.pendingCount})
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Cari kode tiket / nama / WhatsApp..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Table Daftar Tiket Penonton */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Kode Tiket &amp; Order</th>
                    <th className="p-3.5">Nama Pemegang Tiket</th>
                    <th className="p-3.5">Kontak WhatsApp / Email</th>
                    <th className="p-3.5">Kategori / Tier</th>
                    <th className="p-3.5">Status Kehadiran Gate</th>
                    <th className="p-3.5 text-right">Aksi Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {eventTickets
                    .filter((t) => {
                      if (ticketStatusFilter === "USED") return t.status === "USED" || t.checkedInAt !== null;
                      if (ticketStatusFilter === "ACTIVE") return t.status === "ACTIVE" && t.checkedInAt === null;
                      return true;
                    })
                    .filter((t) => {
                      if (!ticketSearchQuery.trim()) return true;
                      const q = ticketSearchQuery.toLowerCase();
                      return (
                        (t.ticketCode && t.ticketCode.toLowerCase().includes(q)) ||
                        (t.holderName && t.holderName.toLowerCase().includes(q)) ||
                        (t.holderPhone && t.holderPhone.toLowerCase().includes(q)) ||
                        (t.holderEmail && t.holderEmail.toLowerCase().includes(q)) ||
                        (t.tierName && t.tierName.toLowerCase().includes(q)) ||
                        (t.orderNumber && t.orderNumber.toLowerCase().includes(q))
                      );
                    })
                    .map((t) => {
                      const isAttended = t.status === "USED" || t.checkedInAt !== null;
                      const cleanPhone = (t.holderPhone || "").replace(/^0/, "62").replace(/[^0-9]/g, "");
                      const formattedWIB = t.checkedInAt
                        ? new Date(t.checkedInAt).toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          }) + " WIB"
                        : "-";

                      return (
                        <tr key={t.id || t.ticketCode} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 block w-max">
                              {t.ticketCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate max-w-[150px]">
                              {t.orderNumber}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-slate-900 dark:text-white text-xs">{t.holderName}</div>
                            <div className="text-[10px] text-slate-400">Pembelian: {formatDateTime(t.createdAt)}</div>
                          </td>
                          <td className="p-3.5">
                            {t.holderPhone ? (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-emerald-600 hover:underline font-bold text-xs flex items-center gap-1"
                              >
                                📱 {t.holderPhone}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                            <span className="text-[10px] text-slate-400 block">{t.holderEmail || "-"}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
                              {t.tierName || "Regular Ticket"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isAttended ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                  SUDAH HADIR
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                  Scan: {formattedWIB}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-black">
                                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                                  BELUM HADIR
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Menunggu scan di gate
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleToggleTicketAttendance(t.ticketCode, t.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                isAttended
                                  ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100"
                                  : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                              }`}
                            >
                              {isAttended ? "Batal Hadir" : "✓ Tandai Hadir"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {eventTickets.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Belum ada tiket penonton yang diterbitkan untuk event ini.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Akun & Session Bar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
              isSuperAdmin ? "bg-amber-500 text-white" : currentUser.avatarColor
            }`}
          >
            {isSuperAdmin ? <Crown className="h-6 w-6" /> : currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${ROLE_DEFINITIONS[currentUser.role]?.badgeColor || "bg-slate-100 text-slate-800"}`}
              >
                {currentUser.roleTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} • {ROLE_DEFINITIONS[currentUser.role]?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isSuperAdmin && (
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <Ticket className="h-3.5 w-3.5" />
              Buka Scanner Gate
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Sesi
          </button>
        </div>
      </div>

      {/* Floating Sync Notification Toast */}
      {syncNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-2xl border border-emerald-400/50 bg-emerald-950/95 text-white px-4 py-3.5 shadow-2xl shadow-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
            ✓
          </div>
          <div className="text-xs font-bold leading-snug flex-1">{syncNotice}</div>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            className="text-emerald-300 hover:text-white text-xs font-black px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Super Admin Quick Controls */}
      {isSuperAdmin && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                Mode Super Admin Aktif (Otoritas Penuh)
              </span>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                Anda dapat membuat dan mengedit Event, Produk Production, Suara Vote (Event &rarr; Kategori &rarr; Peserta), Iklan, Finansial, dan Role Staf.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingFinances(!isEditingFinances)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditingFinances ? "Tutup Editor Omzet" : "Rubah Angka Omzet"}
            </button>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Ticket className="h-3.5 w-3.5" />
              Buka Scanner Gate
            </Link>
          </div>
        </div>
      )}

      {/* Scanner Staff Dedicated Quick Portal */}
      {currentUser.role === "SCANNER_STAFF" && (
        <div className="rounded-2xl border border-blue-300 dark:border-blue-700/80 bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black text-blue-950 dark:text-blue-200">
                Akses Gatekeeper & Scanner Masuk Aktif
              </span>
              <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 mt-0.5">
                Akun Anda memiliki izin resmi untuk memvalidasi dan check-in e-tiket peserta di pintu masuk gerbang event.
              </p>
            </div>
          </div>

          <Link
            href="/scanner"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition shrink-0"
          >
            <Ticket className="h-3.5 w-3.5" />
            Buka Kamera Scanner Gate &rarr;
          </Link>
        </div>
      )}

      {/* Financial KPIs (Super Admin & Staff Finance Only) */}
      {(isSuperAdmin || isFinanceAdmin) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Omzet Cetas</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(effectiveTotalOmzet)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> {effectiveTotalOmzet > 0 ? "+18.4% bulan ini" : "Mulai pencatatan baru"}
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Cetas Ticketing</span>
              <Ticket className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(effectiveTicketOmzet)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{effectiveTicketsSold} tiket terjual</div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Cetas Vote</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(finances.voteOmzet)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {finances.votesCount.toLocaleString()} suara berbayar
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Cetas Production</span>
              <ShoppingBag className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(finances.prodOmzet)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Merch & sewa sound/lighting</div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation (Sesuai Role-Based Access Control) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {(isSuperAdmin || isEventAdmin || isPanitia || isScannerStaff || isStaffRekap) && (
          <button
            onClick={() => setActiveTab("EVENTS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
              activeTab === "EVENTS"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            {isScannerStaff ? "Daftar Hadir Penonton" : `Pusat Event (${accessibleEvents.length})`}
            {selectedEvent && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold ml-1">
                Aktif: {selectedEvent.title.slice(0, 15)}...
              </span>
            )}
          </button>
        )}

        {(isSuperAdmin || isProdAdmin) && (
          <button
            onClick={() => setActiveTab("PRODUCTION")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === "PRODUCTION"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Package className="h-3.5 w-3.5 text-purple-500" />
            Cetas Production ({productsList.length})
          </button>
        )}

        {(isSuperAdmin || isFinanceAdmin) && (
          <button
            onClick={() => {
              setActiveTab("FINANCES");
              fetch("/api/admin/finances", { cache: "no-store" })
                .then((r) => r.json())
                .then((d) => {
                  if (d.success && d.finances) setFinances(d.finances);
                  if (d.success && Array.isArray(d.eventBreakdowns)) setEventFinancesData(d.eventBreakdowns);
                })
                .catch(() => {});
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === "FINANCES"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Arus Kas & Keuangan Cetas
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("SUBMISSIONS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === "SUBMISSIONS"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            Proposal Masuk ({submissions.filter((s) => s.status === "PENDING").length})
          </button>
        )}

        {(isSuperAdmin || currentUser.canManageAds) && (
          <button
            onClick={() => setActiveTab("ADS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === "ADS"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5 text-rose-500" />
            Iklan Cetas Kita ({ads.length})
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("STAFF")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
              activeTab === "STAFF"
                ? "bg-amber-500 text-white border-amber-600 shadow-md"
                : "border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            Kelola Akun Staf & Role ({staffList.length})
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === "AUDIT"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Log Audit
          </button>
        )}
      </div>

      {/* TAB: PUSAT & LINGKUP KERJA EVENT CETAS (TERPISAH & TERPADU) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "EVENTS" && (
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* LEVEL 1: KATALOG & DAFTAR SEMUA EVENT (KLIK EVENT UNTUK DETAIL) */}
          {/* ============================================================== */}
          {!selectedEventId && (
            <div className="space-y-6">
              {/* Header Pusat Event */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[11px] font-black mb-2">
                      <Calendar className="h-3.5 w-3.5 text-orange-600" />
                      Pusat Manajemen Event Cetas
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Lingkup Kerja Event Terpadu
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Penjurian (<strong>CETAS.SCORE</strong>), <strong>Bilik Voting</strong>, <strong>Tiket & Scanner</strong>, dan <strong>Daftar Peserta</strong> terisolasi secara mandiri pada setiap event. Klik salah satu event di bawah untuk langsung membuka seluruh modul operasionalnya.
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <button
                      onClick={handleOpenCreateEvent}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition active:scale-95 shrink-0"
                    >
                      <PlusCircle className="h-4 w-4" />
                      + Buat Event Baru
                    </button>
                  )}
                </div>

                {/* Filter & Search Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      placeholder="Cari event, penyelenggara, atau lokasi..."
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">Kategori:</span>
                    <select
                      value={eventCategoryFilter}
                      onChange={(e) => setEventCategoryFilter(e.target.value)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="ALL">Semua Kategori ({eventsList.length})</option>
                      {EVENT_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {accessibleEvents
                  .filter((ev) => {
                    const q = eventSearchQuery.toLowerCase().trim();
                    const matchQ =
                      !q ||
                      ev.title.toLowerCase().includes(q) ||
                      ev.organizer.toLowerCase().includes(q) ||
                      ev.location.toLowerCase().includes(q);
                    const matchC =
                      eventCategoryFilter === "ALL" || ev.category === eventCategoryFilter;
                    return matchQ && matchC;
                  })
                  .map((ev) => {
                    const theme = getEventTheme(ev.themePreset);
                    const voteCfg = eventVotings.find((v) => v.eventId === ev.id);

                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectEventWorkspace(ev.id)}
                        className={`group cursor-pointer rounded-3xl border-2 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${theme.borderLightClass}`}
                      >
                        {/* Banner & Badges Header */}
                        <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
                          {ev.bannerUrl ? (
                            <img
                              src={ev.bannerUrl}
                              alt={ev.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className={`w-full h-full ${theme.bgGradient} opacity-80`} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md bg-white/95 text-slate-950">
                              {ev.category}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm text-white backdrop-blur-md ${
                                ev.status === "PUBLISHED"
                                  ? "bg-emerald-600/90"
                                  : ev.status === "DRAFT"
                                  ? "bg-amber-600/90"
                                  : "bg-slate-700/90"
                              }`}
                            >
                              {ev.status}
                            </span>
                          </div>

                          {/* Organizer Label Bottom Left of Banner */}
                          <div className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white/90 drop-shadow">
                            Oleh {ev.organizer}
                          </div>

                          {/* Event Mascot Floating on Card Banner */}
                          {ev.mascotUrl && (
                            <img
                              src={ev.mascotUrl}
                              alt="Maskot Event"
                              className="absolute -bottom-1 right-2 w-14 h-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] z-10 pointer-events-none group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-orange-500 transition line-clamp-2">
                              {ev.title}
                            </h4>

                            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                <span>{ev.date}</span>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span>{ev.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                              {ev.description}
                            </p>
                          </div>

                          {/* Modular Capabilities Badge Strip */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEventWorkspace(ev.id, "SCORE");
                                }}
                                className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-center border border-purple-100 dark:border-purple-900/50 transition"
                              >
                                ⚖️ CETAS.SCORE
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEventWorkspace(ev.id, "VOTE");
                                }}
                                className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-center border border-amber-100 dark:border-amber-900/50 transition"
                              >
                                🗳️ {voteCfg?.categories.length || 0} Kategori Vote
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEventWorkspace(ev.id, "TICKETS");
                                }}
                                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-center border border-blue-100 dark:border-blue-900/50 transition"
                              >
                                🎫 {ev.isOpenTicketing ? `${ev.tiers?.length || 1} Tier Tiket` : "RSVP Online"}
                              </button>
                            </div>

                            {/* Action Button: Buka Lingkup Kerja */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                className="flex-1 py-2.5 px-3 rounded-2xl bg-orange-500 group-hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-95"
                              >
                                Buka Lingkup Kerja Event
                                <ChevronRight className="h-4 w-4" />
                              </button>

                              {canManageEvents && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditEvent(ev);
                                  }}
                                  title="Edit Info Ringkas Event"
                                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              )}

                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(ev.id);
                                  }}
                                  title="Hapus Event"
                                  className="p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {eventsList.length === 0 && (
                <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-500">Belum ada event yang dibuat.</div>
                  <button
                    onClick={handleOpenCreateEvent}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                  >
                    + Buat Event Pertama
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 2: SELECTED EVENT WORKSPACE (DETAIL, SCORE, VOTE, TIKET) */}
          {/* ============================================================== */}
          {selectedEventId && selectedEvent && (
            <div className="space-y-6">
              {/* Workspace Navigation Top Breadcrumb */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedEventId(null);
                        try {
                          sessionStorage.removeItem("cetas_admin_selected_event_id");
                        } catch {}
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition active:scale-95 shadow-sm"
                    >
                      <ArrowLeft className="h-4 w-4 text-orange-500" />
                      Semua Event
                    </button>
                    {selectedEvent.mascotUrl && (
                      <div className="relative group shrink-0">
                        <img
                          src={selectedEvent.mascotUrl}
                          alt="Maskot"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-2xl p-1 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 dark:border-orange-900/60 shadow-sm drop-shadow group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white shadow">
                          ✓
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                          {selectedEvent.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {selectedEvent.id}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                        {selectedEvent.title}
                      </h2>
                    </div>
                  </div>

                  {/* Quick Public Links */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/vote?eventId=${selectedEvent.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                      Bilik Vote Publik
                    </Link>

                    <Link
                      href={`/score?eventId=${selectedEvent.id}&mode=admin`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                      CETAS.SCORE Master
                    </Link>

                    {!isPanitia && (
                      <Link
                        href={`/scanner?eventId=${selectedEvent.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition"
                      >
                        <Ticket className="h-3.5 w-3.5 text-blue-600" />
                        Scanner Pintu Masuk
                      </Link>
                    )}
                  </div>
                </div>

                {/* Panitia Pemantau Alert */}
                {isPanitia && (
                  <div className="rounded-2xl border border-teal-300 dark:border-teal-700/80 bg-teal-500/10 p-3.5 mb-2 flex items-center gap-3">
                    <span className="text-xl">👁️</span>
                    <div>
                      <div className="text-xs font-black text-teal-950 dark:text-teal-200">
                        Mode Pemantau Panitia Aktif (Read-Only)
                      </div>
                      <div className="text-[11px] text-teal-900/80 dark:text-teal-300/80">
                        Anda memiliki hak memantau seluruh jalannya event ini, penjualan tiket, rekonsiliasi keuangan, dan absensi penonton tanpa izin mengubah data.
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tabs Selector for this Event */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {!isScannerStaff && (
                    <>
                      <button
                        onClick={() => handleSwitchSubTab("DETAILS")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "DETAILS"
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        1. Detail &amp; Pengaturan Event
                      </button>

                      <button
                        onClick={() => handleSwitchSubTab("TEAMS")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "TEAMS"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        2. Pasukan &amp; Pelatih ({currentEventAttendees.length})
                      </button>

                      <button
                        onClick={() => handleSwitchSubTab("SCORE")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "SCORE"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        3. Penjurian LKBB (CETAS.SCORE)
                      </button>

                      <button
                        onClick={() => handleSwitchSubTab("VOTE")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "VOTE"
                            ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Award className="h-3.5 w-3.5" />
                        4. Bilik Voting ({activeVoteEvent?.categories.length || 0} Kategori)
                      </button>

                      <button
                        onClick={() => handleSwitchSubTab("TICKETS")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "TICKETS"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        5. Kuota Tiket Masuk
                      </button>

                      <button
                        onClick={() => handleSwitchSubTab("FINANCES")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                          eventSubTab === "FINANCES"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        6. Keuangan Event ({formatRupiah(currentEventFinances?.totalRevenue || 0)})
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleSwitchSubTab("ATTENDEES")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "ATTENDEES"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {isScannerStaff ? "Daftar Hadir Penonton Gate" : "7. Daftar Hadir Penonton"} ({eventTickets.length})
                  </button>                </div>
              </div>

              {/* ========================================================== */}
              {/* SUB-TAB 1: DETAIL & PENGATURAN EVENT */}
              {/* ========================================================== */}
              {eventSubTab === "DETAILS" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
                  {isPanitia && (
                    <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 p-4 text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2.5 shadow-sm">
                      <span className="text-lg">👁️</span>
                      <span>Mode Pemantau Panitia Aktif: Anda hanya memiliki hak membaca data dan memantau jalannya event. Seluruh formulir terkunci (Read-Only).</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-orange-500" />
                        Detail & Pengaturan Event
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ubah judul acara, penyelenggara, tanggal, lokasi, kuota, serta pengaturan tiket dan pendaftaran.
                      </p>
                    </div>

                    {!isPanitia && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenOfficialDocsModal}
                          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/25 transition active:scale-95 flex items-center gap-1.5"
                        >
                          <FileText className="h-4 w-4" />
                          <span>📁 Kelola Dokumen &amp; Juknis</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveEvent()}
                          className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition active:scale-95"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveEvent(e);
                    }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nama / Judul Event *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isPanitia}
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Penyelenggara (EO / Komunitas) *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isPanitia}
                          value={eventForm.organizer}
                          onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Kategori Event
                        </label>
                        <select
                          disabled={isPanitia}
                          value={isCustomCategory ? "LAINNYA" : eventForm.category}
                          onChange={(e) => {
                            if (e.target.value === "LAINNYA") {
                              setIsCustomCategory(true);
                            } else {
                              setIsCustomCategory(false);
                              setEventForm({ ...eventForm, category: e.target.value });
                            }
                          }}
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        >
                          {EVENT_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                          <option value="LAINNYA">+ Kategori Lainnya (Ketik Manual)</option>
                        </select>
                        {isCustomCategory && (
                          <input
                            type="text"
                            disabled={isPanitia}
                            placeholder="Ketik kategori..."
                            value={customCategoryText}
                            onChange={(e) => setCustomCategoryText(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-orange-300 px-3 py-1.5 text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Preset Tema Visual
                        </label>
                        <select
                          disabled={isPanitia}
                          value={eventForm.themePreset}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              themePreset: e.target.value as EventThemePreset,
                            })
                          }
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        >
                          {Object.keys(EVENT_THEME_PRESETS).map((key) => (
                            <option key={key} value={key}>
                              {EVENT_THEME_PRESETS[key as EventThemePreset].name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Status Tayang Event
                        </label>
                        <select
                          disabled={isPanitia}
                          value={eventForm.status}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              status: e.target.value as UnifiedEvent["status"],
                            })
                          }
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        >
                          <option value="PUBLISHED">🟢 PUBLISHED (Tayang Aktif)</option>
                          <option value="DRAFT">🟡 DRAFT (Konsep / Segera Hadir)</option>
                          <option value="FINISHED">🔴 FINISHED (Selesai)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Tanggal Pelaksanaan
                        </label>
                        <input
                          type="date"
                          disabled={isPanitia}
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Waktu / Jam
                        </label>
                        <input
                          type="text"
                          disabled={isPanitia}
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          placeholder="08:00 - 17:00 WIB"
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Lokasi / Venue
                        </label>
                        <input
                          type="text"
                          disabled={isPanitia}
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          placeholder="Nama Gedung / Kota"
                          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white ${
                            isPanitia ? "cursor-not-allowed opacity-75" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {!isPanitia && (
                      <div>
                        <FileUpload
                          label="Banner Poster Acara"
                          description="Upload gambar banner event (Format PNG, JPG, WEBP)"
                          accept="image/*"
                          value={eventForm.bannerUrl}
                          onChange={(dataUrl) => setEventForm({ ...eventForm, bannerUrl: dataUrl })}
                          aspectRatio="banner"
                        />
                      </div>
                    )}

                    {!isPanitia && (
                      <div>
                        <MascotSelector
                          value={eventForm.mascotUrl}
                          onChange={(val) => setEventForm({ ...eventForm, mascotUrl: val })}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Deskripsi Lengkap Acara
                      </label>
                      <textarea
                        rows={3}
                        disabled={isPanitia}
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs text-slate-900 dark:text-white ${
                          isPanitia ? "cursor-not-allowed opacity-75" : ""
                        }`}
                      />
                    </div>

                    {/* Fitur Tiket & RSVP Toggle Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-blue-950 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isPanitia}
                              checked={eventForm.isOpenTicketing}
                              onChange={(e) =>
                                setEventForm({ ...eventForm, isOpenTicketing: e.target.checked })
                              }
                              className="rounded h-4 w-4 text-blue-600"
                            />
                            Buka Penjualan Tiket Cetas
                          </label>
                          <button
                            type="button"
                            onClick={() => setEventSubTab("TICKETS")}
                            className="text-[10px] font-black text-blue-600 hover:underline"
                          >
                            Kelola Multi-Tier Tiket &rarr;
                          </button>
                        </div>
                        {eventForm.isOpenTicketing && (
                          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Nama Tier Utama:</span>
                              <input
                                type="text"
                                disabled={isPanitia}
                                value={eventForm.ticketTierName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEventForm({ ...eventForm, ticketTierName: val });
                                  setEventTiers((prev) =>
                                    prev.length > 0
                                      ? prev.map((t, idx) => (idx === 0 ? { ...t, name: val } : t))
                                      : [
                                          {
                                            id: `tier-${Date.now()}`,
                                            name: val,
                                            price: eventForm.ticketPrice,
                                            quotaTotal: eventForm.ticketQuota,
                                            quotaRemaining: eventForm.ticketQuota,
                                            benefits: ["E-Ticket QR Code Resmi"],
                                          },
                                        ]
                                  );
                                }}
                                className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold ${
                                  isPanitia ? "cursor-not-allowed opacity-75" : ""
                                }`}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Harga (Rp):</span>
                              <input
                                type="number"
                                disabled={isPanitia}
                                value={eventForm.ticketPrice}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEventForm({ ...eventForm, ticketPrice: val });
                                  setEventTiers((prev) =>
                                    prev.length > 0
                                      ? prev.map((t, idx) => (idx === 0 ? { ...t, price: val } : t))
                                      : [
                                          {
                                            id: `tier-${Date.now()}`,
                                            name: eventForm.ticketTierName,
                                            price: val,
                                            quotaTotal: eventForm.ticketQuota,
                                            quotaRemaining: eventForm.ticketQuota,
                                            benefits: ["E-Ticket QR Code Resmi"],
                                          },
                                        ]
                                  );
                                }}
                                className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold ${
                                  isPanitia ? "cursor-not-allowed opacity-75" : ""
                                }`}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Kuota:</span>
                              <input
                                type="number"
                                disabled={isPanitia}
                                value={eventForm.ticketQuota}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEventForm({ ...eventForm, ticketQuota: val });
                                  setEventTiers((prev) =>
                                    prev.length > 0
                                      ? prev.map((t, idx) =>
                                          idx === 0
                                            ? { ...t, quotaTotal: val, quotaRemaining: val }
                                            : t
                                        )
                                      : [
                                          {
                                            id: `tier-${Date.now()}`,
                                            name: eventForm.ticketTierName,
                                            price: eventForm.ticketPrice,
                                            quotaTotal: val,
                                            quotaRemaining: val,
                                            benefits: ["E-Ticket QR Code Resmi"],
                                          },
                                        ]
                                  );
                                }}
                                className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold ${
                                  isPanitia ? "cursor-not-allowed opacity-75" : ""
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isPanitia}
                              checked={eventForm.isOpenOnlineRegistration}
                              onChange={(e) =>
                                setEventForm({
                                  ...eventForm,
                                  isOpenOnlineRegistration: e.target.checked,
                                })
                              }
                              className="rounded h-4 w-4 text-emerald-600"
                            />
                            Buka Pendaftaran Peserta Online &amp; Kuota Per Kategori (SD, SMP, SMA, Purna / Custom)
                          </label>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Sinkron Otomatis ke Cetas Vote &amp; Cetas.Score (Juara Terpisah Per Kategori)
                          </span>
                        </div>
                        {eventForm.isOpenOnlineRegistration && (
                          <div className="pt-2 space-y-4 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                                Fasilitas Peserta (Pisahkan koma):
                              </span>
                              <input
                                type="text"
                                disabled={isPanitia}
                                value={eventForm.facilitiesText}
                                onChange={(e) =>
                                  setEventForm({ ...eventForm, facilitiesText: e.target.value })
                                }
                                placeholder="Sertifikat Digital, E-Badge Pass QR, Snack"
                                className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs ${
                                  isPanitia ? "cursor-not-allowed opacity-75" : ""
                                }`}
                              />
                            </div>

                            {/* PENGATURAN BIAYA PENDAFTARAN & DOWN PAYMENT (DP) */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                              <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                Pengaturan Biaya Registrasi &amp; Down Payment (DP)
                              </h5>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Biaya Pendaftaran (Rp)
                                  </label>
                                  <input
                                    type="number"
                                    disabled={isPanitia}
                                    min={0}
                                    placeholder="0 = Gratis"
                                    value={eventForm.registrationPrice}
                                    onChange={(e) =>
                                      setEventForm({
                                        ...eventForm,
                                        registrationPrice: Number(e.target.value) || 0,
                                      })
                                    }
                                    className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold ${
                                      isPanitia ? "cursor-not-allowed opacity-75" : ""
                                    }`}
                                  />
                                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                                    Isi 0 jika pendaftaran gratis
                                  </span>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Opsi Pembayaran Bertahap
                                  </label>
                                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                      type="checkbox"
                                      disabled={isPanitia}
                                      checked={eventForm.allowDownPayment}
                                      onChange={(e) =>
                                        setEventForm({
                                          ...eventForm,
                                          allowDownPayment: e.target.checked,
                                        })
                                      }
                                      className="rounded text-emerald-600 h-4 w-4"
                                    />
                                    <span>Bisa Down Payment (DP)</span>
                                  </label>
                                </div>

                                {eventForm.allowDownPayment && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                      Minimal Transfer DP (Rp)
                                    </label>
                                    <input
                                      type="number"
                                      disabled={isPanitia}
                                      min={0}
                                      value={eventForm.minDownPaymentAmount}
                                      onChange={(e) =>
                                        setEventForm({
                                          ...eventForm,
                                          minDownPaymentAmount: Number(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold ${
                                        isPanitia ? "cursor-not-allowed opacity-75" : ""
                                      }`}
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                                      Sisa tagihan dilunasi sebelum hari-H
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* KATEGORI & KUOTA PENDAFTARAN PER TINGKATAN */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                  <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-emerald-600" />
                                    Kategori Pendaftaran &amp; Kuota Masing-Masing Tingkatan
                                  </h5>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Atur kategori (SD, SMP, SMA, Purna, dll) beserta kuotanya masing-masing. Peserta yang daftar otomatis masuk ke <strong>Cetas Vote</strong> &amp; <strong>Cetas.Score</strong> sesuai kategorinya.
                                  </p>
                                </div>
                                <div className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                                  Total Kuota:{" "}
                                  {eventRegCategories.reduce((s, c) => s + (Number(c.quotaRemaining) || 0), 0)} /{" "}
                                  {eventRegCategories.reduce((s, c) => s + (Number(c.quotaTotal) || 0), 0)} Kursi
                                </div>
                              </div>

                              {/* Quick Add Preset Categories */}
                              {!isPanitia && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 mr-1">
                                    + Tambah Cepat:
                                  </span>
                                  {[
                                    { name: "Tingkat SD/MI", code: "SD" as const, quota: 30 },
                                    { name: "Tingkat SMP/MTs", code: "SMP" as const, quota: 35 },
                                    { name: "Tingkat SMA/SMK/MA", code: "SMA" as const, quota: 35 },
                                    { name: "Tingkat Purna/Umum", code: "PURNA" as const, quota: 25 },
                                  ].map((preset) => {
                                    const exists = eventRegCategories.some(
                                      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                                    );
                                    return (
                                      <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => {
                                          if (exists) return;
                                          setEventRegCategories((prev) => [
                                            ...prev,
                                            {
                                              id: `regcat-${Date.now()}-${preset.code.toLowerCase()}`,
                                              name: preset.name,
                                              code: preset.code,
                                              quotaTotal: preset.quota,
                                              quotaRemaining: preset.quota,
                                            },
                                          ]);
                                        }}
                                        disabled={exists}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                                          exists
                                            ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed"
                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                                        }`}
                                      >
                                        {exists ? `✓ ${preset.name}` : `+ ${preset.name}`}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEventRegCategories((prev) => [
                                        ...prev,
                                        {
                                          id: `regcat-${Date.now()}-${prev.length + 1}`,
                                          name: `Kategori #${prev.length + 1}`,
                                          code: "UMUM",
                                          quotaTotal: 30,
                                          quotaRemaining: 30,
                                        },
                                      ])
                                    }
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800 transition"
                                  >
                                    + Tambah Kategori Kustom
                                  </button>
                                </div>
                              )}

                              {/* Editable Rows per Category */}
                              <div className="space-y-2.5">
                                {eventRegCategories.map((rc, idx) => (
                                  <div
                                    key={rc.id || idx}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                                  >
                                    <div className="sm:col-span-5">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
                                        <span>Nama Kategori #{idx + 1}</span>
                                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
                                          Kode: {normalizeCategoryLevelCode(rc.name)}
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        disabled={isPanitia}
                                        value={rc.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEventRegCategories((prev) =>
                                            prev.map((item, i) =>
                                              i === idx
                                                ? { ...item, name: val, code: normalizeCategoryLevelCode(val) }
                                                : item
                                            )
                                          );
                                        }}
                                        placeholder="Contoh: Tingkat SD/MI, Tingkat SMP/MTs, Tingkat SMA/SMK/MA"
                                        className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ${
                                          isPanitia ? "cursor-not-allowed opacity-75" : ""
                                        }`}
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                        Kuota Total Kategori
                                      </label>
                                      <input
                                        type="number"
                                        disabled={isPanitia}
                                        min={1}
                                        value={rc.quotaTotal}
                                        onChange={(e) => {
                                          const val = Math.max(1, Number(e.target.value) || 1);
                                          setEventRegCategories((prev) =>
                                            prev.map((item, i) =>
                                              i === idx
                                                ? {
                                                    ...item,
                                                    quotaTotal: val,
                                                    quotaRemaining:
                                                      item.quotaRemaining === item.quotaTotal
                                                        ? val
                                                        : Math.min(item.quotaRemaining, val),
                                                  }
                                                : item
                                            )
                                          );
                                        }}
                                        className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-black text-slate-900 dark:text-white ${
                                          isPanitia ? "cursor-not-allowed opacity-75" : ""
                                        }`}
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                        Sisa Kuota Tersedia
                                      </label>
                                      <input
                                        type="number"
                                        disabled={isPanitia}
                                        min={0}
                                        max={rc.quotaTotal}
                                        value={rc.quotaRemaining}
                                        onChange={(e) => {
                                          const val = Math.max(0, Number(e.target.value) || 0);
                                          setEventRegCategories((prev) =>
                                            prev.map((item, i) =>
                                              i === idx
                                                ? { ...item, quotaRemaining: Math.min(item.quotaTotal, val) }
                                                : item
                                            )
                                          );
                                        }}
                                        className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400 ${
                                          isPanitia ? "cursor-not-allowed opacity-75" : ""
                                        }`}
                                      />
                                    </div>

                                    <div className="sm:col-span-1 flex justify-end">
                                      {!isPanitia && eventRegCategories.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEventRegCategories((prev) =>
                                              prev.filter((_, i) => i !== idx)
                                            )
                                          }
                                          title="Hapus Kategori Ini"
                                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 transition"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      {isSuperAdmin && !isPanitia ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold hover:bg-rose-100 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus Event Ini
                        </button>
                      ) : (
                        <div />
                      )}

                      {!isPanitia && (
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          Simpan Semua Perubahan
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 2: KELOLA PASUKAN & VERIFIKASI PELATIH */}
              {/* ========================================================== */}
              {eventSubTab === "TEAMS" && (
                <div className="space-y-6">
                  {/* Hero Header Pasukan & Pelatih */}
                  <div className="rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-black backdrop-blur-xs border border-white/10">
                          <Users className="h-3.5 w-3.5 text-purple-300" />
                          <span>Pusat Manajemen Pasukan &amp; Pelatih</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          Kelola Pasukan &amp; Verifikasi Pelatih
                        </h3>
                        <p className="text-xs text-purple-200/90 max-w-2xl leading-relaxed">
                          Verifikasi pendaftaran kontingen, tetapkan nomor urut undian hasil <strong>Technical Meeting (TM)</strong>, pantau status pembayaran (Lunas / DP), serta rilis nilai final resmi ke bilik masing-masing pelatih.
                        </p>
                      </div>

                      {/* Kontrol Sertifikat & Publikasi Nilai Final ke Pelatih */}
                      {!isPanitia && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                          {/* Tombol Pengaturan Dokumen & Juknis */}
                          <button
                            type="button"
                            onClick={handleOpenOfficialDocsModal}
                            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-sm flex items-center justify-center gap-2"
                          >
                            <FileText className="h-4 w-4 text-purple-300" />
                            <span>📁 Dokumen &amp; Juknis Event</span>
                          </button>

                          {/* Tombol Pengaturan Sertifikat & TTD */}
                          <button
                            type="button"
                            onClick={handleOpenCertConfigModal}
                            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-sm flex items-center justify-center gap-2"
                          >
                            <Settings className="h-4 w-4 text-amber-300" />
                            <span>Pengaturan TTD &amp; Format Sertifikat</span>
                          </button>

                          {/* Kontrol Publikasi Nilai Final ke Pelatih */}
                          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center gap-3">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-purple-200 block">
                                Akses Nilai Pelatih
                              </span>
                              <span className={`text-xs font-black ${selectedEvent.isScorePublishedToCoaches ? "text-emerald-300" : "text-amber-300"}`}>
                                {selectedEvent.isScorePublishedToCoaches ? "✓ Terbuka" : "🔒 Tertutup"}
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={isTogglingScoreRelease}
                              onClick={handleToggleScoreRelease}
                              className={`px-3.5 py-2 rounded-xl font-black text-xs transition shadow-md flex items-center gap-2 ${
                                selectedEvent.isScorePublishedToCoaches
                                  ? "bg-slate-900 hover:bg-slate-950 text-purple-200 border border-purple-400/30"
                                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30"
                              }`}
                            >
                              {isTogglingScoreRelease ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : selectedEvent.isScorePublishedToCoaches ? (
                                <>
                                  <Lock className="h-3.5 w-3.5 text-amber-300" />
                                  Tutup/Kunci Nilai
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                  Rilis Nilai ke Pelatih
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Pasukan Terdaftar</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {currentEventAttendees.length}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">Semua kategori</span>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Terkonfirmasi (Aktif)</span>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                        {currentEventAttendees.filter((a: RegisteredAttendee) => a.status === "CONFIRMED").length}
                      </div>
                      <span className="text-[10px] text-emerald-600/80 font-semibold">Masuk list lomba &amp; vote</span>
                    </div>

                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Menunggu Konfirmasi</span>
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                        {currentEventAttendees.filter((a: RegisteredAttendee) => a.status === "WAITLIST").length}
                      </div>
                      <span className="text-[10px] text-amber-600/80 font-semibold">Belum masuk list resmi</span>
                    </div>

                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Status Pembayaran</span>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-1 space-y-0.5">
                        <div className="text-emerald-600 dark:text-emerald-400">
                          Lunas: {currentEventAttendees.filter((a: RegisteredAttendee) => a.paymentStatus === "PAID").length} Tim
                        </div>
                        <div className="text-amber-600 dark:text-amber-400">
                          Down Payment (DP): {currentEventAttendees.filter((a: RegisteredAttendee) => a.paymentStatus === "DP").length} Tim
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar Filter & Pencarian */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari nama pleton, sekolah, pelatih, no. undian, atau kode e-badge..."
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={teamCategoryFilter}
                          onChange={(e) => setTeamCategoryFilter(e.target.value)}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="ALL">Semua Tingkat / Kategori</option>
                          <option value="Tingkat SD/MI">Tingkat SD/MI</option>
                          <option value="Tingkat SMP/MTs">Tingkat SMP/MTs</option>
                          <option value="Tingkat SMA/SMK/MA">Tingkat SMA/SMK/MA</option>
                          <option value="PURNA/CLUB/UMUM">PURNA/CLUB/UMUM</option>
                        </select>

                        <select
                          value={teamStatusFilter}
                          onChange={(e) => setTeamStatusFilter(e.target.value as any)}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="ALL">Semua Status Akun</option>
                          <option value="CONFIRMED">Hanya Terkonfirmasi (Aktif)</option>
                          <option value="WAITLIST">Hanya Menunggu Konfirmasi</option>
                        </select>
                      </div>
                    </div>

                    {/* Tabel Daftar Pasukan & Pelatih */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">No. Undian TM</th>
                            <th className="py-3 px-4">Pasukan &amp; Sekolah</th>
                            <th className="py-3 px-4">Pelatih &amp; Danton</th>
                            <th className="py-3 px-4">Biaya Registrasi</th>
                            <th className="py-3 px-4">Status Akun</th>
                            <th className="py-3 px-4">Absensi DP 1</th>
                            <th className="py-3 px-4 text-right">Aksi Manajemen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {(() => {
                            const filteredList = currentEventAttendees.filter((item: RegisteredAttendee) => {
                              const q = teamSearchQuery.toLowerCase().trim();
                              const matchSearch =
                                !q ||
                                item.fullName?.toLowerCase().includes(q) ||
                                item.institution?.toLowerCase().includes(q) ||
                                item.coachName?.toLowerCase().includes(q) ||
                                item.badgeCode?.toLowerCase().includes(q) ||
                                item.candidateNumber?.toLowerCase().includes(q) ||
                                item.tmLotteryNumber?.toLowerCase().includes(q);
                              const matchCat =
                                teamCategoryFilter === "ALL" ||
                                item.category?.toLowerCase() === teamCategoryFilter.toLowerCase() ||
                                item.levelCode?.toLowerCase() === teamCategoryFilter.toLowerCase();
                              const matchStatus =
                                teamStatusFilter === "ALL" || item.status === teamStatusFilter;
                              return matchSearch && matchCat && matchStatus;
                            });

                            if (filteredList.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="py-12 text-center text-slate-400">
                                    <div className="max-w-xs mx-auto space-y-2">
                                      <Users className="h-8 w-8 text-slate-300 mx-auto" />
                                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">
                                        Belum Ada Pasukan / Pelatih yang Cocok
                                      </p>
                                      <p className="text-[11px] text-slate-400">
                                        Pasukan yang mendaftar online akan muncul di sini untuk dikonfirmasi admin.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return filteredList.map((item: RegisteredAttendee) => {
                              const currentTmVal =
                                tmInputMap[item.id] !== undefined
                                  ? tmInputMap[item.id]
                                  : item.tmLotteryNumber || item.candidateNumber || "";
                              const isSavingThis = savingTmId === item.id;
                              const cleanPhone = (item.coachPhone || item.phone || "").replace(/\D/g, "");
                              const waPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;

                              return (
                                <tr
                                  key={item.id}
                                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                                    item.status === "WAITLIST"
                                      ? "bg-amber-50/30 dark:bg-amber-950/10"
                                      : ""
                                  }`}
                                >
                                  {/* Kolom 1: No. Undian TM */}
                                  <td className="py-3 px-4 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        disabled={isPanitia}
                                        placeholder="No TM"
                                        value={currentTmVal}
                                        onChange={(e) =>
                                          setTmInputMap({
                                            ...tmInputMap,
                                            [item.id]: e.target.value,
                                          })
                                        }
                                        className="w-16 px-2 py-1 text-center font-mono text-xs font-black rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-600"
                                      />
                                      {!isPanitia && (
                                        <button
                                          type="button"
                                          disabled={isSavingThis}
                                          onClick={() => handleAssignTmNumber(item.id, currentTmVal)}
                                          title="Simpan Nomor Undian TM"
                                          className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 transition"
                                        >
                                          {isSavingThis ? (
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <Check className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {item.tmLotteryNumber ? `Diundi: #${item.tmLotteryNumber}` : "Belum diundi"}
                                    </span>
                                  </td>

                                  {/* Kolom 2: Pasukan & Sekolah */}
                                  <td className="py-3 px-4 min-w-[200px]">
                                    <div className="font-black text-slate-900 dark:text-white">
                                      {item.fullName}
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                                      {item.institution}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black">
                                        {item.category}
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-400">
                                        {item.badgeCode}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kolom 3: Pelatih & Danton */}
                                  <td className="py-3 px-4 min-w-[170px]">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">
                                      {item.coachName || item.fullName}
                                    </div>
                                    {waPhone && (
                                      <a
                                        href={`https://wa.me/${waPhone}?text=Halo%20Pelatih%20${encodeURIComponent(item.fullName)}%20(${encodeURIComponent(item.institution)})%2C%20kami%20dari%20Panitia%20CETAS%20LKBB.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mt-0.5"
                                      >
                                        <MessageCircle className="h-3 w-3 fill-emerald-600" />
                                        <span>{item.coachPhone || item.phone}</span>
                                      </a>
                                    )}
                                    {item.dantonName && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        Danton: <strong className="text-slate-700 dark:text-slate-300">{item.dantonName}</strong>
                                      </div>
                                    )}
                                  </td>

                                  {/* Kolom 4: Biaya & Status Pembayaran */}
                                  <td className="py-3 px-4 min-w-[160px]">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                          item.paymentStatus === "PAID"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                            : item.paymentStatus === "DP"
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                        }`}
                                      >
                                        {item.paymentStatus === "PAID"
                                          ? "✓ Lunas"
                                          : item.paymentStatus === "DP"
                                          ? "Down Payment (DP)"
                                          : "Belum Bayar"}
                                      </span>

                                      {!isPanitia && (
                                        <select
                                          value={item.paymentStatus || "UNPAID"}
                                          onChange={(e) =>
                                            handleUpdatePaymentStatus(
                                              item.id,
                                              e.target.value as any,
                                              item.registrationFeeTotal || selectedEvent.price || 0
                                            )
                                          }
                                          className="text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-0.5"
                                        >
                                          <option value="PAID">Ubah: Lunas</option>
                                          <option value="DP">Ubah: DP</option>
                                          <option value="UNPAID">Ubah: Belum Bayar</option>
                                        </select>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                                      <div>
                                        Terbayar: <strong className="text-slate-900 dark:text-white">Rp {(item.registrationFeePaid || 0).toLocaleString("id-ID")}</strong>
                                      </div>
                                      {item.paymentStatus === "DP" && (
                                        <div className="text-rose-600 dark:text-rose-400 font-bold">
                                          Sisa: Rp {(item.registrationFeeRemaining || 0).toLocaleString("id-ID")}
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Kolom 5: Status Akun Pasukan */}
                                  <td className="py-3 px-4 shrink-0">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                        item.status === "CONFIRMED"
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse"
                                      }`}
                                    >
                                      {item.status === "CONFIRMED" ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                          Terkonfirmasi
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3 w-3 text-amber-600" />
                                          Menunggu
                                        </>
                                      )}
                                    </span>
                                  </td>

                                  {/* Kolom 6: Absensi DP 1 (Hari-H) */}
                                  <td className="py-3 px-4 shrink-0">
                                    <button
                                      type="button"
                                      disabled={isPanitia}
                                      onClick={() => handleToggleCheckInDP1(item.id)}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition flex items-center gap-1.5 ${
                                        item.checkedInDP1
                                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                      }`}
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                      {item.checkedInDP1 ? "Hadir di DP 1" : "Belum Hadir"}
                                    </button>
                                  </td>

                                  {/* Kolom 7: Aksi Manajemen */}
                                  <td className="py-3 px-4 text-right shrink-0">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {!isPanitia && item.status !== "CONFIRMED" ? (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyAttendee(item.id, "CONFIRMED")}
                                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1"
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                          Setujui Pasukan
                                        </button>
                                      ) : !isPanitia ? (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyAttendee(item.id, "WAITLIST")}
                                          className="px-2.5 py-1.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 font-bold text-[11px] transition"
                                          title="Tangguhkan Akun Pasukan"
                                        >
                                          Tangguhkan
                                        </button>
                                      ) : null}

                                      {/* Tombol Verifikasi Berkas Prasyarat Kontingen */}
                                      {(() => {
                                        const rules = getEffectivePrerequisiteRules(selectedEvent);
                                        const submittedDocs = item.submittedDocuments || [];
                                        const verifiedCount = submittedDocs.filter((d) => d.status === "VERIFIED").length;
                                        const hasRevision = submittedDocs.some((d) => d.status === "REVISION");
                                        const hasPending = submittedDocs.some((d) => d.status === "PENDING");
                                        const isComplete = rules.length > 0 && verifiedCount >= rules.filter((r) => r.isRequired).length;

                                        return (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenAdminDocsModal(item)}
                                            title="Periksa &amp; Verifikasi Berkas Prasyarat Kontingen"
                                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition flex items-center gap-1 border ${
                                              hasRevision
                                                ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                                                : isComplete
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                                : hasPending
                                                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                                            }`}
                                          >
                                            <FileText className="h-3 w-3" />
                                            <span>
                                              Berkas ({submittedDocs.length}/{rules.length})
                                              {hasRevision ? " ⚠️" : isComplete ? " ✓" : hasPending ? " ⏳" : ""}
                                            </span>
                                          </button>
                                        );
                                      })()}

                                      {!isPanitia && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenChampionCertModal(item)}
                                          title="Upload / Kelola Piagam Prestasi Juara Kontingen"
                                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition flex items-center gap-1 border ${
                                            item.championCertificateUrl
                                              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                                          }`}
                                        >
                                          <Trophy className="h-3 w-3 text-amber-500" />
                                          <span>{item.championCertificateUrl ? "Juara ✓" : "Piagam"}</span>
                                        </button>
                                      )}

                                      {!isPanitia && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenAdminSquadModal(item)}
                                          title="Kelola Susunan 16 Personel &amp; Cadangan"
                                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:text-slate-300 transition"
                                        >
                                          <Users className="h-3.5 w-3.5" />
                                        </button>
                                      )}

                                      {!isPanitia && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteAttendee(item.id, item.fullName)}
                                          title="Hapus Peserta"
                                          className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/60 transition"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 3: PENJURIAN LKBB (CETAS.SCORE) */}
              {/* ========================================================== */}
              {eventSubTab === "SCORE" && (
                <div className="space-y-6">
                  {/* Hero Header Penjurian LKBB */}
                  <div className="rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
                          <ShieldCheck className="h-3.5 w-3.5 text-purple-300" />
                          Penjurian Resmi Standar LKBB: {selectedEvent.title}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                          CETAS.SCORE — Arena & Dewan Juri
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                          Sistem penilaian LKBB terisolasi khusus untuk <strong>{selectedEvent.title}</strong>. Terkoneksi dengan 4 Pos Juri, Official Timer arena, Videotron display panggung, dan rekapitulasi nilai instan.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                        <Link
                          href="/admin/dashboard"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95"
                        >
                          <Sliders className="h-4 w-4" />
                          Admin Scoring & Setup →
                        </Link>
                        <Link
                          href="/admin/judges"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition active:scale-95"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Penugasan Juri & PIN →
                        </Link>
                        <Link
                          href="/score"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition active:scale-95"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Portal Cetas.Score
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* 6 Mode Lapangan Quick Access */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-600" />
                      6 Modul Operasional Lapangan CETAS.SCORE
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <Link
                        href="/admin/dashboard"
                        className="p-4 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black">
                              ADMIN SCORING
                            </span>
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold">Per-Event</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Event, Kategori & Materi</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Pilih event, atur tingkatan, kategori juri, subkategori, rubrik materi, dan nomor undian peserta.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-amber-200 dark:border-amber-800/40 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex justify-between">
                          <span>Buka Dashboard Score</span>
                          <span>→</span>
                        </div>
                      </Link>

                      <Link
                        href="/admin/judges"
                        className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-black">
                              PENUGASAN JURI
                            </span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono font-bold">PIN Login</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Plotting & Bilik Juri</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Tugaskan dewan juri per-event dan kategori dengan PIN unik. Juri dapat langsung menilai di Bilik Juri (/judge).
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-800/40 text-[11px] font-bold text-purple-700 dark:text-purple-400 flex justify-between">
                          <span>Atur Penugasan Juri</span>
                          <span>→</span>
                        </div>
                      </Link>

                      <Link
                        href="/rekap"
                        className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black">
                              AUDIT & REKAP
                            </span>
                            <span className="text-[10px] text-blue-700 dark:text-blue-300 font-mono font-bold">Realtime</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Rekapitulasi Nilai & Progress</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Matriks skor peserta lengkap dengan akumulasi juri, breakdown kategori, pinalti arena, dan status kunci.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-800/40 text-[11px] font-bold text-blue-700 dark:text-blue-400 flex justify-between">
                          <span>Lihat Rekapitulasi</span>
                          <span>→</span>
                        </div>
                      </Link>

                      <Link
                        href="/penentuan-juara"
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                              JUARA & CETAK
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold">F4 Landscape</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Penentuan Juara & Berita Acara</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Kalkulasi juara umum/kategori, tie breaker otomatis, dan cetak form berita acara F4 siap TTD dewan juri.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex justify-between">
                          <span>Buka Penentuan Juara</span>
                          <span>→</span>
                        </div>
                      </Link>

                      <Link
                        href="/timer"
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                              WASIT LAPANGAN
                            </span>
                            <span className="text-[10px] text-rose-600 font-bold">Klakson & Timer</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Official Timer Arena</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Stopwatch arena LKBB dengan audio chime peringatan waktu dan hitung pinalti border otomatis.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex justify-between">
                          <span>Buka Timer Arena</span>
                          <span>→</span>
                        </div>
                      </Link>

                      <Link
                        href="/display"
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 transition-all hover:scale-[1.01] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                              LAYAR PANGGUNG
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">Auto Refresh</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Display Videotron Arena</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Layar lebar resolusi tinggi untuk TV hall dan LED Videotron outdoor dengan animasi peringkat live.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex justify-between">
                          <span>Buka Layar Videotron</span>
                          <span>→</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Ringkasan Konfigurasi Bobot & PIN */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-purple-600" />
                          Bobot 4 Pos Penjurian LKBB
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">100% Pas</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span>Pos 1: PBB Murni (Dasar & Langkah)</span>
                          <span className="font-mono font-black text-purple-600">35%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span>Pos 2: Variasi & Formasi</span>
                          <span className="font-mono font-black text-purple-600">30%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span>Pos 3: Komandan / Danton</span>
                          <span className="font-mono font-black text-purple-600">20%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span>Pos 4: Kostum & Kerapihan</span>
                          <span className="font-mono font-black text-purple-600">15%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          Manajemen Akun & PIN Dewan Juri
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600">Terenkripsi SHA-256</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Belum Ada Akun Juri Default (Sistem Bersih)
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Seluruh akun dewan juri, operator, dan pembagian pos penilaian dibuat langsung oleh Super Admin melalui menu <strong>Kelola Dewan Juri</strong>.
                        </p>
                        <Link
                          href="/admin/judges"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-purple-600 hover:text-purple-700 pt-1"
                        >
                          Buka Panel Kelola Dewan Juri &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Daftar Peserta & Peringkat Juara Terpisah Per Kategori (Sinkron Otomatis dari Pendaftaran) */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-black mb-1">
                          <Medal className="h-3.5 w-3.5 text-purple-600" />
                          Juara Terpisah Antar Kategori • Sinkron Pendaftaran Online
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          Daftar Peserta &amp; Klasemen Juara Per Kategori ({selectedEvent.title})
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Setiap peserta yang mendaftar online otomatis masuk ke tabel klasemen sesuai kategorinya (SD, SMP, SMA, Purna, dll) dengan penentuan juara yang terpisah per kategori.
                        </p>
                      </div>
                      <Link
                        href="/register-event"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black transition shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Halaman Pendaftaran Peserta
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {getEffectiveRegistrationCategories(selectedEvent).map((cat) => {
                        const catTeams = [...(selectedEvent.lkbbTeams || [])]
                          .filter(
                            (t) =>
                              (t.categoryName &&
                                t.categoryName.toLowerCase().trim() === cat.name.toLowerCase().trim()) ||
                              t.level === cat.code
                          )
                          .sort((a, b) => {
                            const scoreDiff = (b.totalScore || 0) - (a.totalScore || 0);
                            if (scoreDiff !== 0) return scoreDiff;
                            return a.number.localeCompare(b.number);
                          });

                        return (
                          <div
                            key={cat.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2.5">
                                <div>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                    Juara Terpisah • {cat.code}
                                  </span>
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                    {cat.name}
                                  </h5>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-400 block">
                                    Sisa Kuota
                                  </span>
                                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    {cat.quotaRemaining}/{cat.quotaTotal}
                                  </span>
                                </div>
                              </div>

                              {catTeams.length > 0 ? (
                                <div className="space-y-2">
                                  {catTeams.map((team, idx) => {
                                    const finalScore =
                                      team.totalScore ??
                                      team.pbbMurni + team.variasiFormasi + team.danton + team.kostum - team.penalty;
                                    const rankBadge =
                                      idx === 0
                                        ? "🥇 Juara 1"
                                        : idx === 1
                                        ? "🥈 Juara 2"
                                        : idx === 2
                                        ? "🥉 Juara 3"
                                        : `#${idx + 1}`;
                                    return (
                                      <div
                                        key={team.id}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                                          idx === 0 && finalScore > 0
                                            ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                                            : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                              #{team.number}
                                            </span>
                                            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
                                              {rankBadge}
                                            </span>
                                          </div>
                                          <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                                            {team.teamName}
                                          </div>
                                          <div className="text-[10px] text-slate-500 truncate">
                                            {team.school}
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <div className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                                            {finalScore} Poin
                                          </div>
                                          <span className="text-[9px] font-bold text-slate-400">
                                            {team.status === "TERVERIFIKASI"
                                              ? "Terverifikasi"
                                              : "Menunggu Nilai"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="py-6 text-center text-[11px] text-slate-400 italic">
                                  Belum ada peserta terdaftar di {cat.name}.
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                              <span>Terdaftar: {catTeams.length} Peserta</span>
                              <Link
                                href="/admin/participants"
                                className="text-purple-600 hover:underline font-black"
                              >
                                Kelola di Score &rarr;
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 3: BILIK VOTING KHUSUS EVENT INI */}
              {/* ========================================================== */}
              {eventSubTab === "VOTE" && (
                <div className="space-y-6">
                  {isPanitia && (
                    <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 p-4 text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2.5 shadow-sm">
                      <span className="text-lg">👁️</span>
                      <span>Mode Pemantau Panitia Aktif: Anda hanya memiliki hak memantau perolehan suara bilik voting secara real-time. Penambahan atau pengubahan peserta dan kategori dikunci (Read-Only).</span>
                    </div>
                  )}

                  {/* Header Bilik Vote Event */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-black mb-1">
                          <Award className="h-3.5 w-3.5 text-amber-600" />
                          Bilik Voting Khusus: {selectedEvent.title}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          Kategori & Peserta Voting
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Atur kategori (misal: SMP, SMA, Purna) dan daftarkan peserta di masing-masing kategori. Pembayaran langsung via DOKU QRIS & E-Wallet.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!isPanitia && (
                          <>
                            <button
                              type="button"
                              onClick={handleOpenCreateCategory}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition active:scale-95"
                            >
                              <PlusCircle className="h-4 w-4" />
                              + Tambah Kategori
                            </button>

                            <button
                              type="button"
                              onClick={handleOpenCreateCandidate}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition active:scale-95"
                            >
                              <UserPlus className="h-4 w-4" />
                              + Tambah Peserta Baru
                            </button>
                          </>
                        )}

                        <Link
                          href={`/vote?eventId=${selectedEvent.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Bilik Publik
                        </Link>
                      </div>
                    </div>

                    {/* Kategori Selector Tabs */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-amber-500" />
                        Pilih Kategori Pemilihan:
                      </span>

                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                        {activeVoteEvent?.categories.map((cat) => {
                          const isCatSelected = cat.id === activeVoteCategory?.id;
                          const catVotes = cat.candidates.reduce(
                            (sum, c) => sum + (c.totalVotes || 0),
                            0
                          );

                          return (
                            <div
                              key={cat.id}
                              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                                isCatSelected
                                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 shadow-sm"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedVoteCategoryId(cat.id)}
                                className="flex items-center gap-2 text-left"
                              >
                                <span>{cat.title}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                  {catVotes.toLocaleString()} suara
                                </span>
                              </button>

                              {!isPanitia && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditCategory(cat)}
                                    title="Edit Kategori"
                                    className="text-slate-400 hover:text-amber-600 transition"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    title="Hapus Kategori"
                                    className="text-slate-400 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })}

                        {(!activeVoteEvent?.categories || activeVoteEvent.categories.length === 0) && (
                          <div className="text-xs text-slate-400 italic py-2">
                            Belum ada kategori voting. {!isPanitia ? 'Klik "+ Tambah Kategori" di atas.' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daftar Peserta di Kategori Terpilih */}
                  {activeVoteCategory ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900 dark:text-white">
                              Peserta Kategori: {activeVoteCategory.title}
                            </h4>
                            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              {formatRupiah(activeVoteCategory.pricePerVote)} / vote
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activeCategoryCandidates.length} peserta terdaftar di kategori ini.
                          </p>
                        </div>

                        {!isPanitia && (
                          <button
                            onClick={handleOpenCreateCandidate}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition active:scale-95"
                          >
                            <UserPlus className="h-4 w-4" />
                            + Tambah Peserta Baru
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCategoryCandidates.map((cand) => (
                          <div
                            key={cand.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={cand.photoUrl}
                                alt={cand.name}
                                className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-black text-orange-500 font-mono">
                                  #{cand.candidateNumber}
                                </span>
                                <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {cand.name}
                                </h5>
                                <div className="text-xs text-slate-500 truncate">{cand.institution}</div>
                                {cand.tagline && (
                                  <div className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                                    &ldquo;{cand.tagline}&rdquo;
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-slate-400 text-[10px] block">Perolehan Suara:</span>
                                <span className="text-base font-black text-amber-600 font-mono">
                                  {cand.totalVotes.toLocaleString()}
                                </span>
                              </div>

                              {!isPanitia && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditCandidate(cand)}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm"
                                    title="Edit Peserta"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCandidate(cand.id)}
                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition"
                                    title="Hapus Peserta"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {activeCategoryCandidates.length === 0 && (
                          <div className="col-span-full text-center py-12 text-xs text-slate-400 space-y-2">
                            <div>Belum ada peserta di kategori ini.</div>
                            {!isPanitia && (
                              <button
                                onClick={handleOpenCreateCandidate}
                                className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                              >
                                + Daftarkan Peserta Pertama
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-8 text-center space-y-3">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {isPanitia ? "Bilik Voting Belum Memiliki Kategori" : "Siap Menambahkan Kategori & Peserta Cetas Vote"}
                      </div>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {isPanitia 
                          ? "Penyelenggara belum menambahkan kategori atau peserta pemilihan untuk event ini."
                          : "Buat kategori pemilihan terlebih dahulu (misal: SMP, SMA, Umum) atau langsung daftarkan peserta baru (kategori otomatis dibuatkan)."
                        }
                      </p>
                      {!isPanitia && (
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleOpenCreateCategory}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition"
                          >
                            <PlusCircle className="h-4 w-4" />
                            + Buat Kategori Baru
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenCreateCandidate}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition"
                          >
                            <UserPlus className="h-4 w-4" />
                            + Langsung Tambah Peserta
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 4: TIKET & SCANNER GATE */}
              {/* ========================================================== */}
              {eventSubTab === "TICKETS" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
                  {isPanitia && (
                    <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 p-4 text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2.5 shadow-sm">
                      <span className="text-lg">👁️</span>
                      <span>Mode Pemantau Panitia Aktif: Anda hanya memiliki hak memantau kuota dan konfigurasi tiket masuk. Pengaturan harga dan penambahan tier dikunci (Read-Only).</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-blue-500" />
                        Manajemen Tiket Masuk & Validasi Scanner Pintu
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Atur kategori/tier tiket, harga, dan kuota resmi untuk <strong>{selectedEvent.title}</strong>. Otomatis tersinkronisasi dengan halaman publik <strong>Cetas Ticketing (/events)</strong> &amp; Beranda.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href="/events"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Cetas Ticketing Publik
                      </Link>
                      {!isPanitia && (
                        <Link
                          href={`/scanner?eventId=${selectedEvent.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95"
                        >
                          <Ticket className="h-4 w-4" />
                          Buka Scanner Pintu Masuk
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Status & Quick Toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                          Status Penjualan Tiket Publik
                        </span>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {eventForm.isOpenTicketing ? "🟢 Tiket Aktif & Tayang" : "⚪ Penjualan Ditutup"}
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-black">
                        <input
                          type="checkbox"
                          disabled={isPanitia}
                          checked={eventForm.isOpenTicketing}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, isOpenTicketing: e.target.checked })
                          }
                          className="rounded h-4 w-4 text-blue-600"
                        />
                        <span>{eventForm.isOpenTicketing ? "Aktif" : "Buka"}</span>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Tier Tiket</span>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {eventTiers.length} Kategori Tiket
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Metode Bayar Otomatis</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        DOKU QRIS &amp; E-Wallet
                      </div>
                    </div>
                  </div>

                  {/* Interactive Multi-Tier Ticket Editor */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Pengaturan Kategori / Tier Tiket &amp; Harga Resmi
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Ubah nama tiket, harga (Rp), dan kuota di bawah ini, lalu klik tombol <strong>Simpan &amp; Sinkronkan Tiket ke Publik</strong>.
                        </p>
                      </div>
                      {!isPanitia && (
                        <button
                          type="button"
                          onClick={() =>
                            updateEventTiersLive(
                              (prev) => [
                                ...prev,
                                {
                                  id: `tier-${Date.now()}-${prev.length + 1}`,
                                  name: `Tier Tiket #${prev.length + 1} (VIP / Presale)`,
                                  price: 75000,
                                  quotaTotal: 100,
                                  quotaRemaining: 100,
                                  benefits: ["E-Ticket QR Code Resmi"],
                                },
                              ],
                              true
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black transition shrink-0"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          + Tambah Tier Tiket Baru
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {eventTiers.map((tier, idx) => (
                        <div
                          key={tier.id || idx}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                        >
                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Nama Tier #{idx + 1}
                            </label>
                            <input
                              type="text"
                              disabled={isPanitia}
                              value={tier.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateEventTiersLive((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, name: val } : t))
                                );
                                if (idx === 0) {
                                  setEventForm((f) => ({ ...f, ticketTierName: val }));
                                }
                              }}
                              placeholder="Contoh: Tiket Reguler / VIP Pass"
                              className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ${
                                isPanitia ? "cursor-not-allowed opacity-75" : ""
                              }`}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Harga Tiket (Rp)
                            </label>
                            <input
                              type="number"
                              disabled={isPanitia}
                              min={0}
                              value={tier.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updateEventTiersLive((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, price: val } : t))
                                );
                                if (idx === 0) {
                                  setEventForm((f) => ({ ...f, ticketPrice: val }));
                                }
                              }}
                              className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-black text-blue-600 dark:text-blue-400 ${
                                isPanitia ? "cursor-not-allowed opacity-75" : ""
                              }`}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Kuota Total
                            </label>
                            <input
                              type="number"
                              disabled={isPanitia}
                              min={1}
                              value={tier.quotaTotal}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                const val = rawVal === "" ? 0 : Math.max(0, Number(rawVal) || 0);
                                updateEventTiersLive((prev) =>
                                  prev.map((t, i) => {
                                    if (i !== idx) return t;
                                    const oldTotal = Number(t.quotaTotal) || 0;
                                    const oldRem = Number(t.quotaRemaining) || 0;
                                    const sold = Math.max(0, oldTotal - oldRem);
                                    const nextRem = val > 0 ? Math.max(0, val - sold) : 0;
                                    return {
                                      ...t,
                                      quotaTotal: val,
                                      quotaRemaining: nextRem,
                                    };
                                  })
                                );
                                if (idx === 0) {
                                  setEventForm((f) => ({ ...f, ticketQuota: val }));
                                }
                              }}
                              className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ${
                                isPanitia ? "cursor-not-allowed opacity-75" : ""
                              }`}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Sisa Kuota
                            </label>
                            <input
                              type="number"
                              disabled={isPanitia}
                              min={0}
                              value={tier.quotaRemaining}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                const val = rawVal === "" ? 0 : Math.max(0, Number(rawVal) || 0);
                                updateEventTiersLive((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, quotaRemaining: val } : t))
                                );
                              }}
                              className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 ${
                                isPanitia ? "cursor-not-allowed opacity-75" : ""
                              }`}
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            {!isPanitia && eventTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateEventTiersLive((prev) => prev.filter((_, i) => i !== idx))
                                }
                                title="Hapus Tier Ini"
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        💡 Harga mulai otomatis tampil sebesar{" "}
                        <strong className="text-blue-600 dark:text-blue-400">
                          {formatRupiah(
                            eventTiers.length > 0
                              ? Math.min(...eventTiers.map((t) => Number(t.price) || 0))
                              : eventForm.ticketPrice
                          )}
                        </strong>{" "}
                        di katalog publik Cetas Ticketing.
                      </div>
                      {!isPanitia && (
                        <button
                          type="button"
                          onClick={() => handleSaveEvent(undefined, true)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-600/25 transition active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          Simpan &amp; Sinkronkan Tiket ke Publik ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* ========================================================== */}
              {/* SUB-TAB 5: KEUANGAN & OMZET EVENT */}
              {/* ========================================================== */}
              {eventSubTab === "FINANCES" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        Laporan Keuangan &amp; Arus Kas: {selectedEvent.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Transparansi seluruh pendapatan tiket, voting, kuota, dan transaksi Xendit Gateway untuk event ini.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          fetch("/api/admin/finances", { cache: "no-store" })
                            .then((r) => r.json())
                            .then((d) => {
                              if (d.success) {
                                if (d.finances) setFinances(d.finances);
                                if (Array.isArray(d.eventBreakdowns)) setEventFinancesData(d.eventBreakdowns);
                                showSyncToast("✓ Data keuangan event berhasil diperbarui.");
                              }
                            });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 transition"
                      >
                        🔄 Refresh Keuangan
                      </button>
                    </div>
                  </div>

                  {/* Financial Metric Cards for this event */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Omzet Event Ini</div>
                      <div className="text-2xl font-black text-emerald-950 dark:text-white mt-1">
                        {formatRupiah(effectiveCurrentEventTotalRevenue)}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                        100% Settlement Xendit Masuk
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                      <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">Pendapatan Tiket Masuk</div>
                      <div className="text-2xl font-black text-blue-950 dark:text-white mt-1">
                        {formatRupiah(effectiveCurrentEventTicketRevenue)}
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                        {effectiveCurrentEventTicketsSold} tiket resmi terjual
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pendapatan Cetas Vote</div>
                      <div className="text-2xl font-black text-amber-950 dark:text-white mt-1">
                        {formatRupiah(currentEventFinances?.voteRevenue || 0)}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                        Dukungan voting peserta
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                      <div className="text-xs font-semibold text-purple-800 dark:text-purple-300">Tingkat Kehadiran Penonton</div>
                      <div className="text-2xl font-black text-purple-950 dark:text-white mt-1">
                        {effectiveCurrentEventTicketsSold > 0
                          ? Math.round(((currentEventFinances?.ticketsCheckedIn || 0) / effectiveCurrentEventTicketsSold) * 100)
                          : 0}%
                      </div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                        {currentEventFinances?.ticketsCheckedIn || 0} hadir dari {effectiveCurrentEventTicketsSold} tiket
                      </div>
                    </div>
                  </div>

                  {/* Breakdown per Tier Tiket */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Performa Penjualan Per-Tier Tiket
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3.5">Nama Tier Tiket</th>
                            <th className="p-3.5">Harga Per Tiket</th>
                            <th className="p-3.5">Tiket Terjual</th>
                            <th className="p-3.5">Sudah Hadir (Gate)</th>
                            <th className="p-3.5">Sisa Kuota</th>
                            <th className="p-3.5 text-right">Total Pendapatan Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(selectedEvent.tiers || []).map((t, idx) => {
                            const tierStat = currentEventFinances?.tiers?.find(
                              (x: any) => x.tierName?.toLowerCase().trim() === t.name?.toLowerCase().trim()
                            );
                            const sold = Number(tierStat?.sold) > 0
                              ? Number(tierStat?.sold)
                              : Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
                            const checkedIn = tierStat?.checkedIn || 0;
                            const tierRevenue = sold * (Number(t.price) || 0);
                            return (
                              <tr key={t.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{t.name}</td>
                                <td className="p-3.5 font-mono text-emerald-600 font-bold">{formatRupiah(t.price)}</td>
                                <td className="p-3.5 font-bold">{sold} tiket</td>
                                <td className="p-3.5 font-bold text-emerald-600">{checkedIn} penonton</td>
                                <td className="p-3.5 text-slate-500">{t.quotaRemaining} dari {t.quotaTotal}</td>
                                <td className="p-3.5 text-right font-black font-mono text-slate-900 dark:text-white">
                                  {formatRupiah(tierRevenue)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transaksi Pembayaran Xendit Terbaru untuk Event Ini */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Daftar Transaksi Pembayaran Xendit Terverifikasi (PAID)
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3.5">No. Order &amp; ID Transaksi</th>
                            <th className="p-3.5">Nama Pembeli</th>
                            <th className="p-3.5">Kontak Pembeli</th>
                            <th className="p-3.5">Channel Pembayaran</th>
                            <th className="p-3.5">Waktu Pembayaran</th>
                            <th className="p-3.5">Nominal (Rp)</th>
                            <th className="p-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(!currentEventRecentOrders || currentEventRecentOrders.length === 0) ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                Belum ada transaksi pembayaran yang tercatat untuk event ini.
                              </td>
                            </tr>
                          ) : (
                            currentEventRecentOrders.map((ord: any, idx: number) => (
                              <tr key={ord.orderNumber || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-3.5 font-mono font-bold text-blue-600">{ord.orderNumber}</td>
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{ord.customerName}</td>
                                <td className="p-3.5 text-slate-500">{ord.customerPhone || ord.customerEmail || "-"}</td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                                    {ord.paymentChannel || "XENDIT"}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-500">{formatDateTime(ord.createdAt)}</td>
                                <td className="p-3.5 font-mono font-black text-emerald-600">{formatRupiah(ord.totalAmount)}</td>
                                <td className="p-3.5 text-right">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                                    ✓ PAID
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 6: DAFTAR HADIR PENONTON & STATUS GATE */}
              {/* ========================================================== */}
              {eventSubTab === "ATTENDEES" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm space-y-6 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-emerald-500" />
                        Daftar Hadir Penonton: {selectedEvent.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Daftar e-tiket yang telah diterbitkan dan status pemindaian gatekeeper pintu masuk secara real-time.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isPanitia && (
                        <Link
                          href={`/scanner?eventId=${selectedEvent.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          Buka Kamera Scanner Gate &rarr;
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          if (selectedEventId) fetchEventTickets(selectedEventId);
                          showSyncToast("✓ Data kehadiran penonton berhasil diperbarui.");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 transition"
                      >
                        🔄 Refresh Hadir
                      </button>
                    </div>
                  </div>

                  {/* Metric Cards Kehadiran Penonton */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-xs text-slate-500 font-semibold">Total Tiket Penonton</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {eventTicketsSummary.totalTickets}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Penonton terdaftar di sistem</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Sudah Hadir di Venue</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {eventTicketsSummary.attendedCount}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Berhasil di-scan di gate</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Belum Hadir di Pintu Gate</div>
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        {eventTicketsSummary.pendingCount}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Menunggu kedatangan penonton</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                      <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold">Persentase Kehadiran</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                        {eventTicketsSummary.attendanceRate}%
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Tingkat kehadiran penonton</div>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setTicketStatusFilter("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          ticketStatusFilter === "ALL"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        Semua Tiket ({eventTickets.length})
                      </button>
                      <button
                        onClick={() => setTicketStatusFilter("USED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                          ticketStatusFilter === "USED"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Sudah Hadir ({eventTicketsSummary.attendedCount})
                      </button>
                      <button
                        onClick={() => setTicketStatusFilter("ACTIVE")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                          ticketStatusFilter === "ACTIVE"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        Belum Hadir ({eventTicketsSummary.pendingCount})
                      </button>
                    </div>

                    <div className="relative max-w-xs w-full">
                      <input
                        type="text"
                        placeholder="Cari kode tiket / nama / WhatsApp..."
                        value={ticketSearchQuery}
                        onChange={(e) => setTicketSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Table Daftar Tiket Penonton */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5">Kode Tiket &amp; Order</th>
                          <th className="p-3.5">Nama Pemegang Tiket</th>
                          <th className="p-3.5">Kontak WhatsApp / Email</th>
                          <th className="p-3.5">Kategori / Tier</th>
                          <th className="p-3.5">Status Kehadiran Gate</th>
                          <th className="p-3.5 text-right">Aksi Manual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {eventTickets
                          .filter((t) => {
                            if (ticketStatusFilter === "USED") return t.status === "USED" || t.checkedInAt !== null;
                            if (ticketStatusFilter === "ACTIVE") return t.status === "ACTIVE" && t.checkedInAt === null;
                            return true;
                          })
                          .filter((t) => {
                            if (!ticketSearchQuery.trim()) return true;
                            const q = ticketSearchQuery.toLowerCase();
                            return (
                              (t.ticketCode && t.ticketCode.toLowerCase().includes(q)) ||
                              (t.holderName && t.holderName.toLowerCase().includes(q)) ||
                              (t.holderPhone && t.holderPhone.toLowerCase().includes(q)) ||
                              (t.holderEmail && t.holderEmail.toLowerCase().includes(q)) ||
                              (t.tierName && t.tierName.toLowerCase().includes(q)) ||
                              (t.orderNumber && t.orderNumber.toLowerCase().includes(q))
                            );
                          })
                          .map((t) => {
                            const isAttended = t.status === "USED" || t.checkedInAt !== null;
                            const cleanPhone = (t.holderPhone || "").replace(/^0/, "62").replace(/[^0-9]/g, "");
                            const formattedWIB = t.checkedInAt
                              ? new Date(t.checkedInAt).toLocaleTimeString("id-ID", {
                                  timeZone: "Asia/Jakarta",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false,
                                }) + " WIB"
                              : "-";

                            return (
                              <tr key={t.id || t.ticketCode} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                <td className="p-3.5">
                                  <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 block w-max">
                                    {t.ticketCode}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate max-w-[150px]">
                                    {t.orderNumber}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <div className="font-black text-slate-900 dark:text-white text-xs">{t.holderName}</div>
                                  <div className="text-[10px] text-slate-400">Pembelian: {formatDateTime(t.createdAt)}</div>
                                </td>
                                <td className="p-3.5">
                                  {t.holderPhone ? (
                                    <a
                                      href={`https://wa.me/${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-mono text-emerald-600 hover:underline font-bold text-xs flex items-center gap-1"
                                    >
                                      📱 {t.holderPhone}
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                  <span className="text-[10px] text-slate-400 block">{t.holderEmail || "-"}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
                                    {t.tierName || "Regular Ticket"}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  {isAttended ? (
                                    <div>
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                        SUDAH HADIR
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                        Scan: {formattedWIB}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-black">
                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                        BELUM HADIR
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        Menunggu scan di gate
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  {!isPanitia ? (
                                    <button
                                      onClick={() => handleToggleTicketAttendance(t.ticketCode, t.status)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                        isAttended
                                          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100"
                                          : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                                      }`}
                                    >
                                      {isAttended ? "Batal Hadir" : "✓ Tandai Hadir"}
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-xs italic">Mode Pemantau</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {eventTickets.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs italic">
                      Belum ada tiket penonton yang diterbitkan untuk event ini.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: KELOLA PRODUK PRODUCTION (CREATE / EDIT PRODUCT) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "PRODUCTION" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                Manajemen Produk, Stok & Alat Rental Cetas Production
              </h3>
              <p className="text-xs text-slate-500">
                Kelola katalog merchandise, sound system, lighting, videotron, stok unit tersedia, dan foto produk (klik gambar untuk memperbesar).
              </p>
            </div>
            {canManageProd && (
              <button
                onClick={handleOpenCreateProduct}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                + Tambah Produk / Alat Baru
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {productsList.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition"
              >
                <div>
                  {/* Clickable Product Image Thumbnail -> Opens Lightbox Popup */}
                  <div
                    onClick={() => {
                      setPreviewProductModal(prod);
                      setPreviewZoom(false);
                    }}
                    className="relative h-44 w-full bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md">
                        {prod.category}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md ${
                          prod.status === "TERSEDIA" && prod.stock > 0
                            ? "bg-emerald-500/90 text-white"
                            : prod.status === "DISEWA"
                            ? "bg-amber-500/90 text-white"
                            : "bg-rose-600/90 text-white"
                        }`}
                      >
                        {prod.stock <= 0 ? "STOK HABIS" : prod.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-950/80 text-white border border-white/15 backdrop-blur-md">
                        📦 Stok: <strong className={prod.stock > 0 ? "text-emerald-400" : "text-rose-400"}>{prod.stock}</strong> {prod.unit === "hari" || prod.unit === "event" ? "unit" : prod.unit}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 shadow">
                        🔍 Perbesar Foto
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h4
                      onClick={() => {
                        setPreviewProductModal(prod);
                        setPreviewZoom(false);
                      }}
                      className="text-sm font-black text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition"
                    >
                      {prod.name}
                    </h4>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(prod.price)}{" "}
                      <span className="text-xs font-normal text-slate-500">/ {prod.unit}</span>
                    </div>

                    {/* Quick Stock Adjustment Control */}
                    {canManageProd && (
                      <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Atur Stok Cepat:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustStock(prod, -1)}
                            disabled={prod.stock <= 0}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center disabled:opacity-40 transition"
                            title="Kurangi 1 Stok"
                          >
                            -
                          </button>
                          <span className="text-xs font-black font-mono min-w-[28px] text-center text-slate-900 dark:text-white">
                            {prod.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustStock(prod, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center transition"
                            title="Tambah 1 Stok"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewProductModal(prod);
                      setPreviewZoom(false);
                    }}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Lihat Popup Gambar
                  </button>

                  {canManageProd && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-bold transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit & Stok
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          title="Hapus Produk"
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: OMZET & DOKU GATEWAY */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "FINANCES" && (
        <div className="space-y-6">
          {/* Header Keuangan & Tombol Refresh */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                Laporan Keuangan & Arus Kas Xendit Gateway (Real-Time)
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Rekonsiliasi Keuangan & Transaksi Seluruh Event
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data terhubung langsung dengan database PostgreSQL transaksi paid dan webhook resmi Xendit Payment Gateway.
              </p>
            </div>

            <button
              onClick={() => {
                fetch("/api/admin/finances", { cache: "no-store" })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.success) {
                      if (d.finances) setFinances(d.finances);
                      if (Array.isArray(d.eventBreakdowns)) setEventFinancesData(d.eventBreakdowns);
                      if (Array.isArray(d.recentOrders)) setGlobalRecentOrders(d.recentOrders);
                      showSyncToast("✓ Data keuangan & transaksi berhasil diperbarui!");
                    }
                  });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
            >
              🔄 Refresh Data Keuangan
            </button>
          </div>

          {/* Cards Metrik Finansial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Total Omzet Masuk</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatRupiah(effectiveTotalOmzet)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                ✓ Dana bersih terverifikasi Xendit
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Penjualan Tiket Masuk</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatRupiah(effectiveTicketOmzet)}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-1">
                {effectiveTicketsSold} tiket penonton lunas
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Cetas.Vote Berbayar</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatRupiah(finances.voteOmzet)}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                {finances.votesCount.toLocaleString()} suara masuk
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Cetas Production</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatRupiah(finances.prodOmzet)}
              </div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1">
                Merchandise & rental alat panggung
              </div>
            </div>
          </div>

          {/* Breakdown Pendapatan Per-Event */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Performa Penjualan Tiket Per Acara / Event
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Nama Event</th>
                    <th className="p-3.5">Total Pendapatan Tiket</th>
                    <th className="p-3.5">Tiket Lunas Terjual</th>
                    <th className="p-3.5">Sudah Hadir (Gate)</th>
                    <th className="p-3.5">Rincian Tier Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(eventFinancesData.length > 0
                    ? eventFinancesData
                    : accessibleEvents.map((ev) => {
                        const sTiers = (ev.tiers || []).map((t) => {
                          const s = Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
                          return { tierName: t.name, sold: s, checkedIn: 0 };
                        });
                        const tRev = (ev.tiers || []).reduce((sum, t) => {
                          const s = Math.max(0, (Number(t.quotaTotal) || 0) - (Number(t.quotaRemaining) || 0));
                          return sum + s * (Number(t.price) || 0);
                        }, 0);
                        const tSold = sTiers.reduce((sum, t) => sum + t.sold, 0);
                        return {
                          eventId: ev.id,
                          eventName: ev.title,
                          ticketRevenue: tRev,
                          totalRevenue: tRev,
                          ticketsSold: tSold,
                          ticketsCheckedIn: 0,
                          tiers: sTiers,
                        };
                      })
                  ).map((ev: any) => (
                    <tr key={ev.eventId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {ev.eventName}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{ev.eventId}</span>
                      </td>
                      <td className="p-3.5 font-black text-emerald-600 text-sm">
                        {formatRupiah(ev.ticketRevenue || ev.totalRevenue || 0)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {ev.ticketsSold || 0} Tiket
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          ✓ {ev.ticketsCheckedIn || 0} penonton
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {(ev.tiers || []).map((tr: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              {tr.tierName}: {tr.sold} terjual
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {eventFinancesData.length === 0 && accessibleEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        Belum ada transaksi tiket yang masuk ke sistem.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Riwayat Transaksi Lunas Xendit */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-500" />
                Riwayat Transaksi Paid Xendit Gateway (Terbaru)
              </h4>
              <span className="text-xs text-slate-400">
                {globalRecentOrders.length} transaksi tercatat
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">No. Order / Waktu</th>
                    <th className="p-3.5">Nama & Kontak Pembeli</th>
                    <th className="p-3.5">Event</th>
                    <th className="p-3.5">Nominal</th>
                    <th className="p-3.5">Metode Bayar</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {globalRecentOrders.map((ord: any) => {
                    const cleanPhone = (ord.customerPhone || "").replace(/^0/, "62").replace(/[^0-9]/g, "");
                    return (
                      <tr key={ord.orderNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <span className="font-mono font-black text-blue-600 block">{ord.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDateTime(ord.createdAt)}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{ord.customerName}</div>
                          {ord.customerPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-emerald-600 hover:underline text-[11px] block mt-0.5"
                            >
                              📱 {ord.customerPhone}
                            </a>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                          {ord.eventName}
                        </td>
                        <td className="p-3.5 font-black text-slate-900 dark:text-white">
                          {formatRupiah(ord.totalAmount)}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                            {ord.paymentChannel || "XENDIT"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-700">
                            ✓ LUNAS (PAID)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {globalRecentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                        Belum ada riwayat transaksi masuk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: PROPOSAL MASUK */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "SUBMISSIONS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Daftar Proposal Pengajuan Event Dari Penyelenggara (EO)
            </h3>
            <span className="text-xs text-slate-500">
              Total {submissions.length} Pengajuan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Nama Acara & Penyelenggara</th>
                  <th className="p-4">Fitur Diminta</th>
                  <th className="p-4">Waktu Pengajuan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Belum ada proposal pengajuan event dari penyelenggara (EO).
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {sub.eventName}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {sub.organizer} • {sub.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-medium text-[11px]">
                        {sub.features}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{formatDateTime(sub.submittedAt)}</td>
                    <td className="p-4">
                      {sub.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold">
                          <Clock className="h-3 w-3" /> Menunggu Review
                        </span>
                      )}
                      {sub.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle className="h-3 w-3" /> Disetujui
                        </span>
                      )}
                      {sub.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold">
                          <XCircle className="h-3 w-3" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {canManageEvents && sub.status === "PENDING" ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSubmissions((prev) =>
                                prev.map((s) => (s.id === sub.id ? { ...s, status: "APPROVED" } : s))
                              )
                            }
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-xs"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() =>
                              setSubmissions((prev) =>
                                prev.map((s) => (s.id === sub.id ? { ...s, status: "REJECTED" } : s))
                              )
                            }
                            className="rounded-lg bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 text-xs"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: IKLAN CETAS KITA */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "ADS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Slot Kampanye & Banner &ldquo;Iklan Cetas Kita&rdquo;
              </h3>
              <p className="text-xs text-slate-500">
                Kelola slot iklan sponsor atau promosi internal Cetas Production.
              </p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setNewAdModal(true)}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Tambah Slot Iklan Baru
              </button>
            )}
          </div>

          {ads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Belum ada slot kampanye atau iklan yang aktif.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
                    {ad.placement}
                  </span>
                  <button
                    onClick={() =>
                      setAds((prev) =>
                        prev.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a))
                      )
                    }
                    className={`text-xs font-bold transition flex items-center gap-1 ${
                      ad.isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {ad.isActive ? "● Tayang Aktif" : "○ Nonaktif"}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {ad.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Impresi: {ad.impressions.toLocaleString()} kali</span>
                  <span>Klik: {ad.clicks.toLocaleString()} kali</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: KELOLA AKUN & ROLE STAF (KHUSUS SUPER ADMIN) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "STAFF" && isSuperAdmin && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl space-y-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Manajemen Akun Internal & Hak Akses Role Staf Cetas
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Super Admin berwenang mengubah role siapa pun, mempromosikan staf, atau menambahkan admin baru.
              </p>
            </div>

            <button
              onClick={() => setNewStaffModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Akun Staf Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Nama Petugas</th>
                  <th className="p-4">Email & Password</th>
                  <th className="p-4">Role Saat Ini</th>
                  <th className="p-4">Ubah Wewenang Role</th>
                  <th className="p-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        {st.role === "SUPER_ADMIN" && <Crown className="h-4 w-4 text-amber-500" />}
                        {st.name}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Status: {st.lastLogin || "Aktif"}
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="text-slate-800 dark:text-slate-200">{st.email}</div>
                      <div className="text-[10px] text-slate-400">Pass: {st.password}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {st.roleTitle}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={st.role}
                        disabled={st.id === "usr-super-01"}
                        onChange={(e) => handleChangeStaffRole(st.id, e.target.value as AdminRole)}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold disabled:opacity-60"
                      >
                        <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Akses 100%)</option>
                        <option value="STAFF_REKAP">📊 STAFF_REKAP (Staff Rekap &amp; Juara)</option>
                        <option value="EVENT_ADMIN">🎫 EVENT_ADMIN</option>
                        <option value="FINANCE_ADMIN">💰 FINANCE_ADMIN</option>
                        <option value="PROD_ADMIN">📦 PROD_ADMIN</option>
                        <option value="SCANNER_STAFF">🚪 SCANNER_STAFF</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      {st.id === "usr-super-01" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Super Admin Utama
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(st.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB: AUDIT LOG */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "AUDIT" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Log Audit Aktivitas & Transaksi Sistem Terkini
          </h3>
          <div className="space-y-3">
            {[
              {
                time: "Baru saja",
                action: "ADMIN_LOGIN_SUCCESS",
                detail: `Petugas '${currentUser.name}' berhasil login ke portal Lingkup Kerja Cetas dengan role [${currentUser.role}].`,
              },
              {
                time: "5 menit lalu",
                action: "VOTE_CATEGORY_UPDATED",
                detail: "Kategori voting (SMP, SMA, Purna) dan daftar peserta diperbarui.",
              },
              {
                time: "15 menit lalu",
                action: "DOKU_SETTLEMENT",
                detail: "Pembayaran paket suara voting diverifikasi otomatis via DOKU Direct API (QRIS/E-Wallet).",
              },
            ].map((log, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    [{log.action}]
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{log.detail}</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 ml-4">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: TAMBAH / EDIT KANDIDAT VOTE (PESERTA) */}
      {/* ------------------------------------------------------------------ */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                  Kategori: {activeVoteCategory?.title || "Kategori Voting Utama (Otomatis)"}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  {editingCandidateId ? "Edit Data Peserta" : "Tambah Peserta Baru di Kategori Ini"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCandidateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="overflow-y-auto flex-1 pr-1 space-y-3.5 my-3">
              {activeVoteEvent && activeVoteEvent.categories.length > 0 && !editingCandidateId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Kategori Pemilihan *
                  </label>
                  <select
                    value={activeVoteCategory?.id || activeVoteEvent.categories[0].id}
                    onChange={(e) => setSelectedVoteCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {activeVoteEvent.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title} ({formatRupiah(cat.pricePerVote)} / vote)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Urut *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    value={candidateForm.candidateNumber}
                    onChange={(e) =>
                      setCandidateForm({ ...candidateForm, candidateNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-black text-orange-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Peserta / Tim *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama peserta"
                    value={candidateForm.name}
                    onChange={(e) =>
                      setCandidateForm({ ...candidateForm, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sekolah / Asal Instansi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMPN 1 Jakarta / SMAN 3 Bandung / Purna 2024"
                  value={candidateForm.institution}
                  onChange={(e) =>
                    setCandidateForm({ ...candidateForm, institution: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <FileUpload
                  label="Foto Profil Peserta (Upload Langsung / Opsional)"
                  description="Upload foto potret resmi peserta voting (Format PNG, JPG, WEBP — otomatis dikompresi ringan)"
                  accept="image/*"
                  value={candidateForm.photoUrl}
                  onChange={(dataUrl) =>
                    setCandidateForm({ ...candidateForm, photoUrl: dataUrl })
                  }
                  aspectRatio="square"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Visi Misi
                </label>
                <textarea
                  rows={2}
                  placeholder="Visi misi atau slogan peserta..."
                  value={candidateForm.tagline}
                  onChange={(e) =>
                    setCandidateForm({ ...candidateForm, tagline: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                />
              </div>

              {/* STATUS PEROLEHAN SUARA (ANTI-MANIPULASI MUTLAK) */}
              {!editingCandidateId ? (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/40 p-3.5 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Integritas Suara Terkunci (Anti-Manipulasi)
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 dark:bg-emerald-800 dark:text-emerald-100 font-extrabold px-2 py-0.5 rounded-full">
                        0 Suara Awal
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      Peserta baru otomatis dimulai dari <strong>0 suara sah</strong>. Jumlah suara <strong>tidak dapat dimanipulasi manual</strong> oleh admin dan hanya akan bertambah secara transparan dan realtime saat publik melakukan voting resmi via DOKU Payment Gateway (QRIS & E-Wallet).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        Perolehan Suara Sah
                        <span className="text-[9px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black px-1.5 py-0.2 rounded-full">
                          🔒 Terkunci
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Murni hasil voting publik via DOKU Direct API (Tidak dapat diedit atau dimanipulasi manual)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-orange-600 dark:text-orange-400 font-mono">
                      {candidateForm.totalVotes.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">Suara Terverifikasi</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition active:scale-95"
                >
                  {editingCandidateId ? "Simpan Perubahan Peserta ✓" : "Daftarkan Peserta Sekarang ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: TAMBAH / EDIT KATEGORI VOTE (SMP, SMA, PURNA) */}
      {/* ------------------------------------------------------------------ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-orange-500" />
                {editingCategoryId ? "Edit Kategori Lomba" : "Tambah Kategori Baru di Event Ini"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="overflow-y-auto flex-1 pr-1 space-y-3.5 my-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori (Misal: Tingkat SMP, Tingkat SMA, Purna) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tingkat SMP / MTs"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kategori lomba..."
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Harga per Suara (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={categoryForm.pricePerVote}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, pricePerVote: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition"
                >
                  {editingCategoryId ? "Simpan Perubahan Kategori ✓" : "Tambah Kategori ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: HUBUNGKAN EVENT BARU KE VOTING */}
      {/* ------------------------------------------------------------------ */}
      {isAddEventVoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-4 sm:my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-orange-500" />
                Buka Bilik Voting Untuk Event Cetas
              </h3>
              <button
                onClick={() => setIsAddEventVoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectEventToVote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Dari Event Yang Ada di Cetas:
                </label>
                {eventsList.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                    Belum ada event terdaftar di Cetas. Silakan buat event terlebih dahulu di tab Manajemen Event.
                  </div>
                ) : (
                  <select
                    value={selectedEventToConnect}
                    onChange={(e) => setSelectedEventToConnect(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold"
                  >
                    {eventsList.map((ev) => {
                      const isConnected = eventVotings.some((v) => v.eventId === ev.id);
                      return (
                        <option key={ev.id} value={ev.id} disabled={isConnected}>
                          {ev.title} ({ev.date}) {isConnected ? "— [Bilik Sudah Aktif]" : "— [Tersedia]"}
                        </option>
                      );
                    })}
                  </select>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Sistem otomatis menginisialisasi 3 kategori default: <strong>Tingkat SMP, Tingkat SMA, dan Kategori Purna</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventVoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={eventsList.length === 0}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-black text-xs shadow-md transition"
                >
                  Buka Bilik Voting ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: CREATE / EDIT EVENT */}
      {/* ------------------------------------------------------------------ */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                {editingEventId ? "Edit Informasi Event" : "Buat Event Baru di Cetas"}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Event *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cetas Indie Night Fest 2026"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Penyelenggara (EO / Komunitas) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nada Kita Entertainment"
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Kategori Event *</span>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                      💡 Bebas Tambah / Ketik Sendiri Tanpa Batas
                    </span>
                  </label>
                  <select
                    value={isCustomCategory ? "CUSTOM" : eventForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "CUSTOM") {
                        setIsCustomCategory(true);
                        setEventForm({ ...eventForm, category: customCategoryText || "Kompetisi & LKBB" });
                      } else {
                        setIsCustomCategory(false);
                        setEventForm({ ...eventForm, category: val });
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold"
                  >
                    {EVENT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Input Kustom jika memilih opsi CUSTOM atau ingin mengetik bebas */}
                  {isCustomCategory && (
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        required
                        placeholder="Ketik kategori event kustom Anda (contoh: LKBB Cemara, Baris Berbaris / Paskibra)..."
                        value={customCategoryText}
                        onChange={(e) => {
                          setCustomCategoryText(e.target.value);
                          setEventForm({ ...eventForm, category: e.target.value });
                        }}
                        className="w-full rounded-xl border border-orange-400 dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-[10px] text-slate-500">
                        ✨ Kategori kustom tersimpan dan otomatis menjadi tag resmi event ini.
                      </p>
                    </div>
                  )}

                  {/* Quick Preset Tags untuk pemilihan instan */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Contoh Populer:</span>
                    {[
                      "LKBB / Paskibra",
                      "Turnamen E-Sports",
                      "Festival Tari Tradisional",
                      "Olimpiade Sains",
                      "Pentas Seni & Musik",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(true);
                          setCustomCategoryText(preset);
                          setEventForm({ ...eventForm, category: preset });
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 dark:bg-slate-800 dark:hover:bg-orange-950 dark:text-slate-300 dark:hover:text-orange-300 transition border border-slate-200 dark:border-slate-700 active:scale-95"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Acara *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Stadion Madya GBK / Balai Kartini"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                  />
                </div>

                {/* UPLOAD BANNER POSTER EVENT */}
                <div className="sm:col-span-2">
                  <FileUpload
                    label="Banner Poster Acara (Upload Gambar)"
                    description="Upload poster atau flyer resmi acara (Rasio 16:9 disarankan, format PNG, JPG, WEBP)"
                    accept="image/*"
                    value={eventForm.bannerUrl}
                    onChange={(dataUrl) => setEventForm({ ...eventForm, bannerUrl: dataUrl })}
                    aspectRatio="banner"
                    required
                  />
                </div>

                {/* PILIH MASKOT EVENT (CETI, ANTY, DLL) */}
                <div className="sm:col-span-2">
                  <MascotSelector
                    value={eventForm.mascotUrl}
                    onChange={(val) => setEventForm({ ...eventForm, mascotUrl: val })}
                  />
                </div>

                {/* KONFIGURASI TIKET CETAS TICKETING */}
                <div className="sm:col-span-2 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isOpenTicketing}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, isOpenTicketing: e.target.checked })
                        }
                        className="rounded h-4 w-4 text-blue-600"
                      />
                      <span>Buka Penjualan Tiket Cetas Ticketing</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Tampil di Publik /events &amp; Beranda
                    </span>
                  </div>

                  {eventForm.isOpenTicketing && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Nama Tier Tiket *
                        </label>
                        <input
                          type="text"
                          value={eventForm.ticketTierName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventForm({ ...eventForm, ticketTierName: val });
                            setEventTiers((prev) =>
                              prev.length > 0
                                ? prev.map((t, i) => (i === 0 ? { ...t, name: val } : t))
                                : [
                                    {
                                      id: `tier-${Date.now()}`,
                                      name: val,
                                      price: eventForm.ticketPrice,
                                      quotaTotal: eventForm.ticketQuota,
                                      quotaRemaining: eventForm.ticketQuota,
                                      benefits: ["E-Ticket QR Code Resmi"],
                                    },
                                  ]
                            );
                          }}
                          placeholder="Tiket Reguler / VIP"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Harga Tiket (Rp) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={eventForm.ticketPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEventForm({ ...eventForm, ticketPrice: val });
                            setEventTiers((prev) =>
                              prev.length > 0
                                ? prev.map((t, i) => (i === 0 ? { ...t, price: val } : t))
                                : [
                                    {
                                      id: `tier-${Date.now()}`,
                                      name: eventForm.ticketTierName,
                                      price: val,
                                      quotaTotal: eventForm.ticketQuota,
                                      quotaRemaining: eventForm.ticketQuota,
                                      benefits: ["E-Ticket QR Code Resmi"],
                                    },
                                  ]
                            );
                          }}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-black text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Kuota Tiket *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={eventForm.ticketQuota}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEventForm({ ...eventForm, ticketQuota: val });
                            setEventTiers((prev) =>
                              prev.length > 0
                                ? prev.map((t, i) =>
                                    i === 0 ? { ...t, quotaTotal: val, quotaRemaining: val } : t
                                  )
                                : [
                                    {
                                      id: `tier-${Date.now()}`,
                                      name: eventForm.ticketTierName,
                                      price: eventForm.ticketPrice,
                                      quotaTotal: val,
                                      quotaRemaining: val,
                                      benefits: ["E-Ticket QR Code Resmi"],
                                    },
                                  ]
                            );
                          }}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* KONFIGURASI PENDAFTARAN PESERTA & KUOTA PER KATEGORI (SD, SMP, SMA, PURNA / CUSTOM) */}
                <div className="sm:col-span-2 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isOpenOnlineRegistration}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            isOpenOnlineRegistration: e.target.checked,
                          })
                        }
                        className="rounded h-4 w-4 text-emerald-600"
                      />
                      <span>Buka Pendaftaran Peserta &amp; Kuota Per Kategori (SD, SMP, SMA, dll)</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Sinkron Otomatis ke Voting &amp; Score (Juara Terpisah)
                    </span>
                  </div>

                  {eventForm.isOpenOnlineRegistration && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500">Tambah Kategori:</span>
                          {[
                            { name: "Tingkat SD/MI", code: "SD" as const, quota: 30 },
                            { name: "Tingkat SMP/MTs", code: "SMP" as const, quota: 35 },
                            { name: "Tingkat SMA/SMK/MA", code: "SMA" as const, quota: 35 },
                            { name: "Tingkat Purna/Umum", code: "PURNA" as const, quota: 25 },
                          ].map((preset) => {
                            const exists = eventRegCategories.some(
                              (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                            );
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                disabled={exists}
                                onClick={() => {
                                  if (exists) return;
                                  setEventRegCategories((prev) => [
                                    ...prev,
                                    {
                                      id: `regcat-${Date.now()}-${preset.code.toLowerCase()}`,
                                      name: preset.name,
                                      code: preset.code,
                                      quotaTotal: preset.quota,
                                      quotaRemaining: preset.quota,
                                    },
                                  ]);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                                  exists
                                    ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                    : "bg-white hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800"
                                }`}
                              >
                                {exists ? `✓ ${preset.name}` : `+ ${preset.name}`}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              setEventRegCategories((prev) => [
                                ...prev,
                                {
                                  id: `regcat-${Date.now()}-${prev.length + 1}`,
                                  name: `Kategori #${prev.length + 1}`,
                                  code: "UMUM",
                                  quotaTotal: 30,
                                  quotaRemaining: 30,
                                },
                              ])
                            }
                            className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                          >
                            + Kustom
                          </button>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          Total Kuota:{" "}
                          {eventRegCategories.reduce((s, c) => s + (Number(c.quotaRemaining) || 0), 0)}/
                          {eventRegCategories.reduce((s, c) => s + (Number(c.quotaTotal) || 0), 0)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {eventRegCategories.map((rc, idx) => (
                          <div
                            key={rc.id || idx}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
                          >
                            <div className="sm:col-span-5">
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Kategori #{idx + 1} ({normalizeCategoryLevelCode(rc.name)})
                              </label>
                              <input
                                type="text"
                                value={rc.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEventRegCategories((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, name: val, code: normalizeCategoryLevelCode(val) }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Kuota Total
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={rc.quotaTotal}
                                onChange={(e) => {
                                  const val = Math.max(1, Number(e.target.value) || 1);
                                  setEventRegCategories((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? {
                                            ...item,
                                            quotaTotal: val,
                                            quotaRemaining:
                                              item.quotaRemaining === item.quotaTotal
                                                ? val
                                                : Math.min(item.quotaRemaining, val),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-black"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Sisa Kuota
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={rc.quotaTotal}
                                value={rc.quotaRemaining}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  setEventRegCategories((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, quotaRemaining: Math.min(item.quotaTotal, val) }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-black text-emerald-600"
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                              {eventRegCategories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEventRegCategories((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PILIH TEMA TAMPILAN EVENT */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-orange-500" />
                      Pilih Tema Tampilan Event (Warna & Aksen) *
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Mempengaruhi kartu, banner, dan aksen e-tiket event
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.values(EVENT_THEME_PRESETS).map((t) => {
                      const isSelected = eventForm.themePreset === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setEventForm({ ...eventForm, themePreset: t.id })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? `${t.borderClass} ${t.bgSoftClass} shadow-md scale-[1.02]`
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`h-4 w-10 rounded-full ${t.bgGradient}`} />
                            {isSelected && (
                              <span className="text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">
                                Dipilih ✓
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {t.name}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {t.tagline}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  {editingEventId ? "Simpan Perubahan Event ✓" : "Terbitkan Event Baru ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: CREATE / EDIT PRODUCT PRODUCTION */}
      {/* ------------------------------------------------------------------ */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                {editingProductId ? "Edit Produk, Stok & Alat Rental" : "Tambah Produk / Alat Baru"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Produk / Alat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sound System 30.000W / Kaos Custom"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Utama
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const nextCat = e.target.value as UnifiedProduct["category"];
                      setProductForm({
                        ...productForm,
                        category: nextCat,
                        unit: nextCat === "EQUIPMENT" ? "hari" : "pcs",
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  >
                    <option value="EQUIPMENT">EQUIPMENT (Sewa Alat)</option>
                    <option value="MERCHANDISE">MERCHANDISE (Produk Beli)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Ketersediaan
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        status: e.target.value as UnifiedProduct["status"],
                        stock:
                          e.target.value === "HABIS"
                            ? 0
                            : productForm.stock === 0
                            ? 1
                            : productForm.stock,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  >
                    <option value="TERSEDIA">TERSEDIA (Siap Dipesan)</option>
                    <option value="DISEWA">DISEWA (Sedang Digunakan)</option>
                    <option value="HABIS">HABIS (Stok Kosong)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Stok Tersedia *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStock = Math.max(0, Number(productForm.stock) - 1);
                        setProductForm({
                          ...productForm,
                          stock: nextStock,
                          status: nextStock === 0 ? "HABIS" : productForm.status,
                        });
                      }}
                      className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-black text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.stock}
                      onChange={(e) => {
                        const nextStock = Math.max(0, Number(e.target.value));
                        setProductForm({
                          ...productForm,
                          stock: nextStock,
                          status:
                            nextStock === 0
                              ? "HABIS"
                              : productForm.status === "HABIS"
                              ? "TERSEDIA"
                              : productForm.status,
                        });
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-black text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextStock = Number(productForm.stock) + 1;
                        setProductForm({
                          ...productForm,
                          stock: nextStock,
                          status:
                            productForm.status === "HABIS" ? "TERSEDIA" : productForm.status,
                        });
                      }}
                      className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-black text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Satuan Harga/Stok *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="hari / pcs / event / set"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Spesifikasi Lengkap Produk / Alat
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan spesifikasi teknis alat atau detail bahan merchandise..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <FileUpload
                  label="Foto Produk / Peralatan (Upload Gambar)"
                  description="Upload foto visual produk atau alat rental (Format PNG, JPG, WEBP)"
                  accept="image/*"
                  value={productForm.imageUrl}
                  onChange={(dataUrl) =>
                    setProductForm({ ...productForm, imageUrl: dataUrl })
                  }
                  aspectRatio="square"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  {editingProductId ? "Simpan Perubahan Produk ✓" : "Tambah Produk Baru ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: POP-UP GAMBAR & DETAIL PRODUK (ADMIN LIGHTBOX) */}
      {/* ------------------------------------------------------------------ */}
      {previewProductModal && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => {
            setPreviewProductModal(null);
            setPreviewZoom(false);
          }}
        >
          <div
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-950 h-80 sm:h-[420px] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProductModal.imageUrl}
                alt={previewProductModal.name}
                onClick={() => setPreviewZoom(!previewZoom)}
                className={`w-full h-full transition-transform duration-300 cursor-zoom-in ${
                  previewZoom ? "scale-150 object-contain cursor-zoom-out" : "object-contain"
                }`}
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(!previewZoom)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-purple-600 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition"
                >
                  {previewZoom ? "🔍 Perkecil Foto" : "🔍 Perbesar Foto (Zoom)"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewProductModal(null);
                    setPreviewZoom(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition"
                >
                  Tutup ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {previewProductModal.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                    {previewProductModal.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(previewProductModal.price)}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      / {previewProductModal.unit}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
                    Stok Tersedia:{" "}
                    <strong
                      className={
                        previewProductModal.stock > 0 ? "text-emerald-500" : "text-rose-500"
                      }
                    >
                      {previewProductModal.stock}
                    </strong>{" "}
                    ({previewProductModal.status})
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                {previewProductModal.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                {canManageProd && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Ubah Stok:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickAdjustStock(previewProductModal, -1)}
                      disabled={previewProductModal.stock <= 0}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-xs disabled:opacity-40"
                    >
                      -1
                    </button>
                    <span className="text-xs font-black font-mono px-2">
                      {previewProductModal.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAdjustStock(previewProductModal, 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-xs"
                    >
                      +1
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {canManageProd && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewProductModal;
                        setPreviewProductModal(null);
                        handleOpenEditProduct(target);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition"
                    >
                      Edit Produk & Stok
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewProductModal(null);
                      setPreviewZoom(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: TAMBAH AKUN STAF BARU (OLEH SUPER ADMIN) */}
      {/* ------------------------------------------------------------------ */}
      {newStaffModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Buat Akun Staf / Role Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Staf / Admin *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Login *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: event@cetas.co.id"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password Login *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wewenang Role Akun *
                </label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) =>
                    setNewStaffForm({ ...newStaffForm, role: e.target.value as AdminRole })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="STAFF_REKAP">📊 STAFF_REKAP (Staff Rekap &amp; Juara CETAS.SCORE)</option>
                  <option value="EVENT_ADMIN">🎫 EVENT_ADMIN (Admin Event &amp; Registrasi)</option>
                  <option value="FINANCE_ADMIN">💰 FINANCE_ADMIN (Admin Keuangan &amp; DOKU)</option>
                  <option value="PROD_ADMIN">📦 PROD_ADMIN (Admin Cetas Production)</option>
                  <option value="SCANNER_STAFF">🚪 SCANNER_STAFF (Petugas Gatekeeper)</option>
                  <option value="PANITIA">👁️ PANITIA (Panitia Pemantau - Read Only)</option>
                  <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Full Control)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {ROLE_DEFINITIONS[newStaffForm.role]?.description}
                </p>
              </div>

              {(newStaffForm.role === "EVENT_ADMIN" || newStaffForm.role === "PANITIA") && (
                <div>
                  <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                    Pilih Event Yang Ditugaskan *
                  </label>
                  <select
                    required
                    value={newStaffForm.assignedEventId || ""}
                    onChange={(e) => {
                      const evId = e.target.value;
                      const ev = eventsList.find((x) => x.id === evId);
                      setNewStaffForm({
                        ...newStaffForm,
                        assignedEventId: evId,
                        assignedEventTitle: ev?.title || "",
                      });
                    }}
                    className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="">-- Pilih Event Yang Ditugaskan --</option>
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.id})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-1">
                    Staf ini hanya akan dapat mengakses data event yang dipilih di atas.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  Simpan Akun Baru ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------------ */}
      {/* MODAL: PENGATURAN TTD, NAMA & FORMAT SERTIFIKAT */}
      {/* ------------------------------------------------------------------ */}
      {isCertConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Pengaturan Nama, TTD Digital &amp; Format E-Sertifikat
                  </h3>
                  <p className="text-[11px] text-purple-200/80">
                    Kustomisasi nama pejabat penandatangan, gelar, NIP, stempel resmi, dan format tanggal sertifikat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCertConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCertConfig();
              }}
              className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs"
            >
              {/* Bagian Penerbitan & Lembaga */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
                  1. Informasi Penerbitan &amp; Penomoran
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama / Judul Event di Atas Sertifikat (Pita Emas):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LKBB BARAVOS 2026 atau KOMPETISI BARIS BERBARIS TINGKAT NASIONAL"
                      value={certConfigForm.eventHeading || ""}
                      onChange={(e) => setCertConfigForm({ ...certConfigForm, eventHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      *Teks ini akan muncul pada badge pita emas paling atas seluruh sertifikat. Jika dikosongkan, otomatis mengikuti nama event.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kota Penerbitan:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jakarta"
                      value={certConfigForm.issueCity || ""}
                      onChange={(e) => setCertConfigForm({ ...certConfigForm, issueCity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Terbit Sertifikat:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 30 Oktober 2026"
                      value={certConfigForm.issueDate || ""}
                      onChange={(e) => setCertConfigForm({ ...certConfigForm, issueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lembaga / Federasi Penyelenggara:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Centralized Electronic Tournament & Award System"
                      value={certConfigForm.institutionName || ""}
                      onChange={(e) => setCertConfigForm({ ...certConfigForm, institutionName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Format Penomoran Sertifikat:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. [NO]/CETAS-LKBB/X/2026 atau 042/CETAS-LKBB/2026/[NO]"
                      value={certConfigForm.certificateNumberFormat || ""}
                      onChange={(e) => setCertConfigForm({ ...certConfigForm, certificateNumberFormat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      *Gunakan <strong>[NO]</strong> untuk nomor urut kontingen (misal: <code>[NO]/CETAS-LKBB/X/2026</code> otomatis menjadi <code>012/CETAS-LKBB/X/2026</code>).
                    </p>
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <FileUpload
                      label="Upload Gambar Stempel Resmi Penyelenggara (Opsional)"
                      description="Format PNG transparan stempel basah (Jika kosong menggunakan stempel digital resmi CETAS)"
                      accept="image/png,image/webp,image/*"
                      aspectRatio="square"
                      value={certConfigForm.stampUrl || ""}
                      onChange={(url) => setCertConfigForm({ ...certConfigForm, stampUrl: url })}
                    />
                  </div>
                </div>
              </div>

              {/* Penandatangan 1 (Ketua Panitia) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
                  2. Penandatangan 1 (Ketua Panitia / Pimpinan Penyelenggara)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jabatan Penandatangan 1:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ketua Panitia Penyelenggara"
                      value={certConfigForm.signer1?.role || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer1: { ...(certConfigForm.signer1 || { name: "", role: "" }), role: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap &amp; Gelar:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ardi Purwanto, S.Pd."
                      value={certConfigForm.signer1?.name || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer1: { ...(certConfigForm.signer1 || { name: "", role: "" }), name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      NIP / Nomor Identitas (Opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NIP. 19910523 201502 1 002"
                      value={certConfigForm.signer1?.nipOrId || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer1: { ...(certConfigForm.signer1 || { name: "", role: "" }), nipOrId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FileUpload
                      label="Upload File Gambar Scan TTD 1 (Ketua Panitia)"
                      description="Pilih foto TTD di kertas putih atau PNG transparan (Ukuran otomatis dioptimasi)"
                      accept="image/png,image/jpeg,image/webp,image/*"
                      aspectRatio="square"
                      value={certConfigForm.signer1?.signatureUrl || ""}
                      onChange={(url) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer1: { ...(certConfigForm.signer1 || { name: "", role: "" }), signatureUrl: url },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Penandatangan 2 (Ketua Dewan Juri) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
                  3. Penandatangan 2 (Ketua Dewan Juri)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jabatan Penandatangan 2:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ketua Dewan Juri CETAS"
                      value={certConfigForm.signer2?.role || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer2: { ...(certConfigForm.signer2 || { name: "", role: "" }), role: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap &amp; Gelar:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M. Rian Arifin, S.Pd., M.Han"
                      value={certConfigForm.signer2?.name || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer2: { ...(certConfigForm.signer2 || { name: "", role: "" }), name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      NIP / Nomor Identitas (Opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NIP. 19880412 201101 1 003"
                      value={certConfigForm.signer2?.nipOrId || ""}
                      onChange={(e) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer2: { ...(certConfigForm.signer2 || { name: "", role: "" }), nipOrId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FileUpload
                      label="Upload File Gambar Scan TTD 2 (Ketua Dewan Juri)"
                      description="Pilih foto TTD di kertas putih atau PNG transparan (Ukuran otomatis dioptimasi)"
                      accept="image/png,image/jpeg,image/webp,image/*"
                      aspectRatio="square"
                      value={certConfigForm.signer2?.signatureUrl || ""}
                      onChange={(url) =>
                        setCertConfigForm({
                          ...certConfigForm,
                          signer2: { ...(certConfigForm.signer2 || { name: "", role: "" }), signatureUrl: url },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCertConfigModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingCertConfig}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {isSavingCertConfig ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isSavingCertConfig ? "Menyimpan..." : "Simpan Pengaturan Sertifikat ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: UPLOAD / KELOLA PIAGAM PRESTASI JUARA KONTINGEN */}
      {/* ------------------------------------------------------------------ */}
      {championModalAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Kelola Piagam Prestasi Juara Kontingen
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    Pasukan: <strong>{championModalAttendee.fullName}</strong> ({championModalAttendee.institution})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChampionModalAttendee(null)}
                className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChampionCert();
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gelar / Judul Kejuaraan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juara 1 Utama LKBB, Juara Umum, Harapan 1"
                  value={championCertTitle}
                  onChange={(e) => setChampionCertTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <FileUpload
                  label="Upload Berkas / Gambar Piagam Sertifikat Resmi"
                  description="Format JPG, PNG, atau WebP bersolusi tinggi (Maks. 5 MB)"
                  accept="image/*"
                  value={championCertUrl}
                  onChange={(url) => setChampionCertUrl(url)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Atau Tempel URL Berkas Piagam:
                </label>
                <input
                  type="text"
                  placeholder="https://... atau data:image/..."
                  value={championCertUrl}
                  onChange={(e) => setChampionCertUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                {championModalAttendee.championCertificateUrl ? (
                  <button
                    type="button"
                    onClick={handleDeleteChampionCert}
                    className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Piagam
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChampionModalAttendee(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingChampionCert || !championCertUrl}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    {isSavingChampionCert ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Simpan Piagam ✓
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: KELOLA SUSUNAN 16 PERSONEL OLEH ADMIN */}
      {/* ------------------------------------------------------------------ */}
      {adminSquadAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border-b border-purple-800/40">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-600/40 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Susunan 16 Personel &amp; Cadangan Kontingen
                  </h3>
                  <p className="text-[11px] text-purple-200/80">
                    Pasukan: <strong>{adminSquadAttendee.fullName}</strong> • {adminSquadAttendee.institution}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminSquadAttendee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Quick Paste Assistant for Admin */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-600/10 text-purple-700 dark:text-purple-300">
                      📋
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Input Cepat via Salin/Tempel (WhatsApp / Excel)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Urutan susunan: Baris 1 = Danton, Baris 2..17 = 16 Personel Inti, Baris 18..19 = Cadangan.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickPaste(!showQuickPaste)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition shadow-xs"
                  >
                    {showQuickPaste ? "Tutup Tempel" : "Buka Tempel Cepat ▾"}
                  </button>
                </div>

                {showQuickPaste && (
                  <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2">
                    <textarea
                      rows={6}
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      placeholder={`Contoh tempel (langsung salin dari WA atau Excel):\n1. Arya Pratama\n2. Budi Santoso\n3. Citra Dewi\n... atau dengan NISN dipisah koma/tab:\nArya Pratama, 008123456`}
                      className="w-full p-2.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {quickPasteText.trim() ? `${quickPasteText.split("\n").filter((l) => l.trim()).length} baris terdeteksi` : "Belum ada teks ditempel"}
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyQuickPaste}
                        disabled={!quickPasteText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition"
                      >
                        Terapkan ke Formulir ↵
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminSquadForm.map((member, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition ${
                      member.isReserve
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                        : idx === 0
                        ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          member.isReserve
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            : idx === 0
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                        }`}>
                          {idx === 0 ? "DANTON" : member.isReserve ? `CADANGAN ${idx - 16}` : `#${String(idx).padStart(2, "0")}`}
                        </span>
                        <span>{member.role || `Personel ${idx}`}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Lengkap Siswa"
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...adminSquadForm];
                          updated[idx].name = e.target.value;
                          setAdminSquadForm(updated);
                        }}
                        className="sm:col-span-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                      />
                      <input
                        type="text"
                        placeholder="NISN / ID"
                        value={member.nisnOrId || ""}
                        onChange={(e) => {
                          const updated = [...adminSquadForm];
                          updated[idx].nisnOrId = e.target.value;
                          setAdminSquadForm(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Terisi: <strong className="text-slate-800 dark:text-slate-200">{adminSquadForm.filter((m) => m.name.trim()).length}</strong> dari {adminSquadForm.length} anggota
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminSquadAttendee(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingAdminSquad}
                  onClick={handleSaveAdminSquad}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {isSavingAdminSquad ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan Susunan Personel ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: KELOLA DOKUMEN RESMI & ATURAN PRASYARAT EVENT (ADMIN) */}
      {/* ------------------------------------------------------------------ */}
      {isOfficialDocsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border-b border-purple-800/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-600/40 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Kelola Dokumen Resmi &amp; Prasyarat Turnamen
                  </h3>
                  <p className="text-[11px] text-purple-200/80">
                    Event: <strong>{selectedEvent?.title}</strong> • Atur file Juknis, Undangan, Form List, Form Foto &amp; syarat berkas peserta.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfficialDocsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-tabs switch */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDocsModalSubTab("DOCS")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  docsModalSubTab === "DOCS"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>1. Dokumen Resmi Event (Unduhan Peserta)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                  {officialDocsForm.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDocsModalSubTab("RULES")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  docsModalSubTab === "RULES"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>2. Aturan Prasyarat Berkas (Upload Peserta)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                  {prerequisiteRulesForm.length}
                </span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {docsModalSubTab === "DOCS" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">File Resmi Turnamen yang Dapat Diunduh Pelatih</p>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        Admin dapat mengunggah file PDF, Excel, Word, atau gambar untuk Petunjuk Teknis (Juknis), Surat Undangan Sekolah &amp; Dispensasi, Form List 16 Personel, dan Form Foto.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {officialDocsForm.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>Dokumen #{idx + 1}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <select
                              value={doc.fileType || "PDF"}
                              onChange={(e) => {
                                const updated = [...officialDocsForm];
                                updated[idx].fileType = e.target.value as any;
                                setOfficialDocsForm(updated);
                              }}
                              className="px-2 py-1 text-[10px] font-black rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            >
                              <option value="PDF">PDF Document</option>
                              <option value="DOCX">Word (.docx)</option>
                              <option value="XLSX">Excel (.xlsx)</option>
                              <option value="IMAGE">Gambar (JPG/PNG)</option>
                              <option value="OTHER">Lainnya</option>
                            </select>

                            {officialDocsForm.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus dokumen "${doc.title}"?`)) {
                                    setOfficialDocsForm(officialDocsForm.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Judul Dokumen:
                            </label>
                            <input
                              type="text"
                              value={doc.title}
                              onChange={(e) => {
                                const updated = [...officialDocsForm];
                                updated[idx].title = e.target.value;
                                setOfficialDocsForm(updated);
                              }}
                              placeholder="e.g. Petunjuk Teknis (Juknis) Resmi LKBB"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Keterangan Singkat:
                            </label>
                            <input
                              type="text"
                              value={doc.description || ""}
                              onChange={(e) => {
                                const updated = [...officialDocsForm];
                                updated[idx].description = e.target.value;
                                setOfficialDocsForm(updated);
                              }}
                              placeholder="e.g. Ketentuan arena 18x12m, materi PBB murni..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-purple-600"
                            />
                          </div>
                        </div>

                        <div>
                          <FileUpload
                            label="Upload File Dokumen Resmi"
                            description="Pilih berkas PDF, DOCX, XLSX, atau Gambar (Maks. 10 MB)"
                            accept="*/*"
                            aspectRatio="document"
                            value={doc.fileUrl || ""}
                            onChange={(dataUrl, fileName) => {
                              const updated = [...officialDocsForm];
                              updated[idx].fileUrl = dataUrl;
                              if (fileName) {
                                updated[idx].fileName = fileName;
                                if (fileName.endsWith(".pdf")) updated[idx].fileType = "PDF";
                                else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) updated[idx].fileType = "XLSX";
                                else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) updated[idx].fileType = "DOCX";
                              }
                              updated[idx].updatedAt = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                              setOfficialDocsForm(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOfficialDocsForm([
                        ...officialDocsForm,
                        {
                          id: `doc-${Date.now()}`,
                          title: "Dokumen Resmi Baru",
                          description: "Keterangan dokumen",
                          fileUrl: "",
                          fileName: "Dokumen-Resmi.pdf",
                          fileType: "PDF",
                          updatedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                        },
                      ]);
                    }}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950/30 transition flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Tambah Dokumen Resmi Turnamen</span>
                  </button>
                </div>
              )}

              {docsModalSubTab === "RULES" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Aturan Berkas Prasyarat yang Wajib Dikirim Kontingen</p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Kontingen / Pelatih wajib mengunggah dokumen di bawah ini pada portal pelatih. Admin dapat memverifikasi atau meminta revisi setiap berkas.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prerequisiteRulesForm.map((rule, idx) => (
                      <div
                        key={rule.id || idx}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>Prasyarat #{idx + 1}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={rule.isRequired}
                                onChange={(e) => {
                                  const updated = [...prerequisiteRulesForm];
                                  updated[idx].isRequired = e.target.checked;
                                  setPrerequisiteRulesForm(updated);
                                }}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span>Wajib Diunggah</span>
                            </label>

                            {prerequisiteRulesForm.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus aturan prasyarat "${rule.title}"?`)) {
                                    setPrerequisiteRulesForm(prerequisiteRulesForm.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                                title="Hapus Aturan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nama / Judul Berkas Prasyarat:
                            </label>
                            <input
                              type="text"
                              value={rule.title}
                              onChange={(e) => {
                                const updated = [...prerequisiteRulesForm];
                                updated[idx].title = e.target.value;
                                setPrerequisiteRulesForm(updated);
                              }}
                              placeholder="e.g. Surat Rekomendasi / Tugas Kepala Sekolah"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Format File yang Diizinkan:
                            </label>
                            <input
                              type="text"
                              value={rule.allowedFormats || "PDF, PNG, JPG"}
                              onChange={(e) => {
                                const updated = [...prerequisiteRulesForm];
                                updated[idx].allowedFormats = e.target.value;
                                setPrerequisiteRulesForm(updated);
                              }}
                              placeholder="e.g. PDF, PNG, JPG"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Petunjuk / Keterangan untuk Pelatih:
                          </label>
                          <textarea
                            rows={2}
                            value={rule.description || ""}
                            onChange={(e) => {
                              const updated = [...prerequisiteRulesForm];
                              updated[idx].description = e.target.value;
                              setPrerequisiteRulesForm(updated);
                            }}
                            placeholder="e.g. Wajib bertanda tangan basah Kepala Sekolah dan berstempel resmi."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPrerequisiteRulesForm([
                        ...prerequisiteRulesForm,
                        {
                          id: `req-${Date.now()}`,
                          title: "Aturan Prasyarat Baru",
                          description: "Petunjuk pengunggahan berkas untuk pelatih.",
                          isRequired: true,
                          allowedFormats: "PDF, PNG, JPG",
                        },
                      ]);
                    }}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 transition flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Tambah Aturan Prasyarat Berkas Baru</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                {officialDocsForm.length} Dokumen Resmi • {prerequisiteRulesForm.length} Aturan Prasyarat
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfficialDocsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingOfficialDocs}
                  onClick={handleSaveOfficialDocs}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {isSavingOfficialDocs ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSavingOfficialDocs ? "Menyimpan..." : "Simpan Pengaturan Dokumen ✓"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: VERIFIKASI BERKAS PRASYARAT KONTINGEN OLEH ADMIN */}
      {/* ------------------------------------------------------------------ */}
      {adminDocsAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Verifikasi Berkas Prasyarat Kontingen
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">
                    Pasukan: <strong>{adminDocsAttendee.fullName}</strong> • {adminDocsAttendee.institution} • No. Undian TM: <strong>#{adminDocsAttendee.tmLotteryNumber || adminDocsAttendee.candidateNumber || "-"}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminDocsAttendee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const rules = getEffectivePrerequisiteRules(selectedEvent);
                const submitted = adminDocsAttendee.submittedDocuments || [];

                return rules.map((rule, idx) => {
                  const doc = submitted.find((d) => d.ruleId === rule.id);
                  const isUploaded = Boolean(doc && doc.fileUrl);
                  const isVerified = doc?.status === "VERIFIED";
                  const isRevision = doc?.status === "REVISION";
                  const isPending = doc?.status === "PENDING";
                  const isReviewingThis = reviewingDocRuleId === rule.id;

                  return (
                    <div
                      key={rule.id || idx}
                      className={`p-4 rounded-2xl border transition ${
                        isVerified
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                          : isRevision
                          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                          : isPending
                          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {idx + 1}. {rule.title}
                            </span>
                            {rule.isRequired ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                WAJIB
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                OPSIONAL
                              </span>
                            )}
                          </div>
                          {rule.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {rule.description}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Terverifikasi Valid ✓
                            </span>
                          ) : isRevision ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <AlertCircle className="h-3 w-3 text-rose-600" />
                              Perlu Revisi ⚠️
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="h-3 w-3 text-amber-600" />
                              Menunggu Verifikasi ⏳
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Belum Diunggah
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content File & Action */}
                      <div className="pt-3">
                        {isUploaded ? (
                          <div className="space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 truncate">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {doc?.fileName || `${rule.title}.pdf`}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    Diunggah: {doc?.uploadedAt ? formatDateTime(doc.uploadedAt) : "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (doc?.fileUrl) {
                                      if (doc.fileUrl.startsWith("data:")) {
                                        const win = window.open();
                                        if (win) {
                                          win.document.write(
                                            `<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                          );
                                        }
                                      } else {
                                        window.open(doc.fileUrl, "_blank");
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Buka / Pratinjau</span>
                                </button>
                              </div>
                            </div>

                            {/* Existing Review Note */}
                            {doc?.reviewNote && (
                              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200">
                                <span className="font-bold">Catatan Revisi Terakhir:</span> {doc.reviewNote}
                              </div>
                            )}

                            {/* Verification Buttons */}
                            {!isReviewingThis ? (
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewingDocRuleId(rule.id);
                                    setRevisionNoteInput(doc?.reviewNote || "");
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <span>Minta Revisi Berkas</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSavingDocReview}
                                  onClick={() => handleReviewAttendeeDoc(rule.id, "VERIFIED")}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition flex items-center gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Setujui Valid ✓</span>
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2 animate-in fade-in">
                                <label className="block text-[11px] font-bold text-rose-900 dark:text-rose-200">
                                  Tuliskan Catatan / Alasan Revisi untuk Pelatih:
                                </label>
                                <textarea
                                  rows={2}
                                  value={revisionNoteInput}
                                  onChange={(e) => setRevisionNoteInput(e.target.value)}
                                  placeholder="Contoh: Stempel kepala sekolah belum ada, tolong upload scan asli..."
                                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReviewingDocRuleId(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white/50"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSavingDocReview || !revisionNoteInput.trim()}
                                    onClick={() => handleReviewAttendeeDoc(rule.id, "REVISION", revisionNoteInput)}
                                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-xs transition flex items-center gap-1"
                                  >
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span>Kirim Catatan Revisi ⚠️</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-3 text-slate-400 text-xs">
                            <span className="italic">Kontingen belum mengunggah berkas ini ke portal pelatih.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                E-Badge: <strong className="font-mono text-slate-800 dark:text-slate-200">{adminDocsAttendee.badgeCode}</strong>
              </span>

              <button
                type="button"
                onClick={() => setAdminDocsAttendee(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
