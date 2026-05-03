import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--bg-muted)]',
        variant === 'circular'    && 'rounded-full',
        variant === 'text'        && 'rounded h-4',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      aria-hidden="true"
    />
  )
}

const STAT_KEYS  = ['stat-a', 'stat-b', 'stat-c']
const ROW_KEYS   = ['row-a',  'row-b',  'row-c']

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-3 gap-3">
        {STAT_KEYS.map(k => <Skeleton key={k} className="h-16" />)}
      </div>
      {ROW_KEYS.map(k => (
        <div key={k} className="flex gap-3 items-center">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  )
}

