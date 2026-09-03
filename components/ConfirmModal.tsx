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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in touch-none select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xs sm:max-w-sm bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-3.5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bersih */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDanger 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              <TrashIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {dialog.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Pesan Singkat & Padat */}
        <p className="text-xs text-slate-600 leading-normal">
          {dialog.message}
        </p>

        {/* Tombol Aksi Rapi */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition active:scale-95"
          >
            {dialog.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.onConfirm()
              onClose()
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white shadow-sm transition active:scale-95 flex items-center justify-center gap-1 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            <span>{dialog.confirmText || 'Ya, Hapus'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
