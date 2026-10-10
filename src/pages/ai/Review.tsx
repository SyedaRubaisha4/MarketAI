import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Check, CheckCheck, Pencil, RefreshCw, Sparkles, Package, ArrowLeft,
  Type, AlignLeft, FileText, Search, Instagram, Facebook, MessageCircle, Image as ImageIcon,
} from 'lucide-react'
import { useApp, buildContentFor, useTrialStatus } from '../../store/AppContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/EmptyState'
import { TagInput } from '../../components/TagInput'
import { PlatformIcon } from '../../components/PlatformIcon'
import { PLATFORM_META } from '../../data/mockData'
import { cn } from '../../lib/cn'
import type { ContentSectionKey, GeneratedContent } from '../../types'

const SECTION_ORDER: { key: ContentSectionKey; title: string; icon: typeof Type }[] = [
  { key: 'product_name', title: 'Product Name', icon: Type },
  { key: 'short_description', title: 'Short Description', icon: AlignLeft },
  { key: 'full_description', title: 'Full Description', icon: FileText },
  { key: 'seo', title: 'SEO Package', icon: Search },
  { key: 'instagram', title: 'Instagram Caption', icon: Instagram },
  { key: 'facebook', title: 'Facebook Post', icon: Facebook },
  { key: 'whatsapp', title: 'WhatsApp Message', icon: MessageCircle },
  { key: 'image', title: 'Generated Image', icon: ImageIcon },
]

export default function Review() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const {
    products, contents, updateContent, approveSection, setContent, setProductStatus, toast, brand,
  } = useApp()
  const trialBlocked = useTrialStatus() === 'expired'
  const product = products.find((p) => p.id === productId)
  const content = productId ? contents[productId] : undefined
  const [variant, setVariant] = useState(1)

  const approvedCount = useMemo(
    () => content ? Object.values(content.sections).filter((s) => s.approved).length : 0,
    [content],
  )
  const total = content ? Object.keys(content.sections).length : 0

  if (!product || !content) {
    return (
      <EmptyState
        icon={Sparkles}
        title={product ? 'No content to review' : 'Product not found'}
        description={product ? 'Generate a marketing package first.' : 'This product may have been deleted.'}
        action={<ButtonLink to={product ? `/products/${product.id}/generate` : '/products'}>{product ? 'Generate Content' : 'Back to Products'}</ButtonLink>}
      />
    )
  }

  const refreshSection = (key: ContentSectionKey, v: number) => {
    const fresh = buildContentFor(product, brand, v)
    updateContent(product.id, (c) => {
      const next: GeneratedContent = { ...c }
      if (key === 'product_name') { next.names = fresh.names; next.selectedName = fresh.selectedName }
      if (key === 'short_description') next.shortDescription = fresh.shortDescription
      if (key === 'full_description') { next.fullDescription = fresh.fullDescription; next.features = fresh.features }
      if (key === 'seo') next.seo = fresh.seo
      if (key === 'instagram') next.instagram = fresh.instagram
      if (key === 'facebook') next.facebook = fresh.facebook
      if (key === 'whatsapp') next.whatsapp = fresh.whatsapp
      next.sections = { ...next.sections, [key]: { key, approved: false } }
      next.generatedAt = new Date().toISOString()
      return next
    })
    setProductStatus(product.id, 'needs_review')
  }

  const regenerateSection = (key: ContentSectionKey) => {
    if (trialBlocked) {
      toast('Trial expired', { description: 'Upgrade to regenerate content.', variant: 'error' })
      return
    }
    const v = variant + 1
    setVariant(v)
    refreshSection(key, v)
    toast('Section regenerated', { description: 'New version needs your review before approval.', variant: 'info' })
  }

  const regenerateAll = () => {
    if (trialBlocked) {
      toast('Trial expired', { description: 'Upgrade to regenerate content.', variant: 'error' })
      return
    }
    const v = variant + 1
    setVariant(v)
    setContent(product.id, buildContentFor(product, brand, v))
    setProductStatus(product.id, 'needs_review')
    toast('Full package regenerated', { description: 'All sections need review again.', variant: 'info' })
  }

  const approveAll = () => {
    setContent(product.id, {
      ...content,
      sections: Object.fromEntries(Object.keys(content.sections).map((k) => [k, { key: k as ContentSectionKey, approved: true }])) as GeneratedContent['sections'],
    })
    setProductStatus(product.id, 'approved')
    toast('All sections approved', { description: 'You can now publish or schedule this content.' })
    navigate(`/publish/${product.id}`)
  }

  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0]

  return (
    <div className="space-y-6">
      <Link to={`/products/${product.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Product
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-1 items-center gap-4">
          {primary && <img src={primary.url} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Review Generated Content</p>
            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">
              Generated {new Date(content.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={regenerateAll}><RefreshCw className="h-4 w-4" aria-hidden /> Regenerate All</Button>
          <Button onClick={approveAll}><CheckCheck className="h-4 w-4" aria-hidden /> Approve All &amp; Continue</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {SECTION_ORDER.map(({ key, title, icon }) => (
            <SectionCard
              key={key}
              sectionKey={key}
              title={title}
              icon={icon}
              content={content}
              approved={content.sections[key].approved}
              onApprove={() => approveSection(product.id, key)}
              onRegenerate={() => regenerateSection(key)}
              onEditSave={(updater) => {
                updateContent(product.id, (c) => {
                  const next = updater(c)
                  next.sections = { ...next.sections, [key]: { key, approved: false } }
                  next.generatedAt = new Date().toISOString()
                  return next
                })
                setProductStatus(product.id, 'needs_review')
              }}
            />
          ))}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Approval Progress</h2>
            <p className="mt-1 text-sm text-slate-500">{approvedCount} of {total} sections approved</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" style={{ width: `${(approvedCount / total) * 100}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {SECTION_ORDER.map(({ key, title }) => (
                <li key={key} className="flex items-center gap-2 text-sm">
                  {content.sections[key].approved
                    ? <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                    : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" aria-hidden />}
                  <span className={content.sections[key].approved ? 'text-slate-500' : 'font-medium text-slate-700'}>{title}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-5 w-full" onClick={approveAll} disabled={approvedCount === total && product.status === 'approved'}>
              <CheckCheck className="h-4 w-4" aria-hidden /> Approve All &amp; Continue
            </Button>
            <p className="mt-3 text-center text-xs text-slate-400">Approving everything takes you straight to publishing.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

interface SectionCardProps {
  sectionKey: ContentSectionKey
  title: string
  icon: typeof Type
  content: GeneratedContent
  approved: boolean
  onApprove: () => void
  onRegenerate: () => void
  onEditSave: (updater: (c: GeneratedContent) => GeneratedContent) => void
}

function SectionCard({ sectionKey, title, icon: Icon, content, approved, onApprove, onRegenerate, onEditSave }: SectionCardProps) {
  const [editing, setEditing] = useState(false)
  const approvedChip = (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
      approved ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700',
    )}>
      {approved ? <Check className="h-3 w-3" aria-hidden /> : <Pencil className="h-3 w-3" aria-hidden />}
      {approved ? 'Approved' : 'Needs review'}
    </span>
  )

  return (
    <section className={cn('card transition-shadow', approved && 'border-green-200/80')}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', approved ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600')}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        {approvedChip}
      </header>

      <div className="px-5 py-4">
        {sectionKey === 'product_name' && (
          <NameSection content={content} editing={editing} onEditSave={onEditSave} />
        )}
        {sectionKey === 'short_description' && (
          <TextSection
            value={content.shortDescription} editing={editing} rows={3}
            onSave={(v) => onEditSave((c) => ({ ...c, shortDescription: v }))}
          />
        )}
        {sectionKey === 'full_description' && (
          <div className="space-y-4">
            <TextSection
              value={content.fullDescription} editing={editing} rows={8}
              onSave={(v) => onEditSave((c) => ({ ...c, fullDescription: v }))}
            />
            {!editing && content.features.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {content.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {sectionKey === 'seo' && (
          <SeoSection content={content} editing={editing} onEditSave={onEditSave} />
        )}
        {sectionKey === 'instagram' && (
          <InstagramSection content={content} editing={editing} onEditSave={onEditSave} />
        )}
        {sectionKey === 'facebook' && (
          <FacebookSection content={content} editing={editing} onEditSave={onEditSave} />
        )}
        {sectionKey === 'whatsapp' && (
          <WhatsAppSection content={content} editing={editing} onEditSave={onEditSave} />
        )}
        {sectionKey === 'image' && (
          <ImageSection content={content} />
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3.5">
        <SectionButton onClick={() => setEditing((e) => !e)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing ? 'Stop Editing' : 'Edit'}
        </SectionButton>
        <SectionButton onClick={onRegenerate}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Regenerate
        </SectionButton>
        <Button
          size="sm"
          variant={approved ? 'secondary' : 'primary'}
          className="ml-auto"
          onClick={onApprove}
        >
          <Check className="h-3.5 w-3.5" aria-hidden /> {approved ? 'Unapprove' : 'Approve'}
        </Button>
      </footer>
    </section>
  )
}

function SectionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900">
      {children}
    </button>
  )
}

function NameSection({ content, editing, onEditSave }: { content: GeneratedContent; editing: boolean; onEditSave: SectionCardProps['onEditSave'] }) {
  if (editing) {
    return (
      <div className="space-y-3">
        {content.names.map((n, i) => (
          <label key={n} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:border-primary-400">
            <input
              type="radio"
              name="product-name-choice"
              checked={content.selectedName === n}
              onChange={() => onEditSave((c) => ({ ...c, selectedName: n }))}
              className="h-4 w-4 accent-primary-600"
            />
            <span className="text-sm text-slate-800">
              {n}
              {i === 0 && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">AI favorite</span>}
            </span>
          </label>
        ))}
        <p className="text-xs text-slate-400">Pick a suggestion or regenerate for more options.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <p className="text-lg font-bold text-slate-900">{content.selectedName}</p>
      <div className="flex flex-wrap gap-2">
        {content.names.filter((n) => n !== content.selectedName).map((n) => (
          <span key={n} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{n}</span>
        ))}
      </div>
    </div>
  )
}

function TextSection({ value, editing, rows, onSave }: { value: string; editing: boolean; rows: number; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value)
  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={rows}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setDraft(value)}>Reset</Button>
          <Button size="sm" onClick={() => onSave(draft)} disabled={!draft.trim()}>Save</Button>
        </div>
      </div>
    )
  }
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
      {value.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
    </p>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const pct = Math.round((value.length / max) * 100)
  return (
    <span className={cn('text-xs font-medium', value.length > max ? 'text-red-600' : pct > 85 ? 'text-amber-600' : 'text-slate-400')}>
      {value.length}/{max}
    </span>
  )
}

function SeoSection({ content, editing, onEditSave }: { content: GeneratedContent; editing: boolean; onEditSave: SectionCardProps['onEditSave'] }) {
  const [seo, setSeo] = useState(content.seo)
  if (!editing) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">SEO Title</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{content.seo.title}</p>
          <div className="mt-1"><CharCount value={content.seo.title} max={70} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Meta Description</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{content.seo.metaDescription}</p>
          <div className="mt-1"><CharCount value={content.seo.metaDescription} max={160} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">SEO Keywords</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {content.seo.keywords.map((k) => (
              <span key={k} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{k}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-sm font-medium text-slate-700">
          SEO Title <CharCount value={seo.title} max={70} />
        </label>
        <input value={seo.title} onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
      </div>
      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-sm font-medium text-slate-700">
          Meta Description <CharCount value={seo.metaDescription} max={160} />
        </label>
        <textarea value={seo.metaDescription} onChange={(e) => setSeo((s) => ({ ...s, metaDescription: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
      </div>
      <TagInput label="SEO Keywords" tags={seo.keywords} onChange={(keywords) => setSeo((s) => ({ ...s, keywords }))} placeholder="Add keyword + Enter" />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => onEditSave((c) => ({ ...c, seo }))} disabled={!seo.title.trim()}>Save</Button>
      </div>
    </div>
  )
}

function InstagramSection({ content, editing, onEditSave }: { content: GeneratedContent; editing: boolean; onEditSave: SectionCardProps['onEditSave'] }) {
  const [ig, setIg] = useState(content.instagram)
  if (editing) {
    return (
      <div className="space-y-3">
        <textarea value={ig.caption} onChange={(e) => setIg((v) => ({ ...v, caption: e.target.value }))} rows={5} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
        <TagInput label="Hashtags" tags={ig.hashtags} onChange={(hashtags) => setIg((v) => ({ ...v, hashtags }))} placeholder="Add hashtag + Enter" />
        <div className="flex items-center justify-between">
          <CharCount value={ig.caption} max={2200} />
          <Button size="sm" onClick={() => onEditSave((c) => ({ ...c, instagram: ig }))} disabled={!ig.caption.trim()}>Save</Button>
        </div>
      </div>
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
      <div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{content.instagram.caption}</p>
        <p className="mt-2 text-sm text-primary-600">{content.instagram.hashtags.join(' ')}</p>
        <div className="mt-2"><CharCount value={content.instagram.caption} max={2200} /></div>
      </div>
      {content.imageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <img src={content.imageUrl} alt="Instagram preview" className="aspect-square w-full object-cover" />
        </div>
      )}
    </div>
  )
}

function FacebookSection({ content, editing, onEditSave }: { content: GeneratedContent; editing: boolean; onEditSave: SectionCardProps['onEditSave'] }) {
  const [fb, setFb] = useState(content.facebook)
  if (editing) {
    return (
      <div className="space-y-3">
        <textarea value={fb.caption} onChange={(e) => setFb((v) => ({ ...v, caption: e.target.value }))} rows={7} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
        <div className="flex justify-end"><Button size="sm" onClick={() => onEditSave((c) => ({ ...c, facebook: fb }))} disabled={!fb.caption.trim()}>Save</Button></div>
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <PlatformIcon platform="facebook" className="h-8 w-8 rounded-full" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{PLATFORM_META.facebook.name}</p>
          <p className="text-xs text-slate-400">Just now · Public</p>
        </div>
      </div>
      <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-slate-700">{content.facebook.caption}</p>
      {content.imageUrl && <img src={content.imageUrl} alt="Facebook post preview" className="max-h-64 w-full object-cover" />}
    </div>
  )
}

function WhatsAppSection({ content, editing, onEditSave }: { content: GeneratedContent; editing: boolean; onEditSave: SectionCardProps['onEditSave'] }) {
  const [wa, setWa] = useState(content.whatsapp)
  if (editing) {
    return (
      <div className="space-y-3">
        <textarea value={wa.message} onChange={(e) => setWa((v) => ({ ...v, message: e.target.value }))} rows={8} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
        <div className="flex justify-end"><Button size="sm" onClick={() => onEditSave((c) => ({ ...c, whatsapp: wa }))} disabled={!wa.message.trim()}>Save</Button></div>
      </div>
    )
  }
  return (
    <div className="max-w-md">
      <div className="rounded-2xl rounded-tl-md bg-[#dcf8c6] px-4 py-3 shadow-sm">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{content.whatsapp.message}</p>
        <p className="mt-1 text-right text-[10px] text-slate-500">now ✓✓</p>
      </div>
    </div>
  )
}

function ImageSection({ content }: { content: GeneratedContent }) {
  if (!content.imageUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
        <Package className="h-5 w-5 text-slate-400" aria-hidden />
        No enhanced visual generated — the original product image will be used.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <img src={content.imageUrl} alt="Generated marketing visual" className="h-44 w-44 rounded-xl border border-slate-200 object-cover" />
      <div className="space-y-1.5 text-sm text-slate-500">
        <p className="font-medium text-slate-700">Enhanced product visual (mock)</p>
        <p>Image enhancement is simulated in this demo — the original product photo is shown as the marketing visual.</p>
      </div>
    </div>
  )
}
