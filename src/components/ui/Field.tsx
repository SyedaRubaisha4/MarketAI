import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '../../lib/cn'

interface FieldShellProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: (id: string) => React.ReactNode
  className?: string
}

export function FieldShell({ label, error, hint, required, children, className }: FieldShellProps) {
  const id = useId()
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      {children(id)}
      {error
        ? <p className="text-sm text-red-600" role="alert">{error}</p>
        : hint
          ? <p className="text-sm text-slate-600">{hint}</p>
          : null}
    </div>
  )
}

const controlClasses = (invalid?: boolean) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400',
    'h-10 transition-colors disabled:cursor-not-allowed disabled:bg-slate-50',
    invalid ? 'border-red-400 focus:border-red-500' : 'border-slate-300 hover:border-slate-400 focus:border-primary-500',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
  )

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, required, className, id: idProp, ...props }, ref) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {(autoId) => <input ref={ref} id={idProp ?? autoId} className={controlClasses(!!error)} aria-invalid={!!error} {...props} />}
    </FieldShell>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, required, className, id: idProp, rows = 4, ...props }, ref) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {(autoId) => <textarea ref={ref} id={idProp ?? autoId} rows={rows} className={cn(controlClasses(!!error), 'h-auto py-2.5 leading-relaxed')} aria-invalid={!!error} {...props} />}
    </FieldShell>
  )
})

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, required, className, id: idProp, options, placeholder, ...props }, ref) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {(autoId) => (
        <select ref={ref} id={idProp ?? autoId} className={controlClasses(!!error)} aria-invalid={!!error} {...props}>
          {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </FieldShell>
  )
})
