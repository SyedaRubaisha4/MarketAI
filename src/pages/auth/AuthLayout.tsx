import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Wand2, CalendarClock, BarChart3 } from 'lucide-react'

export function AuthLayout({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Left Side: Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-[46%] lg:px-16 xl:px-24 bg-white">
        
        {/* NAYA LOGO (Without AI touch) */}
        <Link to="/" className="mb-10 flex items-center gap-3 group w-fit">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:scale-105">
            {/* Halki si Glow / Shine effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="h-full w-full bg-white/10 blur-sm" />
            </div>
            <TrendingUp className="relative z-10 h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Market<span className="text-indigo-600">Flow</span>
          </span>
        </Link>

        {children}
      </div>

      {/* Right Side: Dark Theme Info Area */}
      <div className="hidden lg:block lg:w-[54%] border-l border-slate-200">
        {side ?? <AuthSide />}
      </div>
    </div>
  )
}

export function AuthSide() {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-slate-950 px-16 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" aria-hidden />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-purple-500/20 blur-[100px]" aria-hidden />
      
      <div className="relative z-10 max-w-lg">
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
          Turn any product into a complete marketing package in 60 seconds.
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Create product descriptions, SEO content, and social media marketing content.
        </p>
        
        <ul className="mt-10 space-y-6">
          {[
            { icon: Wand2, text: 'Write names, descriptions, SEO & captions in your brand voice' },
            { icon: CalendarClock, text: 'Publish instantly or schedule a week of posts in minutes' },
            { icon: BarChart3, text: 'Track products, drafts and published content from one dashboard' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 ring-1 ring-slate-700 shadow-sm">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-[15px] font-medium leading-relaxed text-slate-300">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}