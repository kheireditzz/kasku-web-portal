import React from 'react'
import { createRoot } from 'react-dom/client'
import KaskuApp from './app/app/page'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<KaskuApp />)
}
