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

export const INITIAL_UNIFIED_PRODUCTS: UnifiedProduct[] = [
  {
    id: "prod-01",
    name: "Kaos Komunitas & Event Cotton Combed 24s",
    category: "MERCHANDISE",
    subCategory: "MERCH",
    price: 65000,
    unit: "pcs (min. 24 pcs)",
    stock: 500,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85",
    description: "Sablon DTF / Plastisol presisi tinggi, bahan Cotton Combed 24s dingin dan nyaman untuk panitia, peserta, maupun merchandise resmi turnamen.",
    status: "TERSEDIA",
  },
  {
    id: "prod-02",
    name: "Lanyard & ID Card Panitia Hologram",
    category: "MERCHANDISE",
    subCategory: "MERCH",
    price: 15000,
    unit: "set",
    stock: 1200,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
    description: "Tali tisu lembut lebar 2cm cetak sublimasi full-color 2 sisi + kait besi + ID card PVC tebal anti-gores.",
    status: "TERSEDIA",
  },
  {
    id: "prod-03",
    name: "Paket Sound System Konser Line-Array 10.000 Watt",
    category: "EQUIPMENT",
    subCategory: "SOUND_SYSTEM",
    price: 4500000,
    unit: "hari (termasuk operator)",
    stock: 4,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85",
    description: "Sistem audio panggung outdoor / indoor lengkap dengan speaker Line-Array, subwoofer ganda, digital mixer 32-channel, wireless mic Shure, & sound engineer.",
    status: "TERSEDIA",
  },
  {
    id: "prod-04",
    name: "Lighting Stage Show (Moving Beam + Par LED)",
    category: "EQUIPMENT",
    subCategory: "LIGHTING",
    price: 3200000,
    unit: "hari",
    stock: 3,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85",
    description: "8 unit Moving Head Beam 230W, 12 unit Par LED RGBW 54x3W, Smoke Gun / Haze Machine, gawang rigging, dan operator lighting DMX.",
    status: "TERSEDIA",
  },
  {
    id: "prod-05",
    name: "LED Videotron P3.9 Outdoor (Ukuran 4x2 Meter)",
    category: "EQUIPMENT",
    subCategory: "LED_VIDEOTRON",
    price: 6000000,
    unit: "hari",
    stock: 2,
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85",
    description: "Layar visual LED Videotron P3.9 high-brightness anti-silau siang hari untuk live scoreboard Cetas.Score, bumper panggung, dan multicam.",
    status: "TERSEDIA",
  },
  {
    id: "prod-06",
    name: "Jasa Live Streaming Multicam 3 Kamera Full HD",
    category: "EQUIPMENT",
    subCategory: "LIVE_STREAMING",
    price: 2800000,
    unit: "event",
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=85",
    description: "Broadcast YouTube / Zoom profesional dengan 3 kamera Sony Full HD, ATEM Mini Extreme switcher, capture audio mixer, & grafis lower-third live.",
    status: "TERSEDIA",
  },
];

const STORAGE_PRODUCTS_KEY = "cetas_unified_products_v2";

export function getStoredProducts(): UnifiedProduct[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
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
