import { X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/cn'

interface TagInputProps {
  label?: string
  placeholder?: string
  tags: string[]
  onChange: (tags: string[]) => void
  hint?: string
  suggested?: string[]
}

export function TagInput({ label, placeholder = 'Type and press Enter', tags, onChange, hint, suggested }: TagInputProps) {
  const [value, setValue] = useState('')

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '')
    if (!tag) return
    if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...tags, tag])
    setValue('')
  }

  return (
    <div className="space-y-1.5">
      {label && <span className="block text-sm font-medium text-slate-700">{label}</span>}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-2',
          'hover:border-slate-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
        )}
      >
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-primary-50 border border-primary-200 px-2 py-1 text-xs font-medium text-primary-800">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="rounded-full p-0.5 hover:bg-primary-100" aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (v.endsWith(',')) { add(v); return }
            setValue(v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(value) }
            if (e.key === 'Backspace' && value === '' && tags.length) onChange(tags.slice(0, -1))
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {suggested && suggested.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggested.filter((s) => !tags.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  )
}
