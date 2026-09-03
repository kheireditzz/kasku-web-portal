'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MicrophoneIcon,
  SparklesIcon,
  CheckCircleIcon
} from './Icons'

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const hasAndroidVoice = typeof (window as any).AndroidVoice !== 'undefined'
      if (!SpeechRecognition && !hasAndroidVoice) {
        setIsSupported(false)
      } else {
        setIsSupported(true)
      }

      // Pasang global listener untuk event Android Native Voice
      (window as any).onSpeechReady = () => {
        setIsListening(true)
        setTranscript('')
        setHasParsed(false)
      }

      (window as any).onSpeechBegin = () => {
        setIsListening(true)
      }

      (window as any).onSpeechPartial = (text: string) => {
        if (text) {
          setTranscript(text)
          parseNaturalLanguage(text)
        }
      }

      (window as any).onSpeechResult = (text: string) => {
        setIsListening(false)
        if (text) {
          setTranscript(text)
          parseNaturalLanguage(text)
        }
      }

      (window as any).onSpeechEnd = () => {
        setIsListening(false)
      }

      (window as any).onSpeechError = (errMsg: string) => {
        setIsListening(false)
        if (errMsg) {
          showToast(errMsg)
        }
      }
    }
  }, [])

  // Reset state form agar selalu bersih dari data lama
  const resetForm = () => {
    setTranscript('')
    setDetectedTitle('')
    setDetectedAmount('')
    setDetectedType('expense')
    setDetectedCategory(categories[0] || 'Lain-lain')
    setHasParsed(false)
    setIsListening(false)
  }

  // Lock body scroll dan reset data setiap modal dibuka / ditutup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      resetForm()
    } else {
      document.body.style.overflow = 'unset'
      resetForm()
      if (typeof (window as any) !== 'undefined' && (window as any).AndroidVoice) {
        try {
          (window as any).AndroidVoice.stopListening()
        } catch (e) {}
      }
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Natural Language Parser
  const parseNaturalLanguage = (text: string) => {
    const lower = text.toLowerCase()

    // 1. Deteksi Tipe (Masuk / Keluar)
    let txType: 'income' | 'expense' = 'expense'
    const incomeKeywords = ['gaji', 'honor', 'dapat', 'terima', 'masuk', 'tf masuk', 'transfer masuk', 'jual', 'penjualan', 'untung', 'bonus', 'angpau', 'hadiah', 'kembalian', 'omset']
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
    } else if (plainNumberMatch) {
      amount = parseInt(plainNumberMatch[1].replace(/[.,]/g, ''), 10)
    }

    if (amount === 0) {
      if (lower.includes('seratus ribu')) amount = 100000
      else if (lower.includes('dua ratus ribu')) amount = 200000
      else if (lower.includes('lima puluh ribu')) amount = 50000
      else if (lower.includes('dua puluh ribu')) amount = 20000
      else if (lower.includes('sepuluh ribu')) amount = 10000
      else if (lower.includes('lima ribu')) amount = 5000
      else if (lower.includes('sejuta') || lower.includes('satu juta')) amount = 1000000
    }

    // 3. Deteksi & Sesuaikan Kategori AI Secara Cerdas (Satukan & Cegah Dobel)
    let matchedCat = categories[0] || 'Lain-lain'

    // Helper: cari kategori yang ada yang mengandung kata kunci
    const findExisting = (keywords: string[]) => {
      return categories.find(c => {
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
      // Jika user menyebutkan kata yang cocok dengan kategori yang sudah pernah dibuat
      const exactOrPartial = categories.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower))
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

    setDetectedTitle(cleaned)
    setDetectedAmount(amount > 0 ? amount : '')
    setDetectedType(txType)
    setDetectedCategory(matchedCat)
    setHasParsed(true)
  }

  // Rekam Suara (Hybrid: Native Android & Web Speech Recognition)
  const toggleListening = () => {
    // 1. Cek apakah ada Android Native Bridge
    if (typeof (window as any) !== 'undefined' && (window as any).AndroidVoice) {
      if (isListening) {
        try {
          (window as any).AndroidVoice.stopListening()
        } catch (e) {}
        setIsListening(false)
      } else {
        try {
          setIsListening(true)
          setTranscript('')
          setHasParsed(false)
          (window as any).AndroidVoice.startListening()
        } catch (e) {
          setIsListening(false)
          showToast('Gagal memulai suara native')
        }
      }
      return
    }

    // 2. Fallback Web Speech API standar
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Perangkat belum mendukung input suara')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID'
      recognition.continuous = false
      recognition.interimResults = true

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
        parseNaturalLanguage(currentText)
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
      showToast('Lengkapi nominal transaksi')
      return
    }

    onSaveTransaction({
      title: detectedTitle.trim(),
      amount: Number(detectedAmount),
      type: detectedType,
      category: detectedCategory,
      date: new Date().toISOString().slice(0, 10),
      note: transcript ? `Suara: "${transcript}"` : undefined
    })

    resetForm()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in touch-none select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bersih */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Suara AI</h3>
              <p className="text-[11px] text-slate-400">Ucapkan transaksi Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Tombol Mikrofon Minimalis */}
        <div className="text-center py-2 space-y-2">
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
        </div>

        {/* Bubble Suara */}
        {transcript && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="italic text-slate-700 font-medium text-center">"{transcript}"</p>
          </div>
        )}

        {/* Form Ringkas Hasil Ekstraksi */}
        {hasParsed && (
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
                type="number"
                min="1"
                required
                placeholder="Nominal (Rp)"
                value={detectedAmount}
                onChange={(e) => setDetectedAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl kas-input text-xs font-mono font-bold"
              />

              <select
                value={detectedCategory}
                onChange={(e) => setDetectedCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl kas-input text-xs"
              >
                {!categories.includes(detectedCategory) && (
                  <option value={detectedCategory}>✨ {detectedCategory} (Otomatis)</option>
                )}
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1 mt-1"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Simpan Kas</span>
            </button>
          </form>
        )}

        {!isSupported && (
          <p className="text-[10px] text-amber-700 text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
            Gunakan Chrome / Browser HP dengan izin mikrofon.
          </p>
        )}

      </div>
    </div>
  )
}
