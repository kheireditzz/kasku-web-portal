'use client'

import React from 'react'
import {
  WalletIcon,
  CutePiggyIcon,
  ChartPieIcon,
  TagIcon,
  PlusIcon,
  CalculatorIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  ProductBoxIcon,
  ClockHistoryIcon
} from './Icons'

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenVoiceModal,
  onOpenSettingsModal,
  // Kasir mode actions
  onOpenAddProductModal,
  onOpenScanModal,
  onOpenStoreSettingsModal,
  onOpenHistoryModal,
  onOpenCheckout,
  cartCount = 0
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  onOpenAddModal: () => void
  onOpenVoiceModal?: () => void
  onOpenSettingsModal?: () => void
  onOpenAddProductModal?: () => void
  onOpenScanModal?: () => void
  onOpenStoreSettingsModal?: () => void
  onOpenHistoryModal?: () => void
  onOpenCheckout?: () => void
  cartCount?: number
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[45] px-3 pb-3 pt-1 pointer-events-none" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-md mx-auto relative pointer-events-auto" style={{ transform: 'translateZ(0)' }}>
        
        {/* JIKA DI MODE KASIR: DOCKBAR KHUSUS KASIRKU */}
        {activeTab === 'kasir' ? (
          <div className="glass-nav rounded-[32px] px-2.5 py-2 flex items-center justify-between relative shadow-ios-lg border border-emerald-500/20 bg-white/95 backdrop-blur-xl">
            
            {/* 1. Tambah Produk: Ikon Produk Bagus + Teks 'Produk' */}
            <button
              onClick={onOpenAddProductModal}
              className="flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 text-slate-700 hover:text-emerald-700 group"
              title="Daftarkan Produk / Menu Baru"
            >
              <div className="p-1.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors shadow-xs">
                <ProductBoxIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] tracking-tight font-extrabold text-slate-800">Produk</span>
            </button>

            {/* 2. Scan Barcode: Disinkatkan jadi 'Scan' */}
            <button
              onClick={onOpenScanModal}
              className="flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 text-slate-700 hover:text-emerald-700 group"
              title="Scan Barcode Produk"
            >
              <div className="p-1.5 rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-slate-200 transition-colors shadow-xs">
                <QrCodeIcon className="w-5 h-5 text-slate-800" />
              </div>
              <span className="text-[10px] tracking-tight font-extrabold text-slate-800">Scan</span>
            </button>

            {/* Center Spacer for Floating iOS 'B' Bayar Button */}
            <div className="w-14"></div>

            {/* 4. Atur Struk Toko */}
            <button
              onClick={onOpenStoreSettingsModal}
              className="flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 text-slate-700 hover:text-emerald-700 group"
              title="Atur Logo Struk, Nama Toko & Thermal Bill"
            >
              <div className="p-1.5 rounded-2xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors shadow-xs">
                <Cog6ToothIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-extrabold text-slate-800">Atur Struk</span>
            </button>

            {/* 5. Kanan Bawah: Riwayat Transaksi Penjualan Kasir */}
            <button
              onClick={onOpenHistoryModal}
              className="flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 text-slate-700 hover:text-emerald-700 group"
              title="Riwayat Transaksi Kasir"
            >
              <div className="p-1.5 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors shadow-xs">
                <ClockHistoryIcon className="w-5 h-5 text-slate-700" />
              </div>
              <span className="text-[10px] tracking-tight font-extrabold text-slate-800">Riwayat</span>
            </button>

          </div>
        ) : (
          /* JIKA DI MODE NORMAL KASKU: DOCKBAR RESMI KASKU */
          <div className="glass-nav rounded-[32px] px-3 py-2 flex items-center justify-between relative shadow-ios-lg">
            
            {/* Tab 1: Kas */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 relative group ${
                activeTab === 'overview'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-[background-color,color] duration-150 relative ${
                activeTab === 'overview' 
                  ? 'bg-emerald-500/20 text-emerald-600 shadow-xs' 
                  : 'group-hover:bg-slate-100/80 text-slate-400'
              }`}>
                <WalletIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
                Kas
                {activeTab === 'overview' && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                )}
              </span>
            </button>

            {/* Tab 2: Tabungan */}
            <button
              onClick={() => setActiveTab('savings')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 relative group ${
                activeTab === 'savings'
                  ? 'text-amber-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-[background-color,color] duration-150 relative ${
                activeTab === 'savings' 
                  ? 'bg-amber-500/20 text-amber-600 shadow-xs' 
                  : 'group-hover:bg-slate-100/80 text-slate-400'
              }`}>
                <CutePiggyIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
                Tabungan
                {activeTab === 'savings' && (
                  <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                )}
              </span>
            </button>

            {/* Center Spacer for Floating iOS Action Button */}
            <div className="w-14"></div>

            {/* Tab 3: Grafik Analisis */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 relative group ${
                activeTab === 'analytics'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-[background-color,color] duration-150 relative ${
                activeTab === 'analytics' 
                  ? 'bg-blue-500/20 text-blue-600 shadow-xs' 
                  : 'group-hover:bg-slate-100/80 text-slate-400'
              }`}>
                <ChartPieIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
                Analisis
                {activeTab === 'analytics' && (
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                )}
              </span>
            </button>

            {/* Tab 4: Kategori */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 relative group ${
                activeTab === 'categories'
                  ? 'text-purple-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-[background-color,color] duration-150 relative ${
                activeTab === 'categories' 
                  ? 'bg-purple-500/20 text-purple-600 shadow-xs' 
                  : 'group-hover:bg-slate-100/80 text-slate-400'
              }`}>
                <TagIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
                Kategori
                {activeTab === 'categories' && (
                  <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                )}
              </span>
            </button>

          </div>
        )}

        {/* Floating Center Action Button for KasKu (+) OR KasirKu (B) */}
        {activeTab === 'kasir' ? (
          /* Tombol 'B' (Bayar) di KasirKu: Berbentuk bulat mirip + KasKu, sedikit ke atas, dengan badge Qty */
          <div className="absolute left-1/2 -top-5 -translate-x-1/2 pointer-events-auto z-20">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onOpenCheckout) {
                  onOpenCheckout()
                } else {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 text-white shadow-[0_8px_20px_rgba(16,185,129,0.4)] ring-4 ring-[#f2f2f7] flex items-center justify-center active:scale-95 transition-transform duration-150 group cursor-pointer touch-manipulation select-none relative"
              title="Bayar / Checkout Kasir"
              aria-label="Bayar / Checkout Kasir"
            >
              <span className="text-2xl font-black font-display text-white tracking-tight pointer-events-none">
                B
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          /* Tombol '+' di KasKu Normal */
          <div className="absolute left-1/2 -top-5 -translate-x-1/2 pointer-events-auto z-20">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpenAddModal()
              }}
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] ring-4 ring-[#f2f2f7] flex items-center justify-center active:scale-95 transition-transform duration-150 group cursor-pointer touch-manipulation select-none"
              title="Catat Transaksi Kas"
              aria-label="Catat Transaksi Kas"
            >
              <PlusIcon className="w-7 h-7 stroke-[2.6] text-white pointer-events-none" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
