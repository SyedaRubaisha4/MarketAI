import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { BUSINESS_TYPES } from '../../data/mockData'
import { useApp } from '../../store/AppContext'
import type { BusinessType } from '../../types'

interface Errors { fullName?: string; businessName?: string; businessType?: string; email?: string; password?: string }

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useApp()
  const [form, setForm] = useState({ fullName: '', businessName: '', businessType: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Errors = {}
    if (!form.fullName.trim()) er.fullName = 'Full name is required.'
    if (!form.businessName.trim()) er.businessName = 'Business name is required.'
    if (!form.businessType) er.businessType = 'Please select a business type.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.'
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters.'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    window.setTimeout(() => {
      register({
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        businessType: form.businessType as BusinessType,
        email: form.email.trim(),
      })
      navigate('/onboarding/brand')
    }, 900)
  }

  const pwChecks = [
    { ok: form.password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
    { ok: /\d/.test(form.password), label: 'One number' },
  ]

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">
        Start turning products into ready-to-publish marketing content.
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Input label="Full Name" placeholder="Ahmed Khan" value={form.fullName} onChange={set('fullName')} error={errors.fullName} required autoComplete="name" />
        <Input label="Business Name" placeholder="Khan Electronics" value={form.businessName} onChange={set('businessName')} error={errors.businessName} required autoComplete="organization" />
        <Select
          label="Business Type"
          placeholder="Select your business type"
          value={form.businessType}
          onChange={set('businessType')}
          error={errors.businessType}
          required
          options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Input label="Email Address" type="email" placeholder="you@business.com" value={form.email} onChange={set('email')} error={errors.email} required autoComplete="email" />
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-[38px] rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {form.password && (
            <ul className="mt-2 space-y-1">
              {pwChecks.map((c) => (
                <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Creating your account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Log in</Link>
      </p>
    </AuthLayout>
  )
}
