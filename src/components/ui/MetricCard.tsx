import React from 'react';
import { Card } from './Card.js';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'secondary';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const iconBg = {
    default: 'bg-surface-muted text-typography-body',
    primary: 'bg-brand-primaryLight text-brand-primary',
    accent: 'bg-brand-accentLight text-brand-accent',
    secondary: 'bg-brand-secondaryLight text-brand-secondary',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-typography-muted uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-bold text-typography-heading mt-1.5 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-typography-muted mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`p-3 rounded-lg shrink-0 ${iconBg[variant]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-surface-border flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? 'text-brand-accent' : 'text-brand-primary'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-typography-subtle">vs. sincronização anterior</span>
        </div>
      )}
    </Card>
  );
}
