'use client'

import React, { useState } from 'react'
import { Cog6ToothIcon, XMarkIcon, ArrowUpTrayIcon, TrashIcon } from './Icons'
import { StoreProfile } from './KasirSection'

interface StoreSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  storeProfile: StoreProfile
  onSaveProfile: (profile: StoreProfile) => void
  showToast?: (msg: string) => void
}

export default function StoreSettingsModal({
  isOpen,
  onClose,
  storeProfile,
  onSaveProfile,
  showToast
}: StoreSettingsModalProps) {
  const [storeName, setStoreName] = useState(storeProfile.storeName || '')
  const [storeSubtitle, setStoreSubtitle] = useState(storeProfile.storeSubtitle || '')
  const [storeAddress, setStoreAddress] = useState(storeProfile.storeAddress || '')
  const [storePhone, setStorePhone] = useState(storeProfile.storePhone || '')
  const [storeLogoUrl, setStoreLogoUrl] = useState(storeProfile.storeLogoUrl || '')
  const [receiptNote, setReceiptNote] = useState(storeProfile.receiptNote || '')

  if (!isOpen) return null

  // Handler Upload Logo File (Konversi ke Base64 Image agar tersimpan permanen)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar logo maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setStoreLogoUrl(base64)
      if (showToast) showToast('✅ Logo toko berhasil dimuat!')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: StoreProfile = {
      storeName: storeName.trim() || 'KasirKu POS',
      storeSubtitle: storeSubtitle.trim(),
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
      storeLogoUrl,
      receiptNote: receiptNote.trim()
    }
    onSaveProfile(updated)
    if (showToast) showToast('✅ Pengaturan struk berhasil disimpan!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-0" onClick={onClose} />
      
      <div className="relative z-10 w-full sm:max-w-md bg-white border border-slate-200 rounded-t-[32px] sm:rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              <Cog6ToothIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Atur Profil & Struk Toko</h3>
              <p className="text-[11px] text-slate-400">Kustomisasi logo, nama, alamat, dan ucapan bill</p>
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
          {/* Logo Struk Upload */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Logo Toko (Cetak Struk & Header)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                {storeLogoUrl ? (
                  <img src={storeLogoUrl} alt="Preview Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl text-slate-300">🏪</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition">
                  <span>📁 Pilih File Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {storeLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setStoreLogoUrl('')}
                    className="block text-[11px] font-bold text-rose-600 hover:text-rose-800"
                  >
                    Hapus Logo
                  </button>
                )}
                <p className="text-[10px] text-slate-400">
                  Format JPG/PNG, ukuran ideal persegi (rekomendasi &lt; 1MB).
                </p>
              </div>
            </div>
          </div>

          {/* Nama Toko */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Toko / Usaha</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Contoh: Kedai Kopi Berkah"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Slogan / Subtitle */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Slogan Singkat</label>
            <input
              type="text"
              value={storeSubtitle}
              onChange={e => setStoreSubtitle(e.target.value)}
              placeholder="Contoh: Aneka Makanan & Minuman Kekinian"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Alamat Toko */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Toko</label>
            <input
              type="text"
              value={storeAddress}
              onChange={e => setStoreAddress(e.target.value)}
              placeholder="Contoh: Jl. Ahmad Yani No. 12, Bandung"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Nomor HP / WhatsApp */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Telepon / WA</label>
            <input
              type="text"
              value={storePhone}
              onChange={e => setStorePhone(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Pesan Kaki Struk (Ucapan) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan & Ucapan Bawah Struk
            </label>
            <textarea
              rows={3}
              value={receiptNote}
              onChange={e => setReceiptNote(e.target.value)}
              placeholder="Contoh: Terima Kasih Atas Kunjungan Anda!\nFollow IG kami @toko.berkah"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white text-xs font-black rounded-2xl shadow-md transition"
          >
            Simpan Pengaturan Struk
          </button>
        </form>
      </div>
    </div>
  )
}
