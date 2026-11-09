import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Circle, Loader2, XCircle, Sparkles, RotateCcw, Package } from 'lucide-react'
import { useApp, useTrialStatus } from '../../store/AppContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/EmptyState'
import { cn } from '../../lib/cn'
import { api } from '../../api/client'; 

const TASKS = [
  'Analyzing product image',
  'Loading your brand voice',
  'Generating product name',
  'Writing descriptions',
  'Creating SEO content',
  'Generating social captions',
  'Enhancing image',
]

type StepState = 'pending' | 'active' | 'done' | 'failed'

export default function Generate() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, contents, setContent, setProductStatus, toast } = useApp()
  const product = products.find((p) => p.id === productId)

  const [stepIndex, setStepIndex] = useState(-1)
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])

  const trialBlocked = useTrialStatus() === 'expired'

  useEffect(() => {
    if (!product || trialBlocked || contents[product.id]) return
    setProductStatus(product.id, 'generating')
    
    let i = 0
    const advance = () => {
      if (i < TASKS.length) {
        setStepIndex(i)
        i += 1
        timers.current.push(window.setTimeout(advance, 900 + Math.random() * 800))
      } else {
        setStepIndex(TASKS.length)
        timers.current.push(window.setTimeout(async () => {
          try {
            const res = await api.post(`product/generate/${product.id}/`); 
            const aiData = res.data.content;

            const mappedContent = {
              productId: product.id,
              generatedAt: new Date().toISOString(),
              names: [`${product.name} - AI Edition`], 
              selectedName: product.name,
              shortDescription: aiData.short_description || '',
              fullDescription: aiData.long_description || '',
              features: [],
              seo: { title: '', metaDescription: '', keywords: [] },
              instagram: { caption: aiData.caption || '', hashtags: [] },
              facebook: { caption: aiData.caption || '', hashtags: [] },
              whatsapp: { message: aiData.caption || '' },
              
              images: aiData.images || [], 
              imageUrl: aiData.imageUrl || product.images?.[0]?.url || null,
              
              sections: {
                product_name: { key: 'product_name', approved: false },
                short_description: { key: 'short_description', approved: false },
                full_description: { key: 'full_description', approved: false },
                seo: { key: 'seo', approved: false },
                instagram: { key: 'instagram', approved: false },
                facebook: { key: 'facebook', approved: false },
                whatsapp: { key: 'whatsapp', approved: false },
                image: { key: 'image', approved: false },
              },
            };

            setContent(product.id, mappedContent); 
            setProductStatus(product.id, 'content_ready')
            setDone(true)
            toast('Success', { description: 'AI content generated successfully!' })
          } catch (error) {
            console.error("AI Generation failed", error)
            setFailed(true)
          }
        }, 600))
      }
    }
    timers.current.push(window.setTimeout(advance, 700))
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [productId])

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" description="This product may have been deleted." action={<ButtonLink to="/products">Back to Products</ButtonLink>} />
  }

  if (trialBlocked) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Trial expired"
        description="Your trial has ended, so new AI generation is paused. Upgrade to keep generating marketing content."
        action={<ButtonLink to="/trial-expired">View Plans</ButtonLink>}
      />
    )
  }

  if (contents[product.id] && !done && stepIndex === -1) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Content already generated"
        description="This product already has a generated marketing package. Review or regenerate it instead."
        action={<ButtonLink to={`/products/${product.id}/review`}>Review Content</ButtonLink>}
      />
    )
  }

  const stateOf = (i: number): StepState =>
    failed && i === stepIndex ? 'failed'
    : i < stepIndex || done ? 'done'
    : i === stepIndex ? 'active'
    : 'pending'

  const progress = done ? 100 : Math.min(99, Math.round((stepIndex / TASKS.length) * 100))
  const secondsLeft = Math.max(1, Math.ceil(((TASKS.length - stepIndex) * 1.3)))

  const retry = async () => {
    setFailed(false)
    setStepIndex(0)
    let i = 1
    const advance = async () => {
      if (i < TASKS.length) {
        setStepIndex(i)
        i += 1
        timers.current.push(window.setTimeout(advance, 900 + Math.random() * 800))
      } else {
        setStepIndex(TASKS.length)
        timers.current.push(window.setTimeout(async () => {
          try {
            const res = await api.post(`product/generate/${product.id}/`); 
            const aiData = res.data.content;

            const mappedContent = {
              productId: product.id,
              generatedAt: new Date().toISOString(),
              names: [`${product.name} - AI Edition`], 
              selectedName: product.name,
              shortDescription: aiData.short_description || '',
              fullDescription: aiData.long_description || '',
              features: [],
              seo: { title: '', metaDescription: '', keywords: [] },
              instagram: { caption: aiData.caption || '', hashtags: [] },
              facebook: { caption: aiData.caption || '', hashtags: [] },
              whatsapp: { message: aiData.caption || '' },
              
              images: aiData.images || [], 
              imageUrl: aiData.imageUrl || product.images?.[0]?.url || null,

              sections: {
                product_name: { key: 'product_name', approved: false },
                short_description: { key: 'short_description', approved: false },
                full_description: { key: 'full_description', approved: false },
                seo: { key: 'seo', approved: false },
                instagram: { key: 'instagram', approved: false },
                facebook: { key: 'facebook', approved: false },
                whatsapp: { key: 'whatsapp', approved: false },
                image: { key: 'image', approved: false },
              },
            };

            setContent(product.id, mappedContent)
            setProductStatus(product.id, 'content_ready')
            setDone(true)
            toast('Content regenerated', { description: `${product.name} marketing package is ready to review.` })
          } catch (error) {
            setFailed(true)
          }
        }, 600))
      }
    }
    timers.current.push(window.setTimeout(advance, 800))
  }

  const simulateFailure = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setFailed(true)
    setProductStatus(product.id, 'generation_failed')
  }

  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white p-5">
          {primary && <img src={primary.url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">AI Studio</p>
            <h1 className="truncate text-lg font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-600">{product.currency} {product.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {!failed && !done && (
            <>
              <div className="text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-2xl bg-primary-200 opacity-40" aria-hidden />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg">
                    <Sparkles className="h-8 w-8" aria-hidden />
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">AI is working its magic…</h2>
                <p className="mt-1.5 text-sm text-slate-600">We're preparing your product's marketing package.</p>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{progress}% complete</span>
                  <span>About {secondsLeft} seconds remaining</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <ol className="mt-6 space-y-1">
                {TASKS.map((task, i) => {
                  const st = stateOf(i)
                  return (
                    <li key={task} className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                      st === 'active' && 'bg-primary-50 text-primary-800 font-medium',
                      st === 'done' && 'text-slate-600',
                      st === 'pending' && 'text-slate-400',
                    )}>
                      {st === 'done' && <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />}
                      {st === 'active' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-700" aria-hidden />}
                      {st === 'pending' && <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />}
                      {st === 'failed' && <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden />}
                      {task}
                      {st === 'done' && <span className="ml-auto text-xs text-green-600 font-medium">Done</span>}
                    </li>
                  )
                })}
              </ol>
            </>
          )}

          {failed && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <XCircle className="h-9 w-9" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">Generation failed</h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                We couldn't generate content for {product.name} this time. Your product details are saved — you can retry right away.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={retry}><RotateCcw className="h-4 w-4" aria-hidden /> Retry Generation</Button>
                <Button variant="secondary" onClick={() => navigate(`/products/${product.id}`)}>Back to Product</Button>
              </div>
            </div>
          )}

          {done && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <Check className="h-9 w-9" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">Your marketing package is ready!</h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Names, descriptions, SEO content, and social captions were generated for {product.name}.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink to={`/products/${product.id}/review`}>Review Generated Content</ButtonLink>
                <Button variant="secondary" onClick={() => navigate('/products')}>Back to Products</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}