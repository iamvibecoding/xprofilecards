export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const listeners: Set<(toast: Toast) => void> = new Set();
const removeListeners: Set<(id: string) => void> = new Set();

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration = 4000
) {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: Toast = { id, message, type, duration };

  listeners.forEach(listener => listener(toast));

  if (duration > 0) {
    setTimeout(() => {
      removeListeners.forEach(listener => listener(id));
    }, duration);
  }

  return id;
}

export function removeToast(id: string) {
  removeListeners.forEach(listener => listener(id));
}

export function subscribe(callback: (toast: Toast) => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function subscribeRemove(callback: (id: string) => void) {
  removeListeners.add(callback);
  return () => removeListeners.delete(callback);
}
