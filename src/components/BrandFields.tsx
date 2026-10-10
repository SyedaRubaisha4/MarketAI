import type { LucideIcon } from 'lucide-react'
import { Palette, Users, Languages, Ban, KeyRound, FileText } from 'lucide-react'
import { Input, Select, Textarea } from './ui/Field'
import { TagInput } from './TagInput'
import { TONES } from '../data/mockData'
import { cn } from '../lib/cn'
import type { BrandProfile } from '../types'

export interface BrandFieldErrors {
  description?: string
  targetCustomers?: string
}

export function BrandSectionTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

interface BrandFieldsProps {
  form: BrandProfile
  update: (patch: Partial<BrandProfile>) => void
  errors: BrandFieldErrors
  setError: (key: keyof BrandFieldErrors, message?: string) => void
}

export function BrandFields({ form, update, errors, setError }: BrandFieldsProps) {
  const toggleTone = (tone: string) =>
    update({ tones: form.tones.includes(tone) ? form.tones.filter((t) => t !== tone) : [...form.tones, tone] })

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <BrandSectionTitle icon={FileText} title="Business Description" subtitle="What you sell, who it's for, and why people buy from you." />
        <Textarea
          placeholder="We sell quality electronics at affordable prices for Pakistani families."
          value={form.description}
          onChange={(e) => { update({ description: e.target.value }); setError('description') }}
          error={errors.description}
          rows={3}
        />
      </section>

      <section className="space-y-4">
        <BrandSectionTitle icon={Palette} title="Tone of Voice" subtitle="How should your content sound? Select one or more." />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tone of voice">
          {TONES.map((tone) => {
            const selected = form.tones.includes(tone)
            return (
              <button
                key={tone}
                type="button"
                onClick={() => toggleTone(tone)}
                aria-pressed={selected}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700',
                )}
              >
                {tone}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <BrandSectionTitle icon={Users} title="Target Customers" subtitle="Describe your ideal audience." />
        <Input
          placeholder="Middle-class families, 25–45 years old."
          value={form.targetCustomers}
          onChange={(e) => { update({ targetCustomers: e.target.value }); setError('targetCustomers') }}
          error={errors.targetCustomers}
        />
      </section>

      <section className="space-y-4">
        <BrandSectionTitle icon={Languages} title="Language" subtitle="The language your content should be written in." />
        <Select
          value={form.language}
          onChange={(e) => update({ language: e.target.value as BrandProfile['language'] })}
          options={['English', 'Urdu', 'English + Urdu'].map((l) => ({ value: l, label: l }))}
        />
      </section>

      <section className="space-y-4">
        <BrandSectionTitle icon={Ban} title="Words to Avoid" subtitle="Words AI should never use in your content." />
        <TagInput
          placeholder="Type a word and press Enter"
          tags={form.wordsToAvoid}
          onChange={(tags) => update({ wordsToAvoid: tags })}
          hint="Example: cheap, fake, broken"
        />
      </section>

      <section className="space-y-4">
        <BrandSectionTitle icon={KeyRound} title="Brand Keywords" subtitle="Attributes you want emphasized in every post." />
        <TagInput
          placeholder="Add a keyword and press Enter"
          tags={form.keywords}
          onChange={(tags) => update({ keywords: tags })}
          hint="Example: reliable, affordable, quality, trusted"
          suggested={['trusted', 'handmade', 'premium', 'fast delivery', 'customer favorite', 'eco-friendly']}
        />
      </section>
    </div>
  )
}
