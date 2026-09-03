'use client'

import React, { useState, useEffect } from 'react'
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
  HeartIcon
} from '@/components/Icons'
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
      const res = await fetch(`/api/version?t=${Date.now()}`)
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
      const url = `${window.location.origin}/api/version`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const latestRelease = data?.releases?.find(r => r.isLatest) || data?.releases?.[0]

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. ULTRA-CLEAN MODERN NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/90 transition-all">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Clean Brand Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200/60 flex items-center justify-center">
              <img src="/app-logo.jpg" alt="KasKu Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                KasKu<span className="text-emerald-500">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 border-l border-slate-200">
                APK Portal
              </span>
            </div>
          </div>

          {/* Clean Nav Actions */}
          <div className="flex items-center gap-3">
            

            <button
              onClick={() => setShowSupportModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 border border-slate-200/80"
              title="Bantuan & Donasi Support Developer"
            >
              <HeartIcon className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span className="hidden sm:inline">Support Dev</span>
            </button>

            {latestRelease && (
              <a
                href={latestRelease.downloadUrl}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH ELEGANT LAYOUT & IPHONE 16 PRO MOCKUP */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-100/40 via-teal-50/30 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Clean Typography & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Rilis Resmi APK Android</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Kelola Arus Kas Lebih Cepat &amp; Cerdas dengan <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy decoration-2">KasKu</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Aplikasi keuangan dengan pencatatan mutasi kas harian, asisten suara AI pintar, celengan impian bertarget, dan sistem update Over-The-Air (OTA) langsung ke perangkat Anda.
              </p>

              {/* Download Buttons Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                {latestRelease && (
                  <a
                    href={latestRelease.downloadUrl}
                    download
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition text-center"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download APK Terbaru (v{latestRelease.version})</span>
                  </a>
                )}

                <a
                  href="#releases"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-sm border border-slate-200 shadow-2xs flex items-center justify-center gap-2 transition text-center"
                >
                  <span>Lihat Versi Lama</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>100% Aman &amp; Tanpa Iklan</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-slate-500" />
                  <span>Android 7.0+</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <ArrowPathIcon className="w-4 h-4 text-emerald-600" />
                  <span>OTA Cloud Update</span>
                </div>
              </div>

            </div>

            {/* Right Column: PREVIEW HP IPHONE DENGAN DYNAMIC ISLAND & BEZEL TITANIUM */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              
              {/* Interactive Screen Switcher for Mockup */}
              <div className="mb-4 flex items-center p-1 rounded-xl bg-slate-200/70 text-[11px] font-bold text-slate-600">
                <button
                  onClick={() => setActiveScreen('home')}
                  className={`px-3 py-1 rounded-lg transition ${activeScreen === 'home' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveScreen('voice')}
                  className={`px-3 py-1 rounded-lg transition ${activeScreen === 'voice' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Suara AI
                </button>
                <button
                  onClick={() => setActiveScreen('savings')}
                  className={`px-3 py-1 rounded-lg transition ${activeScreen === 'savings' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Celengan
                </button>
              </div>

              {/* IPHONE CHASSIS (Titanium Edge, Dynamic Island, Ultra-thin Bezel) */}
              <div className="relative w-[300px] h-[610px] bg-[#1e232a] rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-800/80">
                
                {/* Physical Buttons on Sides */}
                <div className="absolute -left-[12px] top-[105px] w-[3px] h-[26px] bg-slate-700 rounded-l-sm"></div>
                <div className="absolute -left-[12px] top-[145px] w-[3px] h-[48px] bg-slate-700 rounded-l-sm"></div>
                <div className="absolute -left-[12px] top-[205px] w-[3px] h-[48px] bg-slate-700 rounded-l-sm"></div>
                <div className="absolute -right-[12px] top-[165px] w-[3px] h-[64px] bg-slate-700 rounded-r-sm"></div>

                {/* iPhone Screen Container */}
                <div className="relative w-full h-full bg-[#f8fafc] rounded-[42px] overflow-hidden flex flex-col select-none border border-slate-200/50">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
                    <div className="w-[96px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0a101d] border border-slate-800"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping"></div>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="pt-2 px-6 h-10 flex items-center justify-between text-[11px] font-bold text-slate-800 z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
                      <span>5G</span>
                      <div className="w-5 h-2.5 border border-slate-700 rounded-[3px] p-[1px] flex items-center">
                        <div className="w-full h-full bg-emerald-500 rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Top Bar KasKu inside iPhone */}
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg overflow-hidden">
                        <img src="/app-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-extrabold text-xs text-emerald-600">KasKu</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      v1.1.0
                    </span>
                  </div>

                  {/* Screen Content based on Active Tab */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                    {activeScreen === 'home' && (
                      <>
                        {/* Saldo Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white space-y-2 shadow-sm">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-100 block">Total Saldo Kas</span>
                          <div className="text-xl font-black tracking-tight">Rp 12.850.000</div>
                          <div className="flex justify-between text-[9px] pt-1.5 border-t border-white/20 text-emerald-50">
                            <span>+ Masuk: 15.000.000</span>
                            <span>- Keluar: 2.150.000</span>
                          </div>
                        </div>

                        {/* Fitur Cepat Mini */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <MicrophoneIcon className="w-4 h-4 mx-auto text-emerald-600 mb-0.5" />
                            <span className="text-[9px] font-bold text-slate-700 block">Voice AI</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <CutePiggyIcon className="w-4 h-4 mx-auto text-amber-600 mb-0.5" />
                            <span className="text-[9px] font-bold text-slate-700 block">Celengan</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <ChartPieIcon className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
                            <span className="text-[9px] font-bold text-slate-700 block">Analisis</span>
                          </div>
                        </div>

                        {/* Mutasi Terkini */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mutasi Terakhir</span>
                          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800 text-[10px]">Penjualan Barang</div>
                              <div className="text-[8px] text-slate-400">Kas Masuk • 10:30</div>
                            </div>
                            <span className="text-emerald-600 font-extrabold text-[10px]">+850.000</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800 text-[10px]">Biaya Operasional</div>
                              <div className="text-[8px] text-slate-400">Kas Keluar • Kemarin</div>
                            </div>
                            <span className="text-rose-600 font-extrabold text-[10px]">-250.000</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeScreen === 'voice' && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
                          <MicrophoneIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Mendengarkan Suara...</h4>
                          <p className="text-[10px] text-slate-400 mt-1">"Beli bensin 25 ribu"</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-semibold text-left">
                          ✓ Otomatis terdeteksi: <strong>Kas Keluar</strong><br />
                          ✓ Nominal: <strong>Rp 25.000</strong><br />
                          ✓ Kategori: <strong>Transportasi</strong>
                        </div>
                      </div>
                    )}

                    {activeScreen === 'savings' && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Celengan</span>
                        <div className="p-3 rounded-2xl bg-white border border-amber-200 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-800">🎯 Beli Laptop Baru</span>
                            <span className="font-mono font-bold text-amber-600">75%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full w-3/4"></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>Terkumpul: 11.250.000</span>
                            <span>Target: 15.000.000</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-800">🏖️ Liburan Akhir Tahun</span>
                            <span className="font-mono font-bold text-emerald-600">40%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full w-2/5"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation of iPhone App */}
                  <div className="p-2 bg-white border-t border-slate-100 flex justify-around items-center text-[9px] font-bold text-slate-400">
                    <span className="text-emerald-600">● Kas</span>
                    <span>● Celengan</span>
                    <span>● Analisis</span>
                  </div>

                  {/* iPhone Home Indicator Line */}
                  <div className="pb-1 pt-1 flex justify-center bg-white">
                    <div className="w-24 h-1 bg-slate-900 rounded-full"></div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. CLEAN STATS & STATUS BAR */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Status Server APK OTA:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px]">
                  ONLINE &amp; SINKRON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aplikasi di HP terhubung otomatis ke endpoint pembaruan: <code className="text-slate-600 font-mono">/api/version</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyOtaUrl}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Endpoint Tersalin!</span>
                </>
              ) : (
                <>
                  <RocketIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin URL OTA</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition active:scale-95"
            >
              Info Koneksi
            </button>
          </div>
        </div>
      </section>

      {/* 4. FITUR-FITUR UTAMA APK (CLEAN GRID) */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Fitur Unggulan
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fitur Lengkap KasKu di Android
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Bekerja 100% tanpa batas, cepat, dan data tersimpan aman di perangkat pengguna.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Pencatatan Suara AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Catat kas masuk atau keluar langsung dengan berbicara tanpa perlu mengetik manual.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CutePiggyIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Target Tabungan Celengan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buat target impian dengan persentase kemajuan dan visualisasi celengan digital.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ChartPieIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Visual Analisis Grafik</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Diagram perbandingan pemasukan vs pengeluaran serta kategori pengeluaran terbesar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Kategori Kas Bebas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tambahkan kategori usaha atau pribadi tanpa batasan untuk laporan yang rapi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Ekspor File CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rekap laporan kas harian/bulanan dapat diunduh ke format Excel &amp; Spreadsheet.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Pembaruan Otomatis (OTA)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aplikasi di HP otomatis memberi tahu saat versi baru dirilis di portal ini.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DOWNLOAD RELEASES (NEW & OLD) */}
      <section id="releases" className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Arsip Binari</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilihan Versi APK KasKu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih versi baru atau arsip versi terdahulu sesuai perangkat Anda.
            </p>
          </div>

          {/* Filter Tab */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setVersionFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${versionFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setVersionFilter('new')}
              className={`px-3 py-1.5 rounded-lg transition ${versionFilter === 'new' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              Versi Baru
            </button>
            <button
              onClick={() => setVersionFilter('old')}
              className={`px-3 py-1.5 rounded-lg transition ${versionFilter === 'old' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              Versi Lama
            </button>
          </div>
        </div>

        {/* Release Cards */}
        <div className="space-y-3">
          {data?.releases
            ?.filter(rel => {
              if (versionFilter === 'new') return rel.isLatest
              if (versionFilter === 'old') return !rel.isLatest
              return true
            })
            .map(release => (
              <div
                key={release.version}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  release.isLatest
                    ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900">
                        KasKu v{release.version}
                      </span>
                      {release.isLatest ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Terbaru
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          Versi Lama
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Ukuran: <strong>{release.fileSize}</strong></span>
                      <span>•</span>
                      <span>Tanggal: <strong>{release.releaseDate}</strong></span>
                      <span>•</span>
                      <span>Minimal: <strong>{release.minAndroid}</strong></span>
                    </div>

                    {release.highlights && release.highlights.length > 0 && (
                      <ul className="pt-2 space-y-1">
                        {release.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                        release.isLatest
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Koneksi Otomatis APK</h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Aplikasi KasKu APK di Android terhubung dengan portal web ini melalui endpoint update otomatis. Jika rilis baru diunggah ke server web ini, APK di HP pengguna akan menampilkan jendela pembaruan secara instan.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Endpoint URL:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/api/version` : '/api/version'}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 select-all"
                />
                <button
                  onClick={copyOtaUrl}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 active:scale-95"
                >
                  {copiedLink ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSyncModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
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

      {/* 7. MINIMALIST FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-400">
        <p>© 2026 KasKu — Portal Resmi Download &amp; Update APK Android.</p>
      </footer>

    </div>
  )
}
