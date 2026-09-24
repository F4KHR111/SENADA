import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-danger mb-4 shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight mb-1">
            Terjadi Kesalahan Tampilan
          </h2>
          <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
            Halaman mengalami masalah saat memproses data. Silakan muat ulang atau kembali ke dashboard.
          </p>
          {this.state.error && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-red-600 font-mono text-left max-w-lg overflow-x-auto mb-6">
              {this.state.error.toString()}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Muat Ulang Halaman
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={this.handleReset}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
