import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  children,
  className,
  hoverEffect = false,
  ...props
}: CardProps) {
  const baseStyles = 'bg-surface-card rounded-lg border border-surface-border shadow-card transition-all duration-200';
  const hoverStyles = hoverEffect ? 'hover:shadow-cardHover hover:border-surface-borderHover hover:-translate-y-0.5' : '';

  return (
    <div className={twMerge(clsx(baseStyles, hoverStyles, className))} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-5 border-b border-surface-border', className))} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-5', className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-4 bg-surface-muted/50 border-t border-surface-border rounded-b-lg', className))} {...props}>
      {children}
    </div>
  );
}
