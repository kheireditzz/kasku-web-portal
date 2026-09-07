'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon, XMarkIcon, TrashIcon, PencilSquareIcon } from './Icons'
import { KasirProduct } from './KasirSection'

interface AddKasirProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveProduct: (product: KasirProduct) => void
  onDeleteProduct?: (id: string) => void
  editingProduct?: KasirProduct | null
  categories: string[]
}

const COMMON_EMOJIS = ['🍳', '🍜', '🍗', '🍿', '🧋', '☕', '💧', '🥑', '🍔', '🍟', '🍕', '🍰', '🍞', '🥤', '🍦', '📦', '🏷️', '🍫', '🍱', '🍙']

export default function AddKasirProductModal({
  isOpen,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  editingProduct,
  categories
}: AddKasirProductModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Makanan')
  const [customCategory, setCustomCategory] = useState('')
  const [emoji, setEmoji] = useState('🍳')
  const [barcode, setBarcode] = useState('')

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name)
      setPrice(editingProduct.price ? editingProduct.price.toLocaleString('id-ID') : '')
      setCategory(editingProduct.category || 'Makanan')
      setEmoji(editingProduct.emoji || '🍳')
      setBarcode(editingProduct.barcode || '')
      setCustomCategory('')
    } else {
      setName('')
      setPrice('')
      setCategory(categories[0] || 'Makanan')
      setCustomCategory('')
      setEmoji('🍳')
      setBarcode('')
    }
  }, [editingProduct, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) return

    const finalCat = category === 'Kustom' ? (customCategory.trim() || 'Umum') : category
    const numPrice = parseInt(price.replace(/\D/g, ''), 10) || 0

    const newProd: KasirProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: name.trim(),
      price: numPrice,
      category: finalCat,
      emoji: emoji || '📦',
      barcode: barcode.trim() || undefined
    }

    onSaveProduct(newProd)
    onClose()
  }

  const handleDelete = () => {
    if (editingProduct && onDeleteProduct) {
      onDeleteProduct(editingProduct.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-0" onClick={onClose} />
      
      <div className="relative z-10 w-full sm:max-w-md bg-white border border-slate-200 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {editingProduct ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {editingProduct ? 'Edit Produk Kasir' : 'Tambah Produk Kasir'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {editingProduct ? 'Perbarui informasi menu atau harga' : 'Daftarkan menu atau barang jualan baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Ikon / Emoji Produk</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {COMMON_EMOJIS.map(em => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 transition-all ${
                    emoji === em ? 'bg-emerald-600 text-white scale-110 shadow-sm' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Produk */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Produk / Menu</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Es Kopi Susu Aren"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Harga Jual dengan titik ribuan */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Harga Jual (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="text"
                required
                value={price}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setPrice(val ? Number(val).toLocaleString('id-ID') : '')
                }}
                placeholder="15.000"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              {['Makanan', 'Minuman', 'Camilan', 'Sembako', 'Jasa', 'Lain-lain', 'Kustom'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {category === 'Kustom' && (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="Ketik kategori baru..."
                className="mt-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            )}
          </div>

          {/* Barcode (Opsional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kode Barcode / SKU <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Contoh: 899275321"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            {editingProduct && onDeleteProduct && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 active:scale-95 text-xs font-bold rounded-2xl border border-rose-200 transition flex items-center gap-1.5"
                title="Hapus Produk"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-2xl shadow-md transition"
            >
              {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
