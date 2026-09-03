'use client'

import React, { useEffect } from 'react'
import { HeartIcon } from './Icons'
import { QRIS_DANA_IMAGE } from './qrisData'

export function ChatBubbleLeftRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

interface SupportDevModalProps {
  isOpen: boolean
  onClose: () => void
  autoCloseSeconds?: number
}

export default function SupportDevModal({ isOpen, onClose, autoCloseSeconds = 3 }: SupportDevModalProps) {
  const [timeLeft, setTimeLeft] = React.useState(autoCloseSeconds)

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(autoCloseSeconds)
      document.body.style.overflow = 'hidden'

      let timer: any = null
      let interval: any = null

      if (autoCloseSeconds > 0) {
        interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        timer = setTimeout(() => {
          onClose()
        }, autoCloseSeconds * 1000)
      }

      return () => {
        if (timer) clearTimeout(timer)
        if (interval) clearInterval(interval)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, autoCloseSeconds])

  if (!isOpen) return null

  const whatsappNumber = '62895321154498'
  const defaultChatText = 'Halo Dev saya mau rekomendasikan fitur: '
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultChatText)}`

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none overscroll-none touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault()
      }}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Bantuan &amp; Support Dev
              </h3>
              <span className="text-[10px] text-slate-400">KasKu Developer</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Gambar QRIS DANA (Direct Embedded Base64) */}
        <div className="text-center space-y-2">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs inline-block mx-auto overflow-hidden">
            <img
              src={QRIS_DANA_IMAGE}
              alt="QRIS DANA Support Developer"
              className="w-52 h-auto object-contain rounded-xl mx-auto block"
              loading="eager"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DANA / QRIS Terverifikasi
            </span>
            <p className="text-xs text-slate-600 pt-1.5 leading-relaxed">
              Dukung kelanjutan KasKu agar tetap <strong>bebas iklan</strong>, cepat, dan selalu mendapatkan update.
            </p>
          </div>
        </div>

        {/* Chat Developer via WhatsApp untuk Rekomendasi Fitur */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-600" />
              <span>Mau Rekomendasikan Fitur?</span>
            </span>
            <span className="text-[9px] font-mono font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded">
              WhatsApp
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Punya ide fitur baru untuk KasKu? Kirimkan langsung ke Developer kami:
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Chat Dev (+62 895-3211-54498)</span>
          </a>
        </div>

        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Tutup</span>
          {autoCloseSeconds > 0 && timeLeft > 0 && (
            <span className="text-[11px] text-slate-400 font-mono">({timeLeft}s)</span>
          )}
        </button>

      </div>
    </div>
  )
}
