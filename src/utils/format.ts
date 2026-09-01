import type { SyncStatus } from '../services/api/dashboardService.js';

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Nunca';

  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) return 'Agora';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Agora';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function formatSyncStatus(status: SyncStatus | null | undefined): string {
  switch (status) {
    case 'SUCCESS':
      return 'Sucesso';
    case 'PARTIAL_SUCCESS':
      return 'Parcial';
    case 'FAILED':
      return 'Falha';
    case 'RUNNING':
      return 'Em andamento';
    default:
      return 'Desconhecido';
  }
}

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}s`;
}
