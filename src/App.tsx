import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute, PublicAuthRoute } from './components/auth/PrivateRoute.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { DashboardApp } from './pages/DashboardApp.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicAuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardApp />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
