'use client'

import React, { useEffect } from 'react'
import { TrashIcon, XMarkIcon } from './Icons'

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  badge?: string
  variant?: 'danger' | 'warning' | 'primary'
  onConfirm: () => void
}

export default function ConfirmModal({
  dialog,
  onClose
}: {
  dialog: ConfirmDialogState | null
  onClose: () => void
}) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialog?.isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialog?.isOpen, onClose])

  // Lock body scroll saat modal konfirmasi terbuka
  useEffect(() => {
    if (dialog?.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [dialog?.isOpen])

  if (!dialog || !dialog.isOpen) return null

  const isDanger = dialog.variant !== 'warning' && dialog.variant !== 'primary'

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in touch-none select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-xl border border-white/60 rounded-[28px] p-5 shadow-ios-float space-y-4 animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Judul iOS Dialog Style */}
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDanger 
                ? 'bg-rose-500/15 text-rose-600' 
                : 'bg-amber-500/15 text-amber-600'
            }`}
          >
            <TrashIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            {dialog.title}
          </h3>
        </div>

        {/* Pesan Dialog */}
        <p className="text-xs text-slate-500 leading-relaxed px-2 font-medium">
          {dialog.message}
        </p>

        {/* Tombol Aksi iOS Dialog (Grouped Pill Buttons) */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95"
          >
            {dialog.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.onConfirm()
              onClose()
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs text-white shadow-ios-sm transition active:scale-95 flex items-center justify-center gap-1 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
            }`}
          >
            <span>{dialog.confirmText || 'Ya, Lanjutkan'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
