import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Logo } from '../../components/AppShell';

export function TrialExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Logo />
        <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">Back to dashboard</Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <Lock className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Your free trial has ended</h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            AI content generation is paused until you upgrade. Your products, approved content, and scheduled posts are
            safely stored — pick a plan to continue marketing on autopilot.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            Generation and publishing are locked on the expired trial.
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink to="/settings/subscription" size="lg">
              See Plans & Upgrade <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/products" variant="ghost" size="lg">
              Browse my products
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Plans and pricing shown are sample data. Upgrading in this prototype is simulated — no payment is processed.
          </p>
        </div>
      </main>
    </div>
  );
}
