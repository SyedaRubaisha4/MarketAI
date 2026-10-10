import { useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Send, Clock, X, CheckCircle2,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { PageHeader } from '../../components/PageHeader'
import { PlatformIcon } from '../../components/PlatformIcon'
import { PLATFORM_META } from '../../data/mockData'
import { Dialog, ConfirmDialog } from '../../components/ui/Dialog'
import { Button, ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/EmptyState'
import { cn } from '../../lib/cn'
import type { Platform, ScheduledPost } from '../../types'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_PLATFORMS: Platform[] = ['instagram', 'facebook', 'whatsapp', 'tiktok', 'pinterest', 'linkedin']

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { scheduledPosts, deleteScheduledPost, publishPostNow, toast, products } = useApp()
  const todayKey = toDateKey(new Date())
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduledPost | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduledPost | null>(null)

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {}
    for (const p of scheduledPosts) {
      if (platformFilter && p.platform !== platformFilter) continue
      ;(map[p.date] ??= []).push(p)
    }
    Object.values(map).forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))
    return map
  }, [scheduledPosts, platformFilter])

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: ({ key: string; day: number; inMonth: boolean } | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push({ key: toDateKey(new Date(year, month, d)), day: d, inMonth: true })
    return cells
  }, [cursor])

  const selectedPosts = (postsByDate[selectedKey] ?? []).filter((p) => p.status === 'scheduled')
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const shiftMonth = (delta: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))
  const goToday = () => {
    const d = new Date()
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
    setSelectedKey(toDateKey(d))
  }

  const postNow = (post: ScheduledPost) => {
    publishPostNow(post.id)
    toast('Post published (simulated)', { description: `"${post.title}" was moved to published. No real network was contacted.` })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content Calendar"
        description="Manage upcoming and previously published posts."
        actions={<Button onClick={() => setScheduleOpen(true)}><Plus className="h-4 w-4" aria-hidden /> Schedule</Button>}
      />

      <div className="card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => shiftMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-slate-900">{monthLabel}</h2>
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <div className="ml-auto flex items-center gap-1.5 overflow-x-auto" role="group" aria-label="Platform filter">
            <FilterChip active={platformFilter === ''} onClick={() => setPlatformFilter('')}>All</FilterChip>
            {ALL_PLATFORMS.map((p) => (
              <FilterChip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(platformFilter === p ? '' : p)}>
                <span className="flex items-center gap-1"><PlatformIcon platform={p} className="h-4 w-4 rounded" />{PLATFORM_META[p].name.split(' ')[0]}</span>
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1" role="grid" aria-label={`Calendar for ${monthLabel}`}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</div>
          ))}
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />
            const posts = postsByDate[cell.key] ?? []
            const isToday = cell.key === todayKey
            const isSelected = cell.key === selectedKey
            const shown = posts.slice(0, 2)
            return (
              <button
                key={cell.key}
                onClick={() => setSelectedKey(cell.key)}
                aria-pressed={isSelected}
                aria-label={`${cell.day}${posts.length ? `, ${posts.length} post${posts.length === 1 ? '' : 's'}` : ''}`}
                className={cn(
                  'flex min-h-[72px] flex-col items-stretch gap-1 rounded-xl border p-1.5 text-left transition-colors',
                  isSelected ? 'border-primary-500 bg-primary-50/60 ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-300',
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  isToday ? 'bg-primary-600 text-white' : 'text-slate-600',
                )}>
                  {cell.day}
                </span>
                {shown.map((p) => (
                  <span key={p.id} className={cn('flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium', p.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700')}>
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', p.status === 'published' ? 'bg-green-500' : 'bg-indigo-500')} aria-hidden />
                    <span className="truncate">{p.time} {p.title}</span>
                  </span>
                ))}
                {posts.length > 2 && <span className="px-1 text-[10px] font-medium text-slate-400">+ {posts.length - 2} more</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {new Date(`${selectedKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        {selectedPosts.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No scheduled posts"
            description={platformFilter ? 'Try clearing the platform filter, or schedule something for this date.' : 'Schedule a post for this date to see it here.'}
            action={<Button variant="outline" onClick={() => setScheduleOpen(true)}><Plus className="h-4 w-4" aria-hidden /> Schedule a Post</Button>}
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {selectedPosts.map((post) => (
              <li key={post.id} className="card flex items-center gap-4 p-4">
                <PlatformIcon platform={post.platform} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {PLATFORM_META[post.platform].name} · {post.time}
                    {products.find((p) => p.id === post.productId)?.name ? ` · ${products.find((p) => p.id === post.productId)!.name}` : ''}
                  </p>
                </div>
                {post.imageUrl && <img src={post.imageUrl} alt="" className="hidden h-12 w-12 rounded-lg object-cover sm:block" />}
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn label="Post now" onClick={() => postNow(post)} className="hover:bg-green-50 hover:text-green-600" icon={Send} />
                  <IconBtn label={`Edit ${post.title}`} onClick={() => setEditing(post)} className="hover:bg-primary-50 hover:text-primary-600" icon={Pencil} />
                  <IconBtn label={`Delete ${post.title}`} onClick={() => setDeleteTarget(post)} className="hover:bg-red-50 hover:text-red-600" icon={Trash2} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="pb-2 text-center text-xs text-slate-400">
        Published posts stay on the calendar as a record. Post Now and scheduling are simulated locally.
      </p>

      {scheduleOpen && <ScheduleModal onClose={() => setScheduleOpen(false)} />}
      {editing && <ScheduleModal onClose={() => setEditing(null)} existing={editing} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteScheduledPost(deleteTarget.id)
            toast('Scheduled post deleted', { description: deleteTarget.title, variant: 'info' })
          }
          setDeleteTarget(null)
        }}
        danger
        title="Delete scheduled post?"
        description={`"${deleteTarget?.title}" will be removed from the calendar. This cannot be undone.`}
        confirmLabel="Delete Post"
      />
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700',
      )}
    >
      {children}
    </button>
  )
}

function IconBtn({ label, onClick, icon: Icon, className }: { label: string; onClick: () => void; icon: typeof Send; className?: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100', className)}>
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ScheduleModal({ onClose, existing }: { onClose: () => void; existing?: ScheduledPost }) {
  const { products, contents, socialAccounts, schedulePost, updateScheduledPost, toast } = useApp()
  const eligible = products.filter((p) => contents[p.id])
  const [productId, setProductId] = useState(existing?.productId ?? eligible[0]?.id ?? '')
  const connected = socialAccounts.filter((a) => a.connected)
  const [platform, setPlatform] = useState<Platform>(existing?.platform ?? connected[0]?.platform ?? 'instagram')
  const [date, setDate] = useState(existing?.date ?? toDateKey(new Date()))
  const [time, setTime] = useState(existing?.time ?? '18:00')
  const [errors, setErrors] = useState<{ product?: string; dateTime?: string }>({})

  const product = products.find((p) => p.id === productId)
  const content = productId ? contents[productId] : undefined
  const primary = product?.images.find((i) => i.isPrimary) ?? product?.images[0]

  const save = () => {
    const er: typeof errors = {}
    if (!productId) er.product = 'Choose a product with generated content.'
    if (!date || !time) er.dateTime = 'Date and time are required.'
    else if (new Date(`${date}T${time}`).getTime() <= Date.now()) er.dateTime = 'Pick a future date and time.'
    setErrors(er)
    if (Object.keys(er).length) return
    if (existing) {
      updateScheduledPost(existing.id, { productId, platform, date, time })
      toast('Scheduled post updated', { description: `${product?.name} on ${date} at ${time}.` })
    } else {
      schedulePost({
        productId, platform, date, time,
        title: `${product!.name} — ${PLATFORM_META[platform].name} Post`,
        imageUrl: primary?.url ?? null,
      })
      toast('Post scheduled', { description: `${product!.name} on ${date} at ${time}.` })
    }
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={existing ? 'Edit Scheduled Post' : 'Schedule a Post'}
      description="Pick a product with approved content, a connected platform, and a time."
      wide
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>{existing ? 'Save Changes' : 'Schedule Post'}</Button>
        </>
      )}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="sm-product" className="block text-sm font-medium text-slate-700">Product</label>
          <select
            id="sm-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={cn('h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-primary-500', errors.product ? 'border-red-400' : 'border-slate-300')}
          >
            <option value="" disabled>Select a product</option>
            {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.product && <p className="text-sm text-red-600" role="alert">{errors.product}</p>}
          {eligible.length === 0 && (
            <p className="flex items-center gap-1.5 text-sm text-amber-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              No products with generated content yet. <ButtonLink to="/ai-studio" size="sm" variant="outline" className="ml-1">Open AI Studio</ButtonLink>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700">Platform</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Platform">
            {connected.length === 0 && <p className="text-sm text-slate-500">No connected accounts — connect one in <ButtonLink to="/social-accounts" size="sm" variant="outline">Social Accounts</ButtonLink>.</p>}
            {connected.map((a) => (
              <button
                key={a.platform}
                type="button"
                role="radio"
                aria-checked={platform === a.platform}
                onClick={() => setPlatform(a.platform)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors',
                  platform === a.platform ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600 hover:border-primary-300',
                )}
              >
                <PlatformIcon platform={a.platform} className="h-6 w-6 rounded-lg" />
                {PLATFORM_META[a.platform].name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="sm-date" className="block text-sm font-medium text-slate-700">Date</label>
            <input id="sm-date" type="date" value={date} min={toDateKey(new Date())} onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, dateTime: undefined })) }} className={cn('h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-primary-500', errors.dateTime ? 'border-red-400' : 'border-slate-300')} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sm-time" className="block text-sm font-medium text-slate-700">Time</label>
            <input id="sm-time" type="time" value={time} onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, dateTime: undefined })) }} className={cn('h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-primary-500', errors.dateTime ? 'border-red-400' : 'border-slate-300')} />
          </div>
        </div>
        {errors.dateTime && <p className="text-sm text-red-600" role="alert">{errors.dateTime}</p>}

        {content && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Content Preview</p>
            <div className="mt-2 flex gap-3">
              {primary && <img src={primary.url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-slate-700">
                {platform === 'instagram' ? content.instagram.caption : platform === 'facebook' ? content.facebook.caption : platform === 'whatsapp' ? content.whatsapp.message : content.shortDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
