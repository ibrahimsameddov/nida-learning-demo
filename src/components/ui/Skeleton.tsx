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

// ─── Teacher Dashboard Skeleton ───────────────────────────────────────────────
const T_STAT_KEYS = ['ts-a', 'ts-b', 'ts-c', 'ts-d']
const T_ROW_KEYS  = ['tr-a', 'tr-b', 'tr-c', 'tr-d', 'tr-e']

export function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-4 gap-3">
        {T_STAT_KEYS.map(k => <Skeleton key={k} className="h-16" />)}
      </div>
      <Skeleton className="h-6 w-40" variant="text" />
      {T_ROW_KEYS.map(k => (
        <div key={k} className="flex gap-3 items-center">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// ─── Parent Dashboard Skeleton ────────────────────────────────────────────────
const P_CARD_KEYS = ['pc-a', 'pc-b']
const P_ROW_KEYS  = ['pr-a', 'pr-b', 'pr-c']

export function ParentDashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">
        {P_CARD_KEYS.map(k => <Skeleton key={k} className="h-24" />)}
      </div>
      <Skeleton className="h-6 w-32" variant="text" />
      {P_ROW_KEYS.map(k => (
        <div key={k} className="flex gap-3 items-center">
          <Skeleton className="h-12 w-12" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Statistics Skeleton ──────────────────────────────────────────────────────
export function StatisticsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        {['ss-a', 'ss-b', 'ss-c'].map(k => <Skeleton key={k} className="h-20" />)}
      </div>
      <Skeleton className="h-48 w-full" /> {/* Radar chart */}
      <Skeleton className="h-40 w-full" /> {/* Bar chart */}
      <Skeleton className="h-32 w-full" /> {/* Heatmap */}
    </div>
  )
}

// ─── Homework Skeleton ────────────────────────────────────────────────────────
const HW_KEYS = ['hw-a', 'hw-b', 'hw-c']

export function HomeworkSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-48" variant="text" />
      {HW_KEYS.map(k => (
        <div key={k} className="space-y-2" style={{ padding: '14px', borderRadius: 12, border: '0.5px solid var(--border-card)' }}>
          <Skeleton className="h-5 w-2/3" variant="text" />
          <Skeleton className="h-4 w-1/2" variant="text" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Messages Skeleton ────────────────────────────────────────────────────────
const MSG_KEYS = ['mg-a', 'mg-b', 'mg-c', 'mg-d']

export function MessagesSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {MSG_KEYS.map((k, i) => (
        <div key={k} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <Skeleton className="h-8 w-8 flex-shrink-0" variant="circular" />
          <div className={`space-y-1 max-w-[70%] ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
            <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-20' : 'w-16'}`} variant="text" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Card Skeleton (generic) ──────────────────────────────────────────────────
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  )
}
