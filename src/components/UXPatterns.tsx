/**
 * UX Pattern Components
 * Reusable patterns for Loading, Error, Empty, and Success states
 * Ensures consistency across all pages following Nielsen's Usability Heuristics
 */

import { AlertCircle, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';

// ── Loading State Pattern ──
interface LoadingStateProps {
  title?: string;
  description?: string;
  progress?: { current: number; total: number };
}

export function LoadingState({ title = 'Loading', description, progress }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-10 h-10 mb-4 text-primary-base animate-spin" />
      <h3 className="text-lg font-bold text-text-primary mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      {description && <p className="text-sm text-text-secondary mb-4">{description}</p>}
      {progress && (
        <div className="w-full max-w-xs">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--primary-base), var(--primary-light))',
                width: `${(progress.current / progress.total) * 100}%`
              }}
            />
          </div>
          <p className="text-xs text-text-tertiary mt-2 text-center">
            {progress.current} of {progress.total}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Error State Pattern ──
interface ErrorStateProps {
  title?: string;
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  action,
  icon = <AlertCircle className="w-12 h-12 text-error-base" />
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg"
      style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-2 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-6 max-w-sm">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--error-base) 0%, #dc2626 100%)',
            color: 'white'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Empty State Pattern ──
interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <MessageSquare className="w-12 h-12 text-text-tertiary" />
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-2 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
            color: 'white'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Success State Pattern ──
interface SuccessStateProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg"
      style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}
    >
      <CheckCircle2 className="w-12 h-12 text-success-base mb-4" />
      <h3 className="text-lg font-bold text-text-primary mb-2 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-6 max-w-sm">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--success-base) 0%, #059669 100%)',
            color: 'white'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Form Field Component ──
interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  icon
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-error-base">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-text-tertiary">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`input-styled ${icon ? 'pl-10' : ''} ${error ? 'border-error-base' : ''}`}
          style={{
            borderColor: error ? 'var(--error-base)' : undefined,
            boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined
          }}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ── Card with Section Pattern ──
interface CardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function CardSection({ title, description, children, footer }: CardSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-bold text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>
          {title}
        </h3>
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      <div className="card-body">
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// ── Skeleton Loading Component ──
export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-lg" />
      ))}
    </div>
  );
}

// ── Toast Notification Pattern ──
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onClose?: () => void;
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--success-base)' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: 'var(--error-base)' },
    info: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)', text: 'var(--info-base)' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: 'var(--warning-base)' }
  };
  
  const color = colors[type];
  
  return (
    <div
      className="fixed bottom-4 right-4 p-4 rounded-lg border animate-fade-up"
      style={{ background: color.bg, borderColor: color.border, color: color.text }}
    >
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs opacity-90">{message}</p>
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-lg">&times;</button>
      )}
    </div>
  );
}
