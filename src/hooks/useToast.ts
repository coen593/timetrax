import { createContext, useContext } from 'react'

type ToastType = 'success' | 'error'

export type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

export const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}
