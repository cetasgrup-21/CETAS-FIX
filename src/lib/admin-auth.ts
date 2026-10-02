export type AdminRole =
  | "SUPER_ADMIN"
  | "EVENT_ADMIN"
  | "FINANCE_ADMIN"
  | "PROD_ADMIN"
  | "SCANNER_STAFF";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  avatarColor: string;
  badgeColor?: string;
  description?: string;
  lastLogin?: string;
  canEditFinances: boolean;
  canManageStaff: boolean;
  canManageAds: boolean;
  canApproveEvents: boolean;
  canManageAttendees: boolean;
  canManageProduction: boolean;
  canAccessScanner: boolean;
}

export const ROLE_DEFINITIONS: Record<
  AdminRole,
  {
    title: string;
    badgeColor: string;
    description: string;
    canEditFinances: boolean;
    canManageStaff: boolean;
    canManageAds: boolean;
    canApproveEvents: boolean;
    canManageAttendees: boolean;
    canManageProduction: boolean;
    canAccessScanner: boolean;
  }
> = {
  SUPER_ADMIN: {
    title: "👑 Super Admin (Full Control)",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
    description: "Memiliki hak akses 100% penuh untuk melihat dan mengubah seluruh data finansial, proposal, peserta, iklan, dan role akun staf.",
    canEditFinances: true,
    canManageStaff: true,
    canManageAds: true,
    canApproveEvents: true,
    canManageAttendees: true,
    canManageProduction: true,
    canAccessScanner: true,
  },
  EVENT_ADMIN: {
    title: "🎫 Admin Event & Registrasi",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
    description: "Berwenang mereview proposal event pengajuan EO, mengatur kuota tiket, dan memverifikasi pendaftaran peserta online.",
    canEditFinances: false,
    canManageStaff: false,
    canManageAds: false,
    canApproveEvents: true,
    canManageAttendees: true,
    canManageProduction: false,
    canAccessScanner: true,
  },
  FINANCE_ADMIN: {
    title: "💰 Admin Keuangan & Midtrans",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
    description: "Memantau arus kas masuk Midtrans (QRIS, VA, GoPay), settlement transaksi, dan rekonsiliasi omzet tiket/vote/production.",
    canEditFinances: false, // Hanya Super Admin yang boleh mengubah angka manual
    canManageStaff: false,
    canManageAds: false,
    canApproveEvents: false,
    canManageAttendees: false,
    canManageProduction: false,
    canAccessScanner: false,
  },
  PROD_ADMIN: {
    title: "📦 Admin Cetas Production & Alat",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
    description: "Mengelola inventaris rental alat panggung (sound system, lighting, videotron) dan persediaan merchandise event.",
    canEditFinances: false,
    canManageStaff: false,
    canManageAds: false,
    canApproveEvents: false,
    canManageAttendees: false,
    canManageProduction: true,
    canAccessScanner: false,
  },
  SCANNER_STAFF: {
    title: "🚪 Petugas Gatekeeper & Scanner",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800",
    description: "Petugas lapangan penjaga pintu masuk gate event untuk validasi keaslian tiket dan absensi barcode peserta.",
    canEditFinances: false,
    canManageStaff: false,
    canManageAds: false,
    canApproveEvents: false,
    canManageAttendees: true,
    canManageProduction: false,
    canAccessScanner: true,
  },
};

export interface StaffAccountRecord extends AdminUser {
  password: string; // Demo credentials
}

export const INITIAL_STAFF_ACCOUNTS: StaffAccountRecord[] = [
  {
    id: "usr-super-01",
    name: "Reza Aditya (Super Admin)",
    email: "superadmin@cetas.id",
    password: "cetasmaster2026",
    role: "SUPER_ADMIN",
    roleTitle: ROLE_DEFINITIONS.SUPER_ADMIN.title,
    avatarColor: "bg-amber-500 text-white",
    lastLogin: "Baru saja",
    ...ROLE_DEFINITIONS.SUPER_ADMIN,
  },
  {
    id: "usr-event-02",
    name: "Maya Arisandi",
    email: "eventadmin@cetas.id",
    password: "cetas2026",
    role: "EVENT_ADMIN",
    roleTitle: ROLE_DEFINITIONS.EVENT_ADMIN.title,
    avatarColor: "bg-blue-500 text-white",
    lastLogin: "2 jam lalu",
    ...ROLE_DEFINITIONS.EVENT_ADMIN,
  },
  {
    id: "usr-fin-03",
    name: "Hendra Wijaya",
    email: "finance@cetas.id",
    password: "cetas2026",
    role: "FINANCE_ADMIN",
    roleTitle: ROLE_DEFINITIONS.FINANCE_ADMIN.title,
    avatarColor: "bg-emerald-500 text-white",
    lastLogin: "Kemarin, 16:30 WIB",
    ...ROLE_DEFINITIONS.FINANCE_ADMIN,
  },
  {
    id: "usr-prod-04",
    name: "Dimas Pratama",
    email: "production@cetas.id",
    password: "cetas2026",
    role: "PROD_ADMIN",
    roleTitle: ROLE_DEFINITIONS.PROD_ADMIN.title,
    avatarColor: "bg-purple-500 text-white",
    lastLogin: "Kemarin, 11:20 WIB",
    ...ROLE_DEFINITIONS.PROD_ADMIN,
  },
  {
    id: "usr-scan-05",
    name: "Rian Gatekeeper (Staff Lapangan)",
    email: "gatekeeper@cetas.id",
    password: "cetas2026",
    role: "SCANNER_STAFF",
    roleTitle: ROLE_DEFINITIONS.SCANNER_STAFF.title,
    avatarColor: "bg-orange-500 text-white",
    lastLogin: "3 hari lalu",
    ...ROLE_DEFINITIONS.SCANNER_STAFF,
  },
];

const STORAGE_SESSION_KEY = "cetas_admin_current_user";
const STORAGE_STAFF_LIST_KEY = "cetas_admin_staff_accounts";

export function getStoredStaffList(): StaffAccountRecord[] {
  if (typeof window === "undefined") return INITIAL_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_LIST_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_STAFF_LIST_KEY, JSON.stringify(INITIAL_STAFF_ACCOUNTS));
      return INITIAL_STAFF_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STAFF_ACCOUNTS;
  }
}

export function saveStoredStaffList(list: StaffAccountRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_STAFF_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal menyimpan daftar staf:", e);
  }
}

export function getStoredAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(user: AdminUser) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Gagal menyimpan sesi admin:", e);
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.error("Gagal menghapus sesi admin:", e);
  }
}
