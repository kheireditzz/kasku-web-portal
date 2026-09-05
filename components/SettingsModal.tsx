'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  TrashIcon,
  HeartIcon,
  MicrophoneIcon
} from './Icons'
import SupportDevModal from './SupportDevModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: any[]
  savings: any[]
  categories: string[]
  onImportAllData: (data: { transactions?: any[]; savings?: any[]; categories?: string[] }) => void
  onClearAllData: () => void
  onOpenOnboarding?: () => void
  showToast: (msg: string) => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  transactions,
  savings,
  categories,
  onImportAllData,
  onClearAllData,
  onOpenOnboarding,
  showToast
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [voiceAutoSave, setVoiceAutoSave] = useState(true)

  // Baca preferensi Voice AI Auto Save
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kasku_voice_auto_save')
      if (saved !== null) {
        setVoiceAutoSave(saved === 'true')
      }
    } catch (e) {
      console.error(e)
    }
  }, [isOpen])

  // Kunci scroll background saat modal terbuka
  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalBodyOverflow || 'unset'
      }
    }
  }, [isOpen])

  // Gesture tarik ke bawah (drag down to dismiss)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isBackdropTouchRef = useRef(false)
  const mountTimeRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      mountTimeRef.current = Date.now()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Backup Data JSON
  const handleExportJSON = () => {
    try {
      const backupData = {
        app: 'KasKu',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        data: {
          transactions,
          savings,
          categories
        }
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`

      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute(
        'download',
        `kasku_cadangan_${new Date().toISOString().split('T')[0]}.json`
      )
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      showToast('Cadangan data JSON berhasil diunduh!')
    } catch (e) {
      console.error(e)
      showToast('Gagal membuat file cadangan.')
    }
  }

  // Restore Data JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        let txToImport = []
        let savingsToImport = []
        let catsToImport = []

        if (parsed.data) {
          txToImport = parsed.data.transactions || []
          savingsToImport = parsed.data.savings || []
          catsToImport = parsed.data.categories || []
        } else if (Array.isArray(parsed)) {
          txToImport = parsed
        }

        onImportAllData({
          transactions: txToImport,
          savings: savingsToImport,
          categories: catsToImport
        })

        setImportMsg(`Berhasil memulihkan ${txToImport.length} transaksi & ${savingsToImport.length} celengan!`)
        showToast('Data berhasil dipulihkan!')

        setTimeout(() => {
          setImportMsg(null)
          onClose()
        }, 1500)
      } catch (err) {
        console.error(err)
        showToast('Format file JSON tidak valid!')
      }
    }
    reader.readAsText(file)
  }


  const onDragStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    startYRef.current = e.touches[0].clientY
    isDraggingRef.current = true
    setIsDragging(true)
  }

  const onDragMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) {
      setDragY(delta)
    } else {
      setDragY(0)
    }
  }

  const onDragEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    isDraggingRef.current = false
    setIsDragging(false)
    if (dragY > 150) {
      setDragY(450)
      setTimeout(() => {
        onClose()
        setDragY(0)
      }, 200)
    } else {
      requestAnimationFrame(() => {
        setDragY(0)
      })
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        {/* Dark Overlay Backdrop - Explicit click only */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-0"
          onClick={(e) => {
            if (e.target === e.currentTarget && Date.now() - mountTimeRef.current > 400) {
              onClose()
            }
          }}
        />

        <div 
          className={`relative z-10 w-full sm:max-w-md bg-white border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 shadow-ios-float space-y-4 max-h-[90vh] overflow-y-auto ${
            dragY === 0 && !isDragging ? 'animate-slide-bottom sm:animate-slide-up' : ''
          }`}
          style={{
            transform: dragY > 0 ? `translateY(${dragY}px)` : 'translateY(0px)',
            transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* iOS Grabber Handle Bar (Area Geser Turun) */}
          <div 
            className="w-full pt-1 pb-4 -mt-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
            onTouchCancel={onDragEnd}
          >
            <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors opacity-80 pointer-events-none"></div>
          </div>

          {/* Header iOS Style */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Cog6ToothIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Pengaturan & Cadangan</h3>
                <p className="text-[11px] text-slate-400 font-medium">Cadangan data & preferensi kas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/20 text-slate-500 flex items-center justify-center font-bold text-xs transition active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* Bantuan Support Developer (QR DANA) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <HeartIcon className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-emerald-950 block leading-tight">
                    Support Developer
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    Bantuan & Donasi QRIS DANA
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold shadow-sm transition"
              >
                Scan QR
              </button>
            </div>
            <p className="text-[10px] text-emerald-800/80 leading-relaxed">
              Dukung pengembangan berkelanjutan KasKu agar tetap bebas iklan, cepat, dan selalu terupdate.
            </p>
          </div>

          {/* Mode Voice AI (Opsi A Auto-Save vs Opsi B Konfirmasi) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MicrophoneIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                    Mode Voice AI
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {voiceAutoSave ? 'Opsi A: Auto-Save Langsung' : 'Opsi B: Konfirmasi Form'}
                  </span>
                </div>
              </div>

              {/* iOS Style Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  const newVal = !voiceAutoSave
                  setVoiceAutoSave(newVal)
                  try {
                    localStorage.setItem('kasku_voice_auto_save', String(newVal))
                  } catch (e) {
                    console.error(e)
                  }
                  showToast(newVal ? 'Voice AI: Auto-Save Langsung aktif' : 'Voice AI: Mode Konfirmasi Form aktif')
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  voiceAutoSave ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    voiceAutoSave ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[10.5px] text-slate-500 leading-relaxed">
              {voiceAutoSave ? (
                <span>
                  <strong className="text-emerald-700 font-bold">Opsi A Aktif:</strong> Begitu selesai bicara & nominal terdeteksi, transaksi langsung tersimpan otomatis tanpa perlu klik tombol lagi.
                </span>
              ) : (
                <span>
                  <strong className="text-slate-800 font-bold">Opsi B Aktif:</strong> Setelah bicara, form hasil AI akan muncul dan layar otomatis scroll ke tombol Simpan untuk Anda periksa terlebih dahulu.
                </span>
              )}
            </p>
          </div>

          {/* Backup & Restore Data */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cadangan Data (JSON)
            </span>

            {/* Tombol Backup */}
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition active:scale-95 border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />
                <span>Unduh Cadangan (Backup JSON)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">.json</span>
            </button>

            {/* Tombol Restore */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition active:scale-95 border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <ArrowUpTrayIcon className="w-4 h-4 text-blue-600" />
                <span>Pulihkan Data (Import JSON)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Pilih File</span>
            </button>

            {importMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{importMsg}</span>
              </div>
            )}
          </div>

          {/* Ringkasan Data Lokal */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Status Memori HP
            </span>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Catatan Transaksi:</span>
              <span className="font-mono font-bold text-slate-800">{transactions.length} mutasi</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Target Celengan:</span>
              <span className="font-mono font-bold text-slate-800">{savings.length} target</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Daftar Kategori:</span>
              <span className="font-mono font-bold text-slate-800">{categories.length} kategori</span>
            </div>
          </div>


          {/* Panduan Pengenalan Web / Aplikasi */}
          {onOpenOnboarding && (
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Panduan KasKu</span>
                <span className="text-[10px] text-slate-400 block">Lihat kembali pengenalan fitur</span>
              </div>
              <button
                onClick={() => {
                  onClose()
                  onOpenOnboarding()
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition active:scale-95"
              >
                Lihat
              </button>
            </div>
          )}

          {/* Reset Data */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Reset Data</span>
              <span className="text-[10px] text-slate-400 block">Hapus semua data lokal</span>
            </div>
            <button
              onClick={() => {
                onClose()
                onClearAllData()
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>

        </div>
      </div>

      {/* POPUP MODAL QR DANA & CHAT DEV SUPPORT */}
      <SupportDevModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </>
  )
}
