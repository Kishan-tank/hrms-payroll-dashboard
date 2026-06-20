import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (message: string) => void;
  error:   (message: string) => void;
  info:    (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Styles ───────────────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, { icon: string; bar: string; text: string }> = {
  success: {
    icon: '✓',
    bar:  'bg-emerald-500',
    text: 'text-emerald-400',
  },
  error: {
    icon: '✕',
    bar:  'bg-red-500',
    text: 'text-red-400',
  },
  info: {
    icon: 'ℹ',
    bar:  'bg-blue-500',
    text: 'text-blue-400',
  },
};

// ─── Toast Item Component ─────────────────────────────────────────────────────

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  const { icon, bar, text } = variantStyles[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className="group relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1121]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right-4 fade-in"
    >
      {/* Colored accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${bar}`} />

      {/* Icon */}
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${text} ring-1 ring-current ring-offset-1 ring-offset-[#0B1121]`}>
        {icon}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug text-slate-200">
        {toast.message}
      </p>

      {/* Close button */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onClose(toast.id)}
        className="ml-1 shrink-0 text-slate-500 transition hover:text-slate-200"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((msg: string) => push(msg, 'success'), [push]);
  const error   = useCallback((msg: string) => push(msg, 'error'),   [push]);
  const info    = useCallback((msg: string) => push(msg, 'info'),    [push]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}

      {/* Toast stack — fixed bottom-right, stacks upward */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
