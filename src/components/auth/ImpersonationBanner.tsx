import { useState } from 'react';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export function ImpersonationBanner() {
  const { isImpersonated, impersonationInfo, user, endImpersonation } = useAuth();
  const [isEnding, setIsEnding] = useState(false);

  if (!isImpersonated) {
    return null;
  }

  const operatorId =
    impersonationInfo?.impersonatedByUserId ||
    user?.impersonatedByUserId ||
    'Super Admin';

  const reason =
    impersonationInfo?.impersonationReason ||
    user?.impersonationReason;

  const handleEnd = async () => {
    try {
      setIsEnding(true);
      await endImpersonation();
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 bg-red-600 text-white border-b border-red-700 shadow-md px-4 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 text-white animate-pulse" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-bold tracking-wide">
              Sessão de suporte ativa — operado por <span className="underline font-mono">{operatorId}</span>
            </span>
            {reason && (
              <span className="text-red-100 text-xs font-normal">
                (Motivo: <span className="italic">{reason}</span>)
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleEnd()}
          disabled={isEnding}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 active:scale-[0.98] transition-all shrink-0 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isEnding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Encerrando...</span>
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar sessão de suporte</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
