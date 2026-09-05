'use client'

import React, { useState, useEffect } from 'react'
import {
  WalletIcon,
  PiggyBankIcon,
  MicrophoneIcon,
  ChartPieIcon,
  KasKuBrandLogo
} from './Icons'
import { APP_LOGO_BASE64 } from './appLogoBase64'

interface OnboardingModalProps {
  isOpen: boolean
  onFinish: () => void
  appVersion?: string
}

export default function OnboardingModal({ isOpen, onFinish, appVersion = '1.1.6' }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const ONBOARDING_STEPS = [
    {
      title: 'Selamat Datang di KasKu',
      subtitle: 'Aplikasi Keuangan Pribadi Anda',
      badge: `KasKu v${appVersion}`,
      icon: (
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg mx-auto flex items-center justify-center border border-slate-100 bg-white">
          <img src={APP_LOGO_BASE64} alt="KasKu Logo" className="w-full h-full object-cover" />
        </div>
      ),
      description: 'Catat kas, kelola pemasukan, dan pantau pengeluaran harian dengan aman 100% tersimpan di HP Anda.'
    },
  {
    title: 'Buku Kas & Mutasi Harian',
    subtitle: 'Pencatatan Rapi & Otomatis',
    badge: 'Fitur Utama',
    icon: (
      <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <WalletIcon className="w-12 h-12" />
      </div>
    ),
    description: 'Ketahui saldo kas terkini secara realtime, riwayat pengeluaran, dan buat kategori baru sesuka Anda.'
  },
  {
    title: 'Celengan & Target Impian',
    subtitle: 'Wujudkan Rencana Masa Depan',
    badge: 'Smart Savings',
    icon: (
      <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
        <PiggyBankIcon className="w-12 h-12" />
      </div>
    ),
    description: 'Alokasikan tabungan ke pos celengan khusus, atur target dana, dan pantau persentase yang sudah terkumpul.'
  },
  {
    title: 'Catat Kas Lewat Voice',
    subtitle: 'Bicara Santai, Otomatis Tercatat',
    badge: 'Voice Mode',
    icon: (
      <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <MicrophoneIcon className="w-12 h-12" />
      </div>
    ),
    description: 'Cukup ucapkan "Makan siang 25 ribu", sistem langsung mengenali jenis uang, nominal, dan kategorinya secara otomatis.'
  },
  {
    title: 'Analisis & Cadangan Data',
    subtitle: 'Grafik Persentase & Backup JSON',
    badge: 'Aman & Offline',
    icon: (
      <div className="w-24 h-24 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
        <ChartPieIcon className="w-12 h-12" />
      </div>
    ),
    description: 'Laporan visual kategori pengeluaran serta fitur backup & restore file JSON agar data Anda selalu terlindungi.'
  }
]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const stepData = ONBOARDING_STEPS[currentStep]

  const handleNext = () => {
    if (isLastStep) {
      onFinish()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] w-full h-full bg-[#f2f2f7] flex flex-col justify-between p-6 select-none touch-none animate-fade-in">
      
      {/* Top Header: Brand & Tombol Lewati */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-[#0d1117]">
            {APP_LOGO_BASE64 ? (
              <img src={APP_LOGO_BASE64} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <KasKuBrandLogo className="w-4 h-4" />
            )}
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">KasKu</span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white shadow-ios-sm transition active:scale-95"
        >
          Lewati
        </button>
      </div>

      {/* Konten Utama di Tengah Layar iOS Welcome Style */}
      <div className="my-auto max-w-sm mx-auto w-full text-center space-y-6 animate-slide-up">
        
        {/* Ikon Besar / Ilustrasi Fitur iOS Squircle */}
        <div className="py-3 flex justify-center">
          <div className="p-3 bg-white/80 rounded-[32px] shadow-ios-lg backdrop-blur-md">
            {stepData.icon}
          </div>
        </div>

        {/* Info Judul & Subtitle */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-white text-emerald-700 shadow-ios-sm border border-black/5">
            {stepData.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
            {stepData.title}
          </h1>
          <p className="text-sm font-bold text-emerald-600">
            {stepData.subtitle}
          </p>
        </div>

        {/* Deskripsi Apple Card */}
        <div className="p-5 rounded-3xl bg-white shadow-ios-sm border border-black/5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          <p>{stepData.description}</p>
        </div>

      </div>

      {/* Bagian Bawah: Indikator Dots & Tombol iOS Lanjutkan */}
      <div className="w-full max-w-sm mx-auto space-y-4 pb-4">
        {/* Indikator Titik (Dots) */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-7 bg-emerald-600'
                  : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Tombol Aksi iOS Continue Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-sm shadow-ios transition flex items-center justify-center gap-2"
        >
          <span>{isLastStep ? 'Mulai Gunakan KasKu' : 'Lanjutkan'}</span>
          <span className="text-xs opacity-80 font-mono">({currentStep + 1}/{ONBOARDING_STEPS.length})</span>
        </button>
      </div>

    </div>
  )
}
