import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Package, FileCheck2, Send, FileEdit, Clock3, CalendarClock, Plus, Sparkles,
  CalendarDays, ArrowRight, PackageOpen, Eye, Pencil,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { StatCard } from '../../components/StatCard'
import { StatusBadge } from '../../components/StatusBadge'
import { EmptyState } from '../../components/EmptyState'
import { ButtonLink } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import type { Product } from '../../types'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const src = product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url
  if (src) return <img src={src} alt={product.name} className={className} loading="lazy" />
  return (
    <span className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`} aria-hidden>
      <Package className="h-6 w-6" />
    </span>
  )
}

function RecentRow({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { contents } = useApp()
  const hasContent = !!contents[product.id]

  const action = () => {
    if (product.status === 'generating') return navigate(`/products/${product.id}/generate`)
    if (hasContent && (product.status === 'needs_review' || product.status === 'content_ready')) return navigate(`/products/${product.id}/review`)
    if (hasContent || product.status === 'approved' || product.status === 'scheduled' || product.status === 'published')
      return navigate(`/publish/${product.id}`)
    return navigate(`/products/${product.id}/generate`)
  }
  const actionLabel = product.status === 'generating' ? 'Generating…'
    : hasContent && (product.status === 'needs_review' || product.status === 'content_ready') ? 'Review'
    : hasContent || ['approved', 'scheduled', 'published'].includes(product.status) ? 'Post'
    : 'Generate'

  return (
    <li className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
      <ProductThumb product={product} className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{product.currency} {product.price?.toLocaleString()} · Updated {product.updatedAt ? fmtDate(product.updatedAt) : ''}</p>
      </div>
      <div className="hidden shrink-0 sm:block"><StatusBadge status={product.status} /></div>
      <div className="flex shrink-0 items-center gap-2 ml-4">
        <Link to={`/products/${product.id}`} className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 md:inline-flex transition-colors"><Eye className="h-4 w-4" /></Link>
        <Link to={`/products/${product.id}/edit`} className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 md:inline-flex transition-colors"><Pencil className="h-4 w-4" /></Link>
        <button
          onClick={action}
          className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
        >
          {actionLabel}
        </button>
      </div>
    </li>
  )
}

export default function Dashboard() {
  const { products, user, contents, loading, dashboardStats } = useApp()
  
  // State to manage which card is active (black block)
  const [activeAction, setActiveAction] = useState<'add' | 'generate' | 'calendar'>('add')
  
if (loading && (!products || products.length === 0)) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-slate-100" />
    </div>
  )
}
  const firstName = (user?.fullName ?? 'there').split(' ')[0]
  const recent = [...(products || [])].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5)
    
  const totalProducts = dashboardStats?.total_products ?? 0
  const generated = dashboardStats?.generated ?? 0
  const published = dashboardStats?.published ?? 0
  const drafts = dashboardStats?.drafts ?? 0
  const pending = dashboardStats?.pending ?? 0
  const scheduled = dashboardStats?.scheduled ?? 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">Welcome back, {firstName}. Here's your overview.</p>
        </div>
        <ButtonLink to="/products/new" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-xl">
          <Plus className="h-4 w-4 mr-2" aria-hidden /> New Product
        </ButtonLink>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={totalProducts} icon={Package} colorClass="bg-slate-100 text-slate-600" />
        <StatCard label="Generated" value={generated} icon={FileCheck2} colorClass="bg-purple-50 text-purple-600" />
        <StatCard label="Published" value={published} icon={Send} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Drafts" value={drafts} icon={FileEdit} colorClass="bg-orange-50 text-orange-600" />
        <StatCard label="Pending" value={pending} icon={Clock3} colorClass="bg-rose-50 text-rose-600" />
        <StatCard label="Scheduled" value={scheduled} icon={CalendarClock} colorClass="bg-cyan-50 text-cyan-600" />
      </div>

      {/* Quick Actions Section */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          
          {/* Card 1: Add new product */}
          <div
            onClick={() => setActiveAction('add')}
            className={cn(
              "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1",
              activeAction === 'add'
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md"
            )}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                {activeAction !== 'add' && (
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                    <Package className="h-6 w-6" />
                  </span>
                )}
                <h3 className={cn("text-lg font-bold", activeAction === 'add' ? "text-white" : "text-slate-900")}>Add new product</h3>
                <p className={cn("mt-2 text-sm font-medium", activeAction === 'add' ? "text-slate-400" : "text-slate-500")}>
                  Create a listing and let our system generate the assets.
                </p>
              </div>
              {activeAction === 'add' && (
                /* Yahan Link laga diya hai taake click karne par page change ho */
                <Link to="/products/new" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-indigo-300">
                  Create <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
            {activeAction === 'add' && (
              <>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Package className="h-32 w-32 text-white" />
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl transition-all duration-500 group-hover:bg-indigo-400/40" />
              </>
            )}
          </div>

          {/* Card 2: Generate AI */}
          <div
            onClick={() => setActiveAction('generate')}
            className={cn(
              "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1",
              activeAction === 'generate'
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md"
            )}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                {activeAction !== 'generate' && (
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform duration-300 group-hover:scale-110">
                    <Sparkles className="h-6 w-6" />
                  </span>
                )}
                <h3 className={cn("text-lg font-bold", activeAction === 'generate' ? "text-white" : "text-slate-900")}>Generate Content</h3>
                <p className={cn("mt-2 text-sm font-medium line-clamp-2", activeAction === 'generate' ? "text-slate-400" : "text-slate-500")}>
                  {products?.[0] ? `Continue with ${products[0].name}` : 'Pick a product and generate content.'}
                </p>
              </div>
              {activeAction === 'generate' && (
                /* Yahan Link laga diya hai taake click karne par page change ho */
                <Link 
                  to={products?.[0] ? `/products/${products[0].id}/generate` : '/products'} 
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-indigo-300"
                >
                  Generate <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
            {activeAction === 'generate' && (
              <>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Sparkles className="h-32 w-32 text-white" />
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl transition-all duration-500 group-hover:bg-purple-400/40" />
              </>
            )}
          </div>

          {/* Card 3: Calendar */}
          <div
            onClick={() => setActiveAction('calendar')}
            className={cn(
              "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1",
              activeAction === 'calendar'
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md"
            )}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                {activeAction !== 'calendar' && (
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-transform duration-300 group-hover:scale-110">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                )}
                <h3 className={cn("text-lg font-bold", activeAction === 'calendar' ? "text-white" : "text-slate-900")}>Calendar</h3>
                <p className={cn("mt-2 text-sm font-medium line-clamp-2", activeAction === 'calendar' ? "text-slate-400" : "text-slate-500")}>
                  {scheduled > 0 ? `${scheduled} posts scheduled.` : 'Plan your upcoming posts.'}
                </p>
              </div>
              {activeAction === 'calendar' && (
                /* Yahan Link laga diya hai taake click karne par page change ho */
                <Link to="/calendar" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-indigo-300">
                  View Calendar <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
            {activeAction === 'calendar' && (
              <>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <CalendarDays className="h-32 w-32 text-white" />
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/30 blur-3xl transition-all duration-500 group-hover:bg-orange-400/40" />
              </>
            )}
          </div>

        </div>
      </section>

      {/* Recent Products Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Products</h2>
          <Link to="/products" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">View All</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No products yet"
            description="Add your first product to get started."
            action={
              <ButtonLink
                to="/products/new"
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md px-6 font-bold"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add Product
              </ButtonLink>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {recent.map((p) => <RecentRow key={p.id} product={p} />)}
          </ul>
        )}
      </section>
    </div>
  )
}