import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { cn } from '../lib/cn'

const ICONS = {
  success: { Icon: CheckCircle2, classes: 'text-green-600' },
  error: { Icon: AlertCircle, classes: 'text-red-600' },
  info: { Icon: Info, classes: 'text-blue-600' },
}

export function ToastViewport() {
  const { toasts, dismissToast } = useApp()
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { Icon, classes } = ICONS[t.variant]
        return (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card-lg">
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', classes)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">{t.description}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Dismiss notification">
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
