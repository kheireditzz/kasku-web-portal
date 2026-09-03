import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Download KasKu APK — Portal Resmi Aplikasi Keuangan & Kas Android',
  description: 'Download aplikasi KasKu APK versi terbaru dan versi terdahulu. Aplikasi manajemen arus kas, tabungan target, dan pencatatan finansial cerdas untuk Android.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
