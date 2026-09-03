import React, { Component, ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import KaskuApp from './app/app/page'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: false, error: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('KasKu Handled State Glitch:', error, errorInfo)
  }

  render() {
    return this.props.children
  }
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <ErrorBoundary>
      <KaskuApp />
    </ErrorBoundary>
  )
}

