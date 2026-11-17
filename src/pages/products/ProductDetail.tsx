import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Sparkles, Send, CalendarDays, Trash2, Package, ImageOff, Tag, Clock } from 'lucide-react'
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
  const totalSections = content ? Object.keys(content.sections || {}).length : 1

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Top Navigation */}
      <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* Left Side: Image Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm aspect-square">
            {primary ? (
              <img src={primary.url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <ImageOff className="h-12 w-12" aria-hidden />
              </div>
            )}
            <div className="absolute left-4 top-4">
              <StatusBadge status={product.status} className="backdrop-blur-md bg-white/90 shadow-sm" />
            </div>
          </div>
          
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img) => (
                <img key={img.id} src={img.url} alt="" className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer" />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{product.name}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Tag className="h-4 w-4" /> {product.category}
                </p>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {product.currency} {product.price?.toLocaleString()}
              </p>
            </div>
            
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Added {new Date(product.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}Updated {new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            
            {/* Product Details Grid */}
            {product.details && product.details.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {product.details.map((d: any) => (
                  <div key={d.key} className="rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-3">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{d.key}</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700" onClick={() => navigate(`/products/${product.id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" aria-hidden /> Edit Details
              </Button>
              
              {content ? (
                <>
                  <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700" onClick={() => navigate(`/products/${product.id}/review`)}>
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-600" aria-hidden /> Review Content
                  </Button>
                  <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm" onClick={() => navigate(`/publish/${product.id}`)}>
                    <Send className="h-4 w-4 mr-2" aria-hidden /> Publish
                  </Button>
                </>
              ) : (
                <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm" onClick={() => navigate(`/products/${product.id}/generate`)}>
                  <Sparkles className="h-4 w-4 mr-2" aria-hidden /> Generate Content
                </Button>
              )}
              
              <Button variant="ghost" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto px-4" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" aria-hidden /> Delete
              </Button>
            </div>
          </div>

          {/* Marketing Content Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" /> Marketing Content
            </h2>
            {content ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Approval Progress</span>
                  <span className="font-bold text-slate-900">{approvedCount} of {totalSections} approved</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" style={{ width: `${(approvedCount / totalSections) * 100}%` }} />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Generated {new Date(content.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — includes name options, descriptions, SEO package and captions.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <p className="text-sm font-medium text-slate-600">No content generated yet. Generate a full marketing package in about 60 seconds.</p>
                <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => navigate(`/products/${product.id}/generate`)}>
                  <Sparkles className="h-4 w-4 mr-2" aria-hidden /> Generate with AI
                </Button>
              </div>
            )}
          </div>

          {/* Scheduled Posts Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-500" /> Scheduled Posts
            </h2>
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
  
  if (posts.length === 0) return <p className="mt-4 text-sm font-medium text-slate-400">No upcoming scheduled posts for this product.</p>
  
  return (
    <ul className="mt-4 space-y-3">
      {posts.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm">
          <span className="font-bold text-slate-700">{p.title}</span>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200">{p.date} at {p.time}</span>
        </li>
      ))}
    </ul>
  )
}