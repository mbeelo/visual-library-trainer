import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './ErrorState'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <ErrorState
            title="Application Error"
            message="We encountered an unexpected error. Please try refreshing the page or return to the dashboard."
            actionText="Refresh Page"
            onAction={() => window.location.reload()}
            onGoHome={() => window.location.href = '/app/dashboard'}
          />
        </div>
      )
    }

    return this.props.children
  }
}