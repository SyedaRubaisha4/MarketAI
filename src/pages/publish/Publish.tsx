import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Send, Check, Link2, Sparkles } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/EmptyState'
import { PlatformIcon } from '../../components/PlatformIcon'
import { PLATFORM_META } from '../../data/mockData'
import { cn } from '../../lib/cn'
import type { Platform } from '../../types'

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'whatsapp', 'tiktok', 'pinterest', 'linkedin']

function captionFor(platform: Platform, content: NonNullable<ReturnType<typeof useApp>['contents'][string]>): string {
  switch (platform) {
    case 'instagram': return content.instagram.caption
    case 'facebook': return content.facebook.caption
    case 'whatsapp': return content.whatsapp.message
    default: return content.shortDescription
  }
}

export default function Publish() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const {
    products, contents, socialAccounts, schedulePost, setProductStatus, toast, addNotification,
  } = useApp()
  const product = products.find((p) => p.id === productId)
  const content = productId ? contents[productId] : undefined

  const [selected, setSelected] = useState<Platform[]>([])
  const [previewPlatform, setPreviewPlatform] = useState<Platform | null>(null)
  const [mode, setMode] = useState<'now' | 'later'>('now')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState<{ date?: string; time?: string; platforms?: string }>({})
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const connectedAccounts = useMemo(
    () => socialAccounts.filter((a) => a.connected && selected.includes(a.platform)),
    [socialAccounts, selected],
  )

  if (!product || !content) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Nothing to publish yet"
        description="Generate and approve content for a product before publishing."
        action={<ButtonLink to="/ai-studio">Open AI Studio</ButtonLink>}
      />
    )
  }

  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0]
  const approvedPlatforms = selected.filter((p) => socialAccounts.find((a) => a.platform === p)?.connected)
  const effectivePreview = previewPlatform && selected.includes(previewPlatform) ? previewPlatform : approvedPlatforms[0]

  const toggle = (p: Platform) => {
    setErrors((e) => ({ ...e, platforms: undefined }))
    setSelected((sel) => {
      const next = sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p]
      return next
    })
    setPreviewPlatform(null)
  }

  const validate = () => {
    const er: typeof errors = {}
    if (selected.length === 0) er.platforms = 'Select at least one connected platform.'
    if (mode === 'later') {
      if (!date) er.date = 'Choose a date.'
      if (!time) er.time = 'Choose a time.'
      if (date && time) {
        const when = new Date(`${date}T${time}`)
        if (when.getTime() <= Date.now()) er.time = 'Scheduled time must be in the future.'
      }
    }
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const doPublish = () => {
    setConfirming(false)
    setBusy(true)
    window.setTimeout(() => {
      if (mode === 'now') {
        approvedPlatforms.forEach((platform) => {
          schedulePost({
            productId: product.id, platform, date: new Date().toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 5), title: `${product.name} — Published`,
            imageUrl: primary?.url ?? null,
          })
        })
        // mark the just-created posts as published
        setProductStatus(product.id, 'published')
        toast('Content published (simulated)', {
          description: `Posted to ${approvedPlatforms.map((p) => PLATFORM_META[p].name).join(', ')}. No real network was contacted.`,
        })
        addNotification('Post published', `${product.name} was published to ${approvedPlatforms.length} platform(s).`)
        setBusy(false)
        navigate('/dashboard')
      } else {
        approvedPlatforms.forEach((platform) => {
          schedulePost({
            productId: product.id, platform, date: date, time: time,
            title: `${product.name} — ${PLATFORM_META[platform].name} Post`, imageUrl: primary?.url ?? null,
          })
        })
        setProductStatus(product.id, 'scheduled')
        toast('Post scheduled', {
          description: `${approvedPlatforms.length} post(s) added to your calendar for ${date} at ${time}.`,
        })
        addNotification('Posts scheduled', `${product.name}: ${approvedPlatforms.length} post(s) on ${date} at ${time}.`)
        setBusy(false)
        navigate('/calendar')
      }
    }, 1200)
  }

  const submit = () => {
    if (!validate()) return
    setConfirming(true)
  }

  return (
    <div className="space-y-6">
      <Link to={`/products/${product.id}/review`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Review
      </Link>

      <div className="flex items-center gap-4">
        {primary && <img src={primary.url} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Content Approved</p>
          <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-500">Where would you like to publish your content?</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Choose Platforms</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PLATFORMS.map((p) => {
                const account = socialAccounts.find((a) => a.platform === p)!
                const isSelected = selected.includes(p)
                const disabled = !account.connected
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(p)}
                    aria-pressed={isSelected}
                    className={cn(
                      'relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors',
                      disabled
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                        : isSelected
                          ? 'border-primary-500 bg-primary-50/60'
                          : 'border-slate-200 bg-white hover:border-primary-300',
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                    )}
                    <PlatformIcon platform={p} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{PLATFORM_META[p].name}</p>
                      {account.connected ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {PLATFORM_META[p].handlePrefix}{account.identifier}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-slate-400">Not connected</p>
                      )}
                    </div>
                    {disabled && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); navigate('/social-accounts') }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate('/social-accounts') } }}
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                      >
                        <Link2 className="h-3 w-3" aria-hidden /> Connect
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {errors.platforms && <p className="mt-2 text-sm text-red-600" role="alert">{errors.platforms}</p>}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900">When to Publish</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                { value: 'now', icon: Send, title: 'Post Now', desc: 'Publish immediately' },
                { value: 'later', icon: CalendarClock, title: 'Schedule for Later', desc: 'Pick a date and time' },
              ] as const).map(({ value, icon: Icon, title, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors',
                    mode === value ? 'border-primary-500 bg-primary-50/60' : 'border-slate-200 hover:border-primary-300',
                  )}
                >
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', mode === value ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500')}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {mode === 'later' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="sched-date" className="block text-sm font-medium text-slate-700">Date</label>
                  <input
                    id="sched-date" type="date" value={date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: undefined, time: undefined })) }}
                    className={cn('h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20', errors.date || errors.time ? 'border-red-400' : 'border-slate-300')}
                  />
                  {errors.date && <p className="text-sm text-red-600" role="alert">{errors.date}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sched-time" className="block text-sm font-medium text-slate-700">Time <span className="font-normal text-slate-400">({Intl.DateTimeFormat().resolvedOptions().timeZone})</span></label>
                  <input
                    id="sched-time" type="time" value={time}
                    onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, time: undefined })) }}
                    className={cn('h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20', errors.time ? 'border-red-400' : 'border-slate-300')}
                  />
                  {errors.time && <p className="text-sm text-red-600" role="alert">{errors.time}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Post Preview</h2>
              {approvedPlatforms.length > 1 && (
                <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5" role="tablist" aria-label="Preview platform">
                  {approvedPlatforms.map((p) => (
                    <button
                      key={p}
                      role="tab"
                      aria-selected={effectivePreview === p}
                      onClick={() => setPreviewPlatform(p)}
                      className={cn('rounded-md px-2.5 py-1 text-xs font-semibold', effectivePreview === p ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    >
                      {PLATFORM_META[p].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {effectivePreview ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <PlatformIcon platform={effectivePreview} className="h-8 w-8 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{socialAccounts.find((a) => a.platform === effectivePreview)?.accountName ?? PLATFORM_META[effectivePreview].name}</p>
                    <p className="text-xs text-slate-400">
                      {mode === 'now' ? 'Posting now' : `Scheduled · ${date || '…'} ${time || ''}`}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-slate-700">{captionFor(effectivePreview, content)}</p>
                {effectivePreview === 'instagram' && (
                  <p className="px-4 pb-2 text-sm text-primary-600">{content.instagram.hashtags.join(' ')}</p>
                )}
                {primary && <img src={primary.url} alt="" className="max-h-72 w-full object-cover" />}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
                  <span>{product.name}</span>
                  <span className="font-semibold text-slate-700">{product.currency} {product.price.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
                Select a connected platform to preview your post.
              </p>
            )}
          </div>

          <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => navigate(`/products/${product.id}/review`)}>Cancel</Button>
            <Button onClick={submit} disabled={busy} loading={busy}>
              {mode === 'now' ? <Send className="h-4 w-4" aria-hidden /> : <CalendarClock className="h-4 w-4" aria-hidden />}
              {mode === 'now' ? 'Post Now' : 'Schedule Post'}
            </Button>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm publishing">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setConfirming(false)} />
          <div className="relative w-full max-w-md card p-6 shadow-card-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'now' ? 'Publish now?' : 'Schedule this post?'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {mode === 'now'
                ? `This will (in this demo) publish "${product.name}" to ${connectedAccounts.length} platform(s) immediately.`
                : `This will schedule "${product.name}" on ${connectedAccounts.length} platform(s) for ${date} at ${time}.`}
              {' '}No real social network will be contacted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button onClick={doPublish}>{mode === 'now' ? 'Publish' : 'Schedule'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
