import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Wand2, CalendarClock, BarChart3 } from 'lucide-react'

export function AuthLayout({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-[46%] lg:px-16 xl:px-24">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
            <Zap className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Market<span className="text-primary-700">AI</span></span>
        </Link>
        {children}
      </div>
      <div className="hidden lg:block lg:w-[54%]">
        {side ?? <AuthSide />}
      </div>
    </div>
  )
}

export function AuthSide() {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-16 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-300/30 blur-2xl" aria-hidden />
      <div className="relative max-w-lg">
        <h2 className="text-3xl font-bold leading-tight tracking-tight">
          Turn any product into a complete marketing package in 60 seconds.
        </h2>
        <p className="mt-4 text-lg text-primary-100">
          Create product descriptions, SEO content, and social media marketing content with AI.
        </p>
        <ul className="mt-10 space-y-5">
          {[
            { icon: Wand2, text: 'AI writes names, descriptions, SEO & captions in your brand voice' },
            { icon: CalendarClock, text: 'Publish instantly or schedule a week of posts in minutes' },
            { icon: BarChart3, text: 'Track products, drafts and published content from one dashboard' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="text-[15px] leading-relaxed text-primary-50">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
