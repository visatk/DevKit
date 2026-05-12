import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG: Record<ToastType, { icon: React.ElementType; bar: string; bg: string; border: string; text: string }> = {
  success: {
    icon: CheckCircle2,
    bar:    '#10b981',
    bg:     'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    text:   '#6ee7b7',
  },
  error: {
    icon: XCircle,
    bar:    '#ef4444',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    text:   '#fca5a5',
  },
  warning: {
    icon: AlertTriangle,
    bar:    '#f59e0b',
    bg:     'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    text:   '#fcd34d',
  },
  info: {
    icon: Info,
    bar:    '#3b82f6',
    bg:     'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    text:   '#93c5fd',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map(t => {
          const cfg = TOAST_CONFIG[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-2xl animate-in slide-in-from-bottom-3 fade-in duration-300"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                backdropFilter: 'blur(16px)',
                color: cfg.text,
                minWidth: '260px',
                maxWidth: '380px',
                // left accent bar via box-shadow inset trick
                boxShadow: `inset 3px 0 0 ${cfg.bar}, 0 8px 32px rgba(0,0,0,0.4)`,
              }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: cfg.bar }} />
              <span className="flex-1 font-medium leading-snug tracking-wide">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="ml-1 rounded-lg p-1 transition-all duration-150 hover:opacity-100"
                style={{ opacity: 0.4, color: cfg.text }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
