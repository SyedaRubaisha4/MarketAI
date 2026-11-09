import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Sparkles, Send, CalendarDays, Trash2, Package, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { StatusBadge } from '../../components/StatusBadge'
import { Button, ButtonLink } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/EmptyState'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, contents, deleteProduct, toast } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const product = products.find((p) => p.id === productId)
  const content = productId ? contents[productId] : undefined

  if (!product) {
    return (
      <EmptyState
        icon={Package}
        title="Product not found"
        description="This product may have been deleted."
        action={<ButtonLink to="/products">Back to Products</ButtonLink>}
      />
    )
  }

  // Safe check for images
  const productImages = product.images || [];
  const primary = content?.imageUrl 
    ? { url: content.imageUrl } 
    : (productImages.find((i) => i.isPrimary) ?? productImages[0]);

  const approvedCount = content ? Object.values(content.sections || {}).filter((s: any) => s.approved).length : 0
  const totalSections = content ? Object.keys(content.sections || {}).length : 1 // Avoid divide by zero

  return (
    <div className="space-y-6">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Products
      </Link>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-2">
          {primary ? (
            <img src={primary.url} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-300"><ImageOff className="h-12 w-12" aria-hidden /></div>
          )}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {productImages.map((img) => (
                <img key={img.id} src={img.url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
                <p className="mt-1 text-sm text-slate-600">{product.category}</p>
              </div>
              <StatusBadge status={product.status} />
            </div>
            <p className="mt-4 text-2xl font-bold text-primary-700">{product.currency} {product.price?.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">
              Added {new Date(product.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}Updated {new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            
            {/* Safe check for details */}
            {product.details && product.details.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {product.details.map((d: any) => (
                  <div key={d.key} className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{d.key}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-800">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(`/products/${product.id}/edit`)}><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>
              {content ? (
                <>
                  <Button variant="outline" onClick={() => navigate(`/products/${product.id}/review`)}><Sparkles className="h-4 w-4" aria-hidden /> Review Content</Button>
                  <Button onClick={() => navigate(`/publish/${product.id}`)}><Send className="h-4 w-4" aria-hidden /> Publish</Button>
                </>
              ) : (
                <Button onClick={() => navigate(`/products/${product.id}/generate`)}><Sparkles className="h-4 w-4" aria-hidden /> Generate Content</Button>
              )}
              <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" aria-hidden /> Delete
              </Button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Marketing Content</h2>
            {content ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Approval progress</span>
                  <span className="font-semibold text-slate-800">{approvedCount} of {totalSections} sections approved</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" style={{ width: `${(approvedCount / totalSections) * 100}%` }} />
                </div>
                <p className="text-sm text-slate-600">
                  Generated {new Date(content.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {' — '}includes name options, descriptions, SEO package and platform captions.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col items-start gap-3">
                <p className="text-sm text-slate-600">No content generated yet. Generate a full marketing package in about 60 seconds.</p>
                <Button size="sm" onClick={() => navigate(`/products/${product.id}/generate`)}><Sparkles className="h-4 w-4" aria-hidden /> Generate with AI</Button>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-slate-400" aria-hidden /> Scheduled Posts</h2>
            <ScheduledForProduct productId={product.id} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteProduct(product.id)
          toast('Product deleted', { description: product.name, variant: 'info' })
          navigate('/products')
        }}
        danger
        title="Delete product?"
        description={`"${product.name}" and its scheduled posts will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Product"
      />
    </div>
  )
}

function ScheduledForProduct({ productId }: { productId: string }) {
  const { scheduledPosts } = useApp()
    const safePosts = Array.isArray(scheduledPosts) ? scheduledPosts : [];
  
  const posts = safePosts.filter((p) => p.productId === productId && p.status === 'scheduled')
  
  if (posts.length === 0) return <p className="mt-3 text-sm text-slate-400">No upcoming scheduled posts for this product.</p>
  return (
    <ul className="mt-3 space-y-2">
      {posts.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-slate-700">{p.title}</span>
          <span className="text-xs text-slate-600">{p.date} at {p.time}</span>
        </li>
      ))}
    </ul>
  )
}