'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  RocketIcon,
  BanknotesIcon,
  CutePiggyIcon,
  ChartPieIcon,
  TagIcon,
  MicrophoneIcon,
  HeartIcon,
  KasKuBrandLogo,
  TrophyIcon,
  TableCellsIcon,
  Cog6ToothIcon
} from '@/components/Icons'
import { APP_LOGO_BASE64 } from '@/components/appLogoBase64'
import SupportDevModal from '@/components/SupportDevModal'

interface ReleaseItem {
  version: string
  releaseDate: string
  fileSize: string
  downloadUrl: string
  isLatest: boolean
  minAndroid: string
  highlights: string[]
}

interface VersionData {
  latestVersion: string
  minRequiredVersion: string
  forceUpdate: boolean
  releaseNotes: string
  updateUrl: string
  releases: ReleaseItem[]
}

export default function KaskuLandingDownloadPage() {
  const [data, setData] = useState<VersionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [versionFilter, setVersionFilter] = useState<'all' | 'new' | 'old'>('all')
  const [copiedLink, setCopiedLink] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [activeScreen, setActiveScreen] = useState<'home' | 'voice' | 'savings'>('home')

  useEffect(() => {
    fetchVersionData()
  }, [])

  const fetchVersionData = async () => {
    setLoading(true)
    setServerStatus('checking')
    try {
      const res = await fetch('/api/version?t=' + Date.now())
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setServerStatus('connected')
      } else {
        setServerStatus('offline')
      }
    } catch (e) {
      console.error(e)
      setServerStatus('offline')
    } finally {
      setLoading(false)
    }
  }

  const copyOtaUrl = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + '/api/version'
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const latestRelease = data?.releases?.find(r => r.isLatest) || data?.releases?.[0]
  const currentVer = latestRelease?.version || '1.1.95'

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 relative overflow-x-hidden">
      
      {/* Dynamic Background Ambient Light Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-400/20 via-teal-300/15 to-transparent rounded-full blur-[110px] animate-pulse-glow" />
        <div className="absolute top-[40%] -left-48 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[65%] -right-48 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 1. ULTRA-PREMIUM FROSTED GLASS NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-ios-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand matching APK Exactly */}
          <Link href="/" className="flex items-center gap-2.5 select-none group cursor-pointer">
            <div className="w-9 h-9 rounded-[13px] overflow-hidden shadow-ios-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95 bg-[#0d1117] shrink-0 border border-white/60">
              {APP_LOGO_BASE64 ? (
                <img
                  src={APP_LOGO_BASE64}
                  alt="KasKu Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <KasKuBrandLogo className="w-full h-full" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900 font-display">
                  KasKu
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                  APK v{currentVer}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase -mt-0.5">
                Pusat Unduhan Resmi
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSupportModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 border border-slate-200/80 shadow-2xs group"
              title="Donasi & Dukung Developer"
            >
              <HeartIcon className="w-4 h-4 text-rose-500 fill-current group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold">Support Dev</span>
            </button>

            {latestRelease && (
              <a
                href={latestRelease.downloadUrl}
                download
                className="px-4 sm:px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-ios flex items-center gap-2 transition-all duration-200 group"
              >
                <ArrowDownTrayIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden xs:inline">Unduh APK</span>
                <span className="text-emerald-100 font-mono text-[11px]">({latestRelease.fileSize})</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION DENGAN ELEGANT GLASS CARD & INTERACTIVE SMARTPHONE MOCKUP */}
      <section className="relative z-10 pt-8 pb-14 sm:pt-14 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Sisi Kiri: Headline, Value Proposition & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Status Badge Cloud OTA */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-emerald-500/30 text-emerald-800 text-xs font-extrabold shadow-ios-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Rilis Resmi Android KasKu v{currentVer}</span>
                <span className="text-emerald-300">•</span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">OTA Aktif</span>
              </div>

              {/* Judul Utama yang Kuat */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-display">
                Catat Uang Jadi Cepat, Rapi &amp; Menyenangkan dengan <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">KasKu</span>
              </h1>

              {/* Deskripsi Menarik */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Aplikasi keuangan cerdas Android dengan asisten suara AI instan, celengan impian bertarget, diagram analisis realtime, serta sistem <strong className="text-slate-800 font-bold">Force Update &amp; Cloud OTA</strong> otomatis.
              </p>

              {/* CTA Utama: Download & Jelajahi */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                {latestRelease && (
                  <a
                    href={latestRelease.downloadUrl}
                    download
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-ios-float flex items-center justify-center gap-2.5 transition-all duration-200 group text-center"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download APK v{latestRelease.version}</span>
                    <span className="bg-emerald-800/40 px-2 py-0.5 rounded-lg text-xs font-mono">
                      {latestRelease.fileSize}
                    </span>
                  </a>
                )}

                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/95 hover:bg-white active:scale-95 text-slate-800 font-extrabold text-sm border border-slate-200/90 shadow-ios-sm flex items-center justify-center gap-2 transition-all duration-200 text-center"
                >
                  <SparklesIcon className="w-4 h-4 text-emerald-600" />
                  <span>Jelajahi Fitur</span>
                </a>
              </div>

              {/* Key Trust Highlights dengan Ikon Asli APK */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-black/5 shadow-2xs">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Bebas Iklan</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-black/5 shadow-2xs">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Offline First di HP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-black/5 shadow-2xs">
                  <ArrowPathIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Update Instan (OTA)</span>
                </div>
              </div>

            </div>

            {/* Sisi Kanan: MOCKUP SMARTPHONE INTERAKTIF & SILKY ANIMATED */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              
              {/* Screen Tab Switcher */}
              <div className="mb-3 flex items-center p-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/5 shadow-ios-sm text-xs font-bold text-slate-600">
                <button
                  onClick={() => setActiveScreen('home')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${activeScreen === "home" ? "bg-slate-900 text-white shadow-ios-sm font-black" : "hover:text-slate-900"}`}
                >
                  <WalletIcon className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveScreen('voice')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${activeScreen === "voice" ? "bg-slate-900 text-white shadow-ios-sm font-black" : "hover:text-slate-900"}`}
                >
                  <MicrophoneIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Voice AI</span>
                </button>
                <button
                  onClick={() => setActiveScreen('savings')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${activeScreen === "savings" ? "bg-slate-900 text-white shadow-ios-sm font-black" : "hover:text-slate-900"}`}
                >
                  <CutePiggyIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Celengan</span>
                </button>
              </div>

              {/* Titanium Device Chassis */}
              <div className="relative w-[305px] h-[620px] bg-[#1a1f2c] rounded-[52px] p-[10px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-white/10 animate-float-slow">
                
                {/* Hardware Buttons */}
                <div className="absolute -left-[11px] top-[105px] w-[3px] h-[26px] bg-slate-600 rounded-l-sm"></div>
                <div className="absolute -left-[11px] top-[145px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm"></div>
                <div className="absolute -left-[11px] top-[205px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm"></div>
                <div className="absolute -right-[11px] top-[165px] w-[3px] h-[64px] bg-slate-600 rounded-r-sm"></div>

                {/* Inner Screen */}
                <div className="relative w-full h-full bg-[#f2f2f7] rounded-[42px] overflow-hidden flex flex-col select-none border border-black/10">
                  
                  {/* Dynamic Island Capsule */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
                    <div className="w-[100px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0d131f]"></div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] text-emerald-400 font-mono font-bold">KasKu</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Top Status Bar */}
                  <div className="pt-2 px-6 h-10 flex items-center justify-between text-[11px] font-bold text-slate-800 z-20">
                    <span>09:41</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-mono">
                      <span>5G</span>
                      <div className="w-5 h-2.5 border border-slate-700 rounded-[3px] p-[1px] flex items-center">
                        <div className="w-full h-full bg-emerald-500 rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Mini KasKu App Header */}
                  <div className="px-4 py-2 bg-white/95 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                        {APP_LOGO_BASE64 ? (
                          <img src={APP_LOGO_BASE64} alt="KasKu Logo" className="w-full h-full object-cover" />
                        ) : (
                          <KasKuBrandLogo className="w-full h-full" />
                        )}
                      </div>
                      <span className="font-black text-sm text-slate-900">KasKu</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      v{currentVer}
                    </span>
                  </div>

                  {/* Interactive Screen Content */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                    {activeScreen === 'home' && (
                      <div className="space-y-3 animate-fade-in">
                        {/* iOS Modern Saldo Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white space-y-2.5 shadow-ios">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-100 flex items-center gap-1">
                              <WalletIcon className="w-3 h-3" />
                              <span>Total Saldo Kas</span>
                            </span>
                            <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Lokal HP</span>
                          </div>
                          <div className="text-2xl font-black tracking-tight font-display">Rp 14.850.000</div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-[9px]">
                            <div className="flex items-center gap-1 text-emerald-100">
                              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-300" />
                              <span>+17.500.000</span>
                            </div>
                            <div className="flex items-center gap-1 text-rose-100 justify-end">
                              <ArrowTrendingDownIcon className="w-3 h-3 text-rose-300" />
                              <span>-2.650.000</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-white border border-black/5 shadow-2xs">
                            <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                              <MicrophoneIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-800 block">Voice AI</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-black/5 shadow-2xs">
                            <div className="w-7 h-7 mx-auto rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                              <CutePiggyIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-800 block">Tabungan</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-black/5 shadow-2xs">
                            <div className="w-7 h-7 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                              <ChartPieIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-800 block">Analisis</span>
                          </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Transaksi Terbaru
                          </span>
                          <div className="p-2.5 rounded-xl bg-white border border-black/5 shadow-2xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-[10px]">Penjualan Produk</div>
                                <div className="text-[8px] text-slate-400">Kas Masuk • 14:20</div>
                              </div>
                            </div>
                            <span className="text-emerald-600 font-black text-[10px]">+1.250.000</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-black/5 shadow-2xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-[10px]">Belanja Stok Usaha</div>
                                <div className="text-[8px] text-slate-400">Kas Keluar • Kemarin</div>
                              </div>
                            </div>
                            <span className="text-rose-600 font-black text-[10px]">-450.000</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === 'voice' && (
                      <div className="p-4 rounded-2xl bg-white border border-black/5 text-center space-y-3 shadow-ios-sm animate-fade-in">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center animate-bounce">
                          <MicrophoneIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">Mendengarkan Suara Anda...</h4>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                            "Makan siang 35 ribu"
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F2F2F7] text-slate-700 text-[10px] font-semibold text-left space-y-1">
                          <div className="flex justify-between"><span>Tipe:</span> <strong className="text-rose-600 font-bold">Kas Keluar</strong></div>
                          <div className="flex justify-between"><span>Nominal:</span> <strong className="text-slate-900 font-bold">Rp 35.000</strong></div>
                          <div className="flex justify-between"><span>Kategori:</span> <strong className="text-slate-900 font-bold">Makanan</strong></div>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">
                          Otomatis diparsing oleh Native Google Voice Speech Recognizer
                        </div>
                      </div>
                    )}

                    {activeScreen === 'savings' && (
                      <div className="space-y-2 animate-fade-in">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tabungan &amp; Celengan Impian
                        </span>
                        
                        <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <TrophyIcon className="w-3.5 h-3.5 text-amber-500" />
                              <span>Beli Motor Baru</span>
                            </span>
                            <span className="font-mono font-black text-amber-600">80%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full w-4/5"></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 font-semibold">
                            <span>Terkumpul: 16.000.000</span>
                            <span>Target: 20.000.000</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <CutePiggyIcon className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Dana Darurat</span>
                            </span>
                            <span className="font-mono font-black text-emerald-600">65%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full w-[65%]"></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 font-semibold">
                            <span>Terkumpul: 6.500.000</span>
                            <span>Target: 10.000.000</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="p-2.5 bg-white/95 backdrop-blur-md border-t border-black/[0.06] flex justify-around items-center text-[9px] font-bold text-slate-400">
                    <span className="text-emerald-600 flex flex-col items-center gap-0.5">
                      <WalletIcon className="w-3.5 h-3.5" />
                      <span>Kas</span>
                    </span>
                    <span className="flex flex-col items-center gap-0.5">
                      <CutePiggyIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Celengan</span>
                    </span>
                    <span className="flex flex-col items-center gap-0.5">
                      <ChartPieIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Analisis</span>
                    </span>
                  </div>

                  {/* Home Bar */}
                  <div className="pb-1.5 pt-0.5 flex justify-center bg-white">
                    <div className="w-24 h-1 bg-slate-900 rounded-full"></div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. CLOUD SYNC & REALTIME API ENDPOINT STATUS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="p-5 rounded-[24px] bg-white/90 backdrop-blur-xl border border-black/[0.06] shadow-ios flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowPathIcon className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                <span>Cloud Version API Status:</span>
                <span className="text-emerald-700 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                  SINKRON &amp; TERVERIFIKASI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                APK Android KasKu memeriksa pembaruan otomatis via endpoint resmi: <code className="text-emerald-700 font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded">/api/version</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyOtaUrl}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>URL Tersalin!</span>
                </>
              ) : (
                <>
                  <RocketIcon className="w-4 h-4 text-slate-600" />
                  <span>Salin Endpoint OTA</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition active:scale-95 shadow-2xs"
            >
              Cek Rincian
            </button>
          </div>
        </div>
      </section>

      {/* 4. FITUR-FITUR LENGKAP KASKU DENGAN IKON RESMI APK */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-10 z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Fitur Komprehensif</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            Pengalaman Finansial Tanpa Ribet
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Semua fitur dirancang khusus untuk kemudahan dan kecepatan pencatatan harian Anda di Android.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Feature 1: Voice AI */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MicrophoneIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Voice AI Recognition
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Cukup ucapkan transaksi seperti <em>"Beli bensin 25 ribu"</em>, asisten native langsung mendeteksi jenis kas, nominal, dan kategorinya secara otomatis.
            </p>
          </div>

          {/* Feature 2: Celengan Impian */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CutePiggyIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Celengan Impian Bertarget
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kumpulkan uang untuk liburan, beli gadget, atau modal usaha dengan progress bar interaktif dan hitungan persentase pencapaian.
            </p>
          </div>

          {/* Feature 3: Visual Analisis */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ChartPieIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Grafik &amp; Analisis Finansial
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Pantau rasio pengeluaran vs pemasukan dan temukan pos pengeluaran terbesar dengan visual diagram yang jernih dan informatif.
            </p>
          </div>

          {/* Feature 4: Kategori Bebas */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TagIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Kategori Fleksibel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bebas menambahkan, mengubah, atau menghapus kategori transaksi sesuai kebutuhan operasional usaha atau kebutuhan rumah tangga Anda.
            </p>
          </div>

          {/* Feature 5: Export CSV */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TableCellsIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Ekspor Laporan CSV/Excel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Unduh seluruh riwayat transaksi pembukuan kas ke format spreadsheet untuk pembukuan akuntansi dan arsip pelaporan pajak.
            </p>
          </div>

          {/* Feature 6: Smart Force Update */}
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-ios-sm hover:shadow-ios transition-all duration-200 group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 font-display">
              Force Update &amp; Cloud OTA
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Dukungan rilis wajib (blocking) dan rilis opsional dengan proteksi tombol native Android agar perangkat pengguna selalu terlindungi versi terkini.
            </p>
          </div>

        </div>
      </section>

      {/* 5. DOWNLOAD RELEASES & VERSION HISTORY */}
      <section id="releases" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full space-y-6 z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-mono text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20 mb-1">
              <span>Arsip Binari Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Daftar Rilis APK KasKu
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Unduh versi APK terbaru atau pilih riwayat versi yang kompatibel dengan perangkat Anda.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center p-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/5 shadow-2xs text-xs font-bold text-slate-600 self-start sm:self-auto">
            <button
              onClick={() => setVersionFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${versionFilter === "all" ? "bg-slate-900 text-white shadow-2xs font-black" : "hover:text-slate-900"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setVersionFilter('new')}
              className={`px-3.5 py-1.5 rounded-xl transition ${versionFilter === "new" ? "bg-emerald-600 text-white shadow-2xs font-black" : "hover:text-slate-900"}`}
            >
              Terbaru
            </button>
            <button
              onClick={() => setVersionFilter('old')}
              className={`px-3.5 py-1.5 rounded-xl transition ${versionFilter === "old" ? "bg-slate-900 text-white shadow-2xs font-black" : "hover:text-slate-900"}`}
            >
              Arsip Lama
            </button>
          </div>
        </div>

        {/* Release Cards List */}
        <div className="space-y-3.5">
          {data?.releases
            ?.filter(rel => {
              if (versionFilter === 'new') return rel.isLatest
              if (versionFilter === 'old') return !rel.isLatest
              return true
            })
            .map(release => (
              <div
                key={release.version}
                className={`p-5 sm:p-6 rounded-[24px] border transition-all duration-200 ${release.isLatest ? "bg-white/95 border-emerald-500/40 shadow-ios ring-1 ring-emerald-500/20" : "bg-white/80 border-black/[0.06] hover:bg-white hover:border-black/10 shadow-2xs"}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-xl text-slate-900">
                        KasKu v{release.version}
                      </span>
                      {release.isLatest ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                          Rilis Terbaru
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-black/5">
                          Arsip
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Ukuran: <strong className="text-slate-700 font-bold">{release.fileSize}</strong></span>
                      <span>•</span>
                      <span>Tanggal: <strong className="text-slate-700 font-bold">{release.releaseDate}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-700 font-bold">{release.minAndroid}</strong></span>
                    </div>

                    {release.highlights && release.highlights.length > 0 && (
                      <ul className="pt-1.5 space-y-1">
                        {release.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-slate-600 font-medium flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="w-full sm:w-auto shrink-0">
                    <a
                      href={release.downloadUrl}
                      download
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-ios-sm ${release.isLatest ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Download APK</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 6. MODAL SYNC & PANDUAN */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-ios-float space-y-4 border border-white/60 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <ArrowPathIcon className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900 font-display">Koneksi Otomatis APK</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition active:scale-90"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Aplikasi KasKu APK di Android terhubung dengan portal web ini melalui endpoint update otomatis. Jika rilis baru diunggah ke server web ini, APK di HP pengguna akan menampilkan jendela pembaruan secara instan.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F2F2F7] border border-black/5 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Endpoint URL Resmi:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/api/version` : '/api/version'}
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 select-all font-bold"
                />
                <button
                  onClick={copyOtaUrl}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 active:scale-95 shadow-2xs"
                >
                  {copiedLink ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSyncModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL QR DANA & CHAT DEV SUPPORT */}
      <SupportDevModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* 7. MINIMALIST FOOTER DENGAN IKON BRAND */}
      <footer className="border-t border-black/[0.06] bg-white/90 backdrop-blur-xl py-8 text-center text-xs text-slate-400 z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-950 flex items-center justify-center">
              {APP_LOGO_BASE64 ? (
                <img src={APP_LOGO_BASE64} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <KasKuBrandLogo className="w-full h-full" />
              )}
            </div>
            <span className="font-black text-slate-800">KasKu Indonesia</span>
            <span>&bull;</span>
            <span>Aplikasi Manajemen Kas &amp; Tabungan Impian</span>
          </div>
          <p className="text-[11px] font-medium">
            &copy; 2026 KasKu. Dikembangkan untuk efisiensi finansial harian Anda.
          </p>
        </div>
      </footer>

    </div>
  )
}
