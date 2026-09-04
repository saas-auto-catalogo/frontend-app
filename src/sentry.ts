import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment:
    import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() ||
    import.meta.env.MODE ||
    'development',
  release: import.meta.env.VITE_SENTRY_RELEASE?.trim() || undefined,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
});

export { Sentry };
