import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Dialog({ open, onClose, title, description, children, footer, wide }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn(
        'relative w-full bg-white shadow-card-lg flex flex-col max-h-[92vh] rounded-t-2xl sm:rounded-2xl',
        wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
      )}>
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, loading }: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <button onClick={onClose} className="h-10 px-4 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex h-10 px-4 items-center justify-center text-sm font-semibold rounded-xl text-white shadow-sm disabled:opacity-60',
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700',
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      )}
    >
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </Dialog>
  )
}
