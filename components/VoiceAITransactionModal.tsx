'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MicrophoneIcon,
  SparklesIcon,
  CheckCircleIcon
} from './Icons'
import { formatThousands } from './currencyUtils'

interface VoiceAITransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveTransaction: (tx: {
    title: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    note?: string
  }) => void
  categories: string[]
  showToast: (msg: string) => void
}

export default function VoiceAITransactionModal({
  isOpen,
  onClose,
  onSaveTransaction,
  categories,
  showToast
}: VoiceAITransactionModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)

  // Hasil Ekstraksi AI
  const [detectedTitle, setDetectedTitle] = useState('')
  const [detectedAmount, setDetectedAmount] = useState<number | ''>('')
  const [detectedType, setDetectedType] = useState<'income' | 'expense'>('expense')
  const [detectedCategory, setDetectedCategory] = useState(categories[0] || 'Lain-lain')
  const [hasParsed, setHasParsed] = useState(false)

  const recognitionRef = useRef<any>(null)
  const [manualInput, setManualInput] = useState('')

  const onSaveRef = useRef(onSaveTransaction)
  onSaveRef.current = onSaveTransaction
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast
  const parseRef = useRef<(text: string, isFromVoice?: boolean) => void>(() => {})
  const resetFormRef = useRef<() => void>(() => {})
  const scrollableSheetRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasNativeBridge = typeof (window as any).AndroidVoiceBridge !== 'undefined' || typeof (window as any).AndroidVoice !== 'undefined'
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition && !hasNativeBridge) {
        setIsSupported(false)
      } else {
        setIsSupported(true)
      }

      // Daftarkan listener native event dari Android APK
      ;(window as any).onSpeechReady = () => {
        console.log('[VoiceAI] onSpeechReady triggered')
        setIsListening(true)
      }
      ;(window as any).onSpeechBegin = () => {
        console.log('[VoiceAI] onSpeechBegin triggered')
        setIsListening(true)
      }
      const handleSpeechText = (text: string) => {
        console.log('[Voice Bridge] callback terpanggil dengan teks:', text)
        console.log('Voice transcript diterima:', text)
        setIsListening(false)
        if (text && text.trim()) {
          setTranscript(text)
          parseRef.current(text, true)
        } else {
          console.warn('[VoiceAI] Transcript kosong atau null')
        }
      }
      ;(window as any).onSpeechResult = handleSpeechText
      ;(window as any).onVoiceResult = handleSpeechText
      ;(window as any).onSpeechEnd = () => {
        console.log('[VoiceAI] onSpeechEnd triggered')
        setIsListening(false)
      }
      ;(window as any).onSpeechError = (errMsg: string) => {
        console.error('[VoiceAI] onSpeechError:', errMsg)
        setIsListening(false)
        if (errMsg) showToast(errMsg)
      }
    }
  }, [])

  // Reset state form agar selalu bersih dari data lama
  const resetForm = () => {
    setTranscript('')
    setDetectedTitle('')
    setDetectedAmount('')
    setDetectedType('expense')
    setDetectedCategory(categories[0] || 'Makanan & Minuman')
    setHasParsed(false)
    setIsListening(false)
    setManualInput('')
  }
  resetFormRef.current = resetForm

  // Lock body scroll dan reset data setiap modal dibuka / ditutup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      resetForm()
    } else {
      document.body.style.overflow = 'unset'
      resetForm()
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Gesture tarik ke bawah (drag down to dismiss)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isBackdropTouchRef = useRef(false)
  const mountTimeRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      mountTimeRef.current = Date.now()
    }
  }, [isOpen])

  console.log('[VoiceAI] Render check - isOpen:', isOpen, 'hasParsed:', hasParsed)

  if (!isOpen) return null

  // Natural Language Parser Cerdas Bahasa Indonesia
  const parseNaturalLanguage = (text: string, isFromVoice: boolean = false) => {
    console.log('[Parser] Mulai parsing:', text, 'isFromVoice:', isFromVoice)
    const lower = text.toLowerCase().trim()

    // 1. Deteksi Tipe (Masuk / Keluar)
    let txType: 'income' | 'expense' = 'expense'
    const incomeKeywords = ['gaji', 'honor', 'dapat', 'terima', 'masuk', 'tf masuk', 'transfer masuk', 'jual', 'penjualan', 'untung', 'bonus', 'angpau', 'hadiah', 'kembalian', 'omset', 'pendapatan']
    if (incomeKeywords.some(kw => lower.includes(kw))) {
      txType = 'income'
    }

    // 2. Deteksi Nominal Uang
    let amount = 0
    const millionMatch = lower.match(/(\d+[\.,]?\d*)\s*(juta|jt)/)
    const thousandMatch = lower.match(/(\d+[\.,]?\d*)\s*(ribu|rb|k)/)
    const plainNumberMatch = lower.match(/(?:rp\.?|sebesar|sejumlah)?\s*(\d{1,3}(?:[.,]\d{3})+|\d+)/)

    if (millionMatch) {
      amount = parseFloat(millionMatch[1].replace(',', '.')) * 1000000
    } else if (thousandMatch) {
      amount = parseFloat(thousandMatch[1].replace(',', '.')) * 1000
    } else if (plainNumberMatch && parseInt(plainNumberMatch[1].replace(/[.,]/g, ''), 10) > 0) {
      amount = parseInt(plainNumberMatch[1].replace(/[.,]/g, ''), 10)
    }

    // Parser Terbilang Bahasa Indonesia Cerdas (cth: "dua puluh lima ribu", "tiga puluh ribu", "seratus lima puluh ribu")
    if (amount === 0) {
      const wordNums: { [key: string]: number } = {
        'se': 1, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
        'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10
      }
      const tokens = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      let total = 0
      let currentGroup = 0

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]
        if (/^\d+$/.test(t)) {
          currentGroup += parseInt(t, 10)
        } else if (t === 'se') {
          const next = tokens[i + 1]
          if (next === 'ratus') { currentGroup += 100; i++ }
          else if (next === 'puluh') { currentGroup += 10; i++ }
          else if (next === 'belas') { currentGroup += 11; i++ }
          else if (next === 'ribu') { total += (currentGroup || 1) * 1000; currentGroup = 0; i++ }
          else if (next === 'juta') { total += (currentGroup || 1) * 1000000; currentGroup = 0; i++ }
          else { currentGroup += 1 }
        } else if (t === 'seratus') {
          currentGroup += 100
        } else if (t === 'sepuluh') {
          currentGroup += 10
        } else if (t === 'sebelas') {
          currentGroup += 11
        } else if (t === 'seribu') {
          total += 1000
        } else if (t === 'sejuta') {
          total += 1000000
        } else if (wordNums[t]) {
          const next = tokens[i + 1]
          if (next === 'ratus') {
            currentGroup += wordNums[t] * 100
            i++
          } else if (next === 'puluh') {
            currentGroup += wordNums[t] * 10
            i++
          } else if (next === 'belas') {
            currentGroup += wordNums[t] + 10
            i++
          } else {
            currentGroup += wordNums[t]
          }
        } else if (t === 'ribu') {
          total += (currentGroup === 0 ? 1 : currentGroup) * 1000
          currentGroup = 0
        } else if (t === 'juta') {
          total += (currentGroup === 0 ? 1 : currentGroup) * 1000000
          currentGroup = 0
        }
      }
      total += currentGroup
      if (total > 0) {
        amount = total
      }
    }

    // 3. Deteksi & Sesuaikan Kategori AI Secara Cerdas
    // Pastikan selalu ada kategori default jika daftar categories kosong
    const availableCategories = categories.length > 0 ? categories : [
      'Makanan & Minuman', 'Transportasi', 'Gaji & Penghasilan', 'Tagihan & Kebutuhan', 'Belanja', 'Hiburan', 'Kesehatan', 'Lain-lain'
    ]
    let matchedCat = availableCategories[0] || 'Lain-lain'

    const findExisting = (keywords: string[]) => {
      return availableCategories.find(c => {
        const cLower = c.toLowerCase()
        return keywords.some(k => cLower.includes(k) || k.includes(cLower))
      })
    }

    if (lower.includes('makan') || lower.includes('minum') || lower.includes('kopi') || lower.includes('nasi') || lower.includes('sarapan') || lower.includes('resto') || lower.includes('bakso') || lower.includes('ayam') || lower.includes('snack') || lower.includes('kuliner')) {
      matchedCat = findExisting(['makan', 'minum', 'kuliner']) || 'Makanan & Minuman'
    } else if (lower.includes('bensin') || lower.includes('parkir') || lower.includes('ojek') || lower.includes('grab') || lower.includes('gojek') || lower.includes('tol') || lower.includes('bengkel') || lower.includes('tambal') || lower.includes('solar') || lower.includes('transport')) {
      matchedCat = findExisting(['transport', 'bensin', 'kendaraan']) || 'Transportasi'
    } else if (lower.includes('gaji') || lower.includes('upah') || lower.includes('honor') || lower.includes('freelance') || lower.includes('omset') || lower.includes('untung') || lower.includes('penghasilan')) {
      matchedCat = findExisting(['gaji', 'penghasilan', 'pendapatan', 'omset']) || 'Gaji & Penghasilan'
    } else if (lower.includes('listrik') || lower.includes('air') || lower.includes('wifi') || lower.includes('kuota') || lower.includes('pulsa') || lower.includes('token') || lower.includes('indihome') || lower.includes('sewa') || lower.includes('tagihan')) {
      matchedCat = findExisting(['tagihan', 'kebutuhan', 'listrik', 'internet']) || 'Tagihan & Kebutuhan'
    } else if (lower.includes('belanja') || lower.includes('shopee') || lower.includes('tokopedia') || lower.includes('baju') || lower.includes('celana') || lower.includes('skincare') || lower.includes('paket') || lower.includes('pasar')) {
      matchedCat = findExisting(['belanja', 'kebutuhan']) || 'Belanja'
    } else if (lower.includes('nonton') || lower.includes('bioskop') || lower.includes('game') || lower.includes('jalan-jalan') || lower.includes('liburan') || lower.includes('staycation') || lower.includes('hiburan')) {
      matchedCat = findExisting(['hiburan', 'liburan']) || 'Hiburan'
    } else if (lower.includes('obat') || lower.includes('dokter') || lower.includes('klinik') || lower.includes('rumah sakit') || lower.includes('vitamin') || lower.includes('apotek') || lower.includes('sehat')) {
      matchedCat = findExisting(['kesehatan', 'obat', 'medis']) || 'Kesehatan'
    } else {
      const exactOrPartial = availableCategories.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower))
      if (exactOrPartial) {
        matchedCat = exactOrPartial
      }
    }

    // 4. Keterangan Judul Singkat
    let cleaned = text
      .replace(/(catat|tolong catat|masukkan|tambahkan|pengeluaran|pemasukan|hari ini|tadi)/gi, '')
      .trim()

    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    } else {
      cleaned = txType === 'income' ? 'Kas Masuk' : 'Pengeluaran'
    }

    const parsedResult = {
      title: cleaned,
      amount: amount > 0 ? amount : '',
      type: txType,
      category: matchedCat
    }
    console.log('Hasil parsing (amount, title, category, type):', parsedResult)

    setDetectedTitle(cleaned)
    setDetectedAmount(amount > 0 ? amount : '')
    setDetectedType(txType)
    setDetectedCategory(matchedCat)
    console.log('[Parser] Selesai, hasParsed di-set true')
    setHasParsed(true)

    console.log('[Voice Bridge] state form setelah update:', {
      title: cleaned,
      amount: amount > 0 ? amount : '',
      category: matchedCat
    })

    // Cek preferensi user: Opsi A (Auto-Save Langsung) atau Opsi B (Konfirmasi Form)
    let isAutoSaveEnabled = true
    try {
      const savedPref = localStorage.getItem('kasku_voice_auto_save')
      if (savedPref !== null) {
        isAutoSaveEnabled = savedPref === 'true'
      }
    } catch (e) {
      console.error(e)
    }

    if (isFromVoice && amount > 0 && isAutoSaveEnabled) {
      // OPSI A: Auto-Save Langsung
      console.log('[VoiceAI] Auto-Save (Opsi A) aktif, langsung menyimpan:', {
        title: cleaned,
        amount,
        type: txType,
        category: matchedCat
      })
      const dataToSave = {
        title: cleaned,
        amount,
        type: txType,
        category: matchedCat,
        date: new Date().toISOString().slice(0, 10),
        note: `Suara: "${text}"`
      }
      onSaveRef.current(dataToSave)
      resetFormRef.current()
      onCloseRef.current()
    } else {
      // OPSI B atau Input Manual atau Nominal belum ada:
      // Tampilkan form hasil AI dan scroll halus ke tombol Simpan
      if (isFromVoice && amount <= 0) {
        showToastRef.current('Nominal belum terdeteksi. Silakan lengkapi form di bawah.')
      } else if (isFromVoice && !isAutoSaveEnabled) {
        showToastRef.current('Suara terdeteksi! Silakan periksa dan ketuk Simpan Kas.')
      }

      // Smooth scroll ke tombol simpan agar tidak terpotong di layar HP
      setTimeout(() => {
        if (scrollableSheetRef.current) {
          scrollableSheetRef.current.scrollTo({
            top: scrollableSheetRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 120)
    }
  }
  parseRef.current = parseNaturalLanguage

  // Rekam Suara
  const toggleListening = () => {
    // 1. Cek jika berada di APK Android dengan Native Voice Bridge
    const nativeBridge = typeof window !== 'undefined' && ((window as any).AndroidVoiceBridge || (window as any).AndroidVoice)
    if (nativeBridge) {
      try {
        if (isListening) {
          nativeBridge.stopListening()
          setIsListening(false)
        } else {
          setTranscript('')
          setHasParsed(false)
          setIsListening(true)
          nativeBridge.startListening()
        }
        return
      } catch (e) {
        console.error('AndroidVoice bridge error:', e)
      }
    }

    // 2. Web Speech API Fallback (Browser Web)
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Browser/HP belum mendukung perekam suara web')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
        setTranscript('')
        setHasParsed(false)
      }

      recognition.onresult = (event: any) => {
        const currentText = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join(' ')
        setTranscript(currentText)
        parseNaturalLanguage(currentText, true)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
      showToast('Gagal mengaktifkan mikrofon')
    }
  }

  // Simpan Transaksi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!detectedTitle.trim() || !detectedAmount || Number(detectedAmount) <= 0) {
      console.warn('[VoiceAI] Validasi gagal saat simpan:', { detectedTitle, detectedAmount })
      showToast('Lengkapi nominal transaksi')
      return
    }

    const dataToSave = {
      title: detectedTitle.trim(),
      amount: Number(detectedAmount),
      type: detectedType,
      category: detectedCategory,
      date: new Date().toISOString().slice(0, 10),
      note: transcript ? `Suara: "${transcript}"` : undefined
    }
    console.log('Data yang dikirim ke onSaveTransaction:', dataToSave)

    onSaveTransaction(dataToSave)

    resetForm()
    onClose()
  }


  const onDragStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    startYRef.current = e.touches[0].clientY
    isDraggingRef.current = true
    setIsDragging(true)
  }

  const onDragMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) {
      setDragY(delta)
    } else {
      setDragY(0)
    }
  }

  const onDragEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    e.stopPropagation()
    isDraggingRef.current = false
    setIsDragging(false)
    if (dragY > 150) {
      setDragY(450)
      setTimeout(() => {
        onClose()
        setDragY(0)
      }, 200)
    } else {
      requestAnimationFrame(() => {
        setDragY(0)
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Dark Overlay Backdrop - Explicit click only */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-0"
        onClick={(e) => {
          if (e.target === e.currentTarget && Date.now() - mountTimeRef.current > 400) {
            onClose()
          }
        }}
      />

      <div 
        ref={scrollableSheetRef}
        className={`relative z-10 w-full sm:max-w-md bg-white border-t sm:border border-slate-200/80 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 shadow-ios-float space-y-4 max-h-[90vh] overflow-y-auto ${
          dragY === 0 && !isDragging ? 'animate-slide-up' : ''
        }`}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : 'translateY(0px)',
          transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Grabber Handle Bar (Area Geser Turun) */}
        <div 
          className="w-full pt-1 pb-4 -mt-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onTouchCancel={onDragEnd}
        >
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors opacity-80 pointer-events-none"></div>
        </div>

        {/* Header iOS Style */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 flex items-center justify-center shadow-ios-sm">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Voice AI KasKu</h3>
              <p className="text-[11px] text-slate-400 font-medium">Ucapkan transaksi untuk dicatat instan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/20 text-slate-500 flex items-center justify-center font-bold text-xs transition active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Tombol Mikrofon / Input Manual */}
        <div className="text-center py-2 space-y-2">
          {isSupported ? (
            <>
              <button
                type="button"
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse scale-105'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'
                }`}
              >
                <MicrophoneIcon className="w-7 h-7" />
              </button>
              <div>
                <span className={`text-xs font-bold block ${isListening ? 'text-rose-600' : 'text-slate-700'}`}>
                  {isListening ? 'Mendengarkan...' : 'Ketuk untuk Bicara'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Cth: "Makan siang 25 ribu" atau "Gaji 2 juta"
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-slate-100 text-slate-400">
                <MicrophoneIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-700">
                  Ketik Transaksi Manual
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Mikrofon tidak didukung, ketik seperti bicara
                </span>
              </div>
            </>
          )}

          {/* Manual text input - always visible as alternative */}
          <div className="pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualInput.trim()) {
                    (document.activeElement as HTMLElement)?.blur()
                    setTranscript(manualInput.trim())
                    parseNaturalLanguage(manualInput.trim())
                  }
                }}
                placeholder='Cth: "Beli bensin 25 ribu"'
                className="flex-1 px-3 py-2 rounded-xl kas-input text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  console.log('[Manual Input] Tombol Proses diklik dengan teks:', manualInput.trim())
                  if (manualInput.trim()) {
                    (document.activeElement as HTMLElement)?.blur()
                    console.log('[Manual Input] Kondisi if terpenuhi, memanggil parseNaturalLanguage')
                    setTranscript(manualInput.trim())
                    parseNaturalLanguage(manualInput.trim())
                  }
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95"
              >
                Proses
              </button>
            </div>
          </div>
        </div>

        {/* Bubble Suara */}
        {transcript && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="italic text-slate-700 font-medium text-center">"{transcript}"</p>
          </div>
        )}

        {/* Form Ringkas Hasil Ekstraksi */}
        {(() => {
          console.log('[VoiceAI] Render - hasParsed:', hasParsed)
          return hasParsed ? (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Hasil AI
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100">
                <button
                  type="button"
                  onClick={() => setDetectedType('expense')}
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition ${
                    detectedType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Keluar
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedType('income')}
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition ${
                    detectedType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Masuk
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                required
                placeholder="Keterangan transaksi"
                value={detectedTitle}
                onChange={(e) => setDetectedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl kas-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                required
                placeholder="Nominal (Rp)"
                value={formatThousands(detectedAmount)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setDetectedAmount(raw ? Number(raw) : '')
                }}
                className="w-full px-3 py-2 rounded-xl kas-input text-xs font-mono font-bold"
              />

              <select
                value={detectedCategory}
                onChange={(e) => setDetectedCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl kas-input text-xs"
              >
                {detectedCategory && !(categories.length > 0 ? categories : ['Makanan & Minuman', 'Transportasi', 'Gaji & Penghasilan', 'Tagihan & Kebutuhan', 'Belanja', 'Hiburan', 'Kesehatan', 'Lain-lain']).includes(detectedCategory) && (
                  <option value={detectedCategory}>✨ {detectedCategory} (Otomatis)</option>
                )}
                {(categories.length > 0 ? categories : ['Makanan & Minuman', 'Transportasi', 'Gaji & Penghasilan', 'Tagihan & Kebutuhan', 'Belanja', 'Hiburan', 'Kesehatan', 'Lain-lain']).map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center mt-1"
            >
              <span>Simpan Kas</span>
            </button>
          </form>
        ) : null })()}


      </div>
    </div>
  )
}
