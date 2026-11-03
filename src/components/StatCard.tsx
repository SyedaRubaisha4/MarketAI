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
    <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-card transition-shadow hover:shadow-card-lg sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="whitespace-nowrap pt-1 text-xs font-medium text-slate-600">{label}</p>
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700', iconClasses)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
