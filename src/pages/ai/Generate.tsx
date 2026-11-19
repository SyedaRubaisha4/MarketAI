import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Circle, Loader2, XCircle, Sparkles, RotateCcw, Package, ArrowLeft } from 'lucide-react'
import { useApp, useTrialStatus } from '../../store/AppContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/EmptyState'
import { cn } from '../../lib/cn'
import { api } from '../../api/client'; 
import type { GeneratedContent } from '../../types'

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

            setContent(product.id, mappedContent as GeneratedContent); 
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

  const stateOf = (i: number): StepState =>
    failed && i === stepIndex ? 'failed'
    : i < stepIndex || done ? 'done'
    : i === stepIndex ? 'active'
    : 'pending'

  const progress = done ? 100 : Math.min(99, Math.round((stepIndex / TASKS.length) * 100))

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

            setContent(product.id, mappedContent as GeneratedContent)
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

  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0]

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 pb-10 pt-4">
      
      {/* Back Button */}
      <button onClick={() => navigate(`/products/${product.id}`)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Product
      </button>

      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Side: Product Info & Live Terminal Logs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-4">Source Product</p>
            <div className="flex items-center gap-4">
              {primary ? (
                <img src={primary.url} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200"><Package className="h-6 w-6" /></div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h2>
                <p className="text-sm font-medium text-slate-500">{product.currency} {product.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Fake Terminal Logs */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl hidden lg:block">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-400">ai-engine.log</span>
            </div>
            <div className="font-mono text-xs leading-relaxed text-slate-300 space-y-2">
              <p className="text-emerald-400">&gt; Initializing generation sequence...</p>
              {stepIndex >= 0 && <p>&gt; Analyzing input image...</p>}
              {stepIndex >= 1 && <p>&gt; Brand voice loaded successfully.</p>}
              {stepIndex >= 2 && <p className="text-indigo-400">&gt; Generating optimal product name...</p>}
              {stepIndex >= 3 && <p>&gt; Crafting long & short descriptions.</p>}
              {stepIndex >= 4 && <p>&gt; Optimizing SEO metadata.</p>}
              {stepIndex >= 5 && <p>&gt; Writing platform-specific captions.</p>}
              {stepIndex >= 6 && <p>&gt; Enhancing visuals...</p>}
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>

        {/* Right Side: Main Generation Area */}
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            
            {/* Background Glow */}
            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

            <div className="relative p-8 sm:p-12">
              
              {!failed && !done && (
                <div className="flex flex-col items-center justify-center py-6">
                  
                  {/* Naya Stylish Circular Progress */}
                  <div className="relative flex h-56 w-56 items-center justify-center">
                    
                    {/* Glow effect peeche */}
                    <div className="absolute inset-4 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />   {/* Indigo 500 */}
                          <stop offset="50%" stopColor="#8b5cf6" />  {/* Purple 500 */}
                          <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia 500 */}
                        </linearGradient>
                      </defs>

                      {/* Background track */}
                      <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
                      
                      {/* Progress Ring */}
                      <circle 
                        className="stroke-current transition-all duration-1000 ease-out drop-shadow-md" 
                        strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="42" fill="transparent" 
                        stroke="url(#gradient-ring)" 
                        strokeDasharray={`${progress * 2.64} 264`} 
                      />
                    </svg>

                    {/* Text ke liye inner white circle */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-white bg-white/50 backdrop-blur-sm m-3 shadow-inner">
                      <span className="text-5xl font-black tracking-tighter text-slate-900">
                        {progress}<span className="text-3xl text-slate-500">%</span>
                      </span>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Complete
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-8 text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" /> AI is working its magic
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">Please wait while we generate your marketing package.</p>

                  {/* Steps Grid */}
                  <div className="mt-10 w-full max-w-lg space-y-3">
                    {TASKS.map((task, i) => {
                      const st = stateOf(i)
                      if (st === 'pending') return null;
                      return (
                        <div key={task} className={cn(
                          'flex items-center justify-between rounded-2xl px-5 py-4 text-sm transition-all duration-300',
                          st === 'active' && 'bg-indigo-50/80 border border-indigo-100 shadow-sm scale-[1.02]',
                          st === 'done' && 'bg-slate-50/50 border border-slate-100'
                        )}>
                          <div className="flex items-center gap-3.5">
                            {st === 'done' && <Check className="h-5 w-5 shrink-0 text-emerald-500" />}
                            {st === 'active' && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-600" />}
                            <span className={cn("font-semibold", st === 'active' ? "text-indigo-900" : "text-slate-600")}>{task}</span>
                          </div>
                          {st === 'done' && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">DONE</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {failed && (
                <div className="text-center py-16">
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm">
                    <XCircle className="h-12 w-12" aria-hidden />
                  </span>
                  <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Generation failed</h2>
                  <p className="mx-auto mt-3 max-w-md text-base font-medium text-slate-500">
                    We couldn't generate content for {product.name} this time. Your product details are saved.
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <Button className="rounded-xl bg-slate-900 text-white px-6 h-12" onClick={retry}>
                      <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                    </Button>
                  </div>
                </div>
              )}

              {done && (
                <div className="text-center py-16">
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm ring-8 ring-emerald-50/50">
                    <Check className="h-12 w-12" aria-hidden />
                  </span>
                  <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Ready to go!</h2>
                  <p className="mx-auto mt-3 max-w-md text-base font-medium text-slate-500">
                    Your complete marketing package for {product.name} is ready to be reviewed and published.
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <ButtonLink 
                      to={`/products/${product.id}/review`} 
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 h-12 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Sparkles className="h-5 w-5" />
                      Review Content
                    </ButtonLink>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}