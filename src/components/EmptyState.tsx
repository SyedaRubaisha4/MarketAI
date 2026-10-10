import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('card flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} aria-hidden />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" role="status" aria-label="Loading" />
    </div>
  )
}
