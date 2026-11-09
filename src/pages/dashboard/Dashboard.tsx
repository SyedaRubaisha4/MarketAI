import { Link, useNavigate } from 'react-router-dom'
import {
  Package, FileCheck2, Send, FileEdit, Clock3, CalendarClock, Plus, Sparkles,
  CalendarDays, Zap, ArrowRight, PackageOpen, RefreshCw, Eye, Pencil,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { StatCard } from '../../components/StatCard'
import { StatusBadge } from '../../components/StatusBadge'
import { EmptyState } from '../../components/EmptyState'
import { ButtonLink } from '../../components/ui/Button'
import type { Product } from '../../types'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const src = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
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
    <li className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary-50/40 sm:gap-4 sm:px-5">
      <ProductThumb product={product} className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-600">{product.currency} {product.price.toLocaleString()} · Updated {fmtDate(product.updatedAt)}</p>
      </div>
      <div className="hidden shrink-0 sm:block"><StatusBadge status={product.status} /></div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          to={`/products/${product.id}`}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:inline-flex"
          aria-label={`View ${product.name}`}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          to={`/products/${product.id}/edit`}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:inline-flex"
          aria-label={`Edit ${product.name}`}
          title="Edit product"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={action}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 text-xs font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
        >
          {actionLabel}
        </button>
      </div>
    </li>
  )
}

export default function Dashboard() {
const { products, user, contents, scheduledPosts, loading, dashboardStats } = useApp()
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>
  }  const firstName = (user?.fullName ?? 'there').split(' ')[0]
  const safeProducts = products || []
   const recent = [...safeProducts]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 5)
  const totalProducts = dashboardStats?.total_products ?? 0
  const generated = dashboardStats?.generated ?? 0
  const published = dashboardStats?.published ?? 0
  const drafts = dashboardStats?.drafts ?? 0
  const pending = dashboardStats?.pending ?? 0
  const scheduled = dashboardStats?.scheduled ?? 0

  const quickActions = [
    { icon: Plus, label: 'Add Product', desc: 'Add a new product to your catalog', to: '/products/new', cta: 'Add Product' },
    { icon: Sparkles, label: 'Generate AI Content', desc: products[0] ? `Continue with ${products[0].name}` : 'Pick a product and generate content', to: products[0] ? `/products/${products[0].id}/generate` : '/products', cta: 'Open AI Studio' },
    { icon: CalendarDays, label: 'Calendar', desc: scheduled > 0 ? `${scheduled} post${scheduled === 1 ? '' : 's'} scheduled` : 'Plan your upcoming posts', to: '/calendar', cta: 'View Calendar' },
    { icon: Zap, label: 'Post Now', desc: 'Publish approved content instantly', to: products.find((p) => contents[p.id]) ? `/publish/${products.find((p) => contents[p.id])!.id}` : '/products', cta: 'Publish' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back, {firstName}!</h1>
          <p className="mt-1.5 text-sm text-slate-600">Here's what's happening with your product content and marketing.</p>
        </div>
        <ButtonLink to="/products/new" size="lg" className="shadow-md shadow-primary-600/20 sm:shrink-0">
          <Plus className="h-4 w-4" aria-hidden /> Add Product
        </ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        <StatCard label="Total Products" value={totalProducts} icon={Package} />
        <StatCard label="Generated" value={generated} icon={FileCheck2} />
        <StatCard label="Published" value={published} icon={Send} />
        <StatCard label="Drafts" value={drafts} icon={FileEdit} />
        <StatCard label="Pending" value={pending} icon={Clock3} />
        <StatCard label="Scheduled" value={scheduled} icon={CalendarClock} />
      </div>

      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {quickActions.map(({ icon: Icon, label, desc, to, cta }) => (
            <Link
              key={label}
              to={to}
              className="group rounded-2xl border border-white/70 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100/70 text-primary-700 transition-colors group-hover:bg-primary-200/70">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">{desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent Products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-700 hover:text-primary-700">View All</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No products yet"
            description="Add your first product and let AI create a complete marketing package for it in about a minute."
            action={<ButtonLink to="/products/new"><Plus className="h-4 w-4" aria-hidden /> Add Product</ButtonLink>}
          />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-card">
            {recent.map((p) => <RecentRow key={p.id} product={p} />)}
          </ul>
        )}
      </section>
    </div>
  )
}
