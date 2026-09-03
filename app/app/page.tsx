'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import AddTransactionModal from '@/components/AddTransactionModal'
import SettingsModal from '@/components/SettingsModal'
import VoiceAITransactionModal from '@/components/VoiceAITransactionModal'
import ForceUpdateModal, { UpdateInfo } from '@/components/ForceUpdateModal'
import OnboardingModal from '@/components/OnboardingModal'
import SavingsSection, { SavingGoal } from '@/components/SavingsSection'
import ConfirmModal, { ConfirmDialogState } from '@/components/ConfirmModal'
import SupportDevModal from '@/components/SupportDevModal'
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
  RocketIcon
} from '@/components/Icons'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  note?: string
}

const DEFAULT_CATEGORIES = [
  'Lain-lain'
]

// Versi aplikasi yang terinstall saat ini
const APP_CURRENT_VERSION = '1.1.2'

export default function KaskuApp() {
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'analytics' | 'categories'>('overview')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setCategories(parsedCats)
          setSelectedCategory(parsedCats[0])
        } else {
          setSelectedCategory(DEFAULT_CATEGORIES[0])
        }
      } else {
        setSelectedCategory(DEFAULT_CATEGORIES[0])
      }

      // Cek apakah user baru pertama kali membuka web/aplikasi
      const hasOnboarded = localStorage.getItem('kasku_has_onboarded_v1')
      if (!hasOnboarded) {
        setShowOnboarding(true)
      }

      // Notif Support Developer 5 detik setelah masuk (Hanya muncul sekali seumur hidup)
      const hasSeenSupportDev = localStorage.getItem('kasku_support_dev_notified_v1')
      if (!hasSeenSupportDev) {
        setTimeout(() => {
          setShowSupportDevModal(true)
          try {
            localStorage.setItem('kasku_support_dev_notified_v1', 'true')
          } catch (err) {
            console.error(err)
          }
        }, 5000)
      }

      setTxDate(new Date().toISOString().split('T')[0])
    } catch (e) {
      console.error('Failed reading localStorage', e)
    } finally {
      setIsLoaded(true)
    }

    // Cek Pembaruan Aplikasi secara otomatis (OTA Update Checker & Strict Force Update)
    const checkAppUpdate = async () => {
      const endpoints = [
        'https://kasku.kheireditz.my.id/api/version',
        'https://kasku.kheireditz.my.id/version.json',
        `/api/version?t=${Date.now()}`,
        `/version.json?t=${Date.now()}`
      ]

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)
          const res = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`, {
            signal: controller.signal
          })
          clearTimeout(timeoutId)

          if (res.ok) {
            const data = await res.json()
            if (data && data.latestVersion) {
              const isOutdated = data.latestVersion !== APP_CURRENT_VERSION
              if (isOutdated) {
                let targetUrl = data.updateUrl || 'https://kasku.kheireditz.my.id/download'
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                  targetUrl = `https://kasku.kheireditz.my.id${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`
                }

                setUpdateInfo({
                  isOutdated: true,
                  currentVersion: APP_CURRENT_VERSION,
                  latestVersion: data.latestVersion,
                  forceUpdate: true,
                  releaseNotes: data.releaseNotes || 'Pembaruan sistem terbaru wajib diunduh untuk melanjutkan penggunaan KasKu.',
                  updateUrl: targetUrl
                })
                break // Update info ditemukan, hentikan loop
              }
            }
          }
        } catch (err) {
          // Lanjut ke endpoint berikutnya
        }
      }
    }

    checkAppUpdate()

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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val)
  }

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const netBalance = totalIncome - totalExpense

  const totalSavings = savings.reduce((acc, curr) => acc + curr.currentAmount, 0)

  // Handle Add Transaction
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
    setNewCatInput('')
    if (!selectedCategory) setSelectedCategory(trimmed)
    showToast(`Kategori "${trimmed}" ditambahkan`)
  }

  // Handle Delete Custom Category
  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      showToast('Minimal harus ada 1 kategori')
      return
    }
    
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

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return
    const headers = ['ID,Tanggal,Tipe,Kategori,Keterangan,Nominal,Catatan']
    const rows = transactions.map(t => {
      return `"${t.id}","${t.date}","${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}","${t.category}","${t.title.replace(/"/g, '""')}","${t.amount}","${(t.note || '').replace(/"/g, '""')}"`
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `kasku-laporan-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Laporan CSV berhasil di-download!')
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

          // Simpan default kategori tunggal 'Lain-lain'
          localStorage.setItem('kasku_transactions_v2', JSON.stringify([]))
          localStorage.setItem('kasku_savings_v1', JSON.stringify([]))
          localStorage.setItem('kasku_categories_v2', JSON.stringify(['Lain-lain']))
        } catch (e) {
          console.error(e)
        }

        // Update semua React State secara langsung
        setTransactions([])
        setSavings([])
        setCategories(['Lain-lain'])
        setSelectedCategory('Lain-lain')
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
    // Cek apakah kategori sudah ada (case-insensitive & trim) agar disatukan dan tidak dobel
    const cleanCat = (tx.category || 'Lain-lain').trim()
    const existingCat = categories.find(c => c.toLowerCase() === cleanCat.toLowerCase())

    const finalCategory = existingCat || cleanCat

    const newTx: Transaction = {
      id: `TX-AI-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: finalCategory,
      date: tx.date,
      note: tx.note
    }

    // Jika belum ada sama sekali, tambahkan ke daftar kategori
    if (!existingCat) {
      const updatedCats = [...categories, finalCategory]
      setCategories(updatedCats)
      try {
        localStorage.setItem('kasku_categories_v2', JSON.stringify(updatedCats))
      } catch (e) {
        console.error(e)
      }
    }

    setTransactions(prev => [newTx, ...prev])
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
    .filter(t => t.type === 'expense')
    .reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount
      return acc
    }, {})

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount
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

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* TAB 1: OVERVIEW (HALAMAN UTAMA) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-slide-up">
            {/* TOP SUMMARY STATS - HANYA DI HALAMAN UTAMA */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card Saldo Kas Bersih */}
              <div className="surface-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Saldo Kas</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <WalletIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {formatRupiah(netBalance)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Kas Siap Pakai</span>
                  </span>
                </div>
              </div>

              {/* Card Tabungan */}
              <div 
                onClick={() => setActiveTab('savings')}
                className="surface-card rounded-2xl p-5 relative cursor-pointer hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Total Celengan</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CutePiggyIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-600">
                    {formatRupiah(totalSavings)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                    <span>{savings.length} Target</span>
                    <span className="text-amber-600 underline font-sans text-[10px] font-semibold">Buka &rarr;</span>
                  </span>
                </div>
              </div>

              {/* Card Pemasukan */}
              <div className="surface-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Total Masuk</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-teal-600">
                    +{formatRupiah(totalIncome)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{transactions.filter(t => t.type === 'income').length} Transaksi</span>
                </div>
              </div>

              {/* Card Pengeluaran */}
              <div className="surface-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Pengeluaran</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-rose-600">
                    -{formatRupiah(totalExpense)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{transactions.filter(t => t.type === 'expense').length} Transaksi</span>
                </div>
              </div>

            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* FORM INPUT DESKTOP */}
              <div className="hidden lg:block lg:col-span-5 space-y-6">
                <div className="surface-card rounded-2xl p-6 relative">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BanknotesIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-wide">Pencatatan Kas</h2>
                        <p className="text-[11px] text-slate-500">Tersimpan lokal di HP</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Offline Sync
                    </span>
                  </div>

                  <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                          type === 'income'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        <span>Kas Masuk</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                          type === 'expense'
                            ? 'bg-white text-rose-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <MinusCircleIcon className="w-4 h-4" />
                        <span>Pengeluaran</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold block">Keterangan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Honor Coding, Makan Siang, Sewa Server"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-semibold block">Nominal (Rp) *</label>
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
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl kas-input text-xs font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-700 font-semibold">Kategori</label>
                          <button
                            type="button"
                            onClick={() => setActiveTab('categories')}
                            className="text-[10px] text-emerald-600 font-medium hover:underline"
                          >
                            + Kustom
                          </button>
                        </div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl kas-input text-xs"
                        >
                          {categories.map((cat, idx) => (
                            <option key={idx} value={cat} className="bg-white text-slate-800">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-semibold block">Tanggal</label>
                        <input
                          type="date"
                          value={txDate}
                          onChange={(e) => setTxDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl kas-input text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Catatan Tambahan (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Nomor invoice, catatan pembayaran, dll"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                        type === 'income' ? 'btn-primary' : 'btn-danger'
                      }`}
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      <span>{type === 'income' ? 'Simpan Kas Masuk' : 'Simpan Pengeluaran'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* DAFTAR MUTASI TRANSAKSI */}
              <div className="lg:col-span-7 space-y-4 w-full">
                <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Riwayat Mutasi Kas</h2>
                      <p className="text-[11px] text-slate-500">
                        Menampilkan {filteredTransactions.length} dari {transactions.length} mutasi
                      </p>
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-semibold self-start sm:self-auto">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 rounded-lg transition ${
                          filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => setFilterType('income')}
                        className={`px-3 py-1 rounded-lg transition ${
                          filterType === 'income' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Masuk
                      </button>
                      <button
                        onClick={() => setFilterType('expense')}
                        className={`px-3 py-1 rounded-lg transition ${
                          filterType === 'expense' ? 'bg-white text-rose-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Keluar
                      </button>
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                  <div className="sm:col-span-7 relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl kas-input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <select
                      value={filterCat}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl kas-input text-xs"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map((c, i) => (
                        <option key={i} value={c} className="bg-white text-slate-800">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-14 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                        <WalletIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                        {transactions.length === 0
                          ? 'Belum ada catatan mutasi. Ketuk tombol tambah (+) untuk mulai mencatat keuangan Anda!'
                          : 'Tidak ada transaksi yang cocok dengan filter Anda.'}
                      </p>
                      {transactions.length === 0 && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-xs font-bold"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Catat Transaksi Pertama</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div key={tx.id} className="py-3 px-2.5 flex items-center justify-between gap-3 group transition-colors hover:bg-slate-50 rounded-xl">
                        
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              tx.type === 'income'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                : 'bg-rose-50 border-rose-100 text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <ArrowTrendingUpIcon className="w-5 h-5" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5" />
                            )}
                          </div>

                          <div className="truncate space-y-0.5">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {tx.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-sans font-medium">
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

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span
                            className={`font-mono font-bold text-xs sm:text-sm tracking-tight ${
                              tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </span>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id, tx.title)}
                            className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition"
                            title="Hapus Transaksi"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
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
          <SavingsSection
            savings={savings}
            setSavings={setSavings}
            showToast={showToast}
            formatRupiah={formatRupiah}
            onAutoRecordTransaction={handleAutoRecordFromSavings}
            onRequestDeleteGoal={handleRequestDeleteGoal}
          />
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-slide-up">
            <div className="surface-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                  <ChartPieIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Analisis Distribusi Kas</h2>
                  <p className="text-xs text-slate-500">Peta perbandingan alokasi pengeluaran dan arus kas masuk</p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-mono">
                  Belum ada data transaksi untuk dianalisis.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Pengeluaran Menurut Kategori
                    </h3>

                    <div className="space-y-2.5">
                      {Object.keys(expenseByCategory).length === 0 ? (
                        <p className="text-xs text-slate-400 font-mono">Belum ada pengeluaran</p>
                      ) : (
                        Object.entries(expenseByCategory).map(([cat, total]) => {
                          const percent = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : '0'
                          return (
                            <div key={cat} className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700">{cat}</span>
                                <span className="font-mono font-bold text-rose-600">
                                  {formatRupiah(total)} <span className="text-[10px] text-slate-400 font-normal">({percent}%)</span>
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                      Pemasukan Menurut Kategori
                    </h3>

                    <div className="space-y-2.5">
                      {Object.keys(incomeByCategory).length === 0 ? (
                        <p className="text-xs text-slate-400 font-mono">Belum ada pemasukan</p>
                      ) : (
                        Object.entries(incomeByCategory).map(([cat, total]) => {
                          const percent = totalIncome > 0 ? ((total / totalIncome) * 100).toFixed(1) : '0'
                          return (
                            <div key={cat} className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700">{cat}</span>
                                <span className="font-mono font-bold text-teal-600">
                                  {formatRupiah(total)} <span className="text-[10px] text-slate-400 font-normal">({percent}%)</span>
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
            <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <TagIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Kelola & Kustom Kategori</h2>
                  <p className="text-xs text-slate-500">
                    Tambah kategori baru sesuai kebutuhan pencatatan Anda
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Nama kategori baru (cth: Langganan AI, Servis Motor)..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl kas-input text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </form>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Daftar Kategori Aktif ({categories.length})
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 group hover:border-purple-300 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-xs font-semibold text-slate-800">{cat}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Hapus Kategori"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
      />

      {/* Modern Custom Confirm Modal (Replaces browser window.confirm) */}
      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Settings Modal (Backup JSON, Restore JSON, Reset LocalStorage) */}
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

      {/* Voice AI Transaction Modal (Catat Kas Lewat Suara AI) */}
      <VoiceAITransactionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveTransaction={handleSaveVoiceTransaction}
        categories={categories}
        showToast={showToast}
      />

      {/* Force Update Modal (Kunci Akses Jika Versi Lama & Wajib Update) */}
      <ForceUpdateModal
        updateInfo={updateInfo}
      />

      {/* Onboarding Panduan Aplikasi Bertahap (Sebelum Masuk ke Aplikasi) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onFinish={() => {
          setShowOnboarding(false)
          try {
            localStorage.setItem('kasku_has_onboarded_v1', 'true')
          } catch (e) {
            console.error(e)
          }
        }}
      />

      {/* Support Developer Modal (Otomatis 5 Detik Pertama Kali / Dari Pengaturan) */}
      <SupportDevModal
        isOpen={showSupportDevModal}
        onClose={() => setShowSupportDevModal(false)}
      />

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-mono mt-auto">
        <p>KasKu &bull; Simpan Lokal di HP &bull; Offline First</p>
      </footer>

    </div>
  )
}
