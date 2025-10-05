import { Loader2, Eye, Brain, Image } from 'lucide-react'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'page' | 'inline'
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  type = 'spinner',
  message = 'Loading...',
  size = 'md',
  className = ''
}: LoadingStateProps) {

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <Loader2 className={`${sizeClasses[size]} text-orange-400 animate-spin`} />
        {message && <span className="text-slate-300 text-sm">{message}</span>}
      </div>
    )
  }

  if (type === 'page') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading</h2>
          <p className="text-slate-400">{message}</p>
        </div>
      </div>
    )
  }

  if (type === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Loader2 className={`${sizeClasses[size]} text-orange-400 animate-spin`} />
        {message && <span className="text-slate-400 text-sm">{message}</span>}
      </div>
    )
  }

  // Skeleton type
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-slate-700 rounded h-4 w-full mb-2"></div>
      <div className="bg-slate-700 rounded h-4 w-3/4"></div>
    </div>
  )
}

// Specialized loading components
export function PracticeLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-400/20 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-orange-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Session</h2>
        <p className="text-slate-400">Getting your visual memory training ready...</p>
      </div>
    </div>
  )
}

export function ImageLoading() {
  return (
    <div className="aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center animate-pulse">
      <div className="text-center">
        <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <span className="text-slate-400 text-sm">Loading image...</span>
      </div>
    </div>
  )
}

export function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <div className="text-center space-y-4">
          <div className="h-8 bg-slate-700 rounded w-2/3 mx-auto"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
          <div className="h-12 bg-slate-700 rounded w-40 mx-auto"></div>
        </div>
      </div>

      {/* Lists skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="h-6 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
            <div className="p-6 bg-slate-700/30 space-y-3">
              <div className="h-16 bg-slate-700 rounded"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-slate-700 rounded flex-1"></div>
                <div className="h-10 bg-slate-700 rounded flex-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton components for specific UI elements
export function ListCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
      <div className="p-6 border-b border-slate-700">
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
      </div>

      <div className="p-6 bg-slate-700/30">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center space-y-2">
            <div className="h-6 bg-slate-700 rounded w-12 mx-auto"></div>
            <div className="h-3 bg-slate-700 rounded w-16 mx-auto"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-6 bg-slate-700 rounded w-12 mx-auto"></div>
            <div className="h-3 bg-slate-700 rounded w-16 mx-auto"></div>
          </div>
        </div>

        <div className="h-2 bg-slate-700 rounded mb-4"></div>
      </div>

      <div className="p-6 bg-slate-800">
        <div className="flex gap-3">
          <div className="h-10 bg-slate-700 rounded flex-1"></div>
          <div className="h-10 bg-slate-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}