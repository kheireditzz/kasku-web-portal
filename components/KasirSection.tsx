'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  CalculatorIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  TagIcon,
  XMarkIcon,
  PrinterIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  PencilSquareIcon
} from './Icons'

export interface KasirProduct {
  id: string
  name: string
  price: number
  category: string
  emoji: string
  barcode?: string
}

export interface KasirCartItem {
  product: KasirProduct
  qty: number
}

export interface StoreProfile {
  storeName: string
  storeSubtitle: string
  storeAddress: string
  storePhone: string
  storeLogoUrl: string
  receiptNote: string
}

export default function KasirSection({
  onAddTransaction,
  onSwitchToKasku,
  onOpenAddProductModal,
  onEditProduct,
  onOpenScanModal,
  onOpenStoreSettingsModal,
  onOpenCheckoutModal,
  cart,
  setCart,
  products,
  setProducts,
  storeProfile,
  setStoreProfile,
  onReceiptStateChange,
  onCancelTransaction,
  showToast
}: {
  onAddTransaction: (title: string, amount: number, note: string) => void
  onCancelTransaction?: (orderId: string) => void
  onSwitchToKasku?: () => void
  onOpenAddProductModal?: () => void
  onEditProduct?: (product: KasirProduct) => void
  onOpenScanModal?: () => void
  onOpenStoreSettingsModal?: () => void
  onOpenCheckoutModal?: () => void
  cart: KasirCartItem[]
  setCart: React.Dispatch<React.SetStateAction<KasirCartItem[]>>
  products: KasirProduct[]
  setProducts: React.Dispatch<React.SetStateAction<KasirProduct[]>>
  storeProfile: StoreProfile
  setStoreProfile: React.Dispatch<React.SetStateAction<StoreProfile>>
  onReceiptStateChange?: (isOpen: boolean) => void
  showToast?: (msg: string) => void
}) {
  const [activeCat, setActiveCat] = useState<string>('Semua')
  const [cashGivenStr, setCashGivenStr] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (onReceiptStateChange) {
      onReceiptStateChange(showReceipt)
    }
  }, [showReceipt])
  const [lastOrder, setLastOrder] = useState<{
    id: string
    items: KasirCartItem[]
    total: number
    cash: number
    change: number
    date: string
  } | null>(null)

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(p => {
    const matchCat = activeCat === 'Semua' || p.category === activeCat
    const matchQuery = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchQuery
  })

  const addToCart = (product: KasirProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { product, qty: 1 }]
    })
    if (showToast) {
      showToast(`+1 ${product.name}`)
    }
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean) as KasirCartItem[]
    })
  }

  const clearCart = () => setCart([])

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  const numericCash = cashGivenStr ? parseInt(cashGivenStr.replace(/\D/g, ''), 10) || 0 : 0
  const changeAmount = Math.max(0, numericCash - totalAmount)

  const handleCheckout = () => {
    if (cart.length === 0) return

    const summary = cart.map(i => `${i.qty}x ${i.product.name}`).join(', ')
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    const orderId = 'TRX-' + Date.now().toString().slice(-6)

    // Otomatis catat ke Buku Kas Kasku
    onAddTransaction(`Penjualan KasirKu (#${orderId})`, totalAmount, `Item: ${summary}`)

    // Set Receipt
    setLastOrder({
      id: orderId,
      items: [...cart],
      total: totalAmount,
      cash: numericCash || totalAmount,
      change: numericCash ? changeAmount : 0,
      date: dateStr
    })

    setShowReceipt(true)
    setCart([])
    setCashGivenStr('')
  }

  // CETAK STRUK FISIK / THERMAL BILL
  const printReceipt = () => {
    if (!lastOrder) return

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Struk ${storeProfile.storeName || 'KasirKu'}</title>
        <style>
          @page {
            margin: 4mm;
            size: 58mm auto;
          }
          body {
            font-family: 'Courier New', Courier, monospace, monospace;
            width: 58mm;
            margin: 0 auto;
            padding: 4px 2px;
            color: #000;
            font-size: 11px;
            line-height: 1.25;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .logo { max-width: 44mm; max-height: 44mm; object-fit: contain; margin: 0 auto 4px; display: block; filter: grayscale(100%); }
          .title { font-size: 14px; font-weight: 900; margin: 2px 0; }
          .subtitle { font-size: 10px; margin-bottom: 2px; }
          .address { font-size: 9px; margin-bottom: 4px; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .double-divider { border-top: 1px double #000; margin: 5px 0; }
          .flex { display: flex; justify-content: space-between; }
          .item-line { margin: 2px 0; }
          .item-name { font-weight: bold; }
          .note { font-size: 9px; text-align: center; margin-top: 6px; white-space: pre-line; }
          @media print {
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        ${storeProfile.storeLogoUrl ? `<img src="${storeProfile.storeLogoUrl}" class="logo" alt="Logo">` : ''}
        <div class="text-center">
          <div class="title">${storeProfile.storeName || 'KASIRKU POS'}</div>
          ${storeProfile.storeSubtitle ? `<div class="subtitle">${storeProfile.storeSubtitle}</div>` : ''}
          ${storeProfile.storeAddress ? `<div class="address">${storeProfile.storeAddress}</div>` : ''}
          ${storeProfile.storePhone ? `<div class="address">Telp: ${storeProfile.storePhone}</div>` : ''}
        </div>
        
        <div class="divider"></div>
        <div class="flex">
          <span>No: ${lastOrder.id}</span>
          <span>${lastOrder.date}</span>
        </div>
        <div class="divider"></div>

        <div>
          ${lastOrder.items.map(it => `
            <div class="item-line">
              <div class="item-name">${it.product.name}</div>
              <div class="flex">
                <span>${it.qty} x Rp ${it.product.price.toLocaleString('id-ID')}</span>
                <span class="bold">Rp ${(it.product.price * it.qty).toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="double-divider"></div>

        <div class="flex bold">
          <span>TOTAL</span>
          <span>Rp ${lastOrder.total.toLocaleString('id-ID')}</span>
        </div>
        <div class="flex">
          <span>TUNAI</span>
          <span>Rp ${lastOrder.cash.toLocaleString('id-ID')}</span>
        </div>
        <div class="flex">
          <span>KEMBALI</span>
          <span>Rp ${lastOrder.change.toLocaleString('id-ID')}</span>
        </div>

        ${storeProfile.receiptNote ? `
          <div class="divider"></div>
          <div class="note">${storeProfile.receiptNote}</div>
        ` : ''}
      </body>
      </html>
    `

    // Dukungan Native Android Print Bridge jika ada di APK
    try {
      if ((window as any).AndroidApp && typeof (window as any).AndroidApp.printHtmlReceipt === 'function') {
        (window as any).AndroidApp.printHtmlReceipt(printHtml, `Struk-${lastOrder.id}`)
        return
      }
    } catch (e) {}

    // Fallback Window Print di Browser
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 250)
    } else {
      window.print()
    }
  }

  return (
    <div className="space-y-4 pb-24 md:pb-6 select-none">
      {/* KasirKu POS Dedicated Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black tracking-wider uppercase">
              <CalculatorIcon className="w-3.5 h-3.5 text-emerald-300" />
              <span>SISTEM KASIR POS LENGKAP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              {storeProfile.storeName || 'KasirKu'}
            </h2>
            <p className="text-xs text-emerald-100 max-w-lg">
              {storeProfile.storeSubtitle || 'Mode Penjualan Kasir Cepat, Hitung Kembalian & Struk Thermal'}
            </p>
          </div>

          {/* Quick Action Pills in Header */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenStoreSettingsModal}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 border border-white/20"
              title="Atur Logo Struk, Nama Toko, Alamat & Ucapan"
            >
              <Cog6ToothIcon className="w-4 h-4 text-emerald-200" />
              <span>Atur Struk Toko</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Products & Live Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Product Grid & Search */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Search Bar + Quick Product Add & Barcode Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari produk atau barcode..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:border-emerald-500 focus:outline-none shadow-xs"
              />
              <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={onOpenAddProductModal}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 shrink-0"
              title="Tambah Produk Baru"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Produk</span>
            </button>

            <button
              onClick={onOpenScanModal}
              className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 shrink-0"
              title="Scan Barcode Kamera"
            >
              <QrCodeIcon className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  activeCat === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
              <span className="text-4xl block">🔍</span>
              <h4 className="font-bold text-slate-800 text-sm">Produk Tidak Ditemukan</h4>
              <p className="text-xs text-slate-400">Tidak ada produk yang cocok dengan pencarian Anda</p>
              <button
                onClick={onOpenAddProductModal}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
              >
                + Tambah Produk Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500 text-left transition-all flex flex-col justify-between group relative"
                >
                  {/* Tombol Edit/Hapus Produk di pojok atas kartu */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditProduct) onEditProduct(p)
                    }}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 flex items-center justify-center transition active:scale-90"
                    title="Edit atau Hapus Produk"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                  </button>

                  <div
                    onClick={() => addToCart(p)}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xl block group-hover:scale-110 transition-transform">{p.emoji || '📦'}</span>
                      {p.barcode && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                          {p.barcode}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors pr-6">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.category}</span>
                  </div>

                  <div
                    onClick={() => addToCart(p)}
                    className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-black text-emerald-700">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                    <span className="w-6 h-6 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart & Calculation */}
        <div id="kasir-cart-panel" className="lg:col-span-5 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-card flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base">Pesanan Penjualan</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 active:scale-95"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-1.5">
                  <span className="text-3xl block">🛒</span>
                  <p className="text-xs font-bold text-slate-600">Keranjang Masih Kosong</p>
                  <p className="text-[11px] text-slate-400">Pilih menu di samping atau scan barcode produk</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-800 truncate">{item.product.name}</h5>
                      <span className="text-[11px] text-emerald-700 font-black">
                        Rp {(item.product.price * item.qty).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 font-bold text-xs flex items-center justify-center text-slate-700"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-black text-xs text-slate-800">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-5 h-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-90 font-bold text-xs flex items-center justify-center text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Calculations & Pay Form */}
          <div className="pt-3 border-t border-slate-100 space-y-3 mt-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Total Item:</span>
                <span>{cart.reduce((s, i) => s + i.qty, 0)} Pcs</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700 font-display">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Quick Cash Presets */}
            {totalAmount > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Nominal Tunai Diterima:</span>
                  {numericCash > 0 && (
                    <span className="text-[10px] text-emerald-700 font-extrabold">
                      Kembalian: Rp {changeAmount.toLocaleString('id-ID')}
                    </span>
                  )}
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCashGivenStr(totalAmount.toLocaleString('id-ID'))}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[11px] rounded-xl transition-colors"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000].map(val => (
                    val >= totalAmount ? (
                      <button
                        key={val}
                        onClick={() => setCashGivenStr(val.toLocaleString('id-ID'))}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[11px] rounded-xl transition-colors"
                      >
                        {val / 1000}rb
                      </button>
                    ) : null
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={cashGivenStr}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      setCashGivenStr(val ? Number(val).toLocaleString('id-ID') : '')
                    }}
                    placeholder="Masukkan jumlah uang..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Bayar & Simpan Transaksi</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL STRUK PENJUALAN LENGKAP - RENDERED IN BODY PORTAL, 100% INDEPENDENT OF SCROLL & DOCKBAR */}
      {showReceipt && lastOrder && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none overflow-hidden touch-none pointer-events-auto">
          {/* Backdrop gelap pekat */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-0"
            onClick={() => setShowReceipt(false)}
          />

          {/* Modal Container: 100% Menempel di dasar layar (BOTTOM: 0, FLUSH TO SCREEN BOTTOM) */}
          <div 
            className="relative z-10 w-full sm:max-w-md bg-white border-t sm:border border-slate-200 rounded-t-[28px] sm:rounded-[28px] p-4 sm:p-5 shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto overscroll-contain animate-slide-up mb-0"
            style={{ 
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
              position: 'relative',
              bottom: 0
            }}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup X Cepat di Sudut Kanan Atas */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                <span>🧾</span>
                <span>Struk Pembayaran Selesai</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReceipt(false)}
                aria-label="Tutup Struk"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Receipt Box - Kertas Thermal Struk Bill Murni Elegan */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-inner select-none font-sans">
              {/* Header Toko Struk */}
              <div className="text-center border-b border-dashed border-slate-300 pb-2 space-y-0.5">
                {storeProfile.storeLogoUrl ? (
                  <img
                    src={storeProfile.storeLogoUrl}
                    alt="Logo Toko"
                    className="w-11 h-11 object-contain mx-auto rounded-xl mb-1 shadow-xs border border-slate-100"
                  />
                ) : (
                  <span className="text-2xl block mb-0.5">🏪</span>
                )}
                <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
                  {storeProfile.storeName || 'KASIRKU POS'}
                </h4>
                {storeProfile.storeSubtitle && (
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">{storeProfile.storeSubtitle}</p>
                )}
                {storeProfile.storeAddress && (
                  <p className="text-[9px] text-slate-400 leading-tight">{storeProfile.storeAddress}</p>
                )}
                {storeProfile.storePhone && (
                  <p className="text-[9px] text-slate-400 leading-tight">Telp: {storeProfile.storePhone}</p>
                )}
                <div className="pt-1.5 text-[10px] text-slate-500 flex justify-between border-t border-dotted border-slate-300 mt-1.5 font-mono">
                  <span>No: #{lastOrder.id}</span>
                  <span>{lastOrder.date}</span>
                </div>
              </div>

              {/* Receipt Items List */}
              <div className="space-y-1.5 text-xs py-0.5">
                {lastOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-slate-700">
                    <div className="pr-2">
                      <span className="font-bold text-slate-800 block text-xs">{it.product.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {it.qty} x Rp {it.product.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0 text-xs">
                      Rp {(it.product.price * it.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Receipt Totals */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-xs">
                <div className="flex justify-between font-black text-slate-900 text-xs sm:text-sm">
                  <span>TOTAL TRANSAKSI</span>
                  <span className="text-emerald-700 font-display text-sm sm:text-base">Rp {lastOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                  <span>Tunai Diterima</span>
                  <span className="font-bold text-slate-700">Rp {lastOrder.cash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 text-[11px]">
                  <span>Uang Kembalian</span>
                  <span className="text-xs sm:text-sm font-black">Rp {lastOrder.change.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Ucapan Struk */}
              {storeProfile.receiptNote && (
                <div className="text-center border-t border-dotted border-slate-300 pt-2">
                  <p className="text-[10px] text-slate-500 whitespace-pre-line font-medium leading-relaxed">
                    {storeProfile.receiptNote}
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Cetak & Tutup */}
            <div className="pt-0.5 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={printReceipt}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PrinterIcon className="w-4 h-4 text-white" />
                <span>Cetak Struk Bill (Thermal / PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReceipt(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:scale-98 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center cursor-pointer border border-slate-200/60"
              >
                ✕ Tutup / Selesai
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
