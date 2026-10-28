export interface UnifiedProduct {
  id: string;
  name: string;
  category: "MERCHANDISE" | "EQUIPMENT";
  subCategory?: string; // SOUND_SYSTEM, LIGHTING, LED_VIDEOTRON, LIVE_STREAMING, MERCH
  price: number;
  unit: string;
  stock: number;
  imageUrl: string;
  description: string;
  status: "TERSEDIA" | "DISEWA" | "HABIS";
}

export const INITIAL_UNIFIED_PRODUCTS: UnifiedProduct[] = [];

const STORAGE_PRODUCTS_KEY = "cetas_unified_products_v2";

export function getStoredProducts(): UnifiedProduct[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredProducts(list: UnifiedProduct[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal menyimpan katalog produk:", e);
  }
}
