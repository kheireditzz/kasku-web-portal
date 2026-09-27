'use client'

import React, { useState } from 'react'
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon
} from './Icons'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  note?: string
}

interface AnalyticsSectionProps {
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
  formatRupiah: (val: number) => string
  formatRupiahCompact: (val: number) => string
}

const EXPENSE_PALETTE = [
  { bg: '#F43F5E', hover: '#E11D48', light: '#FFE4E6', text: '#BE123C' },
  { bg: '#FB923C', hover: '#F97316', light: '#FFEDD5', text: '#C2410C' },
  { bg: '#FBBF24', hover: '#F59E0B', light: '#FEF3C7', text: '#B45309' },
  { bg: '#A855F7', hover: '#9333EA', light: '#F3E8FF', text: '#7E22CE' },
  { bg: '#EC4899', hover: '#DB2777', light: '#FCE7F3', text: '#BE185D' },
  { bg: '#6366F1', hover: '#4F46E5', light: '#E0E7FF', text: '#4338CA' },
  { bg: '#06B6D4', hover: '#0891B2', light: '#CFFAFE', text: '#0E7490' },
  { bg: '#64748B', hover: '#475569', light: '#F1F5F9', text: '#334155' }
]

const INCOME_PALETTE = [
  { bg: '#10B981', hover: '#059669', light: '#D1FAE5', text: '#047857' },
  { bg: '#06B6D4', hover: '#0891B2', light: '#CFFAFE', text: '#0E7490' },
  { bg: '#3B82F6', hover: '#2563EB', light: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#8B5CF6', hover: '#7C3AED', light: '#EDE9FE', text: '#6D28D9' },
  { bg: '#14B8A6', hover: '#0D9488', light: '#CCFBF1', text: '#0F766E' },
  { bg: '#84CC16', hover: '#65A30D', light: '#ECFCCB', text: '#4D7C0F' },
  { bg: '#F59E0B', hover: '#D97706', light: '#FEF3C7', text: '#B45309' },
  { bg: '#64748B', hover: '#475569', light: '#F1F5F9', text: '#334155' }
]

export default function AnalyticsSection({
  transactions,
  totalIncome,
  totalExpense,
  formatRupiah,
  formatRupiahCompact
}: AnalyticsSectionProps) {
  const [viewType, setViewType] = useState<'expense' | 'income' | 'comparison'>('expense')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const expenseGrouped = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: { [key: string]: number }, curr) => {
      const cat = curr.category || 'Lain-lain'
      acc[cat] = (acc[cat] || 0) + (Number(curr.amount) || 0)
      return acc
    }, {})

  const incomeGrouped = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: { [key: string]: number }, curr) => {
      const cat = curr.category || 'Lain-lain'
      acc[cat] = (acc[cat] || 0) + (Number(curr.amount) || 0)
      return acc
    }, {})

  const sortedExpenses = Object.entries(expenseGrouped).sort((a, b) => b[1] - a[1])
  const sortedIncomes = Object.entries(incomeGrouped).sort((a, b) => b[1] - a[1])

  const currentList = viewType === 'expense' ? sortedExpenses : sortedIncomes
  const currentTotal = viewType === 'expense' ? totalExpense : totalIncome
  const currentPalette = viewType === 'expense' ? EXPENSE_PALETTE : INCOME_PALETTE

  const RADIUS = 65
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  let accumulatedOffset = 0

  const donutSlices = currentList.map(([cat, total], index) => {
    const ratio = currentTotal > 0 ? total / currentTotal : 0
    const strokeDasharray = `${ratio * CIRCUMFERENCE} ${CIRCUMFERENCE}`
    const strokeDashoffset = -accumulatedOffset
    accumulatedOffset += ratio * CIRCUMFERENCE
    const color = currentPalette[index % currentPalette.length]
    return {
      cat,
      total,
      ratio,
      strokeDasharray,
      strokeDashoffset,
      color,
      percent: (ratio * 100).toFixed(1)
    }
  })

  const totalFlow = totalIncome + totalExpense
  const incomeFlowRatio = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 50
  const expenseFlowRatio = totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 50
  const netSavingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0

  return (
    <div className="space-y-6 animate-slide-up pb-6 select-none">
      
      {/* 1. Header Card Analisis */}
      <div className="surface-card rounded-[28px] p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
              <ChartPieIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Diagram & Analisis Kas
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Peta visual distribusi dan alokasi keuangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Rasio Tabung:</span>
              <span className={`font-mono ${netSavingsRate >= 20 ? 'text-emerald-600 font-black' : netSavingsRate > 0 ? 'text-amber-600 font-black' : 'text-rose-600 font-black'}`}>
                {netSavingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Segmented Control */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setViewType('expense')
              setActiveCategory(null)
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 ${
              viewType === 'expense'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewType('income')
              setActiveCategory(null)
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 ${
              viewType === 'income'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewType('comparison')
              setActiveCategory(null)
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 ${
              viewType === 'comparison'
                ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BanknotesIcon className="w-4 h-4 text-teal-600" />
            <span>Arus Kas</span>
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="surface-card rounded-[28px] p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <ChartPieIcon className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-900">Belum Ada Data Transaksi</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Catat pemasukan atau pengeluaran terlebih dahulu agar grafik diagram lingkaran dan analisis muncul di sini.
          </p>
        </div>
      ) : viewType === 'comparison' ? (
        <div className="space-y-6">
          <div className="surface-card rounded-[28px] p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                Perbandingan Arus Masuk vs Keluar
              </h3>
              <p className="text-xs text-slate-500">Rasio perimbangan total uang masuk terhadap belanja</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Pemasukan ({incomeFlowRatio.toFixed(1)}%)
                </span>
                <span className="text-rose-700 flex items-center gap-1.5">
                  Pengeluaran ({expenseFlowRatio.toFixed(1)}%)
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                </span>
              </div>
              <div className="w-full h-5 rounded-full bg-slate-100 p-1 flex overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${incomeFlowRatio}%` }}
                ></div>
                <div
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${expenseFlowRatio}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span>Total Pemasukan</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatRupiah(totalIncome)}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">
                  {sortedIncomes.length} kategori pemasukan tercatat
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                  <span>Total Pengeluaran</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatRupiah(totalExpense)}
                </div>
                <p className="text-[11px] text-rose-600 font-medium">
                  {sortedExpenses.length} kategori pengeluaran tercatat
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              totalIncome >= totalExpense 
                ? 'bg-teal-50 border-teal-200 text-teal-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="font-extrabold mb-1">
                {totalIncome >= totalExpense ? '💡 Status Kas: Sehat (Surplus)' : '⚠️ Status Kas: Defisit'}
              </div>
              <div>
                {totalIncome >= totalExpense 
                  ? `Pemasukan Anda lebih besar dari pengeluaran dengan sisa surplus ${formatRupiah(totalIncome - totalExpense)}. Pertahankan pola hemat ini dan alokasikan ke celengan/tabungan.`
                  : `Pengeluaran Anda saat ini melebihi total pemasukan sebesar ${formatRupiah(totalExpense - totalIncome)}. Cermati kategori belanja terbesar di bawah untuk menekan biaya.`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="surface-card rounded-[28px] p-6 sm:p-8 space-y-6">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${viewType === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  Diagram {viewType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </h3>
                <p className="text-xs text-slate-500">Pilih sektor diagram atau daftar di samping</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[11px] text-slate-500 block font-semibold">Total Nilai</span>
                <span className={`text-base sm:text-lg font-black ${viewType === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatRupiah(currentTotal)}
                </span>
              </div>
            </div>

            {currentList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Belum ada catatan {viewType === 'expense' ? 'pengeluaran' : 'pemasukan'}.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
                      <circle
                        cx="90"
                        cy="90"
                        r={RADIUS}
                        stroke="#F1F5F9"
                        strokeWidth="22"
                        fill="transparent"
                      />

                      {donutSlices.map((slice) => {
                        const isSelected = activeCategory === slice.cat
                        return (
                          <circle
                            key={slice.cat}
                            cx="90"
                            cy="90"
                            r={RADIUS}
                            stroke={slice.color.bg}
                            strokeWidth={isSelected ? "26" : "22"}
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="cursor-pointer transition-all duration-300 hover:opacity-90 active:scale-95"
                            onClick={() => {
                              setActiveCategory(isSelected ? null : slice.cat)
                            }}
                          />
                        )
                      })}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                      {activeCategory ? (
                        <>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Kategori
                          </span>
                          <span className="text-xs font-black text-slate-900 line-clamp-1 px-2">
                            {activeCategory}
                          </span>
                          <span className={`text-sm font-black font-mono mt-0.5 ${viewType === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {donutSlices.find(s => s.cat === activeCategory)?.percent}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            {currentList.length} Kategori
                          </span>
                          <span className={`text-base font-black font-mono tracking-tight ${viewType === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatRupiahCompact(currentTotal)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            100%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
                    Ketuk irisan diagram bulat untuk menyorot
                  </p>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex justify-between items-center mb-1">
                    <span>Peringkat Alokasi</span>
                    <span className="text-[11px] text-slate-500 font-medium">Total Nominal & Bagian</span>
                  </div>

                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {donutSlices.map((slice) => {
                      const isSelected = activeCategory === slice.cat
                      return (
                        <div
                          key={slice.cat}
                          onClick={() => setActiveCategory(isSelected ? null : slice.cat)}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span 
                                className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: slice.color.bg }}
                              ></span>
                              <span className="font-extrabold text-slate-900 truncate">
                                {slice.cat}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span className="font-mono font-black text-slate-900 text-xs">
                                {formatRupiah(slice.total)}
                              </span>
                              <span 
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 font-mono bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {slice.percent}%
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${slice.percent}%`,
                                backgroundColor: slice.color.bg
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
