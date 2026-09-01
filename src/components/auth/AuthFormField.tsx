import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthFormField({ label, error, id, className, ...props }: AuthFormFieldProps) {
  const fieldId = id || props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-typography-heading">
        {label}
      </label>
      <input
        id={fieldId}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-md border text-sm text-typography-body bg-white',
          'placeholder:text-typography-subtle transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
          error
            ? 'border-brand-price focus:ring-brand-price focus:border-brand-price'
            : 'border-surface-border hover:border-surface-borderHover',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-brand-price" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
