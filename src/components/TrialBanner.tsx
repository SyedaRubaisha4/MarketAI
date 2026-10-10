import { Link } from 'react-router-dom'
import { AlertTriangle, Clock } from 'lucide-react'
import { useApp, useTrialStatus } from '../store/AppContext'
import { cn } from '../lib/cn'

export function TrialBanner() {
  const { subscription } = useApp()
  const status = useTrialStatus()
  if (status === 'normal') return null

  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))

  if (status === 'expired') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm font-medium text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Your free trial has ended. AI generation is paused until you upgrade.
        </div>
        <Link to="/trial-expired" className="sm:ml-auto inline-flex h-8 items-center justify-center rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700">
          View Plans
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm font-medium text-amber-800">
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        Your free trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.
      </div>
      <Link to="/trial-ending" className={cn('sm:ml-auto inline-flex h-8 items-center justify-center rounded-lg bg-amber-600 px-3 text-sm font-semibold text-white hover:bg-amber-700')}>
        Upgrade Plan
      </Link>
    </div>
  )
}
