'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  ArrowTrendingDownIcon,
  PencilSquareIcon,
  CalendarIcon,
  XMarkIcon
} from './Icons'

export interface SavingHistoryItem {
  id: string
  type: 'deposit' | 'withdraw'
  amount: number
  date: string
  note?: string
}

export interface SavingGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  color: string
  categoryIcon?: string
  history?: SavingHistoryItem[]
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

  // Top up / Deposit / Withdraw state
  const [depositModalGoal, setDepositModalGoal] = useState<SavingGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [isWithdrawMode, setIsWithdrawMode] = useState(false)

  // Edit Goal state
  const [editModalGoal, setEditModalGoal] = useState<SavingGoal | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTargetAmount, setEditTargetAmount] = useState('')
  const [editCurrentAmount, setEditCurrentAmount] = useState('')
  const [editTargetDate, setEditTargetDate] = useState('')
  const [editColor, setEditColor] = useState('amber')
  const [mounted, setMounted] = useState(false)

  // Drag-to-dismiss state for Edit Modal
  const [editDragY, setEditDragY] = useState(0)
  const [editIsDragging, setEditIsDragging] = useState(false)
  const editStartYRef = React.useRef(0)
  const editIsDraggingRef = React.useRef(false)

  // Drag-to-dismiss state for Deposit Modal
  const [depositDragY, setDepositDragY] = useState(0)
  const [depositIsDragging, setDepositIsDragging] = useState(false)
  const depositStartYRef = React.useRef(0)
  const depositIsDraggingRef = React.useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Kunci scroll background saat modal edit atau modal setor/tarik aktif
  useEffect(() => {
    if (editModalGoal || depositModalGoal) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [editModalGoal, depositModalGoal])

  const COLOR_OPTIONS = [
    { name: 'amber', label: 'Emas / Amber', bg: 'from-amber-500 via-orange-500 to-amber-600', text: 'text-amber-400', badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
    { name: 'emerald', label: 'Emerald Mint', bg: 'from-emerald-500 via-teal-500 to-emerald-600', text: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
    { name: 'cyan', label: 'Sky Blue', bg: 'from-cyan-500 via-blue-500 to-sky-600', text: 'text-cyan-400', badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' },
    { name: 'purple', label: 'Royal Violet', bg: 'from-purple-500 via-indigo-500 to-violet-600', text: 'text-purple-400', badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300' },
    { name: 'rose', label: 'Rose Pink', bg: 'from-rose-500 via-pink-500 to-rose-600', text: 'text-rose-400', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' }
  ]

  const QUICK_AMOUNTS = [20000, 50000, 100000, 500000, 1000000]

  const formatCompact = (val: number) => {
    const absVal = Math.abs(val || 0)
    const sign = val < 0 ? '-' : ''
    if (absVal >= 1_000_000_000_000) {
      return `${sign}Rp ${(absVal / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} T`
    }
    if (absVal >= 1_000_000_000) {
      return `${sign}Rp ${(absVal / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
    }
    if (absVal >= 100_000_000) {
      return `${sign}Rp ${(absVal / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`
    }
    return formatRupiah(val)
  }

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
      color: selectedColor,
      history: initial > 0 ? [{
        id: `SAV-HIST-${Date.now()}`,
        type: 'deposit',
        amount: initial,
        date: new Date().toISOString().split('T')[0],
        note: 'Saldo awal tabungan'
      }] : []
    }

    setSavings([newGoal, ...savings])

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

  // Buka Modal Edit Tabungan
  const handleOpenEdit = (goal: SavingGoal) => {
    setEditModalGoal(goal)
    setEditTitle(goal.title)
    setEditTargetAmount(goal.targetAmount.toString())
    setEditCurrentAmount(goal.currentAmount.toString())
    setEditTargetDate(goal.targetDate || '')
    setEditColor(goal.color || 'amber')
  }

  // Simpan Perubahan Edit Tabungan
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModalGoal) return

    const parsedTarget = parseFloat(editTargetAmount)
    const parsedCurrent = parseFloat(editCurrentAmount)

    if (!editTitle.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      showToast('Nama tabungan dan target dana harus diisi dengan benar!')
      return
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      showToast('Saldo saat ini tidak boleh bernilai negatif!')
      return
    }

    const updated = savings.map(s => {
      if (s.id === editModalGoal.id) {
        return {
          ...s,
          title: editTitle.trim(),
          targetAmount: parsedTarget,
          currentAmount: parsedCurrent,
          targetDate: editTargetDate || undefined,
          color: editColor
        }
      }
      return s
    })

    setSavings(updated)
    setEditModalGoal(null)
    showToast(`✓ Tabungan "${editTitle.trim()}" berhasil diperbarui!`)
  }

  // Proses Setor / Tarik Tabungan
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
      showToast(`Saldo tabungan tidak cukup! Tersedia ${formatRupiah(depositModalGoal.currentAmount)}`)
      return
    }

    const historyItem: SavingHistoryItem = {
      id: `SAV-HIST-${Date.now()}`,
      type: isWithdrawMode ? 'withdraw' : 'deposit',
      amount: rawVal,
      date: new Date().toISOString().split('T')[0],
      note: depositNote.trim() || (isWithdrawMode ? 'Penarikan celengan' : 'Setoran tabungan')
    }

    const updated = savings.map(s => {
      if (s.id === depositModalGoal.id) {
        const nextAmount = Math.max(0, s.currentAmount + actualAmount)
        const curHistory = s.history || []
        return {
          ...s,
          currentAmount: nextAmount,
          history: [historyItem, ...curHistory]
        }
      }
      return s
    })

    setSavings(updated)

    // Logika Pemisahan Data:
    // HANYA TARIK yang masuk ke Data Kas Umum (Kas Masuk),
    // sedangkan ISI TABUNGAN murni dicatat di internal celengan (tidak tercampur ke transaksi kas umum).
    if (isWithdrawMode && onAutoRecordTransaction) {
      onAutoRecordTransaction(
        `Tarik dari Celengan: ${depositModalGoal.title}`,
        rawVal,
        'income',
        'Tabungan & Investasi'
      )
    }

    setDepositAmount('')
    setDepositNote('')
    setDepositModalGoal(null)
    showToast(isWithdrawMode ? '💸 Tabungan ditarik & masuk ke Kas Umum!' : '💰 Hore! Saldo tabungan berhasil bertambah!')
  }

  // Drag-to-dismiss handlers for Edit Modal
  const onEditDragStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    editStartYRef.current = e.touches[0].clientY
    editIsDraggingRef.current = true
    setEditIsDragging(true)
  }
  const onEditDragMove = (e: React.TouchEvent) => {
    if (!editIsDraggingRef.current) return
    e.stopPropagation()
    const delta = e.touches[0].clientY - editStartYRef.current
    setEditDragY(delta > 0 ? delta : 0)
  }
  const onEditDragEnd = (e: React.TouchEvent) => {
    if (!editIsDraggingRef.current) return
    e.stopPropagation()
    editIsDraggingRef.current = false
    setEditIsDragging(false)
    if (editDragY > 80) {
      setEditDragY(500)
      setTimeout(() => { setEditModalGoal(null); setEditDragY(0) }, 200)
    } else {
      setEditDragY(0)
    }
  }

  // Drag-to-dismiss handlers for Deposit Modal
  const onDepositDragStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    depositStartYRef.current = e.touches[0].clientY
    depositIsDraggingRef.current = true
    setDepositIsDragging(true)
  }
  const onDepositDragMove = (e: React.TouchEvent) => {
    if (!depositIsDraggingRef.current) return
    e.stopPropagation()
    const delta = e.touches[0].clientY - depositStartYRef.current
    setDepositDragY(delta > 0 ? delta : 0)
  }
  const onDepositDragEnd = (e: React.TouchEvent) => {
    if (!depositIsDraggingRef.current) return
    e.stopPropagation()
    depositIsDraggingRef.current = false
    setDepositIsDragging(false)
    if (depositDragY > 80) {
      setDepositDragY(500)
      setTimeout(() => { setDepositModalGoal(null); setDepositDragY(0) }, 200)
    } else {
      setDepositDragY(0)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Top Banner Tabungan & Header Ringkasan Impian - iOS Style Grouped Card */}
      <div className="surface-card rounded-[28px] p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-ios-sm">
                <CutePiggyIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Celengan &amp; Target Impian
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Wujudkan impian, dana darurat, wishlist belanja, dan tabungan masa depan
                </p>
              </div>
            </div>

            {/* Micro badges iOS Style */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                <TrophyIcon className="w-3.5 h-3.5" />
                <span>{savings.filter(s => s.currentAmount >= s.targetAmount).length} Target Tercapai</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">
                <RocketIcon className="w-3.5 h-3.5" />
                <span>{savings.filter(s => s.currentAmount < s.targetAmount).length} Sedang Berjalan</span>
              </div>
            </div>
          </div>

          {/* Stat Cards Mini iOS Widgets */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 self-start lg:self-auto w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-[#f2f2f7] border border-black/5 flex-1 min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Terkumpul</span>
              <span className="text-lg sm:text-xl font-black font-mono text-amber-500 block mt-1">
                {formatRupiah(totalSaved)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block font-medium">
                Target: {formatRupiah(totalTarget)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f2f2f7] border border-black/5 flex-1 min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pencapaian</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 block mt-1">
                {totalPercentage}%
              </span>
              <div className="w-full h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
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
                        <div className="flex items-baseline justify-between gap-2 overflow-hidden">
                          <span 
                            title={formatRupiah(s.currentAmount)}
                            className={`font-black font-mono text-slate-900 tracking-tight truncate ${
                              s.currentAmount >= 1_000_000_000 
                                ? 'text-sm sm:text-base' 
                                : 'text-base'
                            }`}
                          >
                            {formatRupiah(s.currentAmount)}
                          </span>
                          <span 
                            title={`Target: ${formatRupiah(s.targetAmount)}`}
                            className="text-[11px] font-semibold font-mono text-slate-400 truncate shrink-0"
                          >
                            / {s.targetAmount >= 100_000_000 ? formatCompact(s.targetAmount) : formatRupiah(s.targetAmount)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${colorObj.bg} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-0.5 gap-1">
                          <span className={`font-bold font-mono truncate ${isFinished ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {isFinished ? '🎉 Selesai!' : `${percent}% terkumpul`}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px] truncate shrink-0">
                            {isFinished 
                              ? 'Target tercapai' 
                              : `Sisa ${formatCompact(Math.max(0, s.targetAmount - s.currentAmount))}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Edit, Nabung (+), Tarik (-) */}
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition active:scale-95 flex items-center justify-center"
                          title="Edit Target Tabungan"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDepositModalGoal(s)
                            setDepositAmount('')
                            setDepositNote('')
                            setIsWithdrawMode(false)
                          }}
                          className="flex-1 py-2 px-2.5 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <PlusIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>Isi</span>
                        </button>

                        <button
                          type="button"
                          disabled={s.currentAmount <= 0}
                          onClick={() => {
                            setDepositModalGoal(s)
                            setDepositAmount('')
                            setDepositNote('')
                            setIsWithdrawMode(true)
                          }}
                          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1 ${
                            s.currentAmount > 0
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
                              : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          }`}
                        >
                          <ArrowTrendingDownIcon className="w-3.5 h-3.5 text-rose-500" />
                          <span>Tarik</span>
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Modal Edit Tabungan - Bersih, Clean & Keluar dari Bawah (Portal ke Body) */}
      {editModalGoal && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in touch-none select-none"
          onClick={() => setEditModalGoal(null)}
        >
          <div 
            className={`w-full sm:max-w-lg bg-white border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[28px] p-6 shadow-ios-float space-y-4 max-h-[92vh] overflow-y-auto ${
              editIsDragging ? '' : 'transition-transform duration-200 ease-out'
            } ${editDragY === 0 && !editIsDragging ? 'animate-slide-bottom sm:animate-slide-up' : ''}`}
            style={{
              transform: editDragY > 0 ? `translateY(${editDragY}px)` : 'translateY(0px)',
              overscrollBehavior: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Drag Indicator Handle on Mobile - Swipe Down to Close */}
            <div 
              className="w-full pt-1 pb-3 -mt-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none sm:hidden"
              onTouchStart={onEditDragStart}
              onTouchMove={onEditDragMove}
              onTouchEnd={onEditDragEnd}
              onTouchCancel={onEditDragEnd}
            >
              <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors opacity-80 pointer-events-none"></div>
            </div>
            {/* Header Modal - Konsisten dengan Target Celengan Baru */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">Edit Target Tabungan</h3>
                  <p className="text-[11px] text-slate-500">Sesuaikan target, saldo, atau warna impian Anda</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  Perbarui
                </span>
                <button
                  type="button"
                  onClick={() => setEditModalGoal(null)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Nama Tabungan */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Nama Impian / Wishlist *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli iPhone, Dana Darurat, Liburan Bali"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs font-medium"
                />
              </div>

              {/* Target & Saldo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">Target Dana (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editTargetAmount}
                      onChange={(e) => setEditTargetAmount(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl kas-input text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">Saldo Saat Ini (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-amber-500 font-mono font-bold text-xs">Rp</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editCurrentAmount}
                      onChange={(e) => setEditCurrentAmount(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl kas-input text-xs font-mono font-semibold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Target Tanggal */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Target Tanggal</label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl kas-input text-xs font-mono"
                />
              </div>

              {/* Pilihan Warna Tema Kartu Tabungan */}
              <div className="space-y-2 pt-1">
                <label className="text-slate-500 font-semibold block">Palet Warna Kartu Celengan</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setEditColor(c.name)}
                      className={`h-8 rounded-xl bg-gradient-to-tr ${c.bg} transition-all flex items-center justify-center ${
                        editColor === c.name 
                          ? 'ring-2 ring-slate-800 scale-105 shadow-sm' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {editColor === c.name && (
                        <CheckCircleIcon className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalGoal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition active:scale-95 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 rounded-xl font-bold text-xs tracking-wide bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Isi (Setor) & Tarik Tabungan - Bersih, Clean & Keluar dari Bawah (Portal ke Body) */}
      {depositModalGoal && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in touch-none select-none"
          onClick={() => setDepositModalGoal(null)}
        >
          <div 
            className={`w-full sm:max-w-lg bg-white border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[28px] p-6 shadow-ios-float space-y-4 max-h-[92vh] overflow-y-auto ${
              depositIsDragging ? '' : 'transition-transform duration-200 ease-out'
            } ${depositDragY === 0 && !depositIsDragging ? 'animate-slide-bottom sm:animate-slide-up' : ''}`}
            style={{
              transform: depositDragY > 0 ? `translateY(${depositDragY}px)` : 'translateY(0px)',
              overscrollBehavior: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Drag Indicator Handle on Mobile - Swipe Down to Close */}
            <div 
              className="w-full pt-1 pb-3 -mt-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none sm:hidden"
              onTouchStart={onDepositDragStart}
              onTouchMove={onDepositDragMove}
              onTouchEnd={onDepositDragEnd}
              onTouchCancel={onDepositDragEnd}
            >
              <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors opacity-80 pointer-events-none"></div>
            </div>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isWithdrawMode ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {isWithdrawMode ? (
                    <ArrowTrendingDownIcon className="w-5 h-5" />
                  ) : (
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">{depositModalGoal.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Saldo: <span className="text-amber-600 font-bold">{formatRupiah(depositModalGoal.currentAmount)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                  isWithdrawMode 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isWithdrawMode ? 'Tarik' : 'Isi'}
                </span>
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Switch Tab: Isi Tabungan (+) vs Tarik (-) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => setIsWithdrawMode(false)}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  !isWithdrawMode 
                    ? 'bg-white text-amber-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowTrendingUpIcon className="w-4 h-4 text-amber-600" />
                <span>Isi Tabungan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawMode(true)}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isWithdrawMode 
                    ? 'bg-white text-rose-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600" />
                <span>Tarik Dana</span>
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">
                  {isWithdrawMode ? 'Nominal Tarik Tunai (Rp) *' : 'Nominal Setor Tabungan (Rp) *'}
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
                  Pilih Cepat:
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

              {/* Catatan Tambahan (Opsional) */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Catatan (Opsional)</label>
                <input
                  type="text"
                  placeholder={isWithdrawMode ? "Keperluan penarikan..." : "Sumber tabungan..."}
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs font-medium"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition active:scale-95 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    isWithdrawMode 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isWithdrawMode ? (
                    <>
                      <ArrowTrendingDownIcon className="w-4 h-4" />
                      <span>Tarik &amp; Masuk Kas</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Setor Tabungan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
