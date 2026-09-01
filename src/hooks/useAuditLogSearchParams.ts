import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AuditLogFilters } from '../components/dashboard/AuditLogsView.js';

const DEFAULT_LIMIT = 20;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function parseLimit(value: string | null): number {
  const parsed = parsePositiveInt(value, DEFAULT_LIMIT);
  return Math.min(parsed, 50);
}

export function useAuditLogSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<AuditLogFilters>(() => {
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parseLimit(searchParams.get('limit'));
    const action = searchParams.get('action') ?? undefined;
    const entityName = searchParams.get('entityName') ?? undefined;
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    return {
      page,
      limit,
      action: action || undefined,
      entityName: entityName || undefined,
      from: from || undefined,
      to: to || undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (nextFilters: AuditLogFilters) => {
      const params = new URLSearchParams();

      if (nextFilters.page > 1) {
        params.set('page', String(nextFilters.page));
      }

      if (nextFilters.limit !== DEFAULT_LIMIT) {
        params.set('limit', String(nextFilters.limit));
      }

      if (nextFilters.action) {
        params.set('action', nextFilters.action);
      }

      if (nextFilters.entityName) {
        params.set('entityName', nextFilters.entityName);
      }

      if (nextFilters.from) {
        params.set('from', nextFilters.from);
      }

      if (nextFilters.to) {
        params.set('to', nextFilters.to);
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  return { filters, setFilters };
}
