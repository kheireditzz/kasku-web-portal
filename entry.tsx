import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import KaskuApp from './app/app/page'
import KaskuLandingDownloadPage from './app/page'

function RootApp() {
  const [view, setView] = useState<'app' | 'landing'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('view')
      if (p === 'landing') return 'landing'
      if (window.location.pathname === '/landing') return 'landing'
    }
    return 'app'
  })

  // Sync state dengan URL tanpa reload
  const switchView = (target: 'app' | 'landing') => {
    setView(target)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', target)
      window.history.pushState({}, '', url.toString())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search).get('view')
      setView(p === 'landing' ? 'landing' : 'app')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Sleek Floating Mode Switcher Bar */}
      <div className="fixed top-3 right-3 sm:right-6 z-[999] flex items-center p-1 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] select-none text-[11px] font-extrabold transition-all">
        <button
          type="button"
          onClick={() => switchView('app')}
          className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            view === 'app'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>📱</span>
          <span>Aplikasi</span>
        </button>
        <button
          type="button"
          onClick={() => switchView('landing')}
          className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            view === 'landing'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🌐</span>
          <span>Portal Web</span>
        </button>
      </div>

      {/* Render Current View */}
      {view === 'app' ? (
        <KaskuApp />
      ) : (
        <KaskuLandingDownloadPage />
      )}
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<RootApp />)
}
