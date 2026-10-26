import type { ReactNode } from 'react'
import { Loader } from '@/components/atoms/Loader'

type PanelStateProps = {
  loading: boolean
  error: string
  empty: boolean
  emptyMessage: string
  loadingLabel?: string
  onRetry: () => void
  children: ReactNode
}

export function PanelState({
  loading,
  error,
  empty,
  emptyMessage,
  loadingLabel = 'Loading',
  onRetry,
  children,
}: PanelStateProps) {
  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader label={loadingLabel} size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-sm text-error">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 cursor-pointer text-sm font-semibold text-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="glass-panel p-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </div>
    )
  }

  return children
}
