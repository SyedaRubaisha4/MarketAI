import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Sparkles, Share2, CalendarDays, Settings,
  Search, Bell, ChevronDown, LogOut, Menu, X, Zap,
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
    <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
        <Zap className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-[#2e2718]">
          Market<span className="text-primary-700">AI</span>
        </span>
      )}
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useApp()
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5"><Logo /></div>
      <nav className="mt-7 flex-1 space-y-1.5 px-3" aria-label="Main navigation">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-100/95 text-primary-800 font-semibold'
                : 'text-[#4c4231] hover:bg-white/15 hover:text-[#2e2718]',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/20 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
            {(user?.fullName ?? 'U').trim()[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#332b1c]">{user?.fullName ?? 'User'}</p>
            <p className="truncate text-xs text-[#5c5138]">{user?.businessName ?? 'Workspace'}</p>
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/50 bg-[#f2ebdc]/85 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-white lg:hidden" aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleCollapse}
        className="hidden rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 lg:block"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Menu className="h-5 w-5" />
      </button>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>

      <div className="relative ml-auto hidden md:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          placeholder="Search products…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/products?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`)
          }}
          className="h-9 w-56 rounded-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {subscription.plan === 'trial' && (
        <Link to="/settings/subscription" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-primary-100/80 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100">
          Trial · {daysLeft}d left
        </Link>
      )}

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markNotificationsRead() }}
          className="relative rounded-full bg-white p-2 text-slate-600 shadow-sm ring-1 ring-slate-200/70 hover:text-slate-700"
          aria-label={`Notifications (${notifications.filter((n) => !n.read).length} unread)`}
        >
          <Bell className="h-5 w-5" aria-hidden />
          {notifications.some((n) => !n.read) && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden />}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 card p-2 shadow-card-lg max-h-96 overflow-y-auto">
            <p className="px-3 py-2 text-sm font-semibold text-slate-900">Notifications</p>
            {notifications.length === 0 && <p className="px-3 pb-3 text-sm text-slate-600">No notifications yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-600">{n.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-white" aria-label="Account menu" aria-expanded={menuOpen}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {(user?.fullName ?? 'U').trim()[0]?.toUpperCase()}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 card p-2 shadow-card-lg">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-600">{user?.email}</p>
            </div>
            <Link to="/settings" className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <Settings className="h-4 w-4" aria-hidden /> Settings
            </Link>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
    <div className="min-h-screen">
      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? '' : 'pointer-events-none')} aria-hidden={!mobileOpen}>
        <div className={cn('absolute inset-0 bg-slate-900/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <aside className={cn(
          'absolute inset-y-0 left-0 w-72 bg-[#b2a489] shadow-xl transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
          <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close navigation menu">
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 hidden border-r border-[#9d8f6f]/50 bg-[#b2a489] transition-all duration-200 lg:block',
        collapsed ? 'w-[76px]' : 'w-64',
      )}>
        {collapsed ? (
          <div className="flex h-full flex-col items-center py-4">
            <Logo compact />
            <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Main navigation">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) => cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-primary-100/95 text-primary-800' : 'text-[#4c4231] hover:bg-white/20 hover:text-[#2e2718]',
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

      <div className={cn('relative flex min-h-screen flex-col bg-[#f2ebdc] transition-all duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-36 h-[420px] w-[420px] rounded-full bg-primary-200/50 blur-3xl" />
          <div className="absolute -left-32 top-[440px] h-[380px] w-[380px] rounded-full bg-primary-300/30 blur-3xl" />
        </div>
        <Header onMenu={() => setMobileOpen(true)} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <TrialBanner />
            <Outlet />
          </div>
        </main>
      </div>
      <ToastViewport />
    </div>
  )
}
