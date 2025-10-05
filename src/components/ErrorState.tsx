import { AlertTriangle, RefreshCw, Home, Wifi, FileX } from 'lucide-react'

interface ErrorStateProps {
  type?: 'network' | 'notfound' | 'generic' | 'permission'
  title?: string
  message?: string
  actionText?: string
  onAction?: () => void
  showHomeButton?: boolean
  onGoHome?: () => void
}

export function ErrorState({
  type = 'generic',
  title,
  message,
  actionText,
  onAction,
  showHomeButton = true,
  onGoHome
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="w-12 h-12 text-red-400" />,
          defaultTitle: 'Connection Problem',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
          defaultActionText: 'Try Again'
        }
      case 'notfound':
        return {
          icon: <FileX className="w-12 h-12 text-orange-400" />,
          defaultTitle: 'Page Not Found',
          defaultMessage: 'The page you\'re looking for doesn\'t exist or has been moved.',
          defaultActionText: 'Go Back'
        }
      case 'permission':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-orange-400" />,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource.',
          defaultActionText: 'Try Again'
        }
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-400" />,
          defaultTitle: 'Something Went Wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          defaultActionText: 'Retry'
        }
    }
  }

  const config = getErrorConfig()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          {config.icon}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {title || config.defaultTitle}
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          {message || config.defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAction && (
            <button
              onClick={onAction}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {actionText || config.defaultActionText}
            </button>
          )}

          {showHomeButton && onGoHome && (
            <button
              onClick={onGoHome}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2 border border-slate-600"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Specific error components for common use cases
export function NetworkError({ onRetry, onGoHome }: { onRetry?: () => void; onGoHome?: () => void }) {
  return (
    <ErrorState
      type="network"
      onAction={onRetry}
      onGoHome={onGoHome}
    />
  )
}

export function NotFoundError({ onGoBack, onGoHome }: { onGoBack?: () => void; onGoHome?: () => void }) {
  return (
    <ErrorState
      type="notfound"
      onAction={onGoBack}
      actionText="Go Back"
      onGoHome={onGoHome}
    />
  )
}

export function PermissionError({ onRetry, onGoHome }: { onRetry?: () => void; onGoHome?: () => void }) {
  return (
    <ErrorState
      type="permission"
      onAction={onRetry}
      onGoHome={onGoHome}
    />
  )
}