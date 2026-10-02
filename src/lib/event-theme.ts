export type EventThemePreset = "FLAME" | "EMERALD" | "CYBER" | "SAPPHIRE" | "CRIMSON" | "GOLDEN";

export interface EventThemeConfig {
  id: EventThemePreset;
  name: string;
  tagline: string;
  hex: string;
  gradient: string;
  bgGradient: string;
  textClass: string;
  borderClass: string;
  borderLightClass: string;
  bgSoftClass: string;
  buttonClass: string;
  badgeClass: string;
  ringClass: string;
  glowColor: string;
}

export const EVENT_THEME_PRESETS: Record<EventThemePreset, EventThemeConfig> = {
  FLAME: {
    id: "FLAME",
    name: "Cetas Flame (Oranye Hangat)",
    tagline: "Vibrant, Enerjik & Signature Cetas",
    hex: "#f97316",
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500",
    borderLightClass: "border-orange-200 dark:border-orange-900/50",
    bgSoftClass: "bg-orange-50 dark:bg-orange-950/30",
    buttonClass: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20",
    badgeClass: "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-200 border-orange-200 dark:border-orange-800/50",
    ringClass: "focus:ring-orange-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  EMERALD: {
    id: "EMERALD",
    name: "Emerald Forest / Cemara (Hijau Neon)",
    tagline: "Cocok untuk LKBB Cemara, Alam & Paskibra",
    hex: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    borderLightClass: "border-emerald-200 dark:border-emerald-900/50",
    bgSoftClass: "bg-emerald-50 dark:bg-emerald-950/30",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    badgeClass: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50",
    ringClass: "focus:ring-emerald-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  CYBER: {
    id: "CYBER",
    name: "Cyber Violet (Ungu & Fuchsia)",
    tagline: "Konser Musik, SoundFest & Festival Kreatif",
    hex: "#8b5cf6",
    gradient: "from-purple-600 via-violet-600 to-fuchsia-500",
    bgGradient: "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500",
    borderLightClass: "border-purple-200 dark:border-purple-900/50",
    bgSoftClass: "bg-purple-50 dark:bg-purple-950/30",
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
    badgeClass: "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border-purple-200 dark:border-purple-800/50",
    ringClass: "focus:ring-purple-500",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  SAPPHIRE: {
    id: "SAPPHIRE",
    name: "Royal Sapphire (Biru Elektrik)",
    tagline: "Seminar, Konferensi & Olimpiade Akademik",
    hex: "#2563eb",
    gradient: "from-blue-600 to-cyan-500",
    bgGradient: "bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500",
    borderLightClass: "border-blue-200 dark:border-blue-900/50",
    bgSoftClass: "bg-blue-50 dark:bg-blue-950/30",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    badgeClass: "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-800/50",
    ringClass: "focus:ring-blue-500",
    glowColor: "rgba(37, 99, 235, 0.4)",
  },
  CRIMSON: {
    id: "CRIMSON",
    name: "Crimson Ruby (Merah Bold)",
    tagline: "Kompetisi Semangat Merah Putih & Olahraga",
    hex: "#e11d48",
    gradient: "from-rose-600 to-red-600",
    bgGradient: "bg-gradient-to-r from-rose-600 via-red-600 to-amber-600",
    textClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-500",
    borderLightClass: "border-rose-200 dark:border-rose-900/50",
    bgSoftClass: "bg-rose-50 dark:bg-rose-950/30",
    buttonClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
    badgeClass: "bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-200 dark:border-rose-800/50",
    ringClass: "focus:ring-rose-500",
    glowColor: "rgba(225, 29, 72, 0.4)",
  },
  GOLDEN: {
    id: "GOLDEN",
    name: "Golden Luxury (Emas / Amber)",
    tagline: "Duta Pelajar, Grand Final & Penghargaan",
    hex: "#d97706",
    gradient: "from-amber-500 via-yellow-500 to-amber-600",
    bgGradient: "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    borderLightClass: "border-amber-200 dark:border-amber-900/50",
    bgSoftClass: "bg-amber-50 dark:bg-amber-950/30",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200 dark:border-amber-800/50",
    ringClass: "focus:ring-amber-500",
    glowColor: "rgba(217, 119, 6, 0.4)",
  },
};

export function getEventTheme(preset?: string): EventThemeConfig {
  if (preset && preset in EVENT_THEME_PRESETS) {
    return EVENT_THEME_PRESETS[preset as EventThemePreset];
  }
  return EVENT_THEME_PRESETS.FLAME;
}
