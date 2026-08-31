import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'available' | 'sold' | 'syncing' | 'error' | 'neutral' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const variants = {
    available: 'bg-status-available-bg text-status-available-text border-status-available-border',
    sold: 'bg-status-sold-bg text-status-sold-text border-status-sold-border',
    syncing: 'bg-status-syncing-bg text-status-syncing-text border-status-syncing-border',
    error: 'bg-status-error-bg text-status-error-text border-status-error-border',
    neutral: 'bg-surface-muted text-typography-muted border-surface-border',
    primary: 'bg-brand-primaryLight text-brand-primary border-brand-primary/20',
    secondary: 'bg-brand-secondaryLight text-brand-secondary border-brand-secondary/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    available: 'bg-brand-accent',
    sold: 'bg-typography-muted',
    syncing: 'bg-amber-500 animate-pulse',
    error: 'bg-brand-primary',
    neutral: 'bg-typography-subtle',
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
