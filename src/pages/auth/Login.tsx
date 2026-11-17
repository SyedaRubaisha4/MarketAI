import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../store/AppContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email address.'
    if (password.length < 8) er.password = 'Password must be at least 8 characters.'
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    try {
      // login() must RETURN the logged-in user/profile (see AppContext fix)
      const loggedInUser = await login(email.trim(), password)

      navigate(loggedInUser?.onboarded ? '/dashboard' : '/onboarding/brand', {
        replace: true,
      })
    } catch (error: any) {
      console.error('Login failed:', error)
      setErrors({
        password:
          error?.response?.data?.detail ||
          error?.message ||
          'Invalid email or password.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Log in to your workspace to continue creating content.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@business.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((er) => ({ ...er, email: undefined }))
          }}
          error={errors.email}
          required
          autoComplete="email"
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((er) => ({ ...er, password: undefined }))
            }}
            error={errors.password}
            required
            autoComplete="current-password"
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
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-xl transition-all duration-300"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-slate-900 hover:text-slate-700 underline decoration-slate-300 hover:decoration-slate-900 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}