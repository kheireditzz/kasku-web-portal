'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MicrophoneIcon,
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

const GEMINI_API_KEY = "AIzaSyBH8W_HnTW9Q18wQGym2fb0EQwiLwmr9x8"

export default function VoiceAITransactionModal({
  isOpen,
  onClose,
  onSaveTransaction,
  categories,
  showToast
}: VoiceAITransactionModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rawInput, setRawInput] = useState('')
  const [transcript, setTranscript] = useState('')

  // Hasil Ekstraksi Voice
  const [detectedTitle, setDetectedTitle] = useState('')
  const [detectedAmount, setDetectedAmount] = useState<number | ''>('')
  const [detectedType, setDetectedType] = useState<'income' | 'expense'>('expense')
  const [detectedCategory, setDetectedCategory] = useState(categories[0] || 'Lain-lain')
  const [hasParsed, setHasParsed] = useState(false)

  const recognitionRef = useRef<any>(null)

  // Ekstraksi Pintar
  const processVoiceText = async (text: string) => {
    if (!text || !text.trim()) return

    setIsProcessing(true)
    setTranscript(text)

    // Fallback lokal instan
    parseNaturalLanguageOffline(text)

    try {
      const prompt = `Anda adalah asisten KasKu untuk pembukuan keuangan.
Tugas Anda mengekstrak informasi transaksi dari kalimat bahasa Indonesia: "${text}".
Daftar kategori yang tersedia: ${JSON.stringify(categories)}.

Keluarkan HANYA format JSON murni tanpa markdown:
{
  "title": "judul ringkas transaksi (cth: Makan Siang)",
  "amount": 25000,
  "type": "expense" atau "income",
  "category": "pilih kategori yang paling cocok dari daftar atau buat baru yang relevan"
}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300
          }
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const json = await res.json()
        const rawReply = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const cleanJsonStr = rawReply.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJsonStr)

        if (parsed && typeof parsed.amount === 'number' && parsed.amount > 0) {
          setDetectedTitle(parsed.title || 'Transaksi KasKu')
          setDetectedAmount(parsed.amount)
          setDetectedType(parsed.type === 'income' ? 'income' : 'expense')
          setDetectedCategory(parsed.category || categories[0] || 'Lain-lain')
          setHasParsed(true)
        }
      }
    } catch (err) {
      console.log('Fallback to local parser', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper Konversi Kata Angka Bahasa Indonesia ke Angka Numerik
  const parseIndonesianWordsToNumber = (str: string): number => {
    const s = str.toLowerCase().replace(/rp\.?/g, ' ').replace(/rupiah/g, ' ').trim()
    
    // Check direct regex numbers first
    const millionMatch = s.match(/(\d+[\.,]?\d*)\s*(?:juta|jt)/)
    if (millionMatch) {
      return Math.round(parseFloat(millionMatch[1].replace(',', '.')) * 1000000)
    }
    const thousandMatch = s.match(/(\d+[\.,]?\d*)\s*(?:ribu|rb|k)/)
    if (thousandMatch) {
      return Math.round(parseFloat(thousandMatch[1].replace(',', '.')) * 1000)
    }
    const plainNumberMatch = s.match(/(?:sebesar|sejumlah)?\s*(\d{1,3}(?:[.,]\d{3})+|\d+)/)
    if (plainNumberMatch && parseInt(plainNumberMatch[1].replace(/[.,]/g, ''), 10) > 0) {
      return parseInt(plainNumberMatch[1].replace(/[.,]/g, ''), 10)
    }

    // Mapping kata angka Indonesia
    const wordMap: { [key: string]: number } = {
      'nol': 0, 'kosong': 0, 'satu': 1, 'se': 1, 'dua': 2, 'tiga': 3, 'empat': 4,
      'lima': 5, 'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
      'sebelas': 11, 'seratus': 100, 'seribu': 1000, 'sejuta': 1000000
    }

    // Normalisasi kata
    const cleanWords = s
      .replace(/\bsetengah\s+juta\b/g, '500000')
      .replace(/\bsetengah\s+ribu\b/g, '500')
      .replace(/\bsetengah\b/g, '0.5')
      .replace(/\bsejuta\b/g, 'satu juta')
      .replace(/\bseribu\b/g, 'satu ribu')
      .replace(/\bseratus\b/g, 'satu ratus')
      .replace(/\bsepuluh\b/g, 'satu puluh')
      .replace(/\bsebelas\b/g, '11')

    if (cleanWords.includes('500000')) return 500000

    // Parse kata per kata
    const tokens = cleanWords.split(/[\s-]+/)
    let total = 0
    let current = 0

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (wordMap[token] !== undefined) {
        current += wordMap[token]
      } else if (token === 'belas') {
        current = (current === 0 ? 1 : current) + 10
      } else if (token === 'puluh') {
        current = (current === 0 ? 1 : current) * 10
      } else if (token === 'ratus') {
        current = (current === 0 ? 1 : current) * 100
      } else if (token === 'ribu' || token === 'rb' || token === 'k') {
        current = (current === 0 ? 1 : current) * 1000
        total += current
        current = 0
      } else if (token === 'juta' || token === 'jt') {
        current = (current === 0 ? 1 : current) * 1000000
        total += current
        current = 0
      } else if (!isNaN(Number(token))) {
        current += Number(token)
      }
    }
    total += current
    return total
  }

  // Parser Offline Lokal
  const parseNaturalLanguageOffline = (text: string) => {
    const lower = text.toLowerCase()

    let txType: 'income' | 'expense' = 'expense'
    const incomeKeywords = ['gaji', 'honor', 'dapat', 'terima', 'masuk', 'tf masuk', 'transfer masuk', 'jual', 'penjualan', 'untung', 'bonus', 'angpau', 'hadiah', 'kembalian', 'omset', 'penghasilan']
    if (incomeKeywords.some(kw => lower.includes(kw))) {
      txType = 'income'
    }

    const amount = parseIndonesianWordsToNumber(lower)

    let matchedCat = categories[0] || 'Lain-lain'
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
    }

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

  // Listener untuk Native Android Voice Bridge (terpasang saat modal dibuka)
  useEffect(() => {
    if (!isOpen) return
    if (typeof window !== 'undefined') {
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
          setRawInput(text)
        }
      }

      (window as any).onSpeechResult = (text: string) => {
        setIsListening(false)
        if (text) {
          setRawInput(text)
          processVoiceText(text)
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
  }, [isOpen, categories])

  const resetForm = () => {
    setRawInput('')
    setTranscript('')
    setDetectedTitle('')
    setDetectedAmount('')
    setDetectedType('expense')
    setDetectedCategory(categories[0] || 'Lain-lain')
    setHasParsed(false)
    setIsListening(false)
    setIsProcessing(false)
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setRawInput('')
      setTranscript('')
      setDetectedTitle('')
      setDetectedAmount('')
      setDetectedType('expense')
      setDetectedCategory(categories[0] || 'Lain-lain')
      setHasParsed(false)
      setIsListening(false)
      setIsProcessing(false)
    } else {
      document.body.style.overflow = 'unset'
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

  // Trigger Rekam Suara
  const toggleListening = () => {
    if (typeof (window as any) !== 'undefined' && (window as any).AndroidVoice) {
      try {
        setIsListening(true)
        setRawInput('')
        setHasParsed(false)
        ;(window as any).AndroidVoice.startListening()
      } catch (e) {
        setIsListening(false)
        showToast('Ketik kalimat transaksi di bawah')
      }
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Ketik kalimat transaksi di kotak teks')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
        setRawInput('')
        setHasParsed(false)
      }

      recognition.onresult = (event: any) => {
        const currentText = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join(' ')
        setRawInput(currentText)
        processVoiceText(currentText)
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
      showToast('Ketik kalimat transaksi di kotak teks')
    }
  }

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault()
    
    // Matikan rekaman suara jika masih aktif
    if (typeof (window as any) !== 'undefined' && (window as any).AndroidVoice) {
      try {
        (window as any).AndroidVoice.stopListening()
      } catch (err) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {}
    }

    const cleanTitle = (detectedTitle || '').trim()
    const cleanAmount = Number(detectedAmount)

    if (!cleanTitle || isNaN(cleanAmount) || cleanAmount <= 0) {
      showToast('Lengkapi keterangan dan nominal transaksi')
      return
    }

    try {
      onSaveTransaction({
        title: cleanTitle,
        amount: cleanAmount,
        type: detectedType,
        category: (detectedCategory || categories[0] || 'Lain-lain').trim(),
        date: new Date().toISOString().slice(0, 10),
        note: transcript ? `Voice: "${transcript}"` : undefined
      })
    } catch (saveErr) {
      console.error('Save voice transaction error:', saveErr)
    }

    resetForm()
    onClose()
  }

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rawInput.trim()) {
      processVoiceText(rawInput.trim())
    }
  }

  // Formatter Rupiah Cantik
  const formatRupiah = (val: number | '') => {
    if (typeof val !== 'number' || isNaN(val) || val <= 0) return ''
    return new Intl.NumberFormat('id-ID').format(val)
  }

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bersih & Formal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MicrophoneIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Voice Input</h3>
              <p className="text-[11px] text-slate-400 font-medium">Bicara atau ketik data kas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-xs transition active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Desain Mikrofon Hijau Bersih & Formal */}
        <div className="py-2 text-center space-y-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all duration-200 active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-100 shadow-lg shadow-rose-600/20 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            <MicrophoneIcon className="w-7 h-7" />
          </button>

          <div className="space-y-0.5">
            <span className={`text-xs font-bold block ${isListening ? 'text-rose-600' : 'text-slate-800'}`}>
              {isListening ? 'Mendengarkan...' : 'Ketuk untuk Bicara'}
            </span>
            <p className="text-[11px] text-slate-400">
              Contoh: "Makan siang 25 ribu" atau "Gaji 2 juta"
            </p>
          </div>
        </div>

        {/* Input Teks Bersih */}
        <div className="space-y-1">
          <form onSubmit={handleManualTextSubmit}>
            <input
              type="text"
              placeholder="Atau ketik di sini lalu tekan Enter..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </form>
        </div>

        {/* Status Loading */}
        {isProcessing && (
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-700 font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-ping"></span>
            <span>Memproses transaksi...</span>
          </div>
        )}

        {/* Bubble Hasil Deteksi Teks */}
        {transcript && !isProcessing && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Teks Terdeteksi:
            </span>
            <p className="italic text-slate-800 font-medium leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Form Ringkas Hasil Ekstraksi */}
        {hasParsed && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-100 text-xs animate-fade-in">
            {/* Header Form & Tab Tipe */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5 text-slate-700" />
                <span>Hasil Ekstraksi</span>
              </span>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDetectedType('expense')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${
                    detectedType === 'expense'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedType('income')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${
                    detectedType === 'income'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            {/* Input Keterangan / Judul */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-0.5 block">
                Keterangan
              </label>
              <input
                type="text"
                required
                placeholder="Keterangan transaksi"
                value={detectedTitle}
                onChange={(e) => setDetectedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* Grid Nominal & Kategori */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-0.5 block">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  value={detectedAmount}
                  onChange={(e) => setDetectedAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-0.5 block">
                  Kategori
                </label>
                <select
                  value={detectedCategory}
                  onChange={(e) => setDetectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  {!categories.includes(detectedCategory) && (
                    <option value={detectedCategory}>{detectedCategory}</option>
                  )}
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Nominal Format Rupiah */}
            {detectedAmount && Number(detectedAmount) > 0 && (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] font-medium text-slate-500">Total:</span>
                <span className={`font-mono font-extrabold text-xs ${detectedType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {detectedType === 'income' ? '+ ' : '- '}Rp {formatRupiah(detectedAmount)}
                </span>
              </div>
            )}

            {/* Tombol Simpan */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-md shadow-slate-900/15 transition flex items-center justify-center gap-1.5 mt-1"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
