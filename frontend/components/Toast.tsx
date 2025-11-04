'use client';

import React, { useState, useEffect } from 'react';
import { subscribe, subscribeRemove, type Toast } from '@/lib/toast';
import { Check, AlertCircle, Info, Loader2, X } from 'lucide-react';

const iconMap = {
  success: Check,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-900',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
  loading: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    text: 'text-slate-900',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  return (
    <div className="animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl
          shadow-lg hover:shadow-xl transition-all duration-200
          ${colors.bg} ${colors.border}
        `}
      >
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${
            toast.type === 'loading' ? 'animate-spin' : ''
          } ${colors.icon}`}
        />
        <p className={`text-sm font-medium ${colors.text} flex-1`}>
          {toast.message}
        </p>
        <button
          onClick={onRemove}
          className={`flex-shrink-0 transition-colors hover:opacity-70 ${colors.icon}`}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe((toast: Toast) => {
      setToasts(prev => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeRemove((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    });

    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-auto max-w-sm">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
          }}
        />
      ))}
    </div>
  );
}
