"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Ticket,
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
} from "@/lib/events-unified-data";
import {
  INITIAL_UNIFIED_PRODUCTS,
  UnifiedProduct,
} from "@/lib/production-unified-data";
import {
  INITIAL_ATTENDEES,
  RegisteredAttendee,
} from "@/lib/events-registration-data";
import {
  INITIAL_EVENT_VOTINGS,
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
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
  const [eventsList, setEventsList] = useState<UnifiedEvent[]>(INITIAL_UNIFIED_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventSubTab, setEventSubTab] = useState<
    "DETAILS" | "SCORE" | "VOTE" | "TICKETS" | "ATTENDEES"
  >("DETAILS");
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
    description: "",
    status: "PUBLISHED" as UnifiedEvent["status"],
    isOpenTicketing: true,
    ticketTierName: "Festival Regular",
    ticketPrice: 150000,
    ticketQuota: 200,
    isOpenOnlineRegistration: false,
    registrationQuota: 100,
    facilitiesText: "Sertifikat Digital, E-Badge Gate Pass, Snack",
  });

  // Unified Products State (CRUD)
  const [productsList, setProductsList] = useState<UnifiedProduct[]>(INITIAL_UNIFIED_PRODUCTS);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
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
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "EVENTS" | "PRODUCTION" | "FINANCES" | "SUBMISSIONS" | "STAFF" | "AUDIT" | "ADS"
  >("EVENTS"); // Default to EVENTS so user lands directly on Pusat Event Workspace!

  // Initial Data Fetching
  useEffect(() => {
    const session = getStoredAdminSession();
    if (session) setCurrentUser(session);

    const storedStaff = getStoredStaffList();
    if (storedStaff && storedStaff.length > 0) setStaffList(storedStaff);

    // Fetch Events
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events) {
          setEventsList(data.events);
          if (data.events.length > 0) setSelectedEventToConnect(data.events[0].id);
        }
      })
      .catch(() => {});

    // Fetch Products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) setProductsList(data.products);
      })
      .catch(() => {});

    // Fetch Hierarchical Vote Config
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.eventVotings && data.eventVotings.length > 0) {
          setEventVotings(data.eventVotings);
          setSelectedVoteEventId(data.eventVotings[0].eventId);
          if (data.eventVotings[0].categories.length > 0) {
            setSelectedVoteCategoryId(data.eventVotings[0].categories[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch Attendees
    fetch("/api/attendees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.attendees) setAttendees(data.attendees);
      })
      .catch(() => {});
  }, []);

  // ---------------- AUTH HANDLERS ----------------
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const found = staffList.find(
      (u) =>
        u.email.toLowerCase() === authEmail.toLowerCase().trim() &&
        u.password === authPassword
    );

    if (found) {
      const userSession: AdminUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        roleTitle: ROLE_DEFINITIONS[found.role].title,
        avatarColor: found.avatarColor,
        lastLogin: "Baru saja",
        ...ROLE_DEFINITIONS[found.role],
      };
      setCurrentUser(userSession);
      saveAdminSession(userSession);
      setAuthError(null);
    } else {
      setAuthError("Email atau Password tidak cocok! Silakan cek akun demo di bawah.");
    }
  };

  const handleQuickLogin = (account: StaffAccountRecord) => {
    const userSession: AdminUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      roleTitle: ROLE_DEFINITIONS[account.role].title,
      avatarColor: account.avatarColor,
      lastLogin: "Baru saja",
      ...ROLE_DEFINITIONS[account.role],
    };
    setCurrentUser(userSession);
    saveAdminSession(userSession);
    setAuthEmail(account.email);
    setAuthPassword(account.password);
    setAuthError(null);
  };

  const handleLogout = () => {
    clearAdminSession();
    setCurrentUser(null);
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
      description: "Deskripsi acara spektakuler Cetas.",
      status: "PUBLISHED",
      isOpenTicketing: true,
      ticketTierName: "Regular Pass",
      ticketPrice: 150000,
      ticketQuota: 250,
      isOpenOnlineRegistration: false,
      registrationQuota: 100,
      facilitiesText: "Sertifikat Digital Resmi, E-Badge Pass QR, Snack",
    });
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
      description: ev.description,
      status: ev.status,
      isOpenTicketing: ev.isOpenTicketing,
      ticketTierName: ev.tiers && ev.tiers[0] ? ev.tiers[0].name : "Regular Pass",
      ticketPrice: ev.tiers && ev.tiers[0] ? ev.tiers[0].price : 150000,
      ticketQuota: ev.tiers && ev.tiers[0] ? ev.tiers[0].quotaTotal : 200,
      isOpenOnlineRegistration: ev.isOpenOnlineRegistration,
      registrationQuota: ev.quotaTotal || 100,
      facilitiesText: (ev.facilities || []).join(", "),
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!eventForm.title.trim()) return;

    const facilitiesArray = eventForm.facilitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalCategory = (isCustomCategory && customCategoryText.trim())
      ? customCategoryText.trim()
      : eventForm.category;

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
      description: eventForm.description,
      status: eventForm.status,
      isOpenTicketing: eventForm.isOpenTicketing,
      tiers: eventForm.isOpenTicketing
        ? [
            {
              id: `tier-${Date.now()}-1`,
              name: eventForm.ticketTierName,
              price: Number(eventForm.ticketPrice),
              quotaRemaining: Number(eventForm.ticketQuota),
              quotaTotal: Number(eventForm.ticketQuota),
            },
          ]
        : [],
      isOpenOnlineRegistration: eventForm.isOpenOnlineRegistration,
      quotaTotal: Number(eventForm.registrationQuota),
      quotaRemaining: Number(eventForm.registrationQuota),
      price: 0,
      priceLabel: "Gratis",
      facilities: facilitiesArray,
    };

    if (editingEventId) {
      try {
        const res = await fetch("/api/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEventId, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.event) {
          setEventsList((prev) =>
            prev.map((ev) => (ev.id === editingEventId ? data.event : ev))
          );
        }
      } catch {}
    } else {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.event) {
          setEventsList((prev) => [data.event, ...prev]);
        }
      } catch {}
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus event ini beserta bilik votingnya?")) {
      setEventsList((prev) => prev.filter((ev) => ev.id !== id));
      // Sinkronkan juga hapus bilik voting untuk event ini
      setEventVotings((prev) => {
        const remaining = prev.filter((ev) => ev.eventId !== id);
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

    const payload = {
      name: productForm.name,
      category: productForm.category,
      subCategory: productForm.subCategory,
      price: Number(productForm.price),
      unit: productForm.unit,
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl,
      description: productForm.description,
      status: productForm.status,
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
          setProductsList((prev) =>
            prev.map((p) => (p.id === editingProductId ? data.product : p))
          );
        }
      } catch {}
    } else {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProductsList((prev) => [data.product, ...prev]);
        }
      } catch {}
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Hapus produk ini dari katalog Cetas Production?")) {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      try {
        await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      } catch {}
    }
  };

  // ---------------- HIERARCHICAL VOTE & EVENT WORKSPACE HANDLERS ----------------
  const selectedEvent = eventsList.find((ev) => ev.id === selectedEventId) || null;

  const handleToggleAttendeePresence = (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPresent: !a.isPresent } : a))
    );
  };

  const handleSelectEventWorkspace = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedVoteEventId(eventId);
    setEventSubTab("DETAILS");

    const ev = eventsList.find((e) => e.id === eventId);
    if (ev) {
      setEditingEventId(ev.id);
      const isStandard = EVENT_CATEGORY_OPTIONS.some((opt) => opt.value === ev.category);
      if (!isStandard) {
        setIsCustomCategory(true);
        setCustomCategoryText(ev.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategoryText("");
      }
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
        description: ev.description,
        status: ev.status,
        isOpenTicketing: ev.isOpenTicketing,
        ticketTierName: ev.tiers && ev.tiers[0] ? ev.tiers[0].name : "Regular Pass",
        ticketPrice: ev.tiers && ev.tiers[0] ? ev.tiers[0].price : 150000,
        ticketQuota: ev.tiers && ev.tiers[0] ? ev.tiers[0].quotaTotal : 200,
        isOpenOnlineRegistration: ev.isOpenOnlineRegistration,
        registrationQuota: ev.quotaTotal || 100,
        facilitiesText: (ev.facilities || []).join(", "),
      });

      // Ensure voting config exists for this event
      const exists = eventVotings.some((v) => v.eventId === eventId);
      if (!exists) {
        setEventVotings((prev) => [
          {
            eventId: ev.id,
            eventTitle: ev.title,
            bannerUrl: ev.bannerUrl,
            themePreset: ev.themePreset || "FLAME",
            eventDate: ev.date,
            categories: [
              {
                id: `cat-${Date.now()}-1`,
                eventId: ev.id,
                title: "Favorit SMP / MTs Sederajat",
                description: "Kategori pemilihan regu terfavorit tingkat SMP",
                pricePerVote: 2000,
                candidates: [],
              },
              {
                id: `cat-${Date.now()}-2`,
                eventId: ev.id,
                title: "Favorit SMA / SMK Sederajat",
                description: "Kategori pemilihan regu terfavorit tingkat SMA",
                pricePerVote: 2000,
                candidates: [],
              },
            ],
          },
          ...prev,
        ]);
      }
    }
  };

  const activeVoteEvent =
    eventVotings.find((ev) => ev.eventId === (selectedEventId || selectedVoteEventId)) || eventVotings[0];

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

    // Jika bilik voting event sudah aktif, arahkan langsung tanpa membuat duplikat
    const existing = eventVotings.find((v) => v.eventId === eventObj.id);
    if (existing) {
      alert(`Bilik voting untuk event '${eventObj.title}' sudah aktif! Mengalihkan ke bilik tersebut.`);
      setSelectedVoteEventId(existing.eventId);
      if (existing.categories.length > 0) {
        setSelectedVoteCategoryId(existing.categories[0].id);
      }
      setIsAddEventVoteModalOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_EVENT_VOTING",
          eventId: eventObj.id,
          eventTitle: eventObj.title,
          bannerUrl: eventObj.bannerUrl,
          themePreset: eventObj.themePreset,
        }),
      });
      const data = await res.json();
      if (data.success && data.eventVoting) {
        setEventVotings((prev) => [
          data.eventVoting,
          ...prev.filter((v) => v.eventId !== data.eventVoting.eventId),
        ]);
        setSelectedVoteEventId(data.eventVoting.eventId);
        setSelectedVoteCategoryId(data.eventVoting.categories[0]?.id || "");
      } else {
        alert(data.message || "Gagal membuka bilik voting.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat membuka bilik voting.");
    }
    setIsAddEventVoteModalOpen(false);
  };

  // B. Tambah / Edit Kategori (SMP, SMA, Purna)
  const handleOpenCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      title: "",
      description: "",
      pricePerVote: 2000,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: VoteCategory) => {
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
    if (!categoryForm.title.trim()) return;

    if (editingCategoryId) {
      // EDIT KATEGORI
      try {
        await fetch("/api/vote", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "EDIT_CATEGORY",
            eventId: activeVoteEvent.eventId,
            categoryId: editingCategoryId,
            updates: categoryForm,
          }),
        });
        setEventVotings((prev) =>
          prev.map((ev) => {
            if (ev.eventId !== activeVoteEvent.eventId) return ev;
            return {
              ...ev,
              categories: ev.categories.map((c) =>
                c.id === editingCategoryId ? { ...c, ...categoryForm } : c
              ),
            };
          })
        );
      } catch {}
    } else {
      // TAMBAH KATEGORI BARU
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_CATEGORY",
            eventId: activeVoteEvent.eventId,
            title: categoryForm.title,
            description: categoryForm.description,
            pricePerVote: categoryForm.pricePerVote,
          }),
        });
        const data = await res.json();
        if (data.success && data.category) {
          setEventVotings((prev) =>
            prev.map((ev) => {
              if (ev.eventId !== activeVoteEvent.eventId) return ev;
              return { ...ev, categories: [...ev.categories, data.category] };
            })
          );
          setSelectedVoteCategoryId(data.category.id);
        }
      } catch {}
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm("Hapus kategori ini beserta seluruh peserta di dalamnya?")) {
      try {
        await fetch(
          `/api/vote?eventId=${activeVoteEvent.eventId}&categoryId=${catId}`,
          { method: "DELETE" }
        );
        setEventVotings((prev) =>
          prev.map((ev) => {
            if (ev.eventId !== activeVoteEvent.eventId) return ev;
            const nextCats = ev.categories.filter((c) => c.id !== catId);
            return { ...ev, categories: nextCats };
          })
        );
      } catch {}
    }
  };

  // C. Tambah / Edit Peserta di Kategori Terpilih
  const handleOpenCreateCandidate = () => {
    setEditingCandidateId(null);
    const nextNum = (activeCategoryCandidates.length + 1).toString().padStart(2, "0");
    const instansiPlaceholder = activeVoteCategory?.title.toLowerCase().includes("smp")
      ? "SMP Negeri 1 Jakarta"
      : activeVoteCategory?.title.toLowerCase().includes("sma")
      ? "SMA Negeri 3 Bandung"
      : "Universitas / Purna 2024";

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
    if (!candidateForm.name.trim()) return;

    if (editingCandidateId) {
      // EDIT PESERTA (Hanya profil yang diubah, suara terkunci demi integritas)
      try {
        await fetch("/api/vote", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "EDIT_CANDIDATE",
            eventId: activeVoteEvent.eventId,
            categoryId: activeVoteCategory.id,
            candidateId: editingCandidateId,
            updates: {
              candidateNumber: candidateForm.candidateNumber,
              name: candidateForm.name,
              institution: candidateForm.institution,
              photoUrl: candidateForm.photoUrl,
              tagline: candidateForm.tagline,
            },
          }),
        });
        setEventVotings((prev) =>
          prev.map((ev) => {
            if (ev.eventId !== activeVoteEvent.eventId) return ev;
            return {
              ...ev,
              categories: ev.categories.map((c) => {
                if (c.id !== activeVoteCategory.id) return c;
                return {
                  ...c,
                  candidates: c.candidates.map((cand) =>
                    cand.id === editingCandidateId
                      ? {
                          ...cand,
                          candidateNumber: candidateForm.candidateNumber,
                          name: candidateForm.name,
                          institution: candidateForm.institution,
                          photoUrl: candidateForm.photoUrl,
                          tagline: candidateForm.tagline,
                        }
                      : cand
                  ),
                };
              }),
            };
          })
        );
      } catch {}
    } else {
      // TAMBAH PESERTA BARU (Suara otomatis 0)
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_CANDIDATE",
            eventId: activeVoteEvent.eventId,
            categoryId: activeVoteCategory.id,
            candidateNumber: candidateForm.candidateNumber,
            name: candidateForm.name,
            institution: candidateForm.institution,
            photoUrl: candidateForm.photoUrl,
            tagline: candidateForm.tagline,
            totalVotes: 0,
          }),
        });
        const data = await res.json();
        if (data.success && data.candidate) {
          setEventVotings((prev) =>
            prev.map((ev) => {
              if (ev.eventId !== activeVoteEvent.eventId) return ev;
              return {
                ...ev,
                categories: ev.categories.map((c) => {
                  if (c.id !== activeVoteCategory.id) return c;
                  return { ...c, candidates: [...c.candidates, data.candidate] };
                }),
              };
            })
          );
        }
      } catch {}
    }
    setIsCandidateModalOpen(false);
  };

  const handleDeleteCandidate = async (candId: string) => {
    if (confirm("Hapus peserta ini dari voting?")) {
      try {
        await fetch(
          `/api/vote?eventId=${activeVoteEvent.eventId}&categoryId=${activeVoteCategory.id}&candidateId=${candId}`,
          { method: "DELETE" }
        );
        setEventVotings((prev) =>
          prev.map((ev) => {
            if (ev.eventId !== activeVoteEvent.eventId) return ev;
            return {
              ...ev,
              categories: ev.categories.map((c) => {
                if (c.id !== activeVoteCategory.id) return c;
                return {
                  ...c,
                  candidates: c.candidates.filter((cand) => cand.id !== candId),
                };
              }),
            };
          })
        );
      } catch {}
    }
  };

  // ---------------- STAFF MANAGEMENT HANDLERS ----------------
  const handleChangeStaffRole = (staffId: string, newRole: AdminRole) => {
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

  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) return;

    const newStaff: StaffAccountRecord = {
      id: `usr-${Date.now()}`,
      name: newStaffForm.name,
      email: newStaffForm.email,
      password: newStaffForm.password,
      role: newStaffForm.role,
      roleTitle: ROLE_DEFINITIONS[newStaffForm.role].title,
      avatarColor: "bg-slate-700 text-white",
      lastLogin: "Belum pernah login",
      ...ROLE_DEFINITIONS[newStaffForm.role],
    };

    const updated = [...staffList, newStaff];
    setStaffList(updated);
    saveStoredStaffList(updated);
    setNewStaffForm({ name: "", email: "", password: "", role: "EVENT_ADMIN" });
    setNewStaffModal(false);
  };

  // ----------------------------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 shadow-md">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Sistem Autentikasi Internal
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                Lingkup Kerja Perusahaan Cetas
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Silakan login untuk mengakses backoffice. Tampilan dashboard dan hak akses akan menyesuaikan secara dinamis dengan <strong>Role Akun</strong> Anda.
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
                Email Akun Cetas
              </label>
              <input
                type="email"
                required
                placeholder="superadmin@cetas.id"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
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

          {/* Quick-Fill 1-Click Role Switcher Demo Cards */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Pilih Akun Demo Cepat (1-Klik Login Sesuai Role):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffList.map((account) => {
                const isSuper = account.role === "SUPER_ADMIN";
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleQuickLogin(account)}
                    className={`text-left p-3.5 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      isSuper
                        ? "border-amber-400 bg-gradient-to-br from-amber-500/10 to-transparent dark:border-amber-600/70"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          {isSuper && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                          {account.name}
                        </span>
                      </div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1.5">
                        {account.roleTitle}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {account.email}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Pass: {account.password}</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        Login Role Ini →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // ----------------------------------------------------------------------
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const canManageEvents = currentUser.canApproveEvents || isSuperAdmin;
  const canManageProd = currentUser.canManageProduction || isSuperAdmin;
  const canManageVote = currentUser.canApproveEvents || isSuperAdmin;

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

        {/* Quick Switch Role Pills */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="text-[10px] font-bold uppercase text-slate-400 mr-1 hidden lg:block">
            Ganti Role:
          </div>
          {staffList.map((acc) => (
            <button
              key={acc.id}
              onClick={() => handleQuickLogin(acc)}
              title={acc.name}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                acc.role === currentUser.role
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {acc.role.replace("_ADMIN", "")}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </div>

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

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Omzet Cetas</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(finances.totalOmzet)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> {finances.totalOmzet > 0 ? "+18.4% bulan ini" : "Mulai pencatatan baru"}
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Cetas Ticketing</span>
            <Ticket className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(finances.ticketOmzet)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{finances.ticketsSold} tiket terjual</div>
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

      {/* Main Tabs Navigation (Rapih, Sederhana & Berbasis Event) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("EVENTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
            activeTab === "EVENTS"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Pusat Event ({eventsList.length})
          {selectedEvent && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold ml-1">
              Aktif: {selectedEvent.title.slice(0, 15)}...
            </span>
          )}
        </button>

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

        <button
          onClick={() => setActiveTab("FINANCES")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "FINANCES"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          Arus Kas & DOKU Direct
        </button>

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
            Kelola Akun Staf
          </button>
        )}

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
      </div>

      {/* ------------------------------------------------------------------ */}
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

                  {canManageEvents && (
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
                {eventsList
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
                              <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-center border border-purple-100 dark:border-purple-900/50">
                                ⚖️ CETAS.SCORE
                              </div>
                              <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-center border border-amber-100 dark:border-amber-900/50">
                                🗳️ {voteCfg?.categories.length || 0} Kategori Vote
                              </div>
                              <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-center border border-blue-100 dark:border-blue-900/50">
                                🎫 {ev.isOpenTicketing ? `${ev.tiers?.length || 1} Tier Tiket` : "RSVP Online"}
                              </div>
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
                      onClick={() => setSelectedEventId(null)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition active:scale-95 shadow-sm"
                    >
                      <ArrowLeft className="h-4 w-4 text-orange-500" />
                      Semua Event
                    </button>
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

                    <Link
                      href={`/scanner?eventId=${selectedEvent.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <Ticket className="h-3.5 w-3.5 text-blue-600" />
                      Scanner Pintu Masuk
                    </Link>
                  </div>
                </div>

                {/* Sub-Tabs Selector for this Event */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setEventSubTab("DETAILS")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "DETAILS"
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    1. Detail & Pengaturan Event
                  </button>

                  <button
                    onClick={() => setEventSubTab("SCORE")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "SCORE"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    2. Penjurian LKBB (CETAS.SCORE)
                  </button>

                  <button
                    onClick={() => setEventSubTab("VOTE")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "VOTE"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    3. Bilik Voting ({activeVoteEvent?.categories.length || 0} Kategori)
                  </button>

                  <button
                    onClick={() => setEventSubTab("TICKETS")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "TICKETS"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    4. Tiket & Scanner Gate
                  </button>

                  <button
                    onClick={() => setEventSubTab("ATTENDEES")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 ${
                      eventSubTab === "ATTENDEES"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    5. Daftar Peserta & Hadir ({attendees.filter((a) => a.eventId === selectedEvent.id || a.eventName.toLowerCase() === selectedEvent.title.toLowerCase()).length})
                  </button>
                </div>
              </div>

              {/* ========================================================== */}
              {/* SUB-TAB 1: DETAIL & PENGATURAN EVENT */}
              {/* ========================================================== */}
              {eventSubTab === "DETAILS" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
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

                    <button
                      type="button"
                      onClick={() => handleSaveEvent()}
                      className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition active:scale-95"
                    >
                      Simpan Perubahan
                    </button>
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
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Penyelenggara (EO / Komunitas) *
                        </label>
                        <input
                          type="text"
                          required
                          value={eventForm.organizer}
                          onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Kategori Event
                        </label>
                        <select
                          value={isCustomCategory ? "LAINNYA" : eventForm.category}
                          onChange={(e) => {
                            if (e.target.value === "LAINNYA") {
                              setIsCustomCategory(true);
                            } else {
                              setIsCustomCategory(false);
                              setEventForm({ ...eventForm, category: e.target.value });
                            }
                          }}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
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
                          value={eventForm.themePreset}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              themePreset: e.target.value as EventThemePreset,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
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
                          value={eventForm.status}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              status: e.target.value as UnifiedEvent["status"],
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
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
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Waktu / Jam
                        </label>
                        <input
                          type="text"
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          placeholder="08:00 - 17:00 WIB"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Lokasi / Venue
                        </label>
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          placeholder="Nama Gedung / Kota"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Deskripsi Lengkap Acara
                      </label>
                      <textarea
                        rows={3}
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Fitur Tiket & RSVP Toggle Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-blue-950 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={eventForm.isOpenTicketing}
                              onChange={(e) =>
                                setEventForm({ ...eventForm, isOpenTicketing: e.target.checked })
                              }
                              className="rounded h-4 w-4 text-blue-600"
                            />
                            Buka Penjualan Tiket Cetas
                          </label>
                          <span className="text-[10px] font-bold text-blue-600">DOKU Direct API</span>
                        </div>
                        {eventForm.isOpenTicketing && (
                          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Nama Tier:</span>
                              <input
                                type="text"
                                value={eventForm.ticketTierName}
                                onChange={(e) =>
                                  setEventForm({ ...eventForm, ticketTierName: e.target.value })
                                }
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Harga (Rp):</span>
                              <input
                                type="number"
                                value={eventForm.ticketPrice}
                                onChange={(e) =>
                                  setEventForm({ ...eventForm, ticketPrice: Number(e.target.value) })
                                }
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Kuota:</span>
                              <input
                                type="number"
                                value={eventForm.ticketQuota}
                                onChange={(e) =>
                                  setEventForm({ ...eventForm, ticketQuota: Number(e.target.value) })
                                }
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer">
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
                            Buka Pendaftaran Online (RSVP / E-Badge)
                          </label>
                          <span className="text-[10px] font-bold text-emerald-600">Gratis / Pass</span>
                        </div>
                        {eventForm.isOpenOnlineRegistration && (
                          <div className="pt-1 text-xs">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">Fasilitas Peserta (Pisahkan koma):</span>
                            <input
                              type="text"
                              value={eventForm.facilitiesText}
                              onChange={(e) =>
                                setEventForm({ ...eventForm, facilitiesText: e.target.value })
                              }
                              placeholder="Sertifikat Digital, E-Badge Pass QR, Snack"
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      {isSuperAdmin ? (
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

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition active:scale-95"
                      >
                        <Check className="h-4 w-4" />
                        Simpan Semua Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 2: PENJURIAN LKBB (CETAS.SCORE) */}
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
                          PIN Dewan Juri & Regulasi
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">Master PIN: 2026</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="text-[10px] text-slate-400">Juri 1 (PBB)</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Mayor Bambang</div>
                          <div className="font-mono text-purple-600 font-bold text-[10px]">PIN: 1111</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="text-[10px] text-slate-400">Juri 2 (Variasi)</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Kapten Hendra</div>
                          <div className="font-mono text-purple-600 font-bold text-[10px]">PIN: 2222</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="text-[10px] text-slate-400">Juri 3 (Danton)</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Lettu Rina K.</div>
                          <div className="font-mono text-purple-600 font-bold text-[10px]">PIN: 3333</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="text-[10px] text-slate-400">Juri 4 (Kostum)</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Dra. Nurul A.</div>
                          <div className="font-mono text-purple-600 font-bold text-[10px]">PIN: 4444</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 3: BILIK VOTING KHUSUS EVENT INI */}
              {/* ========================================================== */}
              {eventSubTab === "VOTE" && (
                <div className="space-y-6">
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenCreateCategory}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition active:scale-95"
                        >
                          <PlusCircle className="h-4 w-4" />
                          + Tambah Kategori
                        </button>

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
                            </div>
                          );
                        })}

                        {(!activeVoteEvent?.categories || activeVoteEvent.categories.length === 0) && (
                          <div className="text-xs text-slate-400 italic py-2">
                            Belum ada kategori voting. Klik "+ Tambah Kategori" di atas.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daftar Peserta di Kategori Terpilih */}
                  {activeVoteCategory && (
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

                        <button
                          onClick={handleOpenCreateCandidate}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition active:scale-95"
                        >
                          <UserPlus className="h-4 w-4" />
                          + Tambah Peserta Baru
                        </button>
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
                            </div>
                          </div>
                        ))}

                        {activeCategoryCandidates.length === 0 && (
                          <div className="col-span-full text-center py-12 text-xs text-slate-400 space-y-2">
                            <div>Belum ada peserta di kategori ini.</div>
                            <button
                              onClick={handleOpenCreateCandidate}
                              className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                            >
                              + Daftarkan Peserta Pertama
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 4: TIKET & SCANNER GATE */}
              {/* ========================================================== */}
              {eventSubTab === "TICKETS" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-blue-500" />
                        Tiket Masuk & Validasi Scanner Pintu
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tier tiket resmi untuk <strong>{selectedEvent.title}</strong> yang terhubung dengan QR Scanner tiket panitia.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/scanner?eventId=${selectedEvent.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition active:scale-95"
                      >
                        <Ticket className="h-4 w-4" />
                        Buka Scanner Pintu Masuk
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                        Status Tiket
                      </span>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {selectedEvent.isOpenTicketing ? "🟢 Tiket Aktif & Tayang" : "⚪ Penjualan Tutup"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Tier</span>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {selectedEvent.tiers?.length || 1} Kategori Tiket
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Metode Bayar</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        DOKU QRIS & E-Wallet
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Daftar Tier Tiket Tersedia
                    </h4>
                    <div className="space-y-2">
                      {(selectedEvent.tiers && selectedEvent.tiers.length > 0
                        ? selectedEvent.tiers
                        : [
                            {
                              id: "default-tier",
                              name: eventForm.ticketTierName || "Festival Regular",
                              price: eventForm.ticketPrice || 150000,
                              quotaTotal: eventForm.ticketQuota || 200,
                              quotaRemaining: eventForm.ticketQuota || 200,
                            },
                          ]
                      ).map((tier, idx) => (
                        <div
                          key={tier.id || idx}
                          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {tier.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Sisa Kuota: <strong>{tier.quotaRemaining}</strong> dari {tier.quotaTotal} tiket
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-blue-600">
                              {formatRupiah(tier.price)}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold">Auto Verification</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 5: DAFTAR PESERTA & STATUS KEHADIRAN */}
              {/* ========================================================== */}
              {eventSubTab === "ATTENDEES" && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Daftar Peserta Terdaftar: {selectedEvent.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Data peserta yang memegang E-Badge resmi untuk event ini.
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari nama / kode badge..."
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-4">Kode E-Badge & Nama Peserta</th>
                          <th className="p-4">Instansi & Kategori</th>
                          <th className="p-4">Waktu Daftar</th>
                          <th className="p-4">Status Kehadiran</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendees
                          .filter((atd) => {
                            const matchEvent =
                              atd.eventId === selectedEvent.id ||
                              atd.eventName.toLowerCase().trim() ===
                                selectedEvent.title.toLowerCase().trim();
                            const matchSearch =
                              !attendeeSearch.trim() ||
                              atd.fullName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                              atd.badgeCode.toLowerCase().includes(attendeeSearch.toLowerCase());
                            return matchEvent && matchSearch;
                          })
                          .map((atd) => (
                            <tr key={atd.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-4">
                                <span className="font-mono text-[11px] font-black text-orange-500 block">
                                  {atd.badgeCode}
                                </span>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                  {atd.fullName}
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                  {atd.email} • {atd.phone}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {atd.institution}
                                </div>
                                <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {atd.category}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 text-[11px]">
                                {formatDateTime(atd.registeredAt)}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                    atd.isPresent
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      atd.isPresent ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                                  />
                                  {atd.isPresent ? "HADIR" : "BELUM HADIR"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleToggleAttendeePresence(atd.id)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold hover:bg-slate-100 transition"
                                >
                                  {atd.isPresent ? "Batalkan Hadir" : "Tandai Hadir"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {attendees.filter(
                    (atd) =>
                      atd.eventId === selectedEvent.id ||
                      atd.eventName.toLowerCase().trim() === selectedEvent.title.toLowerCase().trim()
                  ).length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Belum ada peserta terdaftar khusus untuk event ini.
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
                Manajemen Produk & Alat Rental Cetas Production
              </h3>
              <p className="text-xs text-slate-500">
                Kelola katalog merchandise, sound system, lighting, videotron, dan paket live streaming.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsList.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {prod.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        prod.status === "TERSEDIA"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {prod.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {prod.name}
                  </h4>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatRupiah(prod.price)}{" "}
                    <span className="text-xs font-normal text-slate-500">/ {prod.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Stok Tersedia: <strong>{prod.stock}</strong> unit
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</span>

                  {canManageProd && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-bold transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
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
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Rekonsiliasi Arus Kas DOKU Direct API</span>
                <span className="text-[10px] bg-red-100 text-[#E1251B] dark:bg-red-950 dark:text-red-300 font-extrabold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                  SNAP BI ASPI
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pembayaran otomatis terhubung dengan QRIS MPM & E-Wallet (OVO, ShopeePay, DANA) via direct integration.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              DOKU Direct Webhook Auto-Settlement Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">QRIS & E-Wallet (SPay/DANA/OVO)</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatRupiah(finances.totalOmzet > 0 ? Math.round(finances.totalOmzet * 0.65) : 0)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">
                {finances.totalOmzet > 0 ? "65% dari total transaksi" : "Belum ada transaksi"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">Virtual Account (BCA/BRI/BNI)</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatRupiah(finances.totalOmzet > 0 ? Math.round(finances.totalOmzet * 0.35) : 0)}
              </div>
              <div className="text-[11px] text-blue-600 mt-1">
                {finances.totalOmzet > 0 ? "35% dari total transaksi" : "Belum ada transaksi"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">Status Settlement Hari Ini</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {finances.totalOmzet > 0 ? "100% SUKSES" : "SIAP MENERIMA"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">0 transaksi dispute / chargeback</div>
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
                        Login Terakhir: {st.lastLogin || "Baru saja"}
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
                        onChange={(e) => handleChangeStaffRole(st.id, e.target.value as AdminRole)}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                      >
                        <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Akses 100%)</option>
                        <option value="EVENT_ADMIN">🎫 EVENT_ADMIN</option>
                        <option value="FINANCE_ADMIN">💰 FINANCE_ADMIN</option>
                        <option value="PROD_ADMIN">📦 PROD_ADMIN</option>
                        <option value="SCANNER_STAFF">🚪 SCANNER_STAFF</option>
                      </select>
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
                  Kategori: {activeVoteCategory?.title}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  {editingCandidateId ? "Edit Data Peserta" : "Tambah Peserta Baru di Kategori Ini"}
                </h3>
              </div>
              <button
                onClick={() => setIsCandidateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="overflow-y-auto flex-1 pr-1 space-y-3.5 my-3">
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
                  label="Foto Profil Peserta (Upload Langsung)"
                  description="Upload foto potret resmi peserta voting (Format PNG, JPG, WEBP)"
                  accept="image/*"
                  value={candidateForm.photoUrl}
                  onChange={(dataUrl) =>
                    setCandidateForm({ ...candidateForm, photoUrl: dataUrl })
                  }
                  aspectRatio="square"
                  required
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
                {editingProductId ? "Edit Produk / Alat Rental" : "Tambah Produk / Alat Baru"}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Utama
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as UnifiedProduct["category"],
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  >
                    <option value="EQUIPMENT">EQUIPMENT (Sewa Alat)</option>
                    <option value="MERCHANDISE">MERCHANDISE (Produk Beli)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                  />
                </div>
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
    </div>
  );
}
