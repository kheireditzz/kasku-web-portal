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
  MicrophoneIcon
} from './Icons'

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
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab('overview')}
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs flex items-center justify-center transition-transform active:scale-95">
            <img 
              src="/app-logo.jpg" 
              alt="KasKu Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-emerald-600">
            KasKu
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 p-0.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' 
                ? 'bg-white text-emerald-700 shadow-sm font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <WalletIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kas</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 relative ${
              activeTab === 'savings' 
                ? 'bg-white text-amber-700 shadow-sm font-bold' 
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CutePiggyIcon className="w-4 h-4 text-amber-600" />
            <span>Tabungan & Celengan</span>
            {savingsCount !== undefined && savingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-mono font-bold">
                {savingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'analytics' 
                ? 'bg-white text-cyan-700 shadow-sm font-bold' 
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ChartPieIcon className="w-4 h-4 text-cyan-600" />
            <span>Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'categories' 
                ? 'bg-white text-purple-700 shadow-sm font-bold' 
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <TagIcon className="w-4 h-4 text-purple-600" />
            <span>Kategori</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Tombol Catat Suara AI */}
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              title="Catat Kas Lewat Suara AI"
              className="w-9 h-9 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <MicrophoneIcon className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Suara AI</span>
            </button>
          )}

          {/* Tombol Pengaturan (Backup & Import JSON) */}
          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              title="Pengaturan & Cadangan Data"
              className="w-9 h-9 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Cog6ToothIcon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Catat Kas</span>
          </button>

          {transactionCount > 0 && (
            <button
              onClick={onExport}
              title="Download CSV"
              className="hidden lg:flex w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 items-center justify-center transition active:scale-95 shadow-xs"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-emerald-600" />
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
