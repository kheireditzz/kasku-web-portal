'use client'

import React, { useRef, useState } from 'react'
import {
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  TrashIcon,
  HeartIcon,
  TableCellsIcon
} from './Icons'
import SupportDevModal from './SupportDevModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: any[]
  savings: any[]
  categories: string[]
  onExportExcel?: () => void
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
  onExportExcel,
  onImportAllData,
  onClearAllData,
  onOpenOnboarding,
  showToast
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  // Kunci total scroll background (html, body, dan prevent touch event leak)
  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'

      return () => {
        document.body.style.overflow = originalBodyOverflow || 'unset'
        document.documentElement.style.overflow = originalHtmlOverflow || 'unset'
        document.body.style.touchAction = 'auto'
      }
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

      const rawJson = JSON.stringify(backupData, null, 2)
      const filename = `kasku_cadangan_${new Date().toISOString().split('T')[0]}.json`

      // Jika berjalan di Android Native APK
      if (typeof (window as any) !== 'undefined' && (window as any).AndroidFile) {
        try {
          const base64Data = btoa(unescape(encodeURIComponent(rawJson)))
          ;(window as any).AndroidFile.saveAndOpenFile(base64Data, filename, 'application/json')
          showToast('Cadangan data JSON berhasil disimpan di Download!')
          return
        } catch (err) {
          console.error(err)
        }
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(rawJson)}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', filename)
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

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none overscroll-none touch-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        onTouchMove={(e) => {
          if (e.target === e.currentTarget) e.preventDefault()
        }}
      >
        <div 
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Cog6ToothIcon className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Pengaturan & Cadangan</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
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

          {/* Ekspor Laporan Excel & Backup Data */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ekspor Laporan &amp; Cadangan Data
            </span>

            {/* Tombol Ekspor Excel Berwarna */}
            {onExportExcel && (
              <button
                onClick={() => {
                  onClose()
                  onExportExcel()
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-between transition active:scale-95 border border-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <TableCellsIcon className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Excel (.xls) Berwarna</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                  EXCEL
                </span>
              </button>
            )}

            {/* Tombol Backup JSON */}
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition active:scale-95 border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4 text-slate-600" />
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
