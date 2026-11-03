import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Logo } from '../../components/AppShell';
import { TRIAL_DAYS } from '../../data/mockData';

export function TrialEndingPage() {
  const { subscription } = useApp();
  const daysLeft = Math.max(1, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000));

  return (
    <div className="flex min-h-screen flex-col bg-[#f2ebdc]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Logo />
        <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-700">Back to dashboard</Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Your trial ends in {daysLeft} day{daysLeft === 1 ? '' : 's'}</h1>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Keep your AI marketing running without interruption. Upgrade before{' '}
            <span className="font-medium text-slate-700">{new Date(subscription.trialEndsAt).toLocaleDateString()}</span>{' '}
            to keep generating and publishing content.
          </p>

          <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
            {daysLeft} of {TRIAL_DAYS} trial days remaining
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink to="/settings/subscription" size="lg">
              View Plans <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/dashboard" variant="ghost" size="lg">
              Continue on trial
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-slate-400">Plans and pricing shown are sample data for this prototype.</p>
        </div>
      </main>
    </div>
  );
}
