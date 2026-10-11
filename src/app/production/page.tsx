"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShieldCheck,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  ZoomIn,
  ZoomOut,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { DokuPaymentModal } from "@/components/doku-payment-modal";
import {
  INITIAL_UNIFIED_PRODUCTS,
  UnifiedProduct,
  getStoredProducts,
  saveStoredProducts,
} from "@/lib/production-unified-data";

export default function ProductionPage() {
  const [products, setProducts] = useState<UnifiedProduct[]>(INITIAL_UNIFIED_PRODUCTS);
  const [selectedProductModal, setSelectedProductModal] = useState<UnifiedProduct | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    const local = getStoredProducts();
    if (local && local.length > 0) {
      setProducts(local);
    }

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          const freshLocal = getStoredProducts();
          if (!freshLocal) {
            setProducts(data.products);
            saveStoredProducts(data.products);
          }
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
    const prod = products.find((p) => p.id === id);
    if (!prod || prod.status !== "TERSEDIA" || prod.stock <= 0) return;

    setCart((prev) => {
      const currentQty = prev[id] || 0;
      if (currentQty >= prod.stock) {
        alert(`Maksimal pemesanan sesuai stok tersedia (${prod.stock} ${prod.unit}).`);
        return prev;
      }
      return { ...prev, [id]: currentQty + 1 };
    });
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

  const cartItemsList = Object.entries(cart)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      return prod ? { ...prod, quantity: qty } : null;
    })
    .filter((item): item is UnifiedProduct & { quantity: number } => item !== null);

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

  const openProductLightbox = (prod: UnifiedProduct) => {
    setIsImageZoomed(false);
    setSelectedProductModal(prod);
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
            Solusi vendor terpercaya untuk seluruh kebutuhan perlengkapan panggung, sound system, lighting, videotron, serta cetak merchandise berkualitas tinggi. Klik gambar produk untuk melihat foto ukuran penuh & ketersediaan stok.
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
      <div className="flex flex-wrap items-center gap-2 mb-8">
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
          const isAvailable = prod.status === "TERSEDIA" && prod.stock > 0;

          return (
            <div
              key={prod.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition group"
            >
              {/* Clickable Image with Lightbox Trigger */}
              <div
                onClick={() => openProductLightbox(prod)}
                className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {/* Top Badges: Category & Stock Status */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur-md border border-white/15">
                    {prod.category === "EQUIPMENT" ? "SEWA ALAT" : "MERCHANDISE"}
                  </span>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 ${
                      !isAvailable
                        ? "bg-rose-600/90 text-white border-rose-400"
                        : prod.stock <= 5
                        ? "bg-amber-500/90 text-white border-amber-300"
                        : "bg-emerald-600/90 text-white border-emerald-400"
                    }`}
                  >
                    <Package className="h-3 w-3" />
                    {!isAvailable
                      ? prod.status === "DISEWA"
                        ? "Sedang Disewa"
                        : "Stok Habis (0)"
                      : `Stok: ${prod.stock}`}
                  </span>
                </div>

                {/* Hover Overlay Hint to Click for Popup */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-slate-900 font-extrabold text-xs px-4 py-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="h-4 w-4 text-purple-600" />
                    Klik Perbesar Gambar & Detail
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        isAvailable ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tersedia ({prod.stock} unit)
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          {prod.status === "DISEWA" ? "Sedang Disewa Full" : "Stok Habis"}
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => openProductLightbox(prod)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Foto
                    </button>
                  </div>

                  <h3
                    onClick={() => openProductLightbox(prod)}
                    className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug cursor-pointer hover:text-purple-700 transition"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {formatRupiah(prod.price)}
                    </div>
                    <div className="text-[10px] text-slate-400">/ {prod.unit}</div>
                  </div>

                  {!isAvailable ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 text-slate-500 font-bold px-3.5 py-2 text-xs cursor-not-allowed"
                    >
                      {prod.status === "DISEWA" ? "Sedang Disewa" : "Stok Habis"}
                    </button>
                  ) : qtyInCart > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(prod.id)}
                        className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{qtyInCart}</span>
                      <button
                        onClick={() => addToCart(prod.id)}
                        disabled={qtyInCart >= prod.stock}
                        className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 text-xs transition shadow-sm"
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

      {/* ================================================================== */}
      {/* POP-UP LIGHTBOX GAMBAR & DETAIL PRODUK                             */}
      {/* ================================================================== */}
      {selectedProductModal && (
        <div
          onClick={() => setSelectedProductModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                  {selectedProductModal.category === "EQUIPMENT"
                    ? "Sewa Alat Panggung"
                    : "Merchandise Resmi"}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    selectedProductModal.status === "TERSEDIA" &&
                    selectedProductModal.stock > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedProductModal.status === "TERSEDIA" &&
                  selectedProductModal.stock > 0
                    ? `Stok Tersedia: ${selectedProductModal.stock} Unit`
                    : selectedProductModal.status === "DISEWA"
                    ? "Sedang Disewa"
                    : "Stok Habis"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-bold transition"
                >
                  {isImageZoomed ? (
                    <>
                      <ZoomOut className="h-3.5 w-3.5" />
                      Perkecil
                    </>
                  ) : (
                    <>
                      <ZoomIn className="h-3.5 w-3.5" />
                      Perbesar Foto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductModal(null)}
                  className="h-8 w-8 rounded-xl bg-slate-200/80 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="overflow-auto bg-slate-950 flex items-center justify-center max-h-[52vh] min-h-[280px] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProductModal.imageUrl}
                alt={selectedProductModal.name}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
                className={`transition-transform duration-300 cursor-zoom-in ${
                  isImageZoomed
                    ? "scale-150 cursor-zoom-out my-12"
                    : "max-h-[50vh] w-auto object-contain"
                }`}
              />
            </div>

            {/* Product Details & Order Action */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedProductModal.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProductModal.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 bg-purple-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-purple-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-purple-600">
                    Harga Resmi
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formatRupiah(selectedProductModal.price)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    per {selectedProductModal.unit}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Ketersediaan Stok Gudang / Vendor:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {selectedProductModal.stock} {selectedProductModal.unit}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProductModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Tutup
                  </button>

                  {selectedProductModal.status === "TERSEDIA" &&
                  selectedProductModal.stock > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProductModal.id);
                        setSelectedProductModal(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-purple-600/25 transition active:scale-95"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Masukkan ke Keranjang Pesanan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-200 text-slate-500 font-bold px-5 py-2.5 text-xs cursor-not-allowed"
                    >
                      Stok Sedang Kosong / Disewa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      {item.quantity} x {formatRupiah(item.price)} (Stok maks: {item.stock})
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
                  <div className="text-base font-black text-purple-700">
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
            // Kurangi stok produk secara otomatis setelah pembayaran berhasil
            const updatedProducts = products.map((prod) => {
              const orderedQty = cart[prod.id] || 0;
              if (orderedQty > 0) {
                const newStock = Math.max(0, prod.stock - orderedQty);
                const updated: UnifiedProduct = {
                  ...prod,
                  stock: newStock,
                  status: newStock === 0 ? "HABIS" : prod.status,
                };
                fetch("/api/products", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated),
                }).catch(() => {});
                return updated;
              }
              return prod;
            });
            setProducts(updatedProducts);
            saveStoredProducts(updatedProducts);

            setOrderDoneMsg(
              `Pesanan Production ${simulatorData.orderNumber} berhasil dibayar! Stok telah diperbarui otomatis dan tim logistik Cetas akan menghubungi WhatsApp Anda.`
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
