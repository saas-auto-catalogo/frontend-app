import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext.js';
import { getTrialDaysRemaining, isTrialing } from '../../utils/subscription.js';

function formatTrialDaysLabel(days: number | null): string {
  if (days === null) return 'em breve';
  if (days === 0) return 'hoje';
  if (days === 1) return 'em 1 dia';
  return `em ${days} dias`;
}

export function TrialBanner() {
  const { billing } = useSubscription();

  if (!billing || !isTrialing(billing.status)) {
    return null;
  }

  const daysRemaining = getTrialDaysRemaining(billing.currentPeriodEnd);

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2 text-sm text-amber-900">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            Seu teste grátis termina {formatTrialDaysLabel(daysRemaining)}.
            {billing.planTier ? (
              <span className="text-amber-800/80"> Plano {billing.planTier}.</span>
            ) : null}
          </p>
        </div>
        <Link
          to="/subscribe?plan=PRO"
          className="inline-flex items-center justify-center rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 transition-colors shrink-0"
        >
          Contratar plano
        </Link>
      </div>
    </div>
  );
}
