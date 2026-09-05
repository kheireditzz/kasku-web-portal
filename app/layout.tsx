import React from 'react'
import './globals.css'

export const metadata = {
  title: 'KasKu — Aplikasi Manajemen Keuangan & Kas',
  description: 'Aplikasi manajemen arus kas, tabungan target, dan pencatatan finansial cerdas untuk Android & iOS.',
  manifest: '/manifest.json',
  themeColor: '#F2F2F7',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KasKu'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KasKu" />
        <link rel="apple-touch-icon" href="/app-logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-[#f2f2f7] text-slate-900 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
