import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, LayoutGrid, List, Trash2, Pencil, Sparkles, Eye,
  ArrowUpDown, PackageOpen, ChevronDown,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { EmptyState } from '../../components/EmptyState'
import { ButtonLink } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { ProductThumb } from '../dashboard/Dashboard'
import { PRODUCT_CATEGORIES } from '../../data/mockData'
import { cn } from '../../lib/cn'
import type { Product, ProductStatus } from '../../types'

const STATUS_FILTERS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'generating', label: 'Generating' },
  { value: 'content_ready', label: 'Content Ready' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'generation_failed', label: 'Generation Failed' },
]

type SortKey = 'updated' | 'name' | 'price_asc' | 'price_desc'

export default function Products() {
  const navigate = useNavigate()
  const { products, deleteProduct, toast } = useApp()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'' | ProductStatus>('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q))
    if (category) list = list.filter((p) => p.category === category)
    if (status) list = list.filter((p) => p.status === status)
    switch (sort) {
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'price_asc': list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      default: list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return list
  }, [products, query, category, status, sort])

    const confirmDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    window.setTimeout(() => {
      deleteProduct(deleteTarget.id) 
      toast('Product deleted', { description: `${deleteTarget.name} removed.`, variant: 'info' })
      setDeleteTarget(null)
      setDeleting(false)
    }, 600)
  }
  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Manage your products and their generated marketing content."
        actions={<ButtonLink to="/products/new"><Plus className="h-4 w-4" aria-hidden /> Add Product</ButtonLink>}
      />

      <div className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary-400" aria-label="Filter by category">
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary-400" aria-label="Filter by status">
            {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary-400" aria-label="Sort products">
            <option value="updated">Recently updated</option>
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <div className="flex rounded-xl border border-slate-200 p-0.5" role="group" aria-label="View mode">
            <button
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              className={cn('flex h-9 w-9 items-center justify-center rounded-lg', view === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-slate-400 hover:text-slate-600')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className={cn('flex h-9 w-9 items-center justify-center rounded-lg', view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-slate-400 hover:text-slate-600')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={products.length === 0 ? 'No products yet' : 'No products match your filters'}
          description={products.length === 0 ? 'Add your first product and AI will create a full marketing package for it.' : 'Try adjusting your search, category, or status filters.'}
          action={products.length === 0 ? <ButtonLink to="/products/new"><Plus className="h-4 w-4" aria-hidden /> Add Product</ButtonLink> : undefined}
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={() => setDeleteTarget(p)} />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {filtered.map((p) => (
            <ProductRow key={p.id} product={p} onDelete={() => setDeleteTarget(p)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete product?"
        description={`"${deleteTarget?.name}" and its scheduled posts will be permanently removed from this workspace. This action cannot be undone.`}
        confirmLabel="Delete Product"
      />
    </div>
  )
}

function ProductActions({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const { contents } = useApp()
  const navigate = useNavigate()
  const hasContent = !!contents[product.id]
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button onClick={() => navigate(`/products/${product.id}`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`View ${product.name}`} title="View details">
        <Eye className="h-4 w-4" />
      </button>
      <button onClick={() => navigate(`/products/${product.id}/edit`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`Edit ${product.name}`} title="Edit product">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate(hasContent ? `/products/${product.id}/review` : `/products/${product.id}/generate`)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-700"
        aria-label={hasContent ? `Review content for ${product.name}` : `Generate content for ${product.name}`}
        title={hasContent ? 'Review content' : 'Generate content'}
      >
        <Sparkles className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${product.name}`} title="Delete product">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-card-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          <ProductThumb product={product} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute left-3 top-3"><StatusBadge status={product.status} /></div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="truncate text-sm font-semibold text-slate-900 hover:text-primary-700">{product.name}</Link>
            <p className="mt-0.5 text-xs text-slate-600">{product.category}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-slate-900">{product.currency} {product.price.toLocaleString()}</p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400">{new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
          <ProductActions product={product} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 sm:px-5">
      <Link to={`/products/${product.id}`}><ProductThumb product={product} className="h-12 w-12 rounded-xl object-cover" /></Link>
      <div className="min-w-0 flex-1">
        <Link to={`/products/${product.id}`} className="truncate text-sm font-semibold text-slate-900 hover:text-primary-700">{product.name}</Link>
        <p className="text-xs text-slate-600">{product.category} · {product.currency} {product.price.toLocaleString()}</p>
      </div>
      <div className="hidden md:block"><StatusBadge status={product.status} /></div>
      <p className="hidden w-28 text-right text-xs text-slate-400 lg:block">{new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <ProductActions product={product} onDelete={onDelete} />
    </div>
  )
}
