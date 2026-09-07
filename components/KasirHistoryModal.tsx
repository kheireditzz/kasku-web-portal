'use client'

import React from 'react'
import { ClockHistoryIcon, XMarkIcon, BanknotesIcon, TrashIcon } from './Icons'
import { Transaction } from '@/app/app/page'

interface KasirHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  onDeleteTransaction?: (id: string) => void
}

export default function KasirHistoryModal({
  isOpen,
  onClose,
  transactions,
  onDeleteTransaction
}: KasirHistoryModalProps) {
  if (!isOpen) return null

  // Filter transaksi kasir (Kategori 'Kasir POS' atau judul mengandung 'KasirKu')
  const kasirTxList = transactions.filter(
    tx => tx.category === 'Kasir POS' || tx.title.toLowerCase().includes('kasir')
  )

  const totalOmsetKasir = kasirTxList.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white border border-slate-200 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <ClockHistoryIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                Riwayat Transaksi Kasir
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Catatan riwayat penjualan & struk belanja KasirKu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-600 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Ringkasan Omset Penjualan Kasir */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-700 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
              Total Omset KasirKu
            </span>
            <span className="text-xl sm:text-2xl font-black font-display">
              Rp {totalOmsetKasir.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">
              {kasirTxList.length} Transaksi
            </span>
          </div>
        </div>

        {/* Daftar Transaksi */}
        <div className="space-y-2.5 pt-1">
          {kasirTxList.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-4xl block">🧾</span>
              <p className="text-xs font-bold text-slate-700">Belum Ada Riwayat Penjualan Kasir</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Setiap kali Anda menekan 'Bayar' di KasirKu, transaksi otomatis tercatat di sini & Buku Kas.
              </p>
            </div>
          ) : (
            kasirTxList.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 transition-all flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {tx.title}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {tx.date}
                    </span>
                  </div>
                  {tx.note && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                      {tx.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs sm:text-sm font-black text-emerald-700">
                    +Rp {tx.amount.toLocaleString('id-ID')}
                  </span>

                  {onDeleteTransaction && (
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition active:scale-90"
                      title="Hapus Transaksi"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-2xl transition"
        >
          Tutup Riwayat
        </button>
      </div>
    </div>
  )
}
