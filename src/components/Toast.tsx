import { useState, useCallback } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import { ToastContext } from '../hooks/useToast'

type ToastType = 'success' | 'error'

type Toast = {
  id: string
  message: string
  type: ToastType
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 pl-4 pr-2 py-3 rounded-lg shadow-lg text-sm font-medium animate-[toast_3s_ease_forwards]"
            style={{
              backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
              color: 'white',
            }}
          >
            {toast.type === 'success' ? (
              <Check size={16} className="shrink-0" />
            ) : (
              <AlertTriangle size={16} className="shrink-0" />
            )}
            <span className="pr-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="p-1 rounded hover:bg-white/20 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
