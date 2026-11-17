import { useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Send, Clock, CheckCircle2,
  Calendar as CalendarIcon, Sparkles
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

// Har platform ka solid/colorful design
const PLATFORM_COLORS: Record<string, { bg: string, text: string, border: string, hover: string }> = {
  instagram: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', hover: 'hover:bg-pink-200' },
  facebook: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-200' },
  whatsapp: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', hover: 'hover:bg-emerald-200' },
  tiktok: { bg: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-300', hover: 'hover:bg-slate-300' },
  pinterest: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', hover: 'hover:bg-red-200' },
  linkedin: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', hover: 'hover:bg-sky-200' },
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { scheduledPosts = [], deleteScheduledPost, publishPostNow, toast, products = [], contents = {}, socialAccounts = [], schedulePost } = useApp()
  
  const todayKey = toDateKey(new Date())
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduledPost | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduledPost | null>(null)

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {}
    const safePosts = Array.isArray(scheduledPosts) ? scheduledPosts : []
    for (const p of safePosts) {
      if (platformFilter && p.platform !== platformFilter) continue
      ;(map[p.date] ??= []).push(p)
    }
    Object.values(map).forEach((list) => list.sort((a, b) => (a.time || '').localeCompare(b.time || '')))
    return map
  }, [scheduledPosts, platformFilter])

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7
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
    if (typeof publishPostNow === 'function') {
      publishPostNow(post.id)
    }
    toast('Post published (simulated)', { description: `"${post.title}" was moved to published.` })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500 pb-10 pt-4">
      
      <PageHeader
        title="Content Calendar"
        description="Manage upcoming and previously published posts."
        actions={
          /* BUTTON FIX: Purple gradient ko hata kar Black (slate-900) kar diya hai */
          <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md h-11 px-5 font-bold transition-all hover:-translate-y-0.5" onClick={() => setScheduleOpen(true)}>
            <Plus className="h-4 w-4 mr-2" aria-hidden /> Schedule Post
          </Button>
        }
      />

      {/* Main Calendar Card with subtle background gradient */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 p-5 lg:flex-row lg:items-center lg:justify-between bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button onClick={() => shiftMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => shiftMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{monthLabel}</h2>
            {/* TODAY BUTTON FIX: Indigo se Slate (grey/black) kar diya hai */}
            <button onClick={goToday} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-200 transition-colors">
              Today
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={platformFilter === ''} onClick={() => setPlatformFilter('')}>
              All
            </FilterChip>
            {ALL_PLATFORMS.map((p) => (
              <FilterChip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(platformFilter === p ? '' : p)} platform={p}>
                <span className="flex items-center gap-1.5"><PlatformIcon platform={p} className="h-4 w-4 rounded" />{PLATFORM_META[p]?.name.split(' ')[0]}</span>
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/50">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-white">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30" />
            const posts = postsByDate[cell.key] ?? []
            const isToday = cell.key === todayKey
            const isSelected = cell.key === selectedKey
            const shown = posts.slice(0, 2)
            
            return (
              <button
                key={cell.key}
                onClick={() => setSelectedKey(cell.key)}
                className={cn(
                  'flex min-h-[110px] flex-col items-stretch gap-1.5 border-b border-r border-slate-100 p-2 text-left transition-all',
                  isSelected ? 'bg-slate-100/80 ring-2 ring-inset ring-slate-900/20' : 'hover:bg-slate-50',
                )}
              >
                <span className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-colors',
                  isToday ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 group-hover:bg-slate-200',
                )}>
                  {cell.day}
                </span>
                
                {/* Events */}
                {shown.map((p) => {
                  const colors = PLATFORM_COLORS[p.platform] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                  return (
                    <span key={p.id} className={cn('flex items-center gap-1.5 truncate rounded-md border px-1.5 py-1 text-[10px] font-bold', colors.bg, colors.text, colors.border)}>
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full bg-current')} />
                      <span className="truncate">{p.time || '00:00'} {p.title}</span>
                    </span>
                  )
                })}
                
                {posts.length > 2 && <span className="px-1.5 text-[10px] font-extrabold text-slate-500">+ {posts.length - 2} more</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="mt-8">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-500" />
          {new Date(`${selectedKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        
        {selectedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4 ring-1 ring-slate-200">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No posts scheduled</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 mb-6">You don't have any content scheduled for this day yet.</p>
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-6 font-bold" onClick={() => setScheduleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Schedule a Post
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {selectedPosts.map((post) => {
              const colors = PLATFORM_COLORS[post.platform] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
              return (
                <li key={post.id} className="group relative flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/50", colors.bg, colors.text)}>
                    <PlatformIcon platform={post.platform} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{post.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", colors.bg, colors.text)}>{PLATFORM_META[post.platform]?.name}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      {post.time || '00:00'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                    <IconBtn label="Post now" onClick={() => postNow(post)} className="hover:bg-emerald-50 hover:text-emerald-600" icon={Send} />
                    <IconBtn label={`Edit`} onClick={() => setEditing(post)} className="hover:bg-slate-100 hover:text-slate-900" icon={Pencil} />
                    <IconBtn label={`Delete`} onClick={() => setDeleteTarget(post)} className="hover:bg-red-50 hover:text-red-600" icon={Trash2} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Modals aur Dialogs */}
      {scheduleOpen && <ScheduleModal onClose={() => setScheduleOpen(false)} />}
      {editing && <ScheduleModal onClose={() => setEditing(null)} existing={editing} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget && typeof deleteScheduledPost === 'function') {
            deleteScheduledPost(deleteTarget.id)
            toast('Scheduled post deleted', { description: deleteTarget.title, variant: 'info' })
          }
          setDeleteTarget(null)
        }}
        danger
        title="Delete scheduled post?"
        description={`"${deleteTarget?.title}" will be removed from the calendar.`}
        confirmLabel="Delete Post"
      />
    </div>
  )
}

function FilterChip({ active, onClick, children, platform }: { active: boolean; onClick: () => void; children: React.ReactNode; platform?: Platform }) {
  const colors = platform ? PLATFORM_COLORS[platform] : { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900' };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
        active ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm` : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

function IconBtn({ label, onClick, icon: Icon, className }: { label: string; onClick: () => void; icon: typeof Send; className?: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors', className)}>
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ScheduleModal({ onClose, existing }: { onClose: () => void; existing?: ScheduledPost }) {
  const { products = [], contents = {}, socialAccounts = [], schedulePost, toast } = useApp()
  
  const eligible = products.filter((p) => contents[p.id])
  
  const [productId, setProductId] = useState(existing?.productId ?? eligible[0]?.id ?? '')
  
  const connected = socialAccounts.filter((a) => a.connected)
  const [platform, setPlatform] = useState<Platform>(existing?.platform ?? connected[0]?.platform ?? 'instagram')
  const [date, setDate] = useState(existing?.date ?? toDateKey(new Date()))
  const [time, setTime] = useState(existing?.time ?? '18:00')
  const [errors, setErrors] = useState<{ product?: string; dateTime?: string }>({})

  const product = products.find((p) => p.id === productId)
  const content = productId ? contents[productId] : undefined
  const primary = product?.images?.find((i) => i.isPrimary) ?? product?.images?.[0]

  const save = () => {
    const er: typeof errors = {}
    if (!productId) er.product = 'Choose a product with generated content.'
    if (!date || !time) er.dateTime = 'Date and time are required.'
    else if (new Date(`${date}T${time}`).getTime() <= Date.now()) er.dateTime = 'Pick a future date and time.'
    
    setErrors(er)
    if (Object.keys(er).length) return

    if (typeof schedulePost === 'function') {
      schedulePost({
        productId, platform, date, time,
        title: `${product?.name || 'Post'} — ${PLATFORM_META[platform]?.name || ''} Post`,
        imageUrl: primary?.url ?? null,
      })
      toast('Post scheduled', { description: `${product?.name} on ${date} at ${time}.` })
    } else {
       toast('Error', { description: 'Schedule function not found in context', variant: 'error' })
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
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {/* MODAL BUTTON FIX: Gradient ko hata kar Slate-900 kiya hai */}
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md" onClick={save}>{existing ? 'Save Changes' : 'Schedule Post'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="sm-product" className="block text-sm font-bold text-slate-700">Product</label>
          <select
            id="sm-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={cn('h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-slate-900 focus:bg-white', errors.product ? 'border-red-400' : 'border-slate-200')}
          >
            <option value="" disabled>Select a product</option>
            {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.product && <p className="text-sm text-red-600" role="alert">{errors.product}</p>}
          
          {eligible.length === 0 && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600 mt-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              No products with generated content yet. <ButtonLink to="/ai-studio" size="sm" variant="outline" className="ml-1">Open AI Studio</ButtonLink>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-bold text-slate-700">Platform</span>
          <div className="flex flex-wrap gap-2">
            {connected.length === 0 && <p className="text-sm font-medium text-slate-500">No connected accounts — connect one in <ButtonLink to="/social-accounts" size="sm" variant="outline">Social Accounts</ButtonLink>.</p>}
            {connected.map((a) => {
              const colors = PLATFORM_COLORS[a.platform] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
              return (
                <button
                  key={a.platform}
                  type="button"
                  onClick={() => setPlatform(a.platform)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all',
                    platform === a.platform ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm` : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <PlatformIcon platform={a.platform} className="h-5 w-5 rounded-md" />
                  {PLATFORM_META[a.platform]?.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="sm-date" className="block text-sm font-bold text-slate-700">Date</label>
            <input id="sm-date" type="date" value={date} min={toDateKey(new Date())} onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, dateTime: undefined })) }} className={cn('h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-slate-900 focus:bg-white', errors.dateTime ? 'border-red-400' : 'border-slate-200')} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sm-time" className="block text-sm font-bold text-slate-700">Time</label>
            <input id="sm-time" type="time" value={time} onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, dateTime: undefined })) }} className={cn('h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-slate-900 focus:bg-white', errors.dateTime ? 'border-red-400' : 'border-slate-200')} />
          </div>
        </div>
        {errors.dateTime && <p className="text-sm text-red-600" role="alert">{errors.dateTime}</p>}

        {content && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Content Preview</p>
            <div className="mt-3 flex gap-4">
              {primary && <img src={primary.url} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200 shadow-sm" />}
              <p className="line-clamp-4 flex-1 text-sm font-medium leading-relaxed text-slate-600">
                {platform === 'instagram' ? content.instagram?.caption : platform === 'facebook' ? content.facebook?.caption : platform === 'whatsapp' ? content.whatsapp?.message : content.shortDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}