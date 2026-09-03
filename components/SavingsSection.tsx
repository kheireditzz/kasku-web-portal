'use client'

import React, { useState } from 'react'
import {
  PiggyBankIcon,
  CutePiggyIcon,
  TrophyIcon,
  RocketIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from './Icons'

export interface SavingGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  color: string
  categoryIcon?: string
}

export default function SavingsSection({
  savings,
  setSavings,
  showToast,
  formatRupiah,
  onAutoRecordTransaction,
  onRequestDeleteGoal
}: {
  savings: SavingGoal[]
  setSavings: (savings: SavingGoal[]) => void
  showToast: (msg: string) => void
  formatRupiah: (val: number) => string
  onAutoRecordTransaction?: (title: string, amount: number, type: 'income' | 'expense', category: string) => void
  onRequestDeleteGoal?: (goal: SavingGoal) => void
}) {
  const [goalTitle, setGoalTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedColor, setSelectedColor] = useState('amber')

  // Top up / Deposit state
  const [depositModalGoal, setDepositModalGoal] = useState<SavingGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [isWithdrawMode, setIsWithdrawMode] = useState(false)
  const [autoSyncWithKas, setAutoSyncWithKas] = useState(true)

  const COLOR_OPTIONS = [
    { name: 'amber', label: 'Emas / Amber', bg: 'from-amber-500 via-orange-500 to-amber-600', text: 'text-amber-400', badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
    { name: 'emerald', label: 'Emerald Mint', bg: 'from-emerald-500 via-teal-500 to-emerald-600', text: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
    { name: 'cyan', label: 'Sky Blue', bg: 'from-cyan-500 via-blue-500 to-sky-600', text: 'text-cyan-400', badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' },
    { name: 'purple', label: 'Royal Violet', bg: 'from-purple-500 via-indigo-500 to-violet-600', text: 'text-purple-400', badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300' },
    { name: 'rose', label: 'Rose Pink', bg: 'from-rose-500 via-pink-500 to-rose-600', text: 'text-rose-400', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' }
  ]

  const QUICK_AMOUNTS = [20000, 50000, 100000, 500000, 1000000]

  const totalSaved = savings.reduce((acc, s) => acc + s.currentAmount, 0)
  const totalTarget = savings.reduce((acc, s) => acc + s.targetAmount, 0)
  const totalPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount)
    const initial = parseFloat(initialAmount) || 0

    if (!goalTitle.trim() || isNaN(target) || target <= 0) {
      showToast('Masukkan judul dan target tabungan yang valid!')
      return
    }

    const newGoal: SavingGoal = {
      id: `SAV-${Date.now()}`,
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: Math.max(0, initial),
      targetDate: targetDate || undefined,
      color: selectedColor
    }

    setSavings([newGoal, ...savings])

    // If initial amount > 0 and callback exists, record as saving expense
    if (initial > 0 && onAutoRecordTransaction && autoSyncWithKas) {
      onAutoRecordTransaction(
        `Setor Awal Tabungan: ${newGoal.title}`,
        initial,
        'expense',
        'Tabungan & Investasi'
      )
    }

    setGoalTitle('')
    setTargetAmount('')
    setInitialAmount('')
    setTargetDate('')
    showToast(`🎯 Target tabungan "${newGoal.title}" berhasil dibuat!`)
  }

  const handleDeleteGoal = (goal: SavingGoal) => {
    if (onRequestDeleteGoal) {
      onRequestDeleteGoal(goal)
    } else {
      setSavings(savings.filter(s => s.id !== goal.id))
      showToast('Target tabungan dihapus')
    }
  }

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositModalGoal) return
    const rawVal = parseFloat(depositAmount)
    if (isNaN(rawVal) || rawVal <= 0) {
      showToast('Masukkan nominal yang valid')
      return
    }

    const actualAmount = isWithdrawMode ? -rawVal : rawVal

    // Cek jika penarikan melebihi saldo tabungan
    if (isWithdrawMode && rawVal > depositModalGoal.currentAmount) {
      showToast(`Saldo tabungan hanya ${formatRupiah(depositModalGoal.currentAmount)}!`)
      return
    }

    const updated = savings.map(s => {
      if (s.id === depositModalGoal.id) {
        const nextAmount = Math.max(0, s.currentAmount + actualAmount)
        return { ...s, currentAmount: nextAmount }
      }
      return s
    })

    setSavings(updated)

    // Sinkronisasi otomatis ke buku kas jika dipilih
    if (onAutoRecordTransaction && autoSyncWithKas) {
      if (isWithdrawMode) {
        // Ambil dari tabungan = Pemasukan ke Kas Dompet
        onAutoRecordTransaction(
          `Tarik dari Celengan: ${depositModalGoal.title}`,
          rawVal,
          'income',
          'Tabungan & Investasi'
        )
      } else {
        // Nabung ke celengan = Pengeluaran dari Kas Dompet
        onAutoRecordTransaction(
          `Nabung ke Celengan: ${depositModalGoal.title}`,
          rawVal,
          'expense',
          'Tabungan & Investasi'
        )
      }
    }

    setDepositAmount('')
    setDepositModalGoal(null)
    showToast(isWithdrawMode ? '💸 Tabungan ditarik ke Saldo Kas' : '💰 Hore! Tabungan berhasil disetor!')
  }

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Top Banner Tabungan & Header Ringkasan Impian */}
      <div className="rounded-2xl surface-card p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <CutePiggyIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Celengan & Target Finansial
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wujudkan impian, dana darurat, wishlist belanja, dan investasi masa depan Anda
                </p>
              </div>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
                <TrophyIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>{savings.filter(s => s.currentAmount >= s.targetAmount).length} Target Tercapai</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
                <RocketIcon className="w-3.5 h-3.5 text-cyan-600" />
                <span>{savings.filter(s => s.currentAmount < s.targetAmount).length} Sedang Berjalan</span>
              </div>
            </div>
          </div>

          {/* Stat Cards Mini */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 self-start lg:self-auto w-full lg:w-auto">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex-1 min-w-[140px]">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Total Terkumpul</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-600 block mt-0.5">
                {formatRupiah(totalSaved)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Target: {formatRupiah(totalTarget)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex-1 min-w-[130px]">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Rata-rata Progress</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 block mt-0.5">
                {totalPercentage}%
              </span>
              <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Buat Target Baru & Daftar Tabungan Aktif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Buat Target Tabungan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">Target Celengan Baru</h3>
                  <p className="text-[11px] text-slate-500">Tentukan nama impian & nominal target</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                Otomatis
              </span>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Nama Impian / Wishlist *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli iPhone, Dana Darurat, Liburan Bali"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Target Dana (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="10000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl kas-input text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">Saldo Awal</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl kas-input text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">Target Tanggal</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl kas-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Pilihan Warna Tema Kartu Tabungan */}
              <div className="space-y-2 pt-1">
                <label className="text-slate-500 font-semibold block">Palet Warna Kartu Celengan</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-8 rounded-xl bg-gradient-to-tr ${c.bg} transition-all flex items-center justify-center ${
                        selectedColor === c.name 
                          ? 'ring-2 ring-slate-800 scale-105 shadow-sm' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {selectedColor === c.name && (
                        <CheckCircleIcon className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Sync ke Saldo Kas */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-800 block">Hubungkan ke Saldo Kas</span>
                  <span className="text-[10px] text-slate-500 block">Catat otomatis mutasi saat nabung/tarik</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSyncWithKas}
                  onChange={(e) => setAutoSyncWithKas(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wide bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Simpan Target Tabungan</span>
              </button>

            </form>
          </div>
        </div>

        {/* Daftar Kartu Tabungan */}
        <div className="lg:col-span-7 space-y-4">
          <div className="surface-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Celengan & Impian</h3>
                <p className="text-[11px] text-slate-500">{savings.length} target tabungan tercatat</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Aktif & Siap Disetor
              </span>
            </div>

            {savings.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 mx-auto flex items-center justify-center text-amber-600">
                  <CutePiggyIcon className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Belum Ada Celengan</h4>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Mulai simpan mimpi pertama Anda sekarang! Buat target seperti liburan, beli gadget, atau tabungan darurat.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savings.map((s) => {
                  const percent = s.targetAmount > 0 ? Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100)) : 0
                  const isFinished = percent >= 100
                  const colorObj = COLOR_OPTIONS.find(c => c.name === s.color) || COLOR_OPTIONS[0]

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl bg-white border transition-all space-y-3 relative ${
                        isFinished 
                          ? 'border-emerald-300 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${colorObj.bg} flex items-center justify-center text-white shadow-sm`}>
                            {isFinished ? (
                              <TrophyIcon className="w-4 h-4 text-white" />
                            ) : (
                              <PiggyBankIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {s.title}
                            </h4>
                            {s.targetDate && (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <span>Target: {s.targetDate}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(s)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                          title="Hapus Target"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Amounts */}
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-base font-bold font-mono text-slate-900 tracking-tight">
                            {formatRupiah(s.currentAmount)}
                          </span>
                          <span className="text-[11px] font-semibold font-mono text-slate-400">
                            / {formatRupiah(s.targetAmount)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${colorObj.bg} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className={`font-bold font-mono ${isFinished ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {isFinished ? '🎉 Selesai!' : `${percent}% terkumpul`}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {isFinished 
                              ? 'Target tercapai' 
                              : `Sisa ${formatRupiah(Math.max(0, s.targetAmount - s.currentAmount))}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Button: Nabung / Ambil */}
                      <button
                        onClick={() => {
                          setDepositModalGoal(s)
                          setDepositAmount('')
                          setIsWithdrawMode(false)
                        }}
                        className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                          isFinished 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Isi / Tarik Tabungan</span>
                      </button>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Modal Nabung / Tarik Celengan Modern White */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-slide-up shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CutePiggyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{depositModalGoal.title}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Saldo: <span className="text-amber-600 font-bold">{formatRupiah(depositModalGoal.currentAmount)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Switch Mode: Nabung (+) vs Tarik (-) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => setIsWithdrawMode(false)}
                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  !isWithdrawMode 
                    ? 'bg-white text-amber-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Nabung (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawMode(true)}
                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isWithdrawMode 
                    ? 'bg-white text-rose-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowTrendingDownIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Tarik Dana (-)</span>
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">
                  {isWithdrawMode ? 'Nominal Tarik Tunai (Rp)' : 'Nominal Setor Tabungan (Rp)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl kas-input text-xs font-mono font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                  Nominal Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700 transition active:scale-95"
                    >
                      +{amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Sinkron ke Kas */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-700 font-medium">
                  {isWithdrawMode ? 'Tambah ke Kas Masuk' : 'Potong dari Kas Dompet'}
                </span>
                <input
                  type="checkbox"
                  checked={autoSyncWithKas}
                  onChange={(e) => setAutoSyncWithKas(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-2.5 rounded-xl font-bold text-xs text-white shadow transition active:scale-95 ${
                    isWithdrawMode 
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  }`}
                >
                  {isWithdrawMode ? 'Tarik Sekarang' : 'Nabung Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
