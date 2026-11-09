import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '../auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { BrandFields, type BrandFieldErrors } from '../../components/BrandFields'
import { useApp } from '../../store/AppContext'
import type { BrandProfile } from '../../types'

export default function BrandSetup() {
  const navigate = useNavigate()
  const { brand, completeOnboarding, skipOnboarding, toast } = useApp()
  const [form, setForm] = useState<BrandProfile>({
    businessName: brand?.businessName || '',
    businessType: brand?.businessType || 'Retail',
    description: brand?.description || '',
    targetCustomers: brand?.targetCustomers || '',
    language: brand?.language || 'English',
    tones: brand?.tones || [],           
    wordsToAvoid: brand?.wordsToAvoid || [], 
    keywords: brand?.keywords || [],     
    completed: false
  })  
  const [errors, setErrors] = useState<BrandFieldErrors>({})
  const [loading, setLoading] = useState(false)
  const update = (patch: Partial<BrandProfile>) => setForm((f) => ({ ...f, ...patch }))
  const setError = (key: keyof BrandFieldErrors, message?: string) => setErrors((er) => ({ ...er, [key]: message }))

  const save = async (skip: boolean) => {
    if (!skip) {
      const er: BrandFieldErrors = {}
      if (form.description.trim().length < 20) er.description = 'Describe your business in at least 20 characters.'
      if (!form.targetCustomers.trim()) er.targetCustomers = 'Tell us who your customers are.'
      setErrors(er)
      if (Object.keys(er).length) return
      if (form.tones.length === 0) {
        toast('Select at least one tone of voice', { variant: 'info' })
        return
      }
    }
    
    setLoading(true)
    
    try {
      if (skip) {
        skipOnboarding();
        toast('Brand profile skipped', { description: 'Complete it later in Settings.', variant: 'info' });
        navigate('/dashboard');
      } else {
        await completeOnboarding(form) 
        toast('Brand profile saved', { description: 'AI content will now match your brand voice.' })
      }
      
      navigate('/dashboard')
    } catch (error) {
      console.error("Brand save error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout side={<OnboardingSide />}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Step 3 of 3 — Final step
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700" aria-hidden />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tell us about your brand</h1>
      <p className="mt-2 text-sm text-slate-600">
        Help AI understand your business so your product content sounds consistent with your brand.
      </p>

      <div className="mt-8">
        <BrandFields form={form} update={update} errors={errors} setError={setError} />
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => save(true)} disabled={loading}>Skip for now</Button>
        <Button onClick={() => save(false)} loading={loading} size="lg">Save &amp; Continue</Button>
      </div>
    </AuthLayout>
  )
}

function OnboardingSide() {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-16 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <h2 className="relative max-w-md text-3xl font-bold leading-tight tracking-tight">
        Content that sounds like <em className="not-italic underline decoration-primary-300 underline-offset-8">you</em>, not a robot.
      </h2>
      <p className="relative mt-4 max-w-md text-lg text-primary-100">
        Your brand voice shapes every description, caption, and headline the AI writes — set it once, use it everywhere.
      </p>
      <div className="relative mt-10 grid max-w-md grid-cols-2 gap-3">
        {['Consistent tone', 'On-brand captions', 'Audience-aware copy', 'Keywords built in'].map((t) => (
          <div key={t} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">{t}</div>
        ))}
      </div>
    </div>
  )
}