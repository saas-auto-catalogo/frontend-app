import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.js';

export interface DataFetchErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DataFetchError({
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
  onRetry,
}: DataFetchErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 bg-surface-card rounded-lg border border-surface-border text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 text-brand-primary flex items-center justify-center">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <p className="text-sm text-typography-muted max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
