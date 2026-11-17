import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'
import type { ElementType } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  iconClasses?: string
  hint?: string
}

export function StatCard({ label, value, icon: Icon, colorClass = "bg-slate-100 text-slate-600" }: { label: string, value: number | string, icon: ElementType, colorClass?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  )
}

