'use client'

import React, { useState } from 'react'
import {
  XMarkIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  BanknotesIcon
} from './Icons'

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
  onOpenCategoriesTab
}: AddTransactionModalProps) {
  // Mode kustom ketik kategori langsung
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCatInput, setCustomCatInput] = useState('')

  // Helper fungsi huruf kapital di setiap kata
  const formatCapitalize = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ')
  }

  // Lock body scroll saat modal terbuka
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsCustomCategory(false)
      setCustomCatInput('')
    } else {
      document.body.style.overflow = 'unset'
      setIsCustomCategory(false)
      setCustomCatInput('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Jika sedang dalam mode kustom kategori, terapkan kategori yang diketik dengan huruf kapital
    if (isCustomCategory && customCatInput.trim()) {
      const formatted = formatCapitalize(customCatInput.trim())
      setSelectedCategory(formatted)
    }
    
    onAddTransaction(e)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in touch-none select-none">
      {/* Modal Container */}
      <div 
        className="w-full sm:max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Catat Transaksi</h2>
              <p className="text-[11px] text-slate-400">Pemasukan atau pengeluaran kas</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          
          {/* Switch Tipe Kas */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kas Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircleIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>Pengeluaran</span>
            </button>
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Keterangan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Honor Proyek, Makan Siang, Bensin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl kas-input text-xs"
              autoFocus
            />
          </div>

          {/* Nominal */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Nominal (Rp) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold text-xs">Rp</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl kas-input text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* Kategori & Tanggal */}
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
                    <option key={idx} value={cat}>
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

          {/* Catatan Tambahan */}
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <BanknotesIcon className="w-3.5 h-3.5" />
              <span>Simpan Transaksi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
