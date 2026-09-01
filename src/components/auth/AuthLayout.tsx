import type { ReactNode } from 'react';
import { Car, CheckCircle2, Shield } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const FEATURES = [
  'Catálogo sincronizado com Meta DAA',
  'Gestão multi-loja em tempo real',
  'Diagnóstico automático de pendências',
];

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-surface-canvas">
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-brand-primary text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-[#1E40AF] to-[#172554]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-blue-100">SaaS Auto Catálogo</p>
              <p className="text-lg font-bold">Auto Clean Pro</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
                Gestão inteligente de estoque automotivo
              </h1>
              <p className="mt-4 text-blue-100 text-base leading-relaxed max-w-md">
                Conecte seu DMS, valide dados para Meta Ads e publique catálogos com confiança.
              </p>
            </div>

            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-blue-50">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-200" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Shield className="w-4 h-4" />
            <span>Sessão segura com JWT e cookie httpOnly</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-typography-muted">Auto Catálogo</p>
              <p className="text-sm font-bold text-typography-heading">Auto Clean Pro</p>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl shadow-card p-8">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-typography-heading tracking-tight">{title}</h2>
              <p className="mt-2 text-sm text-typography-muted">{subtitle}</p>
            </header>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
