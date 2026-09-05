import React from 'react'
import './globals.css'

export const metadata = {
  metadataBase: new URL('https://kasku.kheireditz.my.id'),
  title: {
    default: 'KasKu — Aplikasi Catatan Keuangan & Kas Harian Pribadi & UMKM',
    template: '%s | KasKu'
  },
  description: 'KasKu adalah aplikasi catatan kas dan manajemen finansial pintar gratis untuk Android dan Web. Dilengkapi AI Voice transaksi cerdas, target tabungan, dan laporan otomatis tanpa iklan.',
  keywords: [
    'kasku',
    'kas ku',
    'kasku apk',
    'download kasku',
    'kasku kheireditz',
    'aplikasi kasku',
    'aplikasi kas keuangan',
    'catatan kas harian',
    'buku kas umkm',
    'aplikasi pengatur keuangan pribadi',
    'asisten suara keuangan ai',
    'kasku web portal'
  ],
  authors: [{ name: 'KheirEditz', url: 'https://kasku.kheireditz.my.id' }],
  creator: 'KheirEditz',
  publisher: 'KasKu Finance',
  applicationName: 'KasKu',
  alternates: {
    canonical: 'https://kasku.kheireditz.my.id',
  },
  openGraph: {
    title: 'KasKu — Aplikasi Catatan Keuangan & Kas Harian Pintar',
    description: 'Catat kas masuk, pengeluaran harian, tabungan impian, dan input via AI Voice cerdas dengan KasKu.',
    url: 'https://kasku.kheireditz.my.id',
    siteName: 'KasKu',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://kasku.kheireditz.my.id/app-logo.jpg',
        width: 512,
        height: 512,
        alt: 'KasKu App Logo - Modern Finance Assistant'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KasKu — Aplikasi Catatan Keuangan & Kas Harian Pintar',
    description: 'Catat kas masuk, pengeluaran harian, tabungan impian, dan input via AI Voice cerdas dengan KasKu.',
    images: ['https://kasku.kheireditz.my.id/app-logo.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  manifest: '/manifest.json',
  themeColor: '#10b981',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KasKu',
    alternateName: ['KasKu App', 'Aplikasi KasKu', 'KasKu Finance'],
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Android, Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR'
    },
    description: 'KasKu adalah aplikasi cerdas untuk mengelola kas keuangan harian, tabungan target, dan transaksi dengan bantuan teknologi AI Voice.',
    url: 'https://kasku.kheireditz.my.id',
    downloadUrl: 'https://kasku.kheireditz.my.id/apk/KasKu.apk',
    softwareVersion: '1.1.95',
    author: {
      '@type': 'Organization',
      name: 'KasKu Development Team',
      url: 'https://kasku.kheireditz.my.id'
    }
  }

  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KasKu" />
        <link rel="apple-touch-icon" href="/app-logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#f2f2f7] text-slate-900 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
