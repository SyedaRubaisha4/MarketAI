import { cn } from '../lib/cn'
import type { ProductStatus } from '../types'

const STATUS_STYLES: Record<ProductStatus, { label: string; classes: string; dot: string }> = {
  draft: { label: 'Draft', classes: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  generating: { label: 'Generating', classes: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  content_ready: { label: 'Content Ready', classes: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  needs_review: { label: 'Needs Review', classes: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  approved: { label: 'Approved', classes: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  scheduled: { label: 'Scheduled', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  published: { label: 'Published', classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  generation_failed: { label: 'Generation Failed', classes: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
}

export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', s.classes, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  )
}
