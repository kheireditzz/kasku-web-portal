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

  const devWaNumber = '62895321154498'
  const waMessage = encodeURIComponent(`Halo Developer KasKu, aplikasi KasKu saya meminta pembaruan ke versi v${updateInfo.latestVersion}. Mohon info/kirimkan file update terbarunya. Terima kasih!`)
  const waUrl = `https://wa.me/${devWaNumber}?text=${waMessage}`

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md touch-none select-none animate-fade-in">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-slide-up">
        
        {/* Ikon Update Animasi */}
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
          <p className="text-xs text-slate-600 font-medium">
            Versi aplikasi Anda (v{updateInfo.currentVersion}) perlu diperbarui. Silakan hubungi Developer untuk mendapatkan file pembaruan terbaru.
          </p>
        </div>

        {/* Catatan / Info Tambahan jika ada */}
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

        {/* Tombol Chat Developer WhatsApp Langsung */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.149-.556-1.745-.742-2.884-2.529-2.971-2.646-.088-.116-.708-.941-.708-1.796 0-.855.449-1.277.608-1.45.16-.174.349-.217.464-.217.116 0 .232.001.333.006.107.005.251-.041.391.297.144.348.492 1.203.535 1.29.043.087.072.189.014.305-.058.116-.087.189-.174.29-.088.102-.184.227-.263.305-.088.087-.18.182-.078.356.102.174.453.748.972 1.211.669.596 1.233.78 1.408.867.174.087.276.073.377-.043.101-.116.435-.508.551-.682.116-.174.232-.145.391-.087.16.058 1.014.479 1.188.566.174.087.29.131.333.203.043.073.043.421-.101.826z"/>
          </svg>
          <span>Hubungi Dev (WhatsApp)</span>
        </a>

        <p className="text-[10px] text-slate-400">
          Nomor Resmi Dev: +62 895-3211-54498
        </p>

      </div>
    </div>
  )
}
