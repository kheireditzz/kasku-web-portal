'use client'

import React, { useState } from 'react'
import {
  XMarkIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  BanknotesIcon
} from './Icons'
import { formatThousands } from './currencyUtils'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (e: React.FormEvent) => void
  type: 'income' | 'expense'
  setType: (type: 'income' | 'expense') => void
  title: string
  setTitle: (title: string) => void
  amount: string
  setAmount: (amount: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  categories: string[]
  txDate: string
  setTxDate: (date: string) => void
  note: string
  setNote: (note: string) => void
  onOpenCategoriesTab: () => void
  isEditing?: boolean
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  type,
  setType,
  title,
  setTitle,
  amount,
  setAmount,
  selectedCategory,
  setSelectedCategory,
  categories,
  txDate,
  setTxDate,
  note,
  setNote,
  onOpenCategoriesTab,
  isEditing = false
}: AddTransactionModalProps) {
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCatInput, setCustomCatInput] = useState('')
  const mountTimeRef = React.useRef(0)

  const formatCapitalize = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ')
  }

  React.useEffect(() => {
    if (isOpen) {
      mountTimeRef.current = Date.now()
      const originalBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      setIsCustomCategory(false)
      setCustomCatInput('')
      return () => {
        document.body.style.overflow = originalBodyOverflow || 'unset'
      }
    } else {
      setIsCustomCategory(false)
      setCustomCatInput('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isCustomCategory && customCatInput.trim()) {
      const formatted = formatCapitalize(customCatInput.trim())
      setSelectedCategory(formatted)
    }
    onAddTransaction(e)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
    >
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => {
          if (Date.now() - mountTimeRef.current > 400) {
            onClose()
          }
        }}
      />

      <div 
        className="relative z-10 w-full sm:max-w-lg bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-bottom sm:animate-slide-up"
        style={{
          overscrollBehavior: 'contain'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors border ${type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {isEditing ? 'Edit Transaksi' : 'Catat Transaksi'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {isEditing ? 'Perbarui rincian data kas' : 'Pemasukan atau pengeluaran kas baru'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition active:scale-90"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircleIcon className="w-3.5 h-3.5" />
              <span>Kas Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircleIcon className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Keterangan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Honor Proyek, Makan Siang, Bensin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl kas-input text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Nominal (Rp) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold text-xs">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                required
                placeholder="0"
                value={formatThousands(amount)}
                onChange={(e) => {
                  const rawDigits = e.target.value.replace(/\D/g, '')
                  setAmount(rawDigits)
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl kas-input text-xs font-mono font-semibold"
              />
            </div>
            {amount && Number(amount) > 0 && (
              <p className="text-[10px] text-slate-500 font-mono pl-1">
                Terbaca: Rp {formatThousands(amount)}
              </p>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
              {[10000, 25000, 50000, 100000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const current = parseInt(amount.replace(/\D/g, ''), 10) || 0
                    setAmount(String(current + preset))
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-mono font-bold transition active:scale-95 shrink-0 border border-slate-200"
                >
                  +{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
              {amount && Number(amount) > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold hover:bg-rose-100 transition active:scale-95 shrink-0 border border-rose-200"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-semibold">Kategori</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory)
                    if (!isCustomCategory) {
                      setCustomCatInput('')
                    }
                  }}
                  className="text-[10px] text-emerald-600 font-bold hover:underline"
                >
                  {isCustomCategory ? '← Pilih List' : '+ Ketik Kategori'}
                </button>
              </div>

              {isCustomCategory ? (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ketik kategori baru (Cth: Kesehatan)"
                    value={customCatInput}
                    onChange={(e) => {
                      const val = e.target.value
                      setCustomCatInput(val)
                      if (val.trim()) {
                        setSelectedCategory(formatCapitalize(val.trim()))
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl kas-input text-xs border-emerald-500 ring-1 ring-emerald-500/20"
                    autoFocus
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Otomatis diawali huruf besar
                  </span>
                </div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl kas-input text-xs"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} className="bg-white text-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Tanggal</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl kas-input text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Catatan kecil..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl kas-input text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm transition active:scale-95 flex items-center justify-center"
            >
              <span>Simpan Transaksi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
