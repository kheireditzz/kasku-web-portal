'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import AddTransactionModal from '@/components/AddTransactionModal'
import SettingsModal from '@/components/SettingsModal'
import VoiceAITransactionModal from '@/components/VoiceAITransactionModal'
import ErrorBoundary from '@/components/ErrorBoundary'
import ForceUpdateModal, { UpdateInfo } from '@/components/ForceUpdateModal'
import OnboardingModal from '@/components/OnboardingModal'
import SavingsSection, { SavingGoal } from '@/components/SavingsSection'
import ConfirmModal, { ConfirmDialogState } from '@/components/ConfirmModal'
import SupportDevModal from '@/components/SupportDevModal'
import AnalyticsSection from '@/components/AnalyticsSection'
import {
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  BanknotesIcon,
  TagIcon,
  TrashIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  PlusIcon,
  PiggyBankIcon,
  CutePiggyIcon,
  TrophyIcon,
  RocketIcon,
  TableCellsIcon,
  PencilSquareIcon
} from '@/components/Icons'
import { APP_LOGO_BASE64 } from '@/components/appLogoBase64'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  note?: string
}

const DEFAULT_CATEGORIES: string[] = []

// Versi aplikasi yang terinstall saat ini (Simulasi Versi Lawas untuk Tes Kunci Update)
const APP_CURRENT_VERSION = '1.1.95'

export default function KaskuApp() {
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'analytics' | 'categories'>('overview')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSupportDevModal, setShowSupportDevModal] = useState(false)

  // Transactions State (PERSISTED)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Savings State (PERSISTED)
  const [savings, setSavings] = useState<SavingGoal[]>([])

  // Categories State (PERSISTED)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [newCatInput, setNewCatInput] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [txDate, setTxDate] = useState('')
  const [note, setNote] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCat, setFilterCat] = useState('all')

  // Load from localStorage on Mount
  useEffect(() => {
    try {
      const savedTx = localStorage.getItem('kasku_transactions_v2')
      if (savedTx) {
        setTransactions(JSON.parse(savedTx))
      }

      const savedSavings = localStorage.getItem('kasku_savings_v1')
      if (savedSavings) {
        setSavings(JSON.parse(savedSavings))
      }

      const savedCategories = localStorage.getItem('kasku_categories_v2')
      if (savedCategories) {
        const parsedCats = JSON.parse(savedCategories)
        if (Array.isArray(parsedCats)) {
          // Jika data tersimpan adalah default lawas ['Lain-lain'], migrasi ke kosong []
          const filtered = parsedCats.filter(c => c !== 'Lain-lain')
          setCategories(filtered)
          setSelectedCategory(filtered[0] || '')
          localStorage.setItem('kasku_categories_v2', JSON.stringify(filtered))
        }
      } else {
        setCategories([])
        setSelectedCategory('')
        localStorage.setItem('kasku_categories_v2', JSON.stringify([]))
      }

      // Cek apakah user baru pertama kali membuka web/aplikasi
      const hasOnboarded = localStorage.getItem('kasku_has_onboarded_v1')
      if (!hasOnboarded) {
        setShowOnboarding(true)
      }

      // Cek cache pembaruan wajib di localStorage agar modal muncul INSTAN tanpa delay jaringan
      try {
        const cachedUpdate = localStorage.getItem('kasku_cached_force_update_v1')
        if (cachedUpdate) {
          const parsed = JSON.parse(cachedUpdate)
          if (parsed && typeof parsed === 'object' && parsed.latestVersion) {
            const p1 = (parsed.latestVersion || '0').replace(/^v/, '').split('.').map((n: string) => parseInt(n, 10) || 0)
            const p2 = (APP_CURRENT_VERSION || '0').replace(/^v/, '').split('.').map((n: string) => parseInt(n, 10) || 0)
            const len = Math.max(p1.length, p2.length)
            let isOutdatedCached = false
            for (let i = 0; i < len; i++) {
              const a = p1[i] || 0
              const b = p2[i] || 0
              if (a > b) { isOutdatedCached = true; break; }
              if (a < b) { isOutdatedCached = false; break; }
            }
            if (isOutdatedCached && parsed.forceUpdate) {
              setUpdateInfo(parsed)
            } else {
              localStorage.removeItem('kasku_cached_force_update_v1')
            }
          }
        }
      } catch (e) {
        console.error('Failed reading update cache', e)
      }

      setTxDate(new Date().toISOString().split('T')[0])
    } catch (e) {
      console.error('Failed reading localStorage', e)
    } finally {
      setIsLoaded(true)
    }

    // Cek Pembaruan Aplikasi secara otomatis (OTA Update Checker: Blocking vs Opsional)
    const checkAppUpdate = async () => {
      // Lewati pengecekan HANYA jika sedang di local dev server browser biasa (localhost / 127.0.0.1)
      if (typeof window !== 'undefined') {
        const h = window.location.hostname
        if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') {
          return
        }
      }

      // Endpoint remote utama dan fallback
      const endpoints = [
        'https://kasku.kheireditz.my.id/api/version',
        'https://kasku.kheireditz.my.id/version.json',
        'https://raw.githubusercontent.com/kheireditzz/kasku-web-portal/main/public/version.json'
      ]

      // Helper function pembanding semver (v1 > v2 => 1, v1 < v2 => -1, sama => 0)
      const semverCompare = (v1: string, v2: string): number => {
        const p1 = (v1 || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
        const p2 = (v2 || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
        const len = Math.max(p1.length, p2.length)
        for (let i = 0; i < len; i++) {
          const a = p1[i] || 0
          const b = p2[i] || 0
          if (a > b) return 1
          if (a < b) return -1
        }
        return 0
      }

      for (const endpoint of endpoints) {
        try {
          let data: any = null
          const targetWithTime = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`

          // 1. Coba Native Bridge Android jika tersedia (100% bypass CORS & WebView file:// restriction)
          if (typeof window !== 'undefined' && (window as any).AndroidApp?.fetchUrlNative) {
            try {
              const raw = (window as any).AndroidApp.fetchUrlNative(targetWithTime)
              if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) {
                data = JSON.parse(raw.trim())
              }
            } catch (nativeErr) {
              console.warn('Native fetch fallback failed, falling back to fetch', nativeErr)
            }
          }

          // 2. Fetch standar via browser / webview
          if (!data) {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 4000)
            const res = await fetch(targetWithTime, {
              signal: controller.signal,
              cache: 'no-store'
            })
            clearTimeout(timeoutId)

            if (res.ok) {
              data = await res.json()
            }
          }

          if (data && data.latestVersion) {
            const latestVer = String(data.latestVersion).trim()
            const minReqVer = String(data.minRequiredVersion || data.latestVersion).trim()

            // Evaluasi apakah versi sekarang lebih kecil dari versi rilis terbaru
            const hasNewerVersion = semverCompare(latestVer, APP_CURRENT_VERSION) > 0

            if (hasNewerVersion) {
              // Mode blocking JIKA versi terpasang lebih kecil dari minRequiredVersion
              // Atau jika data.forceUpdate secara eksplisit bernilai true
              const isBlocking = Boolean(
                semverCompare(minReqVer, APP_CURRENT_VERSION) > 0 || data.forceUpdate === true
              )

              let targetUrl = data.updateUrl || 'https://kasku.kheireditz.my.id/'
              if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = `https://kasku.kheireditz.my.id${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`
              }

              const newUpdatePayload: UpdateInfo = {
                isOutdated: true,
                currentVersion: APP_CURRENT_VERSION,
                latestVersion: latestVer,
                forceUpdate: isBlocking,
                releaseNotes: data.releaseNotes || (
                  isBlocking
                    ? 'Pembaruan sistem wajib untuk menjaga keamanan dan kestabilan data transaksi Anda.'
                    : 'Pembaruan fitur baru dan perbaikan bug tersedia.'
                ),
                updateUrl: targetUrl
              }

              if (isBlocking) {
                try {
                  localStorage.setItem('kasku_cached_force_update_v1', JSON.stringify(newUpdatePayload))
                } catch (e) {}
              } else {
                try {
                  localStorage.removeItem('kasku_cached_force_update_v1')
                } catch (e) {}
              }

              setUpdateInfo(newUpdatePayload)
              break // Berhasil mendapatkan update info, hentikan loop
            } else {
              // Versi sudah paling baru, bersihkan cache blocking update jika ada
              try {
                localStorage.removeItem('kasku_cached_force_update_v1')
              } catch (e) {}
              setUpdateInfo(null)
              break
            }
          }
        } catch (err) {
          // Gagal / timeout pada endpoint ini, coba fallback berikutnya secara silent tanpa crash
        }
      }
    }

    // Jalankan pengecekan pertama kali saat aplikasi dibuka
    checkAppUpdate()

    // 1. Polling Otomatis Tiap 5 Detik: User yang sedang berada DI DALAM aplikasi langsung terkunci/diberitahu begitu admin menaikkan versi
    const updatePollingInterval = setInterval(() => {
      checkAppUpdate()
    }, 5000)

    // 2. Event VisibilityChange & Window Focus: Saat user membuka kunci layar atau beralih dari aplikasi lain kembali ke KasKu
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkAppUpdate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)

    // Proteksi: Larang salin teks, unduh gambar lewat klik kanan/long press, dan drag gambar
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleCopy = (e: ClipboardEvent) => {
      // Izinkan copy hanya jika user berada di input text / textarea saat mengetik
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return
      }
      e.preventDefault()
      return false
    }

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      clearInterval(updatePollingInterval)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  // Save Transactions
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('kasku_transactions_v2', JSON.stringify(transactions))
    } catch (e) {
      console.error('Failed saving transactions', e)
    }
  }, [transactions, isLoaded])

  // Save Savings
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('kasku_savings_v1', JSON.stringify(savings))
    } catch (e) {
      console.error('Failed saving savings', e)
    }
  }, [savings, isLoaded])

  // Save Categories
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('kasku_categories_v2', JSON.stringify(categories))
    } catch (e) {
      console.error('Failed saving categories', e)
    }
  }, [categories, isLoaded])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const formatRupiah = (val: number) => {
    const safeVal = (typeof val === 'number' && !isNaN(val)) ? val : 0
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(safeVal)
  }

  // Format ringkas dan cerdas untuk angka besar (Miliar, Juta, Triliun) agar tidak jebol desain layar HP
  const formatRupiahCompact = (val: number) => {
    const safeVal = (typeof val === 'number' && !isNaN(val)) ? val : 0
    const absVal = Math.abs(safeVal)
    const sign = safeVal < 0 ? '-' : ''

    if (absVal >= 1_000_000_000_000) {
      const formatted = (absVal / 1_000_000_000_000).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      return `${sign}Rp ${formatted} T`
    }
    if (absVal >= 1_000_000_000) {
      const formatted = (absVal / 1_000_000_000).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      return `${sign}Rp ${formatted} M`
    }
    if (absVal >= 100_000_000) {
      const formatted = (absVal / 1_000_000).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      })
      return `${sign}Rp ${formatted} Jt`
    }
    return formatRupiah(safeVal)
  }

  // Calculations (Dengan proteksi nilai safe)
  const totalIncome = transactions
    .filter(t => t && t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0)

  const totalExpense = transactions
    .filter(t => t && t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0)

  const netBalance = totalIncome - totalExpense

  const totalSavings = savings.reduce((acc, curr) => acc + (Number(curr?.currentAmount) || 0), 0)

  // Handle Add or Edit Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault()
    const cleanAmount = parseFloat(amount)
    if (!title.trim() || isNaN(cleanAmount) || cleanAmount <= 0) {
      showToast('Mohon masukkan nominal dan keterangan yang valid!')
      return
    }

    const finalCategory = (selectedCategory || categories[0] || 'Lain-lain').trim()

    // Auto-tambahkan kategori baru ke list jika belum terdaftar (agar bisa dipakai lagi)
    const existingCat = categories.find(c => c.toLowerCase() === finalCategory.toLowerCase())
    const savedCatName = existingCat || finalCategory

    if (!existingCat) {
      const updatedCats = [...categories, savedCatName]
      setCategories(updatedCats)
      try {
        localStorage.setItem('kasku_categories_v2', JSON.stringify(updatedCats))
      } catch (e) {
        console.error(e)
      }
    }

    if (editingTx) {
      // Mode Update / Edit
      const updatedList = transactions.map(t => {
        if (t.id === editingTx.id) {
          return {
            ...t,
            title: title.trim(),
            amount: cleanAmount,
            type,
            category: savedCatName,
            date: txDate || new Date().toISOString().split('T')[0],
            note: note.trim() ? note.trim() : undefined
          }
        }
        return t
      })
      setTransactions(updatedList)
      setEditingTx(null)
      setTitle('')
      setAmount('')
      setNote('')
      showToast(`Berhasil memperbarui transaksi "${title.trim()}"!`)
      return
    }

    const newTx: Transaction = {
      id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      amount: cleanAmount,
      type,
      category: savedCatName,
      date: txDate || new Date().toISOString().split('T')[0],
      note: note.trim() ? note.trim() : undefined
    }

    setTransactions([newTx, ...transactions])
    setTitle('')
    setAmount('')
    setNote('')
    showToast(`Berhasil menyimpan ${type === 'income' ? 'pemasukan' : 'pengeluaran'}`)
  }

  // Handle Buka Modal Edit Transaksi
  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTx(tx)
    setTitle(tx.title)
    setAmount(tx.amount.toString())
    setType(tx.type)
    setSelectedCategory(tx.category)
    setTxDate(tx.date)
    setNote(tx.note || '')
    setIsModalOpen(true)
  }

  // Handle Auto Record from Savings
  const handleAutoRecordFromSavings = (
    txTitle: string,
    txAmount: number,
    txType: 'income' | 'expense',
    txCategory: string
  ) => {
    const newTx: Transaction = {
      id: `TX-SAV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: txTitle,
      amount: txAmount,
      type: txType,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      note: 'Otomatis tersinkronisasi dari Celengan & Tabungan'
    }

    setTransactions(prev => [newTx, ...prev])
  }

  // Handle Delete Transaction
  const handleDeleteTransaction = (id: string, title?: string) => {
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: 'Hapus Transaksi?',
      message: `Hapus "${title || 'mutasi ini'}"? Saldo kas akan otomatis disesuaikan.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id))
        showToast('Transaksi dihapus')
      }
    })
  }

  // Handle Add Custom Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newCatInput.trim()
    if (!trimmed) return
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Kategori sudah ada!')
      return
    }

    const updated = [...categories, trimmed]
    setCategories(updated)
    try {
      localStorage.setItem('kasku_categories_v2', JSON.stringify(updated))
    } catch (err) {
      console.error(err)
    }
    setNewCatInput('')
    if (!selectedCategory) setSelectedCategory(trimmed)
    showToast(`Kategori "${trimmed}" ditambahkan`)
  }

  // Handle Delete Custom Category
  const handleDeleteCategory = (catToDelete: string) => {
    
    setConfirmDialog({
      isOpen: true,
      variant: 'warning',
      title: 'Hapus Kategori?',
      message: `Hapus kategori "${catToDelete}"? Data transaksi yang ada tetap aman.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        const updated = categories.filter(c => c !== catToDelete)
        setCategories(updated)
        try {
          localStorage.setItem('kasku_categories_v2', JSON.stringify(updated))
        } catch (err) {
          console.error(err)
        }
        if (selectedCategory === catToDelete) {
          setSelectedCategory(updated[0])
        }
        showToast(`Kategori "${catToDelete}" dihapus`)
      }
    })
  }

  // Handle Request Delete Goal from Savings
  const handleRequestDeleteGoal = (goal: SavingGoal) => {
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: 'Hapus Celengan?',
      message: `Hapus target celengan "${goal.title}"?`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        setSavings(prev => prev.filter(s => s.id !== goal.id))
        showToast(`Celengan "${goal.title}" dihapus`)
      }
    })
  }

  // Export Laporan Excel (.xls) yang Cantik, Rapi, Bold, dan Penuh Warna (Hijau untuk Masuk, Merah untuk Keluar)
  const handleExportExcel = () => {
    if (transactions.length === 0) {
      showToast('Belum ada transaksi untuk diekspor')
      return
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const saldoAkhir = totalIncome - totalExpense

    const formatRp = (num: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }

    let rowsHtml = ''
    transactions.forEach((tx, idx) => {
      const isIncome = tx.type === 'income'
      const typeLabel = isIncome ? 'MASUK' : 'KELUAR'
      const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
      const badgeBg = isIncome ? '#DCFCE7' : '#FFE4E6'
      const badgeColor = isIncome ? '#15803D' : '#BE123C'
      const amountColor = isIncome ? '#16A34A' : '#DC2626'
      const amountPrefix = isIncome ? '+ ' : '- '

      rowsHtml += `
        <tr style="background-color: ${rowBg}; border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 12px; text-align: center; color: #64748B; font-weight: bold; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 10px 12px; text-align: center; color: #1E293B; font-weight: bold; font-size: 11px;">${tx.date}</td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="background-color: ${badgeBg}; color: ${badgeColor}; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 6px; border: 1px solid ${isIncome ? '#BBF7D0' : '#FECDD3'};">
              ${typeLabel}
            </span>
          </td>
          <td style="padding: 10px 12px; color: #0F172A; font-weight: 700; font-size: 12px;">${tx.category}</td>
          <td style="padding: 10px 12px; color: #0F172A; font-weight: 600; font-size: 12px;">${tx.title}</td>
          <td style="padding: 10px 12px; text-align: right; color: ${amountColor}; font-weight: 900; font-size: 13px; font-family: monospace;">
            ${amountPrefix}${formatRp(tx.amount)}
          </td>
          <td style="padding: 10px 12px; color: #64748B; font-size: 11px; font-style: italic;">${tx.note || '-'}</td>
        </tr>
      `
    })

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Mutasi KasKu</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        </style>
      </head>
      <body>
        <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
          <!-- HEADER UTAMA LAPORAN -->
          <tr>
            <td colspan="7" style="background: #059669; color: #FFFFFF; font-size: 18px; font-weight: 900; text-align: center; padding: 18px; letter-spacing: 0.5px;">
              LAPORAN KEUANGAN &amp; MUTASI KASKU
            </td>
          </tr>
          <tr>
            <td colspan="7" style="background: #047857; color: #E6FFFA; font-size: 11px; font-weight: 600; text-align: center; padding: 6px;">
              Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | Total Transaksi: ${transactions.length}
            </td>
          </tr>
          <tr><td colspan="7" style="height: 12px;"></td></tr>

          <!-- KARTU RINGKASAN SALDO -->
          <tr>
            <td colspan="2" style="background-color: #ECFDF5; border: 2px solid #10B981; padding: 12px; text-align: center;">
              <div style="color: #047857; font-size: 10px; font-weight: 800; text-transform: uppercase;">Total Pemasukan (Masuk)</div>
              <div style="color: #059669; font-size: 15px; font-weight: 900; margin-top: 4px;">${formatRp(totalIncome)}</div>
            </td>
            <td style="width: 15px;"></td>
            <td colspan="2" style="background-color: #FFF1F2; border: 2px solid #F43F5E; padding: 12px; text-align: center;">
              <div style="color: #9F1239; font-size: 10px; font-weight: 800; text-transform: uppercase;">Total Pengeluaran (Keluar)</div>
              <div style="color: #E11D48; font-size: 15px; font-weight: 900; margin-top: 4px;">${formatRp(totalExpense)}</div>
            </td>
            <td style="width: 15px;"></td>
            <td style="background-color: #F8FAFC; border: 2px solid #0EA5E9; padding: 12px; text-align: center;">
              <div style="color: #0369A1; font-size: 10px; font-weight: 800; text-transform: uppercase;">Sisa Saldo Kas</div>
              <div style="color: ${saldoAkhir >= 0 ? '#0284C7' : '#DC2626'}; font-size: 15px; font-weight: 900; margin-top: 4px;">${formatRp(saldoAkhir)}</div>
            </td>
          </tr>
          <tr><td colspan="7" style="height: 16px;"></td></tr>

          <!-- TABEL HEADER -->
          <tr style="background-color: #0F172A; color: #FFFFFF;">
            <th style="padding: 12px 10px; text-align: center; font-size: 11px; font-weight: 800; width: 40px; border: 1px solid #0F172A;">NO</th>
            <th style="padding: 12px 10px; text-align: center; font-size: 11px; font-weight: 800; width: 110px; border: 1px solid #0F172A;">TANGGAL</th>
            <th style="padding: 12px 10px; text-align: center; font-size: 11px; font-weight: 800; width: 100px; border: 1px solid #0F172A;">JENIS</th>
            <th style="padding: 12px 10px; text-align: left; font-size: 11px; font-weight: 800; width: 150px; border: 1px solid #0F172A;">KATEGORI</th>
            <th style="padding: 12px 10px; text-align: left; font-size: 11px; font-weight: 800; width: 220px; border: 1px solid #0F172A;">KETERANGAN</th>
            <th style="padding: 12px 10px; text-align: right; font-size: 11px; font-weight: 800; width: 160px; border: 1px solid #0F172A;">NOMINAL</th>
            <th style="padding: 12px 10px; text-align: left; font-size: 11px; font-weight: 800; width: 180px; border: 1px solid #0F172A;">CATATAN</th>
          </tr>

          <!-- ISI TRANSAKSI -->
          ${rowsHtml}

          <!-- FOOTER SUMMARY TOTAL -->
          <tr style="background-color: #E2E8F0; font-weight: 900; border-top: 2px solid #94A3B8;">
            <td colspan="5" style="padding: 12px; text-align: right; font-size: 12px; color: #0F172A; text-transform: uppercase;">
              TOTAL SURPLUS / DEFISIT BERSIH:
            </td>
            <td style="padding: 12px; text-align: right; font-size: 13px; font-weight: 900; color: ${saldoAkhir >= 0 ? '#15803D' : '#BE123C'}; font-family: monospace;">
              ${formatRp(saldoAkhir)}
            </td>
            <td style="padding: 12px; font-size: 10px; color: #64748B;">KasKu Financial App</td>
          </tr>
        </table>
      </body>
      </html>
    `

    const filename = `KasKu_Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xls`

    // Cek jika berjalan di dalam Android Native APK
    if (typeof (window as any) !== 'undefined' && (window as any).AndroidFile) {
      try {
        const base64Data = btoa(unescape(encodeURIComponent(excelHtml)))
        ;(window as any).AndroidFile.saveAndOpenFile(base64Data, filename, 'application/vnd.ms-excel')
        showToast('Laporan Excel berhasil disimpan di Download!')
        return
      } catch (err) {
        console.error('Native Excel download error', err)
      }
    }

    // Fallback Browser Standar Blob
    try {
      const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      showToast('Laporan Excel berwarna berhasil diunduh!')
    } catch (e) {
      showToast('Gagal mengunduh file Excel')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    handleExportExcel()
  }

  // Import Semua Data dari JSON
  const handleImportAllData = (data: { transactions?: any[]; savings?: any[]; categories?: string[] }) => {
    if (data.transactions && Array.isArray(data.transactions)) {
      setTransactions(data.transactions)
      localStorage.setItem('kasku_transactions_v2', JSON.stringify(data.transactions))
    }
    if (data.savings && Array.isArray(data.savings)) {
      setSavings(data.savings)
      localStorage.setItem('kasku_savings_v1', JSON.stringify(data.savings))
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories)
      localStorage.setItem('kasku_categories_v2', JSON.stringify(data.categories))
    }
  }

  // Reset / Kosongkan Semua Data 100% Work
  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      variant: 'danger',
      title: 'Reset Semua Data?',
      message: 'Hapus seluruh catatan transaksi dan target celengan di HP?',
      confirmText: 'Reset',
      cancelText: 'Batal',
      onConfirm: () => {
        try {
          // Bersihkan seluruh localStorage
          localStorage.clear()
          localStorage.removeItem('kasku_transactions_v2')
          localStorage.removeItem('kasku_savings_v1')
          localStorage.removeItem('kasku_categories_v2')

          localStorage.setItem('kasku_transactions_v2', JSON.stringify([]))
          localStorage.setItem('kasku_savings_v1', JSON.stringify([]))
          localStorage.setItem('kasku_categories_v2', JSON.stringify([]))
        } catch (e) {
          console.error(e)
        }

        // Update semua React State secara langsung
        setTransactions([])
        setSavings([])
        setCategories([])
        setSelectedCategory('')
        setFilterCat('all')
        setFilterType('all')
        setSearchQuery('')
        showToast('Semua data berhasil dibersihkan')
      }
    })
  }

  // Handle Save Transaction from Voice AI (Auto-kategori otomatis masuk & sesuaikan)
  const handleSaveVoiceTransaction = (tx: {
    title: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    note?: string
  }) => {
    console.log('Menerima data dari voice modal:', tx)
    try {
      const cleanTitle = (tx?.title || 'Transaksi KasKu').trim()
      const cleanAmount = Number(tx?.amount) || 0
      const cleanType: 'income' | 'expense' = tx?.type === 'income' ? 'income' : 'expense'
      const cleanCat = (tx?.category || 'Lain-lain').trim() || 'Lain-lain'
      const cleanDate = (tx?.date && tx.date.length === 10) ? tx.date : new Date().toISOString().slice(0, 10)

      if (cleanAmount <= 0) {
        console.warn('[handleSaveVoiceTransaction] Ditolak: nominal <= 0', cleanAmount)
        showToast('Nominal transaksi tidak valid!')
        return
      }

      // Cek apakah kategori sudah ada (case-insensitive & trim) agar disatukan dan tidak dobel
      const existingCat = categories.find(c => c && c.toLowerCase() === cleanCat.toLowerCase())
      const finalCategory = existingCat || cleanCat

      const newTx: Transaction = {
        id: `TX-AI-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: cleanTitle,
        amount: cleanAmount,
        type: cleanType,
        category: finalCategory,
        date: cleanDate,
        note: tx?.note
      }

      // Update Categories jika belum ada
      if (!existingCat) {
        const updatedCats = [...categories, finalCategory]
        setCategories(updatedCats)
        try {
          localStorage.setItem('kasku_categories_v2', JSON.stringify(updatedCats))
        } catch (e) {
          console.error(e)
        }
      }

      // Update Transactions langsung ke State dan simpan ke LocalStorage seketika
      setTransactions(prev => {
        const updatedTxList = [newTx, ...prev]
        try {
          localStorage.setItem('kasku_transactions_v2', JSON.stringify(updatedTxList))
        } catch (e) {
          console.error('Direct LocalStorage save error:', e)
        }
        return updatedTxList
      })

      // Reset filter dan alihkan ke Overview agar data baru langsung terlihat di layar
      setFilterType('all')
      setFilterCat('all')
      setSearchQuery('')
      setActiveTab('overview')

      showToast(`Berhasil menyimpan ${cleanType === 'income' ? 'pemasukan' : 'pengeluaran'} "${cleanTitle}"`)
    } catch (err) {
      console.error('Error in handleSaveVoiceTransaction:', err)
      showToast('Gagal menyimpan transaksi!')
    }
  }

  // Filtered List
  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === 'all' || t.type === filterType
    const matchCat = filterCat === 'all' || t.category === filterCat
    const matchQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchType && matchCat && matchQuery
  })

  // Category Analytics Breakdown
  const expenseByCategory = transactions
    .filter(t => t && t.type === 'expense')
    .reduce((acc: { [key: string]: number }, curr) => {
      const cat = curr?.category || 'Lain-lain'
      acc[cat] = (acc[cat] || 0) + (Number(curr?.amount) || 0)
      return acc
    }, {})

  const incomeByCategory = transactions
    .filter(t => t && t.type === 'income')
    .reduce((acc: { [key: string]: number }, curr) => {
      const cat = curr?.category || 'Lain-lain'
      acc[cat] = (acc[cat] || 0) + (Number(curr?.amount) || 0)
      return acc
    }, {})

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 pb-28 md:pb-10 app-protected select-none">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        onExport={handleExportCSV}
        onOpenAddModal={() => setIsModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        transactionCount={transactions.length}
        savingsCount={savings.length}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6" style={{ transform: 'translateZ(0)' }}>
        
        {/* TAB 1: OVERVIEW (HALAMAN UTAMA) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* TOP SUMMARY STATS - Ultra-Premium Modern Fintech Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
              
              {/* Card 1: Saldo Kas Bersih (Emerald / Mint Luxury) */}
              <div className="relative group overflow-hidden rounded-[24px] bg-gradient-to-b from-white to-emerald-50/30 p-4 sm:p-5 border border-emerald-500/25 shadow-[0_4px_24px_-4px_rgba(16,185,129,0.12)] hover:shadow-[0_12px_32px_-6px_rgba(16,185,129,0.22)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] sm:min-h-[170px]">
                {/* Ambient Soft Mesh Gradient & Glass Shimmer */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Card Header: Title & Icon */}
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-emerald-100"></span>
                    </span>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-950/80">
                      Saldo Kas
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/25 shadow-xs shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <WalletIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body: Main Amount & Compact Hint */}
                <div className="my-auto py-2 relative z-10">
                  <div 
                    title={formatRupiah(netBalance)}
                    className={`font-black tracking-tight font-display truncate leading-none ${
                      Math.abs(netBalance) >= 1_000_000_000 
                        ? 'text-base sm:text-xl lg:text-2xl' 
                        : Math.abs(netBalance) >= 100_000_000 
                        ? 'text-lg sm:text-2xl' 
                        : 'text-xl sm:text-2xl lg:text-[26px]'
                    } ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}
                  >
                    {formatRupiah(netBalance)}
                  </div>
                  <div className="h-4.5 flex items-center mt-1">
                    {Math.abs(netBalance) >= 1_000_000 ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700/70 block truncate font-display">
                        ≈ {formatRupiahCompact(netBalance)}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block truncate">
                        Sisa uang tunai
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status Pill Badge */}
                <div className="pt-1.5 relative z-10 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold border border-emerald-500/20 truncate shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Kas Siap Pakai
                  </span>
                </div>
              </div>

              {/* Card 2: Celengan Impian (Warm Amber & Gold) */}
              <div 
                onClick={() => setActiveTab('savings')}
                className="relative group overflow-hidden rounded-[24px] bg-gradient-to-b from-white to-amber-50/30 p-4 sm:p-5 border border-amber-500/25 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.12)] hover:shadow-[0_12px_32px_-6px_rgba(245,158,11,0.22)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[170px] active:scale-[0.98]"
              >
                {/* Ambient Soft Mesh Gradient & Glass Shimmer */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-100"></span>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-950/80">
                      Celengan
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/25 shadow-xs shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <CutePiggyIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="my-auto py-2 relative z-10">
                  <div 
                    title={formatRupiah(totalSavings)}
                    className={`font-black tracking-tight font-display text-amber-600 truncate leading-none ${
                      totalSavings >= 1_000_000_000 
                        ? 'text-base sm:text-xl lg:text-2xl' 
                        : totalSavings >= 100_000_000 
                        ? 'text-lg sm:text-2xl' 
                        : 'text-xl sm:text-2xl lg:text-[26px]'
                    }`}
                  >
                    {formatRupiah(totalSavings)}
                  </div>
                  <div className="h-4.5 flex items-center mt-1">
                    {totalSavings >= 1_000_000 ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-700/70 block truncate font-display">
                        ≈ {formatRupiahCompact(totalSavings)}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block truncate">
                        Target tabungan
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Target Count & Action Arrow */}
                <div className="pt-1.5 relative z-10 flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 text-[10px] sm:text-[11px] font-extrabold border border-amber-500/20 truncate shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {savings.length} Target
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-black text-amber-600 group-hover:text-amber-700 flex items-center gap-0.5 shrink-0 transition-transform group-hover:translate-x-0.5">
                    Buka &rarr;
                  </span>
                </div>
              </div>

              {/* Card 3: Total Pemasukan (Teal / Cyan Crystal) */}
              <div className="relative group overflow-hidden rounded-[24px] bg-gradient-to-b from-white to-teal-50/30 p-4 sm:p-5 border border-teal-500/25 shadow-[0_4px_24px_-4px_rgba(20,184,166,0.12)] hover:shadow-[0_12px_32px_-6px_rgba(20,184,166,0.22)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] sm:min-h-[170px]">
                {/* Ambient Soft Mesh Gradient & Glass Shimmer */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-100"></span>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-teal-950/80">
                      Pemasukan
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/25 shadow-xs shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="my-auto py-2 relative z-10">
                  <div 
                    title={formatRupiah(totalIncome)}
                    className={`font-black tracking-tight font-display text-teal-600 truncate leading-none ${
                      totalIncome >= 1_000_000_000 
                        ? 'text-base sm:text-xl lg:text-2xl' 
                        : totalIncome >= 100_000_000 
                        ? 'text-lg sm:text-2xl' 
                        : 'text-xl sm:text-2xl lg:text-[26px]'
                    }`}
                  >
                    +{formatRupiah(totalIncome)}
                  </div>
                  <div className="h-4.5 flex items-center mt-1">
                    {totalIncome >= 1_000_000 ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-teal-700/70 block truncate font-display">
                        ≈ +{formatRupiahCompact(totalIncome)}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block truncate">
                        Arus masuk kas
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-1.5 relative z-10 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-900 text-[10px] sm:text-[11px] font-extrabold border border-teal-500/20 truncate shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    {transactions.filter(t => t.type === 'income').length} Transaksi
                  </span>
                </div>
              </div>

              {/* Card 4: Total Pengeluaran (Rose / Ruby Clean) */}
              <div className="relative group overflow-hidden rounded-[24px] bg-gradient-to-b from-white to-rose-50/30 p-4 sm:p-5 border border-rose-500/25 shadow-[0_4px_24px_-4px_rgba(244,63,94,0.12)] hover:shadow-[0_12px_32px_-6px_rgba(244,63,94,0.22)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] sm:min-h-[170px]">
                {/* Ambient Soft Mesh Gradient & Glass Shimmer */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-100"></span>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-rose-950/80">
                      Pengeluaran
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center ring-1 ring-rose-500/25 shadow-xs shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="my-auto py-2 relative z-10">
                  <div 
                    title={formatRupiah(totalExpense)}
                    className={`font-black tracking-tight font-display text-rose-600 truncate leading-none ${
                      totalExpense >= 1_000_000_000 
                        ? 'text-base sm:text-xl lg:text-2xl' 
                        : totalExpense >= 100_000_000 
                        ? 'text-lg sm:text-2xl' 
                        : 'text-xl sm:text-2xl lg:text-[26px]'
                    }`}
                  >
                    -{formatRupiah(totalExpense)}
                  </div>
                  <div className="h-4.5 flex items-center mt-1">
                    {totalExpense >= 1_000_000 ? (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-700/70 block truncate font-display">
                        ≈ -{formatRupiahCompact(totalExpense)}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block truncate">
                        Arus keluar kas
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-1.5 relative z-10 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-900 text-[10px] sm:text-[11px] font-extrabold border border-rose-500/20 truncate shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    {transactions.filter(t => t.type === 'expense').length} Transaksi
                  </span>
                </div>
              </div>

            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* FORM INPUT DESKTOP */}
              <div className="hidden lg:block lg:col-span-5 space-y-6">
                <div className="surface-card rounded-[28px] p-6 relative">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                        <BanknotesIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Pencatatan Kas</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tersimpan lokal di perangkat</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Offline First
                    </span>
                  </div>

                  <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#767680]/12">
                      <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                          type === 'income'
                            ? 'bg-white text-emerald-600 shadow-ios-sm scale-[1.01]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <PlusCircleIcon className="w-4 h-4 text-emerald-600" />
                        <span>Kas Masuk</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                          type === 'expense'
                            ? 'bg-white text-rose-600 shadow-ios-sm scale-[1.01]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <MinusCircleIcon className="w-4 h-4 text-rose-600" />
                        <span>Pengeluaran</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-bold block text-[11px] uppercase tracking-wider">Keterangan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Honor Coding, Makan Siang, Sewa Server"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl kas-input text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-bold block text-[11px] uppercase tracking-wider">Nominal (Rp) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          required
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl kas-input text-xs font-mono font-extrabold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block text-[11px] uppercase tracking-wider">Kategori</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-2xl kas-input text-xs font-medium cursor-pointer"
                        >
                          {categories.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block text-[11px] uppercase tracking-wider">Tanggal</label>
                        <input
                          type="date"
                          value={txDate}
                          onChange={(e) => setTxDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-2xl kas-input text-xs font-mono font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-bold block text-[11px] uppercase tracking-wider">Catatan Tambahan (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Nomor invoice, catatan kecil, dll"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl kas-input text-xs font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3.5 rounded-2xl font-extrabold text-xs tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-ios ${
                        type === 'income' 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' 
                          : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white'
                      }`}
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      <span>{type === 'income' ? 'Simpan Kas Masuk' : 'Simpan Pengeluaran'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* DAFTAR MUTASI TRANSAKSI - iOS Inset Grouped List Look */}
              <div className="lg:col-span-7 space-y-4 w-full">
                <div className="surface-card rounded-[28px] p-5 sm:p-6 space-y-5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Riwayat Mutasi Kas</h2>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Menampilkan {filteredTransactions.length} dari {transactions.length} mutasi
                        </p>
                      </div>

                      {/* Tombol Catat Transaksi Cepat di Mobile */}
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-extrabold shadow-sm active:scale-95 transition-all touch-manipulation cursor-pointer"
                      >
                        <PlusIcon className="w-3.5 h-3.5 stroke-[2.8]" />
                        <span>Catat Kas</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* iOS Segmented Filter */}
                      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#767680]/12 text-[11px] font-bold">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`px-3 py-1 rounded-xl transition-all duration-200 ${
                            filterType === 'all' ? 'bg-white text-slate-900 shadow-ios-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => setFilterType('income')}
                          className={`px-3 py-1 rounded-xl transition-all duration-200 ${
                            filterType === 'income' ? 'bg-white text-emerald-600 shadow-ios-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Masuk
                        </button>
                        <button
                          onClick={() => setFilterType('expense')}
                          className={`px-3 py-1 rounded-xl transition-all duration-200 ${
                            filterType === 'expense' ? 'bg-white text-rose-600 shadow-ios-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Keluar
                        </button>
                      </div>

                      {/* Tombol Ekspor Excel Cepat */}
                      {transactions.length > 0 && (
                        <button
                          onClick={handleExportExcel}
                          title="Ekspor Laporan Excel Berwarna (.xls)"
                          className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-ios-sm"
                        >
                          <TableCellsIcon className="w-4 h-4 text-emerald-600" />
                          <span className="hidden sm:inline">Excel</span>
                        </button>
                      )}
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                  <div className="sm:col-span-7 relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari keterangan atau catatan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl kas-input text-xs font-medium"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <select
                      value={filterCat}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl kas-input text-xs font-medium cursor-pointer"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map((c, i) => (
                        <option key={i} value={c} className="bg-white text-slate-800">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* List Mutasi iOS Inset Grouped Table Row */}
                <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-14 text-center space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-slate-100/80 mx-auto flex items-center justify-center text-slate-400">
                        <WalletIcon className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                        {transactions.length === 0
                          ? 'Belum ada catatan mutasi. Ketuk tombol tambah (+) di bawah untuk mulai mencatat keuangan Anda!'
                          : 'Tidak ada transaksi yang cocok dengan filter Anda.'}
                      </p>
                      {transactions.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsModalOpen(true)
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-ios transition active:scale-95"
                        >
                          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                          <span>Catat Transaksi Pertama</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div key={tx.id} className="py-3 px-2 flex items-center justify-between gap-3 group transition-colors hover:bg-[#f2f2f7]/80 rounded-2xl">
                        
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0 border ${
                              tx.type === 'income'
                                ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600'
                                : 'bg-rose-500/15 border-rose-500/20 text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <ArrowTrendingUpIcon className="w-5 h-5" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5" />
                            )}
                          </div>

                          <div className="truncate space-y-0.5">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {tx.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-sans font-semibold">
                                {tx.category}
                              </span>
                              <span>&bull;</span>
                              <span>{tx.date}</span>
                              {tx.note && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-slate-400 truncate max-w-[140px] font-sans italic">{tx.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              title={formatRupiah(tx.amount)}
                              className={`font-mono font-black tracking-tight leading-none ${
                                tx.amount >= 1_000_000_000
                                  ? 'text-[11px] sm:text-xs'
                                  : 'text-xs sm:text-sm'
                              } ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                            </span>
                            {tx.amount >= 10_000_000 && (
                              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                                ≈ {tx.type === 'income' ? '+' : '-'}{formatRupiahCompact(tx.amount)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditTransaction(tx)}
                              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition active:scale-90 shrink-0"
                              title="Edit Transaksi"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTransaction(tx.id, tx.title)}
                              className="w-7 h-7 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-300 hover:text-rose-600 transition active:scale-90 shrink-0"
                              title="Hapus Transaksi"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
        )}

        {/* TAB 2: TABUNGAN & CELENGAN TARGET */}
        {activeTab === 'savings' && (
          <ErrorBoundary>
            <SavingsSection
              savings={savings}
              setSavings={setSavings}
              showToast={showToast}
              formatRupiah={formatRupiah}
              onAutoRecordTransaction={handleAutoRecordFromSavings}
              onRequestDeleteGoal={handleRequestDeleteGoal}
            />
          </ErrorBoundary>
        )}

        {/* TAB 3: ANALYTICS (Diagram Donut Interaktif & Pisah Pemasukan/Pengeluaran) */}
        {activeTab === 'analytics' && (
          <ErrorBoundary>
            <AnalyticsSection
              transactions={transactions}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              formatRupiah={formatRupiah}
              formatRupiahCompact={formatRupiahCompact}
            />
          </ErrorBoundary>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-2xl mx-auto space-y-5 animate-slide-up pb-10">
            {/* Header Card */}
            <div className="surface-card rounded-[28px] p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center shadow-ios-sm shrink-0">
                  <TagIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Kategori Transaksi</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Atur kategori pengeluaran dan pemasukan keuangan Anda
                  </p>
                </div>
              </div>

              {/* Add Input iOS Bar */}
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Nama kategori baru (cth: Langganan AI, Skincare)..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F2F2F7] border border-black/5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-xs shadow-ios-sm transition flex items-center justify-center gap-2 shrink-0"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
              </form>
            </div>

            {/* List Group iOS Style */}
            <div className="surface-card rounded-[28px] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Daftar Kategori Aktif ({categories.length})
                </label>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  Siap Digunakan
                </span>
              </div>

              <div className="divide-y divide-slate-100/80 rounded-2xl bg-[#F2F2F7]/70 border border-black/5 overflow-hidden">
                {categories.length === 0 ? (
                  <div className="p-8 text-center space-y-1.5">
                    <p className="text-xs font-bold text-slate-400">Belum ada kategori</p>
                    <p className="text-[11px] text-slate-400">Ketik nama kategori di atas untuk menambahkan kategori kustom Anda</p>
                  </div>
                ) : (
                  categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 sm:px-4 bg-white/70 hover:bg-white transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-800 break-words line-clamp-2 leading-relaxed">
                        {cat}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition flex items-center justify-center shrink-0 active:scale-95"
                      title="Hapus Kategori"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Nav for Mobile / APK */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        onOpenAddModal={() => setIsModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
      />

      {/* Add & Edit Transaction Modal (Bottom Sheet Slide from bottom) */}
      <ErrorBoundary>
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTx(null)
            setTitle('')
            setAmount('')
            setNote('')
          }}
          onAddTransaction={handleAddTransaction}
          type={type}
          setType={setType}
          title={title}
          setTitle={setTitle}
          amount={amount}
          setAmount={setAmount}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          txDate={txDate}
          setTxDate={setTxDate}
          note={note}
          setNote={setNote}
          onOpenCategoriesTab={() => setActiveTab('categories')}
          isEditing={Boolean(editingTx)}
        />
      </ErrorBoundary>

      {/* Modern Custom Confirm Modal (Replaces browser window.confirm) */}
      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Settings Modal (Backup JSON, Restore JSON, Reset LocalStorage, Export Excel) */}
      <ErrorBoundary>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          transactions={transactions}
          savings={savings}
          categories={categories}
          onImportAllData={handleImportAllData}
          onClearAllData={handleClearAllData}
          onOpenOnboarding={() => setShowOnboarding(true)}
          showToast={showToast}
        />
      </ErrorBoundary>

      {/* Voice AI Transaction Modal (Catat Kas Lewat Suara AI) */}
      <ErrorBoundary>
        <VoiceAITransactionModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onSaveTransaction={handleSaveVoiceTransaction}
          categories={categories}
          showToast={showToast}
        />
      </ErrorBoundary>

      {/* Force Update Modal (Kunci Akses Jika Versi Lama & Wajib Update) */}
      <ForceUpdateModal
        updateInfo={updateInfo}
        onDismiss={() => setUpdateInfo(null)}
      />

      {/* Onboarding Panduan Aplikasi Bertahap (Sebelum Masuk ke Aplikasi) */}
      <OnboardingModal
        isOpen={showOnboarding}
        appVersion={APP_CURRENT_VERSION}
        onFinish={() => {
          setShowOnboarding(false)
          try {
            localStorage.setItem('kasku_has_onboarded_v1', 'true')
          } catch (e) {
            console.error(e)
          }
        }}
      />

      {/* Support Developer Modal (Otomatis Hilang 3 Detik / Dari Pengaturan) */}
      <SupportDevModal
        isOpen={showSupportDevModal}
        onClose={() => setShowSupportDevModal(false)}
        autoCloseSeconds={3}
      />

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-mono mt-auto">
        <p>KasKu &bull; Simpan Lokal di HP &bull; Offline First</p>
      </footer>

    </div>
  )
}
