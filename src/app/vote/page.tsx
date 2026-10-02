"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Users,
  Sparkles,
  School,
  GraduationCap,
  Medal,
  Calendar,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Search,
  Ticket,
  MapPin,
  Clock,
  Tag,
  Download,
  Printer,
  QrCode as QrIcon,
  Info,
  ExternalLink,
  Layers,
  UserCheck,
  Check,
  UserPlus,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { MidtransSimulatorModal } from "@/components/midtrans-simulator-modal";
import { getEventTheme, EventThemePreset } from "@/lib/event-theme";
import { createTicketQRString, generateQRCodeDataUrl } from "@/lib/ticket-security";
import {
  INITIAL_EVENT_VOTINGS,
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
} from "@/lib/vote-unified-data";
import {
  INITIAL_UNIFIED_EVENTS,
  UnifiedEvent,
  UnifiedTicketTier,
} from "@/lib/events-unified-data";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snap?: any;
  }
}

interface IssuedTicket {
  ticketCode: string;
  eventName: string;
  tierName: string;
  holderName: string;
  holderEmail: string;
  date: string;
  location: string;
  qrDataUrl: string;
}

// Komponen Pembungkus Suspense untuk Next.js App Router
export default function VotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="animate-pulse text-sm font-bold text-slate-500">
            Memuat Papan Event & Dashboard Cetas...
          </div>
        </div>
      }
    >
      <VotePageContent />
    </Suspense>
  );
}

function VotePageContent() {
  const searchParams = useSearchParams();

  // State data dari API
  const [eventVotings, setEventVotings] = useState<EventVotingConfig[]>(INITIAL_EVENT_VOTINGS);
  const [unifiedEvents, setUnifiedEvents] = useState<UnifiedEvent[]>(INITIAL_UNIFIED_EVENTS);

  // State Hierarki Halaman (Event -> Kategori -> Peserta)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"VOTE" | "TICKETS" | "REGISTRATION" | "DETAILS">("VOTE");

  // Filter & Search di Level Katalog Event
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"ALL" | "VOTE" | "TICKETS" | "REG">("ALL");

  // Search di Level Peserta
  const [candidateSearch, setCandidateSearch] = useState("");

  // Voting Payment State
  const [selectedCandidate, setSelectedCandidate] = useState<VoteCandidate | null>(null);
  const [voteCount, setVoteCount] = useState<number>(5);
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [isLoadingVote, setIsLoadingVote] = useState(false);
  const [voteStatus, setVoteStatus] = useState<string | null>(null);

  // Ticketing Purchase State
  const [selectedTier, setSelectedTier] = useState<UnifiedTicketTier | null>(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isBuyingTicket, setIsBuyingTicket] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<IssuedTicket | null>(null);

  // Simulator Modal State
  const [simulatorData, setSimulatorData] = useState<{
    orderNumber: string;
    grossAmount: number;
    customerName: string;
    orderType: "VOTE" | "TICKET";
  } | null>(null);

  // Fetch initial data
  useEffect(() => {
    // 1. Fetch Voting Configs
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.eventVotings && data.eventVotings.length > 0) {
          setEventVotings(data.eventVotings);
        }
      })
      .catch(() => {});

    // 2. Fetch Unified Events (Ticketing & Registration)
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events && data.events.length > 0) {
          setUnifiedEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  // Baca URL Search Params saat pertama kali load
  useEffect(() => {
    const urlEventId = searchParams.get("eventId");
    const urlCategory = searchParams.get("category");
    const urlTab = searchParams.get("tab");

    if (urlEventId) {
      setSelectedEventId(urlEventId);
    }
    if (urlCategory) {
      setSelectedCategoryId(urlCategory);
    }
    if (urlTab && ["VOTE", "TICKETS", "REGISTRATION", "DETAILS"].includes(urlTab.toUpperCase())) {
      setActiveTab(urlTab.toUpperCase() as "VOTE" | "TICKETS" | "REGISTRATION" | "DETAILS");
    }
  }, [searchParams]);

  // Sinkronkan URL browser secara dinamis tanpa reload halaman
  const updateUrlHistory = (eventId: string | null, categoryId: string | null, tab: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (eventId) {
      url.searchParams.set("eventId", eventId);
      if (categoryId) {
        url.searchParams.set("category", categoryId);
      } else {
        url.searchParams.delete("category");
      }
      url.searchParams.set("tab", tab);
    } else {
      url.searchParams.delete("eventId");
      url.searchParams.delete("category");
      url.searchParams.delete("tab");
    }
    window.history.pushState({}, "", url.toString());
  };

  // -------------------------------------------------------------
  // PENGGABUNGAN DATA EVENT TERPADU (VOTING + TICKETING + REGISTRASI)
  // -------------------------------------------------------------
  const allEventsMap = new Map<string, {
    id: string;
    title: string;
    bannerUrl: string;
    themePreset: EventThemePreset;
    date: string;
    time: string;
    location: string;
    organizer: string;
    description: string;
    categories: VoteCategory[];
    tiers: UnifiedTicketTier[];
    isOpenTicketing: boolean;
    isOpenOnlineRegistration: boolean;
    quotaRemaining: number;
    facilities: string[];
  }>();

  // Seed dari Unified Events
  unifiedEvents.forEach((ue) => {
    allEventsMap.set(ue.id, {
      id: ue.id,
      title: ue.title,
      bannerUrl: ue.bannerUrl,
      themePreset: ue.themePreset || "FLAME",
      date: ue.date,
      time: ue.time || "09:00 - 17:00 WIB",
      location: ue.location || "Venue Acara Cetas",
      organizer: ue.organizer || "Cetas Official",
      description: ue.description || "Acara resmi di platform Cetas Ecosystem.",
      categories: [],
      tiers: ue.tiers || [],
      isOpenTicketing: Boolean(ue.isOpenTicketing && ue.tiers && ue.tiers.length > 0),
      isOpenOnlineRegistration: Boolean(ue.isOpenOnlineRegistration),
      quotaRemaining: ue.quotaRemaining || 0,
      facilities: ue.facilities || [],
    });
  });

  // Gabungkan dengan Event Voting Config
  eventVotings.forEach((ev) => {
    const existing = allEventsMap.get(ev.eventId);
    if (existing) {
      existing.categories = ev.categories || [];
      if (ev.bannerUrl) existing.bannerUrl = ev.bannerUrl;
      if (ev.themePreset) existing.themePreset = ev.themePreset;
    } else {
      allEventsMap.set(ev.eventId, {
        id: ev.eventId,
        title: ev.eventTitle,
        bannerUrl: ev.bannerUrl,
        themePreset: ev.themePreset || "GOLDEN",
        date: ev.eventDate,
        time: "09:00 - 17:00 WIB",
        location: "Venue Resmi Cetas",
        organizer: "Panitia Pelaksana",
        description: `Bilik pemilihan resmi untuk ${ev.eventTitle}.`,
        categories: ev.categories || [],
        tiers: [],
        isOpenTicketing: false,
        isOpenOnlineRegistration: false,
        quotaRemaining: 0,
        facilities: ["Bilik Voting Digital", "Verifikasi Midtrans Realtime"],
      });
    }
  });

  const mergedEventsList = Array.from(allEventsMap.values());

  // Event yang sedang aktif dipilih
  const activeEvent = selectedEventId ? allEventsMap.get(selectedEventId) || null : null;
  const activeTheme = getEventTheme(activeEvent?.themePreset);

  // Kategori aktif dalam event terpilih
  const activeCategory =
    activeEvent && selectedCategoryId
      ? activeEvent.categories.find((c) => c.id === selectedCategoryId) || null
      : null;

  // -------------------------------------------------------------
  // FILTERING LOGIC KATALOG EVENT (LEVEL 1)
  // -------------------------------------------------------------
  const filteredEvents = mergedEventsList.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(eventSearch.toLowerCase()) ||
      ev.location.toLowerCase().includes(eventSearch.toLowerCase());

    if (!matchSearch) return false;
    if (eventFilter === "VOTE") return ev.categories.length > 0;
    if (eventFilter === "TICKETS") return ev.isOpenTicketing;
    if (eventFilter === "REG") return ev.isOpenOnlineRegistration;
    return true;
  });

  // -------------------------------------------------------------
  // HANDLERS NAVIGASI
  // -------------------------------------------------------------
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedCategoryId(null);
    setActiveTab("VOTE");
    updateUrlHistory(eventId, null, "VOTE");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToAllEvents = () => {
    setSelectedEventId(null);
    setSelectedCategoryId(null);
    updateUrlHistory(null, null, "VOTE");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    updateUrlHistory(selectedEventId, categoryId, activeTab);
    window.scrollTo({ top: 250, behavior: "smooth" });
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    updateUrlHistory(selectedEventId, null, activeTab);
  };

  const handleChangeTab = (tab: "VOTE" | "TICKETS" | "REGISTRATION" | "DETAILS") => {
    setActiveTab(tab);
    updateUrlHistory(selectedEventId, selectedCategoryId, tab);
  };

  // -------------------------------------------------------------
  // LOGIKA PEMBAYARAN VOTE (MIDTRANS)
  // -------------------------------------------------------------
  const pricePerVote = activeCategory?.pricePerVote || 2000;
  const votePackages = [
    { count: 1, label: "1 Suara", price: pricePerVote },
    { count: 5, label: "5 Suara (Diskon 5%)", price: Math.round(pricePerVote * 5 * 0.95) },
    { count: 10, label: "10 Suara (Diskon 10%)", price: Math.round(pricePerVote * 10 * 0.9) },
    { count: 50, label: "50 Suara (Best Value)", price: Math.round(pricePerVote * 50 * 0.85) },
    { count: 100, label: "100 Suara (VIP Pack)", price: Math.round(pricePerVote * 100 * 0.8) },
  ];

  const currentPackagePrice =
    votePackages.find((p) => p.count === voteCount)?.price ?? voteCount * pricePerVote;

  const handlePayVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !activeEvent || !activeCategory) return;

    setIsLoadingVote(true);
    setVoteStatus(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "VOTE",
          customerName: voterName,
          customerEmail: voterEmail,
          customerPhone: voterPhone,
          items: [
            {
              id: selectedCandidate.id,
              name: `Paket Voting (${voteCount} Suara) untuk #${selectedCandidate.candidateNumber} ${selectedCandidate.name} [${activeCategory.title}]`,
              quantity: voteCount,
              price: currentPackagePrice / voteCount,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal checkout");

      // Midtrans Live or Simulator
      if (data.isSimulationFallback || !data.snapToken || data.snapToken.startsWith("SNAP-SIMULATION")) {
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: currentPackagePrice,
          customerName: voterName,
          orderType: "VOTE",
        });
      } else if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => applySuccessfulVote(),
          onPending: () => setVoteStatus("Pembayaran sedang menunggu settlement Midtrans."),
          onError: () => setVoteStatus("Pembayaran dibatalkan atau gagal."),
        });
      } else {
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: currentPackagePrice,
          customerName: voterName,
          orderType: "VOTE",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setVoteStatus(`Error: ${msg}`);
    } finally {
      setIsLoadingVote(false);
    }
  };

  const applySuccessfulVote = () => {
    if (!selectedCandidate || !activeEvent || !activeCategory) return;
    const addedVotes = voteCount;

    // Update in-memory / state
    setEventVotings((prev) =>
      prev.map((ev) => {
        if (ev.eventId !== activeEvent.id) return ev;
        return {
          ...ev,
          categories: ev.categories.map((cat) => {
            if (cat.id !== activeCategory.id) return cat;
            return {
              ...cat,
              candidates: cat.candidates.map((cand) =>
                cand.id === selectedCandidate.id
                  ? { ...cand, totalVotes: cand.totalVotes + addedVotes }
                  : cand
              ),
            };
          }),
        };
      })
    );

    // Call API update with secure RECORD_VOTE
    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "RECORD_VOTE",
        eventId: activeEvent.id,
        categoryId: activeCategory.id,
        candidateId: selectedCandidate.id,
        addedVotes: addedVotes,
        orderNumber: simulatorData?.orderNumber || `VOTE-${Date.now()}`,
        voterName: voterName || "Voter Publik Cetas",
      }),
    }).catch(() => {});

    setVoteStatus(`Terima kasih! ${addedVotes} Suara berhasil diverifikasi untuk ${selectedCandidate.name}.`);
    setSimulatorData(null);
  };

  // -------------------------------------------------------------
  // LOGIKA PEMBELIAN TIKET (TICKETING)
  // -------------------------------------------------------------
  const generateTicketPass = async (tier: UnifiedTicketTier) => {
    if (!activeEvent) return;
    const ticketCode = `CETAS-TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrString = createTicketQRString({
      ticketCode,
      eventId: activeEvent.id,
      tierId: tier.id,
      issuedAt: Date.now(),
    });
    const qrDataUrl = await generateQRCodeDataUrl(qrString);

    setIssuedTicket({
      ticketCode,
      eventName: activeEvent.title,
      tierName: tier.name,
      holderName: buyerName,
      holderEmail: buyerEmail,
      date: activeEvent.date,
      location: activeEvent.location,
      qrDataUrl,
    });
  };

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !activeEvent) return;

    setIsBuyingTicket(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "TICKET",
          customerName: buyerName,
          customerEmail: buyerEmail,
          customerPhone: buyerPhone,
          items: [
            {
              id: selectedTier.id,
              name: `${activeEvent.title} - ${selectedTier.name}`,
              quantity: ticketQty,
              price: selectedTier.price,
              eventId: activeEvent.id,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat transaksi tiket");
      }

      const isRealMidtransToken =
        data.snapToken &&
        !data.snapToken.startsWith("SNAP-SIMULATION") &&
        !data.isSimulated;

      if (typeof window !== "undefined" && window.snap && isRealMidtransToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: async function () {
            await generateTicketPass(selectedTier);
            setSelectedTier(null);
          },
          onClose: function () {
            setIsBuyingTicket(false);
          },
        });
      } else {
        setSimulatorData({
          orderNumber: data.orderNumber,
          grossAmount: selectedTier.price * ticketQty,
          customerName: buyerName,
          orderType: "TICKET",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kesalahan koneksi";
      alert(msg);
    } finally {
      setIsBuyingTicket(false);
    }
  };

  const applySuccessfulTicket = async () => {
    if (!selectedTier) return;
    await generateTicketPass(selectedTier);
    setSelectedTier(null);
    setSimulatorData(null);
  };

  const getCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("smp") || t.includes("mts")) return <School className="h-4 w-4" />;
    if (t.includes("sma") || t.includes("smk")) return <GraduationCap className="h-4 w-4" />;
    return <Medal className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* ============================================================= */}
      {/* KONDISI 1: HALAMAN KATALOG EVENT (LEVEL 1: PILIH DULU EVENT)  */}
      {/* ============================================================= */}
      {!activeEvent ? (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
          {/* Header Banner Katalog */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Direktori Resmi CETAS - Centralized Electronic Tournament & Award System
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Papan Event & Pemilihan Favorit
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pilih event di bawah untuk langsung masuk ke <strong>Dashboard Resmi Event Tersebut</strong> yang memuat bilik voting multi-kategori, pembelian tiket masuk resmi, serta pendaftaran peserta online.
            </p>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Cari event (nama acara, tema, lokasi, atau EO)..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                {[
                  { id: "ALL", label: `Semua Event (${mergedEventsList.length})` },
                  { id: "VOTE", label: "🗳️ Buka Bilik Voting" },
                  { id: "TICKETS", label: "🎟️ Tiket Tersedia" },
                  { id: "REG", label: "📝 Pendaftaran Buka" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setEventFilter(chip.id as typeof eventFilter)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      eventFilter === chip.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Katalog Event */}
          {filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                Tidak ada event yang cocok dengan pencarian Anda
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan ganti kata kunci atau reset filter pencarian di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const evTheme = getEventTheme(ev.themePreset);
                const totalCandidates = ev.categories.reduce(
                  (sum, c) => sum + (c.candidates?.length || 0),
                  0
                );
                const totalVotes = ev.categories.reduce(
                  (sum, c) => sum + (c.candidates?.reduce((s, cand) => s + cand.totalVotes, 0) || 0),
                  0
                );

                return (
                  <div
                    key={ev.id}
                    className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Event Banner */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                      {/* Theme Tag Floating */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md ${evTheme.badgeClass}`}>
                          {evTheme.name}
                        </span>
                      </div>

                      {/* Feature Tags Floating */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 flex-wrap">
                        {ev.categories.length > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow">
                            🗳️ {ev.categories.length} Kategori Vote
                          </span>
                        )}
                        {ev.isOpenTicketing && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500 text-white shadow">
                            🎟️ Tiket Buka
                          </span>
                        )}
                        {ev.isOpenOnlineRegistration && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-500 text-white shadow">
                            📝 Registrasi Buka
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                          {ev.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Oleh {ev.organizer}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span>{ev.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span className="line-clamp-1">{ev.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Box */}
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Peserta Lomba
                          </span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {totalCandidates} Peserta
                          </span>
                        </div>
                        <div className="border-l border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Total Suara Sah
                          </span>
                          <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-mono">
                            {totalVotes.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Action Button: Buka Dashboard Event */}
                      <button
                        onClick={() => handleSelectEvent(ev.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 ${evTheme.buttonClass}`}
                      >
                        Buka Dashboard Event
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ============================================================= */
        /* KONDISI 2: DASHBOARD RESMI EVENT TERPILIH (EVENT HUB)         */
        /* ============================================================= */
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={handleBackToAllEvents}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Semua Event
            </button>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="hidden sm:inline">Ekosistem Cetas &rarr;</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Dashboard Resmi: {activeEvent.title}
              </span>
            </div>
          </div>

          {/* Hero Banner Dashboard Event */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-white shadow-xl">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src={activeEvent.bannerUrl}
                alt={activeEvent.title}
                className="w-full h-full object-cover opacity-45"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent`} />
            </div>

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md ${activeTheme.badgeClass}`}>
                  {activeTheme.name}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ● Event Resmi Cetas
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {activeEvent.title}
              </h1>

              <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-300 flex-wrap pt-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-orange-400" />
                  <span>{activeEvent.organizer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span>{activeEvent.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>{activeEvent.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <span>{activeEvent.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB NAVIGASI DASHBOARD EVENT: VOTING, TIKETING, REGISTRASI, DETAIL */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleChangeTab("VOTE")}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
                activeTab === "VOTE"
                  ? `${activeTheme.buttonClass} shadow-md`
                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-100 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Award className="h-4 w-4" />
              Bilik Voting ({activeEvent.categories.length} Kategori)
            </button>

            <button
              onClick={() => handleChangeTab("TICKETS")}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
                activeTab === "TICKETS"
                  ? `${activeTheme.buttonClass} shadow-md`
                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-100 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Ticket className="h-4 w-4" />
              Beli Tiket Masuk ({activeEvent.tiers.length} Tiket)
            </button>

            <button
              onClick={() => handleChangeTab("REGISTRATION")}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
                activeTab === "REGISTRATION"
                  ? `${activeTheme.buttonClass} shadow-md`
                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-100 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Pendaftaran Peserta ({activeEvent.isOpenOnlineRegistration ? "Buka" : "Info"})
            </button>

            <button
              onClick={() => handleChangeTab("DETAILS")}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 ${
                activeTab === "DETAILS"
                  ? `${activeTheme.buttonClass} shadow-md`
                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-100 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Info className="h-4 w-4" />
              Detail & Fasilitas Acara
            </button>
          </div>

          {/* ============================================================= */}
          {/* KONTEN TAB 1: BILIK VOTING (KATEGORI & PESERTA DI HALAMAN BEDA) */}
          {/* ============================================================= */}
          {activeTab === "VOTE" && (
            <div className="space-y-6">
              {/* SUB-KONDISI A: HALAMAN PILIH KATEGORI (JIKA BELUM PILIH KATEGORI) */}
              {!activeCategory ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold mb-1">
                        <Layers className="h-3.5 w-3.5 text-amber-600" />
                        Langkah: Pilih Divisi / Kategori Perlombaan
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Kategori Perlombaan di {activeEvent.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Pilih kategori di bawah ini untuk melihat daftar peserta resmi dan memberikan suara voting sah.
                      </p>
                    </div>

                    <span className="text-xs text-slate-500 font-bold shrink-0">
                      Total {activeEvent.categories.length} Kategori Tersedia
                    </span>
                  </div>

                  {activeEvent.categories.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-2">
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        Bilik voting untuk event ini belum memiliki kategori lomba aktif.
                      </div>
                      <p className="text-xs text-slate-400">
                        Panitia pelaksana dapat menambahkan kategori lomba melalui portal Lingkup Kerja Cetas Admin.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeEvent.categories.map((cat) => {
                        const totalVotesInCat = cat.candidates.reduce((sum, c) => sum + c.totalVotes, 0);

                        return (
                          <div
                            key={cat.id}
                            className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-md ${activeTheme.bgGradient}`}>
                                  {getCategoryIcon(cat.title)}
                                </div>
                                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {cat.candidates.length} Peserta
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                  {cat.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                  {cat.description || "Kategori perlombaan resmi."}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Total Suara
                                  </span>
                                  <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-mono">
                                    {totalVotesInCat.toLocaleString("id-ID")}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Biaya / Suara
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                    {formatRupiah(cat.pricePerVote)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleSelectCategory(cat.id)}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 ${activeTheme.buttonClass}`}
                              >
                                Buka Peserta Kategori Ini
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* SUB-KONDISI B: HALAMAN DAFTAR PESERTA KATEGORI TERPILIH */
                <div className="space-y-6">
                  {/* Category Header Bar with Back Button */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <button
                          onClick={handleBackToCategories}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 dark:text-orange-400 hover:underline mb-2"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Kembali ke Pilihan Kategori Lomba
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Users className="h-6 w-6 text-orange-500" />
                          Peserta: {activeCategory.title}
                        </h2>
                        {activeCategory.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            &ldquo;{activeCategory.description}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Tarif Suara Sah
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {formatRupiah(activeCategory.pricePerVote)} / Suara
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notification Vote Status */}
                    {voteStatus && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        {voteStatus}
                      </div>
                    )}

                    {/* Candidate Search */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative w-full max-w-sm">
                        <input
                          type="text"
                          placeholder="Cari nomor urut / nama / instansi..."
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3 py-2 text-xs font-semibold"
                        />
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs text-slate-500">
                        {activeCategory.candidates.length} Peserta Terdaftar
                      </span>
                    </div>
                  </div>

                  {/* Candidate Cards Grid */}
                  {activeCategory.candidates.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
                      <div className="text-sm font-bold">
                        Belum ada peserta yang didaftarkan pada kategori &ldquo;{activeCategory.title}&rdquo;.
                      </div>
                      <p className="text-xs">
                        Silakan daftarkan peserta melalui Lingkup Kerja Cetas Admin.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeCategory.candidates
                        .filter(
                          (c) =>
                            c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                            c.institution.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                            c.candidateNumber.includes(candidateSearch)
                        )
                        .sort((a, b) => b.totalVotes - a.totalVotes)
                        .map((cand, idx) => {
                          const totalVotesInCat = activeCategory.candidates.reduce(
                            (sum, c) => sum + c.totalVotes,
                            0
                          );
                          const percentage =
                            totalVotesInCat > 0
                              ? Math.round((cand.totalVotes / totalVotesInCat) * 100)
                              : 0;

                          return (
                            <div
                              key={cand.id}
                              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                            >
                              <div>
                                {/* Candidate Photo & Number */}
                                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                  <img
                                    src={cand.photoUrl}
                                    alt={cand.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                                  {/* Badge Nomor Urut */}
                                  <div className="absolute top-3 left-3 h-10 w-10 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shadow-lg">
                                    #{cand.candidateNumber}
                                  </div>

                                  {/* Ranking Badge */}
                                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white font-extrabold text-[10px] border border-white/20">
                                    Peringkat #{idx + 1}
                                  </div>

                                  {/* Votes Bar on Image Bottom */}
                                  <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <div className="text-xl font-black font-mono">
                                      {cand.totalVotes.toLocaleString("id-ID")} Suara
                                    </div>
                                    <div className="text-[10px] text-slate-300">
                                      {percentage}% dari total suara kategori
                                    </div>
                                  </div>
                                </div>

                                {/* Info Peserta */}
                                <div className="p-5 space-y-3">
                                  <div>
                                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                      {cand.name}
                                    </h4>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-0.5">
                                      {cand.institution}
                                    </p>
                                  </div>

                                  {cand.tagline && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2">
                                      &ldquo;{cand.tagline}&rdquo;
                                    </p>
                                  )}

                                  {/* Progress Bar */}
                                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full ${activeTheme.bgGradient} rounded-full transition-all duration-500`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Button: Vote Sekarang */}
                              <div className="p-5 pt-0">
                                <button
                                  onClick={() => setSelectedCandidate(cand)}
                                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${activeTheme.buttonClass}`}
                                >
                                  <Heart className="h-4 w-4" />
                                  Vote Sekarang (Midtrans)
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* KONTEN TAB 2: BELI TIKET MASUK (CETAS TICKETING)              */}
          {/* ============================================================= */}
          {activeTab === "TICKETS" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-orange-500" />
                  Tiket Masuk Resmi — {activeEvent.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih tipe tiket masuk resmi Anda. Seluruh tiket terbit otomatis dengan QR Code E-Badge resmi yang dapat discan oleh petugas gate panitia di lokasi.
                </p>
              </div>

              {activeEvent.tiers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
                  <Ticket className="h-10 w-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    Tiket online untuk event ini belum dibuka atau menggunakan tiket On-The-Spot / Gratis.
                  </div>
                  <p className="text-xs text-slate-400">
                    Hubungi panitia pelaksana untuk informasi akses gate dan registrasi di tempat.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeEvent.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                            Akses Resmi
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            Sisa {tier.quotaRemaining} Kuota
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {tier.name}
                          </h3>
                          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
                            {formatRupiah(tier.price)}
                          </div>
                        </div>

                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>1x E-Ticket Pass Resmi + QR Anti-Palsu</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Akses Gate Cepat & Scanning Panitia</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${activeTheme.buttonClass}`}
                      >
                        Beli Tiket Ini
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* KONTEN TAB 3: PENDAFTARAN PESERTA ONLINE (ONLINE PASS)         */}
          {/* ============================================================= */}
          {activeTab === "REGISTRATION" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-orange-500" />
                    Pendaftaran Peserta Lomba / Kompetisi
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Registrasi resmi bagi peserta kontingen sekolah, tim, maupun perseorangan.
                  </p>
                </div>

                <span
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${
                    activeEvent.isOpenOnlineRegistration
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {activeEvent.isOpenOnlineRegistration
                    ? "● Pendaftaran Online Buka"
                    : "○ Pendaftaran Ditutup / Manual"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Fasilitas Peserta Terdaftar
                  </h3>
                  <div className="space-y-2">
                    {activeEvent.facilities.map((fac, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                      Status Kuota Pendaftaran
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {activeEvent.isOpenOnlineRegistration
                        ? `Tersedia ${activeEvent.quotaRemaining} Slot`
                        : "Hubungi Panitia"}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Lakukan pendaftaran tim/kontingen dengan mengisi formulir resmi, mengunggah kartu pelajar / surat tugas, dan dapatkan E-Badge registrasi langsung.
                    </p>
                  </div>

                  <Link
                    href={`/register-event?eventId=${activeEvent.id}`}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-2 transition active:scale-95 ${activeTheme.buttonClass}`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Buka Formulir Pendaftaran Peserta &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* KONTEN TAB 4: DETAIL & FASILITAS ACARA                        */}
          {/* ============================================================= */}
          {activeTab === "DETAILS" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Tentang Acara — {activeEvent.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Diselenggarakan oleh {activeEvent.organizer}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Deskripsi Lengkap
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Waktu Acara</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {activeEvent.date}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{activeEvent.time}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Lokasi Venue</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {activeEvent.location}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Sistem gate barcode & scanner resmi</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL CHECKOUT VOTE VIA MIDTRANS                              */}
      {/* ============================================================= */}
      {selectedCandidate && activeCategory && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">
                  Kategori: {activeCategory.title}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Vote untuk #{selectedCandidate.candidateNumber} {selectedCandidate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayVote} className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
              {/* Pilihan Paket Vote */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Paket Jumlah Suara:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {votePackages.map((pkg) => (
                    <button
                      key={pkg.count}
                      type="button"
                      onClick={() => setVoteCount(pkg.count)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        voteCount === pkg.count
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 ring-2 ring-orange-500/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{pkg.label}</div>
                      <div className="text-sm font-black text-orange-600 dark:text-orange-400 mt-1 font-mono">
                        {formatRupiah(pkg.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Voter */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Data Voter (Untuk Bukti Settlement Resmi):
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama voter"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Email Aktif *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="voter@example.com"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nomor WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={voterPhone}
                      onChange={(e) => setVoterPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Total Pembayaran
                  </span>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-400">
                    {formatRupiah(currentPackagePrice)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingVote}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {isLoadingVote ? "Menyiapkan..." : "Lanjut Pembayaran →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL CHECKOUT TIKET MASUK                                    */}
      {/* ============================================================= */}
      {selectedTier && activeEvent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">
                  Event: {activeEvent.title}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Beli Tiket: {selectedTier.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBuyTicket} className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {selectedTier.name}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-bold font-mono">
                    {formatRupiah(selectedTier.price)} / tiket
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Qty:</label>
                  <select
                    value={ticketQty}
                    onChange={(e) => setTicketQty(Number(e.target.value))}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Tiket
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Data Pemesan Tiket (E-Ticket Dikirim ke Sini):
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nama Lengkap Pemegang Tiket *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Email Penerima Tiket *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Total Biaya Tiket ({ticketQty} Tiket)
                  </span>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
                    {formatRupiah(selectedTier.price * ticketQty)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isBuyingTicket}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {isBuyingTicket ? "Memproses..." : "Bayar Tiket (Midtrans) →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL E-TICKET PASS DENGAN QR CODE (SETELAH BELI TIKET SUKSES) */}
      {/* ============================================================= */}
      {issuedTicket && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl my-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Tiket Masuk Resmi Berhasil Terbit!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tunjukkan QR Code ini kepada panitia / gatekeeper untuk scan masuk.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
                <img
                  src={issuedTicket.qrDataUrl}
                  alt="QR Code Tiket"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div>
                <span className="font-mono text-xs font-black text-orange-600 block">
                  {issuedTicket.ticketCode}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {issuedTicket.eventName} — {issuedTicket.tierName}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">
                  Atas Nama: <strong>{issuedTicket.holderName}</strong> ({issuedTicket.holderEmail})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Tiket
              </button>
              <button
                onClick={() => setIssuedTicket(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
              >
                Selesai & Tutup ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal jika offline merchant key */}
      <MidtransSimulatorModal
        isOpen={Boolean(simulatorData)}
        onClose={() => setSimulatorData(null)}
        orderNumber={simulatorData?.orderNumber || ""}
        grossAmount={simulatorData?.grossAmount || 0}
        customerName={simulatorData?.customerName || ""}
        onSuccess={() => {
          if (simulatorData?.orderType === "VOTE") {
            applySuccessfulVote();
          } else if (simulatorData?.orderType === "TICKET") {
            applySuccessfulTicket();
          }
        }}
      />
    </div>
  );
}
