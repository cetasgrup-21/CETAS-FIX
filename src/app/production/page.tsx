"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Check, ShieldCheck, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { DokuPaymentModal } from "@/components/doku-payment-modal";
import { UnifiedProduct } from "@/lib/production-unified-data";

interface Product {
  id: string;
  name: string;
  category: "MERCHANDISE" | "EQUIPMENT";
  price: number;
  unit: string;
  imageUrl: string;
  description: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-01",
    name: "Kaos Komunitas & Event Cotton Combed 24s",
    category: "MERCHANDISE",
    price: 65000,
    unit: "pcs (min. 24 pcs)",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    description: "Sablon DTF / Plastisol presisi tinggi, bahan dingin dan nyaman untuk panitia & peserta.",
  },
  {
    id: "prod-02",
    name: "Lanyard & ID Card Panitia Hologram",
    category: "MERCHANDISE",
    price: 15000,
    unit: "set",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    description: "Tali tisu 2cm cetak sublim 2 sisi + card holder plastik tebal anti-gores.",
  },
  {
    id: "prod-03",
    name: "Paket Sound System Konser Line-Array 10.000 Watt",
    category: "EQUIPMENT",
    price: 4500000,
    unit: "hari (termasuk operator)",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    description: "Sistem audio panggung outdoor / indoor lengkap dengan digital mixer & wireless mic Shure.",
  },
  {
    id: "prod-04",
    name: "Lighting Stage Show (Moving Beam + Par LED)",
    category: "EQUIPMENT",
    price: 3200000,
    unit: "hari",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
    description: "8 Moving Beam 230W, 12 Par LED RGBW, Smoke Gun / Haze Machine, dan lighting programmer.",
  },
  {
    id: "prod-05",
    name: "LED Videotron P3.9 Outdoor (Ukuran 4x2 Meter)",
    category: "EQUIPMENT",
    price: 6000000,
    unit: "hari",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80",
    description: "Layar visual tajam anti-silau siang hari lengkap dengan rigging truss dan video switcher processor.",
  },
  {
    id: "prod-06",
    name: "Jasa Live Streaming Multicam 3 Kamera Full HD",
    category: "EQUIPMENT",
    price: 2800000,
    unit: "event",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80",
    description: "Broadcast YouTube / Zoom profesional dengan ATEM Mini switcher, audio interface, & grafis lower-third.",
  },
];

export default function ProductionPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(
            data.products.map((p: UnifiedProduct) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              unit: p.unit,
              imageUrl: p.imageUrl,
              description: p.description,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDoneMsg, setOrderDoneMsg] = useState<string | null>(null);
  const [simulatorData, setSimulatorData] = useState<{
    orderNumber: string;
    grossAmount: number;
    customerName: string;
  } | null>(null);

  const filteredProducts =
    activeTab === "ALL" ? products : products.filter((p) => p.category === activeTab);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) {
        copy[id] -= 1;
      } else {
        delete copy[id];
      }
      return copy;
    });
  };

  const deleteFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const cartItemsList = Object.entries(cart).map(([id, qty]) => {
    const prod = products.find((p) => p.id === id)!;
    return { ...prod, quantity: qty };
  });

  const cartTotal = cartItemsList.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemsList.length === 0) return;

    setIsProcessing(true);
    setOrderDoneMsg(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "PRODUCTION",
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          items: cartItemsList.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat invoice pesanan");
      }

      // Tampilkan DOKU Direct API Modal (QRIS & E-Wallet)
      setSimulatorData({
        orderNumber: data.orderNumber,
        grossAmount: cartTotal,
        customerName: customer.name,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kesalahan sistem";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700 mb-2 border border-purple-200">
            <ShoppingBag className="h-3.5 w-3.5" />
            Lini Bisnis Resmi Cetas Production
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Katalog Merchandise & Rental Peralatan Event
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Solusi vendor terpercaya untuk seluruh kebutuhan perlengkapan panggung, sound system, lighting, videotron, serta cetak merchandise berkualitas tinggi.
          </p>
        </div>

        {/* Floating Cart Button */}
        {cartItemsList.length > 0 && (
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-5 py-3 text-xs shadow-lg shadow-purple-500/25 transition active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Keranjang ({cartItemsList.length} Item)</span>
            <span className="bg-black/20 rounded-lg px-2 py-0.5">
              {formatRupiah(cartTotal)}
            </span>
          </button>
        )}
      </div>

      {orderDoneMsg && (
        <div className="mb-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          {orderDoneMsg}
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "ALL", label: "Semua Katalog" },
          { key: "MERCHANDISE", label: "Merchandise Event" },
          { key: "EQUIPMENT", label: "Sewa Peralatan Panggung" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const qtyInCart = cart[prod.id] || 0;
          return (
            <div
              key={prod.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition"
            >
              <div className="h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-500/30 mb-2">
                    {prod.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {formatRupiah(prod.price)}
                    </div>
                    <div className="text-[10px] text-slate-400">/ {prod.unit}</div>
                  </div>

                  {qtyInCart > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(prod.id)}
                        className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{qtyInCart}</span>
                      <button
                        onClick={() => addToCart(prod.id)}
                        className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 text-xs transition shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Pesan
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Slide-Over / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-500" />
                Keranjang Pesanan Cetas Production
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {cartItemsList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex-1 pr-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.quantity} x {formatRupiah(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-600">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => deleteFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Info Pemesan */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Penanggung Jawab / Instansi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Invoice *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@instansi.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Total Tagihan DOKU Direct</div>
                  <div className="text-base font-black text-cyan-400">
                    {formatRupiah(cartTotal)}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-gradient-to-r from-[#E1251B] to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-red-500/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isProcessing ? "Menyiapkan Invoice..." : "Bayar via DOKU (QRIS / E-Wallet)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOKU Direct API Modal (QRIS & E-Wallet) */}
      {simulatorData && (
        <DokuPaymentModal
          isOpen={!!simulatorData}
          orderNumber={simulatorData.orderNumber}
          grossAmount={simulatorData.grossAmount}
          customerName={simulatorData.customerName}
          customerPhone={customer.phone}
          onClose={() => setSimulatorData(null)}
          onSuccess={() => {
            setOrderDoneMsg(
              `Pesanan Production ${simulatorData.orderNumber} berhasil dibayar! Tim logistik Cetas akan menghubungi WhatsApp Anda untuk koordinasi pengiriman/setup.`
            );
            setCart({});
            setIsCheckoutOpen(false);
            setSimulatorData(null);
          }}
        />
      )}
    </div>
  );
}

