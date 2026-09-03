'use client'

import React from 'react'
import { WalletIcon, CutePiggyIcon, ChartPieIcon, TagIcon, PlusIcon } from './Icons'

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenAddModal
}: {
  activeTab: string
  setActiveTab: (tab: any) => void
  onOpenAddModal: () => void
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        
        {/* Floating Bottom Glass Island */}
        <div className="glass-nav rounded-[28px] px-3 py-2 border border-slate-200/80 flex items-center justify-between relative shadow-lg">
          
          {/* Tab 1: Kas */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center gap-1 transition-all w-14 py-1 active:scale-95 ${
              activeTab === 'overview'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700' : ''}`}>
              <WalletIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Kas</span>
          </button>

          {/* Tab 2: Tabungan */}
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex flex-col items-center justify-center gap-1 transition-all w-14 py-1 active:scale-95 ${
              activeTab === 'savings'
                ? 'text-amber-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'savings' ? 'bg-amber-50 text-amber-700' : ''}`}>
              <CutePiggyIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Tabungan</span>
          </button>

          {/* Center Spacer for Floating Button */}
          <div className="w-12"></div>

          {/* Tab 3: Grafik Analisis */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center gap-1 transition-all w-14 py-1 active:scale-95 ${
              activeTab === 'analytics'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'analytics' ? 'bg-cyan-50 text-cyan-700' : ''}`}>
              <ChartPieIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Analisis</span>
          </button>

          {/* Tab 4: Kategori */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center gap-1 transition-all w-14 py-1 active:scale-95 ${
              activeTab === 'categories'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'categories' ? 'bg-purple-50 text-purple-700' : ''}`}>
              <TagIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Kategori</span>
          </button>

        </div>

        {/* Floating Center Action Button - Clean Emerald */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 flex items-center justify-center">
          <button
            onClick={onOpenAddModal}
            className="w-13 h-13 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-90 transition-transform"
            title="Catat Transaksi Kas"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  )
}
