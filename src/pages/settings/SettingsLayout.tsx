import { NavLink, Outlet } from 'react-router-dom';
import { CreditCard, Palette, UserRound } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { cn } from '../../lib/cn';

const TABS = [
  { to: '/settings', end: true, icon: UserRound, label: 'Profile' },
  { to: '/settings/brand', end: false, icon: Palette, label: 'Brand' },
  { to: '/settings/subscription', end: false, icon: CreditCard, label: 'Subscription' },
];

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, brand voice, and subscription." />
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            role="tab"
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
