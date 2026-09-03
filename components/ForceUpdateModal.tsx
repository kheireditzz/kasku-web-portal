'use client'

import React, { useEffect } from 'react'
import { ArrowUpTrayIcon } from './Icons'

export interface UpdateInfo {
  isOutdated: boolean
  currentVersion: string
  latestVersion: string
  forceUpdate: boolean
  releaseNotes?: string
  updateUrl: string
}

export default function ForceUpdateModal({
  updateInfo
}: {
  updateInfo: UpdateInfo | null
}) {
  useEffect(() => {
    if (updateInfo?.isOutdated) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [updateInfo?.isOutdated])

  if (!updateInfo || !updateInfo.isOutdated) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md touch-none select-none animate-fade-in">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-slide-up">
        
        {/* Ikon Update Animasi Halus */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <ArrowUpTrayIcon className="w-7 h-7 animate-bounce" />
        </div>

        {/* Info Versi */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Pembaruan Tersedia
          </span>
          <h2 className="text-base font-extrabold text-slate-900 pt-1">
            KasKu v{updateInfo.latestVersion}
          </h2>
          <p className="text-xs text-slate-500">
            Versi Anda (v{updateInfo.currentVersion}) sudah kedaluwarsa. Perbarui aplikasi untuk terus menggunakannya.
          </p>
        </div>

        {/* Release Notes Singkat */}
        {updateInfo.releaseNotes && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Catatan Rilis:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {updateInfo.releaseNotes}
            </p>
          </div>
        )}

        {/* Tombol Wajib Update */}
        <a
          href={updateInfo.updateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
        >
          <ArrowUpTrayIcon className="w-4 h-4" />
          <span>Update Sekarang</span>
        </a>

        <p className="text-[10px] text-slate-400">
          Data keuangan di HP Anda tetap aman setelah update.
        </p>

      </div>
    </div>
  )
}
