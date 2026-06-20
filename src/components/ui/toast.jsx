'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={18} className="text-brand-success" />,
  error: <AlertCircle size={18} className="text-brand-danger" />,
  info: <Info size={18} className="text-brand-info" />,
};

const bgColors = {
  success: 'border-l-brand-success',
  error: 'border-l-brand-danger',
  info: 'border-l-brand-info',
};

function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 bg-white border border-brand-border border-l-4 ${bgColors[toast.type] || bgColors.info} rounded-lg shadow-lg p-4 min-w-[300px] max-w-[420px] ${exiting ? 'toast-exit' : 'toast-enter'}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-brand-black">{toast.title}</p>
        )}
        <p className="text-sm text-gray-600">{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="p-0.5 rounded hover:bg-gray-100 cursor-pointer"
      >
        <X size={14} className="text-gray-400" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
