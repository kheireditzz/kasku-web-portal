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
  onOpenSettingsModal
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  onOpenAddModal: () => void
  onOpenVoiceModal?: () => void
  onOpenSettingsModal?: () => void
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[45] px-3 pb-3 pt-1 pointer-events-none" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-md mx-auto relative pointer-events-auto" style={{ transform: 'translateZ(0)' }}>
        
        {/* DOCKBAR KASKU MODERN ELEGAN */}
        <div className="glass-nav rounded-[32px] px-2.5 py-2 flex items-center justify-between relative shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-slate-200/90 bg-white/90 backdrop-blur-2xl">
          
          {/* 1. Kas (Buku Kas) */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 group ${
              activeTab === 'overview' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-150 ${
              activeTab === 'overview' 
                ? 'bg-emerald-50 text-emerald-600 shadow-xs scale-105 ring-1 ring-emerald-200' 
                : 'text-slate-500 group-hover:text-slate-800'
            }`}>
              <WalletIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
              Kas
              {activeTab === 'overview' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </span>
          </button>

          {/* 2. Tabungan (Celengan Target) */}
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 group ${
              activeTab === 'savings' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-150 ${
              activeTab === 'savings' 
                ? 'bg-amber-50 text-amber-500 shadow-xs scale-105 ring-1 ring-amber-200' 
                : 'text-slate-500 group-hover:text-slate-800'
            }`}>
              <CutePiggyIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
              Celengan
              {activeTab === 'savings' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </span>
          </button>

          {/* Center Spacer for Floating Button */}
          <div className="w-14"></div>

          {/* 4. Analisis Grafik */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 group ${
              activeTab === 'analytics' ? 'text-cyan-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-150 ${
              activeTab === 'analytics' 
                ? 'bg-cyan-50 text-cyan-600 shadow-xs scale-105 ring-1 ring-cyan-200' 
                : 'text-slate-500 group-hover:text-slate-800'
            }`}>
              <ChartPieIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
              Analisis
              {activeTab === 'analytics' && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              )}
            </span>
          </button>

          {/* 5. Kategori Kas */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 w-14 py-1 active:scale-95 group ${
              activeTab === 'categories' ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-150 ${
              activeTab === 'categories' 
                ? 'bg-purple-50 text-purple-600 shadow-xs scale-105 ring-1 ring-purple-200' 
                : 'text-slate-500 group-hover:text-slate-800'
            }`}>
              <TagIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight font-semibold flex items-center gap-1 transition-colors duration-150">
              Kategori
              {activeTab === 'categories' && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              )}
            </span>
          </button>

        </div>

        {/* Floating Center Action Button for KasKu (+) */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 pointer-events-auto z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenAddModal()
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)] ring-4 ring-white flex items-center justify-center active:scale-90 transition-all duration-200 group cursor-pointer touch-manipulation select-none"
            title="Catat Transaksi Kas"
            aria-label="Catat Transaksi Kas"
          >
            <PlusIcon className="w-7 h-7 stroke-[3] text-white pointer-events-none group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </div>
  )
}
