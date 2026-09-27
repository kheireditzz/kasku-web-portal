'use client'

import React from 'react'
import {
  WalletIcon,
  CalculatorIcon,
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
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      setIsScrolled(scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]'
          : 'bg-[#F8FAFC]/30 backdrop-blur-md border-b border-transparent shadow-none'
      }`}
      style={{
        position: 'sticky',
        top: 0,
        WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(12px)',
        backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(12px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name - Clean & Elegant */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => setActiveTab('overview')}
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-105 active:scale-95 shrink-0 bg-emerald-50 border border-emerald-200">
            {!imgError && APP_LOGO_BASE64 ? (
              <img
                src={APP_LOGO_BASE64}
                alt="KasKu Logo"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-600">
                <KasKuBrandLogo className="w-full h-full" />
              </div>
            )}
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 font-display">
            KasKu
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100/80 text-xs font-semibold text-slate-600 border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-emerald-600 text-white font-black shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <WalletIcon className="w-4 h-4" />
            <span>Kas</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-2 relative ${
              activeTab === 'savings' 
                ? 'bg-amber-500 text-white font-black shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CutePiggyIcon className="w-4 h-4" />
            <span>Tabungan</span>
            {savingsCount !== undefined && savingsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {savingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'analytics' 
                ? 'bg-cyan-600 text-white font-black shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ChartPieIcon className="w-4 h-4" />
            <span>Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'categories' 
                ? 'bg-purple-600 text-white font-black shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TagIcon className="w-4 h-4" />
            <span>Kategori</span>
          </button>
        </nav>

        {/* Right Actions */}
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
              className="h-9 px-3.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 shadow-xs active:scale-95 group cursor-pointer touch-manipulation select-none"
            >
              <span className="relative flex h-2 w-2 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <MicrophoneIcon className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform pointer-events-none" />
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
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all duration-150 shadow-xs active:scale-95 group cursor-pointer touch-manipulation select-none"
            >
              <Cog6ToothIcon className="w-4 h-4 pointer-events-none" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenAddModal()
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black active:scale-95 transition-transform duration-150 shadow-sm group cursor-pointer touch-manipulation select-none"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5] text-white pointer-events-none" />
            <span className="pointer-events-none">Catat Kas</span>
          </button>

          {transactionCount > 0 && (
            <button
              onClick={onExport}
              title="Download CSV"
              className="hidden lg:flex w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-emerald-600 border border-slate-200 items-center justify-center transition-all duration-150 shadow-xs active:scale-95"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
