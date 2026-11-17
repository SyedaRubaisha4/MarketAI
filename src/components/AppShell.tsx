import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Sparkles, Share2, CalendarDays, Settings,
  Search, Bell, ChevronDown, LogOut, Menu, X, TrendingUp,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { cn } from '../lib/cn'
import { ToastViewport } from './Toast'
import { TrialBanner } from './TrialBanner'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package, end: false },
  { to: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { to: '/social-accounts', label: 'Social Accounts', icon: Share2 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 group">
      {/* Black Box with White Arrow */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
        <TrendingUp className="h-5 w-5" strokeWidth={2.5} />
      </div>
      
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Market<span className="text-slate-500">Flow</span>
        </span>
      )}
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useApp()
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6"><Logo /></div>
      <nav className="mt-8 flex-1 space-y-1.5 px-4" aria-label="Main navigation">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-all duration-200',
              isActive
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200/60 p-4 m-2">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 cursor-pointer">
          {/* Sidebar Avatar Color Fixed: Purple se Black kiya gaya hai */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm">
            {(user?.fullName ?? 'U').trim()[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{user?.fullName ?? 'User'}</p>
            <p className="truncate text-xs text-slate-500 font-medium">{user?.businessName ?? 'Workspace'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Header({ onMenu, collapsed, onToggleCollapse }: { onMenu: () => void; collapsed: boolean; onToggleCollapse: () => void }) {
  const { user, notifications, markNotificationsRead, logout, subscription } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => { setNotifOpen(false); setMenuOpen(false) }, [location.pathname])

  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
  const title = NAV.find((n) => location.pathname.startsWith(n.to))?.label
    ?? (location.pathname.startsWith('/publish') ? 'Publish' : location.pathname.startsWith('/onboarding') ? 'Setup' : '')

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-[#f8fafc]/80 px-4 backdrop-blur-xl sm:px-8 border-b border-slate-200/50">
      <button onClick={onMenu} className="rounded-xl p-2 text-slate-600 hover:bg-slate-200/50 lg:hidden" aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleCollapse}
        className="hidden rounded-xl p-2 text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 lg:block transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>

      <div className="relative ml-auto hidden md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          placeholder="Search products..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/products?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`)
          }}
          className="h-10 w-72 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/10 transition-all"
        />
      </div>

      {subscription.plan === 'trial' && (
        <Link to="/settings/subscription" className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
          Trial · {daysLeft}d left
        </Link>
      )}

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markNotificationsRead() }}
          className="relative rounded-xl bg-white p-2.5 text-slate-500 shadow-sm border border-slate-200 hover:text-slate-900 hover:border-slate-300 transition-all"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {notifications.some((n) => !n.read) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-3 w-80 card p-2 shadow-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl rounded-2xl">
            <p className="px-3 py-2 text-sm font-bold text-slate-900">Notifications</p>
            {notifications.length === 0 && <p className="px-3 pb-3 text-sm text-slate-600">No notifications yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors" aria-label="Account menu" aria-expanded={menuOpen}>
          {/* Header Avatar Color Fixed: Purple se Black kiya gaya hai */}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-md">
            {(user?.fullName ?? 'U').trim()[0]?.toUpperCase()}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-3 w-56 card p-2 shadow-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl rounded-2xl">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <Link to="/settings" className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings className="h-4 w-4" aria-hidden /> Settings
            </Link>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? '' : 'pointer-events-none')} aria-hidden={!mobileOpen}>
        <div className={cn('absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <aside className={cn(
          'absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
          <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close navigation menu">
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      {/* Floating Desktop Sidebar */}
      <aside className={cn(
        'fixed inset-y-4 left-4 z-30 hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 lg:block',
        collapsed ? 'w-[76px]' : 'w-64',
      )}>
        {collapsed ? (
          <div className="flex h-full flex-col items-center py-4">
            <Logo compact />
            <nav className="mt-6 flex flex-1 flex-col gap-2" aria-label="Main navigation">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) => cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  <span className="sr-only">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ) : (
          <SidebarContent />
        )}
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        'relative flex min-h-screen flex-col transition-all duration-300', 
        collapsed ? 'lg:pl-[108px]' : 'lg:pl-[288px]'
      )}>
        <Header onMenu={() => setMobileOpen(true)} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <main className="relative flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <TrialBanner />
            <Outlet />
          </div>
        </main>
      </div>
      <ToastViewport />
    </div>
  )
}