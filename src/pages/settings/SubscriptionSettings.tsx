import { useState } from 'react';
import { Check, Crown, FlaskConical, Rocket, Sparkles } from 'lucide-react';
import { useApp, useTrialStatus } from '../../store/AppContext';
import { TRIAL_DAYS } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['25 products', 'AI content per product', '3 social platforms', 'Basic calendar'],
  pro: ['Unlimited products', 'All social platforms', 'Bulk generation', 'Priority (simulated) support'],
};

export function SubscriptionSettings() {
  const { subscription, updateSubscription, toast } = useApp();
  const trialStatus = useTrialStatus();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const msPerDay = 86400000;
  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / msPerDay));
  const daysUsed = Math.min(TRIAL_DAYS, Math.max(0, TRIAL_DAYS - daysLeft));
  const trialPct = Math.round((daysUsed / TRIAL_DAYS) * 100);

  const upgrade = (plan: 'starter' | 'pro') => {
    setBusyPlan(plan);
    setTimeout(() => {
      updateSubscription({ ...subscription, plan, mockState: 'normal' });
      setBusyPlan(null);
      toast(`Switched to ${plan === 'pro' ? 'Pro' : 'Starter'} (simulated)`, {
        description: 'No payment was processed. Plans are sample data.',
      });
    }, 900);
  };

  const switchMock = (mockState: 'normal' | 'ending' | 'expired') => {
    updateSubscription({ ...subscription, mockState });
    toast(
      mockState === 'normal' ? 'Trial state: normal' : `Trial state: ${mockState}`,
      { description: 'Development-only preview switch.', variant: 'info' },
    );
  };

  const backToTrial = () => {
    updateSubscription({ ...subscription, plan: 'trial', mockState: 'normal' });
    toast('Back to trial plan (simulated)', { variant: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Current Plan</h2>
            <p className="mt-1 text-sm text-slate-600">Your subscription and trial status.</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold ring-1',
              subscription.plan === 'trial'
                ? trialStatus === 'expired'
                  ? 'bg-red-50 text-red-700 ring-red-200'
                  : trialStatus === 'ending'
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : 'bg-primary-50 text-primary-700 ring-primary-200'
                : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            )}
          >
            {subscription.plan === 'trial'
              ? trialStatus === 'expired'
                ? 'Trial expired'
                : `Trial · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
              : `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan (simulated)`}
          </span>
        </div>

        {subscription.plan === 'trial' && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Day {daysUsed} of {TRIAL_DAYS}</span>
              <span>{100 - trialPct}% remaining</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  trialStatus === 'expired' ? 'bg-red-500' : trialStatus === 'ending' ? 'bg-amber-500' : 'bg-primary-600',
                )}
                style={{ width: `${trialPct}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Trial started {new Date(subscription.trialStartedAt).toLocaleDateString()} · ends{' '}
              {new Date(subscription.trialEndsAt).toLocaleDateString()}.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Plans</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">Sample pricing</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">Prices below are sample data for this prototype — no real billing exists.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['starter', 'pro'] as const).map((plan) => {
            const isCurrent = subscription.plan === plan;
            return (
              <div
                key={plan}
                className={cn(
                  'card relative p-6',
                  plan === 'pro' && 'border-primary-300 ring-2 ring-primary-100',
                )}
              >
                {plan === 'pro' && (
                  <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> Popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {plan === 'pro' ? <Crown className="h-5 w-5 text-primary-700" /> : <Rocket className="h-5 w-5 text-primary-700" />}
                  <h3 className="text-base font-semibold capitalize text-slate-900">{plan}</h3>
                </div>
                <p className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">Rs {plan === 'pro' ? '4,999' : '1,999'}</span>
                  <span className="text-sm text-slate-600"> / month (sample)</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {PLAN_FEATURES[plan].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>Current plan</Button>
                  ) : (
                    <Button className="w-full" loading={busyPlan === plan} onClick={() => upgrade(plan)}>
                      {subscription.plan === 'trial' ? `Upgrade to ${plan === 'pro' ? 'Pro' : 'Starter'}` : `Switch to ${plan === 'pro' ? 'Pro' : 'Starter'}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {subscription.plan !== 'trial' && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={backToTrial}>Return to trial plan</Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-amber-900">Development-only trial preview</h2>
        </div>
        <p className="mt-1 text-xs text-amber-800">
          Switch the trial between its normal, ending, and expired states to test the related screens. This control is
          not part of the production product.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['normal', 'ending', 'expired'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => switchMock(s)}
              aria-pressed={subscription.mockState === s}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-colors',
                subscription.mockState === s
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-amber-300 bg-white text-amber-700 hover:bg-amber-100',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
