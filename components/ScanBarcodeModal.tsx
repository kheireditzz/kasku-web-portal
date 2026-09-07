'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { XMarkIcon, CheckCircleIcon } from './Icons'
import { KasirProduct } from './KasirSection'

interface ScanBarcodeModalProps {
  isOpen: boolean
  onClose: () => void
  products: KasirProduct[]
  onAddToCartWithDetails: (product: KasirProduct, qty: number, note?: string) => void
  onRegisterAndAddToCart: (product: KasirProduct, qty: number, note?: string) => void
  showToast?: (msg: string) => void
}

export default function ScanBarcodeModal({
  isOpen,
  onClose,
  products,
  onAddToCartWithDetails,
  onRegisterAndAddToCart,
  showToast
}: ScanBarcodeModalProps) {
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScannerRunning, setIsScannerRunning] = useState(false)

  // Sub-step Dialog State: Setelah barcode discan, muncul dialog pengisian Nama, Code, Qty, Harga dll
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [foundProduct, setFoundProduct] = useState<KasirProduct | null>(null)
  const [qty, setQty] = useState<number>(1)
  const [customPrice, setCustomPrice] = useState<string>('')
  const [productName, setProductName] = useState<string>('')
  const [productBarcode, setProductBarcode] = useState<string>('')
  const [orderNote, setOrderNote] = useState<string>('')

  // Mode langsung scan masuk ke keranjang kasir (cepat tanpa form jika produk sudah terdaftar)
  const [fastMode, setFastMode] = useState<boolean>(true)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'kasku-barcode-reader'

  useEffect(() => {
    if (!isOpen) {
      cleanupScanner()
      setScannedCode(null)
      setFoundProduct(null)
      setQty(1)
      setCustomPrice('')
      setProductName('')
      setProductBarcode('')
      setOrderNote('')
      return
    }

    setCameraError(null)

    // Periksa Native Android Permission jika berjalan di APK WebView
    try {
      if ((window as any).AndroidApp && typeof (window as any).AndroidApp.requestCameraPermission === 'function') {
        (window as any).AndroidApp.requestCameraPermission()
      }
    } catch (e) {}

    // Jalankan scanner dengan jeda kecil untuk memastikan DOM container ter-render
    const timer = setTimeout(() => {
      startHtml5Scanner()
    }, 250)

    return () => {
      clearTimeout(timer)
      cleanupScanner()
    }
  }, [isOpen])

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      } catch (e) {
        console.error('Error stopping scanner', e)
      }
      scannerRef.current = null
      setIsScannerRunning(false)
    }
  }

  const startHtml5Scanner = async () => {
    try {
      const container = document.getElementById(containerId)
      if (!container) return

      if (scannerRef.current) {
        await cleanupScanner()
      }

      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      })
      scannerRef.current = html5QrCode

      const config = {
        fps: 20,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
          const qrboxSize = Math.floor(minEdge * 0.85)
          return {
            width: qrboxSize,
            height: Math.floor(qrboxSize * 0.65)
          }
        },
        aspectRatio: 1.0
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleBarcodeScanned(decodedText)
        },
        () => {
          // ignore scan frame errors
        }
      )

      setIsScannerRunning(true)
      setCameraError(null)
    } catch (err: any) {
      console.warn('html5-qrcode camera start failed:', err)
      setIsScannerRunning(false)
      setCameraError('Kamera tidak dapat diakses langsung. Silakan berikan izin kamera atau gunakan input manual di bawah.')
    }
  }

  // Dipanggil saat barcode terdeteksi (Kamera / Input manual)
  const handleBarcodeScanned = (code: string) => {
    if (!code) return
    const cleanCode = code.trim()

    // Mainkan getaran haptic singkat jika didukung
    try {
      if (navigator.vibrate) navigator.vibrate(80)
    } catch (e) {}

    // Cari apakah produk sudah ada di database kasir
    const matched = products.find(p => p.barcode === cleanCode || p.id === cleanCode)

    // JIKA FAST MODE AKTIF dan produk sudah terdaftar: Langsung masukkan ke keranjang & data pembayaran!
    if (fastMode && matched) {
      onAddToCartWithDetails(matched, 1, '')
      if (showToast) {
        showToast(`⚡ +1 ${matched.name} masuk ke pembayaran!`)
      }
      cleanupScanner()
      onClose()
      return
    }

    // Jika produk baru atau mode konfirmasi:
    cleanupScanner()
    setScannedCode(cleanCode)
    setProductBarcode(cleanCode)

    if (matched) {
      setFoundProduct(matched)
      setQty(1)
      setCustomPrice(matched.price ? matched.price.toString() : '0')
      setProductName(matched.name)
    } else {
      setFoundProduct(null)
      setQty(1)
      setCustomPrice('0')
      setProductName(`Barang #${cleanCode.slice(-4)}`)
    }
  }

  const executeSave = () => {
    const cleanBarcode = (productBarcode || scannedCode || '').trim() || Date.now().toString()
    const parsedQty = Math.max(1, Number(qty) || 1)
    
    // Parse price cleanly from string without non-digits
    let finalPrice = 0
    if (typeof customPrice === 'string' && customPrice.trim()) {
      finalPrice = parseInt(customPrice.replace(/\D/g, ''), 10) || 0
    } else if (typeof customPrice === 'number') {
      finalPrice = customPrice
    } else if (foundProduct) {
      finalPrice = foundProduct.price
    }

    const finalName = productName.trim() || (foundProduct ? foundProduct.name : `Barang #${cleanBarcode.slice(-4)}`)

    if (foundProduct) {
      // Update produk yang ada & masukkan ke keranjang kasir
      const updatedProduct: KasirProduct = {
        ...foundProduct,
        name: finalName,
        price: finalPrice > 0 ? finalPrice : foundProduct.price,
        barcode: cleanBarcode
      }
      onAddToCartWithDetails(updatedProduct, parsedQty, orderNote.trim())
      if (showToast) {
        showToast(`✅ Masuk Pembayaran: ${parsedQty}x ${finalName}`)
      }
    } else {
      // Daftarkan produk baru secara otomatis & masukkan ke keranjang pembayaran
      const brandNew: KasirProduct = {
        id: 'prod_' + Date.now().toString(),
        name: finalName,
        price: finalPrice,
        category: 'Umum',
        emoji: '📦',
        barcode: cleanBarcode
      }
      onRegisterAndAddToCart(brandNew, parsedQty, orderNote.trim())
      if (showToast) {
        showToast(`✅ ${brandNew.name} didaftarkan & masuk pembayaran!`)
      }
    }

    cleanupScanner()
    onClose()
  }

  const handleSaveToCart = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    executeSave()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    handleBarcodeScanned(manualCode.trim())
    setManualCode('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-0"
        onClick={() => {
          cleanupScanner()
          onClose()
        }}
      />

      <div className="relative z-10 w-full sm:max-w-md bg-white border border-slate-200 rounded-t-[36px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Grabber handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-1 sm:hidden"></div>

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              📷
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                {scannedCode ? 'Konfirmasi Detail & Qty' : 'Pindai Barcode'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {scannedCode ? 'Periksa nama, kode, harga & jumlah pesanan' : 'Arahkan kamera ke barcode produk atau ketik manual'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupScanner()
              onClose()
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-600 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* JIKA BELUM ADA HASIL SCAN: TAMPILKAN SCANNER KAMERA + INPUT MANUAL */}
        {!scannedCode ? (
          <div className="space-y-4">
            {/* Toggle Mode Cepat Langsung Masuk Keranjang */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <div className="text-xs font-black text-slate-800">Scan Langsung Masuk Keranjang</div>
                  <div className="text-[10px] text-slate-500">Jika barcode cocok, langsung masuk ke data pembayaran</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFastMode(!fastMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  fastMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
              </button>
            </div>

            {/* HTML5 QrCode Container */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-slate-200 shadow-inner">
              <div id={containerId} className="w-full h-full object-cover"></div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-2 z-10">
                  <span className="text-3xl">📷</span>
                  <p className="text-xs font-bold text-slate-200">{cameraError}</p>
                  <p className="text-[11px] text-slate-400">Gunakan input kode barcode manual di bawah ini.</p>
                </div>
              )}
            </div>

            {/* Manual Barcode Input Fallback */}
            <form onSubmit={handleManualSubmit} className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Atau Ketik Kode Barcode / SKU Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="Contoh: 8991001"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-sm transition shrink-0"
                >
                  Scan Kode
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* JIKA SUDAH DISCAN: DIALOG EDIT NAMA, KODE, HARGA, JUMLAH (QTY) & SIMPAN */
          <form onSubmit={handleSaveToCart} className="space-y-3.5 animate-slide-up">
            {/* Info Status Barcode */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl">{foundProduct?.emoji || '🏷️'}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {foundProduct ? 'Produk Terdaftar Ditemukan' : 'Barcode Terdeteksi Baru'}
                  </span>
                  <span className="text-xs font-black text-slate-800 truncate block">
                    {foundProduct ? foundProduct.name : 'Silakan lengkapi nama & harga'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScannedCode(null)
                  startHtml5Scanner()
                }}
                className="text-[11px] text-emerald-700 font-bold underline px-2 py-1 hover:text-emerald-900 shrink-0"
              >
                Scan Ulang
              </button>
            </div>

            {/* Nama Produk (Bisa diisi / diedit bebas) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Produk / Menu
              </label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Contoh: Kopi Susu Aren"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Kode Barcode Produk (Auto terisi dari Scan & Aman) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kode Barcode / SKU (Otomatis dari Scanner)
              </label>
              <input
                type="text"
                value={productBarcode}
                onChange={e => setProductBarcode(e.target.value)}
                placeholder="Kode barcode..."
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Input Harga Jual dengan Format Titik Ribuan & Keyboard Angka */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Harga Jual Satuan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customPrice ? Number(customPrice).toLocaleString('id-ID') : ''}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '')
                    setCustomPrice(val)
                  }}
                  placeholder="Contoh: 15.000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Stepper Jumlah / Qty (Interaktif & Keyboard Angka) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Jumlah Barang (Qty)
              </label>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center justify-center font-bold text-base active:scale-90 transition"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qty}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '')
                    setQty(Math.max(1, parseInt(val, 10) || 1))
                  }}
                  className="flex-1 text-center font-black text-lg bg-transparent text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(prev => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-xs flex items-center justify-center font-bold text-base active:scale-90 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Subtotal Preview dengan Format Titik Ribuan */}
            <div className="flex items-center justify-between px-1 py-1 text-xs border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-semibold">Subtotal ({qty} item):</span>
              <span className="font-black text-emerald-700 text-sm">
                Rp {((parseInt(customPrice || '0', 10) || (foundProduct?.price || 0)) * qty).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tombol Simpan ke Keranjang / Pembayaran & Batal */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircleIcon className="w-5 h-5 text-white" />
                <span>Simpan & Masuk ke Data Pembayaran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScannedCode(null)
                  startHtml5Scanner()
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center cursor-pointer"
              >
                ✕ Batal / Pindai Ulang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
