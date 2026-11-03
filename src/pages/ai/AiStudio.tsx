import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, PackageOpen, RefreshCw } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { EmptyState } from '../../components/EmptyState'
import { ButtonLink } from '../../components/ui/Button'
import { ProductThumb } from '../dashboard/Dashboard'

export default function AiStudio() {
  const { products, contents } = useApp()
  const navigate = useNavigate()
  const withContent = products.filter((p) => contents[p.id])
  const withoutContent = products.filter((p) => !contents[p.id])

  return (
    <div className="space-y-6">
      <PageHeader title="AI Studio" description="Generate and refine marketing packages for your products." />

      {products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No products to work with"
          description="Add a product first, then let AI create its complete marketing package."
          action={<ButtonLink to="/products/new">Add Product</ButtonLink>}
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Ready for Review</h2>
            {withContent.length === 0 ? (
              <div className="card p-6 text-sm text-slate-600">
                Nothing generated yet — pick a product below and generate its first marketing package.
              </div>
            ) : (
              <ul className="card divide-y divide-slate-100">
                {withContent.map((p) => {
                  const c = contents[p.id]
                  const approved = Object.values(c.sections).filter((s) => s.approved).length
                  const total = Object.keys(c.sections).length
                  return (
                    <li key={p.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                      <ProductThumb product={p} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-600">{approved} of {total} sections approved</p>
                      </div>
                      <div className="hidden sm:block"><StatusBadge status={p.status} /></div>
                      <button
                        onClick={() => navigate(`/products/${p.id}/review`)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                      >
                        Review <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Generate New Content</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {withoutContent.map((p) => (
                <div key={p.id} className="card flex items-center gap-4 p-4">
                  <ProductThumb product={p} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-600">{p.currency} {p.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(p.status === 'generating' ? `/products/${p.id}/generate` : `/products/${p.id}/generate`)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100"
                    aria-label={`Generate content for ${p.name}`}
                    title="Generate content"
                  >
                    {p.status === 'generating' ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
