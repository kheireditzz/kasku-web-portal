'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  WalletIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  RocketIcon,
  TagIcon,
  BanknotesIcon,
  PiggyBankIcon
} from '@/components/Icons'

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

export default function DownloadPortalPage() {
  const [data, setData] = useState<VersionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'old'>('all')
  const [copiedLink, setCopiedLink] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'offline'>('checking')

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
  const oldReleases = data?.releases?.filter(r => !r.isLatest) || []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs flex items-center justify-center">
              <img src="/app-logo.jpg" alt="KasKu Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-emerald-600 block leading-tight">
                KasKu
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Official APK Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>APK Cloud Sync Online</span>
            </div>

            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <WalletIcon className="w-4 h-4 text-emerald-600" />
              <span>Buka Web App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 text-xs font-bold tracking-wide shadow-xs">
            <SparklesIcon className="w-4 h-4 text-emerald-600" />
            <span>Pusat Distribusi & Update APK Resmi KasKu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Download & Kelola <span className="text-emerald-600">APK KasKu</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            Aplikasi pencatatan arus kas, tabungan target, budgeting keuangan, dan AI Voice Input. 
            Tersambung langsung secara real-time dengan server Web KasKu untuk pengecekan pembaruan otomatis (OTA).
          </p>

          {/* Quick Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
              <span>100% Aman & Terverifikasi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <DevicePhoneMobileIcon className="w-4 h-4 text-blue-600" />
              <span>Support Android 7.0+</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <ArrowPathIcon className="w-4 h-4 text-purple-600" />
              <span>OTA Auto-Update Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {/* Status Koneksi dengan APK */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${serverStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Status Koneksi APK: 
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${serverStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {serverStatus === 'connected' ? 'TERKONEKSI AKTIF (SYNC OK)' : 'MEMERIKSA KONEKSI'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Endpoint OTA: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">/api/version</code> &amp; <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">/version.json</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyOtaUrl}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              {copiedLink ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>Endpoint Tersalin!</span>
                </>
              ) : (
                <>
                  <RocketIcon className="w-4 h-4 text-slate-500" />
                  <span>Salin URL OTA Endpoint</span>
                </>
              )}
            </button>

            <button
              onClick={fetchVersionData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
              title="Refresh status"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Highlight Versi Terbaru (NEW RELEASE) */}
        {latestRelease && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 font-bold text-xs uppercase tracking-wider">
                    Versi Terbaru (Rekomendasi)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold text-xs font-mono">
                    v{latestRelease.version}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  KasKu Android Official Release
                </h2>

                <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
                  {data?.releaseNotes || 'Versi paling stabil dengan performa optimal dan fitur lengkap.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100 font-medium pt-1">
                  <span>Ukuran: <strong>{latestRelease.fileSize}</strong></span>
                  <span>•</span>
                  <span>Rilis: <strong>{latestRelease.releaseDate}</strong></span>
                  <span>•</span>
                  <span>OS: <strong>{latestRelease.minAndroid}</strong></span>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={latestRelease.downloadUrl}
                  download
                  className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2.5 transition text-center"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 text-emerald-600" />
                  <span>Download APK v{latestRelease.version}</span>
                </a>

                <button
                  onClick={() => setShowSyncModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-xs backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 transition text-center"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Koneksikan ke APK HP</span>
                </button>
              </div>
            </div>

            {/* Highlights list */}
            {latestRelease.highlights && latestRelease.highlights.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/15">
                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2.5">
                  Apa yang baru di versi {latestRelease.version}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-50">
                  {latestRelease.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Filter Versi APK: All / New / Old */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Semua Arsip Rilis APK (New &amp; Old)
              </h3>
              <p className="text-xs text-slate-500">
                Pilih versi APK yang sesuai dengan kebutuhan perangkat Android Anda.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'new' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Versi Baru
              </button>
              <button
                onClick={() => setActiveTab('old')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'old' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Versi Lama (Old)
              </button>
            </div>
          </div>

          {/* List of Releases */}
          <div className="space-y-3">
            {data?.releases
              ?.filter(rel => {
                if (activeTab === 'new') return rel.isLatest
                if (activeTab === 'old') return !rel.isLatest
                return true
              })
              .map(release => (
                <div
                  key={release.version}
                  className={`p-5 rounded-2xl border transition-all ${
                    release.isLatest
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 font-mono">
                          KasKu v{release.version}
                        </span>
                        {release.isLatest ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                            Terbaru (Latest)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            Versi Terdahulu (Old)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>Ukuran: <strong>{release.fileSize}</strong></span>
                        <span>•</span>
                        <span>Tanggal: <strong>{release.releaseDate}</strong></span>
                        <span>•</span>
                        <span>Minimum: <strong>{release.minAndroid}</strong></span>
                      </div>

                      {release.highlights && release.highlights.length > 0 && (
                        <ul className="pt-2 space-y-1">
                          {release.highlights.map((h, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <a
                        href={release.downloadUrl}
                        download
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                          release.isLatest
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
        </div>

        {/* Fitur Utama APK & Web KasKu */}
        <div className="space-y-4 pt-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Fitur Canggih KasKu
            </h3>
            <p className="text-xs text-slate-500">
              Desain tampilan 1:1 identik antara Web dan Aplikasi Android.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-emerald-200 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">AI Voice Assistant</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Catat kas masuk dan pengeluaran secara hands-free hanya menggunakan suara.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-emerald-200 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <PiggyBankIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Tabungan Impian</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pasang target tabungan, simulasi cicilan bulanan, dan tracking celengan digital.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-emerald-200 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Arus Kas & Kategori</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter transaksi, kategori custom tanpa batas, dan laporan otomatis terstruktur.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-emerald-200 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">OTA Update & Cloud Sync</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aplikasi HP otomatis mendeteksi versi terbaru melalui server endpoint web.
              </p>
            </div>
          </div>
        </div>

        {/* Panduan Instalasi APK */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
          <div className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm">Cara Pasang APK KasKu di HP Android</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-mono font-bold text-emerald-400 block">Langkah 1</span>
              <p>Download file APK (pilih versi Terbaru / versi Lama di atas).</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-mono font-bold text-emerald-400 block">Langkah 2</span>
              <p>Buka notifikasi unduhan lalu pilih <em>"Install"</em>. Aktifkan izin <em>"Install dari sumber tidak dikenal"</em> jika diminta.</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-mono font-bold text-emerald-400 block">Langkah 3</span>
              <p>Buka aplikasi KasKu. Aplikasi langsung terkoneksi dengan portal web ini.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Modal Petunjuk Sinkronisasi APK & Web */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowPathIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Koneksi APK &amp; Web Server</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Aplikasi KasKu APK di HP terhubung dengan server Web melalui endpoint update otomatis. 
              Saat rilis versi baru diterbitkan di portal ini, APK di HP pengguna akan menampilkan jendela pembaruan otomatis (OTA Modal).
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                API Config URL:
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
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 active:scale-95"
                >
                  {copiedLink ? 'Tersalin' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 KasKu — Aplikasi Manajemen Finansial & Arus Kas Modern.</p>
      </footer>
    </div>
  )
}
