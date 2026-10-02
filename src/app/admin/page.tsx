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
  ToggleLeft,
  ToggleRight,
  Crown,
  Layers,
  FileCheck2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
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
  INITIAL_ATTENDEES,
  INITIAL_REGISTRATION_EVENTS,
  RegisteredAttendee,
  EventRegistrationItem,
} from "@/lib/events-registration-data";

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

export default function AdminDashboardPage() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffAccountRecord[]>(INITIAL_STAFF_ACCOUNTS);

  // Financial KPIs (Super Admin can edit!)
  const [finances, setFinances] = useState({
    totalOmzet: 84500000,
    ticketOmzet: 42300000,
    voteOmzet: 18700000,
    prodOmzet: 23500000,
    ticketsSold: 428,
    votesCount: 9350,
  });
  const [isEditingFinances, setIsEditingFinances] = useState(false);
  const [tempFinances, setTempFinances] = useState(finances);

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-01",
      eventName: "Festival Seni & Musik Indie Jakarta 2026",
      organizer: "Komunitas Nada Kita",
      phone: "081299887766",
      features: "Cetas Ticketing, Iklan Cetas Kita",
      status: "PENDING",
      submittedAt: "2026-10-02T10:15:00",
    },
    {
      id: "sub-02",
      eventName: "Grand Final Pemilihan Duta Pariwisata Daerah",
      organizer: "Dinas Pemuda & Olahraga",
      phone: "081388776655",
      features: "Cetas Vote, Cetas Production",
      status: "PENDING",
      submittedAt: "2026-10-01T14:30:00",
    },
    {
      id: "sub-03",
      eventName: "Hackathon & Tech Expo 2026",
      organizer: "Himpunan Mahasiswa Informatika",
      phone: "085611223344",
      features: "Pendaftaran Peserta, Cetas Ticketing",
      status: "APPROVED",
      submittedAt: "2026-09-28T09:00:00",
    },
  ]);

  // Attendees & Events Registration State
  const [attendees, setAttendees] = useState<RegisteredAttendee[]>(INITIAL_ATTENDEES);
  const [eventsList, setEventsList] = useState<EventRegistrationItem[]>(INITIAL_REGISTRATION_EVENTS);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("ALL");

  // Ads Management State
  const [ads, setAds] = useState<AdItem[]>([
    {
      id: "ad-1",
      title: "Promo Sewa Sound & Lighting Cetas Production Disc 25%",
      placement: "Homepage Top Banner",
      isActive: true,
      impressions: 14820,
      clicks: 1240,
    },
    {
      id: "ad-2",
      title: "Official Merchandise Kaos Cetas Festival 2026",
      placement: "Footer E-Ticket PDF",
      isActive: true,
      impressions: 428,
      clicks: 89,
    },
  ]);
  const [newAdModal, setNewAdModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdPlacement, setNewAdPlacement] = useState("Homepage Top Banner");

  // New Staff Modal State
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EVENT_ADMIN" as AdminRole,
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "FINANCES" | "SUBMISSIONS" | "ATTENDEES" | "ADS" | "PRODUCTION" | "STAFF" | "AUDIT"
  >("FINANCES");

  // Search input for attendees
  const [attendeeSearch, setAttendeeSearch] = useState("");

  // Load session & staff on mount
  useEffect(() => {
    const session = getStoredAdminSession();
    if (session) {
      setCurrentUser(session);
    }
    const storedStaff = getStoredStaffList();
    if (storedStaff && storedStaff.length > 0) {
      setStaffList(storedStaff);
    }
    // Fetch attendees from API
    fetch("/api/attendees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.attendees) {
          setAttendees(data.attendees);
        }
        if (data.success && data.events) {
          setEventsList(data.events);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Login
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

  // Quick 1-Click Role Switcher Demo Login
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

  // Handle Logout
  const handleLogout = () => {
    clearAdminSession();
    setCurrentUser(null);
  };

  // Super Admin: Save Finances changes
  const handleSaveFinances = () => {
    setFinances(tempFinances);
    setIsEditingFinances(false);
  };

  // Submissions Approve/Reject
  const handleApproveSubmission = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );
  };

  const handleRejectSubmission = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "REJECTED" } : s))
    );
  };

  // Attendees Attendance Toggle
  const handleToggleAttendance = async (attendeeId: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === attendeeId ? { ...a, isPresent: !a.isPresent } : a))
    );
    try {
      await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ATTENDANCE", attendeeId }),
      });
    } catch {}
  };

  // Super Admin: Delete Attendee
  const handleDeleteAttendee = async (attendeeId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data peserta ini?")) {
      setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
      try {
        await fetch("/api/attendees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "DELETE_ATTENDEE", attendeeId }),
        });
      } catch {}
    }
  };

  // Super Admin: Toggle Online Registration for an event
  const handleToggleEventOnline = async (eventId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setEventsList((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              isOpenOnlineRegistration: nextStatus,
              statusNote: nextStatus ? "🟢 Pendaftaran Online Dibuka" : "🔴 Pendaftaran Ditutup oleh Admin",
            }
          : ev
      )
    );
    try {
      await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_EVENT_REGISTRATION",
          eventId,
          isOpenOnline: nextStatus,
        }),
      });
    } catch {}
  };

  // Ads: Toggle status
  const handleToggleAdStatus = (adId: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  // Ads: Add new
  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim()) return;
    const newAd: AdItem = {
      id: `ad-${Date.now()}`,
      title: newAdTitle,
      placement: newAdPlacement,
      isActive: true,
      impressions: 0,
      clicks: 0,
    };
    setAds([newAd, ...ads]);
    setNewAdTitle("");
    setNewAdModal(false);
  };

  // Staff Management: Change Role (Super Admin only)
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

    // If current logged-in user changed their own role
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

  // Staff Management: Add new staff
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

  // Delete staff
  const handleDeleteStaff = (staffId: string) => {
    if (staffId === currentUser?.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }
    if (confirm("Hapus akun staf ini?")) {
      const updated = staffList.filter((s) => s.id !== staffId);
      setStaffList(updated);
      saveStoredStaffList(updated);
    }
  };

  // ----------------------------------------------------------------------
  // JIKA BELUM LOGIN: TAMPILKAN LAYAR LOGIN BACKOFFICE LINGKUP KERJA CETAS
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

          {/* Form Login Manual */}
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
  // JIKA SUDAH LOGIN: TAMPILKAN DASHBOARD BACKOFFICE LENGKAP SESUAI ROLE
  // ----------------------------------------------------------------------
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  // Filter attendees by selected event and search keyword
  const filteredAttendees = attendees.filter((a) => {
    const matchEvent = selectedEventFilter === "ALL" || a.eventId === selectedEventFilter;
    const matchSearch =
      !attendeeSearch ||
      a.fullName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.badgeCode.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.institution.toLowerCase().includes(attendeeSearch.toLowerCase());
    return matchEvent && matchSearch;
  });

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
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${currentUser.badgeColor}`}
              >
                {currentUser.roleTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} • {currentUser.description}
            </p>
          </div>
        </div>

        {/* Quick Switch Role Pills (Sangat praktis untuk test evaluasi) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="text-[10px] font-bold uppercase text-slate-400 mr-1 hidden lg:block">
            Ganti Role Cepat:
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

      {/* Super Admin Golden Notice */}
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
                Anda memiliki hak istimewa untuk mengedit angka omzet finansial, persetujuan proposal event, slot iklan banner, status buka/tutup pendaftaran peserta online, dan mengubah role staf.
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

      {/* Modal / Form Edit Finansial Super Admin */}
      {isSuperAdmin && isEditingFinances && (
        <div className="rounded-3xl border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                Panel Edit Finansial Cetas (Khusus Super Admin)
              </h3>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              Perubahan langsung ter-update di dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Total Omzet Cetas (Rp)
              </label>
              <input
                type="number"
                value={tempFinances.totalOmzet}
                onChange={(e) =>
                  setTempFinances({ ...tempFinances, totalOmzet: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Omzet Ticketing (Rp)
              </label>
              <input
                type="number"
                value={tempFinances.ticketOmzet}
                onChange={(e) =>
                  setTempFinances({ ...tempFinances, ticketOmzet: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Omzet Cetas Vote (Rp)
              </label>
              <input
                type="number"
                value={tempFinances.voteOmzet}
                onChange={(e) =>
                  setTempFinances({ ...tempFinances, voteOmzet: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Omzet Cetas Production (Rp)
              </label>
              <input
                type="number"
                value={tempFinances.prodOmzet}
                onChange={(e) =>
                  setTempFinances({ ...tempFinances, prodOmzet: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditingFinances(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={handleSaveFinances}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
            >
              Simpan Perubahan Finansial ✓
            </button>
          </div>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Omzet Cetas</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(finances.totalOmzet)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +18.4% bulan ini
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

      {/* Main Tabs Navigation (Role-Adaptive) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("FINANCES")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "FINANCES"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Omzet & Midtrans
        </button>

        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "SUBMISSIONS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Pengajuan Event ({submissions.filter((s) => s.status === "PENDING").length})
        </button>

        <button
          onClick={() => setActiveTab("ATTENDEES")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "ATTENDEES"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Pendaftaran Peserta ({attendees.length})
        </button>

        <button
          onClick={() => setActiveTab("ADS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "ADS"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          Iklan Cetas Kita ({ads.length})
        </button>

        <button
          onClick={() => setActiveTab("PRODUCTION")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "PRODUCTION"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Cetas Production
        </button>

        {/* Khusus Super Admin: Tab Manajemen Staf & Role Akun */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("STAFF")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
              activeTab === "STAFF"
                ? "bg-amber-500 text-white border-amber-600 shadow-md"
                : "border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            Kelola Akun & Role Staf
          </button>
        )}

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "AUDIT"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Log Audit & Keamanan
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: OMZET & MIDTRANS */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "FINANCES" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Rekonsiliasi Arus Kas Midtrans Gateway
                </h3>
                <p className="text-xs text-slate-500">
                  Pembayaran otomatis terhubung dengan QRIS, Bank BCA/Mandiri/BRI Virtual Account, dan GoPay.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Webhook Notification Auto-Settlement Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold">Metode QRIS & GoPay</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Rp 51.200.000
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">60.5% dari total transaksi</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold">Virtual Account (BCA/BRI/BNI)</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Rp 28.300.000
                </div>
                <div className="text-[11px] text-blue-600 mt-1">33.5% dari total transaksi</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold">Status Settlement Hari Ini</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  100% SUKSES
                </div>
                <div className="text-[11px] text-slate-500 mt-1">0 transaksi dispute / chargeback</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: PENGAJUAN EVENT MASUK (PROPOSAL EO) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "SUBMISSIONS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Proposal Pengajuan Event Dari Penyelenggara (EO)
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser.canApproveEvents
                  ? "Anda memiliki hak untuk Menyetujui atau Menolak proposal event."
                  : "Akses Read-Only: Hanya Super Admin dan Event Admin yang berwenang mengambil keputusan."}
              </p>
            </div>
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
                  <th className="p-4 text-right">Aksi Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => (
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
                    <td className="p-4 text-slate-500">
                      {formatDateTime(sub.submittedAt)}
                    </td>
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
                      {currentUser.canApproveEvents ? (
                        sub.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleApproveSubmission(sub.id)}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-xs transition"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleRejectSubmission(sub.id)}
                              className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-semibold px-3 py-1.5 text-xs transition"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-slate-400 italic text-[11px]">Selesai Ditinjau</span>
                            {isSuperAdmin && (
                              <button
                                onClick={() =>
                                  setSubmissions((prev) =>
                                    prev.map((s) => (s.id === sub.id ? { ...s, status: "PENDING" } : s))
                                  )
                                }
                                className="text-[10px] text-orange-500 underline font-bold"
                              >
                                Reset Status
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Tidak Berwenang Mengubah
                        </span>
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
      {/* TAB 3: PENDAFTARAN PESERTA EVENT ONLINE */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "ATTENDEES" && (
        <div className="space-y-6">
          {/* Sub-Header: Kontrol Status Buka/Tutup Pendaftaran Online per Event (Super Admin & Event Admin) */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  Pengaturan Fitur Buka/Tutup Pendaftaran Online per Event
                </h3>
                <p className="text-xs text-slate-500">
                  Hanya event dengan status <strong>&ldquo;Pendaftaran Dibuka&rdquo;</strong> yang akan muncul dan dapat didaftar oleh publik di halaman <Link href="/register-event" className="text-emerald-600 underline font-bold">/register-event</Link>.
                </p>
              </div>
              {isSuperAdmin && (
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  👑 Super Admin Toggle Enabled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventsList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {ev.category}
                      </span>
                      {ev.isOpenOnlineRegistration ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          🟢 Online Dibuka
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          🔴 Ditutup / Offline
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {ev.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sisa Kuota: <strong>{ev.quotaRemaining}</strong> dari {ev.quotaTotal}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Status Jalur Cetas:</span>
                    {currentUser.canManageAttendees ? (
                      <button
                        onClick={() => handleToggleEventOnline(ev.id, ev.isOpenOnlineRegistration)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                          ev.isOpenOnlineRegistration
                            ? "bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {ev.isOpenOnlineRegistration ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Hanya Super Admin</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar Peserta Terdaftar Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Data Seluruh Peserta Event Terdaftar (Online Web Cetas)
                </h3>
                <p className="text-xs text-slate-500">
                  Peserta yang mendaftar secara online dan memegang tiket pass E-Badge resmi.
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="ALL">Semua Event</option>
                  {eventsList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>

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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Kode E-Badge & Nama Peserta</th>
                    <th className="p-4">Event Terdaftar</th>
                    <th className="p-4">Instansi & Kategori</th>
                    <th className="p-4">Waktu Daftar</th>
                    <th className="p-4">Status Kehadiran</th>
                    <th className="p-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Tidak ada data peserta yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((atd) => (
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
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {atd.eventName}
                          </div>
                          {atd.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                              &ldquo;{atd.notes}&rdquo;
                            </div>
                          )}
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
                          <button
                            onClick={() => handleToggleAttendance(atd.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition ${
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
                            {atd.isPresent ? "HADIR (Check-in)" : "BELUM HADIR"}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteAttendee(atd.id)}
                              title="Hapus Peserta (Super Admin Only)"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: IKLAN CETAS KITA */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "ADS" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Slot Kampanye & Banner &ldquo;Iklan Cetas Kita&rdquo;
              </h3>
              <p className="text-xs text-slate-500">
                Kelola slot iklan sponsor atau promosi internal Cetas Production yang tampil di homepage dan e-tiket.
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
                    onClick={() => handleToggleAdStatus(ad.id)}
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

          {/* Modal Tambah Iklan Baru */}
          {newAdModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tambah Slot Iklan Cetas Kita
                </h3>
                <form onSubmit={handleAddAd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Judul / Promo Iklan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Promo Spesial LED Videotron P3.9 Disc 30%"
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Penempatan Iklan
                    </label>
                    <select
                      value={newAdPlacement}
                      onChange={(e) => setNewAdPlacement(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                    >
                      <option value="Homepage Top Banner">Homepage Top Banner</option>
                      <option value="Footer E-Ticket PDF">Footer E-Ticket PDF</option>
                      <option value="Sidebar Event Detail">Sidebar Event Detail</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewAdModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                    >
                      Tayangkan Iklan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5: CETAS PRODUCTION & ALAT */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "PRODUCTION" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Katalog Alat Sewa & Merchandise Cetas Production
              </h3>
              <p className="text-xs text-slate-500">
                Penyewaan sound system line-array, panggung rigging, lighting moving beam, LED videotron, dan cetak merch.
              </p>
            </div>
            <Link
              href="/production"
              className="text-xs font-bold text-orange-500 hover:underline"
            >
              Lihat Toko Publik →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Paket Sound System 50.000 Watt
              </span>
              <p className="text-slate-500 mt-1">Konser outdoor & festival musik besar</p>
              <div className="mt-3 flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>Status: Tersedia (Ready)</span>
                <span className="text-emerald-600 font-bold">Rp 15.000.000 / Hari</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                LED Videotron P3.9 High Refresh (3x6m)
              </span>
              <p className="text-slate-500 mt-1">Visual panggung resolusi ultra tinggi</p>
              <div className="mt-3 flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>Status: Terbooking (15 Nov)</span>
                <span className="text-emerald-600 font-bold">Rp 18.500.000 / Hari</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Official Cotton Combed 24s Merch T-Shirt
              </span>
              <p className="text-slate-500 mt-1">Sablon DTF premium untuk panitia & suvenir</p>
              <div className="mt-3 flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>Stok: 500 Pcs Ready</span>
                <span className="text-emerald-600 font-bold">Rp 85.000 / Pcs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 6: KELOLA AKUN & ROLE STAF (KHUSUS SUPER ADMIN) */}
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
                Sebagai <strong>Super Admin</strong>, Anda berwenang mengubah role siapa pun, mempromosikan staf, atau menambahkan akun admin baru.
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
                  <th className="p-4">Ubah Role (Super Admin Action)</th>
                  <th className="p-4 text-right">Aksi</th>
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
                      {/* Dropdown Pengubah Role */}
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

                    <td className="p-4 text-right">
                      {st.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteStaff(st.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Tambah Staf Baru */}
          {newStaffModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tambah Akun Staf / Admin Baru
                </h3>
                <form onSubmit={handleAddNewStaff} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Staf
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Denny Supervisor Gate"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Login
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="denny@cetas.id"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password Login
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Password login..."
                      value={newStaffForm.password}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Role Wewenang
                    </label>
                    <select
                      value={newStaffForm.role}
                      onChange={(e) =>
                        setNewStaffForm({ ...newStaffForm, role: e.target.value as AdminRole })
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                    >
                      <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Full Control)</option>
                      <option value="EVENT_ADMIN">🎫 EVENT_ADMIN</option>
                      <option value="FINANCE_ADMIN">💰 FINANCE_ADMIN</option>
                      <option value="PROD_ADMIN">📦 PROD_ADMIN</option>
                      <option value="SCANNER_STAFF">🚪 SCANNER_STAFF</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewStaffModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                    >
                      Simpan Staf Baru
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 7: LOG AUDIT & KEAMANAN */}
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
                type: "success",
              },
              {
                time: "5 menit lalu",
                action: "ATTENDEE_REGISTERED",
                detail: "Peserta baru mendaftar pada 'Workshop Desain UI/UX & Generative AI' dan diterbitkan E-Badge.",
                type: "info",
              },
              {
                time: "15 menit lalu",
                action: "MIDTRANS_SETTLEMENT",
                detail: "Pembayaran Rp 180.000 untuk 10 Suara Cetas Vote (#01 Nadia Safira) diverifikasi.",
                type: "success",
              },
              {
                time: "32 menit lalu",
                action: "TICKET_CHECKIN",
                detail: "Tiket #CETAS-TCK-99128 berhasil divalidasi oleh Gate Scanner Staff A.",
                type: "info",
              },
              {
                time: "1 jam lalu",
                action: "EVENT_SUBMISSION",
                detail: "Proposal event baru 'Festival Seni & Musik Indie' masuk ke antrean review.",
                type: "warning",
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
    </div>
  );
}
