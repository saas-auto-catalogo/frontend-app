import React from 'react';
import ReactDOM from 'react-dom/client';
import { Sentry } from './sentry.js';
import { App } from './App.js';
import { AuthProvider } from './context/AuthContext.js';
import { SubscriptionProvider } from './context/SubscriptionContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Algo deu errado. Tente recarregar a página.</p>}>
      <AuthProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
