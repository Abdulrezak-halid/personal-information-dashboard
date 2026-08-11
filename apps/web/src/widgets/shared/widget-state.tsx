import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui'

export function WidgetStatus({
  loading,
  error,
  empty,
  onRefresh,
  children,
}: {
  loading: boolean
  error?: Error | null
  empty?: boolean
  onRefresh?: () => void
  children: ReactNode
}) {
  if (loading)
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="h-8 w-2/3 animate-pulse rounded bg-white/8" />
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-5 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>
    )
  if (error)
    return (
      <div className="grid h-full place-items-center text-center">
        <div>
          <AlertTriangle className="mx-auto mb-2 text-amber-300" size={24} />
          <p className="max-w-xs text-sm text-[var(--muted)]">{error.message}</p>
          {onRefresh && (
            <Button variant="ghost" className="mt-2" onClick={onRefresh}>
              <RefreshCw size={14} />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  if (empty)
    return (
      <div className="grid h-full place-items-center text-sm text-[var(--muted)]">
        Nothing to show yet.
      </div>
    )
  return children
}

export function UpdatedAt({ value, demo }: { value?: number | string; demo?: boolean }) {
  const date = typeof value === 'number' ? new Date(value) : value ? new Date(value) : null
  return (
    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-[var(--muted)]">
      <span>
        {date
          ? `Updated ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Not updated'}
      </span>
      {demo && (
        <span className="rounded bg-amber-400/12 px-1.5 py-0.5 text-amber-300">Demo data</span>
      )}
    </div>
  )
}
