import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  danger: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  );
  const danger = useCallback(
    (title: string, message?: string) => showToast({ type: 'danger', title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        warning,
        danger,
        info,
      }}
    >
      {children}
      {/* Toast Render View */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const bgColors = {
            success: 'bg-white border-emerald-500 text-slate-800 shadow-emerald-500/10',
            warning: 'bg-white border-amber-500 text-slate-800 shadow-amber-500/10',
            danger: 'bg-white border-red-500 text-slate-800 shadow-red-500/10',
            info: 'bg-white border-blue-500 text-slate-800 shadow-blue-500/10',
          };

          const iconColors = {
            success: 'text-emerald-600 bg-emerald-50',
            warning: 'text-amber-600 bg-amber-50',
            danger: 'text-red-600 bg-red-50',
            info: 'text-blue-600 bg-blue-50',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5" />,
            warning: <AlertTriangle className="w-5 h-5" />,
            danger: <AlertCircle className="w-5 h-5" />,
            info: <Info className="w-5 h-5" />,
          };

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border-l-4 border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgColors[t.type]}`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${iconColors[t.type]}`}>
                {icons[t.type]}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-bold text-slate-900 leading-tight">{t.title}</p>
                {t.message && (
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Tutup notifikasi"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
