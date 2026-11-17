import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../store/AppContext'

interface Errors { fullName?: string; email?: string; password?: string }

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useApp()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

    const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const er: Errors = {}
    if (!form.fullName.trim()) er.fullName = 'Full name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.'
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters.'
    setErrors(er)
    if (Object.keys(er).length) return
    
    setLoading(true)
    try {
      const generatedUsername = form.email.split('@')[0];

      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password, 
        username: generatedUsername, 
      })
      
      window.location.href = '/onboarding/brand'; 
      
    } catch (error) {
      console.error("Signup failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const pwChecks = [
    { ok: form.password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
    { ok: /\d/.test(form.password), label: 'One number' },
    { ok: /[!@#$%^&*(),.?":{}|<>]/.test(form.password), label: 'One special character' }, // YEH ADD KAREIN
  ]
  return (
    <AuthLayout>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Start turning products into ready-to-publish marketing content.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Input 
          label="Full Name" 
          placeholder="Ahmed Khan" 
          value={form.fullName} 
          onChange={set('fullName')} 
          error={errors.fullName} 
          required 
          autoComplete="name" 
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
        />
        
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="you@business.com" 
          value={form.email} 
          onChange={set('email')} 
          error={errors.email} 
          required 
          autoComplete="email" 
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
        />
        
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
            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-[38px] rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Password Strength Checklist */}
          {form.password && (
            <ul className="mt-3 space-y-1.5">
              {pwChecks.map((c) => (
                <li key={c.label} className={`flex items-center gap-2 text-xs font-medium transition-colors ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {c.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />} 
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button 
          type="submit" 
          size="lg" 
          loading={loading} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-xl transition-all duration-300 mt-2"
        >
          {loading ? 'Creating your account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Already have an account?{' '}
       <Link to="/login" className="font-bold text-slate-900 hover:text-slate-700 underline decoration-slate-300 hover:decoration-slate-900 transition-colors">Log in</Link>      </p>
    </AuthLayout>
  )
}