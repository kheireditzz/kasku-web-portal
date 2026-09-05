'use client'

import React from 'react'
import {
  WalletIcon,
  ChartPieIcon,
  TagIcon,
  CutePiggyIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  KasKuBrandLogo
} from './Icons'

import { APP_LOGO_BASE64 } from './appLogoBase64'

export default function Navbar({
  activeTab,
  setActiveTab,
  onExport,
  onOpenAddModal,
  onOpenVoiceModal,
  onOpenSettingsModal,
  transactionCount,
  savingsCount
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  onExport: () => void
  onOpenAddModal: () => void
  onOpenVoiceModal?: () => void
  onOpenSettingsModal?: () => void
  transactionCount: number
  savingsCount?: number
}) {
  const [imgError, setImgError] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 ios-glass-bar transition-all border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo - Pure Stealth Modern Typography & Icon */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => setActiveTab('overview')}
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105 active:scale-95 shrink-0 bg-[#0d1117]">
            {!imgError && APP_LOGO_BASE64 ? (
              <img
                src={APP_LOGO_BASE64}
                alt="KasKu Logo"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <KasKuBrandLogo className="w-full h-full" />
              </div>
            )}
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 font-display">
            KasKu
          </span>
        </div>

        {/* Desktop Navigation Links - Modern Frosted Segmented Control */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-200/40 text-xs font-semibold text-slate-600 backdrop-blur-xl border border-white/60 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-xl transition-[background-color,color] duration-150 flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-white text-slate-900 shadow-xs font-black' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <WalletIcon className="w-4 h-4 text-slate-800" />
            <span>Kas</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-1.5 rounded-xl transition-[background-color,color] duration-150 flex items-center gap-2 relative ${
              activeTab === 'savings' 
                ? 'bg-white text-amber-700 shadow-xs font-extrabold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CutePiggyIcon className="w-4 h-4 text-amber-500" />
            <span>Tabungan</span>
            {savingsCount !== undefined && savingsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-bold">
                {savingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-xl transition-[background-color,color] duration-150 flex items-center gap-2 ${
              activeTab === 'analytics' 
                ? 'bg-white text-blue-700 shadow-xs font-extrabold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ChartPieIcon className="w-4 h-4 text-blue-600" />
            <span>Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 rounded-xl transition-[background-color,color] duration-150 flex items-center gap-2 ${
              activeTab === 'categories' 
                ? 'bg-white text-purple-700 shadow-xs font-extrabold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <TagIcon className="w-4 h-4 text-purple-600" />
            <span>Kategori</span>
          </button>
        </nav>

        {/* Right Actions - Modern Action Pills with Lively Glow */}
        <div className="flex items-center gap-2.5">
          {/* Tombol Catat Suara */}
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenVoiceModal()
              }}
              title="Catat Kas Lewat Voice AI"
              className="h-9 px-3.5 rounded-full bg-white text-slate-700 border border-slate-200/80 text-xs font-bold flex items-center justify-center gap-2 transition-transform duration-150 shadow-xs active:scale-95 group cursor-pointer touch-manipulation select-none"
            >
              <span className="relative flex h-2 w-2 pointer-events-none">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <MicrophoneIcon className="w-4 h-4 text-slate-700 group-hover:text-rose-500 transition-colors pointer-events-none" />
              <span className="hidden sm:inline font-semibold pointer-events-none">Voice AI</span>
            </button>
          )}

          {/* Tombol Pengaturan */}
          {onOpenSettingsModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenSettingsModal()
              }}
              title="Pengaturan & Cadangan Data"
              className="w-9 h-9 rounded-full bg-white text-slate-700 border border-slate-200/80 flex items-center justify-center transition-transform duration-150 shadow-xs active:scale-95 group cursor-pointer touch-manipulation select-none"
            >
              <Cog6ToothIcon className="w-4 h-4 text-slate-600 pointer-events-none" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenAddModal()
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold active:scale-95 transition-transform duration-150 shadow-xs group cursor-pointer touch-manipulation select-none"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5] text-white pointer-events-none" />
            <span className="pointer-events-none">Catat Kas</span>
          </button>

          {transactionCount > 0 && (
            <button
              onClick={onExport}
              title="Download CSV"
              className="hidden lg:flex w-9 h-9 rounded-full bg-white text-slate-700 border border-slate-200/80 items-center justify-center transition-transform duration-150 shadow-xs active:scale-95"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
