import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../store/AppContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, user } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email address.'
    if (password.length < 8) er.password = 'Password must be at least 8 characters.'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    window.setTimeout(() => {
      login(email.trim())
      navigate(user?.onboarded ? '/dashboard' : '/onboarding/brand')
    }, 800)
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Log in to your workspace to continue creating content.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Input label="Email Address" type="email" placeholder="you@business.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })) }} error={errors.email} required autoComplete="email" />
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: undefined })) }}
            error={errors.password}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-[38px] rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Logging in…' : 'Log In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">Sign up</Link>
      </p>
    </AuthLayout>
  )
}
