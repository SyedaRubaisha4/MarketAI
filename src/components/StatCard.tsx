import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  iconClasses?: string
  hint?: string
}

export function StatCard({ label, value, icon: Icon, iconClasses, hint }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600', iconClasses)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
