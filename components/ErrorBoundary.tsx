import React, { Component, ErrorInfo, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error | null, reset: () => void) => ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KasKu ErrorBoundary caught error:', error?.message || error, errorInfo?.componentStack)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      return (
        <div className="p-4 m-2 rounded-2xl bg-red-50 border border-red-200 text-red-900 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 text-xl font-bold">
            ⚠️
          </div>
          <h3 className="font-semibold text-base mb-1">Terjadi Kendala pada Komponen</h3>
          <p className="text-xs text-red-700 mb-4 max-w-sm break-words font-mono bg-red-100/70 p-2 rounded-lg">
            {this.state.error?.message || 'Error tidak diketahui'}
          </p>
          <button
            type="button"
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
