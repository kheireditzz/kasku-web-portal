'use client'

import React from 'react'
import { WalletIcon, CutePiggyIcon, ChartPieIcon, TagIcon, PlusIcon } from './Icons'

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenVoiceModal,
  onOpenSettingsModal
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  onOpenAddModal: () => void
  onOpenVoiceModal?: () => void
  onOpenSettingsModal?: () => void
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[45] px-4 pb-4 pt-1 pointer-events-none" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-md mx-auto relative pointer-events-auto" style={{ transform: 'translateZ(0)' }}>
        
        {/* Floating iOS Frosted Glass Island Bar */}
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

        {/* Floating Center Action Button (+) */}
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

      </div>
    </div>
  )
}
