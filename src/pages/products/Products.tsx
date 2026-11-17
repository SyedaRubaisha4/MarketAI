import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, LayoutGrid, List, Trash2, Pencil, Sparkles, Eye,
  PackageOpen,
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
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500 pb-10 pt-4">
      <PageHeader
        title="Products"
        description="Manage your products and their generated marketing content."
        actions={
          <ButtonLink to="/products/new" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm">
            <Plus className="h-4 w-4 mr-2" aria-hidden /> Add Product
          </ButtonLink>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-indigo-500">
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-indigo-500">
            {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:border-indigo-500">
            <option value="updated">Recently updated</option>
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="View mode">
            <button
              onClick={() => setView('grid')}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
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
          action={products.length === 0 ? <ButtonLink to="/products/new" className="bg-slate-900 text-white rounded-xl"><Plus className="h-4 w-4 mr-2" aria-hidden /> Add Product</ButtonLink> : undefined}
        />
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={() => setDeleteTarget(p)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
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
  
  // Decent pastel background aur dark icon
  const btnBase = "flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all hover:scale-110 border"
  
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
      
      {/* View - Soft Blue */}
      <button 
        onClick={() => navigate(`/products/${product.id}`)} 
        className={`${btnBase} bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100`} 
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
      
      {/* Edit - Soft Orange */}
      <button 
        onClick={() => navigate(`/products/${product.id}/edit`)} 
        className={`${btnBase} bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100`} 
        title="Edit product"
      >
        <Pencil className="h-4 w-4" />
      </button>
      
      {/* Generate AI - Soft Purple */}
      <button
        onClick={() => navigate(hasContent ? `/products/${product.id}/review` : `/products/${product.id}/generate`)}
        className={`${btnBase} bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100`}
        title={hasContent ? 'Review content' : 'Generate content'}
      >
        <Sparkles className="h-4 w-4" />
      </button>
      
      {/* Delete - Soft Red */}
      <button 
        onClick={onDelete} 
        className={`${btnBase} bg-red-50 border-red-100 text-red-500 hover:bg-red-100 hover:text-red-600`} 
        title="Delete product"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      
    </div>
  )
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      
      {/* Image Section */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <ProductThumb 
          product={product} 
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
        />
        
        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={product.status} className="backdrop-blur-md bg-white/90 shadow-sm" />
        </div>
      </Link>

      {/* Card Body - Clean White */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="group/name block">
              <h3 className="truncate text-[16px] font-bold text-slate-900 transition-colors group-hover/name:text-indigo-600">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              {product.category}
            </p>
          </div>
          
          {/* Price */}
          <p className="shrink-0 text-sm font-extrabold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            {product.currency} {product.price.toLocaleString()}
          </p>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">
            {new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
          <ProductActions product={product} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors">
      <Link to={`/products/${product.id}`} className="shrink-0"><ProductThumb product={product} className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200" /></Link>
      <div className="min-w-0 flex-1">
        <Link to={`/products/${product.id}`} className="truncate text-[15px] font-bold text-slate-900 hover:text-indigo-600 transition-colors">{product.name}</Link>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{product.category} · {product.currency} {product.price.toLocaleString()}</p>
      </div>
      <div className="hidden md:block"><StatusBadge status={product.status} /></div>
      <p className="hidden w-28 text-right text-xs font-medium text-slate-400 lg:block">{new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <ProductActions product={product} onDelete={onDelete} />
    </div>
  )
}